import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

dotenv.config();

const products = [
  // Herbal Medicines
  {
    name: 'Tariqi Jahangiri Hair Oil',
    description: 'Premium herbal hair oil for hair growth, strength and natural shine.',
    price: 3500,
    category: 'herbs',
    image: '/images/tariqi-jahangiri-hair-oil.jpg',
    stock: 40,
    isFeatured: true,
  },
  {
    name: 'Johar E Shifa Extract (Honey)',
    description: 'Pure honey-based herbal extract with healing properties for overall health.',
    price: 3500,
    category: 'herbs',
    image: '/images/johar-shifa-honey.jpg',
    stock: 35,
    isFeatured: true,
  },
  {
    name: 'Herbal Pain Relief Capsules',
    description: 'Natural herbal capsules for effective pain relief without side effects.',
    price: 2500,
    category: 'herbs',
    image: '/images/herbal-pain-relief-capsules.jpg',
    stock: 50,
    isFeatured: false,
  },
  {
    name: 'Neuro Brain Strengthening Course',
    description: 'Complete herbal treatment course for brain health and memory enhancement.',
    price: 7500,
    category: 'herbs',
    image: '/images/neuro-brain-course.jpg',
    stock: 25,
    isFeatured: true,
  },
  {
    name: 'Sugar Course',
    description: 'Natural herbal treatment course for diabetes management and blood sugar control.',
    price: 7500,
    category: 'herbs',
    image: '/images/sugar-course.jpg',
    stock: 30,
    isFeatured: true,
  },
  {
    name: 'Psoriasis Chambal Course',
    description: 'Specialized herbal treatment course for psoriasis and skin conditions.',
    price: 7500,
    category: 'herbs',
    image: '/images/psoriasis-chambal-course.jpg',
    stock: 20,
    isFeatured: false,
  },
  {
    name: 'Uterine Fibroid Treatment Course',
    description: 'Complete herbal treatment program for uterine fibroids without surgery.',
    price: 9000,
    category: 'herbs',
    image: '/images/uterine-fibroid-course.jpg',
    stock: 15,
    isFeatured: true,
  },
  {
    name: 'Weight Loss Course',
    description: 'Natural herbal weight loss program for healthy and sustainable results.',
    price: 7500,
    category: 'herbs',
    image: '/images/weight-loss-course.jpg',
    stock: 40,
    isFeatured: true,
  },
  {
    name: 'Female Infertility Treatment Course',
    description: 'Comprehensive herbal treatment for female fertility issues and conception.',
    price: 10000,
    category: 'herbs',
    image: '/images/female-infertility-course.jpg',
    stock: 20,
    isFeatured: true,
  },
  {
    name: "Women's Fertility & Miscarriage Care Course",
    description: 'Complete herbal care program for fertility enhancement and miscarriage prevention.',
    price: 10000,
    category: 'herbs',
    image: '/images/women-fertility-miscarriage-course.jpg',
    stock: 18,
    isFeatured: true,
  },
  {
    name: 'Stomach & Digestion Care Course',
    description: 'Herbal treatment course for digestive issues, acidity and stomach problems.',
    price: 7500,
    category: 'herbs',
    image: '/images/stomach-digestion-course.jpg',
    stock: 35,
    isFeatured: false,
  },
  {
    name: 'Male Infertility Treatment Course',
    description: 'Natural herbal treatment program for male fertility and reproductive health.',
    price: 10000,
    category: 'herbs',
    image: '/images/male-infertility-course.jpg',
    stock: 20,
    isFeatured: true,
  },
  {
    name: 'Hemorrhoids (Bleeding & Enlarged) Treatment Course',
    description: 'Effective herbal treatment for hemorrhoids, bleeding and anal fissures.',
    price: 7500,
    category: 'herbs',
    image: '/images/hemorrhoids-treatment-course.jpg',
    stock: 25,
    isFeatured: false,
  },
  {
    name: 'Kidney Health Course',
    description: 'Complete herbal program for kidney health, stones and urinary problems.',
    price: 7500,
    category: 'herbs',
    image: '/images/kidney-health-course.jpg',
    stock: 22,
    isFeatured: false,
  },
  {
    name: 'Allergic Rhinitis (Dust) Care Course',
    description: 'Natural herbal treatment for allergies, dust sensitivity and rhinitis.',
    price: 7500,
    category: 'herbs',
    image: '/images/allergic-rhinitis-course.jpg',
    stock: 28,
    isFeatured: false,
  },
  {
    name: 'Joint Pain Relief Course (One Month)',
    description: 'One month herbal treatment program for joint pain, arthritis and inflammation.',
    price: 7500,
    category: 'herbs',
    image: '/images/joint-pain-relief-course.jpg',
    stock: 30,
    isFeatured: false,
  },
  {
    name: 'Muhafiz E Hayat (Treatment of 300+ Diseases)',
    description: 'Universal herbal medicine for prevention and treatment of 300+ common diseases.',
    price: 2500,
    category: 'herbs',
    image: '/images/muhafiz-hayat.jpg',
    stock: 60,
    isFeatured: true,
  },
  {
    name: 'Rohani Shifa Powder (Herbal)',
    description: 'Powerful spiritual and herbal healing powder for various ailments.',
    price: 3500,
    category: 'herbs',
    image: '/images/rohani-shifa-powder-herbal.jpg',
    stock: 25,
    isFeatured: false,
  },
  {
    name: 'Marriage Preparation Course (For Males)',
    description: 'Complete herbal program for male vitality, strength and marriage preparation.',
    price: 12000,
    category: 'herbs',
    image: '/images/marriage-preparation-males-course.jpg',
    stock: 15,
    isFeatured: true,
  },

  // Spiritual Healing Items
  {
    name: 'Naag Phani Hisaar Keel',
    description: 'Powerful spiritual protection item for removing negative energies and black magic.',
    price: 4000,
    category: 'taweez',
    image: '/images/naag-phani-keel.jpg',
    stock: 20,
    isFeatured: true,
  },
  {
    name: 'Bakhoor e Jinaat',
    description: 'Special incense for spiritual cleansing and protection against jinn.',
    price: 2000,
    category: 'taweez',
    image: '/images/bakhoor-jinaat.jpg',
    stock: 50,
    isFeatured: true,
  },
  {
    name: 'Silver Loh e Mushtari',
    description: 'Premium silver Sharf e Mustari Looh for maximum spiritual benefits and protection.',
    price: 6500,
    category: 'taweez',
    image: '/images/silver-loh-mushtari.jpg',
    stock: 10,
    isFeatured: true,
  },
  {
    name: 'Metal Loh e Mushtari',
    description: 'High-quality metal Sharf e Mustari Looh for spiritual strength and blessings.',
    price: 3500,
    category: 'taweez',
    image: '/images/metal-loh-mushtari.jpg',
    stock: 25,
    isFeatured: false,
  },
  {
    name: 'Paper Loh e Mushtari',
    description: 'Affordable paper version of Sharf e Mustari Looh with authentic spiritual power.',
    price: 2500,
    category: 'taweez',
    image: '/images/paper-loh-mushtari.jpg',
    stock: 40,
    isFeatured: false,
  },
  {
    name: 'Bakhoor e Tariqi',
    description: 'Special Tariqi blend incense for spiritual healing and positive energy.',
    price: 1500,
    category: 'taweez',
    image: '/images/bakhoor-tariqi.jpg',
    stock: 60,
    isFeatured: true,
  },
  {
    name: 'Atar e Tariqi',
    description: 'Blessed spiritual fragrance oil for protection and spiritual enhancement.',
    price: 3500,
    category: 'taweez',
    image: '/images/atar-tariqi.jpg',
    stock: 30,
    isFeatured: true,
  },
  {
    name: 'Taweez E Khaas (Asma e Ashab e Badar)',
    description: 'Special handwritten taveez with blessed names of Companions of Badr for protection.',
    price: 2000,
    category: 'taweez',
    image: '/images/taweez-khaas-badar.jpg',
    stock: 35,
    isFeatured: true,
  },
  {
    name: 'Rohani Shifa Powder',
    description: 'Powerful spiritual healing powder for various ailments and spiritual problems.',
    price: 3500,
    category: 'taweez',
    image: '/images/rohani-shifa-powder.jpg',
    stock: 25,
    isFeatured: true,
  },
  {
    name: 'Original Black Aqiq Tasbeeh (100 Beads)',
    description: 'Authentic black Aqeeq stone prayer beads with 100 beads for spiritual practices and blessings.',
    price: 2500,
    category: 'taweez',
    image: '/images/black-aqiq-tasbeeh.jpg',
    stock: 40,
    isFeatured: true,
  },
  {
    name: 'Original Red Aqiq Tasbeeh (100 Beads)',
    description: 'Authentic red Aqeeq stone prayer beads with 100 beads for spiritual practices and blessings.',
    price: 2500,
    category: 'taweez',
    image: '/images/red-aqiq-tasbeeh.jpg',
    stock: 35,
    isFeatured: true,
  },

  // Amliyat Books
  {
    name: 'Dua e Hizbul Bahar Juwahir E Amliyat',
    description: 'Comprehensive collection of 200 powerful spiritual practices and amaals including Dua e Hizbul Bahar.',
    price: 2000,
    category: 'other',
    image: '/images/juwahir-amliyat-hizbul-bahar.jpg',
    stock: 30,
    isFeatured: true,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Products cleared');

    console.log('📦 Adding products to database...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products added successfully!`);

    console.log('\n📊 Summary:');
    const herbs = createdProducts.filter(p => p.category === 'herbs').length;
    const oils = createdProducts.filter(p => p.category === 'oils').length;
    const taweez = createdProducts.filter(p => p.category === 'taweez').length;
    const other = createdProducts.filter(p => p.category === 'other').length;
    const featured = createdProducts.filter(p => p.isFeatured).length;

    console.log(`  • Herbs: ${herbs}`);
    console.log(`  • Oils: ${oils}`);
    console.log(`  • Taweez: ${taweez}`);
    console.log(`  • Other: ${other}`);
    console.log(`  • Featured: ${featured}`);
    console.log(`\n✅ Total: ${createdProducts.length} products\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
