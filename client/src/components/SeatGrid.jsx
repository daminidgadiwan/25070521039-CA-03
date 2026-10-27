import React from 'react';
import { Lock, Check, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import '../styles/seat-grid.css';

const SeatGrid = ({
  event,
  seatMap,
  selectedSeats,
  onSeatClick,
  holdRemainingSeconds,
  onConfirmBooking,
  isBooking,
  currentUserId,
}) => {
  const rows = event?.seatRows || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = event?.seatsPerRow || 10;
  const ticketPrice = event?.ticketPrice || 0;

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeatStatus = (seatId) => {
    // If user has this seat selected in local state
    if (selectedSeats.includes(seatId)) {
      return 'selected';
    }

    const info = seatMap[seatId];
    if (!info) return 'available';

    if (info.status === 'booked') {
      return 'booked';
    }

    if (info.status === 'held_by_me') {
      return 'selected';
    }

    if (info.status === 'held') {
      return 'held';
    }

    return 'available';
  };

  const totalPrice = selectedSeats.length * ticketPrice;

  return (
    <div className="seat-booking-container">
      {/* Real-time Hold Countdown Banner if seats are held */}
      {selectedSeats.length > 0 && holdRemainingSeconds > 0 && (
        <div className="seat-hold-timer-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} />
            <span>
              Your selected seats are locked for 5 minutes. Please complete confirmation before the timer expires!
            </span>
          </div>
          <div className="hold-countdown">
            {formatTime(holdRemainingSeconds)}
          </div>
        </div>
      )}

      {/* Screen / Stage Curved Arc */}
      <div className="stage-container">
        <div className="stage-screen" />
        <div className="stage-text">All Eyes This Way • Stage / Screen</div>
      </div>

      {/* Seat Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend-box legend-available" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-box legend-selected" />
          <span>Selected by You</span>
        </div>
        <div className="legend-item">
          <span className="legend-box legend-held" />
          <span>Held by Other (5m Lock)</span>
        </div>
        <div className="legend-item">
          <span className="legend-box legend-booked" />
          <span>Booked</span>
        </div>
      </div>

      {/* Interactive Seat Grid */}
      <div className="seat-grid-wrapper">
        <div className="seat-grid">
          {rows.map((row) => (
            <div key={row} className="seat-row">
              {/* Row letter indicator (left) */}
              <div className="seat-row-label">{row}</div>

              {/* Seats in row with center theater aisle */}
              <div className="seat-row-seats">
                {Array.from({ length: cols }, (_, i) => i + 1).map((colNum) => {
                  const seatId = `${row}${colNum}`;
                  const status = getSeatStatus(seatId);
                  const isSelectable = status === 'available' || status === 'selected';

                  return (
                    <React.Fragment key={seatId}>
                      {/* Split in middle (e.g. after col 5) to create cinema aisle */}
                      {colNum === Math.floor(cols / 2) + 1 && (
                        <div className="seat-aisle-divider" aria-hidden="true" />
                      )}

                      <button
                        type="button"
                        className={`seat-btn ${status}`}
                        disabled={!isSelectable}
                        onClick={() => onSeatClick(seatId)}
                        title={
                          status === 'booked'
                            ? `Seat ${seatId} - Booked`
                            : status === 'held'
                            ? `Seat ${seatId} - Temporarily locked by another user`
                            : `Seat ${seatId} (${ticketPrice > 0 ? `₹${ticketPrice}` : 'Free'})`
                        }
                        aria-label={`Seat ${seatId}, status: ${status}`}
                      >
                        {status === 'selected' ? (
                          <Check size={14} strokeWidth={3} />
                        ) : status === 'held' ? (
                          <Lock size={12} />
                        ) : (
                          colNum
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Row letter indicator (right) */}
              <div className="seat-row-label">{row}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Checkout Drawer */}
      {selectedSeats.length > 0 && (
        <div className="booking-checkout-bar">
          <div className="checkout-details">
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                SELECTED SEATS ({selectedSeats.length}/6)
              </div>
              <div className="selected-seats-pills">
                {selectedSeats.map((seatId) => (
                  <span key={seatId} className="seat-pill">
                    {seatId}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                TOTAL AMOUNT
              </div>
              <div className="checkout-price">
                {ticketPrice > 0 ? `₹${totalPrice}` : 'FREE PASS'}
                {ticketPrice > 0 && <small>({selectedSeats.length} × ₹{ticketPrice})</small>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={isBooking}
              onClick={onConfirmBooking}
              style={{ padding: '12px 32px' }}
            >
              {isBooking ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Confirm & Get Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
