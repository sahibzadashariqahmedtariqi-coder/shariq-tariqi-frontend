import { useState, useEffect } from 'react';
import { Check, X, Eye, Filter, Search, Trash2 } from 'lucide-react';
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
  customerPhone: string;
  shippingAddress?: string;
  amount: number;
  paymentStatus: string;
  paymentProof?: string;
  transactionId?: string;
  senderAccountNumber?: string;
  paymentDate?: string;
  createdAt: string;
  rejectionReason?: string;
  adminNotes?: string;
  customerMessage?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{id: string, number: string} | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter, typeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await api.get(`/orders?${params.toString()}`);
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      setActionLoading(true);
      const response = await api.put(`/orders/${selectedOrder._id}/verify`, {
        adminNotes,
      });
      
      if (response.data.success) {
        await fetchOrders();
        setShowModal(false);
        setSelectedOrder(null);
        setAdminNotes('');
        toast.success('Payment verified successfully! ✅', {
          duration: 4000,
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
          },
          icon: '✅',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify payment', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason', {
        duration: 3000,
        style: {
          background: '#F59E0B',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
        },
        icon: '⚠️',
      });
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await api.put(`/orders/${selectedOrder._id}/reject`, {
        rejectionReason,
      });
      
      if (response.data.success) {
        await fetchOrders();
        setShowModal(false);
        setSelectedOrder(null);
        setRejectionReason('');
        toast.error('Payment rejected and customer notified 🚫', {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
          },
          icon: '🚫',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject payment', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    setOrderToDelete({ id: orderId, number: orderNumber });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      setActionLoading(true);
      const response = await api.delete(`/orders/${orderToDelete.id}`);
      
      if (response.data.success) {
        await fetchOrders();
        setShowDeleteModal(false);
        setOrderToDelete(null);
        toast.success('Order deleted successfully 🗑️', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
          },
          icon: '🗑️',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete order', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setAdminNotes(order.adminNotes || '');
    setRejectionReason(order.rejectionReason || '');
  };

  const pendingCount = orders.filter(o => o.paymentStatus === 'pending').length;
  const verifiedCount = orders.filter(o => o.paymentStatus === 'verified').length;
  const rejectedCount = orders.filter(o => o.paymentStatus === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Orders Management</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Verified</p>
              <p className="text-2xl font-bold text-green-900">{verifiedCount}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="product">Products</option>
              <option value="appointment">Appointments</option>
            </select>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
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
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.paymentStatus === 'verified' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Type</p>
                  <p className="font-medium capitalize">{selectedOrder.orderType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedOrder.customerPhone}</p>
                </div>
                {selectedOrder.orderType === 'product' && selectedOrder.shippingAddress && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium">{selectedOrder.shippingAddress}</p>
                  </div>
                )}
                {selectedOrder.orderType === 'appointment' && (
                  <>
                    {selectedOrder.appointmentDate && (
                      <div>
                        <p className="text-sm text-gray-500">Appointment Date</p>
                        <p className="font-medium">{selectedOrder.appointmentDate}</p>
                      </div>
                    )}
                    {selectedOrder.appointmentTime && (
                      <div>
                        <p className="text-sm text-gray-500">Appointment Time</p>
                        <p className="font-medium">{selectedOrder.appointmentTime}</p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">Rs. {selectedOrder.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Item</p>
                  <p className="font-medium">{selectedOrder.itemTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              {selectedOrder.customerMessage && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Customer Message</p>
                  <p className="text-blue-800">{selectedOrder.customerMessage}</p>
                </div>
              )}

              {selectedOrder.transactionId && (
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{selectedOrder.transactionId}</p>
                </div>
              )}

              {selectedOrder.senderAccountNumber && (
                <div>
                  <p className="text-sm text-gray-500">Sender Account Number</p>
                  <p className="font-medium">{selectedOrder.senderAccountNumber}</p>
                </div>
              )}

              {selectedOrder.paymentProof && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Payment Proof</p>
                  <img 
                    src={selectedOrder.paymentProof} 
                    alt="Payment Proof" 
                    className="max-w-full h-auto border rounded-lg cursor-pointer"
                    onClick={() => window.open(selectedOrder.paymentProof, '_blank')}
                  />
                </div>
              )}

              {selectedOrder.paymentStatus === 'pending' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Add notes about this order..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Reason for rejection..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleVerifyPayment}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      <Check className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Verify Payment'}
                    </button>
                    <button
                      onClick={handleRejectPayment}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      <X className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Reject Payment'}
                    </button>
                  </div>
                </>
              )}

              {selectedOrder.paymentStatus === 'verified' && selectedOrder.adminNotes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium mb-1">Admin Notes</p>
                  <p className="text-sm text-gray-700">{selectedOrder.adminNotes}</p>
                </div>
              )}

              {selectedOrder.paymentStatus === 'rejected' && selectedOrder.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason</p>
                  <p className="text-sm text-gray-700">{selectedOrder.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order</h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete order
              </p>
              <p className="text-lg font-bold text-red-600 mb-4 font-mono">
                {orderToDelete.number}
              </p>
              <p className="text-sm text-red-600 mb-6">
                ⚠️ This action cannot be undone!
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOrderToDelete(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
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
                      <Trash2 className="w-4 h-4" />
                      Delete Order
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

export default AdminOrdersPage;
