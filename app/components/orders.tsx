import React, { useEffect, useState } from "react";
import { FunnelIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Order } from "@/types/type";

// CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-md z-50 relative border border-slate-200 animate-scale-in">
        <div className="absolute -top-4 -right-4 bg-gradient-to-br from-slate-900 to-slate-900 w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg">
          📦
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 mt-2 text-right">
          بروزرسانی سفارش
        </h3>

        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 text-right">
              وضعیت سفارش
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 sm:p-3 text-sm rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all outline-none text-right"
            >
              <option value="pending">در انتظار</option>
              <option value="processing">در حال پردازش</option>
              <option value="shipped">ارسال شده</option>
              <option value="delivered">تحویل داده شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>

          <div className="relative">
            <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 text-right">
              کد رهگیری پستی
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2.5 sm:p-3 text-sm rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all outline-none text-right"
              placeholder="کد رهگیری را وارد کنید"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              انصراف
            </button>
            <button
              onClick={() => onSave(status, code)}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg transition-all text-sm font-medium shadow-md"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </div>
    </div>
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
      processing: "bg-yellow-100 text-yellow-700",
      shipped: "bg-green-100 text-green-700",
      delivered: "bg-slate-100 text-slate-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return statusMap[status] || "bg-slate-100 text-slate-700";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative z-10 animate-scale-in"
        dir="rtl"
      >
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600"
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

        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-900">
          جزئیات سفارش{" "}
          <span className="text-sm sm:text-base text-slate-500">
            #{order._id.slice(-8)}
          </span>
        </h2>

        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">
                وضعیت سفارش
              </h3>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs sm:text-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2 text-sm">
                مبلغ کل
              </h3>
              <span className="text-base sm:text-lg font-bold text-green-700">
                {order.totalAmount.toLocaleString()} تومان
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold mb-3 text-slate-900 text-sm sm:text-base">
              محصولات
            </h3>
            <div className="space-y-2">
              {order.products.map((product) => (
                <div
                  key={product._id}
                  className="flex justify-between items-center p-2 sm:p-2.5 hover:bg-slate-100 rounded-lg text-sm"
                >
                  <span className="text-slate-700">
                    تعداد: {product.quantity}
                  </span>
                  <span className="font-medium text-slate-900">
                    {product.price.toLocaleString()} تومان
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
              آدرس تحویل
            </h3>
            <p className="text-slate-700 text-sm">
              {order.shippingAddress.city}، {order.shippingAddress.street}
            </p>
          </div>
        </div>
      </div>
    </div>
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
    hasPrev: false,
  });

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      processing: "bg-yellow-100 text-yellow-700",
      shipped: "bg-green-100 text-green-700",
      delivered: "bg-slate-100 text-slate-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return statusMap[status] || "bg-slate-100 text-slate-700";
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
        ...(dateRange.end && { endDate: dateRange.end }),
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
      setPagination(
        data.pagination || {
          totalOrders: 0,
          totalPages: 0,
          currentPage: 1,
          hasNext: false,
          hasPrev: false,
        }
      );
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
    return gregorianDate.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "persian",
    });
  };

  const getDateRangeText = () => {
    if (dateRange.start && dateRange.end) {
      return `${formatPersianDate(dateRange.start)} تا ${formatPersianDate(
        dateRange.end
      )}`;
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
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    pagination.totalOrders
  );

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">خطا: {error}</div>;

  return (
    <div
      className="px-3 sm:px-4 py-4 sm:py-6 min-h-screen mt-12 animate-fade-in"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg mb-4 p-3 sm:p-5 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-900 bg-clip-text text-transparent">
                مدیریت سفارشات
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                سفارشات مشتریان خود را مدیریت کنید
              </p>
            </div>
          </div>
        </div>

        {orders.length === 0 &&
        !statusFilter &&
        !dateRange.start &&
        !dateRange.end ? (
          <div className="flex flex-col mx-auto items-center justify-center backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg animate-slide-up">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6">
               <svg
                className="relative z-10 w-full h-full text-slate-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
              سفارشی یافت نشد!
            </h3>
            <p className="text-slate-500 text-sm sm:text-base">
              در حال حاضر هیچ سفارشی در سیستم ثبت نشده است
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center animate-slide-up">
            <h3 className="text-lg sm:text-xl font-bold text-slate-600 mb-3 sm:mb-4">
              هیچ سفارشی با این فیلترها یافت نشد
            </h3>
            <p className="text-slate-500 mb-4 sm:mb-6 text-sm sm:text-base">
              لطفاً فیلترهای خود را تغییر دهید یا پاک کنید
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg transition-all text-sm font-medium shadow-md"
            >
              پاک کردن فیلترها
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-slide-up">
            {/* Filters Section */}
            <div className="p-3 sm:p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:items-center">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  <span className="font-medium text-slate-900 text-xs sm:text-sm">
                    فیلترها:
                  </span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
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
                    className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs sm:text-sm truncate">
                      {getDateRangeText()}
                    </span>
                  </button>

                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-xl p-3 sm:p-4 z-50 min-w-[280px] sm:min-w-[300px]">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            از تاریخ:
                          </label>
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                start: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                          />
                          {dateRange.start && (
                            <p className="text-xs text-slate-500 mt-1">
                              {formatPersianDate(dateRange.start)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            تا تاریخ:
                          </label>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                end: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                          />
                          {dateRange.end && (
                            <p className="text-xs text-slate-500 mt-1">
                              {formatPersianDate(dateRange.end)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg text-xs sm:text-sm transition-all font-medium"
                          >
                            تایید
                          </button>
                          <button
                            onClick={() => {
                              setDateRange({ start: "", end: "" });
                              setShowDatePicker(false);
                            }}
                            className="flex-1 px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs sm:text-sm transition-colors font-medium"
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
                  className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>

            {/* Table Header with Stats */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-900 p-3 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white gap-2 sm:gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    لیست سفارشات
                  </h3>
                  <p className="text-slate-100 text-xs sm:text-sm mt-0.5">
                    {pagination.totalOrders} سفارش
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <span className="text-xs sm:text-sm">تحویل شده: </span>
                    <span className="font-bold">
                      {
                        orders.filter((order) => order.status === "delivered")
                          .length
                      }
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <span className="text-xs sm:text-sm">در انتظار: </span>
                    <span className="font-bold">
                      {
                        orders.filter((order) => order.status === "pending")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      شماره
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      وضعیت
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      مبلغ
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      پرداخت
                    </th>
                    <th className="hidden lg:table-cell px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      آدرس
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      تاریخ
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {orders.map((order, index) => (
                    <tr
                      key={order._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                        <span className="font-medium text-slate-900 text-xs sm:text-sm">
                          #{order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                        <span className="font-medium text-slate-900 text-xs sm:text-sm">
                          {order.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm">
                          {getPaymentStatusIcon(order.paymentStatus)}
                          <span className="text-slate-700">
                            {order.paymentStatus === "completed"
                              ? "پرداخت شده"
                              : "در انتظار"}
                          </span>
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap">
                        <span className="text-slate-600 truncate max-w-xs block text-xs sm:text-sm">
                          {order.shippingAddress.city}،{" "}
                          {order.shippingAddress.street}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                        <span className="text-slate-500 text-xs sm:text-sm">
                          {new Date(order.createdAt).toLocaleDateString(
                            "fa-IR"
                          )}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditModal(true);
                            }}
                            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-4 h-4 text-slate-600"
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
                            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-4 h-4 text-slate-600"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-3 sm:px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="text-xs sm:text-sm text-slate-700 text-center sm:text-right">
                  نمایش {indexOfFirstItem} تا {indexOfLastItem} از{" "}
                  {pagination.totalOrders} سفارش
                </div>
                <div className="flex gap-1 sm:gap-2 justify-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 border border-slate-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    قبلی
                  </button>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm transition-colors ${
                        currentPage === page
                          ? "bg-gradient-to-r from-slate-900 to-slate-900 text-white border-transparent"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="px-2 sm:px-3 py-1 border border-slate-300 rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
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
