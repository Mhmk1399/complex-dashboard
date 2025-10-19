"use client";
import { useState, useEffect } from "react";
import { AITokenService } from "@/lib/aiTokenService";
import { toast } from "react-hot-toast";

interface TokenUsage {
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
  lastUsed: Date;
  usageHistory: Array<{
    date: Date;
    tokensUsed: number;
    feature: string;
    prompt?: string;
  }>;
}

export const TokenManagement = () => {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokenUsage();
  }, []);

  const fetchTokenUsage = async () => {
    const storeId = localStorage.getItem("storeId");
    if (!storeId) return;

    try {
      const usage = await AITokenService.getTokenUsage(storeId);
      setTokenUsage(usage);
    } catch (error) {
      console.log("Error fetching token usage:", error);
      toast.error("خطا در دریافت اطلاعات توکن");
    } finally {
      setLoading(false);
    }
  };

  const TOKEN_PACKAGES = {
    10: { tokens: 10, price: 20000 },
    50: { tokens: 50, price: 100000 },
    100: { tokens: 100, price: 200000 }
  };

  const purchaseTokens = async (packageKey: keyof typeof TOKEN_PACKAGES) => {
    const storeId = localStorage.getItem("storeId");
    const token = localStorage.getItem("token");
    
    if (!storeId || !token) {
      toast.error("لطفاً وارد شوید");
      return;
    }

    const tokenPackage = TOKEN_PACKAGES[packageKey];
    
    try {
      const response = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          storeId,
          tokens: tokenPackage.tokens,
          amount: tokenPackage.price
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${tokenPackage.tokens} توکن با موفقیت خریداری شد`);
        await fetchTokenUsage();
      } else {
        toast.error(data.error || "خطا در خرید توکن");
      }
    } catch (error) {
      console.log("Error purchasing tokens:", error);
      toast.error("خطا در خرید توکن");
    }
  };

  if (loading) {
    return (
      <>
        <style jsx>{`
          .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>

        <div dir="rtl" className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="pulse">
            <div className="h-5 sm:h-6 bg-slate-200 rounded w-36 sm:w-48 mb-3 sm:mb-4"></div>
            <div className="space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-slate-200 rounded"></div>
              <div className="h-3 sm:h-4 bg-slate-200 rounded w-2/3 sm:w-3/4"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!tokenUsage) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <p className="text-red-500 text-sm sm:text-base">
          خطا در بارگیری اطلاعات توکن
        </p>
      </div>
    );
  }

  const percentage =
    (tokenUsage.remainingTokens / tokenUsage.totalTokens) * 100;
  const isLow = percentage < 20;

  return (
    <>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in {
          animation: slideIn 0.4s ease-out backwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .progress-bar {
          animation: progressFill 1s ease-out;
        }

        @keyframes progressFill {
          from {
            width: 0;
          }
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .history-item {
          animation: fadeInUp 0.3s ease-out backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className="bg-white rounded-lg sm:rounded-xl p-4 mt-20 sm:p-6 shadow-sm border border-slate-200 fade-in"
        dir="rtl"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
          مدیریت توکن های هوش مصنوعی
        </h2>

        {/* Token Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div
            className="slide-in bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100"
            style={{ animationDelay: "0.1s" }}
          >
            <h3 className="text-xs sm:text-sm font-medium text-blue-600 mb-1">
              کل توکن ها
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-700">
              {tokenUsage.totalTokens.toLocaleString()}
            </p>
          </div>

          <div
            className="slide-in bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100"
            style={{ animationDelay: "0.2s" }}
          >
            <h3 className="text-xs sm:text-sm font-medium text-green-600 mb-1">
              باقیمانده
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-green-700">
              {tokenUsage.remainingTokens.toLocaleString()}
            </p>
          </div>

          <div
            className="slide-in bg-red-50 rounded-lg p-3 sm:p-4 border border-red-100"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="text-xs sm:text-sm font-medium text-red-600 mb-1">
              استفاده شده
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-red-700">
              {tokenUsage.usedTokens.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              میزان استفاده
            </span>
            <span
              className={`text-xs sm:text-sm font-medium ${
                isLow ? "text-red-600" : "text-slate-600"
              }`}
            >
              {percentage.toFixed(1)}% باقیمانده
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className={`progress-bar h-full rounded-full transition-all duration-300 ${
                isLow ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          {isLow && (
            <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              توکن شما رو به اتمام است!
            </p>
          )}
        </div>

        {/* Purchase Tokens */}
        <div className="bg-slate-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">
            خرید توکن از کیف پول
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(TOKEN_PACKAGES).map(([key, pkg]) => (
              <div key={key} className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {pkg.tokens}
                  </div>
                  <div className="text-sm text-slate-600 mb-2">توکن</div>
                  <div className="text-lg font-semibold text-slate-900 mb-3">
                    {pkg.price.toLocaleString()} تومان
                  </div>
                  <button
                    onClick={() => purchaseTokens(Number(key) as keyof typeof TOKEN_PACKAGES)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium text-sm"
                  >
                    خرید
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage History */}
        {tokenUsage.usageHistory.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">
              تاریخچه استفاده
            </h3>
            <div className="space-y-2 max-h-56 sm:max-h-64 overflow-y-auto custom-scrollbar">
              {tokenUsage.usageHistory
                .slice(-10)
                .reverse()
                .map((usage, index) => (
                  <div
                    key={index}
                    className="history-item flex justify-between items-center p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-slate-800 block truncate">
                        {usage.feature === "blog-generation"
                          ? "تولید مقاله"
                          : "تولید توضیحات محصول"}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(usage.date).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-red-600 whitespace-nowrap mr-2">
                      -{usage.tokensUsed.toLocaleString()} توکن
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State for No History */}
        {tokenUsage.usageHistory.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              هنوز تاریخچه ای وجود ندارد
            </p>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              استفاده از هوش مصنوعی اینجا نمایش داده می‌شود
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};
