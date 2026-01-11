import { useState, useEffect, useRef } from 'react';
import { X, Upload, CreditCard, AlertCircle, CheckCircle2, Clock, Download } from 'lucide-react';
import { apiClient } from '@/services/api';
import html2canvas from 'html2canvas';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'course' | 'product' | 'appointment';
  itemId: string;
  itemTitle: string;
  itemPrice: number;
  quantity?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  customerMessage?: string;
}

interface BankDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  ibanNumber: string;
  bankBranch: string;
  paymentInstructions: string;
}

const CheckoutModal = ({
  isOpen,
  onClose,
  orderType,
  itemId,
  itemTitle,
  itemPrice,
  quantity = 1,
  appointmentDate,
  appointmentTime,
  customerMessage,
}: CheckoutModalProps) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Form data
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [phoneError, setPhoneError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  
  // Payment proof
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const totalAmount = itemPrice * quantity;

  useEffect(() => {
    if (isOpen) {
      fetchBankDetails();
    } else {
      // Reset state when modal closes
      setStep('details');
      setOrderId(null);
      setOrderNumber('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCountryCode('+92');
      setPhoneError('');
      setShippingAddress('');
      setPaymentProof(null);
      setTransactionId('');
      setSenderAccount('');
    }
  }, [isOpen]);

  const fetchBankDetails = async () => {
    try {
      const response = await apiClient.get('/settings');
      if (response.data.success) {
        setBankDetails(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    }
  };

  const validatePhone = (phone: string, code: string): boolean => {
    const phoneDigits = phone.replace(/\D/g, '');
    
    const countryRules: { [key: string]: { length: number; name: string } } = {
      '+92': { length: 10, name: 'Pakistan' },
      '+1': { length: 10, name: 'USA/Canada' },
      '+44': { length: 10, name: 'UK' },
      '+91': { length: 10, name: 'India' },
      '+971': { length: 9, name: 'UAE' },
      '+966': { length: 9, name: 'Saudi Arabia' },
      '+962': { length: 9, name: 'Jordan' },
      '+20': { length: 10, name: 'Egypt' },
    };

    const rule = countryRules[code];
    if (!rule) return phoneDigits.length >= 9 && phoneDigits.length <= 15;
    
    if (phoneDigits.length !== rule.length) {
      setPhoneError(`${rule.name} requires exactly ${rule.length} digits`);
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerEmail || !customerPhone) {
      alert('Please fill all required fields');
      return;
    }

    if (!validatePhone(customerPhone, countryCode)) {
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${customerPhone.replace(/\D/g, '')}`;
      
      const response = await apiClient.post('/orders', {
        orderType,
        itemId,
        customerName,
        customerEmail,
        customerPhone: fullPhone,
        shippingAddress: orderType === 'product' ? shippingAddress : undefined,
        appointmentDate,
        appointmentTime,
        quantity,
        customerMessage,
      });

      if (response.data.success) {
        setOrderId(response.data.data._id);
        setStep('payment');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleUploadPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProof) {
      alert('Please upload payment proof');
      return;
    }

    try {
      setUploadLoading(true);

      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append('image', paymentProof);

      // Use public endpoint for products and appointments, authenticated for courses
      const uploadEndpoint = (orderType === 'product' || orderType === 'appointment')
        ? '/upload/payment-proof?folder=payments' 
        : '/upload/image?folder=payments';

      const uploadResponse = await apiClient.post(uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadResponse.data.data.url;

      // Submit payment proof
      const response = await apiClient.put(`/orders/${orderId}/payment`, {
        paymentProof: imageUrl,
        transactionId,
        senderAccountNumber: senderAccount,
      });

      if (response.data.success) {
        // Show order number in success screen
        setOrderNumber(response.data.data.orderNumber);
        setStep('success');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUploadLoading(false);
    }
  };

  // Download receipt as image
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    
    try {
      setDownloadingReceipt(true);
      
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });
      
      // Convert to image and download
      const link = document.createElement('a');
      link.download = `Receipt-${orderNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please take a screenshot instead.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && step !== 'success') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'details' ? 'Order Details' : step === 'payment' ? 'Payment Information' : 'Order Confirmed'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-emerald-900 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Item:</span> {itemTitle}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Type:</span> {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
              </p>
              {quantity > 1 && (
                <p className="text-gray-700">
                  <span className="font-medium">Quantity:</span> {quantity}
                </p>
              )}
              {appointmentDate && (
                <p className="text-gray-700">
                  <span className="font-medium">Appointment:</span> {appointmentDate} at {appointmentTime}
                </p>
              )}
              <p className="text-lg font-bold text-emerald-900 mt-2">
                Total Amount: Rs. {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {step === 'details' && (
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (WhatsApp) *
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setPhoneError('');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="+92">🇵🇰 +92</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+962">🇯🇴 +962</option>
                    <option value="+20">🇪🇬 +20</option>
                  </select>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCustomerPhone(value);
                        setPhoneError('');
                      }}
                      placeholder={countryCode === '+92' ? '3001234567' : 'Phone number'}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        phoneError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {countryCode === '+92' && 'Enter 10 digits (e.g., 3001234567)'}
                      {countryCode === '+1' && 'Enter 10 digits'}
                      {countryCode === '+44' && 'Enter 10 digits'}
                      {countryCode === '+91' && 'Enter 10 digits'}
                      {countryCode === '+971' && 'Enter 9 digits'}
                      {countryCode === '+966' && 'Enter 9 digits'}
                      {countryCode === '+962' && 'Enter 9 digits'}
                      {countryCode === '+20' && 'Enter 10 digits'}
                    </p>
                  </div>
                </div>
              </div>

              {orderType === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your complete address"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          )}

          {step === 'payment' && bankDetails && (
            <div className="space-y-6">
              {/* Bank Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-3">Bank Transfer Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-blue-200 pb-2">
                        <span className="text-gray-600">Bank Name:</span>
                        <span className="font-medium text-gray-900">{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-200 pb-2">
                        <span className="text-gray-600">Account Title:</span>
                        <span className="font-medium text-gray-900">{bankDetails.accountTitle}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-200 pb-2">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium text-gray-900">{bankDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-200 pb-2">
                        <span className="text-gray-600">IBAN:</span>
                        <span className="font-medium text-gray-900">{bankDetails.ibanNumber}</span>
                      </div>
                      {bankDetails.bankBranch && (
                        <div className="flex justify-between pb-2">
                          <span className="text-gray-600">Branch:</span>
                          <span className="font-medium text-gray-900">{bankDetails.bankBranch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-100 rounded p-3 mt-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">{bankDetails.paymentInstructions}</p>
                  </div>
                </div>
              </div>

              {/* Payment Proof Upload */}
              <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Receipt/Screenshot *
                  </label>
                  
                  {/* Image Preview */}
                  {paymentProof && (
                    <div className="mb-4 border-2 border-emerald-300 rounded-lg p-4 bg-emerald-50">
                      <div className="flex items-start gap-4">
                        <img
                          src={URL.createObjectURL(paymentProof)}
                          alt="Payment proof preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-white shadow-md"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-emerald-900 mb-1">✓ Image Selected</p>
                          <p className="text-sm text-gray-700 mb-2">{paymentProof.name}</p>
                          <p className="text-xs text-gray-600">
                            Size: {(paymentProof.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => setPaymentProof(null)}
                            className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove & choose another
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    paymentProof ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-emerald-500'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label htmlFor="payment-proof" className="cursor-pointer">
                      <Upload className={`w-12 h-12 mx-auto mb-2 ${
                        paymentProof ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                      <p className="text-sm text-gray-600">
                        {paymentProof ? 'Click to change payment proof' : 'Click to upload payment proof'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter transaction ID from receipt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Account number you paid from"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading || !paymentProof}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {uploadLoading ? 'Uploading...' : 'Submit Payment Proof'}
                </button>
              </form>
            </div>
          )}

          {/* Success Screen */}
          {step === 'success' && (
            <div className="text-center py-8">
              {/* Receipt Container - This will be captured as image */}
              <div 
                ref={receiptRef}
                className="bg-white rounded-xl p-6 mb-6"
                style={{ minWidth: '350px' }}
              >
                {/* Receipt Header with Logo */}
                <div className="border-b-2 border-emerald-500 pb-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Sahibzada Shariq Ahmed Tariqi</h2>
                  <p className="text-sm text-gray-500">Spiritual Healing & Guidance</p>
                </div>

                {/* Order Confirmed Badge */}
                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
                  ✓ ORDER CONFIRMED
                </div>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Item:</span>
                      <span className="font-medium text-gray-900 text-right max-w-[200px]">{itemTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium text-gray-900 capitalize">{orderType}</span>
                    </div>
                    {quantity > 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-medium text-gray-900">{quantity}</span>
                      </div>
                    )}
                    {appointmentDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Appointment:</span>
                        <span className="font-medium text-gray-900">{appointmentDate} at {appointmentTime}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="text-gray-700 font-semibold">Total Amount:</span>
                      <span className="font-bold text-emerald-600 text-lg">Rs. {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Number */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Order Number</p>
                  <p className="text-2xl font-bold text-emerald-600 font-mono tracking-wider">
                    {orderNumber}
                  </p>
                </div>

                {/* Customer Info */}
                <div className="text-left text-xs text-gray-500 mb-4">
                  <p><span className="font-medium">Customer:</span> {customerName}</p>
                  <p><span className="font-medium">Email:</span> {customerEmail}</p>
                  <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString('en-PK', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-400">Thank you for your trust in us</p>
                  <p className="text-xs text-emerald-600 font-medium">www.shariqahmedtariqi.com</p>
                </div>
              </div>

              {/* Processing Time Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-blue-900 mb-1">Order Processing Time</p>
                    <p className="text-sm text-blue-800">
                      Your order will be processed within <span className="font-bold">3-4 working days</span>. 
                      You will receive a confirmation once your payment is verified by our admin team.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Download Receipt Button */}
                <button
                  onClick={handleDownloadReceipt}
                  disabled={downloadingReceipt}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  {downloadingReceipt ? 'Generating Receipt...' : 'Download Receipt as Image'}
                </button>
                
                <button
                  onClick={() => window.location.href = `/track-order`}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Track Your Order
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // Reset form
                    setStep('details');
                    setOrderId(null);
                    setOrderNumber('');
                    setCustomerName('');
                    setCustomerEmail('');
                    setCustomerPhone('');
                    setCountryCode('+92');
                    setPhoneError('');
                    setShippingAddress('');
                    setPaymentProof(null);
                    setTransactionId('');
                    setSenderAccount('');
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
