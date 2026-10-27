import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Ticket,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import '../styles/seat-grid.css';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/${bookingId}`);
          if (res.data.success) {
            setBooking(res.data.booking);
          }
        } catch (err) {
          console.error('Failed to load booking:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [bookingId, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="skeleton" style={{ height: '400px', maxWidth: '520px', margin: '40px auto' }} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Booking Not Found</h2>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const event = booking.event || {};

  return (
    <div className="page-wrapper" style={{ textAlign: 'center' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto 30px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            marginBottom: '16px',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Your digital entry ticket pass has been generated. Show this QR code at the venue entrance.
        </p>
      </div>

      {/* Ticket Card Pass */}
      <div className="ticket-pass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className="badge badge-info">{event.category || 'EVENT'}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            REF: <strong>{booking.bookingId}</strong>
          </span>
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
          {event.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'left', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            <span>
              {new Date(event.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: 'var(--warning)' }} />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} style={{ color: 'var(--danger)' }} />
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Selected Seats Badges */}
        <div style={{ textAlign: 'left', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            RESERVED SEATS ({booking.seatCount})
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {booking.seats?.map((s) => (
              <span key={s} className="seat-pill" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Official QR Code Box */}
        <div className="ticket-qr">
          {booking.qrCodeDataUrl ? (
            <img src={booking.qrCodeDataUrl} alt="Ticket Verification QR Code" />
          ) : (
            <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Generating QR...</div>
          )}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginTop: '10px', letterSpacing: '0.05em' }}>
            SCAN AT ADMISSION DESK
          </div>
        </div>

        {/* Price and Verification Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ATTENDEE</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{booking.user?.name || 'Attendee'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL PAID</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
              {booking.totalAmount > 0 ? `₹${booking.totalAmount}` : 'FREE PASS'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '32px', flexWrap: 'wrap' }}>
        <button type="button" onClick={handlePrint} className="btn btn-secondary">
          <Printer size={18} />
          <span>Print / Save Pass</span>
        </button>
        <Link to="/my-bookings" className="btn btn-primary">
          <Ticket size={18} />
          <span>Go to My Bookings</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
