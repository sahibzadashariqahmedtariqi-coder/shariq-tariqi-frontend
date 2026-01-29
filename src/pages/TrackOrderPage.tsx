import { useState } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
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
  currency?: string;
  paymentStatus: string;
  createdAt: string;
  paymentProof?: string;
  transactionId?: string;
  rejectionReason?: string;
  adminNotes?: string;
  verifiedAt?: string;
  purpose?: string;
  donorMessage?: string;
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 py-12 px-4 relative overflow-hidden">
      {/* Background Logo Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12] pointer-events-none">
        <img 
          src="/images/logo.png" 
          alt="Background Logo" 
          className="w-[500px] h-[500px] md:w-[600px] md:h-[600px] object-contain"
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gold-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-800/50 text-primary-700 dark:text-gold-400 px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Order Tracking</span>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl mb-6"
          >
            <Package className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 mb-3">
            Track Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Enter your order or donation number to check status</p>
        </motion.div>

        {/* Search Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gold-200/50 dark:border-primary-700/50"
        >
          <form onSubmit={handleTrackOrder} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="Enter Order/Donation Number (e.g., DON-2601-0002)"
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-lg transition-all"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Track Order'}
            </motion.button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Order Details */}
        {order && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gold-200/50 dark:border-primary-700/50"
          >
            {/* Status Banner */}
            <div className={`${getStatusInfo(order.paymentStatus).bgColor} border-b ${getStatusInfo(order.paymentStatus).borderColor} p-6`}>
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={getStatusInfo(order.paymentStatus).color}
                >
                  {getStatusInfo(order.paymentStatus).icon}
                </motion.div>
                <div>
                  <h2 className={`text-2xl font-bold ${getStatusInfo(order.paymentStatus).color}`}>
                    {getStatusInfo(order.paymentStatus).title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {getStatusInfo(order.paymentStatus).message}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Admin Notes - TOP */}
              {order.paymentStatus === 'verified' && order.adminNotes && (
                <div>
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">Admin Notes</h4>
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
                    <p className="font-bold text-xl text-emerald-600">
                      {order.currency === 'INR' ? '₹' : 'Rs.'} {order.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {order.orderType === 'donation' ? 'Donation Details' : 'Item Details'}
                </h3>
                <div className={`${order.orderType === 'donation' ? 'bg-gold-50 border-gold-200' : 'bg-emerald-50 border-emerald-200'} border rounded-lg p-4`}>
                  <p className={`text-sm font-medium mb-1 ${order.orderType === 'donation' ? 'text-gold-600' : 'text-emerald-600'}`}>
                    {order.orderType === 'donation' ? (
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> Donation</span>
                    ) : order.orderType === 'course' ? 'Course' : order.orderType === 'product' ? 'Product' : 'Service'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{order.itemTitle}</p>
                  {order.donorMessage && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{order.donorMessage}"</p>
                  )}
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
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className={`flex-shrink-0 w-8 h-8 ${
                      order.paymentStatus === 'verified' ? 'bg-green-600' : 
                      order.paymentStatus === 'rejected' ? 'bg-red-600' : 
                      'bg-yellow-500'
                    } rounded-full flex items-center justify-center shadow-lg`}>
                      {order.paymentStatus === 'verified' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : order.paymentStatus === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{order.paymentStatus}</p>
                      {order.verifiedAt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{format(new Date(order.verifiedAt), 'MMM dd, yyyy HH:mm')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
