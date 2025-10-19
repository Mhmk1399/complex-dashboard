'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

interface SubscriptionCardProps {
  className?: string;
  onSubscriptionPurchased?: () => void;
}

interface Subscription {
  _id: string;
  plan: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

const PLANS = [
  {
    id: '1month',
    name: '1 ماه',
    price: 1000000,
    duration: '1 ماه',
    features: ['دسترسی کامل', 'پشتیبانی 24/7', 'آپدیت رایگان']
  },
  {
    id: '6months',
    name: '6 ماه',
    price: 6000000,
    duration: '6 ماه',
    features: ['دسترسی کامل', 'پشتیبانی 24/7', 'آپدیت رایگان', 'تخفیف ویژه']
  },
  {
    id: '1year',
    name: '1 سال',
    price: 10000000,
    duration: '1 سال',
    features: ['دسترسی کامل', 'پشتیبانی 24/7', 'آپدیت رایگان', 'تخفیف ویژه', 'مشاوره رایگان']
  }
];

export default function SubscriptionCard({ className, onSubscriptionPurchased }: SubscriptionCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.subscriptions) {
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handlePurchase = async (planId: string) => {
    setLoading(planId);
    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');
      const response = await fetch('/api/subscription/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId, storeId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('اشتراک با موفقیت خریداری شد!');
        fetchSubscriptions();
        onSubscriptionPurchased?.();
      } else {
        if (data.error === 'Insufficient balance') {
          toast.error('موجودی کافی نیست');
        } else if (data.error === 'Active subscription exists') {
          toast.error(data.message || 'شما اشتراک فعال دارید');
        } else {
          toast.error('خطا در خرید اشتراک');
        }
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      toast.error('خطا در خرید اشتراک');
    } finally {
      setLoading(null);
    }
  };

  const getPlanName = (plan: string) => {
    const planMap: { [key: string]: string } = {
      '1month': '1 ماه',
      '6months': '6 ماه', 
      '1year': '1 سال',
      'trial': 'آزمایشی (7 روز)'
    };
    return planMap[plan] || plan;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'expired': return 'منقضی';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  return (
    <div className={`space-y-6 ${className || ''} bg-white/20 backdrop-blur-sm mx-5 mt-10`}>
      <Card className=" backdrop-blur-md border  shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 text-center">
            🎯 خرید اشتراک
          </CardTitle>
          <p className="text-center text-gray-600">پلن مناسب خود را انتخاب کنید</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-xl p-6 text-center transition-all hover:shadow-lg ${
                  plan.id === '6months' 
                    ? 'border-blue-500 bg-blue-50 relative' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.id === '6months' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    محبوب
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 text-sm"> تومان</span>
                </div>
                
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.id === '6months'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {loading === plan.id ? '🔄 در حال پردازش...' : '💳 خرید اشتراک'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {subscriptions.length > 0 && (
        <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">📋 اشتراکهای من</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div key={subscription._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      🎯
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        اشتراک {getPlanName(subscription.plan)} - {subscription.amount.toLocaleString()} تومان
                      </p>
                      <p className="text-sm text-gray-500">
                        از {new Date(subscription.startDate).toLocaleDateString('fa-IR')} 
                        تا {new Date(subscription.endDate).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {getStatusText(subscription.status)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}