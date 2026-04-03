import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Banner from './models/Banner.js';
import User from './models/User.js';

const seedData = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Banner.deleteMany({});

  // ══════════════════════════════════════
  // CATEGORIES
  // ══════════════════════════════════════
  const categoriesData = [
    {
      name: 'Mac', slug: 'mac', icon: 'laptop', order: 1,
      description: 'If you can dream it, Mac can do it.',
      banner: { title: 'Mac', subtitle: 'If you can dream it, Mac can do it.', bgColor: '#000000' },
      subCategories: [
        { name: 'MacBook Air', slug: 'macbook-air' },
        { name: 'MacBook Pro', slug: 'macbook-pro' },
        { name: 'iMac', slug: 'imac' },
        { name: 'Mac mini', slug: 'mac-mini' },
      ],
    },
    {
      name: 'iPhone', slug: 'iphone', icon: 'smartphone', order: 2,
      description: 'Designed for Apple Intelligence.',
      banner: { title: 'iPhone', subtitle: 'Designed for Apple Intelligence.', bgColor: '#000000' },
      subCategories: [
        { name: 'iPhone 17 Pro', slug: 'iphone-17-pro' },
        { name: 'iPhone Air', slug: 'iphone-air' },
        { name: 'iPhone 17', slug: 'iphone-17' },
        { name: 'iPhone 17e', slug: 'iphone-17e' },
      ],
    },
    {
      name: 'iPad', slug: 'ipad', icon: 'tablet', order: 3,
      description: 'Your next computer is not a computer.',
      banner: { title: 'iPad', subtitle: 'Your next computer is not a computer.', bgColor: '#000000' },
      subCategories: [
        { name: 'iPad Pro', slug: 'ipad-pro' },
        { name: 'iPad Air', slug: 'ipad-air' },
        { name: 'iPad', slug: 'ipad-10' },
        { name: 'iPad mini', slug: 'ipad-mini' },
      ],
    },
    {
      name: 'Apple Watch', slug: 'watch', icon: 'watch', order: 4,
      description: 'The ultimate device for a healthy life.',
      banner: { title: 'Apple Watch', subtitle: 'The ultimate device for a healthy life.', bgColor: '#000000' },
      subCategories: [
        { name: 'Apple Watch Ultra 2', slug: 'watch-ultra-2' },
        { name: 'Apple Watch Series 10', slug: 'watch-series-10' },
        { name: 'Apple Watch SE', slug: 'watch-se' },
      ],
    },
    {
      name: 'AirPods', slug: 'airpods', icon: 'headphones', order: 5,
      description: 'Iconic. Now supersonic.',
      banner: { title: 'AirPods', subtitle: 'Iconic. Now supersonic.', bgColor: '#000000' },
      subCategories: [
        { name: 'AirPods Pro 2', slug: 'airpods-pro-2' },
        { name: 'AirPods 4', slug: 'airpods-4' },
        { name: 'AirPods Max', slug: 'airpods-max' },
      ],
    },
    {
      name: 'AirTag', slug: 'airtag', icon: 'map-pin', order: 6,
      description: 'Lose your knack for losing things.',
    },
    {
      name: 'Accessories', slug: 'accessories', icon: 'grid', order: 7,
      description: 'Explore accessories for your Apple devices.',
    },
    {
      name: 'Apple Vision Pro', slug: 'vision', icon: 'glasses', order: 8,
      description: 'Welcome to the era of spatial computing.',
    },
  ];

  const cats = await Category.insertMany(categoriesData);
  console.log(`  ✅ ${cats.length} categories created`);

  // Category lookup
  const catMap = {};
  cats.forEach(c => { catMap[c.slug] = c._id; });

  // ══════════════════════════════════════
  // PRODUCTS
  // ══════════════════════════════════════
  const productsData = [
    // ── iPhone ──
    {
      name: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max', category: catMap.iphone, subCategory: 'iphone-17-pro',
      tagline: 'The ultimate iPhone.', description: 'A magical new way to interact with iPhone. A groundbreaking safety feature designed to save lives.',
      price: 1199, monthlyPrice: 49.95, isFeatured: true, isNewProduct: true, rating: 4.8, reviewCount: 1250, stock: 50,
      colors: [
        { name: 'Natural Titanium', hex: '#B0A99F' }, { name: 'Desert Titanium', hex: '#C2B59B' },
        { name: 'White Titanium', hex: '#F2F1EB' }, { name: 'Black Titanium', hex: '#3C3C3D' },
      ],
      storageOptions: [{ capacity: '256GB', priceAdd: 0 }, { capacity: '512GB', priceAdd: 200 }, { capacity: '1TB', priceAdd: 400 }],
      specs: {
        display: '6.9-inch Super Retina XDR, ProMotion 120Hz, Always-On',
        chip: 'A19 Pro chip with 6-core GPU', camera: '48MP Fusion + 48MP Ultra Wide + 12MP Telephoto (5x)',
        battery: 'Up to 33 hours video playback', storage: '256GB / 512GB / 1TB',
        connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, USB-C 3', waterResistance: 'IP68', weight: '227g',
      },
      highlights: ['A19 Pro chip', '48MP Pro camera system', '5x optical zoom', 'Titanium design', 'All-day battery life', 'Action button'],
      thumbnail: '/images/iphone.png', images: ['/images/iphone.png'],
    },
    {
      name: 'iPhone 17 Pro', slug: 'iphone-17-pro', category: catMap.iphone, subCategory: 'iphone-17-pro',
      tagline: 'The ultimate iPhone.', description: 'iPhone 17 Pro. Forged in titanium and powered by AI.',
      price: 999, monthlyPrice: 41.62, isFeatured: true, isNewProduct: true, rating: 4.7, reviewCount: 980, stock: 60,
      colors: [
        { name: 'Natural Titanium', hex: '#B0A99F' }, { name: 'Desert Titanium', hex: '#C2B59B' },
        { name: 'White Titanium', hex: '#F2F1EB' }, { name: 'Black Titanium', hex: '#3C3C3D' },
      ],
      storageOptions: [{ capacity: '256GB', priceAdd: 0 }, { capacity: '512GB', priceAdd: 200 }, { capacity: '1TB', priceAdd: 400 }],
      specs: {
        display: '6.3-inch Super Retina XDR, ProMotion 120Hz', chip: 'A19 Pro chip',
        camera: '48MP Fusion + 48MP Ultra Wide + 12MP Telephoto', battery: 'Up to 27 hours video playback',
        storage: '256GB / 512GB / 1TB', weight: '199g',
      },
      highlights: ['A19 Pro chip', '48MP camera system', 'Titanium design', 'ProMotion display', 'All-day battery'],
      thumbnail: '/images/iphone.png', images: ['/images/iphone.png'],
    },
    {
      name: 'iPhone Air', slug: 'iphone-air', category: catMap.iphone, subCategory: 'iphone-air',
      tagline: 'Impressively thin. Impossibly powerful.', description: 'The thinnest iPhone ever.',
      price: 1199, monthlyPrice: 49.95, isFeatured: true, isNewProduct: true, rating: 4.6, reviewCount: 520, stock: 80,
      colors: [
        { name: 'Starlight', hex: '#F5E6D3' }, { name: 'Midnight', hex: '#1D1D2C' },
        { name: 'Sky Blue', hex: '#B5D3E7' }, { name: 'Green', hex: '#AEC8A4' },
      ],
      storageOptions: [{ capacity: '128GB', priceAdd: 0 }, { capacity: '256GB', priceAdd: 100 }, { capacity: '512GB', priceAdd: 300 }],
      specs: {
        display: '6.6-inch Super Retina XDR', chip: 'A19 chip', camera: '48MP Fusion + 24MP Ultra Wide',
        battery: 'Up to 26 hours video playback', storage: '128GB / 256GB / 512GB', weight: '163g',
      },
      highlights: ['Thinnest iPhone ever', 'A19 chip', '48MP camera', 'Ceramic Shield front', 'MagSafe'],
      thumbnail: '/images/iphone.png', images: ['/images/iphone.png'],
    },

    // ── Mac ──
    {
      name: 'MacBook Air 15" M4', slug: 'macbook-air-15-m4', category: catMap.mac, subCategory: 'macbook-air',
      tagline: 'Strikingly thin. Incredibly powerful.', description: 'The new MacBook Air with M4 chip.',
      price: 1299, monthlyPrice: 108.25, isFeatured: true, isNewProduct: true, rating: 4.9, reviewCount: 850, stock: 40,
      colors: [
        { name: 'Midnight', hex: '#2E3642' }, { name: 'Starlight', hex: '#F0E4D3' },
        { name: 'Silver', hex: '#E3E4E5' }, { name: 'Space Gray', hex: '#7D7E80' },
      ],
      storageOptions: [{ capacity: '256GB', priceAdd: 0 }, { capacity: '512GB', priceAdd: 200 }, { capacity: '1TB', priceAdd: 400 }, { capacity: '2TB', priceAdd: 600 }],
      specs: {
        display: '15.3-inch Liquid Retina, 500 nits', chip: 'Apple M4 chip, 10-core CPU, 10-core GPU',
        battery: 'Up to 18 hours', storage: '256GB - 2TB SSD', weight: '1.51 kg',
      },
      highlights: ['M4 chip', 'Up to 32GB memory', '18-hour battery', 'MagSafe charging', '1080p FaceTime HD camera', 'Liquid Retina display'],
      thumbnail: '/images/macbook.png', images: ['/images/macbook.png'],
    },
    {
      name: 'MacBook Pro 14" M4 Pro', slug: 'macbook-pro-14-m4-pro', category: catMap.mac, subCategory: 'macbook-pro',
      tagline: 'The most advanced Mac laptops.', description: 'Supercharged by M4 Pro and M4 Max.',
      price: 1999, monthlyPrice: 166.58, isFeatured: false, isNewProduct: true, rating: 4.9, reviewCount: 620, stock: 30,
      colors: [
        { name: 'Space Black', hex: '#1E1E1E' }, { name: 'Silver', hex: '#E3E4E5' },
      ],
      storageOptions: [{ capacity: '512GB', priceAdd: 0 }, { capacity: '1TB', priceAdd: 200 }, { capacity: '2TB', priceAdd: 400 }],
      specs: {
        display: '14.2-inch Liquid Retina XDR, ProMotion', chip: 'Apple M4 Pro, 12-core CPU, 16-core GPU',
        battery: 'Up to 24 hours', storage: '512GB - 4TB SSD', weight: '1.55 kg',
      },
      highlights: ['M4 Pro chip', 'XDR display', '24-hour battery', '3x Thunderbolt 4', 'HDMI 2.1', 'SDXC card slot'],
      thumbnail: '/images/macbook.png', images: ['/images/macbook.png'],
    },

    // ── iPad ──
    {
      name: 'iPad Pro M4', slug: 'ipad-pro-m4', category: catMap.ipad, subCategory: 'ipad-pro',
      tagline: 'The thinnest, most powerful iPad ever.', description: 'Outrageously powerful. Impossibly thin.',
      price: 1099, monthlyPrice: 91.58, isFeatured: true, isNewProduct: true, rating: 4.8, reviewCount: 450, stock: 45,
      colors: [
        { name: 'Silver', hex: '#E3E4E5' }, { name: 'Space Black', hex: '#1E1E1E' },
      ],
      storageOptions: [{ capacity: '256GB', priceAdd: 0 }, { capacity: '512GB', priceAdd: 200 }, { capacity: '1TB', priceAdd: 400 }, { capacity: '2TB', priceAdd: 800 }],
      specs: {
        display: '13-inch Ultra Retina XDR OLED, ProMotion', chip: 'Apple M4 chip',
        camera: '12MP Wide camera', battery: 'Up to 10 hours', storage: '256GB - 2TB', weight: '579g',
      },
      highlights: ['M4 chip', 'Ultra Retina XDR display', 'Apple Pencil Pro support', 'Thunderbolt / USB 4', 'Face ID', 'Thinnest Apple product ever'],
      thumbnail: '/images/ipad.png', images: ['/images/ipad.png'],
    },
    {
      name: 'iPad Air M3', slug: 'ipad-air-m3', category: catMap.ipad, subCategory: 'ipad-air',
      tagline: 'Fresh Air.', description: 'Now available in two sizes, powered by M3.',
      price: 799, monthlyPrice: 66.58, isFeatured: false, isNewProduct: true, rating: 4.7, reviewCount: 380, stock: 55,
      colors: [
        { name: 'Space Gray', hex: '#7D7E80' }, { name: 'Starlight', hex: '#F0E4D3' },
        { name: 'Purple', hex: '#B8A9C9' }, { name: 'Blue', hex: '#88A4C4' },
      ],
      storageOptions: [{ capacity: '128GB', priceAdd: 0 }, { capacity: '256GB', priceAdd: 100 }, { capacity: '512GB', priceAdd: 300 }, { capacity: '1TB', priceAdd: 500 }],
      specs: {
        display: '11-inch / 13-inch Liquid Retina', chip: 'Apple M3 chip',
        camera: '12MP Wide camera', battery: 'Up to 10 hours', storage: '128GB - 1TB', weight: '462g',
      },
      highlights: ['M3 chip', 'Liquid Retina display', 'Apple Pencil Pro', 'USB-C', 'Touch ID', 'Center Stage'],
      thumbnail: '/images/ipad.png', images: ['/images/ipad.png'],
    },

    // ── Watch ──
    {
      name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', category: catMap.watch, subCategory: 'watch-ultra-2',
      tagline: 'Next-level adventure.', description: 'The most rugged and capable Apple Watch pushes the limits.',
      price: 799, monthlyPrice: 33.29, isFeatured: true, isNewProduct: false, rating: 4.9, reviewCount: 720, stock: 35,
      colors: [{ name: 'Natural Titanium', hex: '#B0A99F' }],
      storageOptions: [{ capacity: '64GB', priceAdd: 0 }],
      specs: {
        display: '49mm Always-On Retina LTPO2 OLED', chip: 'Apple S9 SiP', battery: 'Up to 72 hours',
        waterResistance: 'WR100, EN13319', weight: '61.4g',
      },
      highlights: ['Titanium case', '72-hour battery life', 'Precision GPS', '100m water resistance', 'Action button', '3000 nit display'],
      thumbnail: '/images/watch.png', images: ['/images/watch.png'],
    },

    // ── AirPods ──
    {
      name: 'AirPods Pro 2', slug: 'airpods-pro-2', category: catMap.airpods, subCategory: 'airpods-pro-2',
      tagline: 'Intelligent noise cancellation.', description: 'Pro-level Active Noise Cancellation, Adaptive Audio, and Conversation Awareness.',
      price: 249, monthlyPrice: 10.37, isFeatured: true, isNewProduct: false, rating: 4.7, reviewCount: 2100, stock: 100,
      colors: [{ name: 'White', hex: '#F5F5F7' }],
      storageOptions: [],
      specs: {
        chip: 'Apple H2 chip', battery: 'Up to 6 hours (30 hours with case)',
        connectivity: 'Bluetooth 5.3', waterResistance: 'IPX4',
      },
      highlights: ['Active Noise Cancellation', 'Adaptive Audio', 'USB-C charging', 'Personalized Spatial Audio', 'MagSafe charging case', 'IP54 dust, sweat resistance'],
      thumbnail: '/images/airpods.png', images: ['/images/airpods.png'],
    },
    {
      name: 'AirPods Max', slug: 'airpods-max', category: catMap.airpods, subCategory: 'airpods-max',
      tagline: 'A perfect balance of high-fidelity audio.', description: 'The magic of AirPods. The over-ear experience.',
      price: 549, monthlyPrice: 22.87, isFeatured: false, isNewProduct: true, rating: 4.6, reviewCount: 580, stock: 25,
      colors: [
        { name: 'Midnight', hex: '#1D1D2C' }, { name: 'Blue', hex: '#7BA5D1' },
        { name: 'Purple', hex: '#B4A1C8' }, { name: 'Orange', hex: '#E8A87C' }, { name: 'Starlight', hex: '#F5E6D3' },
      ],
      storageOptions: [],
      specs: {
        chip: 'Apple H2 chip', battery: 'Up to 20 hours',
        connectivity: 'Bluetooth 5.3', weight: '395g',
      },
      highlights: ['Apple H2 chip', 'Active Noise Cancellation', 'Personalized Spatial Audio', '20-hour battery', 'USB-C', 'Digital Crown'],
      thumbnail: '/images/airpods.png', images: ['/images/airpods.png'],
    },
  ];

  const prods = await Product.insertMany(productsData);
  console.log(`  ✅ ${prods.length} products created`);

  // ══════════════════════════════════════
  // BANNERS
  // ══════════════════════════════════════
  const bannersData = [
    { title: 'iPhone 17 Pro', subtitle: 'The ultimate iPhone.', link: '/product/iphone-17-pro', shopLink: '/shop/iphone', bgColor: '#000', textColor: 'light', order: 1 },
    { title: 'iPad Air', subtitle: 'Fresh Air.', link: '/product/ipad-air-m3', shopLink: '/shop/ipad', bgColor: '#f5f5f7', textColor: 'dark', order: 2 },
    { title: 'MacBook Air', subtitle: 'Sky-high performance meets an ultraportable design.', link: '/product/macbook-air-15-m4', shopLink: '/shop/mac', bgColor: '#1a1a3e', textColor: 'light', order: 3 },
  ];
  const banners = await Banner.insertMany(bannersData);
  console.log(`  ✅ ${banners.length} banners created`);

  // ══════════════════════════════════════
  // ADMIN USER
  // ══════════════════════════════════════
  const adminExists = await User.findOne({ email: 'admin@apple.com' });
  if (!adminExists) {
    await User.create({ name: 'Admin', email: 'admin@apple.com', password: 'admin123', role: 'admin', phone: '0900000000' });
    console.log('  ✅ Admin user created (admin@apple.com / admin123)');
  }

  const demoExists = await User.findOne({ email: 'user@example.com' });
  if (!demoExists) {
    await User.create({
      name: 'Nguyễn Văn A', email: 'user@example.com', password: '12345678', phone: '0901234567',
      addresses: [{ fullName: 'Nguyễn Văn A', phone: '0901234567', street: '123 Nguyễn Huệ', city: 'TP. Hồ Chí Minh', district: 'Quận 1', isDefault: true }],
    });
    console.log('  ✅ Demo user created (user@example.com / 12345678)');
  }

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
};

seedData().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
