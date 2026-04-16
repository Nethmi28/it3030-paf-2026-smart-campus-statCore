import { useState, useEffect } from 'react';
import { Search, Filter, LayoutGrid, List, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import ResourceCard from '../../components/resources/ResourceCard';
import { FACULTIES, CAPACITIES } from '../../data/mockResources';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [selectedCapacity, setSelectedCapacity] = useState('All Capacities');

  useEffect(() => {
    fetchResources();
  }, [selectedFaculty, selectedCapacity, user?.token]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/resources`;
      const params = new URLSearchParams();
      
      if (selectedFaculty !== 'All Faculties') params.append('faculty', selectedFaculty);
      if (selectedCapacity !== 'All Capacities') params.append('minCapacity', selectedCapacity);
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch resources');
      
      const data = await response.json();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    return resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           resource.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Campus Resources
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Browse and filter through {filteredResources.length} available facilities
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '16px', 
        padding: '24px',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 48px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-alt)',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Faculty Filter */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <div style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty</div>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-alt)',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option>All Faculties</option>
                {FACULTIES.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Capacity Filter */}
          <div style={{ position: 'relative', width: '200px' }}>
            <div style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min. Capacity</div>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-alt)',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option>All Capacities</option>
                {CAPACITIES.map(cap => (
                  <option key={cap} value={cap}>{cap}+ People</option>
                ))}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedFaculty('All Faculties');
              setSelectedCapacity('All Capacities');
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'white',
              color: '#ef4444',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              alignSelf: 'flex-end',
              height: '46px'
            }}
          >
            Clear All
          </button>
        </div>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '16px' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Fetching resources...</p>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '16px', background: '#fef2f2', borderRadius: '20px', border: '1px solid #fee2e2' }}>
          <AlertCircle size={40} style={{ color: '#ef4444' }} />
          <p style={{ color: '#b91c1c', fontWeight: '500' }}>{error}</p>
          <button onClick={fetchResources} style={{ padding: '8px 16px', borderRadius: '8px', background: 'white', border: '1px solid #fee2e2', cursor: 'pointer' }}>Try Again</button>
        </div>
      ) : filteredResources.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '24px' 
        }}>
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px', 
          background: 'var(--bg-card)', 
          borderRadius: '20px',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          <Filter size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>No resources found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}
