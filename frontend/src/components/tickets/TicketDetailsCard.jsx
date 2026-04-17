import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MessageSquare, Paperclip, Send, Edit2, Trash2,
    Check, X, UserCheck, RefreshCw, AlertTriangle, MapPin,
    Mail, User, Calendar, Tag, Flag, Clock, CheckCircle,
    XCircle, FileImage, Download, MoreVertical
} from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';

const AuthenticatedImage = ({ name, id }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImg = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8089/api/tickets/attachments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setImgSrc(url);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to load image", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchImg();

        // Cleanup
        return () => {
            if (imgSrc) {
                URL.revokeObjectURL(imgSrc);
            }
        };
    }, [id]);

    if (loading) {
        return (
            <div style={{
                background: '#f1f5f9',
                borderRadius: '12px',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: '#fef2f2',
                borderRadius: '12px',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fee2e2'
            }}>
                <div style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'center' }}>
                    Failed to load<br />{name.length > 20 ? name.substring(0, 20) + '...' : name}
                </div>
            </div>
        );
    }

    const baseName = name.split('.').slice(0, -1).join('.') || name;
    const displayName = baseName.length > 25 ? baseName.substring(0, 25) + '...' : baseName;

    return (
        <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s, box-shadow 0.2s'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}>
            <a href={imgSrc} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                <img
                    src={imgSrc}
                    alt={name}
                    style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        display: 'block',
                        backgroundColor: '#f1f5f9'
                    }}
                />
            </a>
            <div style={{ padding: '10px 12px', textAlign: 'center', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '500', marginBottom: '4px' }}>
                    {displayName}
                </div>
                <a
                    href={imgSrc}
                    download={name}
                    style={{
                        fontSize: '0.65rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        textDecoration: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <Download size={12} /> Download
                </a>
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
    const isStudent = user?.role === 'ROLE_STUDENT';
    const isTicketOwner = ticket.reportedById === user?.id;
    const isAssignedTechnician = ticket.assignedToId === user?.id;

    const getStatusConfig = (status) => {
        const configs = {
            'OPEN': { bg: '#e0f2fe', text: '#0369a1', icon: <AlertTriangle size={14} />, label: 'Open', border: '#bae6fd' },
            'IN_PROGRESS': { bg: '#fef3c7', text: '#b45309', icon: <Clock size={14} />, label: 'In Progress', border: '#fde68a' },
            'RESOLVED': { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={14} />, label: 'Resolved', border: '#bbf7d0' },
            'CLOSED': { bg: '#f1f5f9', text: '#475569', icon: <XCircle size={14} />, label: 'Closed', border: '#e2e8f0' },
            'REJECTED': { bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={14} />, label: 'Rejected', border: '#fecaca' }
        };
        return configs[status] || configs['OPEN'];
    };

    const getPriorityConfig = (priority) => {
        const configs = {
            'LOW': { bg: '#dcfce7', text: '#15803d', label: 'Low', icon: '🟢' },
            'MEDIUM': { bg: '#fef3c7', text: '#b45309', label: 'Medium', icon: '🟠' },
            'HIGH': { bg: '#fee2e2', text: '#b91c1c', label: 'High', icon: '🔴' },
            'CRITICAL': { bg: '#fecaca', text: '#991b1b', label: 'Critical', icon: '🔥' }
        };
        return configs[priority] || configs['MEDIUM'];
    };

    const statusConfig = getStatusConfig(ticket.status);
    const priorityConfig = getPriorityConfig(ticket.priority);

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
        setTechnicians([
            { id: 4, name: "Technician Saman", email: "tcsaman@fcu.lk" },
            { id: 11, name: "Asini", email: "tc23707290@my.cu.lk" },
            { id: 14, name: "Chamal", email: "tc23716896@my.cu.lk" }
        ]);
    };

    useEffect(() => {
        fetchComments();
        fetchTechnicians();
        setSelectedStatus(ticket.status);
    }, [ticket.id]);

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

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await ticketService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete comment");
        }
    };

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
            default: break;
        }
        return options;
    };

    const canUpdateStatus = isTechnician || isAdminOrManager;
    const canAssignTechnician = isAdminOrManager && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED';
    const canReject = isAdminOrManager && ticket.status === 'OPEN';
    const canDelete = (isStudent && isTicketOwner && ticket.status === 'OPEN') || isAdminOrManager;
    const canComment = true;

    const DetailItem = ({ icon, label, value, color = '#64748b' }) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ color: color, marginTop: '2px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>{value || 'Not provided'}</div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0' }}>

            {/* Header Section with Gradient */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '16px 16px 0 0',
                padding: '24px 28px',
                marginBottom: '0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            color: '#cbd5e1',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#cbd5e1'; }}
                    >
                        <ArrowLeft size={18} />

                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {canDelete && (
                            <button onClick={handleDeleteTicket} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Trash2 size={14} />
                                {isStudent && ticket.status === 'OPEN' ? 'Cancel Ticket' : 'Delete Ticket'}
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500', marginBottom: '8px' }}>Ticket {ticket.id}</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {ticket.category}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.875rem', color: '#cbd5e1' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={16} /> {ticket.reportedByName}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} /> {new Date(ticket.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '4px' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 18px', borderRadius: '24px',
                            background: statusConfig.bg, color: statusConfig.text,
                            fontSize: '0.8rem', fontWeight: '700',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: `1px solid ${statusConfig.border || 'transparent'}`,
                            transition: 'all 0.2s'
                        }}>
                            {statusConfig.icon} {statusConfig.label}
                        </span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 18px', borderRadius: '24px',
                            background: priorityConfig.bg, color: priorityConfig.text,
                            fontSize: '0.8rem', fontWeight: '700',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>{priorityConfig.icon}</span> {priorityConfig.label} Priority
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '0 0 16px 16px' }}>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '4px solid #dc2626' }}>
                        <AlertTriangle size={18} />
                        <span style={{ fontSize: '0.875rem' }}>{error}</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '28px' }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

