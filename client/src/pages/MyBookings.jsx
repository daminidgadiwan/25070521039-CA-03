import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const MyBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      showToast('Failed to load your event passes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this booking? Your reserved seats will be immediately released for other attendees.'
      )
    ) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      showToast(res.data.message || 'Booking cancelled. Seats released.', 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>My Event Bookings</h1>
          <p>View your reserved passes, admission QR codes, or cancel bookings in real time.</p>
        </div>

        <Link to="/events" className="btn btn-primary">
          <Ticket size={18} />
          <span>Browse More Events</span>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '140px' }} />
          <div className="skeleton" style={{ height: '140px' }} />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No event passes booked yet"
          description="Explore upcoming campus symposiums, workshops, and movie nights to reserve seats."
          action={
            <Link to="/events" className="btn btn-primary btn-sm">
              Explore Events
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {bookings.map((b) => {
            const isCancelled = b.status === 'cancelled';
            const event = b.event || {};

            return (
              <div
                key={b._id}
                className="card"
                style={{
                  padding: '24px',
                  opacity: isCancelled ? 0.75 : 1,
                  borderLeft: isCancelled ? '4px solid var(--danger)' : '4px solid var(--success)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-info">{event.category || 'EVENT'}</span>
                      <span className={`badge ${isCancelled ? 'badge-danger' : 'badge-success'}`}>
                        {b.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ID: <strong>{b.bookingId}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                      {event.title || 'Campus Event'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={15} style={{ color: 'var(--primary)' }} />
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
                        <MapPin size={15} style={{ color: 'var(--danger)' }} />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    {/* Seats list */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        SEATS:
                      </span>
                      {b.seats?.map((seatId) => (
                        <span key={seatId} className="seat-pill">
                          {seatId}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {b.totalAmount > 0 ? `₹${b.totalAmount}` : 'FREE PASS'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedBooking(b);
                          setIsQrModalOpen(true);
                        }}
                      >
                        <QrCode size={16} />
                        <span>View QR Ticket</span>
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={cancellingId === b._id}
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          <XCircle size={16} />
                          <span>{cancellingId === b._id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Inspection Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Event Admission QR Code"
        maxWidth="460px"
      >
        {selectedBooking && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
              {selectedBooking.event?.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Ref: <strong>{selectedBooking.bookingId}</strong> • Seats:{' '}
              <strong>{selectedBooking.seats?.join(', ')}</strong>
            </p>

            <div
              style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                display: 'inline-block',
                margin: '0 auto 16px',
              }}
            >
              <img
                src={selectedBooking.qrCodeDataUrl}
                alt="Ticket QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scan at auditorium / venue gate for identity verification.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookings;
