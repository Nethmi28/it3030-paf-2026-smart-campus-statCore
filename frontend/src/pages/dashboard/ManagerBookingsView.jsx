import { useState, useEffect, useMemo } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, ArrowUpRight, CalendarRange, CheckCircle, Clock3, Download, FileText, Filter, Search, XCircle } from 'lucide-react';
import { formatBookingRange } from '../../utils/bookingTime';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:8089';

const getBookingStatusLabel = (status) => (status === 'APPROVED' ? 'ACCEPTED' : status || 'UNKNOWN');

const getBookingStatusTone = (status) => {
  if (status === 'APPROVED') {
    return { background: '#dcfce7', color: '#166534' };
  }

  if (status === 'REJECTED') {
    return { background: '#fee2e2', color: '#991b1b' };
  }

  if (status === 'CANCELLED') {
    return { background: '#f3f4f6', color: '#4b5563' };
  }

  return { background: '#ffedd5', color: '#9a3412' };
};

const formatReportDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatReportDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString();
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export default function ManagerBookingsView() {
  const { user } = useAuth();
  const { showToast, showPrompt } = useToast();
  const { isDark } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [checkInCode, setCheckInCode] = useState('');
  const [verifyingCheckIn, setVerifyingCheckIn] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    status: 'ALL',
    resource: 'ALL',
    checkIn: 'ALL',
    bookingDate: '',
  });

  useEffect(() => {
    if (user?.token) {
      fetchBookings();
    }
  }, [user?.token]);

  useEffect(() => {
    setCheckInCode('');
  }, [selectedBooking?.id]);

  const fetchBookings = async () => {
    if (!user?.token) return;
    setLoading(true);
    setLoadError('');
    try {
      const [data, auditData] = await Promise.all([
        bookingService.getAllBookings(user.token),
        bookingService.getAuditLogs(user.token),
      ]);
      setBookings(data);
      setAuditLogs(auditData);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      setLoadError(err.message || 'Unable to load bookings right now.');
    } finally {
      setLoading(false);
    }
  };

  const activeCardStyle = {
    background: 'var(--bg-card)', 
    border: '1px solid var(--border-color)', 
    borderRadius: '16px', 
    padding: '32px', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    color: 'var(--text-primary)'
  };

  const bookingOverview = [
    {
      title: 'Total Bookings',
      value: bookings.length,
      description: 'Requests in scope',
      icon: <CalendarRange size={20} />,
      color: '#2563eb',
      background: 'rgba(37, 99, 235, 0.14)',
    },
    {
      title: 'Accepted',
      value: bookings.filter((booking) => booking.status === 'APPROVED').length,
      description: 'Ready for use',
      icon: <CheckCircle size={20} />,
      color: '#16a34a',
      background: 'rgba(22, 163, 74, 0.14)',
    },
    {
      title: 'Pending',
      value: bookings.filter((booking) => booking.status === 'PENDING').length,
      description: 'Awaiting review',
      icon: <Clock3 size={20} />,
      color: '#d97706',
      background: 'rgba(217, 119, 6, 0.16)',
    },
    {
      title: 'Cancelled',
      value: bookings.filter((booking) => booking.status === 'CANCELLED').length,
      description: 'Withdrawn requests',
      icon: <XCircle size={20} />,
      color: '#6b7280',
      background: 'rgba(99, 102, 241, 0.14)',
    },
  ];

  const filterInputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '0.92rem',
    outline: 'none',
    appearance: 'none',
    colorScheme: 'inherit',
  };

  const overviewCardSurfaceStyle = {
    background: isDark
      ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'
      : 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
    border: isDark
      ? '1px solid rgba(148, 163, 184, 0.14)'
      : '1px solid #dbe4f0',
    boxShadow: isDark
      ? '0 18px 40px rgba(15, 23, 42, 0.16)'
      : '0 16px 34px rgba(15, 23, 42, 0.08)',
  };

  const reportPanelStyle = {
    background: isDark
      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
    border: isDark
      ? '1px solid rgba(148, 163, 184, 0.18)'
      : '1px solid #dbe4f0',
    boxShadow: isDark
      ? '0 18px 40px rgba(15, 23, 42, 0.18)'
      : '0 18px 38px rgba(15, 23, 42, 0.08)',
  };

  const panelTitleColor = isDark ? '#f8fafc' : '#0f172a';
  const panelMutedColor = isDark ? 'rgba(148, 163, 184, 0.95)' : '#64748b';
  const overviewTitleColor = isDark ? 'rgba(148, 163, 184, 0.88)' : '#64748b';
  const overviewValueColor = isDark ? '#f8fafc' : '#0f172a';
  const overviewArrowColor = isDark ? 'rgba(148, 163, 184, 0.7)' : '#94a3b8';

  const resourceOptions = useMemo(() => (
    [...new Set(bookings.map((booking) => booking.resourceName).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right))
  ), [bookings]);

  const activeFilterCount = [
    filters.query.trim(),
    filters.status !== 'ALL',
    filters.resource !== 'ALL',
    filters.checkIn !== 'ALL',
    filters.bookingDate,
  ].filter(Boolean).length;

  const filteredBookings = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (normalizedQuery) {
        const searchableText = [
          booking.id,
          booking.userName,
          booking.userEmail,
          booking.resourceName,
          booking.purpose,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(normalizedQuery)) {
          return false;
        }
      }

      if (filters.status !== 'ALL' && booking.status !== filters.status) {
        return false;
      }

      if (filters.resource !== 'ALL' && booking.resourceName !== filters.resource) {
        return false;
      }

      if (filters.checkIn === 'CHECKED_IN' && !booking.checkedIn) {
        return false;
      }

      if (filters.checkIn === 'NOT_CHECKED_IN' && booking.checkedIn) {
        return false;
      }

      if (filters.bookingDate && booking.bookingDate !== filters.bookingDate) {
        return false;
      }

      return true;
    });
  }, [bookings, filters]);

  const reportRangeLabel = useMemo(() => {
    const bookingDates = filteredBookings
      .map((booking) => booking.bookingDate)
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));

    if (bookingDates.length === 0) {
      return 'No booking dates in the current selection';
    }

    const startDate = bookingDates[0];
    const endDate = bookingDates[bookingDates.length - 1];

    return startDate === endDate
      ? formatReportDate(startDate)
      : `${formatReportDate(startDate)} - ${formatReportDate(endDate)}`;
  }, [filteredBookings]);

  const activeFilterSummary = useMemo(() => {
    const summaryParts = [];

    if (filters.query.trim()) {
      summaryParts.push(`Search: ${filters.query.trim()}`);
    }

    if (filters.status !== 'ALL') {
      summaryParts.push(`Status: ${getBookingStatusLabel(filters.status)}`);
    }

    if (filters.resource !== 'ALL') {
      summaryParts.push(`Resource: ${filters.resource}`);
    }

    if (filters.checkIn !== 'ALL') {
      summaryParts.push(`Check-In: ${filters.checkIn === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}`);
    }

    if (filters.bookingDate) {
      summaryParts.push(`Booking Date: ${formatReportDate(filters.bookingDate)}`);
    }

    return summaryParts.length > 0 ? summaryParts.join(' | ') : 'All visible bookings';
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      query: '',
      status: 'ALL',
      resource: 'ALL',
      checkIn: 'ALL',
      bookingDate: '',
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleGenerateReport = () => {
    if (filteredBookings.length === 0) {
      showToast({
        variant: 'warning',
        title: 'No Bookings to Export',
        message: 'Adjust the filters so at least one booking appears before generating a report.',
      });
      return;
    }

    const reportWindow = window.open('', '_blank', 'width=1180,height=900');

    if (!reportWindow) {
      showToast({
        variant: 'error',
        title: 'Popup Blocked',
        message: 'Please allow popups for this site so the booking report can open.',
      });
      return;
    }

    const bookingRows = filteredBookings.map((booking) => {
      const tone = getBookingStatusTone(booking.status);
      const statusLabel = getBookingStatusLabel(booking.status);

      return `
        <tr>
          <td>${escapeHtml(booking.id)}</td>
          <td>${escapeHtml(booking.userName || 'Not available')}</td>
          <td>${escapeHtml(booking.resourceName || 'Not available')}</td>
          <td>${escapeHtml(formatReportDate(booking.bookingDate))}</td>
          <td>${escapeHtml(formatBookingRange(booking.startTime, booking.endTime))}</td>
          <td>${escapeHtml(booking.expectedAttendees || 0)}</td>
          <td>
            <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${tone.background};color:${tone.color};font-size:12px;font-weight:700;">
              ${escapeHtml(statusLabel)}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Manager Booking Report</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              background: #f8fafc;
            }
            .page {
              max-width: 1100px;
              margin: 0 auto;
              background: #ffffff;
              min-height: 100vh;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: #ffffff;
              padding: 28px 40px;
              display: flex;
              justify-content: space-between;
              gap: 24px;
              align-items: flex-start;
            }
            .brand-title {
              font-size: 18px;
              font-weight: 800;
              letter-spacing: 0.04em;
              margin-bottom: 6px;
              font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif;
              font-size: 22px;
              letter-spacing: 0.01em;
            }
            .brand-copy {
              font-size: 13px;
              opacity: 0.9;
            }
            .report-title {
              text-align: right;
            }
            .report-title h1 {
              margin: 0 0 6px;
              font-size: 24px;
              font-weight: 800;
            }
            .report-title p {
              margin: 0;
              font-size: 13px;
              opacity: 0.9;
            }
            .content {
              padding: 32px 40px 40px;
            }
            h2 {
              font-size: 22px;
              margin: 0 0 18px;
              color: #0f172a;
            }
            .section {
              margin-bottom: 30px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 220px 1fr;
              gap: 10px 18px;
              font-size: 14px;
            }
            .info-label {
              color: #475569;
              font-weight: 700;
            }
            .info-value {
              color: #0f172a;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            thead th {
              text-align: left;
              padding: 12px 10px;
              background: #e2f6f0;
              color: #0f766e;
              border-bottom: 1px solid #bfdbd3;
              font-size: 12px;
              letter-spacing: 0.03em;
              text-transform: uppercase;
            }
            tbody td {
              padding: 12px 10px;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }
            tbody tr:nth-child(even) {
              background: #f8fafc;
            }
            .footer-note {
              margin-top: 16px;
              font-size: 12px;
              color: #64748b;
            }
            @media print {
              body {
                background: #ffffff;
              }
              .page {
                max-width: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div>
                <div class="brand-title">FACILIO HUB</div>
                <div class="brand-copy">Campus reservations and operations</div>
              </div>
              <div class="report-title">
                <h1>MANAGER BOOKING REPORT</h1>
                <p>Filtered reservation analysis</p>
              </div>
            </div>

            <div class="content">
              <div class="section">
                <h2>Report Information</h2>
                <div class="info-grid">
                  <div class="info-label">Report Period</div>
                  <div class="info-value">${escapeHtml(reportRangeLabel)}</div>
                  <div class="info-label">Generated On</div>
                  <div class="info-value">${escapeHtml(new Date().toLocaleString())}</div>
                  <div class="info-label">Generated By</div>
                  <div class="info-value">${escapeHtml(user?.email || user?.name || 'Manager')}</div>
                  <div class="info-label">Applied Filters</div>
                  <div class="info-value">${escapeHtml(activeFilterSummary)}</div>
                </div>
              </div>

              <div class="section">
                <h2>Reservation Details</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Requester</th>
                      <th>Resource</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Guests</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bookingRows}
                  </tbody>
                </table>
                <div class="footer-note">
                  This report reflects the current filtered booking view at the time of generation.
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
    reportWindow.focus();

    setTimeout(() => {
      reportWindow.print();
    }, 300);

    showToast({
      variant: 'success',
      title: 'Report Ready',
      message: 'The booking report opened in a new window. Use the print dialog to save it as a PDF.',
    });
  };

  const handleStatusUpdate = async (id, status) => {
    let reason = '';

    if (status === 'REJECTED') {
      const input = await showPrompt({
        title: 'Reject Booking',
        message: 'Please provide a reason for rejecting this booking request.',
        placeholder: 'Enter rejection reason',
        confirmLabel: 'Reject Booking',
        cancelLabel: 'Keep Pending',
        confirmTone: 'danger',
        required: true,
      });

      if (input === null) return;

      reason = input.trim();

      if (!reason) {
        showToast({
          variant: 'warning',
          title: 'Reason Required',
          message: 'A reason is required for rejection.',
        });
        return;
      }
    }
    
    try {
      await bookingService.updateStatus(user.token, id, { status, adminReason: reason });
      showToast({
        variant: 'success',
        title: status === 'APPROVED' ? 'Booking Approved' : 'Booking Rejected',
        message: status === 'APPROVED'
          ? 'The booking has been approved successfully.'
          : 'The booking has been rejected successfully.',
      });
      // Update selected booking preview dynamically
      setSelectedBooking(prev => prev ? { ...prev, status, adminReason: reason } : null);
      fetchBookings();
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Update Failed',
        message: err.message || 'Failed to update the booking status.',
      });
    }
  };

  const handleVerifyCheckIn = async () => {
    if (!selectedBooking) {
      return;
    }

    if (!checkInCode.trim()) {
      showToast({
        variant: 'warning',
        title: 'QR Code Required',
        message: 'Paste the scanned QR payload before verifying the booking check-in.',
      });
      return;
    }

    setVerifyingCheckIn(true);
    try {
      const updatedBooking = await bookingService.verifyCheckIn(user.token, selectedBooking.id, checkInCode.trim());
      setSelectedBooking(updatedBooking);
      setCheckInCode('');
      fetchBookings();
      showToast({
        variant: 'success',
        title: 'Check-In Verified',
        message: `${updatedBooking.userName} has been checked in successfully.`,
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Check-In Failed',
        message: err.message || 'Unable to verify the QR check-in right now.',
      });
    } finally {
      setVerifyingCheckIn(false);
    }
  };

  const formatCheckInTimestamp = (timestamp) => {
    if (!timestamp) {
      return '';
    }
    return new Date(timestamp).toLocaleString();
  };

  const formatAuditTimestamp = (timestamp) => {
    if (!timestamp) {
      return '';
    }
    return new Date(timestamp).toLocaleString();
  };

  if (selectedBooking) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
        <button 
          onClick={() => setSelectedBooking(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', padding: 0, width: 'fit-content' }}
        >
          <ArrowLeft size={18} /> Back to Bookings List
        </button>

        <div style={activeCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Booking Request #{selectedBooking.id}</h2>
              <div style={{ color: 'var(--text-muted)' }}>Created on {new Date(selectedBooking.createdAt).toLocaleString()}</div>
            </div>
            <span style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700',
              background: selectedBooking.status === 'APPROVED' ? '#dcfce7' : selectedBooking.status === 'REJECTED' ? '#fee2e2' : selectedBooking.status === 'CANCELLED' ? '#f3f4f6' : '#ffedd5',
              color: selectedBooking.status === 'APPROVED' ? '#166534' : selectedBooking.status === 'REJECTED' ? '#991b1b' : selectedBooking.status === 'CANCELLED' ? '#4b5563' : '#9a3412',
            }}>
              {selectedBooking.status === 'APPROVED' ? 'ACCEPTED' : selectedBooking.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr)', gap: '32px' }}>
             
             <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Requester Information</h4>
                <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Requester Name:</span> <span style={{ fontWeight: '500' }}>{selectedBooking.userName}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Requester ID:</span> <span style={{ fontWeight: '500' }}>{selectedBooking.userId}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span style={{ color: 'var(--text-muted)' }}>Requester Email:</span> <span style={{ fontWeight: '500', textAlign: 'right', wordBreak: 'break-word' }}>{selectedBooking.userEmail || 'Not available'}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Booking Purpose:</span>
                      <span style={{ fontWeight: '500', background: 'var(--bg-alt)', padding: '12px', borderRadius: '8px' }}>{selectedBooking.purpose}</span>
                    </div>
                  </div>
                </div>
             </div>

             <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Event Details</h4>
                <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Resource:</span> <span style={{ fontWeight: '500' }}>{selectedBooking.resourceName}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Date:</span> <span style={{ fontWeight: '500' }}>{selectedBooking.bookingDate}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Time Slot:</span> <span style={{ fontWeight: '500' }}>{formatBookingRange(selectedBooking.startTime, selectedBooking.endTime)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Expected Attendees:</span> <span style={{ fontWeight: '500' }}>{selectedBooking.expectedAttendees}</span></div>
                    
                    {selectedBooking.additionalRequirements && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Additional Requirements:</span>
                        <span style={{ fontWeight: '500', background: 'var(--bg-alt)', padding: '12px', borderRadius: '8px' }}>{selectedBooking.additionalRequirements}</span>
                      </div>
                    )}
                  </div>
                </div>
             </div>

          </div>

          <div style={{ marginTop: '24px' }}>
            {selectedBooking.facultyApprovalPdf && (
              <div style={{ marginBottom: '24px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e3a8a' }}>
                  <FileText size={24} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Faculty Head Approval PDF</div>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Mandatory verification for Auditorium bookings</div>
                  </div>
                </div>
                <a 
                  href={`${API_BASE}/uploads/bookings/${selectedBooking.facultyApprovalPdf.split(/[\\/]/).pop()}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}
                >
                  View PDF
                </a>
              </div>
            )}

            {selectedBooking.adminReason && (
               <div style={{ background: 'var(--bg-alt)', padding: '16px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid var(--border-color)' }}>
                 <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Manager Notes:</div>
                 <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedBooking.adminReason}</div>
               </div>
            )}

            {selectedBooking.status === 'APPROVED' && (
              <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>QR Check-In Verification</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      Scan the student&apos;s QR code or paste the payload here. Check-in opens 30 minutes before the booking starts.
                    </div>
                  </div>
                  {selectedBooking.checkedIn && (
                    <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '8px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700' }}>
                      Checked In
                    </span>
                  )}
                </div>

                {selectedBooking.checkedIn ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', color: '#166534', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    This booking was checked in on <strong>{formatCheckInTimestamp(selectedBooking.checkedInAt)}</strong>
                    {selectedBooking.checkedInBy ? ` by ${selectedBooking.checkedInBy}` : ''}.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <textarea
                      value={checkInCode}
                      onChange={(event) => setCheckInCode(event.target.value)}
                      placeholder="Paste scanned QR payload here"
                      rows={4}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        padding: '14px',
                        resize: 'vertical',
                        outlineColor: '#2563eb',
                        fontFamily: 'Consolas, monospace',
                        fontSize: '0.84rem',
                        lineHeight: 1.5
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Expected format: `FACILIO-CHECKIN|bookingId|token`
                      </div>
                      <button
                        onClick={handleVerifyCheckIn}
                        disabled={verifyingCheckIn}
                        style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: verifyingCheckIn ? 'wait' : 'pointer', fontSize: '0.85rem', fontWeight: '700', opacity: verifyingCheckIn ? 0.72 : 1 }}
                      >
                        {verifyingCheckIn ? 'Verifying...' : 'Verify Check-In'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedBooking.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'REJECTED')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  <XCircle size={18} /> Reject
                </button>
                <button 
                   onClick={() => handleStatusUpdate(selectedBooking.id, 'APPROVED')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#22c55e', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.4)' }}
                >
                  <CheckCircle size={18} /> Approve Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-primary)' }}>Review Bookings</h2>
         
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        {bookingOverview.map((item) => (
          <div
            key={item.title}
            style={{
              position: 'relative',
              overflow: 'hidden',
              minHeight: '190px',
              borderRadius: '24px',
              padding: '28px 28px 24px',
              ...overviewCardSurfaceStyle,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: item.background,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark
                  ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px ${item.color}22`
                  : `inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 20px ${item.color}14`,
                flexShrink: 0,
              }}>
                {item.icon}
              </div>

              <div style={{ color: overviewArrowColor }}>
                <ArrowUpRight size={22} />
              </div>
            </div>

            <div>
              <div style={{ color: overviewTitleColor, fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                {item.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: '800', color: overviewValueColor, lineHeight: 1 }}>
                  {item.value}
                </div>
                <div style={{ color: overviewTitleColor, fontSize: '0.95rem', fontWeight: '600' }}>
                  {item.description}
                </div>
              </div>
            </div>

            <div style={{
              position: 'absolute',
              left: '0',
              bottom: '0',
              width: '140px',
              height: '5px',
              borderRadius: '0 999px 999px 0',
              background: item.color,
              boxShadow: `0 0 18px ${item.color}66`,
            }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: '50px', flexWrap: 'wrap' }}>
        <div style={{
          flex: '0 1 640px',
          width: 'min(100%, 640px)',
          minWidth: '1200px',
          borderRadius: '18px',
          padding: '22px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          ...reportPanelStyle,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(37, 99, 235, 0.1)',
              color: isDark ? '#34d399' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileText size={22} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: '700', color: panelTitleColor }}>
                Manager Reports &amp; Analytics
              </h3>
              <div style={{ color: panelMutedColor, fontSize: '0.82rem', marginTop: '8px' }}>
                Current scope: {filteredBookings.length} booking{filteredBookings.length === 1 ? '' : 's'} | {reportRangeLabel}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading || filteredBookings.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: loading || filteredBookings.length === 0 ? 'rgba(59, 130, 246, 0.45)' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              padding: '14px 22px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: loading || filteredBookings.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: loading || filteredBookings.length === 0 ? 'none' : '0 14px 28px rgba(59, 130, 246, 0.24)',
            }}
          >
            <Download size={18} />
            Generate Report
          </button>
        </div>

        {!showFilters && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 auto' }}>
            <button
              onClick={() => setShowFilters(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: '40px',
              }}
            >
              <Filter size={16} />
              {`Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div style={{
          borderRadius: '18px',
          padding: '24px',
          color: 'var(--text-primary)',
          ...reportPanelStyle,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Filter Bookings</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Narrow the booking review list by requester, status, resource, date, or check-in state.
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.92rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(event) => handleFilterChange('query', event.target.value)}
                  placeholder="Requester, resource, ID"
                  style={{ ...filterInputStyle, paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(event) => handleFilterChange('status', event.target.value)}
                style={filterInputStyle}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Resource
              </label>
              <select
                value={filters.resource}
                onChange={(event) => handleFilterChange('resource', event.target.value)}
                style={filterInputStyle}
              >
                <option value="ALL">All Resources</option>
                {resourceOptions.map((resourceName) => (
                  <option key={resourceName} value={resourceName}>{resourceName}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Check-In
              </label>
              <select
                value={filters.checkIn}
                onChange={(event) => handleFilterChange('checkIn', event.target.value)}
                style={filterInputStyle}
              >
                <option value="ALL">All Check-In States</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="NOT_CHECKED_IN">Not Checked In</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Booking Date
              </label>
              <input
                type="date"
                value={filters.bookingDate}
                onChange={(event) => handleFilterChange('bookingDate', event.target.value)}
                style={filterInputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={clearFilters}
              style={{
                background: 'var(--bg-alt)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>

            <button
              onClick={() => setShowFilters(false)}
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div style={activeCardStyle}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading...</div>
          ) : loadError ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Couldn&apos;t Load Bookings</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{loadError}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>No Bookings to Review</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>No bookings match these filters</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>Try changing the filter values or reset them to see the full review queue.</p>
              <button
                onClick={clearFilters}
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.995rem' }}>
                    <th style={{ padding: '16px' }}>Request ID</th>
                    <th style={{ padding: '16px' }}>Requester</th>
                    <th style={{ padding: '16px' }}>Resource</th>
                    <th style={{ padding: '16px' }}>Date</th>
                    <th style={{ padding: '16px' }}>Time Slot</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(bk => (
                    <tr key={bk.id} style={{ borderBottom: '1px solid var(--border-color)', background: bk.status === 'PENDING' ? 'var(--bg-color)' : 'transparent' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>{bk.id}</td>
                      <td style={{ padding: '16px' }}>{bk.userName}</td>
                      <td style={{ padding: '16px' }}>{bk.resourceName}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{bk.bookingDate}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{formatBookingRange(bk.startTime, bk.endTime)}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          ...getBookingStatusTone(bk.status),
                        }}>
                          {getBookingStatusLabel(bk.status)}
                        </span>
                        {bk.checkedIn && (
                          <div style={{ marginTop: '6px', fontSize: '0.74rem', fontWeight: '600', color: '#166534' }}>
                            Checked in
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                         <button 
                           onClick={() => setSelectedBooking(bk)}
                           style={{ background: 'var(--bg-alt)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                         >
                           View Details →
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <div style={activeCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Recent Booking Audit</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Shows the latest booking actions recorded by this backend.</div>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>No booking audit entries recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogs.map((audit) => (
              <div key={audit.id} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px', display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) minmax(120px, 150px) minmax(150px, 1fr) minmax(220px, 1.3fr)', gap: '14px', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '6px' }}>{audit.action.replaceAll('_', ' ')}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>{audit.bookingId}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{formatAuditTimestamp(audit.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Actor</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{audit.actorEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Booking</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: '600' }}>{audit.resourceName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-word' }}>{audit.bookingUserEmail}</div>
                  <div style={{ fontSize: '0.76rem', color: '#166534', marginTop: '6px', fontWeight: '700' }}>{audit.bookingStatus}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Details</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>{audit.details || 'No details recorded.'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
