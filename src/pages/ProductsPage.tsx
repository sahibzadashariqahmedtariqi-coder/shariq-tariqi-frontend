import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Leaf, Book, Sparkles, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: 'herbal' | 'spiritual' | 'books'
  image: string
  stock: number
  featured: boolean
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'herbal' | 'spiritual' | 'books'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const products: Product[] = [
    // Herbal Medicines
    {
      id: 'h1',
      name: 'Tariqi Jahangiri Hair Oil',
      description: 'Premium herbal hair oil for hair growth, strength and natural shine.',
      price: 3500,
      category: 'herbal',
      image: '/images/tariqi-jahangiri-hair-oil.jpg',
      stock: 40,
      featured: true,
    },
    {
      id: 'h2',
      name: 'Johar E Shifa Extract (Honey)',
      description: 'Pure honey-based herbal extract with healing properties for overall health.',
      price: 3500,
      category: 'herbal',
      image: '/images/johar-shifa-honey.jpg',
      stock: 35,
      featured: true,
    },
    {
      id: 'h3',
      name: 'Herbal Pain Relief Capsules',
      description: 'Natural herbal capsules for effective pain relief without side effects.',
      price: 2500,
      category: 'herbal',
      image: '/images/herbal-pain-relief-capsules.jpg',
      stock: 50,
      featured: false,
    },
    {
      id: 'h4',
      name: 'Neuro Brain Strengthening Course',
      description: 'Complete herbal treatment course for brain health and memory enhancement.',
      price: 7500,
      category: 'herbal',
      image: '/images/neuro-brain-course.jpg',
      stock: 25,
      featured: true,
    },
    {
      id: 'h5',
      name: 'Sugar Course',
      description: 'Natural herbal treatment course for diabetes management and blood sugar control.',
      price: 7500,
      category: 'herbal',
      image: '/images/sugar-course.jpg',
      stock: 30,
      featured: true,
    },
    {
      id: 'h6',
      name: 'Psoriasis Chambal Course',
      description: 'Specialized herbal treatment course for psoriasis and skin conditions.',
      price: 7500,
      category: 'herbal',
      image: '/images/psoriasis-chambal-course.jpg',
      stock: 20,
      featured: false,
    },
    {
      id: 'h7',
      name: 'Uterine Fibroid Treatment Course',
      description: 'Complete herbal treatment program for uterine fibroids without surgery.',
      price: 9000,
      category: 'herbal',
      image: '/images/uterine-fibroid-course.jpg',
      stock: 15,
      featured: true,
    },
    {
      id: 'h8',
      name: 'Weight Loss Course',
      description: 'Natural herbal weight loss program for healthy and sustainable results.',
      price: 7500,
      category: 'herbal',
      image: '/images/weight-loss-course.jpg',
      stock: 40,
      featured: true,
    },
    {
      id: 'h9',
      name: 'Female Infertility Treatment Course',
      description: 'Comprehensive herbal treatment for female fertility issues and conception.',
      price: 10000,
      category: 'herbal',
      image: '/images/female-infertility-course.jpg',
      stock: 20,
      featured: true,
    },
    {
      id: 'h10',
      name: "Women's Fertility & Miscarriage Care Course",
      description: 'Complete herbal care program for fertility enhancement and miscarriage prevention.',
      price: 10000,
      category: 'herbal',
      image: '/images/women-fertility-miscarriage-course.jpg',
      stock: 18,
      featured: true,
    },
    {
      id: 'h11',
      name: 'Stomach & Digestion Care Course',
      description: 'Herbal treatment course for digestive issues, acidity and stomach problems.',
      price: 7500,
      category: 'herbal',
      image: '/images/stomach-digestion-course.jpg',
      stock: 35,
      featured: false,
    },
    {
      id: 'h12',
      name: 'Male Infertility Treatment Course',
      description: 'Natural herbal treatment program for male fertility and reproductive health.',
      price: 10000,
      category: 'herbal',
      image: '/images/male-infertility-course.jpg',
      stock: 20,
      featured: true,
    },
    {
      id: 'h13',
      name: 'Hemorrhoids (Bleeding & Enlarged) Treatment Course',
      description: 'Effective herbal treatment for hemorrhoids, bleeding and anal fissures.',
      price: 7500,
      category: 'herbal',
      image: '/images/hemorrhoids-treatment-course.jpg',
      stock: 25,
      featured: false,
    },
    {
      id: 'h14',
      name: 'Kidney Health Course',
      description: 'Complete herbal program for kidney health, stones and urinary problems.',
      price: 7500,
      category: 'herbal',
      image: '/images/kidney-health-course.jpg',
      stock: 22,
      featured: false,
    },
    {
      id: 'h15',
      name: 'Allergic Rhinitis (Dust) Care Course',
      description: 'Natural herbal treatment for allergies, dust sensitivity and rhinitis.',
      price: 7500,
      category: 'herbal',
      image: '/images/allergic-rhinitis-course.jpg',
      stock: 28,
      featured: false,
    },
    {
      id: 'h16',
      name: 'Joint Pain Relief Course (One Month)',
      description: 'One month herbal treatment program for joint pain, arthritis and inflammation.',
      price: 7500,
      category: 'herbal',
      image: '/images/joint-pain-relief-course.jpg',
      stock: 30,
      featured: false,
    },
    {
      id: 'h17',
      name: 'Muhafiz E Hayat (Treatment of 300+ Diseases)',
      description: 'Universal herbal medicine for prevention and treatment of 300+ common diseases.',
      price: 2500,
      category: 'herbal',
      image: '/images/muhafiz-hayat.jpg',
      stock: 60,
      featured: true,
    },
    {
      id: 'h18',
      name: 'Rohani Shifa Powder (Herbal)',
      description: 'Powerful spiritual and herbal healing powder for various ailments.',
      price: 3500,
      category: 'herbal',
      image: '/images/rohani-shifa-powder-herbal.jpg',
      stock: 25,
      featured: false,
    },
    {
      id: 'h19',
      name: 'Marriage Preparation Course (For Males)',
      description: 'Complete herbal program for male vitality, strength and marriage preparation.',
      price: 12000,
      category: 'herbal',
      image: '/images/marriage-preparation-males-course.jpg',
      stock: 15,
      featured: true,
    },
    
    // Spiritual Healing Items
    {
      id: '1',
      name: 'Naag Phani Hisaar Keel',
      description: 'Powerful spiritual protection item for removing negative energies and black magic.',
      price: 4000,
      category: 'spiritual',
      image: '/images/naag-phani-keel.jpg',
      stock: 20,
      featured: true,
    },
    {
      id: '2',
      name: 'Bakhoor e Jinaat',
      description: 'Special incense for spiritual cleansing and protection against jinn.',
      price: 2000,
      category: 'spiritual',
      image: '/images/bakhoor-jinaat.jpg',
      stock: 50,
      featured: true,
    },
    {
      id: '3',
      name: 'Silver Loh e Mushtari',
      description: 'Premium silver Sharf e Mustari Looh for maximum spiritual benefits and protection.',
      price: 6500,
      category: 'spiritual',
      image: '/images/silver-loh-mushtari.jpg',
      stock: 10,
      featured: true,
    },
    {
      id: '4',
      name: 'Metal Loh e Mushtari',
      description: 'High-quality metal Sharf e Mustari Looh for spiritual strength and blessings.',
      price: 3500,
      category: 'spiritual',
      image: '/images/metal-loh-mushtari.jpg',
      stock: 25,
      featured: false,
    },
    {
      id: '5',
      name: 'Paper Loh e Mushtari',
      description: 'Affordable paper version of Sharf e Mustari Looh with authentic spiritual power.',
      price: 2500,
      category: 'spiritual',
      image: '/images/paper-loh-mushtari.jpg',
      stock: 40,
      featured: false,
    },
    {
      id: '6',
      name: 'Bakhoor e Tariqi',
      description: 'Special Tariqi blend incense for spiritual healing and positive energy.',
      price: 1500,
      category: 'spiritual',
      image: '/images/bakhoor-tariqi.jpg',
      stock: 60,
      featured: true,
    },
    {
      id: '7',
      name: 'Atar e Tariqi',
      description: 'Blessed spiritual fragrance oil for protection and spiritual enhancement.',
      price: 3500,
      category: 'spiritual',
      image: '/images/atar-tariqi.jpg',
      stock: 30,
      featured: true,
    },
    {
      id: '8',
      name: 'Taweez E Khaas (Asma e Ashab e Badar)',
      description: 'Special handwritten taveez with blessed names of Companions of Badr for protection.',
      price: 2000,
      category: 'spiritual',
      image: '/images/taweez-khaas-badar.jpg',
      stock: 35,
      featured: true,
    },
    {
      id: '9',
      name: 'Rohani Shifa Powder',
      description: 'Powerful spiritual healing powder for various ailments and spiritual problems.',
      price: 3500,
      category: 'spiritual',
      image: '/images/rohani-shifa-powder.jpg',
      stock: 25,
      featured: true,
    },
    {
      id: '10',
      name: 'Original Black Aqiq Tasbeeh (100 Beads)',
      description: 'Authentic black Aqeeq stone prayer beads with 100 beads for spiritual practices and blessings.',
      price: 2500,
      category: 'spiritual',
      image: '/images/black-aqiq-tasbeeh.jpg',
      stock: 40,
      featured: true,
    },
    {
      id: '11',
      name: 'Original Red Aqiq Tasbeeh (100 Beads)',
      description: 'Authentic red Aqeeq stone prayer beads with 100 beads for spiritual practices and blessings.',
      price: 2500,
      category: 'spiritual',
      image: '/images/red-aqiq-tasbeeh.jpg',
      stock: 35,
      featured: true,
    },
    
    // Amliyat Books
    {
      id: '12',
      name: 'Dua e Hizbul Bahar Juwahir E Amliyat',
      description: 'Comprehensive collection of 200 powerful spiritual practices and amaals including Dua e Hizbul Bahar.',
      price: 2000,
      category: 'books',
      image: '/images/juwahir-amliyat-hizbul-bahar.jpg',
      stock: 30,
      featured: true,
    },
  ]

  const categories = [
    { id: 'all', name: 'All Products', icon: ShoppingCart },
    { id: 'herbal', name: 'Herbal Medicines', icon: Leaf },
    { id: 'spiritual', name: 'Spiritual Healing Items', icon: Sparkles },
    { id: 'books', name: 'Amliyat Books', icon: Book },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <Helmet>
        <title>Products | Sahibzada Shariq Ahmed Tariqi</title>
        <meta
          name="description"
          content="Shop authentic herbal medicines, spiritual healing items, and amliyat books for traditional Islamic healing."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-white mb-4">
              Our Products
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Authentic herbal medicines, spiritual healing items, and comprehensive amliyat books
              for traditional Islamic healing and spiritual practices.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-gray-800 dark:text-white"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
                      isActive
                        ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                        : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
                    }`}
                  >
                    <Icon className={`h-8 w-8 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-sm font-semibold text-center">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`/products/${product.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to online placeholder if image not found
                        e.currentTarget.src = 'https://placehold.co/400x300/1B4332/D4AF37?text=Product+Image'
                      }}
                    />
                    {product.featured && (
                      <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                    {product.stock < 10 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Low Stock
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        PKR {product.price}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Stock: {product.stock}
                      </div>
                    </div>

                    <Button className="w-full gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No products found matching your search.
              </p>
            </motion.div>
          )}

          {/* Contact for Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Need Help with Your Order?</h2>
            <p className="text-lg mb-6 opacity-90">
              Contact us for custom orders, bulk purchases, or any questions about our products.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                className="bg-white text-primary-800 hover:bg-gray-100"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Us
              </Button>
              <Button
                variant="outline"
                className="bg-white text-primary-800 hover:bg-gray-100"
                onClick={() => window.open('https://wa.me/YOUR_WHATSAPP_NUMBER', '_blank')}
              >
                WhatsApp Order
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
