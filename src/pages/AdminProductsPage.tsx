import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  featured: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Islamic Prayer Beads (Tasbih)',
      description: 'Handcrafted 99-bead tasbih made from premium wood',
      price: 1500,
      category: 'Religious Items',
      image: '/images/tasbih.jpg',
      stock: 50,
      featured: true,
    },
    {
      id: '2',
      name: 'Spiritual Healing Book',
      description: 'Comprehensive guide to spiritual healing practices',
      price: 2500,
      category: 'Books',
      image: '/images/book.jpg',
      stock: 30,
      featured: true,
    },
    {
      id: '3',
      name: 'Blessed Taveez',
      description: 'Handwritten taveez for protection and blessings',
      price: 500,
      category: 'Amulets',
      image: '/images/taveez.jpg',
      stock: 100,
      featured: false,
    },
  ])

  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editForm, setEditForm] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'Religious Items',
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
      category: 'Religious Items',
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
      category: 'Religious Items',
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
      category: 'Religious Items',
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
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Religious Items">Religious Items</option>
                  <option value="Books">Books</option>
                  <option value="Amulets">Amulets</option>
                  <option value="Oils">Oils</option>
                  <option value="Herbs">Herbs</option>
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
                <p className="text-sm text-gray-500 mt-1">
                  Upload image to public/images/ folder and enter path here
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
          {products.map((product) => (
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
    </>
  )
}
