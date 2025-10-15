import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FunnelIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Order } from "@/types/type";

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
        className="bg-white mb-56 md:mb-0 p-8 rounded-2xl shadow-xl w-[90%] sm:w-[450px] z-50 relative border border-gray-100"
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
        className="bg-white mb-56 md:mb-0 rounded-2xl p-8 shadow-xl w-[600px] max-h-[80vh] overflow-y-auto relative z-10"
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [pagination, setPagination] = useState({
    totalOrders: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  });

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
        fetchOrders();
      }
    } catch (error) {
      console.log("Error updating order:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      });

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || {
        totalOrders: 0,
        totalPages: 0,
        currentPage: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };



  const clearFilters = () => {
    setStatusFilter("");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  const formatPersianDate = (date: string) => {
    if (!date) return "";
    const gregorianDate = new Date(date);
    return gregorianDate.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      calendar: 'persian'
    });
  };

  const getDateRangeText = () => {
    if (dateRange.start && dateRange.end) {
      return `${formatPersianDate(dateRange.start)} تا ${formatPersianDate(dateRange.end)}`;
    } else if (dateRange.start) {
      return `از ${formatPersianDate(dateRange.start)}`;
    } else if (dateRange.end) {
      return `تا ${formatPersianDate(dateRange.end)}`;
    }
    return "انتخاب بازه تاریخ";
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, dateRange]);

  // Pagination logic
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, pagination.totalOrders);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0077b6]"></div>
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">خطا: {error}</div>;

  return (
    <div className="px-2 md:px-4 py-4 md:py-8 min-h-screen mt-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-4 md:mb-6 p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-black">
                مدیریت سفارشات
              </h2>
              <p className="text-gray-500 hidden md:block text-base mt-2">
                سفارشات مشتریان خود را مدیریت کنید
              </p>
            </div>
          </div>
        </div>

        {orders.length === 0 && !statusFilter && !dateRange.start && !dateRange.end ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col mx-auto mt-44 items-center justify-center bg-white rounded-2xl p-8"
          >
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
              <svg
                className="relative z-10 w-full h-full text-blue-400"
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
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-600 mb-4">
              هیچ سفارشی با این فیلترها یافت نشد
            </h3>
            <p className="text-gray-500 mb-6">
              لطفاً فیلترهای خود را تغییر دهید یا پاک کنید
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-[#0077b6] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Filters Section */}
            <div className="p-3 md:p-6 border-b">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4 md:h-5 md:w-5 text-[#0077b6]" />
                  <span className="font-medium text-[#0077b6] text-sm md:text-base">فیلترها:</span>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
                >
                  <option value="">همه وضعیتها</option>
                  <option value="pending">در انتظار</option>
                  <option value="processing">در حال پردازش</option>
                  <option value="shipped">ارسال شده</option>
                  <option value="delivered">تحویل داده شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>

                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{getDateRangeText()}</span>
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">از تاریخ:</label>
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
                          />
                          {dateRange.start && (
                            <p className="text-xs text-gray-500 mt-1">{formatPersianDate(dateRange.start)}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">تا تاریخ:</label>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
                          />
                          {dateRange.end && (
                            <p className="text-xs text-gray-500 mt-1">{formatPersianDate(dateRange.end)}</p>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="px-3 py-1 bg-[#0077b6] text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            تایید
                          </button>
                          <button
                            onClick={() => {
                              setDateRange({ start: "", end: "" });
                              setShowDatePicker(false);
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                          >
                            پاک کردن
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>

            {/* Table Header with Stats */}
            <div className="bg-gradient-to-r from-[#0077b6] to-blue-600 p-3 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-3">
                <div>
                  <h3 className="text-base md:text-xl font-bold">لیست سفارشات</h3>
                  <p className="text-blue-100 text-xs md:text-sm mt-1">
                    {pagination.totalOrders} سفارش
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2">
                    <span className="text-xs md:text-sm">تحویل شده: </span>
                    <span className="font-bold">
                      {orders.filter(order => order.status === "delivered").length}
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2">
                    <span className="text-xs md:text-sm">در انتظار: </span>
                    <span className="font-bold">
                      {orders.filter(order => order.status === "pending").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-blue-50 border-b-2 border-[#0077b6]">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                      شماره سفارش
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                      مبلغ کل
                    </th>
                    <th className="hidden md:table-cell px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                      وضعیت پرداخت
                    </th>
                    <th className="hidden lg:table-cell px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                      آدرس
                    </th>
                    <th className="hidden md:table-cell px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                      تاریخ
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={order._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 text-xs md:text-sm">
                          {order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 text-xs md:text-sm">
                          {order.totalAmount.toLocaleString()} تومان
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2">
                          {getPaymentStatusIcon(order.paymentStatus)}
                          <span className="text-sm">
                            {order.paymentStatus === "completed"
                              ? "پرداخت شده"
                              : "در انتظار پرداخت"}
                          </span>
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 truncate max-w-xs block text-sm">
                          {order.shippingAddress.city}، {order.shippingAddress.street}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-500 text-sm">
                          {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-3">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditModal(true);
                            }}
                            className="p-1 md:p-2 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                          >
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5 text-blue-600"
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
                            className="p-1 md:p-2 hover:bg-purple-100 rounded-lg transition-colors duration-150"
                          >
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5 text-purple-600"
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-3 md:px-6 py-3 md:py-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs md:text-sm text-gray-700">
                  نمایش {indexOfFirstItem} تا {indexOfLastItem} از {pagination.totalOrders} سفارش
                </div>
                <div className="flex gap-1 md:gap-2 justify-center md:justify-end">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 md:px-3 py-1 border rounded text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    قبلی
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 md:px-3 py-1 border rounded text-xs md:text-sm ${
                        currentPage === page
                          ? 'bg-[#0077b6] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-2 md:px-3 py-1 border rounded text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
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
        {/* Click outside to close date picker */}
        {showDatePicker && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDatePicker(false)}
          />
        )}
      </div>
    </div>
  );
};