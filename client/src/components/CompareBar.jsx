import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
      background: 'rgba(22,22,23,0.95)', backdropFilter: 'saturate(180%) blur(20px)',
      padding: '12px 22px', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
      animation: 'slideUp 0.3s ease-out',
    }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'auto' }}>
          <span style={{ fontSize: '13px', color: '#86868b', whiteSpace: 'nowrap', fontWeight: 500 }}>
            Compare ({compareItems.length}/4):
          </span>
          {compareItems.map(p => (
            <div key={p._id} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
              padding: '6px 10px', flexShrink: 0,
            }}>
              {p.thumbnail && <img src={p.thumbnail} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />}
              <span style={{ fontSize: '12px', color: '#f5f5f7', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <button onClick={() => removeFromCompare(p._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#86868b', display: 'flex' }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={clearCompare}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #424245', background: 'none', color: '#86868b', fontSize: '12px', cursor: 'pointer' }}>
            Clear
          </button>
          <Link to={`/compare?ids=${compareItems.map(p => p.slug).join(',')}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '8px 16px', borderRadius: '8px', background: '#0071e3',
              color: '#fff', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
              opacity: compareItems.length < 2 ? 0.5 : 1,
              pointerEvents: compareItems.length < 2 ? 'none' : 'auto',
            }}>
            Compare <ArrowRight size={12} />
          </Link>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}
