import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, UserCheck, UserX, Search, Mail, Phone, User as UserIcon, ArrowLeft, BookOpen, Key, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/services/api'
import toast from 'react-hot-toast'

interface GrantedCourse {
  courseId: {
    _id: string
    title: string
    image?: string
    isPaid?: boolean
    price?: number
  }
  grantedBy?: {
    name: string
    email: string
  }
  grantedAt: string
  expiresAt?: string
  notes?: string
}

interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'user' | 'admin'
  isSuperAdmin?: boolean
  createdAt: string
  enrolledCourses?: string[]
  grantedCourses?: GrantedCourse[]
}

interface Course {
  _id: string
  title: string
  image: string
  isPaid: boolean
  price: number
}

interface NewUserForm {
  name: string
  email: string
  password: string
  phone: string
  role: 'user' | 'admin'
}

export default function AdminUsersPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Course Access Modal State
  const [showCourseAccessModal, setShowCourseAccessModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [userCourseAccess, setUserCourseAccess] = useState<{grantedCourses: GrantedCourse[], enrolledCourses: any[]}>({grantedCourses: [], enrolledCourses: []})
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [accessNotes, setAccessNotes] = useState('')
  const [accessExpiry, setAccessExpiry] = useState('')
  
  // Password Change Modal State (Super Admin only)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  
  const [formData, setFormData] = useState<NewUserForm>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'
  })

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    fetchUsers()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/auth/users')
      if (response.data?.data) {
        setUsers(response.data.data)
        setFilteredUsers(response.data.data)
      }
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/courses?limit=100')
      const coursesData = response.data?.data || response.data || []
      // Filter only paid courses for access management
      const paidCourses = coursesData.filter((c: Course) => c.isPaid)
      setCourses(paidCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchUserCourseAccess = async (userId: string) => {
    try {
      const response = await apiClient.get(`/auth/users/${userId}/courses`)
      if (response.data?.data) {
        setUserCourseAccess({
          grantedCourses: response.data.data.grantedCourses || [],
          enrolledCourses: response.data.data.enrolledCourses || []
        })
      }
    } catch (error) {
      console.error('Error fetching user course access:', error)
      setUserCourseAccess({grantedCourses: [], enrolledCourses: []})
    }
  }

  const handleOpenCourseAccess = async (userData: User) => {
    setSelectedUser(userData)
    await fetchUserCourseAccess(userData._id)
    setShowCourseAccessModal(true)
  }

  const handleGrantAccess = async () => {
    if (!selectedUser || !selectedCourseId) {
      toast.error('Please select a course')
      return
    }

    try {
      await apiClient.post(`/auth/users/${selectedUser._id}/grant-course`, {
        courseId: selectedCourseId,
        notes: accessNotes,
        expiresAt: accessExpiry || undefined
      })
      toast.success('Course access granted successfully!')
      await fetchUserCourseAccess(selectedUser._id)
      setSelectedCourseId('')
      setAccessNotes('')
      setAccessExpiry('')
    } catch (error: any) {
      console.error('Error granting access:', error)
      toast.error(error.response?.data?.message || 'Failed to grant access')
    }
  }

  const handleRevokeAccess = async (courseId: string) => {
    if (!selectedUser) return
    
    if (!window.confirm('Are you sure you want to revoke access to this course?')) {
      return
    }

    try {
      await apiClient.delete(`/auth/users/${selectedUser._id}/revoke-course/${courseId}`)
      toast.success('Course access revoked!')
      await fetchUserCourseAccess(selectedUser._id)
    } catch (error: any) {
      console.error('Error revoking access:', error)
      toast.error(error.response?.data?.message || 'Failed to revoke access')
    }
  }

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await apiClient.post('/auth/register', formData)
      if (response.data) {
        toast.success('User created successfully!')
        setShowModal(false)
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'user'
        })
        fetchUsers()
      }
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await apiClient.delete(`/auth/users/${userId}`)
      toast.success('User deleted successfully!')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    
    try {
      await apiClient.put(`/auth/users/${userId}/role`, { role: newRole })
      toast.success(`User role updated to ${newRole}!`)
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating role:', error)
      toast.error(error.response?.data?.message || 'Failed to update role')
    }
  }

  // Super Admin: Change user password
  const handleChangePassword = async () => {
    if (!passwordChangeUser || !newPassword) {
      toast.error('Please enter a new password')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await apiClient.put(`/auth/users/${passwordChangeUser._id}/change-password`, {
        newPassword
      })
      toast.success(`Password changed successfully for ${passwordChangeUser.name}!`)
      setShowPasswordModal(false)
      setPasswordChangeUser(null)
      setNewPassword('')
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Users | Admin Dashboard</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-2">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create and manage user accounts
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            size="lg"
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New User
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {users.length}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Total Users
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Admins
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Students
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((userData) => (
                    <tr key={userData._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {userData.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {userData.email}
                          </div>
                          {userData.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {userData.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          userData.isSuperAdmin
                            ? 'bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-300'
                            : userData.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {userData.isSuperAdmin ? '👑 Super Admin' : userData.role === 'admin' ? '👑 Admin' : '👤 Student'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {userData.role === 'user' && (
                            <button
                              onClick={() => handleOpenCourseAccess(userData)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Manage Course Access"
                            >
                              <Key className="h-5 w-5" />
                            </button>
                          )}
                          {/* Super Admin password change button - only visible to super admin */}
                          {user?.isSuperAdmin && (
                            <button
                              onClick={() => {
                                setPasswordChangeUser(userData)
                                setNewPassword('')
                                setShowPasswordModal(true)
                              }}
                              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                              title="Change Password"
                            >
                              <Key className="h-5 w-5" />
                            </button>
                          )}
                          {/* Hide role change and delete for Super Admin users */}
                          {!userData.isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleToggleRole(userData._id, userData.role)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                title={`Change to ${userData.role === 'admin' ? 'User' : 'Admin'}`}
                              >
                                {userData.role === 'admin' ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(userData._id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete User"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No users found matching your search' : 'No users yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold mb-6 text-primary-800 dark:text-white">
                Create New User
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <UserIcon className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    User Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="user">Student (Regular User)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={handleCreateUser}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  Create User
                </Button>
                <Button
                  onClick={() => {
                    setShowModal(false)
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      phone: '',
                      role: 'user'
                    })
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Course Access Modal */}
        {showCourseAccessModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-800 dark:text-white">
                  <Key className="inline h-6 w-6 mr-2 text-gold-500" />
                  Manage Course Access
                </h2>
                <button
                  onClick={() => {
                    setShowCourseAccessModal(false)
                    setSelectedUser(null)
                    setSelectedCourseId('')
                    setAccessNotes('')
                    setAccessExpiry('')
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Grant New Access */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4">
                  <Plus className="inline h-5 w-5 mr-1" />
                  Grant Course Access
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Course *</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Select a paid course --</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title} (Rs. {course.price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Access Expiry (Optional)</label>
                      <input
                        type="date"
                        value={accessExpiry}
                        onChange={(e) => setAccessExpiry(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <input
                        type="text"
                        value={accessNotes}
                        onChange={(e) => setAccessNotes(e.target.value)}
                        placeholder="e.g., Special student discount"
                        className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleGrantAccess}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Grant Access
                  </Button>
                </div>
              </div>

              {/* Current Granted Courses */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  <BookOpen className="inline h-5 w-5 mr-1 text-gold-500" />
                  Granted Courses ({userCourseAccess.grantedCourses.length})
                </h3>
                {userCourseAccess.grantedCourses.length > 0 ? (
                  <div className="space-y-3">
                    {userCourseAccess.grantedCourses.map((grant, index) => (
                      <div key={index} className="flex items-center justify-between bg-gold-50 dark:bg-gold-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          {grant.courseId?.image && (
                            <img src={grant.courseId.image} alt="" className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {grant.courseId?.title || 'Course'}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Granted: {new Date(grant.grantedAt).toLocaleDateString()}
                              {grant.expiresAt && ` | Expires: ${new Date(grant.expiresAt).toLocaleDateString()}`}
                            </p>
                            {grant.notes && (
                              <p className="text-xs text-gray-400 italic">Note: {grant.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeAccess(grant.courseId?._id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Revoke Access"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No courses granted to this user yet
                  </p>
                )}
              </div>

              {/* Enrolled Courses (Paid) */}
              {userCourseAccess.enrolledCourses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    <BookOpen className="inline h-5 w-5 mr-1 text-primary-500" />
                    Paid/Enrolled Courses ({userCourseAccess.enrolledCourses.length})
                  </h3>
                  <div className="space-y-2">
                    {userCourseAccess.enrolledCourses.map((course: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                        {course?.image && (
                          <img src={course.image} alt="" className="w-10 h-10 rounded object-cover" />
                        )}
                        <span className="text-gray-900 dark:text-white">{course?.title || 'Course'}</span>
                        <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Paid</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Change Modal - Super Admin Only */}
        {showPasswordModal && passwordChangeUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  🔐 Change Password
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordChangeUser(null)
                    setNewPassword('')
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Changing password for:
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {passwordChangeUser.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {passwordChangeUser.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordChangeUser(null)
                      setNewPassword('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
