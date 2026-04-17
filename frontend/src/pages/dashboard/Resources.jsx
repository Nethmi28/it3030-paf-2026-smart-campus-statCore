import { useState, useEffect } from 'react';
import { 
  Search, Filter, LayoutGrid, List, ChevronDown, 
  Loader2, AlertCircle, ArrowLeft, GraduationCap,
  BarChart3
} from 'lucide-react';
import ResourceCard from '../../components/resources/ResourceCard';
import FacultyCard from '../../components/resources/FacultyCard';
import ResourceAnalysis from '../../components/resources/ResourceAnalysis';
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
  const [viewMode, setViewMode] = useState(user?.role === 'ROLE_MANAGER' ? 'analysis' : 'overview');

  // Pre-calculate faculty counts
  const facultyCounts = FACULTIES.reduce((acc, faculty) => {
    acc[faculty] = resources.filter(r => r.faculty === faculty).length;
    return acc;
  }, {});

  const handleFacultyClick = (faculty) => {
    setSelectedFaculty(faculty);
    setViewMode('grid');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchResources();
  }, [selectedFaculty, selectedCapacity]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/resources`;
      const params = new URLSearchParams();
      
      if (selectedFaculty !== 'All Faculties') params.append('faculty', selectedFaculty);
      if (selectedCapacity !== 'All Capacities') params.append('minCapacity', selectedCapacity);
      
      if (params.toString()) url += `?${params.toString()}`;

      const headers = { 'Accept': 'application/json' };
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(url, { headers });

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
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100vh' }}>
      
      {/* Dynamic Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {viewMode === 'grid' && (
            <button 
              onClick={() => {
                setViewMode('overview');
                setSelectedFaculty('All Faculties');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginBottom: '16px',
                padding: 0,
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={18} />
              Back to Overview
            </button>
          )}
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {viewMode === 'overview' ? 'Campus Infrastructure' : viewMode === 'analysis' ? 'Resource Analytics' : selectedFaculty}
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>
            {viewMode === 'overview' 
              ? 'Select a faculty starting point to discover specialized spaces'
              : viewMode === 'analysis'
                ? 'High-level insights into facility utilization and health'
                : `Showing ${filteredResources.length} facilities in ${selectedFaculty}`
            }
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
          {user?.role === 'ROLE_MANAGER' && (
            <div style={{ 
              display: 'flex', 
              background: 'var(--bg-alt)', 
              padding: '4px', 
              borderRadius: '14px',
              border: '1px solid var(--border-color)'
            }}>
              {[
                { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={16} /> },
                { id: 'overview', label: 'Faculties', icon: <GraduationCap size={16} /> },
                { id: 'grid', label: 'Catalog', icon: <LayoutGrid size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setViewMode(tab.id);
                    if (tab.id !== 'grid') setSelectedFaculty('All Faculties');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: viewMode === tab.id ? 'var(--bg-card)' : 'transparent',
                    color: viewMode === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                    boxShadow: viewMode === tab.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === 'analysis' ? (
        <ResourceAnalysis resources={resources} />
      ) : viewMode === 'overview' ? (
        /* Overview Mode: Faculty Showcase */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
          gap: '32px',
          marginTop: '12px'
        }}>
          {FACULTIES.filter(f => f !== 'Sports equipments').map(faculty => (
            <FacultyCard 
              key={faculty} 
              faculty={faculty} 
              count={facultyCounts[faculty] || 0}
              onClick={handleFacultyClick}
            />
          ))}
          
          {/* Quick Search / All Resources Card */}
          <div 
            onClick={() => setViewMode('grid')}
            className="glass-card hover-glow"
            style={{
              padding: '40px',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              border: '2px dashed var(--border-color)',
              background: 'transparent'
            }}
          >
            <div style={{ padding: '20px', borderRadius: '50%', background: 'var(--bg-alt)', marginBottom: '20px' }}>
              <LayoutGrid size={32} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>All Facilities</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Browse everything at once</p>
          </div>
        </div>
      ) : (
        /* Grid Mode: Filtered Resources */
        <>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px', 
            padding: '32px',
            background: 'var(--bg-card)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border-color)',
            position: 'sticky',
            top: '0',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
                <Search size={22} style={{ position: 'absolute', left: '18px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Find a specific room or lab..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 54px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-alt)',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <select 
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-alt)',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    fontWeight: '600'
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
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '16px' }}>
              <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent)' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading resources...</p>
            </div>
          ) : filteredResources.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
              gap: '32px' 
            }}>
              {filteredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '100px', 
              background: 'var(--bg-card)', 
              borderRadius: '24px',
              border: '2px dashed var(--border-color)',
              color: 'var(--text-muted)'
            }}>
              <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>No resources found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
