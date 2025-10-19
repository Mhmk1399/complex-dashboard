"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SubscriptionData {
  plan: string;
  endDate: string;
  daysRemaining: number;
}

interface SubscriptionContextType {
  hasActiveSubscription: boolean;
  subscription: SubscriptionData | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    const storeId = localStorage.getItem("storeId");
    const token = localStorage.getItem("token");
    
    if (!storeId || !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/subscription/status?storeId=${storeId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHasActiveSubscription(data.hasActiveSubscription);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{
      hasActiveSubscription,
      subscription,
      loading,
      checkSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};