import { NextRequest } from "next/server";

export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedData?: any;
}

export function validatePaymentRequest(request: NextRequest, data: any): PaymentValidationResult {
  try {
    const { amount, description, currency = 'IRT', metadata } = data;

    // Amount validation
    if (!amount || typeof amount !== 'number') {
      return { isValid: false, error: "مبلغ معتبر نیست" };
    }

    if (amount < 1000) {
      return { isValid: false, error: "مبلغ باید حداقل ۱۰۰۰ تومان باشد" };
    }

    if (amount > 50000000) {
      return { isValid: false, error: "مبلغ نمی‌تواند بیش از ۵۰ میلیون تومان باشد" };
    }

    // Description validation
    if (!description || typeof description !== 'string') {
      return { isValid: false, error: "توضیحات الزامی است" };
    }

    if (description.length > 255) {
      return { isValid: false, error: "توضیحات نمی‌تواند بیش از ۲۵۵ کاراکتر باشد" };
    }

    // Currency validation
    if (currency !== 'IRT') {
      return { isValid: false, error: "واحد پول پشتیبانی نمی‌شود" };
    }

    // Metadata validation
    if (metadata && typeof metadata !== 'object') {
      return { isValid: false, error: "متادیتا معتبر نیست" };
    }

    // Sanitize and return validated data
    const sanitizedData = {
      amount: Math.floor(amount), // Ensure integer
      description: description.trim().substring(0, 255),
      currency,
      metadata: metadata || {}
    };

    return { isValid: true, sanitizedData };

  } catch (error) {
    return { isValid: false, error: "خطا در اعتبارسنجی داده‌ها" };
  }
}

export function validatePaymentCallback(authority: string, status: string): PaymentValidationResult {
  try {
    // Authority validation
    if (!authority || typeof authority !== 'string') {
      return { isValid: false, error: "شناسه تراکنش معتبر نیست" };
    }

    if (authority.length < 10 || authority.length > 100) {
      return { isValid: false, error: "شناسه تراکنش نامعتبر است" };
    }

    // Status validation
    if (!status || typeof status !== 'string') {
      return { isValid: false, error: "وضعیت تراکنش معتبر نیست" };
    }

    const validStatuses = ['OK', 'NOK'];
    if (!validStatuses.includes(status)) {
      return { isValid: false, error: "وضعیت تراکنش نامعتبر است" };
    }

    return { 
      isValid: true, 
      sanitizedData: { 
        authority: authority.trim(), 
        status: status.trim() 
      } 
    };

  } catch (error) {
    return { isValid: false, error: "خطا در اعتبارسنجی callback" };
  }
}

export function sanitizeAmount(amount: any): number | null {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount) || numAmount < 0) {
      return null;
    }

    return Math.floor(numAmount);
  } catch {
    return null;
  }
}

export function isValidDescription(description: any): boolean {
  return typeof description === 'string' && 
         description.trim().length > 0 && 
         description.length <= 255;
}

export function generateSecureOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `WLT_${timestamp}_${random}`;
}