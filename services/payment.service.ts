import api from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'upi' | 'wallet' | 'cod';
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
  paymentMethodId: string;
  currency?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
}

export interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export interface UPIDetails {
  upiId: string;
}

const PaymentService = {
  // Get available payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/payment/methods');
    return response.data;
  },

  // Process payment
  processPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post('/payment/process', paymentData);
    return response.data;
  },

  // Process card payment
  processCardPayment: async (
    paymentData: PaymentRequest,
    cardDetails: CardDetails
  ): Promise<PaymentResponse> => {
    const response = await api.post('/payment/card', {
      ...paymentData,
      cardDetails,
    });
    return response.data;
  },

  // Process UPI payment
  processUPIPayment: async (
    paymentData: PaymentRequest,
    upiDetails: UPIDetails
  ): Promise<PaymentResponse> => {
    const response = await api.post('/payment/upi', {
      ...paymentData,
      upiDetails,
    });
    return response.data;
  },

  // Process wallet payment
  processWalletPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post('/payment/wallet', paymentData);
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (transactionId: string): Promise<PaymentResponse> => {
    const response = await api.get(`/payment/verify/${transactionId}`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (): Promise<any[]> => {
    const response = await api.get('/payment/history');
    return response.data;
  },

  // Refund payment
  refundPayment: async (transactionId: string, amount?: number): Promise<PaymentResponse> => {
    const response = await api.post(`/payment/refund/${transactionId}`, {
      amount,
    });
    return response.data;
  },

  // Get default payment methods (for offline use)
  getDefaultPaymentMethods: (): PaymentMethod[] => {
    return [
      {
        id: 'cod',
        name: 'Cash on Delivery',
        type: 'cod',
        icon: 'cash-outline',
        enabled: true,
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        type: 'card',
        icon: 'card-outline',
        enabled: true,
      },
      {
        id: 'upi',
        name: 'UPI',
        type: 'upi',
        icon: 'phone-portrait-outline',
        enabled: true,
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        type: 'wallet',
        icon: 'wallet-outline',
        enabled: true,
      },
    ];
  },
};

export default PaymentService;