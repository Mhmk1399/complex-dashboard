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
  const [tokensToAdd, setTokensToAdd] = useState("");

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
      console.error("Error fetching token usage:", error);
      toast.error("خطا در دریافت اطلاعات توکن");
    } finally {
      setLoading(false);
    }
  };

  const addTokens = async () => {
    const storeId = localStorage.getItem("storeId");
    if (!storeId || !tokensToAdd || Number(tokensToAdd) <= 0) {
      toast.error("لطفاً تعداد توکن معتبر وارد کنید");
      return;
    }

    try {
      const response = await fetch('/api/ai-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId, 
          tokensToAdd: Number(tokensToAdd) 
        })
      });

      if (response.ok) {
        toast.success("توکن با موفقیت اضافه شد");
        setTokensToAdd("");
        await fetchTokenUsage();
      } else {
        toast.error("خطا در اضافه کردن توکن");
      }
    } catch (error) {
      console.error("Error adding tokens:", error);
      toast.error("خطا در اضافه کردن توکن");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenUsage) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <p className="text-red-500">خطا در بارگیری اطلاعات توکن</p>
      </div>
    );
  }

  const percentage = (tokenUsage.remainingTokens / tokenUsage.totalTokens) * 100;
  const isLow = percentage < 20;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border pt-11" dir="rtl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">مدیریت توکن های هوش مصنوعی</h2>
      
      {/* Token Overview */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-600 mb-1">کل توکن ها</h3>
          <p className="text-2xl font-bold text-blue-800">{tokenUsage.totalTokens.toLocaleString()}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-600 mb-1">باقیمانده</h3>
          <p className="text-2xl font-bold text-green-800">{tokenUsage.remainingTokens.toLocaleString()}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-600 mb-1">استفاده شده</h3>
          <p className="text-2xl font-bold text-red-800">{tokenUsage.usedTokens.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">میزان استفاده</span>
          <span className={`text-sm ${isLow ? 'text-red-600' : 'text-gray-600'}`}>
            {percentage.toFixed(1)}% باقیمانده
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              isLow ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Add Tokens */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">افزودن توکن</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={tokensToAdd}
            onChange={(e) => setTokensToAdd(e.target.value)}
            placeholder="تعداد توکن"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
          <button
            onClick={addTokens}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            افزودن
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {[100, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => setTokensToAdd(amount.toString())}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      {/* Usage History */}
      {tokenUsage.usageHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">تاریخچه استفاده</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tokenUsage.usageHistory.slice(-10).reverse().map((usage, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-800">
                    {usage.feature === 'blog-generation' ? 'تولید مقاله' : 'تولید توضیحات محصول'}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(usage.date).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <span className="text-sm font-bold text-red-600">
                  -{usage.tokensUsed} توکن
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};