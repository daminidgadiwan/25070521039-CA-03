const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Helper to sanitize expired held seats from an event
const cleanExpiredHolds = async (event) => {
  const now = new Date();
  const initialCount = event.heldSeats.length;
  event.heldSeats = event.heldSeats.filter((hold) => new Date(hold.heldUntil) > now);
  if (event.heldSeats.length !== initialCount) {
    await event.save();
  }
  return event;
};

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public / Private
const getEvents = async (req, res, next) => {
  try {
    const { category, search, status, upcoming } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (upcoming === 'true') {
      filter.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { venue: new RegExp(search, 'i') },
      ];
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email role')
      .sort({ date: 1, startTime: 1 });

    const categories = ['All', 'Fest', 'Workshop', 'Seminar', 'Movie Night', 'Guest Lecture'];

    // Add stats to each event
    const enrichedEvents = events.map((event) => {
      const obj = event.toObject();
      const bookedCount = (event.bookedSeats || []).length;
      const totalSeats = (event.seatRows?.length || 10) * (event.seatsPerRow || 10);
      obj.bookedCount = bookedCount;
      obj.totalSeats = totalSeats;
      obj.availableCount = Math.max(0, totalSeats - bookedCount);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enrichedEvents.length,
      categories,
      events: enrichedEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event by ID with live seat map
// @route   GET /api/events/:id
// @access  Public / Private
const getEventById = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id).populate('organizer', 'name email role');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Clean expired held seats
    event = await cleanExpiredHolds(event);

    const now = new Date();
    const userId = req.user ? req.user._id.toString() : null;

    // Build seat status map
    const seatMap = {};
    const totalSeats = event.seatRows.length * event.seatsPerRow;

    // 1. Mark booked seats
    (event.bookedSeats || []).forEach((b) => {
      seatMap[b.seatId] = {
        status: 'booked',
        bookedByMe: userId && b.bookedBy.toString() === userId,
      };
    });

    // 2. Mark held seats (if not expired)
    (event.heldSeats || []).forEach((h) => {
      if (new Date(h.heldUntil) > now && !seatMap[h.seatId]) {
        const isHeldByMe = userId && h.heldBy.toString() === userId;
        seatMap[h.seatId] = {
          status: isHeldByMe ? 'held_by_me' : 'held',
          heldUntil: h.heldUntil,
          isHeldByMe,
        };
      }
    });

    const bookedCount = (event.bookedSeats || []).length;
    const availableCount = Math.max(0, totalSeats - bookedCount);

    res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        seatMap,
        totalSeats,
        bookedCount,
        availableCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event (Admin / Faculty)
// @route   POST /api/events
// @access  Admin / Faculty
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venue,
      ticketPrice,
      seatRows,
      seatsPerRow,
      bannerUrl,
    } = req.body;

    if (!title || !description || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and venue are required',
      });
    }

    let finalBanner = bannerUrl || '';
    if (req.file) {
      finalBanner = `/uploads/${req.file.filename}`;
    }

    const rows = seatRows || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = Number(seatsPerRow) || 10;

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Workshop',
      bannerUrl: finalBanner,
      date: new Date(date),
      startTime: startTime || '10:00 AM',
      endTime: endTime || '01:00 PM',
      venue: venue.trim(),
      ticketPrice: Number(ticketPrice) || 0,
      seatRows: rows,
      seatsPerRow: cols,
      organizer: req.user._id,
      status: 'upcoming',
      heldSeats: [],
      bookedSeats: [],
    });

    const populated = await Event.findById(event._id).populate('organizer', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Event created successfully with interactive seat layout',
      event: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (Admin / Organizer)
// @route   PUT /api/events/:id
// @access  Admin / Organizer
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venue,
      ticketPrice,
      status,
      bannerUrl,
    } = req.body;

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (category) event.category = category;
    if (date) event.date = new Date(date);
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (venue) event.venue = venue.trim();
    if (ticketPrice !== undefined) event.ticketPrice = Number(ticketPrice);
    if (status) event.status = status;
    if (bannerUrl) event.bannerUrl = bannerUrl;

    if (req.file) {
      event.bannerUrl = `/uploads/${req.file.filename}`;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin / Organizer
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Booking.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event and associated bookings deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hold seats for 5 minutes (REST API fallback)
// @route   POST /api/events/:id/hold-seats
// @access  Private
const holdSeats = async (req, res, next) => {
  try {
    const { seatIds } = req.body; // e.g. ['A1', 'A2']
    const eventId = req.params.id;
    const userId = req.user._id;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat' });
    }

    if (seatIds.length > 6) {
      return res.status(400).json({ success: false, message: 'Maximum 6 seats can be held at once' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Clean expired
    await cleanExpiredHolds(event);
    const now = new Date();

    // Check if any seat is already booked
    const bookedSeatIds = event.bookedSeats.map((b) => b.seatId);
    const conflictBooked = seatIds.some((s) => bookedSeatIds.includes(s));
    if (conflictBooked) {
      return res.status(409).json({
        success: false,
        message: 'One or more of the selected seats are already booked.',
      });
    }

    // Check if any seat is held by someone else
    const conflictHeld = event.heldSeats.some(
      (h) => seatIds.includes(h.seatId) && h.heldBy.toString() !== userId.toString() && new Date(h.heldUntil) > now
    );
    if (conflictHeld) {
      return res.status(409).json({
        success: false,
        message: 'One or more of the selected seats are currently held by another user. Please choose different seats.',
      });
    }

    // Release any previous holds by this user on this event
    event.heldSeats = event.heldSeats.filter((h) => h.heldBy.toString() !== userId.toString());

    // 5 minutes from now
    const heldUntil = new Date(Date.now() + 5 * 60 * 1000);

    seatIds.forEach((seatId) => {
      event.heldSeats.push({
        seatId,
        heldBy: userId,
        heldUntil,
      });
    });

    await event.save();

    // Emit socket event if io is attached to req.app
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${eventId}`).emit('seats_updated', {
        eventId,
        seatIds,
        action: 'held',
        heldBy: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seats locked for 5 minutes',
      heldSeats: seatIds,
      heldUntil,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release held seats
// @route   POST /api/events/:id/release-seats
// @access  Private
const releaseSeats = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const released = event.heldSeats.filter((h) => h.heldBy.toString() === userId.toString()).map((h) => h.seatId);
    event.heldSeats = event.heldSeats.filter((h) => h.heldBy.toString() !== userId.toString());
    await event.save();

    const io = req.app.get('io');
    if (io && released.length > 0) {
      io.to(`event_${eventId}`).emit('seats_updated', {
        eventId,
        seatIds: released,
        action: 'released',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Held seats released',
      releasedSeats: released,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  holdSeats,
  releaseSeats,
  cleanExpiredHolds,
};