{/* Description Card */}
<div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px', color: '#3b82f6' }}>
            <FileImage size={18} />
        </div>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Issue Description</h4>
    </div>
    {/* Render HTML content from TipTap */}
    <div 
        style={{ margin: 0, color: '#334155', lineHeight: '1.7', fontSize: '0.95rem' }}
        dangerouslySetInnerHTML={{ __html: ticket.description }}
    />
</div>

                        {/* Comments Card */}
                        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px', color: '#64748b' }}>
                                    <MessageSquare size={18} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>Discussion ({comments.length})</h4>
                            </div>

                            <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', background: '#faf9f7' }}>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading comments...</div>
                                ) : comments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <MessageSquare size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No comments yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    comments.map((c) => {
                                        const isMe = user?.id === c.authorId;
                                        const canEdit = c.canEdit;
                                        const canDelete = c.canDelete;
                                        const isEditing = editingCommentId === c.id;

                                        return (
                                            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    maxWidth: '85%',
                                                    background: isMe ? '#3b82f6' : 'white',
                                                    color: isMe ? 'white' : '#1e293b',
                                                    padding: '12px 16px',
                                                    borderRadius: '16px',
                                                    borderTopRightRadius: isMe ? '4px' : '16px',
                                                    borderTopLeftRadius: isMe ? '16px' : '4px',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                    border: !isMe ? '1px solid #e2e8f0' : 'none'
                                                }}>
                                                    <div style={{ fontSize: '0.7rem', marginBottom: '6px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontWeight: '600' }}>{isMe ? 'You' : c.authorName}</span>
                                                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                                                        {c.edited && <span style={{ fontStyle: 'italic' }}>(edited)</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', lineHeight: '1.5', wordWrap: 'break-word' }}>
                                                        {c.content}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginRight: isMe ? '8px' : '0', marginLeft: isMe ? '0' : '8px' }}>
                                                    {canEdit && !isEditing && (
                                                        <button onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }} style={{ background: 'none', border: 'none', fontSize: '0.65rem', color: '#64748b', cursor: 'pointer' }}>
                                                            <Edit2 size={12} /> Edit
                                                        </button>
                                                    )}
                                                    {canDelete && !isEditing && (
                                                        <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', fontSize: '0.65rem', color: '#ef4444', cursor: 'pointer' }}>
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    )}
                                                </div>
                                                {isEditing && (
                                                    <div style={{ marginTop: '8px', width: '100%', display: 'flex', gap: '8px' }}>
                                                        <input type="text" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                                                        <button onClick={() => handleEditComment(c.id)} style={{ background: '#22c55e', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}><Check size={14} color="white" /></button>
                                                        <button onClick={() => { setEditingCommentId(null); setEditingContent(''); }} style={{ background: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}><X size={14} color="white" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {(ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && canComment) ? (
                                <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: 'white', borderRadius: '0 0 16px 16px' }}>
                                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '12px' }}>
                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', background: '#f8fafc' }}
                                            disabled={submitting}
                                        />
                                        <button type="submit" disabled={submitting} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '24px', padding: '0 20px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Send size={16} /> Send
                                        </button>
                                    </form>
                                </div>
                            ) : (ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED') ? (
                                <div style={{ padding: '16px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                    You don't have permission to comment on this ticket
                                </div>
                            ) : (
                                <div style={{ padding: '16px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                    Comments are disabled for {ticket.status.toLowerCase()} tickets
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Ticket Details Card */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Tag size={16} color="#3b82f6" /> Ticket Information
                            </h4>
                            <DetailItem icon={<MapPin size={16} />} label="Location" value={ticket.locationText} color="#3b82f6" />
                            <DetailItem icon={<Mail size={16} />} label="Preferred Contact" value={ticket.preferredContact} color="#3b82f6" />
                            <DetailItem
                                icon={<UserCheck size={16} />}
                                label="Assigned Technician"
                                value={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span>{ticket.assignedToName || 'Unassigned'}</span>
                                        {canAssignTechnician && (
                                            <>
                                                <select value={selectedTechnicianId} onChange={(e) => setSelectedTechnicianId(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', background: 'white' }}>
                                                    <option value="">Select Tech</option>
                                                    {technicians.map(tech => (<option key={tech.id} value={tech.id}>{tech.name}</option>))}
                                                </select>
                                                <button onClick={handleAssignTechnician} disabled={assigningTech || !selectedTechnicianId} style={{ background: '#3b82f6', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.7rem', color: 'white', cursor: 'pointer' }}>Assign</button>
                                            </>
                                        )}
                                    </div>
                                }
                            />
                            {ticket.resolutionNotes && <DetailItem icon={<CheckCircle size={16} />} label="Resolution Notes" value={ticket.resolutionNotes} color="#22c55e" />}
                            {ticket.rejectedReason && <DetailItem icon={<XCircle size={16} />} label="Rejection Reason" value={ticket.rejectedReason} color="#dc2626" />}
                        </div>

                        {/* Update Status Card */}
                        {canUpdateStatus && (
                            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RefreshCw size={16} color="#22c55e" /> Update Status
                                </h4>
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '12px' }}>
                                    {getStatusOptions().map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                </select>
                                {selectedStatus === 'RESOLVED' && (
                                    <textarea placeholder="Add resolution notes..." value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '12px', minHeight: '80px' }} />
                                )}
                                <button onClick={handleStatusUpdate} disabled={updatingStatus} style={{ width: '100%', background: '#22c55e', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <RefreshCw size={14} /> Update Status
                                </button>
                            </div>
                        )}

                        {/* Reject Ticket Card */}
                        {canReject && (
                            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <XCircle size={16} color="#dc2626" /> Reject Ticket
                                </h4>
                                <button onClick={handleRejectTicket} style={{ width: '100%', background: '#dc2626', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <X size={14} /> Reject Ticket
                                </button>
                            </div>
                        )}

                        {/* Attachments Card - IMPROVED GRID VERSION */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Paperclip size={16} color="#8b5cf6" /> Attachments ({ticket.attachmentNames?.length || 0})
                            </h4>
                            {(!ticket.attachmentNames || ticket.attachmentNames.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <Paperclip size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
                                    <p>No attachments uploaded</p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {ticket.attachmentNames.map((name, index) => {
                                        const id = ticket.attachmentIds[index];
                                        const isImage = name.match(/\.(jpeg|jpg|gif|png|webp|jfif)$/i) != null;
                                        return isImage ? (
                                            <AuthenticatedImage key={index} id={id} name={name} />
                                        ) : (
                                            <a href={`http://localhost:8089/api/tickets/attachments/${id}`} target="_blank" rel="noreferrer" key={index} style={{ textDecoration: 'none' }}>
                                                <div style={{
                                                    padding: '16px',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    cursor: 'pointer',
                                                    background: '#f8fafc',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'center'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#eff6ff';
                                                        e.currentTarget.style.borderColor = '#3b82f6';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#f8fafc';
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                    }}>
                                                    <FileImage size={32} color="#3b82f6" />
                                                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', wordBreak: 'break-word' }}>
                                                        {name.length > 30 ? name.substring(0, 30) + '...' : name}
                                                    </span>
                                                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Click to view</span>
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
        </div>
    );
}