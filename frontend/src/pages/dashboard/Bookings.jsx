/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, Users, Clock, FileText, AlertCircle, UploadCloud, Landmark, Monitor, Trophy, Calendar, Send, Check, Minus, Plus, ClipboardCheck, ArrowLeft } from 'lucide-react';
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

const formatDateInputValue = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const addMonthsToDate = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const formatTimeInputValue = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const toMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) return null;
  const [h, m] = timeString.split(':');
  return parseInt(h) * 60 + parseInt(m);
};

export function StudentBookingsView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, showConfirm } = useToast();

  const [activeTab, setActiveTab] = useState(location.state?.action === 'create' ? 'create' : 'view');
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [qrBooking, setQrBooking] = useState(null);


  // Availability check
  const [conflicts, setConflicts] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    resourceId: location.state?.selectedResourceId || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '5',
    additionalRequirements: '',
  });
  const [durationHours, setDurationHours] = useState(2);
  const [file, setFile] = useState(null);

  // Multi-resource conflicts state for grid status pills
  const [resourceConflicts, setResourceConflicts] = useState({});

  // Search and Filter States for resource list
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL');

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // 1. Filter by resource type
      const n = res.name.toLowerCase();
      if (resourceTypeFilter === 'ROOM' && !n.includes('seminar') && !n.includes('room') && !n.includes('hall')) {
        return false;
      }
      if (resourceTypeFilter === 'LAB' && !n.includes('computer') && !n.includes('lab') && !n.includes('tech') && !n.includes('pc')) {
        return false;
      }
      if (resourceTypeFilter === 'COURT' && !n.includes('court') && !n.includes('sport') && !n.includes('gym') && !n.includes('ground')) {
        return false;
      }

      // 2. Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return n.includes(query) || res.capacity.toString().includes(query) || (res.location && res.location.toLowerCase().includes(query));
      }

      return true;
    });
  }, [resources, searchQuery, resourceTypeFilter]);

  useEffect(() => {
    if (formData.date && resources.length > 0) {
      const fetchAllAvailability = async () => {
        const conflictsMap = {};
        await Promise.all(
          resources.map(async (res) => {
            try {
              const slots = await bookingService.getAvailability(user?.token, res.id, formData.date);
              conflictsMap[res.id] = slots || [];
            } catch (err) {
              console.error(`Failed to fetch availability for resource ${res.id}`, err);
              conflictsMap[res.id] = [];
            }
          })
        );
        setResourceConflicts(conflictsMap);
      };
      fetchAllAvailability();
    } else {
      setResourceConflicts({});
    }
  }, [formData.date, resources, user]);

  const fetchMyBookings = useCallback(async () => {
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
  }, [user]);

  const fetchResources = useCallback(async () => {
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
  }, [user]);

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
  }, [activeTab, user, fetchResources, fetchMyBookings, resources.length]);

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
      if (qrBooking?.id === id) {
        setQrBooking(null);
      }
      fetchMyBookings();
      showToast({
        variant: 'success',
        title: 'Booking Cancelled',
        message: 'The booking was cancelled successfully.',
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Cancellation Failed',
        message: err.message || 'Failed to cancel the booking.',
      });
    }
  };

  const selectedResource = useMemo(() =>
    resources.find(r => r.id.toString() === formData.resourceId.toString()),
    [resources, formData.resourceId]);

  const isAuditorium = selectedResource?.name?.toLowerCase().includes('auditorium');
  const effectiveDurationHours = isAuditorium ? durationHours : 2;
  const attendeeLimit = selectedResource?.capacity ?? null;
  const lastBookingErrorMessage = `Bookings must end by ${formatBookingTime(BOOKING_DAY_END_TIME)}. The last booking period is ${LAST_BOOKING_SLOT_LABEL}.`;
  const todayDateString = formatDateInputValue(new Date());
  const maxBookingDateString = formatDateInputValue(addMonthsToDate(new Date(), 3));
  const currentTimeString = formatTimeInputValue(new Date());
  const isBookingDateToday = formData.date === todayDateString;

  // Fetch availability when date changes
  useEffect(() => {
    if (formData.resourceId && formData.date) {
      const checkConflicts = async () => {
        try {
          const bookedSlots = await bookingService.getAvailability(user?.token, formData.resourceId, formData.date);
          setConflicts(bookedSlots || []);
        } catch (err) {
          console.error("Failed to fetch availability", err);
        }
      };
      checkConflicts();
    } else {
      setConflicts([]);
    }
  }, [formData.resourceId, formData.date, user]);

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

  const isDateOutsideAllowedRange = useMemo(() => {
    if (!formData.date) {
      return false;
    }

    return formData.date < todayDateString || formData.date > maxBookingDateString;
  }, [formData.date, maxBookingDateString, todayDateString]);

  const hasPastTimeSelection = useMemo(() => {
    if (!isBookingDateToday || !formData.startTime) {
      return false;
    }

    const selectedMinutes = toMinutes(formData.startTime);
    const currentMinutes = toMinutes(currentTimeString);

    return selectedMinutes !== null && currentMinutes !== null && selectedMinutes < currentMinutes;
  }, [currentTimeString, formData.startTime, isBookingDateToday]);

  const qrImageUrl = useMemo(
    () => qrBooking?.checkInPayload
      ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrBooking.checkInPayload)}`
      : '',
    [qrBooking]
  );

  const formatCheckInTimestamp = (timestamp) => {
    if (!timestamp) {
      return '';
    }
    return new Date(timestamp).toLocaleString();
  };

  const handleCopyCheckInCode = async () => {
    if (!qrBooking?.checkInPayload) {
      return;
    }

    try {
      await navigator.clipboard.writeText(qrBooking.checkInPayload);
      showToast({
        variant: 'success',
        title: 'Check-In Code Copied',
        message: 'The booking QR payload is ready to paste into the verification screen.',
      });
    } catch {
      showToast({
        variant: 'error',
        title: 'Copy Failed',
        message: 'Unable to copy the QR code data right now.',
      });
    }
  };

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

    if (name === 'date') {
      setFormData(prev => {
        const selectedMinutes = toMinutes(prev.startTime);
        const currentMinutes = toMinutes(currentTimeString);
        const shouldResetTimeSelection =
          value === todayDateString &&
          selectedMinutes !== null &&
          currentMinutes !== null &&
          selectedMinutes < currentMinutes;

        return {
          ...prev,
          date: value,
          startTime: shouldResetTimeSelection ? '' : prev.startTime,
          endTime: shouldResetTimeSelection ? '' : prev.endTime,
        };
      });
      return;
    }

    if (name === 'startTime') {
      const selectedMinutes = toMinutes(value);
      const currentMinutes = toMinutes(currentTimeString);

      if (
        isBookingDateToday &&
        value &&
        selectedMinutes !== null &&
        currentMinutes !== null &&
        selectedMinutes < currentMinutes
      ) {
        setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
        return;
      }
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
    if (isDateOutsideAllowedRange) {
      showToast({
        variant: 'warning',
        title: 'Invalid Booking Date',
        message: `Bookings can only be made from ${todayDateString} through ${maxBookingDateString}.`,
      });
      return;
    }
    if (hasPastTimeSelection) {
      showToast({
        variant: 'warning',
        title: 'Invalid Start Time',
        message: 'For today, please choose the current time or a future time slot.',
      });
      return;
    }
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

  const decreaseAttendees = () => {
    const val = parseInt(formData.expectedAttendees) || 1;
    if (val > 1) {
      setFormData(prev => ({ ...prev, expectedAttendees: String(val - 1) }));
    }
  };

  const increaseAttendees = () => {
    const val = parseInt(formData.expectedAttendees) || 1;
    const limit = selectedResource?.capacity ?? 100;
    if (val < limit) {
      setFormData(prev => ({ ...prev, expectedAttendees: String(val + 1) }));
    }
  };

  const getResourceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('seminar') || n.includes('room') || n.includes('hall')) {
      return <Landmark size={28} color="#2563eb" />;
    }
    if (n.includes('computer') || n.includes('lab') || n.includes('tech') || n.includes('pc')) {
      return <Monitor size={28} color="#2563eb" />;
    }
    if (n.includes('court') || n.includes('sport') || n.includes('gym') || n.includes('ground')) {
      return <Trophy size={28} color="#f97316" />;
    }
    return <Building size={28} color="#2563eb" />;
  };

  const getResourceAvailability = (resId) => {
    if (!formData.date) {
      return { label: 'Available', type: 'available' };
    }
    const resConflicts = resourceConflicts[resId] || [];
    if (resConflicts.length === 0) {
      return { label: 'Available', type: 'available' };
    }
    const c = resConflicts[0];
    const startStr = formatBookingTime(c.startTime);
    const endStr = formatBookingTime(c.endTime);
    return { label: `Busy ${startStr}–${endStr}`, type: 'busy' };
  };

  const isTimeSlotTaken = (slotTime) => {
    if (conflicts.length === 0) return false;
    const startMins = toMinutes(slotTime);
    const endMins = startMins + effectiveDurationHours * 60;
    return conflicts.some(c => {
      const cStart = toMinutes(c.startTime);
      const cEnd = toMinutes(c.endTime);
      const maxStart = Math.max(startMins, cStart);
      const minEnd = Math.min(endMins, cEnd);
      return maxStart < minEnd;
    });
  };

  const isTimeSlotDisabled = (slotTime) => {
    if (isBookingDateToday) {
      const slotMins = toMinutes(slotTime);
      const currentMins = toMinutes(currentTimeString);
      if (slotMins !== null && currentMins !== null && slotMins < currentMins) {
        return true;
      }
    }
    return isTimeSlotTaken(slotTime);
  };

  const getTimelineBlockState = (blockStart, blockEnd) => {
    const toMinsVal = (t) => {
      if (!t || typeof t !== 'string' || !t.includes(':')) return 0;
      const [h, m] = t.split(':');
      return parseInt(h) * 60 + parseInt(m);
    };

    const bStartMins = toMinsVal(blockStart);
    const bEndMins = toMinsVal(blockEnd);

    // 1. Check if selected by current booking
    if (formData.startTime && formData.endTime) {
      const selStartMins = toMinsVal(formData.startTime);
      const selEndMins = toMinsVal(formData.endTime);

      const maxStart = Math.max(bStartMins, selStartMins);
      const minEnd = Math.min(bEndMins, selEndMins);
      if (maxStart < minEnd) {
        return 'selected';
      }
    }

    // 2. Check if booked (conflicts)
    if (conflicts.length > 0) {
      const isBooked = conflicts.some(c => {
        const cStart = toMinsVal(c.startTime);
        const cEnd = toMinsVal(c.endTime);
        const maxStart = Math.max(bStartMins, cStart);
        const minEnd = Math.min(bEndMins, cEnd);
        return maxStart < minEnd;
      });
      if (isBooked) return 'booked';
    }

    return 'available';
  };

  const dateList = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const timeSlots = useMemo(() => {
    return [
      { value: '08:00', label: '08:00 AM' },
      { value: '09:00', label: '09:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '12:00', label: '12:00 PM' },
      { value: '13:00', label: '01:00 PM' },
      { value: '14:00', label: '02:00 PM' },
      { value: '15:00', label: '03:00 PM' },
    ];
  }, []);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Not selected';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', padding: 0, width: 'fit-content' }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>My Bookings</h2>

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
                          {bk.checkedIn && (
                            <div style={{ marginTop: '6px', fontSize: '0.74rem', fontWeight: '600', color: '#166534' }}>
                              Checked in
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {bk.checkedIn
                            ? `Checked in on ${formatCheckInTimestamp(bk.checkedInAt)}`
                            : bk.adminReason || bk.purpose}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {bk.status === 'APPROVED' && bk.checkInPayload && (
                              <button
                                onClick={() => setQrBooking(bk)}
                                style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                              >
                                View QR
                              </button>
                            )}
                            {!bk.checkedIn && (bk.status === 'PENDING' || bk.status === 'APPROVED') && (
                              <button
                                onClick={() => handleCancelBooking(bk.id)}
                                style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #f87171', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                              >
                                Cancel
                              </button>
                            )}
                            {bk.checkedIn && (
                              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                Checked In
                              </span>
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
          <div style={{
            background: 'var(--bg-color)', padding: '32px', borderRadius: '16px',
            border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
                Create New Booking
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>Select a resource, choose your time, and confirm details</p>
            </div>

            {/* Stepper */}
            {(() => {
              const step1Completed = !!formData.resourceId;
              const step2Completed = step1Completed && !!formData.date && !!formData.startTime;
              const step3Completed = step2Completed && !!formData.purpose && !!formData.expectedAttendees;

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', maxWidth: '800px' }}>
                  {/* Step 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: step1Completed ? '#2563eb' : 'transparent',
                      color: step1Completed ? '#ffffff' : '#64748b',
                      border: step1Completed ? 'none' : '1.5px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem'
                    }}>
                      {step1Completed ? <Check size={18} /> : '1'}
                    </div>
                    <span style={{ fontWeight: step1Completed ? '700' : '500', color: step1Completed ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>Resource</span>
                  </div>

                  {/* Line 1-2 */}
                  <div style={{ flex: '1', height: '2px', background: step1Completed ? '#2563eb' : 'var(--border-color)', margin: '0 12px', minWidth: '40px' }} />

                  {/* Step 2 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: step2Completed ? '#2563eb' : step1Completed ? '#2563eb' : 'transparent',
                      color: step2Completed || step1Completed ? '#ffffff' : '#64748b',
                      border: step2Completed || step1Completed ? 'none' : '1.5px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem'
                    }}>
                      {step2Completed ? <Check size={18} /> : '2'}
                    </div>
                    <span style={{ fontWeight: step1Completed ? '700' : '500', color: step1Completed ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>Date & Time</span>
                  </div>

                  {/* Line 2-3 */}
                  <div style={{ flex: '1', height: '2px', background: step2Completed ? '#2563eb' : 'var(--border-color)', margin: '0 12px', minWidth: '40px' }} />

                  {/* Step 3 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: step3Completed ? '#2563eb' : 'transparent',
                      color: step3Completed ? '#ffffff' : '#64748b',
                      border: step3Completed ? 'none' : '1.5px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem'
                    }}>
                      3
                    </div>
                    <span style={{ fontWeight: step2Completed ? '700' : '500', color: step2Completed ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>Confirm</span>
                  </div>
                </div>
              );
            })()}

            {/* Form grid */}
            <form onSubmit={handleSubmit} className="booking-form-grid">

              {/* Column 1: Main selection steps */}
              <div>
                {/* SECTION 1: Select Resource */}
                <div className="booking-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building size={20} color="#2563eb" />
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Select Resource</h4>
                    </div>
                    {formData.resourceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            resourceId: '',
                            date: '',
                            startTime: '',
                            endTime: '',
                            additionalRequirements: ''
                          }));
                          setSearchQuery('');
                          setResourceTypeFilter('ALL');
                        }}
                        style={{
                          background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700',
                          fontSize: '0.85rem', cursor: 'pointer', outline: 'none'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Filter controls: shown only when no resource is selected */}
                  {!formData.resourceId && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', width: '100%' }}>
                      <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                        <input
                          type="text"
                          placeholder="Search resources by name or location..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%', padding: '10px 14px', paddingRight: searchQuery ? '36px' : '14px', borderRadius: '10px',
                            border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                            color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none'
                          }}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            style={{
                              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                              background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                              fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: 0, width: '20px', height: '20px'
                            }}
                            title="Clear search"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          value={resourceTypeFilter}
                          onChange={(e) => setResourceTypeFilter(e.target.value)}
                          style={{
                            padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.95rem',
                            outline: 'none', minWidth: '150px', colorScheme: 'inherit'
                          }}
                        >
                          <option value="ALL">All Types</option>
                          <option value="ROOM">Seminar Rooms</option>
                          <option value="LAB">Computer Labs</option>
                          <option value="COURT">Sports Courts</option>
                        </select>
                        {resourceTypeFilter !== 'ALL' && (
                          <button
                            type="button"
                            onClick={() => setResourceTypeFilter('ALL')}
                            style={{
                              background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700',
                              fontSize: '0.85rem', cursor: 'pointer', outline: 'none'
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {loadingResources ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading resources...</div>
                  ) : formData.resourceId ? (
                    /* Show ONLY the chosen resource card with the day schedule timeline */
                    resources
                      .filter(res => res.id.toString() === formData.resourceId.toString())
                      .map(res => {
                        const availability = getResourceAvailability(res.id);
                        return (
                          <div
                            key={res.id}
                            className="resource-card-item selected"
                            style={{
                              borderWidth: '2px',
                              borderColor: '#2563eb',
                              width: '100%',
                              maxWidth: 'none',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              padding: '24px',
                              cursor: 'default',
                              background: 'var(--bg-card)'
                            }}
                          >
                            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                  background: '#f1f5f9', width: '56px', height: '56px', borderRadius: '12px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  {getResourceIcon(res.name)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                    {res.name}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                    Capacity: Up to {res.capacity} people {res.location ? `| ${res.location}` : ''}
                                  </div>
                                </div>
                              </div>

                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700',
                                background: availability.type === 'available' ? '#dcfce7' : '#fef3c7',
                                color: availability.type === 'available' ? '#15803d' : '#d97706',
                              }}>
                                <span style={{
                                  width: '6px', height: '6px', borderRadius: '50%',
                                  background: availability.type === 'available' ? '#15803d' : '#d97706'
                                }} />
                                {availability.label}
                              </span>
                            </div>

                            {/* Day Timeline */}
                            <div style={{ marginTop: '20px', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                                  Day Schedule ({formData.date ? formatDateDisplay(formData.date) : 'Today'})
                                </div>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }} />
                                    Selected
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }} />
                                    Booked
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--bg-alt)', border: '1px solid var(--border-color)' }} />
                                    Available
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '6px' }}>
                                {[
                                  { start: '08:00', end: '09:00', label: '8-9am' },
                                  { start: '09:00', end: '10:00', label: '9-10am' },
                                  { start: '10:00', end: '11:00', label: '10-11am' },
                                  { start: '11:00', end: '12:00', label: '11-12pm' },
                                  { start: '12:00', end: '13:00', label: '12-1pm' },
                                  { start: '13:00', end: '14:00', label: '1-2pm' },
                                  { start: '14:00', end: '15:00', label: '2-3pm' },
                                  { start: '15:00', end: '16:00', label: '3-4pm' },
                                  { start: '16:00', end: '17:00', label: '4-5pm' },
                                ].map((block, idx) => {
                                  const state = getTimelineBlockState(block.start, block.end);
                                  let bg = 'var(--bg-alt)';
                                  let border = '1px solid var(--border-color)';
                                  let textColor = 'var(--text-muted)';

                                  if (state === 'selected') {
                                    bg = '#2563eb';
                                    border = '1px solid #2563eb';
                                    textColor = '#ffffff';
                                  } else if (state === 'booked') {
                                    bg = 'rgba(239, 68, 68, 0.08)';
                                    border = '1px solid rgba(239, 68, 68, 0.25)';
                                    textColor = '#ef4444';
                                  }

                                  return (
                                    <div
                                      key={idx}
                                      style={{
                                        background: bg,
                                        border: border,
                                        borderRadius: '8px',
                                        padding: '8px 2px',
                                        textAlign: 'center',
                                        fontSize: '0.72rem',
                                        fontWeight: '700',
                                        color: textColor,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', opacity: 0.8, marginBottom: '2px' }}>
                                        {block.label.replace('am', '').replace('pm', '')}
                                      </div>
                                      <div>
                                        {state === 'selected' ? 'Mine' : state === 'booked' ? 'Busy' : 'Free'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : !searchQuery && resourceTypeFilter === 'ALL' ? (
                    /* Search placeholder - do not show all cards initially */
                    <div style={{
                      padding: '36px', border: '1px dashed var(--border-color)', borderRadius: '12px',
                      textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.92rem', background: 'var(--bg-alt)'
                    }}>
                      Use the search bar or type filter above to select a resource.
                    </div>
                  ) : filteredResources.length === 0 ? (
                    <div style={{
                      padding: '36px', border: '1px dashed var(--border-color)', borderRadius: '12px',
                      textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.92rem', background: 'var(--bg-alt)'
                    }}>
                      No matching resources found. Try another search terms.
                    </div>
                  ) : (
                    /* Render filtered matches */
                    <div className="resource-cards-grid">
                      {filteredResources.map(res => {
                        const availability = getResourceAvailability(res.id);
                        return (
                          <div
                            key={res.id}
                            onClick={() => handleInputChange({ target: { name: 'resourceId', value: res.id } })}
                            className="resource-card-item"
                          >
                            <div style={{
                              background: '#f1f5f9', width: '56px', height: '56px', borderRadius: '12px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
                            }}>
                              {getResourceIcon(res.name)}
                            </div>

                            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                              {res.name}
                            </div>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                              Up to {res.capacity} people
                            </div>

                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '5px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700',
                              background: availability.type === 'available' ? '#dcfce7' : '#fef3c7',
                              color: availability.type === 'available' ? '#15803d' : '#d97706',
                            }}>
                              <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: availability.type === 'available' ? '#15803d' : '#d97706'
                              }} />
                              {availability.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Additional requirements input */}
                  {selectedResource && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>Additional Requirements</label>
                        {formData.additionalRequirements && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, additionalRequirements: '' }))}
                            style={{
                              background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700',
                              fontSize: '0.82rem', cursor: 'pointer', outline: 'none'
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        name="additionalRequirements"
                        value={formData.additionalRequirements}
                        onChange={handleInputChange}
                        placeholder="e.g. Projectors, Sport Items, Mics..."
                        style={{
                          padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
                          background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%',
                          outlineColor: '#2563eb'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* SECTION 2: Pick a Date */}
                <div className="booking-section-card" style={{ opacity: selectedResource ? 1 : 0.6, pointerEvents: selectedResource ? 'auto' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar size={20} color="#2563eb" />
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Pick a Date</h4>
                    </div>
                    {formData.date && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, date: '', startTime: '', endTime: '' }));
                        }}
                        style={{
                          background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700',
                          fontSize: '0.85rem', cursor: 'pointer', outline: 'none'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="date-cards-scroll">
                    {dateList.map((d, index) => {
                      const dateVal = formatDateInputValue(d);
                      const isSelected = formData.date === dateVal;
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNum = d.getDate();

                      return (
                        <div
                          key={index}
                          onClick={() => handleInputChange({ target: { name: 'date', value: dateVal } })}
                          className={`date-card-item ${isSelected ? 'selected' : ''}`}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: isSelected ? 'white' : 'var(--text-muted)', marginBottom: '4px' }}>
                            {dayName}
                          </span>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: isSelected ? 'white' : 'var(--text-primary)' }}>
                            {dayNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: Pick a Start Time */}
                <div className="booking-section-card" style={{ opacity: formData.date ? 1 : 0.6, pointerEvents: formData.date ? 'auto' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={20} color="#2563eb" />
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Pick a Start Time</h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {formData.startTime && (
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange({ target: { name: 'startTime', value: '' } });
                          }}
                          style={{
                            background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700',
                            fontSize: '0.85rem', cursor: 'pointer', outline: 'none'
                          }}
                        >
                          Clear
                        </button>
                      )}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '8px',
                        fontSize: '0.82rem', fontWeight: '700'
                      }}>
                        <Clock size={12} />
                        {isAuditorium ? `${durationHours} hrs fixed` : '2 hrs fixed'}
                      </div>
                    </div>
                  </div>

                  <div className="time-slots-grid">
                    {timeSlots.map(slot => {
                      const isSelected = formData.startTime === slot.value;
                      const isTaken = isTimeSlotDisabled(slot.value);

                      return (
                        <button
                          key={slot.value}
                          type="button"
                          disabled={isTaken}
                          onClick={() => handleInputChange({ target: { name: 'startTime', value: slot.value } })}
                          className={`time-slot-btn ${isSelected ? 'selected' : ''}`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time slot legend */}
                  <div style={{ display: 'flex', gap: '18px', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563eb' }} />
                      Selected
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1.5px solid var(--border-color)', background: 'var(--bg-card)' }} />
                      Available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
                      Taken
                    </div>
                  </div>

                  {conflicts.length > 0 && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> BOOKED TIME WINDOWS ON THIS DAY
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {conflicts.map((slot, i) => (
                          <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', border: '1px solid #fecaca' }}>
                            {formatBookingRange(slot.startTime, slot.endTime)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasLateTimeSelection && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{lastBookingErrorMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Sticky summary & final checks */}
              <div className="reservation-summary-sticky">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                  <ClipboardCheck size={22} color="#2563eb" />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Reservation Summary</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Summary Block: Resource */}
                  <div className="summary-block-item">
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Resource</span>
                    <span style={{ fontSize: '0.98rem', fontWeight: '700', color: selectedResource ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: selectedResource ? 'normal' : 'italic' }}>
                      {selectedResource ? selectedResource.name : 'Not selected'}
                    </span>
                  </div>

                  {/* Summary Block: Date */}
                  <div className="summary-block-item">
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Date</span>
                    <span style={{ fontSize: '0.98rem', fontWeight: '700', color: formData.date ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: formData.date ? 'normal' : 'italic' }}>
                      {formData.date ? formatDateDisplay(formData.date) : 'Not selected'}
                    </span>
                  </div>

                  {/* Summary Block: Time */}
                  <div className="summary-block-item">
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Time</span>
                    <span style={{ fontSize: '0.98rem', fontWeight: '700', color: formData.startTime ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: formData.startTime ? 'normal' : 'italic' }}>
                      {formData.startTime ? formatBookingRange(formData.startTime, formData.endTime) : 'Not selected'}
                    </span>
                  </div>

                  {/* Summary Block: Expected Attendees */}
                  <div className="summary-block-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Expected Attendees</span>
                      {selectedResource && formData.expectedAttendees !== '5' && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, expectedAttendees: '5' }))}
                          style={{
                            background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700',
                            fontSize: '0.78rem', cursor: 'pointer', outline: 'none'
                          }}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={decreaseAttendees}
                        disabled={!selectedResource}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)',
                          background: 'var(--bg-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          opacity: selectedResource ? 1 : 0.5
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="expectedAttendees"
                        value={formData.expectedAttendees}
                        onChange={handleInputChange}
                        disabled={!selectedResource}
                        style={{
                          width: '54px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '1rem',
                          fontWeight: '800',
                          textAlign: 'center',
                          outline: 'none',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
                          transition: 'border-color 0.2s, background-color 0.2s'
                        }}
                      />
                      <button
                        type="button"
                        onClick={increaseAttendees}
                        disabled={!selectedResource}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)',
                          background: 'var(--bg-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          opacity: selectedResource ? 1 : 0.5
                        }}
                      >
                        <Plus size={14} />
                      </button>
                      <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-muted)' }}>people</span>
                    </div>
                    {selectedResource && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Limit: {selectedResource.capacity} people
                      </span>
                    )}
                  </div>

                  {/* Purpose text area */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Purpose</label>
                      {formData.purpose && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, purpose: '' }))}
                          style={{
                            background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700',
                            fontSize: '0.78rem', cursor: 'pointer', outline: 'none'
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      required
                      placeholder="Reason for booking..."
                      style={{
                        width: '100%', height: '80px', borderRadius: '10px', border: '1px solid var(--border-color)',
                        padding: '12px', fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'inherit',
                        background: 'var(--bg-color)', color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Auditorium duration selector & file approval */}
                  {selectedResource && isAuditorium && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-alt)', padding: '10px 12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>Duration (hrs)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button type="button" onClick={() => setDurationHours(Math.max(1, durationHours - 1))} style={{ background: 'var(--border-color)', border: 'none', color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{durationHours}</span>
                          <button type="button" onClick={() => setDurationHours(Math.min(10, durationHours + 1))} style={{ background: '#2563eb', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer' }}>+</button>
                        </div>
                      </div>

                      <div style={{ border: '1.5px dashed #eab308', background: 'rgba(234, 179, 8, 0.04)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                            <FileText size={14} /> Faculty Head Approval *
                          </div>
                          {file && (
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              style={{
                                background: 'transparent', border: 'none', color: '#b45309', fontWeight: '700',
                                fontSize: '0.78rem', cursor: 'pointer', outline: 'none'
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px',
                          borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.82rem',
                          color: file ? '#2563eb' : 'var(--text-muted)'
                        }}>
                          <UploadCloud size={16} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                            {file ? file.name : 'Upload PDF Document'}
                          </span>
                          <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} required />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Submit Button & Clear All Selections */}
                  {(() => {
                    const isDisabled = hasConflict || hasLateTimeSelection || hasPastTimeSelection || isDateOutsideAllowedRange || !formData.date || !formData.startTime || !formData.resourceId || !formData.expectedAttendees || !formData.purpose || (isAuditorium && !file);
                    const isAnySelected = formData.resourceId || formData.date || formData.startTime || formData.purpose || formData.additionalRequirements || file;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <button
                          type="submit"
                          disabled={isDisabled}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            border: isDisabled ? '1px solid var(--border-color)' : '1.5px solid #1e293b',
                            background: isDisabled ? '#f1f5f9' : '#ffffff',
                            color: isDisabled ? '#94a3b8' : '#1e293b',
                          }}
                        >
                          <Send size={16} />
                          Submit Booking
                        </button>
                        {isAnySelected && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                resourceId: '',
                                date: '',
                                startTime: '',
                                endTime: '',
                                purpose: '',
                                expectedAttendees: '5',
                                additionalRequirements: ''
                              });
                              setFile(null);
                              setDurationHours(2);
                              setSearchQuery('');
                              setResourceTypeFilter('ALL');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              padding: '10px',
                              borderRadius: '10px',
                              fontWeight: '600',
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              border: '1px solid var(--border-color)',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            Clear All Selections
                          </button>
                        )}
                      </div>
                    );
                  })()}

                </div>
              </div>

            </form>
          </div>
        )}
      </div>
      {qrBooking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div
            onClick={() => setQrBooking(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative',
            zIndex: 1,
            width: 'min(520px, calc(100vw - 32px))',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 30px 60px rgba(15, 23, 42, 0.25)',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '8px' }}>
                Booking Check-In
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '6px' }}>{qrBooking.resourceName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Show this QR code to the manager on {qrBooking.bookingDate} during your approved booking window.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'center' }}>
              <div style={{ background: '#ffffff', borderRadius: '18px', padding: '16px', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt={`QR code for booking ${qrBooking.id}`}
                    style={{ width: '100%', maxWidth: '220px', aspectRatio: '1 / 1', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>QR code unavailable</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'var(--bg-alt)', borderRadius: '14px', padding: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Check-In Code</div>
                  <div style={{ fontFamily: 'Consolas, monospace', fontSize: '0.8rem', lineHeight: 1.5, wordBreak: 'break-all', color: 'var(--text-muted)' }}>
                    {qrBooking.checkInPayload}
                  </div>
                </div>

                {qrBooking.checkedIn ? (
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: '14px', padding: '14px', fontSize: '0.9rem', fontWeight: '600' }}>
                    Checked in on {formatCheckInTimestamp(qrBooking.checkedInAt)}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    If the QR image does not load, the manager can still paste the check-in code into the verification box.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleCopyCheckInCode}
                style={{ background: 'var(--bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                Copy Code
              </button>
              <button
                onClick={() => setQrBooking(null)}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
