import { User } from "@/types/type";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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

export const Costumers = () => {
  const [users, setUsers] = useState<User[]>([
    {
      _id: "1",
      name: "John Doe",
      storeId: "store123",
      phone: "+1234567890",
      password: "hashedpassword",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      _id: "2",
      name: "Jane Smith",
      storeId: "store123",
      phone: "+1987654321",
      password: "hashedpassword",
      createdAt: "2024-01-14T15:30:00Z",
      updatedAt: "2024-01-14T15:30:00Z",
    },
    {
      _id: "3",
      name: "Mike Johnson",
      storeId: "store123",
      phone: "+1122334455",
      password: "hashedpassword",
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T09:15:00Z",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await fetch("/api/storesusers", {
          headers: {
            Authorization: `${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        setUsers(data.users);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = (userId: string) => {
    setUsers(users.filter((user) => user._id !== userId));
    toast.success(`مشتری با موفقیت حذف شد`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
      </div>
    );

  if (users.length === 0)
    return (
      <div
        className="min-h-screen flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        dir="rtl"
      >
        <div className="max-w-md w-full backdrop-blur-sm rounded-lg sm:rounded-xl shadow-xl p-6 sm:p-8 border border-slate-200 animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 sm:mb-6">
              <svg
                className="w-20 h-20 sm:w-24 sm:h-24 text-slate-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              هیچ مشتری یافت نشد!
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-sm">
              در حال حاضر هیچ مشتری در سیستم ثبت نشده است. مشتریان جدید به محض
              ثبت نام در اینجا نمایش داده خواهند شد
            </p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-md">
          <h3 className="text-red-800 font-bold mb-2">خطا در دریافت اطلاعات</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen p-3 sm:p-4 py-4 sm:py-6 animate-fade-in"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                مدیریت مشتریان
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2">
                لیست مشتریان فروشگاه ({users.length} مشتری)
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 animate-slide-up">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  کل مشتریان
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 bg-slate-100 rounded-lg items-center justify-center">
                <svg
                  className="h-5 w-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  این ماه
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {
                    users.filter((u) => {
                      const userDate = new Date(u.createdAt);
                      const now = new Date();
                      return (
                        userDate.getMonth() === now.getMonth() &&
                        userDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 bg-green-100 rounded-lg items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-slate-200 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  جدیدترین
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-600 truncate">
                  {users.length > 0 ? users[0].name : "-"}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 bg-slate-100 rounded-lg items-center justify-center">
                <svg
                  className="h-5 w-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-slate-200 animate-slide-up">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900 p-3 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-white">
              لیست مشتریان
            </h3>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    نام مشتری
                  </th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    شماره تماس
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    تاریخ عضویت
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    آخرین بروزرسانی
                  </th>
                  <th className="px-3 sm:px-6 py-2.5 sm:py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs sm:text-sm">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap">
                      <span
                        className="text-xs sm:text-sm text-slate-600"
                        dir="ltr"
                      >
                        {user.phone}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm text-slate-600">
                        {new Date(user.updatedAt).toLocaleDateString("fa-IR")}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2.5 sm:py-4 whitespace-nowrap">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف مشتری"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50 px-3 sm:px-6 py-3 border-t border-slate-200">
            <p className="text-xs sm:text-sm text-slate-600 text-center sm:text-right">
              مجموع {users.length} مشتری در سیستم ثبت شده است
            </p>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-slate-900 to-slate-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white animate-slide-up">
          <h3 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            نکات مهم
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">👥 مدیریت مشتریان</h4>
              <p className="text-slate-100">
                اطلاعات کامل مشتریان شما شامل نام، شماره تماس و تاریخ عضویت
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">🗑️ حذف مشتری</h4>
              <p className="text-slate-100">
                با احتیاط اقدام به حذف کنید، این عمل غیرقابل بازگشت است
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
