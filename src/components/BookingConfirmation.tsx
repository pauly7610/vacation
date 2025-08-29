import React, { useState } from 'react';
import { Check, CreditCard, User, Mail, Phone, Calendar, MapPin, Plane, Hotel, Clock, Shield, AlertCircle, X } from 'lucide-react';

interface BookingConfirmationProps {
  booking: any;
  bookingType: 'flights' | 'hotels' | 'activities';
  onConfirm: (bookingData: any) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  email: string;
  phone: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  bookingType,
  onConfirm,
  onCancel,
  isOpen
}) => {
  const [step, setStep] = useState<'details' | 'passenger' | 'payment' | 'confirmation'>('details');
  const [passengers, setPassengers] = useState<PassengerInfo[]>([{
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    passportNumber: '',
    email: '',
    phone: ''
  }]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const validatePassengerInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        newErrors[`passenger${index}_firstName`] = 'First name is required';
      }
      if (!passenger.lastName.trim()) {
        newErrors[`passenger${index}_lastName`] = 'Last name is required';
      }
      if (!passenger.email.trim() || !/\S+@\S+\.\S+/.test(passenger.email)) {
        newErrors[`passenger${index}_email`] = 'Valid email is required';
      }
      if (!passenger.phone.trim()) {
        newErrors[`passenger${index}_phone`] = 'Phone number is required';
      }
      if (bookingType === 'flights' && !passenger.dateOfBirth) {
        newErrors[`passenger${index}_dateOfBirth`] = 'Date of birth is required for flights';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!paymentInfo.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Valid 16-digit card number is required';
    }
    if (!paymentInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiryDate = 'Valid expiry date (MM/YY) is required';
    }
    if (!paymentInfo.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Valid CVV is required';
    }
    if (!paymentInfo.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    if (!paymentInfo.billingAddress.street.trim()) {
      newErrors.billingStreet = 'Billing address is required';
    }
    if (!paymentInfo.billingAddress.city.trim()) {
      newErrors.billingCity = 'City is required';
    }
    if (!paymentInfo.billingAddress.zipCode.trim()) {
      newErrors.billingZipCode = 'ZIP code is required';
    }
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    switch (step) {
      case 'details':
        setStep('passenger');
        break;
      case 'passenger':
        if (validatePassengerInfo()) {
          setStep('payment');
        }
        break;
      case 'payment':
        if (validatePaymentInfo()) {
          processBooking();
        }
        break;
    }
  };

  const processBooking = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingData = {
        booking,
        passengers,
        paymentInfo,
        bookingType,
        confirmationNumber: generateConfirmationNumber(),
        bookingDate: new Date().toISOString(),
        totalAmount: booking.price.amount
      };
      
      setStep('confirmation');
      onConfirm(bookingData);
    } catch (error) {
      setErrors({ payment: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateConfirmationNumber = (): string => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getBookingIcon = () => {
    switch (bookingType) {
      case 'flights': return <Plane className="w-6 h-6" />;
      case 'hotels': return <Hotel className="w-6 h-6" />;
      case 'activities': return <MapPin className="w-6 h-6" />;
    }
  };

  const getBookingTitle = () => {
    switch (bookingType) {
      case 'flights': return `${booking.departure?.airport} → ${booking.arrival?.airport}`;
      case 'hotels': return booking.name;
      case 'activities': return booking.title;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getBookingIcon()}
                <div>
                  <h2 className="text-xl font-bold">Complete Your Booking</h2>
                  <p className="text-blue-100 text-sm">{getBookingTitle()}</p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="mt-6 flex items-center space-x-4">
              {['details', 'passenger', 'payment', 'confirmation'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName ? 'bg-white text-blue-600' :
                    ['details', 'passenger', 'payment', 'confirmation'].indexOf(step) > index ? 'bg-blue-300 text-blue-800' :
                    'bg-blue-400 text-blue-100'
                  }`}>
                    {['details', 'passenger', 'payment', 'confirmation'].indexOf(step) > index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      ['details', 'passenger', 'payment', 'confirmation'].indexOf(step) > index ? 'bg-blue-300' : 'bg-blue-400'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'details' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Booking Details</h3>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  {bookingType === 'flights' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{booking.airline} {booking.flightNumber}</p>
                          <p className="text-sm text-gray-600">{booking.departure?.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">{booking.price?.formatted}</p>
                          <p className="text-sm text-gray-600">per person</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <p className="font-medium">{booking.departure?.time}</p>
                          <p className="text-gray-600">{booking.departure?.airport}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="font-medium">{booking.duration}</p>
                          <p className="text-gray-600">{booking.stops === 0 ? 'Direct' : `${booking.stops} stop(s)`}</p>
                        </div>
                        <div>
                          <p className="font-medium">{booking.arrival?.time}</p>
                          <p className="text-gray-600">{booking.arrival?.airport}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {bookingType === 'hotels' && (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">{booking.name}</p>
                          <p className="text-sm text-gray-600">{booking.address}</p>
                          <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < booking.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">{booking.price?.formatted}</p>
                          <p className="text-sm text-gray-600">per night</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {bookingType === 'activities' && (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">{booking.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{booking.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{booking.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400">★</span>
                              <span>{booking.rating} ({booking.reviewCount} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">{booking.price?.formatted}</p>
                          <p className="text-sm text-gray-600">per person</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Continue to Passenger Information
                </button>
              </div>
            )}

            {step === 'passenger' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Passenger Information</h3>
                
                {passengers.map((passenger, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h4 className="font-medium text-gray-800">Passenger {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                        <input
                          type="text"
                          value={passenger.firstName}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].firstName = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`passenger${index}_firstName`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`passenger${index}_firstName`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}_firstName`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].lastName = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`passenger${index}_lastName`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`passenger${index}_lastName`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}_lastName`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].email = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`passenger${index}_email`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`passenger${index}_email`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}_email`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                        <input
                          type="tel"
                          value={passenger.phone}
                          onChange={(e) => {
                            const newPassengers = [...passengers];
                            newPassengers[index].phone = e.target.value;
                            setPassengers(newPassengers);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`passenger${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`passenger${index}_phone`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}_phone`]}</p>
                        )}
                      </div>
                      
                      {bookingType === 'flights' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                            <input
                              type="date"
                              value={passenger.dateOfBirth}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].dateOfBirth = e.target.value;
                                setPassengers(newPassengers);
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors[`passenger${index}_dateOfBirth`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {errors[`passenger${index}_dateOfBirth`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}_dateOfBirth`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                            <input
                              type="text"
                              value={passenger.passportNumber || ''}
                              onChange={(e) => {
                                const newPassengers = [...passengers];
                                newPassengers[index].passportNumber = e.target.value;
                                setPassengers(newPassengers);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h4 className="font-medium text-gray-800">Credit Card Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: formatCardNumber(e.target.value) })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          setPaymentInfo({ ...paymentInfo, expiryDate: value });
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, '') })}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardholderName}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardholderName: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h4 className="font-medium text-gray-800">Billing Address</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                      <input
                        type="text"
                        value={paymentInfo.billingAddress.street}
                        onChange={(e) => setPaymentInfo({
                          ...paymentInfo,
                          billingAddress: { ...paymentInfo.billingAddress, street: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.billingStreet ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.billingStreet && <p className="text-red-500 text-xs mt-1">{errors.billingStreet}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={paymentInfo.billingAddress.city}
                        onChange={(e) => setPaymentInfo({
                          ...paymentInfo,
                          billingAddress: { ...paymentInfo.billingAddress, city: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.billingCity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.billingCity && <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        value={paymentInfo.billingAddress.zipCode}
                        onChange={(e) => setPaymentInfo({
                          ...paymentInfo,
                          billingAddress: { ...paymentInfo.billingAddress, zipCode: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.billingZipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.billingZipCode && <p className="text-red-500 text-xs mt-1">{errors.billingZipCode}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Secure Payment</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('passenger')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Complete Booking</span>
                      </>
                    )}
                  </button>
                </div>
                
                {errors.payment && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{errors.payment}</span>
                  </div>
                )}
              </div>
            )}

            {step === 'confirmation' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600">Your booking has been successfully processed.</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-4">Confirmation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Confirmation Number:</span>
                      <span className="font-mono font-medium text-green-800">{generateConfirmationNumber()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Booking Date:</span>
                      <span className="text-green-800">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Amount:</span>
                      <span className="font-semibold text-green-800">{booking.price?.formatted}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to {passengers[0]?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Please save your confirmation number for future reference.
                  </p>
                </div>
                
                <button
                  onClick={onCancel}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};