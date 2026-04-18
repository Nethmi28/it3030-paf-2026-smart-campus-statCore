import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, MoreVertical, Layers, MapPin, Users, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ResourceFormModal from '../../../components/admin/ResourceFormModal';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:8089';

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1600px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem'
  },
  addButton: {
    background: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  card: {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
  },
  tableActions: {
    padding: '24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    gap: '20px',
    flexWrap: 'wrap'
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-alt)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '16px 32px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    background: 'var(--bg-alt)',
    borderBottom: '1px solid var(--border-color)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  td: {
    padding: '20px 32px',
    fontSize: '0.95rem',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  },
  statusBadge: (status) => {
    const isAvailable = status === 'Available';
    const isMaintenance = status === 'Maintenance';
    const isUnavailable = status === 'Unavailable' || status === 'Out of Service';

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 16px',
      borderRadius: '8px',
      fontSize: '0.75rem',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      minWidth: '100px',
      background: isAvailable ? '#dcfce7' : isMaintenance ? '#fef3c7' : '#fee2e2',
      color: isAvailable ? '#166534' : isMaintenance ? '#92400e' : '#991b1b',
      border: '1px solid transparent'
    };
  },
  actionButton: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'zoom-in',
    border: '2px solid var(--border-color)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease'
  },
  thumbnailHover: {
    transform: 'scale(1.15)'
  },
  previewModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '40px',
    cursor: 'pointer'
  },
  previewImage: {
    maxWidth: '90%',
    maxHeight: '90vh',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    objectFit: 'contain',
    border: '4px solid white',
    animation: 'modalFadeIn 0.3s ease-out'
  }
};

const ModalFadeIn = `
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

export default function ManageResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: 'All', type: 'All', faculty: 'All' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: () => {} });

  const fetchResources = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/resources`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      });
      if (!resp.ok) throw new Error('Failed to fetch resources');
      const data = await resp.json();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [user?.token]);

  const handleOpenModal = (resource = null) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleSave = async (formData, imageFile) => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('resource', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      if (imageFile) {
        data.append('image', imageFile);
      }

      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id 
        ? `${API_BASE}/api/resources/${formData.id}` 
        : `${API_BASE}/api/resources`;

      const resp = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: data
      });

      if (!resp.ok) throw new Error('Failed to save resource');
      
      await fetchResources();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Resource',
      message: 'Are you sure you want to permanently delete this resource? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const resp = await fetch(`${API_BASE}/api/resources/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });

          if (!resp.ok) throw new Error('Failed to delete resource');
          
          setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  const uniqueTypes = ['All', ...new Set(resources.map(r => r.type))];
  const uniqueFaculties = ['All', ...new Set(resources.map(r => r.faculty))];

  const filteredResources = resources.filter(res => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.faculty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'All' || 
      (filters.status === 'Active' ? res.status === 'Available' : res.status === filters.status);
    const matchesType = filters.type === 'All' || res.type === filters.type;
    const matchesFaculty = filters.faculty === 'All' || res.faculty === filters.faculty;

    return matchesSearch && matchesStatus && matchesType && matchesFaculty;
  });

  const getImageUrl = (url, type, name) => {
    if (!url) {
      const lowerName = name?.toLowerCase() || '';
      if (type === 'TRANSPORTATION') {
        return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400';
      }
      if (lowerName.includes('basketball')) {
        return 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=400';
      }
      if (lowerName.includes('volleyball')) {
        return 'https://images.unsplash.com/photo-1592656094267-764a45159577?auto=format&fit=crop&q=80&w=400';
      }
      if (lowerName.includes('carrom')) {
        return 'https://images.unsplash.com/photo-1577748651212-32abb372993d?auto=format&fit=crop&q=80&w=400';
      }
      if (lowerName.includes('chess')) {
        return 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&q=80&w=400';
      }
      if (lowerName.includes('badminton')) {
        return 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=400';
      }
      return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400';
    }
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  const filterSelectStyle = {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '100%',
    cursor: 'pointer',
    outline: 'none'
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Manage Resources</h2>
          <p style={styles.subtitle}>Add, edit, and manage campus facilities</p>
        </div>
        <button 
          style={styles.addButton}
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Add Resource
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.tableActions}>
          <div style={styles.searchContainer}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, type or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              style={{ 
                ...styles.actionButton, 
                gap: '8px', 
                padding: '10px 20px',
                background: showFilters ? 'var(--bg-alt)' : 'var(--bg-card)',
                borderColor: showFilters ? 'var(--accent)' : 'var(--border-color)',
                color: showFilters ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: '600'
              }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filters
            </button>
            <button 
              style={{ ...styles.actionButton, gap: '8px', padding: '10px 16px' }}
              onClick={fetchResources}
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={{ 
            padding: '24px 32px', 
            background: 'var(--bg-alt)', 
            borderBottom: '1px solid var(--border-color)',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>Filter Resources</h4>
              <button 
                onClick={() => setShowFilters(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                Close
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  style={filterSelectStyle}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  style={filterSelectStyle}
                >
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type === 'All' ? 'All Types' : type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty</label>
                <select 
                  value={filters.faculty}
                  onChange={(e) => setFilters({...filters, faculty: e.target.value})}
                  style={filterSelectStyle}
                >
                  {uniqueFaculties.map(faculty => (
                    <option key={faculty} value={faculty}>{faculty === 'All' ? 'All Faculties' : faculty}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setFilters({ status: 'All', type: 'All', faculty: 'All' })}
                style={{ 
                  padding: '10px 20px', borderRadius: '10px', background: 'transparent', 
                  border: '1px solid var(--border-color)', color: 'var(--text-primary)',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                style={{ 
                  padding: '10px 32px', borderRadius: '10px', background: 'var(--accent)', 
                  border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Resource</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Capacity</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Loading resources...</div>
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>No resources found.</div>
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => (
                  <tr key={res.id} style={{ transition: 'background 0.2s' }}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div 
                          style={{
                            ...styles.thumbnailWrapper,
                            borderColor: hoveredId === res.id ? '#3b82f6' : 'var(--border-color)',
                            transform: hoveredId === res.id ? 'translateY(-2px)' : 'none'
                          }}
                          onMouseEnter={() => setHoveredId(res.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => setPreviewImage(getImageUrl(res.imageUrl, res.type, res.name))}
                        >
                          <img 
                            src={getImageUrl(res.imageUrl, res.type, res.name)} 
                            alt={res.name}
                            style={{
                              ...styles.thumbnailImg,
                              ...(hoveredId === res.id ? styles.thumbnailHover : {})
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getImageUrl(null, res.type, res.name);
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>{res.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>{res.faculty}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--bg-alt)', padding: '4px 8px', borderRadius: '6px' }}>
                        {res.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} />
                        {res.location}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <Users size={14} color="#3b82f6" />
                        {res.capacity}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(res.status)}>
                        {res.status === 'Available' ? 'AVAILABLE' : res.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          style={styles.actionButton}
                          title="Edit"
                          onClick={() => handleOpenModal(res)}
                        >
                          <Edit2 size={16} color="#3b82f6" />
                        </button>
                        <button 
                          style={styles.actionButton}
                          title="Delete"
                          onClick={() => handleDelete(res.id)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ResourceFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        resource={selectedResource}
        loading={isSaving}
      />

      <ConfirmationModal 
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {previewImage && (
        <div 
          style={styles.previewModal}
          onClick={() => setPreviewImage(null)}
        >
          <style>{ModalFadeIn}</style>
          <img 
            src={previewImage} 
            alt="Preview" 
            style={styles.previewImage}
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              background: 'white',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
