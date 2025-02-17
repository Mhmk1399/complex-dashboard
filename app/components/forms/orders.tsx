import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Order {
  _id: string;
  userId: string;
  storeId: string;
  postCode?: string;
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
const StatusModal = ({
  order,
  onClose,
  onSave,
}: {
  order: Order;
  onClose: () => void;
  onSave: (status: string, code: string) => void;
  isOpen: boolean;
}) => {
  const [status, setStatus] = useState(order.status);
  const [code, setCode] = useState(order.postCode || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
        }}
        className="bg-white p-8 rounded-2xl shadow-xl w-[450px] z-50 relative border border-gray-100"
      >
        <div className="absolute -top-6 -right-6 bg-blue-500 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg">
          📦
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-8 mt-2 text-right">
          بروزرسانی سفارش
        </h3>

        <div className="space-y-6">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 block mb-2 text-right">
              وضعیت سفارش
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-400 transition-colors duration-200 outline-none text-right"
            >
              <option value="pending">در انتظار</option>
              <option value="processing">در حال پردازش</option>
              <option value="shipped">ارسال شده</option>
              <option value="delivered">تحویل داده شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700 block mb-2 text-right">
              کد رهگیری پستی
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-400 transition-colors duration-200 outline-none text-right"
              placeholder="کد رهگیری را وارد کنید"
            />
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse mt-8">
            <button
              onClick={() => onSave(status, code)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
            >
              ذخیره تغییرات
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              انصراف
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
const OrderDetailModal = ({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) => {
  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-green-100 text-green-800",
      delivered: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "در انتظار",
      processing: "در حال پردازش",
      shipped: "ارسال شده",
      delivered: "تحویل داده شده",
      cancelled: "لغو شده",
    };
    return statusMap[status] || status;
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl p-8 shadow-xl w-[600px] max-h-[80vh] overflow-y-auto relative z-10"
        dir="rtl"
      >
        <div className="absolute top-4 left-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6">جزئیات سفارش {order._id}</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">وضعیت سفارش</h3>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-2">مبلغ کل</h3>
              <span className="text-lg font-bold">
                {order.totalAmount.toLocaleString()} تومان
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold mb-3">محصولات</h3>
            <div className="space-y-2">
              {order.products.map((product) => (
                <div
                  key={product._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span>تعداد: {product.quantity}</span>
                  <span className="font-medium">
                    {product.price.toLocaleString()} تومان
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <h3 className="font-semibold text-purple-900 mb-3">آدرس تحویل</h3>
            <p>
              {order.shippingAddress.city}، {order.shippingAddress.street}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      _id: "ord123",
      userId: "user456",
      storeId: "store789",
      postCode: "",
      products: [
        {
          _id: "prod1",
          productId: "pid111",
          quantity: 2,
          price: 1500000,
        },
        {
          _id: "prod2",
          productId: "pid222",
          quantity: 1,
          price: 2300000,
        },
      ],
      shippingAddress: {
        street: "15 Azadi Street",
        city: "Tehran",
        state: "Tehran",
        postalCode: "1234567890",
      },
      status: "processing",
      totalAmount: 3800000,
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
          price: 850000,
        },
      ],
      shippingAddress: {
        street: "27 Valiasr Avenue",
        city: "Isfahan",
        state: "Isfahan",
        postalCode: "8765432100",
      },
      status: "shipped",
      totalAmount: 2550000,
      paymentStatus: "completed",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-green-100 text-green-800",
      delivered: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: string,
    shippingCode: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: orderId,
          status: newStatus,
          postCode: shippingCode,
        }),
      });

      if (response.ok) {
        // Update local state immediately after successful API call
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus, postCode: shippingCode }
              : order
          )
        );

        // Trigger a fresh fetch to ensure data consistency
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token"); // Replace with actual token
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  const getPaymentStatusIcon = (status: string) => {
    return status === "completed" ? "✅" : "⏳";
  };
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "در انتظار",
      processing: "در حال پردازش",
      shipped: "ارسال شده",
      delivered: "تحویل داده شده",
      cancelled: "لغو شده",
    };
    return statusMap[status] || status;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">خطا: {error}</div>;

  return (
    <div
      className="orders-container p-6 bg-white rounded-2xl shadow-lg"
      dir="rtl"
    >
      {orders.length === 0 ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col mx-auto items-center justify-center min-h-[400px]"
        >
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
            <svg
              className="relative z-10 w-full h-full text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            سفارشی یافت نشد!
          </h3>
          <p className="text-gray-500">
            در حال حاضر هیچ سفارشی در سیستم ثبت نشده است
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">
                  شماره سفارش
                </th>
                <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">
                  وضعیت
                </th>
                <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">
                  مبلغ کل
                </th>
                <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">
                  وضعیت پرداخت
                </th>
                <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">
                  آدرس
                </th>
                <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">
                  تاریخ
                </th>
                <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={order._id}
                  className="hover:bg-blue-50/50 transition-colors duration-150"
                >
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      {order._id}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      {order.totalAmount.toLocaleString()} تومان
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-2">
                      {getPaymentStatusIcon(order.paymentStatus)}
                      <span>
                        {order.paymentStatus === "completed"
                          ? "پرداخت شده"
                          : "در انتظار پرداخت"}
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600 truncate max-w-xs block">
                      {order.shippingAddress.city}،{" "}
                      {order.shippingAddress.street}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditModal(true);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                      >
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setViewModal(true);
                        }}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors duration-150"
                      >
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setViewModal(false);
          }}
        />
      )}
      {editModal && selectedOrder && (
        <StatusModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            setEditModal(false);
          }}
          onSave={(status, code) => {
            handleStatusUpdate(selectedOrder._id, status, code);
            setSelectedOrder(null);
            setEditModal(false);
          }}
          isOpen={!!selectedOrder}
        />
      )}
    </div>
  );
};
