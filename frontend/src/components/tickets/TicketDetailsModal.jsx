import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function TicketDetailsModal({ ticket, onClose }) {
    if (!ticket) return null;

    const [comment, setComment] = useState('');

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        // Call the service to add comment
        alert('Comment functionality to be connected to API: ' + comment);
        setComment('');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--bg-card, #fff)', width: '600px', maxWidth: '90%',
                maxHeight: '80vh', borderRadius: '12px', display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    padding: '16px 24px', borderBottom: '1px solid #e2e8f0', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                        Ticket #{ticket.id} - {ticket.category}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#64748b' }}>Status & Priority</h4>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.875rem' }}>{ticket.status}</span>
                            <span style={{ padding: '4px 8px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.875rem' }}>{ticket.priority}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#64748b' }}>Location</h4>
                        <p style={{ margin: 0 }}>{ticket.locationText || "Not specified"}</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: '#64748b' }}>Description</h4>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                            {ticket.description}
                        </p>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0f172a' }}>Comments</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                            {/* Dummy comments for now until API is fully tied to React View */}
                            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>You • 2 hours ago</div>
                                <div>Ticket created. Awaiting technician assignment.</div>
                            </div>
                        </div>

                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px' }}>
                            <input 
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                            <button type="submit" style={{ 
                                background: '#3b82f6', color: 'white', border: 'none', 
                                padding: '0 16px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center'
                            }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
