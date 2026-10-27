const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { cleanExpiredHolds } = require('./eventController');

// Helper to generate a unique readable booking ID e.g. CC-EVT-78A92
const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CC-${Date.now().toString().slice(-4)}-${rand}`;
};

// @desc    Confirm and finalize seat booking (Atomic MongoDB update)
// @route   POST /api/bookings
// @access  Private
const bookSeats = async (req, res, next) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = req.user._id;

    if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and at least one seat are required',
      });
    }

    if (seatIds.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'You can book a maximum of 6 seats at once',
      });
    }

    let event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Clean expired held seats
    event = await cleanExpiredHolds(event);
    const now = new Date();

    // 1. Verify that no seat is already booked
    const bookedSeatIds = (event.bookedSeats || []).map((b) => b.seatId);
    const alreadyBooked = seatIds.filter((s) => bookedSeatIds.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats ${alreadyBooked.join(', ')} are already booked by another attendee.`,
      });
    }

    // 2. Verify that no seat is held by someone ELSE
    const heldByOthers = (event.heldSeats || []).filter(
      (h) => seatIds.includes(h.seatId) && h.heldBy.toString() !== userId.toString() && new Date(h.heldUntil) > now
    );
    if (heldByOthers.length > 0) {
      const seatsHeld = heldByOthers.map((h) => h.seatId).join(', ');
      return res.status(409).json({
        success: false,
        message: `Seats ${seatsHeld} are currently locked by another user. Please choose available seats.`,
      });
    }

    const bookingId = generateBookingId();
    const totalAmount = seatIds.length * (event.ticketPrice || 0);

    // Generate dynamic QR Code Data URL with ticket verification metadata
    const qrPayload = JSON.stringify({
      app: 'CampusConnect',
      bookingId,
      eventId: event._id,
      eventTitle: event.title,
      userName: req.user.name,
      userEmail: req.user.email,
      seats: seatIds,
      venue: event.venue,
      date: event.date,
      totalAmount,
      issuedAt: new Date(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      width: 300,
    });

    // Create Booking Document
    const booking = await Booking.create({
      bookingId,
      event: event._id,
      user: userId,
      seats: seatIds,
      seatCount: seatIds.length,
      ticketPrice: event.ticketPrice || 0,
      totalAmount,
      qrCodeDataUrl,
      status: 'confirmed',
      bookedAt: new Date(),
    });

    // ATOMIC UPDATE on Event:
    // 1. Ensure seats are NOT in bookedSeats (condition)
    // 2. Remove from heldSeats
    // 3. Add to bookedSeats
    const bookedEntries = seatIds.map((seatId) => ({
      seatId,
      bookedBy: userId,
      bookingId: booking._id,
      bookedAt: new Date(),
    }));

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        'bookedSeats.seatId': { $nin: seatIds },
      },
      {
        $pull: { heldSeats: { seatId: { $in: seatIds } } },
        $push: { bookedSeats: { $each: bookedEntries } },
      },
      { new: true }
    );

    if (!updatedEvent) {
      // Race condition occurred: roll back booking
      await Booking.findByIdAndDelete(booking._id);
      return res.status(409).json({
        success: false,
        message: 'Conflict detected: one of your selected seats was just booked by another user. Please retry.',
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('event', 'title date startTime endTime venue bannerUrl category ticketPrice')
      .populate('user', 'name email rollNumber department phone');

    // Real-time broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${eventId}`).emit('seats_booked', {
        eventId,
        seatIds,
        bookedBy: userId,
        bookingId,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date startTime endTime venue bannerUrl category ticketPrice status')
      .sort({ bookedAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID or booking reference
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingId: req.params.id }],
    })
      .populate('event')
      .populate('user', 'name email rollNumber department phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Access check: Owner or Admin
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking and release seats
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking has already been cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Release seats from Event bookedSeats
    const eventId = booking.event._id || booking.event;
    await Event.findByIdAndUpdate(eventId, {
      $pull: { bookedSeats: { seatId: { $in: booking.seats } } },
    });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${eventId}`).emit('seats_released', {
        eventId,
        seatIds: booking.seats,
        action: 'cancelled_booking',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. The seats have been released.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all bookings
// @route   GET /api/bookings/admin/all
// @access  Admin
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('event', 'title date venue category')
      .populate('user', 'name email rollNumber department')
      .sort({ bookedAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookSeats,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
};
