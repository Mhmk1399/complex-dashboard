'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WalletCardProps {
  className?: string;
}

export default function WalletCard({ className }: WalletCardProps) {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
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
        // Redirect to Zarinpal
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Error charging wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [10000, 50000, 100000, 200000, 500000];

  return (
    <Card className={`bg-white shadow-lg ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          💳
          کیف پول
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">موجودی فعلی</p>
          <p className="text-2xl font-bold text-green-600">{balance.toLocaleString()} تومان</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">مبلغ شارژ</label>
            <Input
              type="number"
              placeholder="مبلغ را وارد کنید"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">مبالغ پیشنهادی</label>
            <Select onValueChange={setAmount}>
              <SelectTrigger className="mt-1">
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

          <Button 
            onClick={handleCharge} 
            disabled={!amount || loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            💳
            {loading ? 'در حال پردازش...' : 'شارژ کیف پول'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}