import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Paperclip, Send, Edit2, Trash2, Check, X, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';

const AuthenticatedImage = ({ name, id }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchImg = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8089/api/tickets/attachments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    setImgSrc(URL.createObjectURL(blob));
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to load image", err);
                setError(true);
            }
        };
        fetchImg();
    }, [id]);

    if (error) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>Failed to load image</div>;
    }

    if (!imgSrc) return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>Loading image...</div>;

    const baseName = name.split('.').slice(0, -1).join('.') || name;

    return (
        <div style={{ background: '#1e293b', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <a href={imgSrc} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                <img src={imgSrc} alt={name} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
            </a>
            <div style={{ padding: '12px', textAlign: 'center', color: '#60a5fa', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {baseName}
            </div>
        </div>
    );
};

export default function TicketDetailsCard({ ticket, onBack, onTicketUpdate }) {
    if (!ticket) return null;

    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(ticket.status);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [assigningTech, setAssigningTech] = useState(false);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [technicians, setTechnicians] = useState([]);
    const [error, setError] = useState(null);
    const [showResolutionInput, setShowResolutionInput] = useState(false);

    const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';
    const isTechnician = user?.role === 'ROLE_TECHNICIAN';
    const isTicketOwner = ticket.reportedById === user?.id;
    const isAssignedTechnician = ticket.assignedToId === user?.id;

    // Fetch comments
    const fetchComments = async () => {
        try {
            const data = await ticketService.getTicketComments(ticket.id);
            setComments(data || []);
        } catch (err) {
            console.error("Failed to fetch comments", err);
            setError(err.response?.data?.message || "Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

   // Fetch technicians for assignment (Admin/Manager only)
const fetchTechnicians = async () => {
    if (!isAdminOrManager) return;
    
    // Hardcoded technicians from your users table
    setTechnicians([
        { id: 4, name: "Technician Saman", email: "tcsaman@fcu.lk" }
        // Add more technicians here if you add them later
    ]);
};

    useEffect(() => {
        fetchComments();
        fetchTechnicians();
        setSelectedStatus(ticket.status);
    }, [ticket.id]);

    // Handle comment submit
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        
        setSubmitting(true);
        setError(null);
        try {
            const newComment = await ticketService.addComment(ticket.id, comment);
            setComments([...comments, newComment]);
            setComment('');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle comment edit
    const handleEditComment = async (commentId) => {
        if (!editingContent.trim()) return;
        try {
            const updated = await ticketService.updateComment(commentId, editingContent);
            setComments(comments.map(c => c.id === commentId ? updated : c));
            setEditingCommentId(null);
            setEditingContent('');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to edit comment");
        }
    };

    // Handle comment delete
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await ticketService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete comment");
        }
    };

    // Handle status update
    const handleStatusUpdate = async () => {
        setUpdatingStatus(true);
        setError(null);
        try {
            const updated = await ticketService.updateTicketStatus(ticket.id, selectedStatus, resolutionNotes);
            onTicketUpdate?.();
            setShowResolutionInput(false);
            setResolutionNotes('');
            ticket.status = updated.status;
            ticket.resolutionNotes = updated.resolutionNotes;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Handle technician assignment
    const handleAssignTechnician = async () => {
        if (!selectedTechnicianId) return;
        setAssigningTech(true);
        setError(null);
        try {
            const updated = await ticketService.assignTicket(ticket.id, parseInt(selectedTechnicianId));
            ticket.assignedToId = updated.assignedToId;
            ticket.assignedToName = updated.assignedToName;
            ticket.status = updated.status;
            onTicketUpdate?.();
            setSelectedTechnicianId('');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to assign technician");
        } finally {
            setAssigningTech(false);
        }
    };

    // Handle ticket rejection
    const handleRejectTicket = async () => {
        const reason = prompt('Please provide a rejection reason:');
        if (!reason) return;
        try {
            const updated = await ticketService.rejectTicket(ticket.id, reason);
            ticket.status = updated.status;
            ticket.rejectedReason = updated.rejectedReason;
            onTicketUpdate?.();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reject ticket");
        }
    };

    // Handle ticket deletion
    const handleDeleteTicket = async () => {
        if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
        try {
            await ticketService.deleteTicket(ticket.id);
            onBack();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete ticket");
        }
    };

    const getStatusOptions = () => {
        const current = ticket.status;
        const options = [{ value: current, label: current }];
        
        switch (current) {
            case 'OPEN':
                options.push({ value: 'IN_PROGRESS', label: 'IN_PROGRESS' });
                options.push({ value: 'REJECTED', label: 'REJECTED' });
                break;
            case 'IN_PROGRESS':
                options.push({ value: 'RESOLVED', label: 'RESOLVED' });
                options.push({ value: 'OPEN', label: 'OPEN' });
                break;
            case 'RESOLVED':
                options.push({ value: 'CLOSED', label: 'CLOSED' });
                options.push({ value: 'IN_PROGRESS', label: 'IN_PROGRESS' });
                break;
            default:
                break;
        }
        return options;
    };

    const canUpdateStatus = (isTechnician && isAssignedTechnician) || isAdminOrManager;
    const canAssignTechnician = isAdminOrManager && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED';
    const canReject = isAdminOrManager && ticket.status === 'OPEN';
    const canDelete = isAdminOrManager;
    const canComment = (isTicketOwner) || (isTechnician && isAssignedTechnician) || isAdminOrManager;
    const isCommentEditable = (commentAuthorId) => {
        return commentAuthorId === user?.id || isAdminOrManager;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                    onClick={onBack}
                    style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', 
                        alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: '500',
                        padding: '8px 12px', borderRadius: '8px', transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                    <ArrowLeft size={18} />
                    Back to List
                </button>
                
                {canDelete && (
                    <button 
                        onClick={handleDeleteTicket}
                        style={{ 
                            background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', 
                            alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '500',
                            padding: '8px 12px', borderRadius: '8px'
                        }}
                    >
                        <Trash2 size={18} />
                        Delete Ticket
                    </button>
                )}
                
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#f8fafc' }}>
                        Ticket #{ticket.id} - {ticket.category}
                    </h3>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>
                        Submitted by {ticket.reportedByName} on {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ 
                        padding: '6px 12px', 
                        background: ticket.status === 'OPEN' ? '#e0f2fe' : 
                                  ticket.status === 'IN_PROGRESS' ? '#fef3c7' :
                                  ticket.status === 'RESOLVED' ? '#dcfce7' :
                                  ticket.status === 'CLOSED' ? '#f3f4f6' : '#fee2e2',
                        color: ticket.status === 'OPEN' ? '#0ea5e9' : 
                               ticket.status === 'IN_PROGRESS' ? '#d97706' :
                               ticket.status === 'RESOLVED' ? '#22c55e' :
                               ticket.status === 'CLOSED' ? '#6b7280' : '#ef4444',
                        borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' 
                    }}>
                        {ticket.status}
                    </span>
                    <span style={{ 
                        padding: '6px 12px', 
                        background: ticket.priority === 'LOW' ? '#dcfce7' :
                                  ticket.priority === 'MEDIUM' ? '#fef3c7' :
                                  ticket.priority === 'HIGH' ? '#fee2e2' : '#fecaca',
                        color: ticket.priority === 'LOW' ? '#22c55e' :
                               ticket.priority === 'MEDIUM' ? '#d97706' :
                               ticket.priority === 'HIGH' ? '#ef4444' : '#dc2626',
                        borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' 
                    }}>
                        {ticket.priority}
                    </span>
                </div>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '0.875rem' }}>{error}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
                {/* Left Column: Description & Comments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Description Block */}
                    <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '20px', background: '#1e293b' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#f8fafc' }}>Description</h4>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#cbd5e1', lineHeight: '1.6' }}>
                            {ticket.description}
                        </p>
                    </div>

                    {/* Comments Block */}
                    <div style={{ border: '1px solid #334155', borderRadius: '12px', display: 'flex', flexDirection: 'column', flex: 1, background: '#1e293b' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18} color="#94a3b8" />
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Discussion Activity</h4>
                        </div>
                        
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading comments...</div>
                            ) : comments.length === 0 ? (
                                <div style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center' }}>
                                    No comments yet. Start the conversation!
                                </div>
                            ) : (
                                comments.map((c) => {
                                    const isMe = user?.id === c.authorId;
                                    const canEdit = isCommentEditable(c.authorId);
                                    const canDelete = isCommentEditable(c.authorId);
                                    const isEditing = editingCommentId === c.id;
                                    
                                    return (
                                        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isMe ? 'flex-end' : 'flex-start', width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {isMe ? 'You' : c.authorName} • {new Date(c.createdAt).toLocaleString()}
                                                    {c.edited && <span style={{ marginLeft: '4px', fontStyle: 'italic' }}>(edited)</span>}
                                                </span>
                                                {canEdit && !isEditing && (
                                                    <button onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                                                        <Edit2 size={12} color="#60a5fa" />
                                                    </button>
                                                )}
                                                {canDelete && !isEditing && (
                                                    <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                                                        <Trash2 size={12} color="#ef4444" />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {isEditing ? (
                                                <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                                                    <input 
                                                        type="text"
                                                        value={editingContent}
                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
                                                    />
                                                    <button onClick={() => handleEditComment(c.id)} style={{ background: '#22c55e', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>
                                                        <Check size={14} color="white" />
                                                    </button>
                                                    <button onClick={() => { setEditingCommentId(null); setEditingContent(''); }} style={{ background: '#ef4444', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>
                                                        <X size={14} color="white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ 
                                                    background: isMe ? '#3b82f6' : '#334155', 
                                                    color: isMe ? 'white' : '#f8fafc',
                                                    padding: '12px 16px', 
                                                    borderRadius: '12px', 
                                                    borderTopLeftRadius: isMe ? '12px' : '2px', 
                                                    borderTopRightRadius: isMe ? '2px' : '12px',
                                                    maxWidth: '80%',
                                                    wordWrap: 'break-word'
                                                }}>
                                                    {c.content}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {(ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && canComment) ? (
                            <div style={{ padding: '16px', borderTop: '1px solid #334155', background: '#0f172a', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '12px' }}>
                                    <input 
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Type a comment..."
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', outline: 'none', background: '#1e293b', color: '#f8fafc' }}
                                        disabled={submitting}
                                    />
                                    <button type="submit" disabled={submitting} style={{ 
                                        background: '#3b82f6', color: 'white', border: 'none', 
                                        padding: '0 20px', borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500',
                                        opacity: submitting ? 0.7 : 1
                                    }}>
                                        <Send size={18} />
                                        Send
                                    </button>
                                </form>
                            </div>
                        ) : (ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED') ? (
                            <div style={{ padding: '16px', borderTop: '1px solid #334155', background: '#0f172a', textAlign: 'center', color: '#64748b' }}>
                                You don't have permission to comment on this ticket
                            </div>
                        ) : (
                            <div style={{ padding: '16px', borderTop: '1px solid #334155', background: '#0f172a', textAlign: 'center', color: '#64748b' }}>
                                Comments are disabled for {ticket.status.toLowerCase()} tickets
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Meta Info & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Ticket Details */}
                    <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '20px', background: '#1e293b' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#f8fafc' }}>Ticket Details</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Location</div>
                                <div style={{ color: '#f8fafc', fontWeight: '500' }}>{ticket.locationText || 'Not provided'}</div>
                            </div>
                            
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Preferred Contact</div>
                                <div style={{ color: '#f8fafc', fontWeight: '500' }}>{ticket.preferredContact || 'Not provided'}</div>
                            </div>
                            
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Assigned Technician</div>
                                <div style={{ color: '#f8fafc', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    {ticket.assignedToName || 'Unassigned'}
                                    {canAssignTechnician && (
                                        <>
                                            <select 
                                                value={selectedTechnicianId}
                                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                                style={{ padding: '6px', borderRadius: '4px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}
                                            >
                                                <option value="">Select Tech</option>
                                                {technicians.map(tech => (
                                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                                ))}
                                            </select>
                                            <button onClick={handleAssignTechnician} disabled={assigningTech || !selectedTechnicianId} style={{ background: '#3b82f6', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.7rem', color: 'white' }}>
                                                Assign
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {ticket.resolutionNotes && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Resolution Notes</div>
                                    <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>{ticket.resolutionNotes}</div>
                                </div>
                            )}

                            {ticket.rejectedReason && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Rejection Reason</div>
                                    <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{ticket.rejectedReason}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Update Status Section */}
                    {canUpdateStatus && (
                        <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '20px', background: '#1e293b' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#f8fafc' }}>Update Status</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <select 
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
                                >
                                    {getStatusOptions().map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                
                                {selectedStatus === 'RESOLVED' && (
                                    <textarea
                                        placeholder="Add resolution notes..."
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', minHeight: '80px' }}
                                    />
                                )}
                                
                                <button 
                                    onClick={handleStatusUpdate}
                                    disabled={updatingStatus}
                                    style={{ 
                                        background: '#22c55e', color: 'white', border: 'none', 
                                        padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        opacity: updatingStatus ? 0.7 : 1
                                    }}
                                >
                                    <RefreshCw size={16} />
                                    Update Status
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reject Ticket Section */}
                    {canReject && (
                        <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '20px', background: '#1e293b' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#f8fafc' }}>Reject Ticket</h4>
                            <button 
                                onClick={handleRejectTicket}
                                style={{ 
                                    background: '#ef4444', color: 'white', border: 'none', 
                                    padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    width: '100%'
                                }}
                            >
                                <X size={16} />
                                Reject Ticket
                            </button>
                        </div>
                    )}

                    {/* Attachments Section */}
                    <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '20px', background: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Paperclip size={18} color="#94a3b8" />
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Attachments</h4>
                        </div>
                        
                        {(!ticket.attachmentNames || ticket.attachmentNames.length === 0) ? (
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                No attachments uploaded.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {ticket.attachmentNames.map((name, index) => {
                                    const id = ticket.attachmentIds[index];
                                    const url = `http://localhost:8089/api/tickets/attachments/${id}`;
                                    const isImage = name.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;

                                    return isImage ? (
                                        <AuthenticatedImage key={index} id={id} name={name} />
                                    ) : (
                                        <a href={url} target="_blank" rel="noreferrer" key={index} style={{ textDecoration: 'none' }}>
                                            <div style={{ padding: '8px 12px', border: '1px solid #334155', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#0f172a' }}>
                                                <Paperclip size={14} color="#3b82f6" />
                                                <span style={{ fontSize: '0.875rem', color: '#60a5fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}