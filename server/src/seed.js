import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Banner from './models/Banner.js';
import Blog from './models/Blog.js';
import User from './models/User.js';

const seedData = async () => {
  await connectDB();
  console.log('🌱 Performing a TIER-1 PRO-GRADE Catalog Reset...');

  // Clear existing data
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Banner.deleteMany({});
  await Blog.deleteMany({});

  // ── CATEGORIES ──
  const categoriesData = [
    { name: 'Mac', slug: 'mac', icon: 'laptop', order: 1, description: 'Power for the pro.' },
    { name: 'iPhone', slug: 'iphone', icon: 'smartphone', order: 2, description: 'Apple Intelligence in your pocket.' },
    { name: 'iPad', slug: 'ipad', icon: 'tablet', order: 3, description: 'Versatility unmatched.' },
    { name: 'Watch', slug: 'watch', icon: 'watch', order: 4, description: 'Your health, elevated.' },
    { name: 'AirPods', slug: 'airpods', icon: 'headphones', order: 5, description: 'Audio masterpiece.' },
    { name: 'Accessories', slug: 'accessories', icon: 'grid', order: 6, description: 'Complete your world.' }
  ];

  const cats = await Category.insertMany(categoriesData);
  const catMap = {};
  cats.forEach(c => { catMap[c.slug] = c._id; });

  const productsData = [
    // ── MAC MINI M4 ──
    {
      name: 'Mac mini M4',
      slug: 'mac-mini-m4',
      category: catMap.mac,
      subCategory: 'Desktop',
      tagline: 'Gọn nhẹ hơn. Mạnh mẽ vượt tầm. Siêu máy tính để bàn.',
      description: `<div class="product-narrative"><p>Mac mini giờ đây gọn hơn bao giờ hết—chỉ với kích thước 5x5 inch. Được trang bị chip M4 hoặc M4 Pro mạnh mẽ, đây là con quái vật về hiệu suất chuyên nghiệp trong một thân hình tối giản.</p><ul><li>M100% hoạt động yên tĩnh</li><li>Cổng kết nối rộng rãi</li><li>Lý tưởng cho studio, nhà phát triển, chuyên nghiệp</li></ul></div>`,
      price: 599,
      salePrice: 549,
      monthlyPrice: 27,
      rating: 4.8,
      reviewCount: 320,
      stock: 50,
      isActive: true,
      isFeatured: true,
      isNewProduct: true,
      highlights: [
        'Chip M4 (10-core CPU, 10-core GPU) - Siêu mạnh mẽ.',
        'Kích thước 5x5 inch - Gọn nhẹ để bàn.',
        'Thunderbolt 5 - Tốc độ truyền 120Gb/s.'
      ],
      specs: {
        chip: 'Apple M4 chip (10-core CPU, 10-core GPU, 16-core Neural Engine)',
        display: 'Hỗ trợ tới 2 màn hình 6K/4K hoặc 1 màn hình 5K',
        storage: '256GB / 512GB / 1TB / 2TB SSD',
        ports: '3x Thunderbolt 5, HDMI 2.1, Gigabit Ethernet',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3',
        weight: '920 grams',
        dimensions: '5 x 5 x 2.4 inches',
        powers: '36W / 70W USB-C Power Adapter'
      },
      colors: [
        { name: 'Space Black', hex: '#1D1D1F', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1074&auto=format&fit=crop' },
        { name: 'Silver', hex: '#E3E4E5', image: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=1470&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '256GB SSD', priceAdd: 0 },
        { capacity: '512GB SSD', priceAdd: 200 },
        { capacity: '1TB SSD', priceAdd: 400 },
        { capacity: '2TB SSD', priceAdd: 800 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1074&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1074&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587829741301-dc798b83dadc?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop'
      ]
    },
    // ── iPHONE 17 PRO MAX ──
    {
      name: 'iPhone 17 Pro Max',
      slug: 'iphone-17-pro-max',
      category: catMap.iphone,
      subCategory: 'Pro',
      tagline: 'Titanium. Intelligence. Trải nghiệm không giới hạn.',
      description: `<p>iPhone 17 Pro Max là đỉnh cao mới của nghệ thuật chế tác điện thoại. Khung vỏ Titanium cấp độ hàng không siêu bền bỉ kết hợp với mặt lưng kính nhám tạo nên vẻ đẹp sang trọng và thiết kế Action Camera 5x tele.</p>`,
      price: 1199,
      salePrice: 1149,
      monthlyPrice: 50,
      rating: 4.9,
      reviewCount: 1250,
      stock: 100,
      isActive: true,
      isFeatured: true,
      isNewProduct: true,
      highlights: [
        'Chip A19 Pro - Hiệu suất tuyệt đối.',
        'Camera 48MP & Tele 5x - Chụp ảnh chuyên nghiệp.',
        'Thiết kế Titanium - Bền bỉ, sang trọng.'
      ],
      specs: {
        display: '6.9-inch LTPO OLED, 1-120Hz, 2000 nits peak',
        chip: 'Apple A19 Pro (6-core CPU, 6-core GPU, 16-core Neural Engine)',
        camera: 'Main: 48MP | Ultra Wide: 48MP | Tele: 12MP 5x Optical Zoom',
        battery: 'Pin 4900 mAh, sạc 45W, 50% tại 30 phút',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3, 5G (mmWave + Sub-6GHz)',
        waterResistance: 'IP69 - Chống nước tới 6 mét, 30 phút',
        weight: '194 grams',
        dimensions: '6.33 x 3.14 x 0.34 inches',
        charging: 'USB-C with USB 3.0 speed'
      },
      colors: [
        { name: 'Natural Titanium', hex: '#B0A99F', image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop' },
        { name: 'Desert Titanium', hex: '#C2B59B', image: 'https://images.unsplash.com/photo-1592890284954-469b60ed7126?q=80&w=1470&auto=format&fit=crop' },
        { name: 'Black Titanium', hex: '#2C2C2C', image: 'https://images.unsplash.com/photo-1533228100845-08145b01de14?q=80&w=1470&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '256GB', priceAdd: 0 },
        { capacity: '512GB', priceAdd: 200 },
        { capacity: '1TB', priceAdd: 400 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1381&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592890284954-469b60ed7126?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533228100845-08145b01de14?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556316384-12c35d30348f?q=80&w=1470&auto=format&fit=crop'
      ]
    },
    // ── MACBOOK PRO 14 M4 ──
    {
      name: 'MacBook Pro 14 M4',
      slug: 'macbook-pro-14-m4',
      category: catMap.mac,
      subCategory: 'Laptop',
      tagline: 'Quyền năng rúng động. Thiết kế mê hoặc.',
      description: `<p>MacBook Pro 14 với M4 Pro hoặc M4 Max là công cụ chuyên nghiệp cho mọi nhu cầu. Màn hình Liquid Retina XDR cung cấp độ sáng đỉnh cao cùng màu sắc trực thực.</p>`,
      price: 1599,
      salePrice: 1549,
      monthlyPrice: 70,
      rating: 4.9,
      reviewCount: 450,
      stock: 40,
      isActive: true,
      isFeatured: true,
      isNewProduct: true,
      highlights: [
        'Chip M4 Pro/Max - Hiệu suất đỉnh cao.',
        'Liquid Retina XDR - Màn hình tốt nhất, 1600 nits.',
        'Pin 18-22 giờ - Làm việc cả ngày không lo pin.'
      ],
      specs: {
        chip: 'M4 Pro (12-core CPU, 16-core GPU) / M4 Max (14-core CPU, 30-core GPU)',
        display: 'Liquid Retina XDR (3024 x 1964), 1600 nits Peak, 120Hz',
        storage: '512GB / 1TB / 2TB / 4TB / 8TB SSD',
        ports: '3x Thunderbolt 5, HDMI 2.1, SDXC, MagSafe 3',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3',
        weight: '3.3 lbs / 1.5 kg',
        dimensions: '12.3 x 8.43 x 0.61 inches',
        graphics: 'Integrated 16/20-core GPU / Discrete 30-core GPU'
      },
      colors: [
        { name: 'Space Black', hex: '#1D1D1F', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1026&auto=format&fit=crop' },
        { name: 'Silver', hex: '#E3E4E5', image: 'https://images.unsplash.com/photo-1611186871348-71ce4fb6030c?q=80&w=1470&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '512GB SSD', priceAdd: 0 },
        { capacity: '1TB SSD', priceAdd: 400 },
        { capacity: '2TB SSD', priceAdd: 800 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1026&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1026&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1611186871348-71ce4fb6030c?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1471&auto=format&fit=crop'
      ]
    },
    // ── iPAD PRO M4 ──
    {
      name: 'iPad Pro M4',
      slug: 'ipad-pro-m4',
      category: catMap.ipad,
      subCategory: 'Pro',
      tagline: 'Mỏng không tưởng. Mạnh khủng khiếp.',
      description: `<p>iPad Pro M4 là máy tính bảng mạnh nhất và mỏng nhất. Với màn hình Tandem OLED tuyệt đẹp, đây là công cụ sáng tạo hoàn hảo.</p>`,
      price: 999,
      salePrice: 949,
      monthlyPrice: 45,
      rating: 4.9,
      reviewCount: 880,
      stock: 60,
      isActive: true,
      isFeatured: true,
      isNewProduct: false,
      highlights: [
        'Chip M4 - Sức mạnh xử lý đột phá.',
        'Màn hình Tandem OLED - Rực rỡ tuyệt đối.',
        'Độ dày 5.1mm - Mỏng nhất trong lịch sử iPad.'
      ],
      specs: {
        display: 'Ultra Retina XDR Tandem OLED, 11" / 13", 120Hz, 2000 nits',
        chip: 'Apple M4 (9-core CPU / 10-core CPU, 10-core GPU)',
        storage: '256GB / 512GB / 1TB / 2TB SSD',
        ports: '2x Thunderbolt 5 / USB-C',
        battery: 'Lên đến 10 giờ lướt web Wi-Fi',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3, optional 5G',
        weight: '478g / 579g (11" / 13")',
        dimensions: '10.86 x 7.69 x 0.20 inches'
      },
      colors: [
        { name: 'Space Black', hex: '#1D1D1F', image: 'https://images.unsplash.com/photo-1544244015-0cd4b3ff2851?q=80&w=1073&auto=format&fit=crop' },
        { name: 'Silver', hex: '#F5F5F7', image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=1071&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '256GB', priceAdd: 0 },
        { capacity: '512GB', priceAdd: 150 },
        { capacity: '1TB', priceAdd: 350 },
        { capacity: '2TB', priceAdd: 750 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1544244015-0cd4b3ff2851?q=80&w=1073&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1544244015-0cd4b3ff2851?q=80&w=1073&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=1071&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542744095-2ad4b5d9827d?q=80&w=1470&auto=format&fit=crop'
      ]
    },
    // ── MACBOOK AIR 15 M4 ──
    {
      name: 'MacBook Air 15 M4',
      slug: 'macbook-air-15-m4',
      category: catMap.mac,
      subCategory: 'Laptop',
      tagline: 'Siêu mỏng, siêu mạnh cho mọi người.',
      description: `<p>MacBook Air 15 M4 là sự lựa chọn hoàn hảo cho người dùng cần hiệu năng mạnh mẽ nhưng yêu thích độ mỏng gọn. Với pin tới 18 giờ, bạn có thể làm việc cả ngày ngoài trời.</p>`,
      price: 1299,
      salePrice: 1249,
      monthlyPrice: 55,
      rating: 4.8,
      reviewCount: 280,
      stock: 45,
      isActive: true,
      isFeatured: false,
      isNewProduct: true,
      highlights: [
        'Chip M4 - Performance tuyệt vời, tiết kiệm pin.',
        'Màn hình Retina 15.3 inch - Sắc nét tuyệt đối.',
        'Pin 18 giờ - Làm việc suốt ngày.'
      ],
      specs: {
        chip: 'Apple M4 (10-core CPU, 10-core GPU, 16-core Neural Engine)',
        display: 'Liquid Retina (2880 x 1864), 120Hz, 500 nits',
        storage: '256GB / 512GB / 1TB SSD',
        ports: 'MagSafe 3, 2x Thunderbolt 3',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3',
        weight: '3.3 lbs / 1.51 kg',
        dimensions: '13.6 x 9.5 x 0.44 inches',
        charging: 'MagSafe 3, USB-C Power Adapter'
      },
      colors: [
        { name: 'Midnight', hex: '#1F1F1F', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1026&auto=format&fit=crop' },
        { name: 'Starlight', hex: '#F8F7F1', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1471&auto=format&fit=crop' },
        { name: 'Space Gray', hex: '#505050', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1026&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '256GB', priceAdd: 0 },
        { capacity: '512GB', priceAdd: 200 },
        { capacity: '1TB', priceAdd: 400 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1026&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1026&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1471&auto=format&fit=crop'
      ]
    },
    // ── iPAD AIR 11 M4 ──
    {
      name: 'iPad Air 11 M4',
      slug: 'ipad-air-11-m4',
      category: catMap.ipad,
      subCategory: 'Air',
      tagline: 'Năng lực chuyên nghiệp. Giá hợp lý.',
      description: `<p>iPad Air 11 với chip M4 cung cấp hiệu năng ngang với máy tính xách tay, nhưng với kích thước nhỏ gọn hơn. Màn hình sắc nét và hỗ trợ Apple Pencil Pro làm nó trở thành công cụ sáng tạo tuyệt vời.</p>`,
      price: 749,
      salePrice: 699,
      monthlyPrice: 35,
      rating: 4.7,
      reviewCount: 650,
      stock: 75,
      isActive: true,
      isFeatured: false,
      isNewProduct: true,
      highlights: [
        'Chip M4 - Xử lý mượt mà, lung linh.',
        'Màn hình Liquid Retina 11 inch - Hiển thị đẹp mê hoặc.',
        'Hỗ trợ Apple Pencil Pro - Vẽ và ghi chú tuyệt hảo.'
      ],
      specs: {
        display: 'Liquid Retina 11-inch (2560 x 1620), 60Hz, anti-reflective',
        chip: 'Apple M4 (9-core CPU, 10-core GPU, 16-core Neural Engine)',
        storage: '128GB / 256GB / 512GB / 1TB SSD',
        ports: 'USB-C with Thunderbolt 3',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3, optional 5G',
        weight: '329g',
        dimensions: '10.86 x 7.61 x 0.25 inches',
        battery: 'Lên đến 10 giờ'
      },
      colors: [
        { name: 'Space Gray', hex: '#424245', image: 'https://images.unsplash.com/photo-1542744095-2ad4b5d9827d?q=80&w=1470&auto=format&fit=crop' },
        { name: 'Silver', hex: '#E8E8EB', image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=1071&auto=format&fit=crop' },
        { name: 'Blue', hex: '#4A90E2', image: 'https://images.unsplash.com/photo-1542744095-2ad4b5d9827d?q=80&w=1470&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '128GB', priceAdd: 0 },
        { capacity: '256GB', priceAdd: 150 },
        { capacity: '512GB', priceAdd: 350 },
        { capacity: '1TB', priceAdd: 750 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1542744095-2ad4b5d9827d?q=80&w=1470&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1542744095-2ad4b5d9827d?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=1071&auto=format&fit=crop'
      ]
    },
    // ── APPLE WATCH ULTRA 3 ──
    {
      name: 'Apple Watch Ultra 3',
      slug: 'apple-watch-ultra-3',
      category: catMap.watch,
      subCategory: 'Ultra',
      tagline: 'Siêu bền. Siêu thông minh. Siêu đa dạng.',
      description: `<p>Apple Watch Ultra 3 được thiết kế cho những người yêu thích thể thao mạo hiểm. Khung vỏ Titanium Grade 5 siêu bền và pin 72 giờ giúp bạn khám phá những nơi xa xôi.</p>`,
      price: 799,
      salePrice: 749,
      monthlyPrice: 35,
      rating: 4.8,
      reviewCount: 520,
      stock: 80,
      isActive: true,
      isFeatured: true,
      isNewProduct: true,
      highlights: [
        'Titanium Grade 5 - Bền gấp 3 lần, nhẹ hơn.',
        'Pin 72 giờ - Sáu ngày một lần sạc.',
        'Action Button + Ocean Band - Thiết kế độc đáo.'
      ],
      specs: {
        display: 'Retina LTPO OLED, 1000 nits peak brightness',
        chip: 'Apple S10 SiP (dual-core processor)',
        battery: 'Lên đến 72 giờ (chế độ bình thường, 36 giờ chế độ bình thường)',
        connectivity: 'Cellular, Wi-Fi 6E, Bluetooth 5.3, NFC',
        weight: '61.5 grams',
        waterResistance: 'Water Resistant 100 meters',
        sensors: 'Accelerometer, Gyroscope, Barometer, Compass, Always-On Altitude'
      },
      colors: [
        { name: 'Titanium Natural', hex: '#808080', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1470&auto=format&fit=crop' },
        { name: 'Deep Blue Titanium', hex: '#005192', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1469&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '49mm (Standard)', priceAdd: 0 },
        { capacity: '49mm (Cellular)', priceAdd: 100 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1470&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1469&auto=format&fit=crop'
      ]
    },
    // ── iPHONE 17 ──
    {
      name: 'iPhone 17',
      slug: 'iphone-17',
      category: catMap.iphone,
      subCategory: 'Standard',
      tagline: 'Sức mạnh. Hiệu năng. Giá tốt.',
      description: `<p>iPhone 17 mang lại sức mạnh của chip A19 với giá tốt nhất trong dòng sản phẩm. Camera kép 48MP chụp hình đẹp lung linh với mọi điều kiện ánh sáng.</p>`,
      price: 799,
      salePrice: 749,
      monthlyPrice: 35,
      rating: 4.7,
      reviewCount: 2100,
      stock: 150,
      isActive: true,
      isFeatured: false,
      isNewProduct: true,
      highlights: [
        'Chip A19 - Hiệu suất mạnh mẽ, pin lâu.',
        'Camera kép 48MP + 12MP ultrawide - Chụp từ mọi góc độ.',
        'Thiết kế Corning Gorilla Glass Armor - Bền gấp 3 lần.'
      ],
      specs: {
        display: '6.1-inch Super Retina XDR OLED, 120Hz, 1000 nits',
        chip: 'Apple A19 (6-core CPU, 5-core GPU, 16-core Neural Engine)',
        camera: 'Main: 48MP | Ultrawide: 12MP 120° | Front: 12MP',
        battery: 'Pin 3900 mAh, sạc 25W, sạc không dây',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3, Dual SIM (nano-SIM + eSIM)',
        waterResistance: 'IP68 - Chống nước 6 mét, 30 phút',
        weight: '172 grams',
        dimensions: '5.8 x 2.8 x 0.31 inches'
      },
      colors: [
        { name: 'Jet Black', hex: '#1D1D1F', image: 'https://images.unsplash.com/photo-1592286518556-ab9fbb2f6e1c?q=80&w=1470&auto=format&fit=crop' },
        { name: 'Arctic White', hex: '#F5F5F7', image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?q=80&w=1470&auto=format&fit=crop' },
        { name: 'Ocean Blue', hex: '#0066CC', image: 'https://images.unsplash.com/photo-1592286518556-ab9fbb2f6e1c?q=80&w=1470&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '128GB', priceAdd: 0 },
        { capacity: '256GB', priceAdd: 100 },
        { capacity: '512GB', priceAdd: 300 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1592286518556-ab9fbb2f6e1c?q=80&w=1470&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1592286518556-ab9fbb2f6e1c?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511707267537-b85faf00021e?q=80&w=1470&auto=format&fit=crop'
      ]
    },
    // ── AIRPODS PRO 4 ──
    {
      name: 'AirPods Pro 4',
      slug: 'airpods-pro-4',
      category: catMap.airpods,
      subCategory: 'Premium',
      tagline: 'Âm thanh siêu sạch. Bộ lọc rất bền.',
      description: `<p>AirPods Pro 4 là tai nghe không dây premium với khả năng khử tiếng ồn hoạt động chủ động tuyệt vời. Chip H3 mang lại trải nghiệm âm thanh chân thực nhất.</p>`,
      price: 299,
      salePrice: 279,
      monthlyPrice: 13,
      rating: 4.8,
      reviewCount: 1850,
      stock: 200,
      isActive: true,
      isFeatured: true,
      isNewProduct: true,
      highlights: [
        'Chip H3 - Khuôn khổ tích hợp cao, âm thanh tốt hơn.',
        'Chế độ lọc chủ động + Chế độ Xuyên suốt - Điều chỉnh âm tùy ý.',
        'Pin 6 giờ, hộp sạc 30 giờ - Dùng mọi lúc.'
      ],
      specs: {
        display: 'Wireless, Bluetooth 5.3 with H3 chip',
        chip: 'Apple H3 Chip',
        battery: 'Pin nghe 6 giờ (ANC bật), Case sạc 30 giờ',
        connectivity: 'AAC, AAC-ELD, ULAW, SBC codec support',
        audio: 'Adaptive Audio, Conversation Awareness, Personalized Volume',
        sensors: 'Accelerometer, Proximity sensor, Touch',
        waterResistance: 'IPX4 - Chống mồ hôi, sprinkle'
      },
      colors: [
        { name: 'White', hex: '#FFFFFF', image: 'https://images.unsplash.com/photo-1559056169-641ef2588ef0?q=80&w=1470&auto=format&fit=crop' },
        { name: 'Midnight', hex: '#1F1F1F', image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=1470&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: 'Standard (Single Pair)', priceAdd: 0 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1559056169-641ef2588ef0?q=80&w=1470&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1559056169-641ef2588ef0?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=1470&auto=format&fit=crop'
      ]
    },
    // ── MAC STUDIO M4 MAX ──
    {
      name: 'Mac Studio M4 Max',
      slug: 'mac-studio-m4-max',
      category: catMap.mac,
      subCategory: 'Desktop',
      tagline: 'Máy tính để bàn chuyên nghiệp siêu mạnh.',
      description: `<p>Mac Studio M4 Max là máy tính để bàn dành cho các chuyên gia sáng tạo. Với GPU 30-core mạnh mẽ, nó xử lý video 4K/6K mượt mà như nuốt nước.</p>`,
      price: 1999,
      salePrice: 1899,
      monthlyPrice: 85,
      rating: 4.9,
      reviewCount: 350,
      stock: 35,
      isActive: true,
      isFeatured: false,
      isNewProduct: true,
      highlights: [
        'Chip M4 Max - Xử lý 4K/6K video như nuốt nước.',
        'GPU 30-core lên đến 64GB vRAM - Render siêu tốc.',
        'Port Thunderbolt 5 x2 + USB-C x2 - Kết nối rộng mở.'
      ],
      specs: {
        chip: 'Apple M4 Max (14-core CPU, 30-core GPU)',
        display: 'Hỗ trợ 3 màn hình bên ngoài (6K/4K/5K)',
        storage: '500GB/ 1TB / 2TB / 4TB SSD',
        ports: '2x Thunderbolt 5, 2x USB-C 3.1, HDMI 2.1, Gigabit Ethernet, Kensington Lock',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3',
        weight: '2.3 kg / 5.1 lbs',
        dimensions: '7.7 x 7.7 x 3.7 inches',
        graphics: 'M4 Max GPU with up to 64GB unified memory'
      },
      colors: [
        { name: 'Silver', hex: '#E3E4E5', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83dadc?q=80&w=1470&auto=format&fit=crop' }
      ],
      storageOptions: [
        { capacity: '500GB SSD', priceAdd: 0 },
        { capacity: '1TB SSD', priceAdd: 400 },
        { capacity: '2TB SSD', priceAdd: 800 },
        { capacity: '4TB SSD', priceAdd: 1600 }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83dadc?q=80&w=1470&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83dadc?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop'
      ]
    }
  ];

  await Product.insertMany(productsData);
  
  // ── BANNERS ──
  const bannersData = [
    { title: 'Mac mini M4', subtitle: 'Siêu nhỏ. Siêu khủng.', link: '/product/mac-mini-m4', bgColor: '#000', type: 'main', order: 1 },
    { title: 'iPhone 17 Pro Max', subtitle: 'Kỷ nguyên AI thực thụ.', link: '/product/iphone-17-pro-max', bgColor: '#161617', type: 'main', order: 2 },
    { title: 'Macbook Pro', subtitle: 'Hiệu năng rúng động.', link: '/product/macbook-pro-14-m4', bgColor: '#f5f5f7', textColor: 'dark', type: 'secondary', order: 3 },
    { title: 'Apple Watch Ultra', subtitle: 'Bền bỉ nhất thế giới.', link: '/shop/watch', bgColor: '#000', type: 'secondary', order: 4 }
  ];
  await Banner.insertMany(bannersData);

  // ── ADMIN USER ──
  const adminExists = await User.findOne({ email: 'admin@apple.com' });
  if (!adminExists) {
    await User.create({ name: 'Admin', email: 'admin@apple.com', password: 'admin123', role: 'admin', phone: '0900000000' });
  }

  console.log('🎉 Banner System & PRO-GRADE Catalog Reset Completed!');
  process.exit(0);
};

seedData().catch(err => { console.error('❌ Reset error:', err); process.exit(1); });
