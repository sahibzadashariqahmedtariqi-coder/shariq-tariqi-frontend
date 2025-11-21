import { useState } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

interface Order {
  _id: string;
  orderNumber: string;
  orderType: string;
  itemTitle: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  paymentProof?: string;
  transactionId?: string;
  rejectionReason?: string;
  adminNotes?: string;
  verifiedAt?: string;
}

const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOrder(null);

      const response = await api.get(`/orders/track/${orderNumber}`);
      
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Order not found. Please check your order number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-8 h-8" />,
          title: 'Payment Verified',
          message: 'Your payment has been verified successfully!',
        };
      case 'rejected':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <XCircle className="w-8 h-8" />,
          title: 'Payment Rejected',
          message: 'Your payment was rejected. Please check the reason below.',
        };
      default:
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <Clock className="w-8 h-8" />,
          title: 'Payment Pending',
          message: 'Your payment is under review. We will verify it soon.',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Package className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number to check payment status</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="Enter Order Number (e.g., C12345678901)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 flex items-center gap-2 font-medium"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Status Banner */}
            <div className={`${getStatusInfo(order.paymentStatus).bgColor} border-b ${getStatusInfo(order.paymentStatus).borderColor} p-6`}>
              <div className="flex items-center gap-4">
                <div className={getStatusInfo(order.paymentStatus).color}>
                  {getStatusInfo(order.paymentStatus).icon}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${getStatusInfo(order.paymentStatus).color}`}>
                    {getStatusInfo(order.paymentStatus).title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {getStatusInfo(order.paymentStatus).message}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Admin Notes - TOP */}
              {order.paymentStatus === 'verified' && order.adminNotes && (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">Admin Notes</h4>
                    <p className="text-gray-700">{order.adminNotes}</p>
                    {order.verifiedAt && (
                      <p className="text-sm text-green-600 mt-2">
                        Verified on {format(new Date(order.verifiedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason - RIGHT AFTER ADMIN NOTES */}
              {order.paymentStatus === 'rejected' && order.rejectionReason && (
                <div className={order.adminNotes ? 'border-t pt-6' : ''}>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Rejection Reason</h4>
                    <p className="text-gray-700">{order.rejectionReason}</p>
                    <p className="text-sm text-red-600 mt-3">
                      Please contact us for more information or to resolve this issue.
                    </p>
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-mono font-bold text-lg text-gray-900">{order.orderNumber}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-medium text-gray-900">{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Order Type</p>
                    <p className="font-medium text-gray-900 capitalize">{order.orderType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="font-bold text-xl text-emerald-600">Rs. {order.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-600 font-medium mb-1">
                    {order.orderType === 'course' ? 'Course' : order.orderType === 'product' ? 'Product' : 'Service'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{order.itemTitle}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              {order.transactionId && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="font-mono font-medium text-gray-900">{order.transactionId}</p>
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {order.paymentProof && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Proof</h3>
                  <img 
                    src={order.paymentProof} 
                    alt="Payment Proof" 
                    className="max-w-md h-auto border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => window.open(order.paymentProof, '_blank')}
                  />
                </div>
              )}

              {/* Status Timeline */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Created</p>
                      <p className="text-sm text-gray-600">{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${order.paymentProof ? 'bg-emerald-600' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Payment Proof Submitted</p>
                      {order.paymentProof && (
                        <p className="text-sm text-gray-600">Submitted successfully</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${
                      order.paymentStatus === 'verified' ? 'bg-green-600' : 
                      order.paymentStatus === 'rejected' ? 'bg-red-600' : 
                      'bg-yellow-500'
                    } rounded-full flex items-center justify-center`}>
                      {order.paymentStatus === 'verified' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : order.paymentStatus === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{order.paymentStatus}</p>
                      {order.verifiedAt && (
                        <p className="text-sm text-gray-600">{format(new Date(order.verifiedAt), 'MMM dd, yyyy HH:mm')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
