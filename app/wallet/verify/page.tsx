'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function WalletVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setStatus('success');
    } else if (status === 'failed') {
      setStatus('failed');
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  const handleBackToDashboard = () => {
    router.push('/?section=wallet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                در حال تایید پرداخت...
              </h2>
              <p className="text-gray-600">لطفا صبر کنید</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                پرداخت موفق
              </h2>
              <p className="text-gray-600 mb-6">
                کیف پول شما با موفقیت شارژ شد
              </p>
              <button
                onClick={handleBackToDashboard}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                بازگشت به داشبورد
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                پرداخت ناموفق
              </h2>
              <p className="text-gray-600 mb-6">
                متاسفانه پرداخت شما انجام نشد
              </p>
              <button
                onClick={handleBackToDashboard}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                بازگشت به داشبورد
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}