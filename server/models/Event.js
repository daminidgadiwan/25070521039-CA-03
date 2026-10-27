const mongoose = require('mongoose');

const heldSeatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    heldUntil: {
      type: Date,
      required: true,
    },
    socketId: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const bookedSeatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['Fest', 'Workshop', 'Seminar', 'Movie Night', 'Guest Lecture'],
      default: 'Workshop',
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: true,
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      required: true,
      default: '01:00 PM',
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    ticketPrice: {
      type: Number,
      default: 0,
    },
    seatRows: {
      type: [String],
      default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    },
    seatsPerRow: {
      type: Number,
      default: 10,
    },
    heldSeats: [heldSeatSchema],
    bookedSeats: [bookedSeatSchema],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ date: 1, category: 1, status: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
