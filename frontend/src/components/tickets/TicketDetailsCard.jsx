import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Paperclip, Send } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';

const AuthenticatedImage = ({ name, id }) => {
    const [imgSrc, setImgSrc] = useState(null);

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
                }
            } catch (err) {
                console.error("Failed to load image", err);
            }
        };
        fetchImg();
    }, [id]);

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

export default function TicketDetailsCard({ ticket, onBack }) {
    if (!ticket) return null;

    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await ticketService.getTicketComments(ticket.id);
                setComments(data || []);
            } catch (err) {
                console.error("Failed to fetch comments", err);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [ticket.id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        
        try {
            const newComment = await ticketService.addComment(ticket.id, comment);
            setComments([...comments, newComment]);
            setComment('');
        } catch (err) {
            alert('Failed to post comment');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                <button 
                    onClick={onBack}
                    style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', 
                        alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: '500',
                        padding: '8px 12px', borderRadius: '8px', transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#f8fafc'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                    <ArrowLeft size={18} />
                    Back to List
                </button>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#f8fafc' }}>
                        Ticket #{ticket.id} - {ticket.category}
                    </h3>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>
                        Submitted on {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>{ticket.status}</span>
                    <span style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>{ticket.priority}</span>
                </div>
            </div>

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
                                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No comments yet. Start the conversation!</div>
                            ) : (
                                comments.map((c) => {
                                    const isMe = user?.name === c.authorName;
                                    return (
                                        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', margin: isMe ? '0 12px 0 0' : '0 0 0 12px' }}>
                                                {isMe ? 'You' : c.authorName} • {new Date(c.createdAt).toLocaleString()}
                                            </span>
                                            <div style={{ 
                                                background: isMe ? '#3b82f6' : '#334155', 
                                                color: isMe ? 'white' : '#f8fafc',
                                                padding: '12px 16px', 
                                                borderRadius: '12px', 
                                                borderTopLeftRadius: isMe ? '12px' : '2px', 
                                                borderTopRightRadius: isMe ? '2px' : '12px'
                                            }}>
                                                {c.content}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid #334155', background: '#0f172a', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Type a comment..."
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', outline: 'none', background: '#1e293b', color: '#f8fafc' }}
                                />
                                <button type="submit" style={{ 
                                    background: '#3b82f6', color: 'white', border: 'none', 
                                    padding: '0 20px', borderRadius: '8px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500'
                                }}>
                                    <Send size={18} />
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>

                </div>

                {/* Right Column: Meta Info & Attachments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
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
                                <div style={{ color: '#f8fafc', fontWeight: '500' }}>{ticket.assignedToName || 'Unassigned'}</div>
                            </div>
                        </div>
                    </div>

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
