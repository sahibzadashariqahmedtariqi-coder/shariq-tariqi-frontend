import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  orderType: string;
  itemTitle: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  deletedAt: string;
  deletedBy?: {
    name: string;
  };
}

const AdminTrashPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTrashedOrders();
  }, []);

  const fetchTrashedOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders?includeDeleted=true');
      if (response.data.success) {
        // Filter only deleted orders on frontend as well
        const deletedOrders = response.data.data.filter((order: Order) => order.deletedAt);
        setOrders(deletedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch trashed orders:', error);
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (orderId: string, orderNumber: string) => {
    try {
      setActionLoading(true);
      const response = await api.put(`/orders/${orderId}/restore`);
      
      if (response.data.success) {
        await fetchTrashedOrders();
        toast.success(`Order ${orderNumber} restored successfully! ♻️`, {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
          },
          icon: '♻️',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to restore order');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      const response = await api.delete(`/orders/${selectedOrder._id}/permanent`);
      
      if (response.data.success) {
        await fetchTrashedOrders();
        setShowDeleteModal(false);
        setSelectedOrder(null);
        toast.success('Order permanently deleted! 🗑️', {
          duration: 3000,
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
          },
          icon: '🗑️',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="w-8 h-8 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
          </div>
          <p className="text-gray-600">Deleted orders can be restored or permanently deleted</p>
        </div>

        {/* Orders Count */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items in Trash</p>
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Trash2 className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trash...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">Trash is empty</p>
            <p className="text-sm text-gray-400 mt-2">Deleted orders will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800 capitalize">
                        {order.orderType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{order.customerName}</div>
                      <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.itemTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs. {order.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{format(new Date(order.deletedAt), 'MMM dd, yyyy')}</div>
                      {order.deletedBy && (
                        <div className="text-xs text-gray-400">by {order.deletedBy.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(order._id, order.orderNumber)}
                          disabled={actionLoading}
                          className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1 disabled:opacity-50"
                          title="Restore"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDeleteModal(true);
                          }}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                          title="Delete Permanently"
                        >
                          <X className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">Permanently Delete Order</h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-2">
                Are you sure you want to permanently delete order
              </p>
              <p className="text-lg font-bold text-red-600 mb-2 font-mono">
                {selectedOrder.orderNumber}
              </p>
              <p className="text-sm text-red-600 font-bold mb-6">
                ⚠️ This action CANNOT be undone!
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOrder(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDelete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrashPage;
