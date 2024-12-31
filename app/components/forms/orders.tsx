import React, { useEffect, useState } from 'react';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token'); // Replace with actual token
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="spinner border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div></div>;
  if (error) return <div className="text-red-500 text-center mt-4">Error: {error}</div>;

  return (
    <div className="orders-container p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mr-56">
      {!orders ? (
        <div className="text-center text-gray-500">No orders found</div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Order ID: {order._id}</h3>
            <p><strong>User ID:</strong> {order.userId}</p>
            <p><strong>Store ID:</strong> {order.storeId}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Amount:</strong> {order.totalAmount.toLocaleString()} تومان</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
            <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
            <h4 className="text-lg font-medium mt-4">Shipping Address</h4>
            <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.postalCode}</p>
            <h4 className="text-lg font-medium mt-4">Products</h4>
            {order.products.map(product => (
              <div key={product._id} className="product-card bg-gray-100 p-4 rounded-lg mt-2">
                <p><strong>Product ID:</strong> {product.productId}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p><strong>Price:</strong> {product.price.toLocaleString()} تومان</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};



