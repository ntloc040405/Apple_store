import { Link } from 'react-router-dom';

const cols = [
  {
    title: 'Mua sắm và Khám phá',
    links: [
      ['Cửa hàng', '/store'], ['Mac', '/category/mac'], ['iPad', '/category/ipad'],
      ['iPhone', '/category/iphone'], ['Watch', '/category/watch'],
      ['AirPods', '/category/airpods'], ['Phụ kiện', '/category/accessories'],
    ],
  },
  {
    title: 'Dịch vụ',
    links: [['Apple Music', '#'], ['Apple TV+', '#'], ['Apple Arcade', '#'], ['iCloud', '#'], ['Apple One', '#']],
  },
  {
    title: 'Tài khoản',
    links: [['Quản lý Tài khoản Apple', '/account'], ['Tài khoản Apple Store', '/account'], ['iCloud.com', '#']],
  },
  {
    title: 'Cửa hàng Apple',
    links: [['Tìm Cửa hàng', '#'], ['Today at Apple', '#'], ['Apple Trade In', '#'], ['Thanh toán', '#'], ['Trạng thái đơn hàng', '#'], ['Trợ giúp Mua sắm', '#']],
  },
  {
    title: 'Giá trị của Apple',
    links: [['Trợ năng', '#'], ['Môi trường', '#'], ['Quyền riêng tư', '#'], ['Chuỗi cung ứng', '#']],
  },
];

const bottomLinks = [['Chính sách Bảo mật', '#'], ['Điều khoản Sử dụng', '#'], ['Bán hàng và Hoàn tiền', '#'], ['Sơ đồ Trang web', '#']];

export default function Footer() {
  return (
    <footer style={{ background: '#f5f5f7', borderTop: '1px solid #d2d2d7', width: '100%' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 22px' }}>

        {/* disclaimer */}
        <p style={{ fontSize: '12px', lineHeight: 1.33, color: '#6e6e73', padding: '17px 0 11px', borderBottom: '1px solid #d2d2d7' }}>
          * Hỗ trợ tài chính có sẵn cho khách hàng đủ điều kiện. Giá trị thu cũ đổi mới sẽ thay đổi tùy thuộc vào tình trạng, 
          năm sản xuất và cấu hình của thiết bị thu cũ đủ điều kiện của bạn. Không phải tất cả các thiết bị đều đủ điều kiện nhận tín dụng.
        </p>

        {/* link columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', padding: '19px 0', borderBottom: '1px solid #d2d2d7' }}>
          {cols.map(c => (
            <div key={c.title}>
              <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.33, marginBottom: '0.8em' }}>{c.title}</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {c.links.map(([name, href]) => (
                  <li key={name} style={{ marginBottom: '0.45em' }}>
                    <Link to={href}
                      style={{ fontSize: '12px', lineHeight: 1.33, color: '#424245', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#424245'; e.currentTarget.style.textDecoration = 'none'; }}>
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '4px', padding: '14px 0' }}>
          <p style={{ fontSize: '12px', color: '#6e6e73', lineHeight: 1.33 }}>
            Bản quyền © 2025 Apple Inc. Bảo lưu mọi quyền.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            {bottomLinks.map(([name, href], i) => (
              <span key={name} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {i > 0 && <span style={{ color: '#d2d2d7', margin: '0 7px', fontSize: '10px' }}>|</span>}
                <Link to={href}
                  style={{ fontSize: '12px', lineHeight: 1.33, color: '#424245', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#424245'; e.currentTarget.style.textDecoration = 'none'; }}>
                  {name}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
