const ZARINPAL_MERCHANT_ID = 'b729df92-1260-46c9-8400-010e93e7b7d2';
const ZARINPAL_REQUEST_URL = 'https://payment.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_VERIFY_URL = 'https://payment.zarinpal.com/pg/v4/payment/verify.json';
const ZARINPAL_GATEWAY_URL = 'https://payment.zarinpal.com/pg/StartPay/';

export interface PaymentRequestData {
  amount: number;
  description: string;
  callback_url: string;
  currency?: 'IRT';
  metadata?: {
    mobile?: string;
    email?: string;
    order_id?: string;
  };
}

export interface PaymentRequestResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    fee_type: string;
    fee: number;
  };
  errors: string[];
}

export interface PaymentVerifyData {
  amount: number;
  authority: string;
}

export interface PaymentVerifyResponse {
  data: {
    code: number;
    message: string;
    card_hash?: string;
    card_pan?: string;
    ref_id?: number;
    fee_type?: string;
    fee?: number;
  };
  errors: string[];
}

export class ZarinPal {
  static async requestPayment(data: PaymentRequestData): Promise<PaymentRequestResponse> {
    try {
      const requestData = {
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: data.amount,
        description: data.description,
        callback_url: data.callback_url,
        currency: data.currency || 'IRT',
        metadata: data.metadata || {},
      };

      const response = await fetch(ZARINPAL_REQUEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      console.log('ZarinPal response:', result);
      
      if (result.errors && typeof result.errors === 'object' && result.errors.message) {
        throw new Error(`ZarinPal request failed: ${result.errors.message} (Code: ${result.errors.code})`);
      }

      if (result.data && result.data.code !== 100) {
        throw new Error(`ZarinPal request failed: ${result.data.message} (Code: ${result.data.code})`);
      }

      return result;
    } catch (error) {
      console.error('ZarinPal request error:', error);
      throw error;
    }
  }

  static async verifyPayment(data: PaymentVerifyData): Promise<PaymentVerifyResponse> {
    try {
      const verifyData = {
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: data.amount,
        authority: data.authority,
      };

      const response = await fetch(ZARINPAL_VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(verifyData),
      });

      const result = await response.json();
      
      console.log('ZarinPal verify response:', result);
      
      if (result.errors && typeof result.errors === 'object' && result.errors.message) {
        throw new Error(`ZarinPal verify failed: ${result.errors.message} (Code: ${result.errors.code})`);
      }

      return result;
    } catch (error) {
      console.error('ZarinPal verify error:', error);
      throw error;
    }
  }

  static getPaymentUrl(authority: string): string {
    return `${ZARINPAL_GATEWAY_URL}${authority}`;
  }

  static formatAmount(amount: number, currency: 'IRT' = 'IRT'): string {
    return `${amount.toLocaleString('fa-IR')} تومان`;
  }

  static getStatusMessage(code: number): string {
    const messages: { [key: number]: string } = {
      100: 'تراکنش موفق',
      101: 'تراکنش وریفای شده',
      102: 'merchant یافت نشد',
      103: 'merchant غیرفعال',
      104: 'merchant نامعتبر',
      105: 'amount بایستی بزرگتر از 1,000 ریال باشد',
      106: 'callbackUrl نامعتبر میباشد. (شروع با http و یا https)',
      110: 'amount بیشتر از حد مجاز میباشد',
      111: 'description حداکثر میتواند 255 کاراکتر باشد',
      112: 'reseller_id نامعتبر میباشد',
      113: 'amount منفی میباشد',
      201: 'قبلا وریفای شده',
      202: 'سفارش پرداخت نشده یا ناموفق بوده است',
      203: 'trackId نامعتبر میباشد',
    };

    return messages[code] || `خطای نامشخص (کد: ${code})`;
  }
}