import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Building, Users, Clock, FileText, AlertCircle, UploadCloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { bookingService } from '../../services/bookingService';
import ManagerBookingsView from './ManagerBookingsView';
import {
  BOOKING_DAY_END_TIME,
  LAST_BOOKING_SLOT_LABEL,
  formatBookingRange,
  formatBookingTime,
  isOutsideBookingWindow,
} from '../../utils/bookingTime';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:8089';

export function StudentBookingsView() {
  const location = useLocation();
  const { user } = useAuth();
  const { showToast, showConfirm } = useToast();

  const [activeTab, setActiveTab] = useState(location.state?.action === 'create' ? 'create' : 'view');
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Availability check
  const [conflicts, setConflicts] = useState([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    resourceId: location.state?.selectedResourceId || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
    additionalRequirements: '',
  });
  const [durationHours, setDurationHours] = useState(2);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (location.state?.action === 'create') setActiveTab('create');
    if (location.state?.selectedResourceId) {
      setFormData(prev => ({ ...prev, resourceId: location.state.selectedResourceId }));
    }
  }, [location.state]);

  useEffect(() => {
    if (activeTab === 'create' && resources.length === 0) {
      fetchResources();
    } else if (activeTab === 'view' && user?.token) {
      fetchMyBookings();
    }
  }, [activeTab, user?.token]);

  const fetchMyBookings = async () => {
    if (!user?.token) return;
    setLoadingBookings(true);
    setBookingError('');
    try {
      const data = await bookingService.getMyBookings(user.token);
      setMyBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      setBookingError(err.message || 'Unable to load your bookings right now.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (id) => {
    const confirmed = await showConfirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?',
      confirmLabel: 'Cancel Booking',
      cancelLabel: 'Keep Booking',
      confirmTone: 'danger',
    });

    if (!confirmed) return;

    try {
      await bookingService.cancelBooking(user.token, id);
      fetchMyBookings();
      showToast({
        variant: 'success',
        title: 'Booking Cancelled',
        message: 'The booking was cancelled successfully.',
      });
    } catch(err) {
      showToast({
        variant: 'error',
        title: 'Cancellation Failed',
        message: err.message || 'Failed to cancel the booking.',
      });
    }
  };

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const response = await fetch(`${API_BASE}/api/resources`, {
        headers: { 'Authorization': `Bearer ${user?.token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const selectedResource = useMemo(() =>
    resources.find(r => r.id.toString() === formData.resourceId.toString()),
    [resources, formData.resourceId]);

  const isAuditorium = selectedResource?.name?.toLowerCase().includes('auditorium');
  const effectiveDurationHours = isAuditorium ? durationHours : 2;
  const attendeeLimit = selectedResource?.capacity ?? null;
  const lastBookingErrorMessage = `Bookings must end by ${formatBookingTime(BOOKING_DAY_END_TIME)}. The last booking period is ${LAST_BOOKING_SLOT_LABEL}.`;

  // Fetch availability when date changes
  useEffect(() => {
    if (formData.resourceId && formData.date) {
      const checkConflicts = async () => {
        setIsCheckingConflicts(true);
        try {
          const bookedSlots = await bookingService.getAvailability(user?.token, formData.resourceId, formData.date);
          setConflicts(bookedSlots || []);
        } catch (err) {
          console.error("Failed to fetch availability", err);
        } finally {
          setIsCheckingConflicts(false);
        }
      };
      checkConflicts();
    } else {
      setConflicts([]);
    }
  }, [formData.resourceId, formData.date, user?.token]);

  // Auto-calculate end time whenever start time or duration changes
  useEffect(() => {
    if (formData.startTime) {
      const [hours, mins] = formData.startTime.split(':');
      const startDate = new Date();
      startDate.setHours(parseInt(hours), parseInt(mins), 0);
      startDate.setHours(startDate.getHours() + effectiveDurationHours);

      const newEndHours = startDate.getHours().toString().padStart(2, '0');
      const newEndMins = startDate.getMinutes().toString().padStart(2, '0');
      const calculatedEndTime = `${newEndHours}:${newEndMins}`;

      if (formData.endTime !== calculatedEndTime) {
        setFormData(prev => ({ ...prev, endTime: calculatedEndTime }));
      }
    } else if (formData.endTime) {
      setFormData(prev => ({ ...prev, endTime: '' }));
    }
  }, [formData.startTime, formData.endTime, effectiveDurationHours]);

  // Determine if there is a conflict right now
  const hasConflict = useMemo(() => {
    if (!formData.startTime || !formData.endTime || conflicts.length === 0) return false;

    const toMins = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':');
      return parseInt(h) * 60 + parseInt(m);
    };

    const startMins = toMins(formData.startTime);
    const endMins = toMins(formData.endTime);

    return conflicts.some(slot => {
      const slotStartMins = toMins(slot.startTime);
      const slotEndMins = toMins(slot.endTime);

      const maxStart = Math.max(startMins, slotStartMins);
      const minEnd = Math.min(endMins, slotEndMins);
      return maxStart < minEnd;
    });
  }, [formData.startTime, formData.endTime, conflicts]);

  const hasLateTimeSelection = useMemo(
    () => isOutsideBookingWindow(formData.endTime),
    [formData.endTime]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'resourceId') {
      const nextResource = resources.find(resource => resource.id.toString() === value.toString());

      setFormData(prev => ({
        ...prev,
        resourceId: value,
        expectedAttendees: prev.expectedAttendees && nextResource?.capacity
          ? String(Math.min(Number(prev.expectedAttendees), nextResource.capacity))
          : prev.expectedAttendees,
      }));
      return;
    }

    if (name === 'expectedAttendees') {
      if (value === '') {
        setFormData(prev => ({ ...prev, expectedAttendees: '' }));
        return;
      }

      const numericValue = Number(value);

      if (Number.isNaN(numericValue)) {
        return;
      }

      const sanitizedValue = Math.max(1, Math.trunc(numericValue));
      const limitedValue = attendeeLimit ? Math.min(sanitizedValue, attendeeLimit) : sanitizedValue;

      setFormData(prev => ({ ...prev, expectedAttendees: String(limitedValue) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasLateTimeSelection) {
      showToast({
        variant: 'warning',
        title: 'Invalid Booking Time',
        message: lastBookingErrorMessage,
      });
      return;
    }
    if (hasConflict) {
      showToast({
        variant: 'error',
        title: 'Time Slot Unavailable',
        message: 'The resource is already booked for the selected time.',
      });
      return;
    }
    if (attendeeLimit && Number(formData.expectedAttendees) > attendeeLimit) {
      showToast({
        variant: 'warning',
        title: 'Too Many Attendees',
        message: `Expected attendees cannot exceed the selected resource capacity of ${attendeeLimit}.`,
      });
      return;
    }
    if (isAuditorium && !file) {
      showToast({
        variant: 'warning',
        title: 'Approval File Required',
        message: 'Auditorium bookings require a PDF approval file.',
      });
      return;
    }

    try {
      await bookingService.createBooking(user?.token, {
        resourceId: formData.resourceId,
        bookingDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: parseInt(formData.expectedAttendees || '0'),
        additionalRequirements: formData.additionalRequirements
      }, isAuditorium ? file : null);

      showToast({
        variant: 'success',
        title: 'Booking Submitted',
        message: 'Your booking request was submitted successfully.',
      });
      setActiveTab('view');
      // Reset form
      setFormData({
        resourceId: '', date: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '', additionalRequirements: ''
      });
      setFile(null);
      setDurationHours(2);
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Booking Failed',
        message: err.message || 'Unable to submit the booking request.',
      });
    }
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid #3c547dff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    color: 'var(--text-primary)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  };

  const inputStyle = {
    padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
    background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%',
    outlineColor: '#3b82f6', appearance: 'none', colorScheme: 'inherit'
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>My Bookings</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your facility and resource bookings</div>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-icon)', padding: '6px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('view')}
            style={{
              padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.875rem',
              background: activeTab === 'view' ? 'white' : 'transparent',
              color: activeTab === 'view' ? '#0f172a' : 'var(--text-muted)',
              boxShadow: activeTab === 'view' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
            }}
          >
            View Bookings
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.875rem',
              background: activeTab === 'create' ? 'white' : 'transparent',
              color: activeTab === 'create' ? '#0f172a' : 'var(--text-muted)',
              boxShadow: activeTab === 'create' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
            }}
          >
            Create Booking
          </button>
        </div>
      </div>

      <div style={{ minHeight: '600px' }}>
        {activeTab === 'view' ? (
          <div style={{
            background: 'var(--bg-card)', padding: '32px', borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-color)', minHeight: '300px'
          }}>
            {loadingBookings ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading...</div>
            ) : bookingError ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Couldn&apos;t Load Bookings</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{bookingError}</p>
              </div>
            ) : myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>No Bookings Found</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>You haven't made any bookings yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '16px' }}>Resource</th>
                      <th style={{ padding: '16px' }}>Date</th>
                      <th style={{ padding: '16px' }}>Time Range</th>
                      <th style={{ padding: '16px' }}>Status</th>
                      <th style={{ padding: '16px' }}>Notes</th>
                      <th style={{ padding: '16px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.map(bk => (
                      <tr key={bk.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px', fontWeight: '500' }}>{bk.resourceName}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{bk.bookingDate}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{formatBookingRange(bk.startTime, bk.endTime)}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                            background: bk.status === 'APPROVED' ? '#dcfce7' : bk.status === 'REJECTED' ? '#fee2e2' : '#ffedd5',
                            color: bk.status === 'APPROVED' ? '#166534' : bk.status === 'REJECTED' ? '#991b1b' : '#9a3412',
                          }}>
                            {bk.status === 'APPROVED' ? 'ACCEPTED' : bk.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {bk.adminReason || bk.purpose}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {(bk.status === 'PENDING' || bk.status === 'APPROVED') && (
                              <button 
                                onClick={() => handleCancelBooking(bk.id)}
                                style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #f87171', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--bg-color)', padding: '40px', borderRadius: '16px', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
                Create New Booking
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>Select your preferred resource, date, time, and party size</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr) minmax(250px, 1fr)', gap: '24px' }}>

              {/* CARD 1: SELECT RESOURCE */}
              <div style={cardStyle}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Select Resource</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    name="resourceId"
                    value={formData.resourceId}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  >
                    <option value="" disabled>Choose a resource</option>
                    {loadingResources ? <option disabled>Loading...</option> : resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Additional Requirements</label>
                  <input
                    type="text"
                    name="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={handleInputChange}
                    placeholder="e.g. Projectors, Sport Items, Mics..."
                    style={inputStyle}
                  />
                </div>

                {selectedResource && (
                  <div style={{ marginTop: '16px', background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Building size={18} color="#3b82f6" />
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{selectedResource.location || 'Campus Facilities'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Users size={16} />
                      Capacity: {selectedResource.capacity} people
                    </div>
                    {isAuditorium && (
                      <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#d97706', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Auditorium bookings require written PDF approval from the Faculty Head upon reservation.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD 2: SELECT TIME */}
              <div style={cardStyle}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Select Time</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration</div>
                  {isAuditorium ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button type="button" onClick={() => setDurationHours(Math.max(1, durationHours - 1))} style={{ background: 'var(--border-color)', border: 'none', color: 'var(--text-primary)', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer' }}>-</button>
                      <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{durationHours} hr</span>
                      <button type="button" onClick={() => setDurationHours(Math.min(10, durationHours + 1))} style={{ background: '#3b82f6', border: 'none', color: 'white', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer' }}>+</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>2 hours (Fixed)</span>
                  )}
                </div>

                <div style={{ background: 'var(--bg-color)', padding: '12px 14px', borderRadius: '10px', border: '1px dashed var(--border-color)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Booking hours end at {formatBookingTime(BOOKING_DAY_END_TIME)}. Last booking period: {LAST_BOOKING_SLOT_LABEL}.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    readOnly
                    style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>

                {conflicts.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                     <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Clock size={14} /> ALREADY BOOKED SLOTS
                     </div>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {conflicts.map((slot, i) => (
                           <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #fecaca' }}>
                             {formatBookingRange(slot.startTime, slot.endTime)}
                           </span>
                        ))}
                     </div>
                  </div>
                )}

                {hasLateTimeSelection && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{lastBookingErrorMessage}</span>
                  </div>
                )}

                {hasConflict && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>This resource is already booked during this time range. Please choose a different time.</span>
                  </div>
                )}
              </div>

              {/* CARD 3: PARTY SIZE / FINAL DETAILS */}
              <div style={{ ...cardStyle }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Final Details</h4>

                <div style={{ opacity: hasConflict ? 0.4 : 1, pointerEvents: hasConflict ? 'none' : 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expected Attendees *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-muted)' }}><Users size={16} /></span>
                      <input
                        type="number"
                        name="expectedAttendees"
                        value={formData.expectedAttendees}
                        onChange={handleInputChange}
                        required
                        placeholder="Number of guests"
                        min="1"
                        max={attendeeLimit || undefined}
                        style={{ ...inputStyle, paddingLeft: '38px' }}
                      />
                    </div>
                    {attendeeLimit && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Maximum {attendeeLimit} attendees for the selected resource.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Purpose *</label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      required
                      placeholder="Reason for booking"
                      style={inputStyle}
                    />
                  </div>

                  {isAuditorium && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Faculty Head Approval *</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-color)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--border-color)', cursor: 'pointer', fontSize: '0.85rem', color: file ? '#3b82f6' : 'var(--text-muted)' }}>
                        <UploadCloud size={18} />
                        {file ? file.name : 'Upload PDF Document'}
                        <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} required />
                      </label>
                    </div>
                  )}

                  <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px' }}>Reservation Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Date:</span> <span style={{ color: 'var(--text-primary)' }}>{formData.date || '--'}</span>
                      <span>Time:</span> <span style={{ color: 'var(--text-primary)' }}>{formData.startTime ? formatBookingRange(formData.startTime, formData.endTime) : '--'}</span>
                      <span>Guests:</span> <span style={{ color: 'var(--text-primary)' }}>{formData.expectedAttendees || '--'}</span>
                    </div>
                  </div>

                  {(() => {
                    const isDisabled = hasConflict || hasLateTimeSelection || !formData.date || !formData.startTime || !formData.resourceId || !formData.expectedAttendees || !formData.purpose || (isAuditorium && !file);
                    return (
                      <button
                        type="submit"
                        disabled={isDisabled}
                        style={{
                          marginTop: '8px', padding: '14px', borderRadius: '10px',
                          background: isDisabled ? 'var(--border-color)' : '#3b82f6',
                          color: isDisabled ? 'var(--text-muted)' : 'white',
                          border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        Submit Reservation →
                      </button>
                    )
                  })()}
                </div>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Bookings() {
  const { user } = useAuth();
  if (user?.role === 'ROLE_MANAGER' || user?.role === 'ROLE_ADMIN') {
    return <ManagerBookingsView />;
  }
  return <StudentBookingsView />;
}
