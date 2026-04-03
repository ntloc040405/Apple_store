import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, Clock, Star, TrendingUp, BarChart3, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import API from '../api/client';

const STATUS_COLORS = { pending: '#ff9f0a', confirmed: '#0071e3', shipping: '#af52de', delivered: '#34c759', cancelled: '#ff3b30' };
const STATUS_LABELS = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
const PRICE_COLORS = ['#0071e3', '#34c759', '#ff9f0a', '#af52de', '#ff3b30', '#5ac8fa'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('30days'); // '30days', 'date', 'month', 'all'
  const [exportDate, setExportDate] = useState('');
  const [exportMonth, setExportMonth] = useState('');

  useEffect(() => {
    const fetchDashboard = () => {
      setLoading(true);
      let query = 'range=30days';
      if (exportType === 'all') query = 'range=all';
      if (exportType === 'date' && exportDate) query = `date=${exportDate}`;
      if (exportType === 'month' && exportMonth) query = `month=${exportMonth}`;

      API.get(`/admin/dashboard?${query}`)
        .then(res => setData(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchDashboard();
  }, [exportType, exportDate, exportMonth]);

  if (loading) return <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><p style={{ fontSize: 16, color: '#86868b' }}>Đang tải bảng điều khiển...</p></div>;
  if (!data) return <div className="page-content"><p>Không thể tải dữ liệu bảng điều khiển</p></div>;

  const pieData = (data.ordersByStatus || []).map(s => ({ name: STATUS_LABELS[s._id] || s._id, value: s.count, color: STATUS_COLORS[s._id] || '#86868b' }));
  const priceData = (data.priceDistribution || []).map((d, i) => ({ ...d, color: PRICE_COLORS[i % PRICE_COLORS.length] }));

  const handleExport = async () => {
    setIsExporting(true);
    let query = 'range=30days';
    if (exportType === 'date' && exportDate) query = `date=${exportDate}`;
    if (exportType === 'month' && exportMonth) query = `month=${exportMonth}`;

    try {
      const response = await API.get(`/admin/reports/export?${query}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `apple_store_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Lỗi khi xuất báo cáo', err);
      alert('Không thể tải xuống báo cáo');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Bảng điều khiển</h2>
          <p style={{ fontSize: 14, color: '#86868b', marginTop: 4 }}>Chào mừng trở lại! Đây là tổng quan tình hình kinh doanh.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '8px 16px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <select className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 14, fontWeight: 500 }} value={exportType} onChange={e => { setExportType(e.target.value); if(e.target.value==='all') { setExportDate(''); setExportMonth(''); } }}>
            <option value="30days">30 ngày qua</option>
            <option value="month">Tháng cụ thể</option>
            <option value="date">Ngày cụ thể</option>
            <option value="all">Toàn thời gian</option>
          </select>
          {exportType === 'date' && <input type="date" className="form-input" style={{ width: 'auto', padding: '8px 12px' }} value={exportDate} onChange={e => setExportDate(e.target.value)} />}
          {exportType === 'month' && <input type="month" className="form-input" style={{ width: 'auto', padding: '8px 12px' }} value={exportMonth} onChange={e => setExportMonth(e.target.value)} />}
          
          <div style={{ width: 1, height: 24, background: '#e8e8ed' }}></div>

          <button className="btn btn-outline" onClick={handleExport} disabled={isExporting || (exportType === 'date' && !exportDate) || (exportType === 'month' && !exportMonth)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={16} /> {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* ── Row 1: Main Stats ── */}
      <div className="stat-grid">
        <StatCard icon={DollarSign} color="blue" value={`$${(data.totalRevenue || 0).toLocaleString()}`} label="Tổng doanh thu" growth={data.revenueGrowth} />
        <StatCard icon={ShoppingCart} color="green" value={data.totalOrders} label="Tổng đơn hàng" growth={data.ordersGrowth} />
        <StatCard icon={Package} color="purple" value={data.totalProducts} label="Sản phẩm đang bán" />
        <StatCard icon={Users} color="orange" value={data.totalUsers} label="Tổng khách hàng" />
      </div>

      {/* ── Row 2: Secondary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MiniStat label="Danh mục" value={data.totalCategories} icon="📂" />
        <MiniStat label="SP Nổi bật" value={data.featuredCount} icon="⭐" />
        <MiniStat label="SP Mới" value={data.newCount} icon="🆕" />
        <MiniStat label="Tổng tồn kho" value={(data.stockOverview?.totalStock || 0).toLocaleString()} icon="📦" />
      </div>

      {/* ── Row 3: Revenue Chart ── */}
      <div style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><TrendingUp size={18} color="#34c759" /> Biểu đồ Doanh thu</h3>
          </div>
          {data.revenueChartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34c759" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34c759" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#86868b' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={val => `$${val.toLocaleString()}`} tick={{ fontSize: 12, fill: '#86868b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8e8ed', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={value => [`$${value.toLocaleString()}`, 'Doanh thu']} />
                <Area type="monotone" dataKey="revenue" stroke="#34c759" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart msg="Không có dữ liệu doanh thu" />}
        </div>
      </div>

      {/* ── Row 4: Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue by Category */}
        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={18} color="#0071e3" /> Doanh thu theo danh mục</h3>
          {data.revenueByCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.revenueByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={val => `$${val}`} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8e8ed', fontSize: 13 }} formatter={value => [`$${value.toLocaleString()}`, 'Doanh thu']} />
                <Bar dataKey="revenue" name="Doanh thu" fill="#0071e3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart msg="Không có dữ liệu" />}
        </div>

        {/* Price Distribution */}
        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} color="#af52de" /> Phân bổ theo mức giá</h3>
          {priceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={priceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" nameKey="range" paddingAngle={3}>
                    {priceData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ChartLegend items={priceData.map(d => ({ name: d.range, color: d.color, value: d.count }))} />
            </>
          ) : <EmptyChart msg="Không có dữ liệu" />}
        </div>
      </div>

      {/* ── Row 4: Stock by Category + Orders donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Stock by Category */}
        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Package size={18} color="#34c759" /> Tồn kho theo danh mục</h3>
          {data.productsByCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.productsByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8e8ed', fontSize: 13 }} />
                <Bar dataKey="totalStock" name="Tồn kho" fill="#34c759" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avgPrice" name="Giá trung bình ($)" fill="#ff9f0a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart msg="Không có dữ liệu" />}
        </div>

        {/* Orders by Status */}
        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingCart size={18} color="#ff9f0a" /> Trạng thái đơn hàng</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ChartLegend items={pieData.map(d => ({ name: d.name, color: d.color, value: d.value }))} />
            </>
          ) : <EmptyChart msg="Chưa có đơn hàng" />}
        </div>
      </div>

      {/* ── Row 5: Top Products + Recent Orders ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Top Selling Products */}
        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Star size={18} color="#ff9f0a" /> Top Sản phẩm Bán chạy</h3>
          {data.topSellers?.length > 0 ? (
            <div style={{ marginTop: 8 }}>
              {data.topSellers.map((item, i) => (
                <div key={item.product?._id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < data.topSellers.length - 1 ? '1px solid #f5f5f7' : 'none' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#86868b', flexShrink: 0 }}>#{i + 1}</span>
                  <img src={item.product?.thumbnail || ''} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name || 'Không xác định'}</div>
                    <div style={{ fontSize: 12, color: '#86868b' }}>Đã bán: {item.sold}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1d1d1f' }}>${item.revenue?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyChart msg="Không có dữ liệu bán ra" />}
        </div>

        {/* Recent Orders */}
        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} color="#0071e3" /> Đơn hàng gần đây</h3>
          {data.recentOrders?.length > 0 ? (
            <table className="data-table" style={{ marginTop: 4 }}>
              <thead><tr><th>Trạng thái</th><th>Khách hàng</th><th>Tổng</th><th>Mã đơn</th></tr></thead>
              <tbody>
                {data.recentOrders.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{o.orderNumber}</td>
                    <td style={{ fontSize: 13 }}>{o.user?.name || 'Vãng lai'}</td>
                    <td style={{ fontWeight: 600 }}>${o.total?.toLocaleString()}</td>
                    <td><span className={`status-badge ${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyChart msg="Chưa có đơn hàng" />}
        </div>
      </div>

      {/* ── Row 6: Low Stock + Stock Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {data.lowStockProducts?.length > 0 && (
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
              <AlertTriangle size={18} color="#ff9f0a" /> Báo động Sắp hết hàng
            </h3>
            <table className="data-table">
              <thead><tr><th>Sản phẩm</th><th>Giá</th><th>Tồn kho</th></tr></thead>
              <tbody>
                {data.lowStockProducts.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>${p.price?.toLocaleString()}</td>
                    <td><span style={{ fontWeight: 700, color: p.stock <= 5 ? '#ff3b30' : '#ff9f0a', background: p.stock <= 5 ? '#ffebee' : '#fff3e0', padding: '2px 10px', borderRadius: 20, fontSize: 13 }}>{p.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📊 Tổng quan Kho hàng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SummaryItem label="Tổng số lượng hàng trong kho" value={(data.stockOverview?.totalStock || 0).toLocaleString()} />
            <SummaryItem label="Trung bình tồn kho theo SP" value={Math.round(data.stockOverview?.avgStock || 0)} />
            <SummaryItem label="Tồn kho cao nhất" value={data.stockOverview?.maxStock || 0} />
            <SummaryItem label="Tồn kho thấp nhất" value={data.stockOverview?.minStock || 0} color={data.stockOverview?.minStock <= 10 ? '#ff3b30' : undefined} />
            <SummaryItem label="Khách hàng đang hoạt động" value={data.activeUsers} />
            <SummaryItem label="Số danh mục đang mở" value={data.totalCategories} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──
function StatCard(props) {
  const { icon: IconComp, color, value, label } = props;
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><IconComp size={24} /></div>
      <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  );
}

function MiniStat({ label, value, icon }) {
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div><div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div><div style={{ fontSize: 12, color: '#86868b' }}>{label}</div></div>
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8 }}>
      {items.map(d => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
          <span>{d.name} ({d.value})</span>
        </div>
      ))}
    </div>
  );
}

function SummaryItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f7' }}>
      <span style={{ fontSize: 13, color: '#86868b' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: color || '#1d1d1f' }}>{value}</span>
    </div>
  );
}

function EmptyChart({ msg = 'Không có dữ liệu' }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#86868b', fontSize: 14 }}>{msg}</div>;
}
