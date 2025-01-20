import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Order {
  _id: string;
  userId: string;
  storeId: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
    _id: string;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([{
    _id: "ord123",
    userId: "user456",
    storeId: "store789",
    products: [
      {
        _id: "prod1",
        productId: "pid111",
        quantity: 2,
        price: 1500000
      },
      {
        _id: "prod2",
        productId: "pid222",
        quantity: 1,
        price: 2300000
      }
    ],
    shippingAddress: {
      street: "15 Azadi Street",
      city: "Tehran",
      state: "Tehran",
      postalCode: "1234567890"
    },
    status: "processing",
    totalAmount: 3800000,
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "ord456",
    userId: "user789",
    storeId: "store101",
    products: [
      {
        _id: "prod3",
        productId: "pid333",
        quantity: 3,
        price: 850000
      }
    ],
    shippingAddress: {
      street: "27 Valiasr Avenue",
      city: "Isfahan",
      state: "Isfahan",
      postalCode: "8765432100"
    },
    status: "shipped",
    totalAmount: 2550000,
    paymentStatus: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'processing': 'bg-yellow-100 text-yellow-800',
      'shipped': 'bg-green-100 text-green-800',
      'delivered': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };
// useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const token = localStorage.getItem('token'); // Replace with actual token
//         const response = await fetch('/api/orders', {
//           headers: {
//             'Authorization': `${token}`
//           }
//         });
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         setOrders(data);
//       } catch (error) {
//         setError((error as Error).message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);
  const getPaymentStatusIcon = (status: string) => {
    return status === 'completed' ? '✅' : '⏳';
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>;
  if (error) return <div className="text-red-500 text-center mt-4">خطا: {error}</div>;

  return (
    <div className="orders-container p-2 sm:p-4 grid grid-cols-2 gap-4">
      {orders.length === 0 ? (
        <div className="flex flex-col mx-auto col-span-2 items-center justify-center min-h-[300px] bg-sky-50 rounded-xl shadow-sm p-8 text-center">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">!!سفارشی یافت نشد</h3>
        <p className="text-gray-500 mb-6">در حال حاضر هیچ سفارشی در سیستم ثبت نشده است</p>
      
      </div>
      ) : (
        orders.map(order => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={order._id}
            className="order-card col-span-2 md:col-span-1 bg-sky-50/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            dir='rtl'>
            <div className=" p-4">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <div className="text-lg font-bold text-gray-800">
                  شماره سفارش: {order._id}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {order.status === 'processing' ? 'در حال پردازش' : 
                   order.status === 'shipped' ? 'ارسال شده' : order.status}
                </span>
              </div>

              <div className="space-y-3 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">مبلغ کل:</span>
                  <span className="font-semibold">{order.totalAmount.toLocaleString()} تومان</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">وضعیت پرداخت:</span>
                  <span>{getPaymentStatusIcon(order.paymentStatus)} {order.paymentStatus === 'completed' ? 'پرداخت شده' : 'در انتظار پرداخت'}</span>
                </div>

                <div className="text-gray-600">
                  <div className="font-semibold mb-1">آدرس تحویل:</div>
                  <div className="text-sm">{order.shippingAddress.city}، {order.shippingAddress.street}</div>
                </div>

                <div className="mt-4">
                  <div className="font-semibold mb-2">اقلام سفارش:</div>
                  <div className="space-y-2">
                    {order.products.map(product => (
                      <div key={product._id} className="bg-white p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>تعداد: {product.quantity}</span>
                          <span className="font-medium">{product.price.toLocaleString()} تومان</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  تاریخ ثبت: {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};



