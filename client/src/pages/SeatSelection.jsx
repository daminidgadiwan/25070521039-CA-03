import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import SeatGrid from '../components/SeatGrid';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Sparkles,
  Ticket,
} from 'lucide-react';

const HOLD_DURATION_SECONDS = 300; // 5 minutes

const SeatSelection = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [seatMap, setSeatMap] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(0);

  const countdownIntervalRef = useRef(null);
  const selectedSeatsRef = useRef(selectedSeats);
  selectedSeatsRef.current = selectedSeats;

  // 1. Fetch initial event data and seat map
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}`);
      if (res.data.success) {
        const evt = res.data.event;
        setEvent(evt);
        setSeatMap(evt.seatMap || {});

        // If current user previously held seats on this event, restore them
        const myHeld = Object.entries(evt.seatMap || {})
          .filter(([_, info]) => info.isHeldByMe || info.status === 'held_by_me')
          .map(([seatId]) => seatId);

        if (myHeld.length > 0) {
          setSelectedSeats(myHeld);
          startCountdown(HOLD_DURATION_SECONDS);
        }
      }
    } catch (err) {
      showToast('Failed to load event details and seat layout', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // 2. Setup Socket.IO real-time event listeners
  useEffect(() => {
    if (!socket || !eventId) return;

    // Join the event's real-time room
    socket.emit('join_event', { eventId });

    // Listener for seat status changes (holds, releases, expiries)
    const handleSeatsUpdated = (data) => {
      if (data.eventId !== eventId) return;

      setSeatMap((prev) => {
        const next = { ...prev };
        const isFromMe = user && data.heldBy === user._id;

        if (data.action === 'held') {
          data.seatIds.forEach((seatId) => {
            next[seatId] = {
              status: isFromMe ? 'held_by_me' : 'held',
              heldUntil: data.heldUntil,
              isHeldByMe: isFromMe,
            };
          });
        } else if (data.action === 'released' || data.action === 'expired') {
          data.seatIds.forEach((seatId) => {
            // If it was held by me and expired
            if (next[seatId]?.isHeldByMe && data.action === 'expired') {
              showToast(`Seat ${seatId} hold time has expired.`, 'warning');
              setSelectedSeats((sel) => sel.filter((s) => s !== seatId));
            }
            delete next[seatId];
          });
        }
        return next;
      });
    };

    // Listener for confirmed bookings
    const handleSeatsBooked = (data) => {
      if (data.eventId !== eventId) return;

      setSeatMap((prev) => {
        const next = { ...prev };
        const isFromMe = user && data.bookedBy === user._id;

        data.seatIds.forEach((seatId) => {
          next[seatId] = {
            status: 'booked',
            bookedByMe: isFromMe,
          };
        });
        return next;
      });
    };

    // Listener for hold errors
    const handleHoldError = (data) => {
      showToast(data.message || 'Seat could not be held', 'warning');
      fetchEvent();
    };

    socket.on('seats_updated', handleSeatsUpdated);
    socket.on('seats_booked', handleSeatsBooked);
    socket.on('hold_error', handleHoldError);

    return () => {
      socket.off('seats_updated', handleSeatsUpdated);
      socket.off('seats_booked', handleSeatsBooked);
      socket.off('hold_error', handleHoldError);
      socket.emit('leave_event', { eventId });
    };
  }, [socket, eventId, user]);

  // 3. Countdown timer logic
  const startCountdown = (duration) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setHoldRemainingSeconds(duration);

    countdownIntervalRef.current = setInterval(() => {
      setHoldRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleHoldExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleHoldExpired = () => {
    setSelectedSeats([]);
    showToast('Your 5-minute seat reservation hold has expired.', 'warning');
    if (socket && user) {
      socket.emit('release_seats', {
        eventId,
        seatIds: selectedSeatsRef.current,
        userId: user._id,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      // Release held seats on unmount if user didn't complete booking
      if (selectedSeatsRef.current.length > 0 && socket && user) {
        socket.emit('release_seats', {
          eventId,
          seatIds: selectedSeatsRef.current,
          userId: user._id,
        });
      }
    };
  }, []);

  // 4. Seat Click Handling
  const handleSeatClick = async (seatId) => {
    const isCurrentlySelected = selectedSeats.includes(seatId);

    if (isCurrentlySelected) {
      // Deselect
      const nextSeats = selectedSeats.filter((s) => s !== seatId);
      setSelectedSeats(nextSeats);

      if (nextSeats.length === 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setHoldRemainingSeconds(0);
        // Release all
        if (socket && user) {
          socket.emit('release_seats', { eventId, seatIds: [seatId], userId: user._id });
        }
      } else {
        // Update hold with remaining seats
        if (socket && user) {
          socket.emit('hold_seats', { eventId, seatIds: nextSeats, userId: user._id });
        }
      }
    } else {
      // Select new seat
      if (selectedSeats.length >= 6) {
        showToast('You can select a maximum of 6 seats per transaction', 'warning');
        return;
      }

      const nextSeats = [...selectedSeats, seatId];
      setSelectedSeats(nextSeats);

      // Emit real-time hold to socket
      if (socket && user) {
        socket.emit('hold_seats', {
          eventId,
          seatIds: nextSeats,
          userId: user._id,
        });
      }

      // Also call REST hold-seats API as robust backup
      try {
        await api.post(`/events/${eventId}/hold-seats`, { seatIds: nextSeats });
      } catch (err) {
        showToast(err.response?.data?.message || 'Could not hold seat', 'error');
        setSelectedSeats(selectedSeats); // rollback
        return;
      }

      // Start / refresh 5-minute hold timer
      startCountdown(HOLD_DURATION_SECONDS);
    }
  };

  // 5. Confirm and Book Seats
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat', 'warning');
      return;
    }

    setIsBooking(true);
    try {
      const res = await api.post('/bookings', {
        eventId,
        seatIds: selectedSeats,
      });

      if (res.data.success) {
        // Confetti Celebration Effect!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
        });

        showToast('Seats booked successfully!', 'success');

        // Clear local hold timer
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Reset selected seats ref so unmount hook does not cancel it
        selectedSeatsRef.current = [];

        // Redirect to Booking Confirmation pass
        navigate(`/booking-confirmation/${res.data.booking.bookingId}`, {
          state: { booking: res.data.booking },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking conflict: please choose available seats.';
      showToast(msg, 'error');
      fetchEvent();
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton" style={{ height: '80px' }} />
          <div className="skeleton" style={{ height: '400px' }} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Event Not Found</h2>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back button and title */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Event Details Quick Header */}
      <div className="booking-event-header">
        <div className="booking-event-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-info">{event.category}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time Seat Engine Active
            </span>
          </div>
          <h2>{event.title}</h2>
          <div className="booking-event-meta">
            <span>
              <Calendar size={15} style={{ color: 'var(--primary)' }} />
              {new Date(event.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>
              <Clock size={15} style={{ color: 'var(--warning)' }} />
              {event.startTime} - {event.endTime}
            </span>
            <span>
              <MapPin size={15} style={{ color: 'var(--danger)' }} />
              {event.venue}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {event.ticketPrice > 0 ? `₹${event.ticketPrice} per ticket` : 'Free Registration'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            SOCKET SYNC STATUS
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'var(--success)' : 'var(--danger)',
                boxShadow: isConnected ? '0 0 8px var(--success)' : 'none',
              }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
              {isConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING...'}
            </span>
          </div>
        </div>
      </div>

      {/* SeatGrid Component */}
      <SeatGrid
        event={event}
        seatMap={seatMap}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        holdRemainingSeconds={holdRemainingSeconds}
        onConfirmBooking={handleConfirmBooking}
        isBooking={isBooking}
        currentUserId={user?._id}
      />
    </div>
  );
};

export default SeatSelection;
