import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X, ShoppingCart, Leaf, Sparkles, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

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

export default function AdminProductsPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'herbal' | 'spiritual' | 'books'>('all')
  const [products, setProducts] = useState<Product[]>([
    // Herbal Medicines
    { id: 'h1', name: 'Tariqi Jahangiri Hair Oil', description: 'Premium herbal hair oil for hair growth, strength and natural shine.', price: 3500, category: 'herbal', image: '/images/tariqi-jahangiri-hair-oil.jpg', stock: 40, featured: true },
    { id: 'h2', name: 'Johar E Shifa Extract (Honey)', description: 'Pure honey-based herbal extract with healing properties for overall health.', price: 3500, category: 'herbal', image: '/images/johar-shifa-honey.jpg', stock: 35, featured: true },
    { id: 'h3', name: 'Herbal Pain Relief Capsules', description: 'Natural herbal capsules for effective pain relief without side effects.', price: 2500, category: 'herbal', image: '/images/herbal-pain-relief-capsules.jpg', stock: 50, featured: false },
    { id: 'h4', name: 'Neuro Brain Strengthening Course', description: 'Complete herbal treatment course for brain health and memory enhancement.', price: 7500, category: 'herbal', image: '/images/neuro-brain-course.jpg', stock: 25, featured: true },
    { id: 'h5', name: 'Sugar Course', description: 'Natural herbal treatment course for diabetes management and blood sugar control.', price: 7500, category: 'herbal', image: '/images/sugar-course.jpg', stock: 30, featured: true },
    { id: 'h6', name: 'Psoriasis Chambal Course', description: 'Specialized herbal treatment course for psoriasis and skin conditions.', price: 7500, category: 'herbal', image: '/images/psoriasis-chambal-course.jpg', stock: 20, featured: false },
    { id: 'h7', name: 'Uterine Fibroid Treatment Course', description: 'Complete herbal treatment program for uterine fibroids without surgery.', price: 9000, category: 'herbal', image: '/images/uterine-fibroid-course.jpg', stock: 15, featured: true },
    { id: 'h8', name: 'Weight Loss Course', description: 'Natural herbal weight loss program for healthy and sustainable results.', price: 7500, category: 'herbal', image: '/images/weight-loss-course.jpg', stock: 40, featured: true },
    { id: 'h9', name: 'Female Infertility Treatment Course', description: 'Comprehensive herbal treatment for female fertility issues and conception.', price: 10000, category: 'herbal', image: '/images/female-infertility-course.jpg', stock: 20, featured: true },
    { id: 'h10', name: "Women's Fertility & Miscarriage Care Course", description: 'Complete herbal care program for fertility enhancement and miscarriage prevention.', price: 10000, category: 'herbal', image: '/images/women-fertility-miscarriage-course.jpg', stock: 18, featured: true },
    { id: 'h11', name: 'Stomach & Digestion Care Course', description: 'Herbal treatment course for digestive issues, acidity and stomach problems.', price: 7500, category: 'herbal', image: '/images/stomach-digestion-course.jpg', stock: 35, featured: false },
    { id: 'h12', name: 'Male Infertility Treatment Course', description: 'Natural herbal treatment program for male fertility and reproductive health.', price: 10000, category: 'herbal', image: '/images/male-infertility-course.jpg', stock: 20, featured: true },
    { id: 'h13', name: 'Hemorrhoids (Bleeding & Enlarged) Treatment Course', description: 'Effective herbal treatment for hemorrhoids, bleeding and anal fissures.', price: 7500, category: 'herbal', image: '/images/hemorrhoids-treatment-course.jpg', stock: 25, featured: false },
    { id: 'h14', name: 'Kidney Health Course', description: 'Complete herbal program for kidney health, stones and urinary problems.', price: 7500, category: 'herbal', image: '/images/kidney-health-course.jpg', stock: 22, featured: false },
    { id: 'h15', name: 'Allergic Rhinitis (Dust) Care Course', description: 'Natural herbal treatment for allergies, dust sensitivity and rhinitis.', price: 7500, category: 'herbal', image: '/images/allergic-rhinitis-course.jpg', stock: 28, featured: false },
    { id: 'h16', name: 'Joint Pain Relief Course (One Month)', description: 'One month herbal treatment program for joint pain, arthritis and inflammation.', price: 7500, category: 'herbal', image: '/images/joint-pain-relief-course.jpg', stock: 30, featured: false },
    { id: 'h17', name: 'Muhafiz E Hayat (Treatment of 300+ Diseases)', description: 'Universal herbal medicine for prevention and treatment of 300+ common diseases.', price: 2500, category: 'herbal', image: '/images/muhafiz-hayat.jpg', stock: 60, featured: true },
    { id: 'h18', name: 'Rohani Shifa Powder (Herbal)', description: 'Powerful spiritual and herbal healing powder for various ailments.', price: 3500, category: 'herbal', image: '/images/rohani-shifa-powder-herbal.jpg', stock: 25, featured: false },
    { id: 'h19', name: 'Marriage Preparation Course (For Males)', description: 'Complete herbal program for male vitality, strength and marriage preparation.', price: 12000, category: 'herbal', image: '/images/marriage-preparation-males-course.jpg', stock: 15, featured: true },
    // Spiritual Healing Items
    { id: 's1', name: 'Naag Phani Hisaar Keel', description: 'Powerful spiritual protection item for removing negative energies and black magic.', price: 4000, category: 'spiritual', image: '/images/naag-phani-keel.jpg', stock: 20, featured: true },
    { id: 's2', name: 'Bakhoor e Jinaat', description: 'Special incense for spiritual cleansing and protection against jinn.', price: 2000, category: 'spiritual', image: '/images/bakhoor-jinaat.jpg', stock: 50, featured: true },
    { id: 's3', name: 'Silver Loh e Mushtari', description: 'Premium silver Sharf e Mustari Looh for maximum spiritual benefits and protection.', price: 6500, category: 'spiritual', image: '/images/silver-loh-mushtari.jpg', stock: 10, featured: true },
    { id: 's4', name: 'Metal Loh e Mushtari', description: 'High-quality metal Sharf e Mustari Looh for spiritual strength and blessings.', price: 3500, category: 'spiritual', image: '/images/metal-loh-mushtari.jpg', stock: 25, featured: false },
    { id: 's5', name: 'Paper Loh e Mushtari', description: 'Affordable paper version of Sharf e Mustari Looh with authentic spiritual power.', price: 2500, category: 'spiritual', image: '/images/paper-loh-mushtari.jpg', stock: 40, featured: false },
    { id: 's6', name: 'Bakhoor e Tariqi', description: 'Special Tariqi blend incense for spiritual healing and positive energy.', price: 1500, category: 'spiritual', image: '/images/bakhoor-tariqi.jpg', stock: 60, featured: true },
    { id: 's7', name: 'Atar e Tariqi', description: 'Blessed spiritual fragrance oil for protection and spiritual enhancement.', price: 3500, category: 'spiritual', image: '/images/atar-tariqi.jpg', stock: 30, featured: true },
    { id: 's8', name: 'Taweez E Khaas (Asma e Ashab e Badar)', description: 'Special handwritten taveez with blessed names of Companions of Badr for protection.', price: 2000, category: 'spiritual', image: '/images/taweez-khaas-badar.jpg', stock: 35, featured: true },
    { id: 's9', name: 'Rohani Shifa Powder', description: 'Powerful spiritual healing powder for various ailments and spiritual problems.', price: 3500, category: 'spiritual', image: '/images/rohani-shifa-powder.jpg', stock: 25, featured: true },
    { id: 's10', name: 'Original Black Aqiq Tasbeeh (100 Beads)', description: 'Authentic black Aqeeq stone prayer beads with 100 beads for spiritual practices and blessings.', price: 2500, category: 'spiritual', image: '/images/black-aqiq-tasbeeh.jpg', stock: 40, featured: true },
    { id: 's11', name: 'Original Red Aqiq Tasbeeh (100 Beads)', description: 'Authentic red Aqeeq stone prayer beads with 100 beads for spiritual practices and blessings.', price: 2500, category: 'spiritual', image: '/images/red-aqiq-tasbeeh.jpg', stock: 35, featured: true },
    // Amliyat Books
    { id: 'b1', name: 'Dua e Hizbul Bahar Juwahir E Amliyat', description: 'Comprehensive collection of 200 powerful spiritual practices and amaals including Dua e Hizbul Bahar.', price: 2000, category: 'books', image: '/images/juwahir-amliyat-hizbul-bahar.jpg', stock: 30, featured: true },
  ])

  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editForm, setEditForm] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'herbal',
    image: '',
    stock: 0,
    featured: false,
  })

  const handleEdit = (product: Product) => {
    setIsEditing(product.id)
    setEditForm(product)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const handleSave = () => {
    if (isAdding) {
      const newProduct = {
        ...editForm,
        id: Date.now().toString(),
      }
      setProducts([...products, newProduct])
      setIsAdding(false)
    } else {
      setProducts(products.map((p) => (p.id === editForm.id ? editForm : p)))
      setIsEditing(null)
    }
    setEditForm({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'herbal',
      image: '',
      stock: 0,
      featured: false,
    })
  }

  const handleCancel = () => {
    setIsEditing(null)
    setIsAdding(false)
    setEditForm({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'herbal',
      image: '',
      stock: 0,
      featured: false,
    })
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setIsEditing(null)
    setEditForm({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: 'herbal',
      image: '',
      stock: 0,
      featured: false,
    })
  }

  return (
    <>
      <Helmet>
        <title>Admin - Manage Products | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white">
            Manage Products
          </h1>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-5 w-5" />
            Add New Product
          </Button>
        </div>

        {/* Category Filter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'all' ? 'scale-110' : ''}`}>
              <ShoppingCart className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">All Products</span>
          </button>
          <button
            onClick={() => setSelectedCategory('herbal')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'herbal'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'herbal' ? 'scale-110' : ''}`}>
              <Leaf className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">Herbal Medicines</span>
          </button>
          <button
            onClick={() => setSelectedCategory('spiritual')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'spiritual'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'spiritual' ? 'scale-110' : ''}`}>
              <Sparkles className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">Spiritual Healing Items</span>
          </button>
          <button
            onClick={() => setSelectedCategory('books')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'books'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'books' ? 'scale-110' : ''}`}>
              <BookOpen className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">Amliyat Books</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {isAdding ? 'Add New Product' : 'Edit Product'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as 'herbal' | 'spiritual' | 'books' })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="herbal">Herbal Medicines</option>
                  <option value="spiritual">Spiritual Healing Items</option>
                  <option value="books">Amliyat Books</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (PKR)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter stock quantity"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Image Path</label>
                <input
                  type="text"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="/images/product-image.jpg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  📏 Recommended: 400x300px (Landscape 4:3 ratio) | Max: 500KB | Format: JPG/PNG
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload image to /public/images/ folder and enter path here
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.featured}
                    onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured Product</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Product
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="grid grid-cols-1 gap-6">
          {products
            .filter((product) => selectedCategory === 'all' || product.category === selectedCategory)
            .map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center gap-6"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  {product.featured && (
                    <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {product.description}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="bg-primary-100 dark:bg-primary-900 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  <span className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                    Stock: {product.stock}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-600 mt-3">
                  PKR {product.price}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(product)}
                  variant="outline"
                  size="icon"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(product.id)}
                  variant="outline"
                  size="icon"
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Upload product images to <code>public/images/</code> folder first</li>
            <li>Use descriptive image names like: product-name.jpg</li>
            <li>Recommended image size: 500x500 pixels (1:1 ratio)</li>
            <li>Mark important products as "Featured" to highlight them</li>
            <li>Keep track of stock quantities</li>
            <li>For production: Connect to backend API for inventory management</li>
          </ul>
        </div>
      </div>
      </div>
    </>
  )
}
