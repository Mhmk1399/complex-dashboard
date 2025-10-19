'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';


interface WalletCardProps {
  className?: string;
}

interface Transaction {
  _id: string;
  type: 'charge' | 'debit' | 'payment';
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

export default function WalletCard({ className }: WalletCardProps) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleCharge = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wallet/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Error charging wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified': return 'تکمیل شده';
      case 'pending': return 'در انتظار';
      case 'failed': return 'ناموفق';
      default: return status;
    }
  };

  const presetAmounts = [ 100000, 200000, 500000,1000000];

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 ${className || ''}`} dir="rtl">
      <Card className="bg-white/20 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border-0">
        <CardHeader className=" bg-gray-100/30 backdrop-blur-sm p-6">
          <CardTitle className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">💳</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">کیف پول</h1>
              <p className=" text-sm">مدیریت مالی هوشمند</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Balance Section */}
            <div className="flex-1 p-8 bg-white/30 backdrop-blur-sm border-b md:border-b-0 md:border-l border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">موجودی حساب</h3>
                </div>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-green-600 mb-1">{balance.toLocaleString()}</p>
                  <p className="text-green-600 font-medium">تومان</p>
                </div>
                <Button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {showHistory ? 'مخفی کردن تاریخچه' : 'مشاهده تاریخچه'}
                </Button>
              </div>
            </div>

            {/* Charge Section */}
            <div className="flex-1 p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">شارژ کیف پول</h3>
                <p className="text-gray-600 text-sm">موجودی خود را افزایش دهید</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مبلغ مورد نظر
                  </label>
                  <Input
                    type="number"
                    placeholder="مبلغ را به تومان وارد کنید"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مبالغ پیشنهادی
                  </label>
                  <select
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-1 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
                    defaultValue=""
                  >
                    <option value="" disabled>انتخاب کنید</option>
                    {presetAmounts.map((preset) => (
                      <option key={preset} value={preset.toString()}>
                        {preset.toLocaleString()} تومان
                      </option>
                    ))}
                  </select>
                </div>

                <Button 
                  onClick={handleCharge} 
                  disabled={!amount || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🔄</span>
                      در حال پردازش...
                    </span>
                  ) : (
                    'شارژ کیف پول'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showHistory && (
        <Card className="bg-white/90 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl overflow-hidden ">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">تاریخچه تراکنش‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">هیچ تراکنشی یافت نشد</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const getTransactionInfo = (type: string, description: string) => {
                    switch (type) {
                      case 'charge':
                        return {
                          icon: '💰',
                          color: 'text-green-600',
                          bgColor: 'bg-green-100',
                          sign: '+',
                          label: 'شارژ کیف پول'
                        };
                      case 'payment':
                        return {
                          icon: '🎯',
                          color: 'text-red-600',
                          bgColor: 'bg-red-100',
                          sign: '-',
                          label: description
                        };
                      case 'debit':
                        return {
                          icon: '💳',
                          color: 'text-orange-600',
                          bgColor: 'bg-orange-100',
                          sign: '-',
                          label: description
                        };
                      default:
                        return {
                          icon: '💳',
                          color: 'text-gray-600',
                          bgColor: 'bg-gray-100',
                          sign: '',
                          label: description
                        };
                    }
                  };
                  
                  const info = getTransactionInfo(transaction.type, transaction.description);
                  
                  return (
                    <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${info.bgColor}`}>
                          {info.icon}
                        </div>
                        <div>
                          <p className={`font-medium ${info.color}`}>
                            {info.sign}{transaction.amount.toLocaleString()} تومان
                          </p>
                          <p className="text-sm text-gray-500">
                            {info.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}