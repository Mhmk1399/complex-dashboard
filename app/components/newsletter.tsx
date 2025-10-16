"use client";
import { useEffect, useState } from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";

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
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-slide-in-left { animation: slideInLeft 0.3s ease-out; }
  .animate-spin { animation: spin 1s linear infinite; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface Newsletter {
  _id: string;
  storeId: string;
  phoneNumber: string;
  createdAt: string;
}

export const Newsletter = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const response = await fetch("/api/newsletter");
        const data = await response.json();
        setNewsletters(data);
      } catch (error) {
        console.log("Error fetching newsletters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-3 sm:p-4 py-4 sm:py-6 animate-fade-in mt-10"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6 animate-slide-up">
          <div className="flex   sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-slate-900 to-slate-900 p-2 rounded-lg">
                <FaEnvelope className="text-lg sm:text-xl text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-900 bg-clip-text text-transparent">
                  مدیریت خبرنامه
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  لیست مشترکین خبرنامه فروشگاه
                </p>
              </div>
            </div>
            <div className="backdrop-blur-sm  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-200">
              <span className="text-slate-600 font-semibold text-sm sm:text-base">
                {newsletters.length} مشترک
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 animate-slide-up">
          <div className="backdrop-blur-sm  rounded-lg shadow-md p-3 sm:p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  کل مشترکین
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {newsletters.length}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 bg-slate-100 rounded-lg items-center justify-center">
                <FaEnvelope className="text-slate-600" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm rounded-lg shadow-md p-3 sm:p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  این ماه
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {
                    newsletters.filter((n) => {
                      const newsDate = new Date(n.createdAt);
                      const now = new Date();
                      return (
                        newsDate.getMonth() === now.getMonth() &&
                        newsDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 bg-green-100 rounded-lg items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

          <div className="backdrop-blur-sm  rounded-lg shadow-md p-3 sm:p-4 border border-slate-200 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">امروز</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-600">
                  {
                    newsletters.filter(
                      (n) =>
                        new Date(n.createdAt).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 bg-slate-100 rounded-lg items-center justify-center">
                <svg
                  className="h-5 w-5 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter List */}
        <div className="backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-slate-200 animate-slide-up">
          {/* List Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900 p-3 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-white">
              لیست مشترکین
            </h3>
          </div>

          {/* List Content */}
          <div className="p-3 sm:p-4">
            {newsletters.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <FaEnvelope className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
                  هیچ مشترکی یافت نشد
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  هنوز کسی در خبرنامه عضو نشده است
                </p>
              </div>
            ) : (
              <div className="grid gap-2 sm:gap-3">
                {newsletters.map((newsletter, index) => (
                  <div
                    key={newsletter._id}
                    className="bg-slate-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all border border-slate-200 animate-slide-in-left"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="bg-gradient-to-br from-slate-900 to-slate-900 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                        <FaPhone className="text-white text-xs sm:text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-medium text-slate-900 text-sm sm:text-base block truncate"
                          dir="ltr"
                        >
                          {newsletter.phoneNumber}
                        </span>
                        <span className="text-xs text-slate-500 sm:hidden">
                          {new Date(newsletter.createdAt).toLocaleDateString(
                            "fa-IR"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {new Date(newsletter.createdAt).toLocaleDateString(
                            "fa-IR"
                          )}
                        </span>
                      </div>
                      <a
                        href={`tel:${newsletter.phoneNumber}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                        title="تماس"
                      >
                        <FaPhone className="text-xs" />
                        <span className="hidden sm:inline">تماس</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List Footer */}
          {newsletters.length > 0 && (
            <div className="bg-slate-50 px-3 sm:px-6 py-3 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-600 text-center sm:text-right">
                مجموع {newsletters.length} مشترک در خبرنامه ثبت شده است
              </p>
            </div>
          )}
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
            درباره خبرنامه
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">📧 مشترکین</h4>
              <p className="text-slate-100">
                لیست کامل افرادی که برای دریافت اطلاعات و تخفیف‌ها ثبت‌نام
                کرده‌اند
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">📞 تماس مستقیم</h4>
              <p className="text-slate-100">
                می‌توانید مستقیماً با مشترکین تماس بگیرید و اطلاعات ارائه دهید
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
