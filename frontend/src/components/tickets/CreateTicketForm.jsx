import React, { useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { Camera, AlertCircle, X } from 'lucide-react';

export default function CreateTicketForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        category: 'PLUMBING',
        priority: 'MEDIUM',
        locationText: '',
        description: '',
        preferredContact: ''
    });
    
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 3) {
            setError("You can only upload a maximum of 3 images.");
            return;
        }
        
        setError(null);
        setFiles(prev => [...prev, ...selectedFiles].slice(0, 3));
    };

    const removeFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            await ticketService.createTicket(formData, files);
            setFormData({
                category: 'PLUMBING', priority: 'MEDIUM', 
                locationText: '', description: '', preferredContact: ''
            });
            setFiles([]);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg-card, #fff)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Report an Issue</h3>
            
            {error && (
                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: '0.875rem' }}>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Category</label>
                        <select 
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        >
                            <option value="PLUMBING">Plumbing</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="IT_EQUIPMENT">IT / Equipment</option>
                            <option value="CLEANING">Cleaning</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Priority</label>
                        <select 
                            value={formData.priority} 
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Location (Room / Area)</label>
                    <input 
                        required
                        type="text" 
                        value={formData.locationText} 
                        onChange={(e) => setFormData({...formData, locationText: e.target.value})}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        placeholder="e.g. Block A, Room 102"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Description</label>
                    <textarea 
                        required
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}
                        placeholder="Please describe the issue in detail..."
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Preferred Contact</label>
                    <input 
                        required
                        type="email" 
                        value={formData.preferredContact} 
                        onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        placeholder="Email "
                    />
                </div>

                {/* File Upload Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Attachments (Max 3 Images)</label>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', 
                            background: '#f1f5f9', color: '#475569', borderRadius: '8px', 
                            cursor: files.length >= 3 ? 'not-allowed' : 'pointer', fontWeight: '500' 
                        }}>
                            <Camera size={20} />
                            <span>Upload Images</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                disabled={files.length >= 3} 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }} 
                            />
                        </label>
                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{files.length} / 3 Selected</span>
                    </div>

                    {files.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {files.map((file, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', background: '#e2e8f0', 
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.875rem' 
                                }}>
                                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {file.name}
                                    </span>
                                    <X size={16} cursor="pointer" onClick={() => removeFile(idx)} color="#ef4444" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            background: '#3b82f6', color: 'white', padding: '10px 24px', 
                            borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', 
                            fontWeight: '600', opacity: loading ? 0.7 : 1 
                        }}
                    >
                        {loading ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}
