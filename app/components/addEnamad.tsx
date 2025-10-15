"use client";
import { useState, useEffect } from "react";
import { EnamadSettings } from "@/types/type";
import toast from "react-hot-toast";

export const AddEnamad = () => {
  const [settings, setSettings] = useState<EnamadSettings>({
    link: "",
    tag: "",
  });
  const [hasEnamad, setHasEnamad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Function to fetch existing enamad data
  const fetchEnamadData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/enamad", {
        method: "GET",
        headers: {
          Authorization: token || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0 && data[0].link && data[0].tag) {
          setSettings({
            link: data[0].link,
            tag: data[0].tag,
            _id: data[0]._id,
          });
          setHasEnamad(true);
        } else {
          setHasEnamad(false);
          setSettings({ link: "", tag: "" });
        }
      } else {
        console.log("Failed to fetch enamad data");
      }
    } catch (error) {
      console.log("Error fetching enamad data:", error);
      toast.error("خطا در دریافت اطلاعات نماد اعتماد");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch enamad data when the component mounts
  useEffect(() => {
    fetchEnamadData();
  }, []);

  // Function to handle Validate form submission
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!settings.link.trim()) {
      newErrors.link = "لینک نماد اعتماد الزامی است";
    }

    if (!settings.tag.trim()) {
      newErrors.tag = "کد نماد اعتماد الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("لطفاً تمام فیلدهای الزامی را به درستی پر کنید");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/enamad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({
          link: settings.link,
          tag: settings.tag,
        }),
      });

      if (response.ok) {
        toast.success("نماد اعتماد با موفقیت اضافه شد");
        await fetchEnamadData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "خطا در ایجاد نماد اعتماد");
      }
    } catch (error) {
      console.log("Error creating enamad:", error);
      toast.error("خطا در ایجاد نماد اعتماد");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!settings._id) {
      toast.error("شناسه نماد اعتماد یافت نشد");
      return;
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/enamad", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ id: settings._id }),
      });

      if (response.ok) {
        toast.success("نماد اعتماد با موفقیت حذف شد");
        setHasEnamad(false);
        setSettings({ link: "", tag: "" });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "خطا در حذف نماد اعتماد");
      }
    } catch (error) {
      console.log("Error deleting enamad:", error);
      toast.error("خطا در حذف نماد اعتماد");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <>
        <style jsx>{`
          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .fade-in {
            animation: fadeIn 0.3s ease-in;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>

        <div className="flex items-center justify-center min-h-screen fade-in">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="spinner rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-slate-200 border-t-slate-500"></div>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              در حال بارگذاری...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Render form if enamad exists
  if (hasEnamad) {
    return (
      <>
        <style jsx>{`
          .fade-in {
            animation: fadeIn 0.3s ease-in;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .scale-in {
            animation: scaleIn 0.2s ease-out;
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  نماد اعتماد شما
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 sm:p-5 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-slate-600">
                      لینک نماد اعتماد
                    </label>
                    <div className="p-3 sm:p-4 bg-white rounded-lg border border-slate-200">
                      <p className="text-slate-800 break-all text-sm sm:text-base">
                        {settings.link}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-slate-600">
                      کد نماد اعتماد
                    </label>
                    <div className="p-3 sm:p-4 bg-white rounded-lg border border-slate-200">
                      <p className="text-slate-800 font-mono text-sm sm:text-base break-all">
                        {settings.tag}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base"
                  disabled={isDeleting}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  حذف نماد اعتماد
                </button>
              </div>
            </div>
          </div>

          {/* Delete Modal */}
          {isDeleteModalOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 fade-in"
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4 scale-in">
                <div
                  className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full p-5 sm:p-6"
                  dir="rtl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-900">
                      تایید حذف
                    </h3>
                    <p className="mb-4 sm:mb-5 text-sm sm:text-base text-slate-600 pb-4 border-b border-slate-200">
                      آیا از حذف نماد اعتماد اطمینان دارید؟ این عمل قابل بازگشت
                      نیست.
                    </p>

                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
                        disabled={isDeleting}
                      >
                        انصراف
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            در حال حذف...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            حذف
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .error-shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
      `}</style>

      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in"
        dir="rtl"
      >
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-500 to-slate-600 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                افزودن نماد اعتماد جدید
              </h2>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Link Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700">
                  لینک نماد اعتماد <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.link}
                  onChange={(e) => handleChange("link", e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-white outline-none transition-all duration-200 placeholder-slate-400 text-sm sm:text-base ${
                    errors.link
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                  }`}
                  placeholder="https://example.com/enamad-link"
                  disabled={isSubmitting}
                />
                {errors.link && (
                  <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1.5 error-shake">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.link}
                  </p>
                )}
              </div>

              {/* Tag Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700">
                  کد نماد اعتماد <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={settings.tag}
                  onChange={(e) => {
                    handleChange("tag", e.target.value);
                    console.log(e.target.value);
                  }}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-white outline-none transition-all duration-200 placeholder-slate-400 resize-none text-sm sm:text-base ${
                    errors.tag
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                  }`}
                  rows={4}
                  placeholder="کد HTML نماد اعتماد را اینجا وارد کنید..."
                  disabled={isSubmitting}
                />
                {errors.tag && (
                  <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1.5 error-shake">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errors.tag}
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-medium mb-1 text-xs sm:text-sm">
                      راهنمای استفاده
                    </h4>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                      لینک و کد نماد اعتماد را از پنل نماد اعتماد الکترونیکی
                      دریافت کرده و در فیلدهای مربوطه وارد کنید. این اطلاعات
                      برای نمایش نماد اعتماد در وب‌سایت شما استفاده خواهد شد.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 sm:pt-4">
                <button
                  className={`w-full py-3 sm:py-3.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 ${
                    isSubmitting
                      ? "bg-slate-400 cursor-not-allowed text-white"
                      : "bg-slate-500 hover:bg-slate-600 text-white shadow-sm hover:shadow-md"
                  }`}
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      ذخیره نماد اعتماد
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
