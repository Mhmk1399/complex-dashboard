import {Smsir} from 'sms-typescript/lib';

export async function sendVerificationCode(phone: string, code: string) {
  try {
    const smsir = new Smsir(process.env.SMS_IR_API_KEY!, parseInt(process.env.SMS_IR_LINE_NUMBER!));
    const result = await smsir.SendVerifyCode(phone, parseInt(process.env.SMS_IR_TEMPLATE_ID!), [{ name: 'CODE', value: code }]);
    return result.data?.status === 1;
  } catch (error: unknown) {
    console.error('SMS send error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}