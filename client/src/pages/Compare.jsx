import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import API from '../api/client';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(() => !!searchParams.get('ids'));

  const ids = searchParams.get('ids');
  const [prevIds, setPrevIds] = useState(ids);
  if (ids !== prevIds) {
    setPrevIds(ids);
    setLoading(!!ids);
    if (!ids) setProducts([]);
  }

  useEffect(() => {
    let isMounted = true;
    if (!ids) return;

    const slugs = ids.split(',').filter(Boolean);
    Promise.all(slugs.map(slug =>
      API.get(`/products/${slug}`).then(r => r.data.data).catch(() => null)
    )).then(results => {
      if (isMounted) setProducts(results.filter(Boolean));
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [ids]); // Use ids directly as dependency now that reset is in render phase

  if (loading) return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#86868b' }}>Đang tải bảng so sánh...</p>
    </main>
  );

  if (products.length < 2) return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '120px 22px', textAlign: 'center' }}>
        <p style={{ fontSize: '56px', marginBottom: '16px' }}>⚖️</p>
        <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#1d1d1f' }}>So sánh sản phẩm</h1>
        <p style={{ fontSize: '17px', color: '#6e6e73', marginTop: '8px' }}>Chọn ít nhất 2 sản phẩm để so sánh chi tiết.</p>
        <p style={{ fontSize: '14px', color: '#86868b', marginTop: '8px' }}>
          {compareItems.length > 0
            ? `Bạn đã chọn ${compareItems.length} sản phẩm. Hãy thêm thêm từ cửa hàng.`
            : 'Khám phá cửa hàng và nhấn nút so sánh trên các sản phẩm bạn muốn so sánh.'}
        </p>
        <Link to="/store" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 24px', background: '#0071e3', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
          Khám phá sản phẩm
        </Link>
      </div>
    </main>
  );

  const allSpecKeys = [...new Set(products.flatMap(p => Object.keys(p.specs || {})))].filter(k => products.some(p => p.specs?.[k]));
  const specLabels = { display: 'Màn hình', chip: 'Chip', camera: 'Camera', battery: 'Pin', storage: 'Dung lượng', connectivity: 'Kết nối', waterResistance: 'Kháng nước', weight: 'Trọng lượng', dimensions: 'Kích thước' };

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 22px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <Link to="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2997ff', textDecoration: 'none', fontSize: '14px', marginBottom: '8px' }}>
              <ArrowLeft size={14} /> Quay lại cửa hàng
            </Link>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#1d1d1f' }}>So sánh</h1>
          </div>
          <button onClick={() => { clearCompare(); window.history.back(); }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d2d2d7', background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#1d1d1f' }}>
            Xóa tất cả
          </button>
        </div>

        {/* Comparison table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            {/* Product cards row */}
            <thead>
              <tr>
                <th style={{ width: '160px', padding: '0 8px' }}></th>
                {products.map(p => (
                  <th key={p._id} style={{ padding: '0 12px', verticalAlign: 'top', minWidth: '200px' }}>
                    <div style={{ background: '#fff', borderRadius: '18px', padding: '24px 16px', textAlign: 'center', position: 'relative' }}>
                      <button onClick={() => removeFromCompare(p._id)}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={12} />
                      </button>
                      <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '120px', objectFit: 'contain' }} />}
                      </div>
                      <Link to={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f' }}>{p.name}</h3>
                      </Link>
                      <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px' }}>{p.tagline}</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f', marginTop: '8px' }}>
                        {p.salePrice ? (
                          <><span style={{ color: '#bf4800' }}>${p.salePrice.toLocaleString()}</span> <span style={{ textDecoration: 'line-through', color: '#86868b', fontSize: '14px' }}>${p.price.toLocaleString()}</span></>
                        ) : `$${p.price?.toLocaleString()}`}
                      </p>
                      {p.monthlyPrice && <p style={{ fontSize: '12px', color: '#6e6e73', marginTop: '2px' }}>hoặc ${p.monthlyPrice}/tháng</p>}
                      <Link to={`/product/${p.slug}`}
                        style={{ display: 'inline-block', marginTop: '12px', padding: '8px 20px', background: '#0071e3', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                        Mua
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Specs rows */}
            <tbody>
              {/* Rating */}
              <tr>
                <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', borderBottom: '1px solid #e8e8ed' }}>Đánh giá</td>
                {products.map(p => (
                  <td key={p._id} style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', color: '#1d1d1f', borderBottom: '1px solid #e8e8ed' }}>
                    <span style={{ color: '#ff9500' }}>★</span> {p.rating?.toFixed(1) || 'N/A'} ({p.reviewCount || 0})
                  </td>
                ))}
              </tr>

              {/* Colors */}
              <tr>
                <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', borderBottom: '1px solid #e8e8ed' }}>Màu sắc</td>
                {products.map(p => (
                  <td key={p._id} style={{ padding: '16px 12px', textAlign: 'center', borderBottom: '1px solid #e8e8ed' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {p.colors?.map(c => (
                        <div key={c.name} title={c.name} style={{ width: '18px', height: '18px', borderRadius: '50%', background: c.hex, border: '1px solid #d2d2d7' }} />
                      ))}
                      {(!p.colors || p.colors.length === 0) && <span style={{ color: '#86868b', fontSize: '13px' }}>—</span>}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Storage */}
              <tr>
                <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', borderBottom: '1px solid #e8e8ed' }}>Tùy chọn dung lượng</td>
                {products.map(p => (
                  <td key={p._id} style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', color: '#1d1d1f', borderBottom: '1px solid #e8e8ed' }}>
                    {p.storageOptions?.map(s => s.capacity).join(', ') || '—'}
                  </td>
                ))}
              </tr>

              {/* Specs */}
              {allSpecKeys.map(key => (
                <tr key={key}>
                  <td style={{ padding: '14px 8px', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', borderBottom: '1px solid #e8e8ed' }}>
                    {specLabels[key] || key}
                  </td>
                  {products.map(p => (
                    <td key={p._id} style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', color: p.specs?.[key] ? '#1d1d1f' : '#86868b', borderBottom: '1px solid #e8e8ed' }}>
                      {p.specs?.[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Stock */}
              <tr>
                <td style={{ padding: '14px 8px', fontSize: '13px', fontWeight: 600, color: '#1d1d1f' }}>Tình trạng hàng</td>
                {products.map(p => (
                  <td key={p._id} style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px' }}>
                    <span style={{ color: p.stock > 0 ? '#34c759' : '#ff3b30', fontWeight: 600 }}>
                      {p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
