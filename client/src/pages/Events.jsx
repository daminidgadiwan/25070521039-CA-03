import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  Calendar,
  Ticket,
  MapPin,
  Clock,
  Plus,
  Search,
  Sparkles,
  Users,
  Trash2,
} from 'lucide-react';

const Events = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Event Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Workshop');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('10:00 AM');
  const [newEndTime, setNewEndTime] = useState('01:00 PM');
  const [newVenue, setNewVenue] = useState('Grand Auditorium - Block A');
  const [newTicketPrice, setNewTicketPrice] = useState(0);
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/events?category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(search)}`
      );
      if (res.data.success) {
        setEvents(res.data.events);
        if (res.data.categories) {
          setCategories(res.data.categories);
        }
      }
    } catch (err) {
      showToast('Failed to load campus events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newDate || !newVenue.trim()) {
      showToast('Please provide all mandatory event details', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      await api.post('/events', {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        venue: newVenue.trim(),
        ticketPrice: Number(newTicketPrice) || 0,
        bannerUrl: newBannerUrl.trim(),
        seatRows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        seatsPerRow: 10,
      });

      showToast('Campus event created with live seat layout!', 'success');
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewBannerUrl('');
      fetchEvents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create event', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this event and all seat reservations?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      showToast('Event removed', 'success');
      fetchEvents();
    } catch (err) {
      showToast('Failed to delete event', 'error');
    }
  };

  const filteredEvents = events.filter((evt) =>
    evt.title.toLowerCase().includes(search.toLowerCase()) ||
    evt.venue.toLowerCase().includes(search.toLowerCase()) ||
    evt.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>College Events & Seat Booking</h1>
          <p>
            Experience campus fests, workshops, hackathons, and movie screenings like a live show.
          </p>
        </div>

        {(role === 'admin' || role === 'faculty') && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            <span>Schedule New Event</span>
          </button>
        )}
      </div>

      {/* Category Pills & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            placeholder="Search events by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="skeleton" style={{ height: '320px' }} />
          <div className="skeleton" style={{ height: '320px' }} />
          <div className="skeleton" style={{ height: '320px' }} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No campus events scheduled"
          description="There are currently no events matching this category."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredEvents.map((evt) => (
            <div
              key={evt._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              {/* Event Poster Banner */}
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={
                    evt.bannerUrl ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop'
                  }
                  alt={evt.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '6px',
                  }}
                >
                  <span className="badge badge-info" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(6, 182, 212, 0.85)', color: '#ffffff' }}>
                    {evt.category}
                  </span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    {evt.ticketPrice > 0 ? `₹${evt.ticketPrice}` : 'FREE ENTRY'}
                  </span>
                </div>
              </div>

              {/* Event Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {evt.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
                    {evt.description.slice(0, 110)}...
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} style={{ color: 'var(--primary)' }} />
                      <span>
                        {new Date(evt.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {evt.startTime}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} style={{ color: 'var(--danger)' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {evt.venue}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} style={{ color: 'var(--success)' }} />
                      <span>
                        <strong>{evt.availableCount}</strong> / {evt.totalSeats} seats available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                  <Link
                    to={`/events/${evt._id}/seats`}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <Ticket size={17} />
                    <span>Select & Book Seats</span>
                  </Link>

                  {role === 'admin' && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={(e) => handleDeleteEvent(evt._id, e)}
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Campus Event (BookMyShow Engine)"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. CineNight: Interstellar 4K Outdoor Screening"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Fest">Fest</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Movie Night">Movie Night</option>
                <option value="Guest Lecture">Guest Lecture</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ticket Price (₹ - 0 for Free)</label>
              <input
                type="number"
                className="form-control"
                value={newTicketPrice}
                onChange={(e) => setNewTicketPrice(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input
                type="date"
                className="form-control"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="10:00 AM"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="01:00 PM"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Campus Venue</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Open Air Amphitheatre or Grand Auditorium"
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={newBannerUrl}
              onChange={(e) => setNewBannerUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Description</label>
            <textarea
              className="form-control"
              placeholder="Provide event itinerary, speaker profile, rules, and entry guidelines..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating Event...' : 'Publish Event with Seat Layout'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
