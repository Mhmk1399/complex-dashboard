"use client";
import { useState, useEffect } from "react";
import { AITokenService } from "@/lib/aiTokenService";

interface TokenUsage {
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
  lastUsed: Date;
}

export const TokenDisplay = () => {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-blue-100 rounded w-16"></div>
      </div>
    );
  }

  if (!tokenUsage) return null;

  const percentage = (tokenUsage.remainingTokens / tokenUsage.totalTokens) * 100;
  const isLow = percentage < 20;

  return (
    <div className={`border rounded-lg p-3 ${
      isLow ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">توکن</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          isLow ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {tokenUsage.remainingTokens} باقیمانده
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isLow ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {/* <div className="text-xs text-gray-600">
        {tokenUsage.usedTokens} از {tokenUsage.totalTokens} استفاده شده
      </div> */}
    </div>
  );
};