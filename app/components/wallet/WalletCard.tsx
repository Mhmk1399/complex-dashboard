'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

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

  const presetAmounts = [10000, 50000, 100000, 200000, 500000];

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              💳
            </div>
            <div>
              <h2 className="text-xl font-bold">کیف پول</h2>
              <p className="text-sm text-gray-600 font-normal">مدیریت موجودی حساب</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-600 mb-2">موجودی فعلی</p>
            <p className="text-3xl font-bold text-green-600 mb-1">{balance.toLocaleString()}</p>
            <p className="text-sm text-gray-500">تومان</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">مبلغ شارژ</label>
              <Input
                type="number"
                placeholder="مبلغ را وارد کنید"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">مبالغ پیشنهادی</label>
              <Select onValueChange={setAmount}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="انتخاب مبلغ" />
                </SelectTrigger>
                <SelectContent>
                  {presetAmounts.map((preset) => (
                    <SelectItem key={preset} value={preset.toString()}>
                      {preset.toLocaleString()} تومان
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleCharge} 
              disabled={!amount || loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium"
            >
              {loading ? '🔄 در حال پردازش...' : '💳 شارژ کیف پول'}
            </Button>
            <Button 
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl"
            >
              📋
            </Button>
          </div>
        </CardContent>
      </Card>

      {showHistory && (
        <Card className="bg-white shadow-lg">
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
                    <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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