import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Save, Info, Users, MapPin, Building2, Layers } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  content: {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)'
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: 'var(--bg-card)',
    zIndex: 10
  },
  body: {
    padding: '32px'
  },
  footer: {
    padding: '24px 32px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    position: 'sticky',
    bottom: 0,
    background: 'var(--bg-card)',
    zIndex: 10
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s, ring 0.2s',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    minHeight: '100px',
    resize: 'vertical'
  },
  amenityChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'var(--bg-alt)',
    borderRadius: '99px',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    marginBottom: '8px',
    marginRight: '8px'
  },
  uploadArea: {
    border: '2px dashed var(--border-color)',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'var(--bg-alt)'
  },
  preview: {
    width: '100%',
    height: '200px',
    borderRadius: '12px',
    objectFit: 'cover',
    marginTop: '16px'
  }
};

const FACULTIES = [
  'Faculty of Computing',
  'Business School',
  'Faculty of Engineering',
  'Faculty of Humanities & science',
  'School of architecture',
  'Sports equipments',
  'Student Services',
  'General'
];

const RESOURCE_TYPES = [
  'LECTURE ROOM',
  'LAB',
  'EQUIPMENT_ROOM',
  'EQUIPMENTS',
  'FACILITY',
  'TRANSPORTATION',
  'LIBRARY',
  'AUDITORIUM',
  'SPORTS_FACILITY'
];

const STATUS_OPTIONS = [
  'Available',
  'Unavailable',
  'Maintenance',
  'Out of Service'
];

export default function ResourceFormModal({ isOpen, onClose, onSave, resource, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE ROOM',
    faculty: FACULTIES[0],
    location: '',
    capacity: 0,
    status: 'Available',
    description: '',
    amenities: [],
    imageUrl: ''
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        ...resource,
        amenities: resource.amenities || []
      });
      setImagePreview(resource.imageUrl);
    } else {
      setFormData({
        name: '',
        type: 'LECTURE ROOM',
        faculty: FACULTIES[0],
        location: '',
        capacity: 0,
        status: 'Available',
        description: '',
        amenities: [],
        imageUrl: ''
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmAction = () => {
    onSave(formData, imageFile);
    setShowConfirm(false);
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={e => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '10px' }}>
              {resource ? <Save size={20} /> : <Plus size={20} />}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {resource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={modalStyles.body}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Resource Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science Lab A"
                  required
                  style={modalStyles.input}
                />
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Resource Type</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  style={modalStyles.select}
                >
                  {RESOURCE_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Faculty</label>
                <select 
                  name="faculty" 
                  value={formData.faculty} 
                  onChange={handleChange}
                  style={modalStyles.select}
                >
                  {FACULTIES.map(faculty => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Building A, Floor 2"
                    required
                    style={{ ...modalStyles.input, paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Capacity</label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="0"
                    style={{ ...modalStyles.input, paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  style={modalStyles.select}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the resource..."
                style={modalStyles.textarea}
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Amenities</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                  placeholder="Add amenity (e.g. Projector, AC)"
                  style={{ ...modalStyles.input, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', width: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} style={modalStyles.amenityChip}>
                    {amenity}
                    <X 
                      size={12} 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleRemoveAmenity(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Resource Image</label>
              <div 
                style={modalStyles.uploadArea}
                onClick={() => document.getElementById('resourceImageInput').click()}
              >
                <Upload size={32} style={{ color: '#3b82f6', marginBottom: '12px' }} />
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Click to upload or drag and drop</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG, WEBP up to 5MB</div>
                <input
                  id="resourceImageInput"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              {imagePreview && (
                <div style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="Preview" style={modalStyles.preview} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setImageFile(null);
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    style={{ position: 'absolute', top: '24px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={modalStyles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>

        <ConfirmationModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmAction}
          type={resource ? 'success' : 'info'}
          title={resource ? 'Confirm Update' : 'Confirm Creation'}
          message={resource 
            ? 'Are you sure you want to save the changes to this resource?' 
            : 'Are you sure you want to create this new resource?'}
          confirmLabel={resource ? 'Save Changes' : 'Create Resource'}
        />
      </div>
    </div>
  );
}
