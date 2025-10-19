"use client";
import { useRouter } from "next/navigation";

interface SubscriptionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionExpiredModal = ({ isOpen, onClose }: SubscriptionExpiredModalProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToWallet = () => {
    router.push("/?section=wallet");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            اشتراک شما منقضی شده است
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            برای جلوگیری از خاموش شدن وب‌سایت خود، لطفاً اشتراک جدید خریداری کنید
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleGoToWallet}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              خرید اشتراک
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};