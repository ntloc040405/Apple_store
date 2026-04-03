import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import API from '../api/client';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(!!q);

  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setLoading(!!q);
    if (!q) {
      if (results.length > 0) setResults([]);
    }
  }

  useEffect(() => {
    let isMounted = true;
    if (!q) return;

    const fetchResults = async () => {
      try {
        const res = await API.get('/products/search', { params: { q } });
        if (isMounted) {
          const d = res.data.data;
          setResults(Array.isArray(d) ? d : d.products || []);
        }
      } catch {
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();
    return () => { isMounted = false; };
  }, [q]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh' }}>
      <section style={{ width: '100%', background: '#f5f5f7' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 22px 40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 600, color: '#1d1d1f', marginBottom: '24px' }}>Tìm kiếm</h1>
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <SearchIcon size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#86868b' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm sản phẩm..."
              style={{ width: '100%', padding: '16px 20px 16px 52px', border: 'none', borderRadius: '14px', fontSize: '17px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', outline: 'none' }} />
          </form>
        </div>
      </section>

      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 22px 60px' }}>
        {q && <p style={{ fontSize: '14px', color: '#86868b', marginBottom: '20px' }}>{loading ? 'Đang tìm kiếm...' : `${results.length} kết quả cho "${q}"`}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {results.map(p => (
            <Link key={p._id} to={`/product/${p.slug}`}
              style={{ display: 'flex', gap: '16px', padding: '16px', background: '#fff', borderRadius: '16px', textDecoration: 'none', border: '1px solid #e8e8ed', transition: 'box-shadow 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '60px', objectFit: 'contain' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f' }}>{p.name}</h3>
                <p style={{ fontSize: '13px', color: '#6e6e73', marginTop: '2px' }}>{p.tagline}</p>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f', marginTop: '8px' }}>${p.price?.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>

        {!loading && q && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#86868b' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
            <p style={{ fontSize: '17px' }}>Không tìm thấy kết quả cho "{q}"</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Hãy thử từ khóa khác</p>
          </div>
        )}
      </section>
    </main>
  );
}
