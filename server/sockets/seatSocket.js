const Event = require('../models/Event');

module.exports = (io) => {
  // Map of active socket hold timeouts: socketId -> Array of timer references
  const socketTimers = new Map();

  io.on('connection', (socket) => {
    // console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join event room for real-time seat view
    socket.on('join_event', async ({ eventId }) => {
      if (!eventId) return;
      socket.join(`event_${eventId}`);
      // console.log(`[Socket.IO] ${socket.id} joined room event_${eventId}`);
    });

    // Leave event room
    socket.on('leave_event', ({ eventId }) => {
      if (!eventId) return;
      socket.leave(`event_${eventId}`);
    });

    // Hold seats in real time
    socket.on('hold_seats', async ({ eventId, seatIds, userId }) => {
      try {
        if (!eventId || !seatIds || !Array.isArray(seatIds) || !userId) return;

        const event = await Event.findById(eventId);
        if (!event) return;

        const now = new Date();
        // Clean expired
        event.heldSeats = event.heldSeats.filter((h) => new Date(h.heldUntil) > now);

        // Check if booked
        const bookedIds = (event.bookedSeats || []).map((b) => b.seatId);
        if (seatIds.some((s) => bookedIds.includes(s))) {
          return socket.emit('hold_error', {
            message: 'One or more of the selected seats are already booked.',
          });
        }

        // Check if held by someone else
        const heldByOthers = event.heldSeats.some(
          (h) => seatIds.includes(h.seatId) && h.heldBy.toString() !== userId.toString()
        );
        if (heldByOthers) {
          return socket.emit('hold_error', {
            message: 'One or more selected seats are currently locked by another attendee.',
          });
        }

        // Clear existing holds by this user on this event
        event.heldSeats = event.heldSeats.filter((h) => h.heldBy.toString() !== userId.toString());

        const heldUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        seatIds.forEach((seatId) => {
          event.heldSeats.push({
            seatId,
            heldBy: userId,
            heldUntil,
            socketId: socket.id,
          });
        });

        await event.save();

        // Broadcast to all clients in the room (including sender)
        io.to(`event_${eventId}`).emit('seats_updated', {
          eventId,
          seatIds,
          action: 'held',
          heldBy: userId,
          heldUntil,
        });

        // Set server-side automatic release timer (5 minutes)
        const timerId = setTimeout(async () => {
          try {
            const currentEvent = await Event.findById(eventId);
            if (!currentEvent) return;

            const nowCheck = new Date();
            const expiredSeats = currentEvent.heldSeats
              .filter((h) => h.heldBy.toString() === userId.toString() && new Date(h.heldUntil) <= nowCheck)
              .map((h) => h.seatId);

            if (expiredSeats.length > 0) {
              currentEvent.heldSeats = currentEvent.heldSeats.filter(
                (h) => !(h.heldBy.toString() === userId.toString() && new Date(h.heldUntil) <= nowCheck)
              );
              await currentEvent.save();

              io.to(`event_${eventId}`).emit('seats_updated', {
                eventId,
                seatIds: expiredSeats,
                action: 'expired',
              });
            }
          } catch (e) {
            console.error('[Socket Timer Error]', e.message);
          }
        }, 5 * 60 * 1000 + 1000);

        if (!socketTimers.has(socket.id)) {
          socketTimers.set(socket.id, []);
        }
        socketTimers.get(socket.id).push(timerId);
      } catch (err) {
        console.error('[Socket hold_seats error]', err);
      }
    });

    // Manually release held seats
    socket.on('release_seats', async ({ eventId, seatIds, userId }) => {
      try {
        if (!eventId || !userId) return;

        const event = await Event.findById(eventId);
        if (!event) return;

        const released = event.heldSeats
          .filter((h) => h.heldBy.toString() === userId.toString())
          .map((h) => h.seatId);

        event.heldSeats = event.heldSeats.filter((h) => h.heldBy.toString() !== userId.toString());
        await event.save();

        if (released.length > 0) {
          io.to(`event_${eventId}`).emit('seats_updated', {
            eventId,
            seatIds: released,
            action: 'released',
          });
        }
      } catch (err) {
        console.error('[Socket release_seats error]', err);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', async () => {
      // Clear timers
      const timers = socketTimers.get(socket.id);
      if (timers) {
        timers.forEach((t) => clearTimeout(t));
        socketTimers.delete(socket.id);
      }
    });
  });

  // Periodic sweeper for expired holds every 20 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      const eventsWithHolds = await Event.find({ 'heldSeats.heldUntil': { $lte: now } });

      for (const event of eventsWithHolds) {
        const expired = event.heldSeats.filter((h) => new Date(h.heldUntil) <= now).map((h) => h.seatId);
        if (expired.length > 0) {
          event.heldSeats = event.heldSeats.filter((h) => new Date(h.heldUntil) > now);
          await event.save();

          io.to(`event_${event._id}`).emit('seats_updated', {
            eventId: event._id.toString(),
            seatIds: expired,
            action: 'expired',
          });
        }
      }
    } catch (err) {
      // Periodic check error suppression
    }
  }, 20000);
};
