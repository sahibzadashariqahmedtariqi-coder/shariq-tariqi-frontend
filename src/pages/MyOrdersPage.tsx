import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';

interface Order {
  _id: string;
  orderNumber: string;
  orderType: string;
  itemTitle: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  paymentDate?: string;
  rejectionReason?: string;
}

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track your purchases and enrollments</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Start shopping or enroll in courses to see your orders here</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.itemTitle}
                          </h3>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                            {order.orderType}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Order #:</span> {order.orderNumber}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> Rs. {order.amount.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </div>

                        {order.rejectionReason && (
                          <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800">
                              <span className="font-medium">Rejection Reason:</span> {order.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                          {getStatusIcon(order.paymentStatus)}
                          <span className="text-sm font-medium capitalize">{order.paymentStatus}</span>
                        </div>

                        {order.paymentStatus === 'verified' && order.orderType === 'course' && (
                          <button
                            onClick={() => navigate(`/courses/${order._id}`)}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Course
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
