import { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ArrowLeft, CheckCircle, XCircle, Clock, Search, FileText } from 'lucide-react';
import { formatBookingRange } from '../../utils/bookingTime';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:8089';

export default function ManagerBookingsView() {
  const { user } = useAuth();
  const { showToast, showPrompt } = useToast();
  const [bookings, setBookings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadError, setLoadError] = useState('');
<<<<<<< HEAD
  const [checkInCode, setCheckInCode] = useState('');
  const [verifyingCheckIn, setVerifyingCheckIn] = useState(false);
=======
>>>>>>> 2b9eaa12b2e4209a0d02ff722070e0718e530a30

  useEffect(() => {
    if (user?.token) {
      fetchBookings();
    }
  }, [user?.token]);
<<<<<<< HEAD

  useEffect(() => {
    setCheckInCode('');
  }, [selectedBooking?.id]);
=======
>>>>>>> 2b9eaa12b2e4209a0d02ff722070e0718e530a30

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
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>Review Bookings</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage and approve facility reservation requests submitted by students.</div>
        </div>
      </div>

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
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
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
                  {bookings.map(bk => (
                    <tr key={bk.id} style={{ borderBottom: '1px solid var(--border-color)', background: bk.status === 'PENDING' ? 'var(--bg-color)' : 'transparent' }}>
                      <td style={{ padding: '16px', fontWeight: '600' }}>#{bk.id}</td>
                      <td style={{ padding: '16px' }}>{bk.userName}</td>
                      <td style={{ padding: '16px' }}>{bk.resourceName}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{bk.bookingDate}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{formatBookingRange(bk.startTime, bk.endTime)}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                          background: bk.status === 'APPROVED' ? '#dcfce7' : bk.status === 'REJECTED' ? '#fee2e2' : bk.status === 'CANCELLED' ? '#f3f4f6' : '#ffedd5',
                          color: bk.status === 'APPROVED' ? '#166534' : bk.status === 'REJECTED' ? '#991b1b' : bk.status === 'CANCELLED' ? '#4b5563' : '#9a3412',
                        }}>
                          {bk.status === 'APPROVED' ? 'ACCEPTED' : bk.status}
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
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>#{audit.bookingId}</div>
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
