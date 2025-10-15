"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        // Fetch the updated data to get the _id
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
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-solid rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">در حال بارگذاری...</p>
        </motion.div>
      </div>
    );
  }

  // Render form if enamad exists
  if (hasEnamad) {
    return (
      <motion.div
        className="max-w-4xl mx-auto mt-8 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        dir="rtl"
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <h2 className="text-2xl font-bold text-white">نماد اعتماد شما</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    لینک نماد اعتماد
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-800 break-all">{settings.link}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    کد نماد اعتماد
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-800 font-mono">{settings.tag}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center">
              <motion.button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isDeleting}
              >
                <svg
                  className="w-5 h-5"
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
              </motion.button>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              />
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-50"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div
                  className="bg-white/10 backdrop-blur-md border border-white p-10 rounded-lg shadow-lg z-10"
                  dir="rtl"
                >
                  <div className="text-center">
                    <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-red-600"
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
                    <h3 className="text-xl font-bold mb-4 text-center text-white">
                      تایید حذف
                    </h3>
                    <p className="mb-4 text-center text-gray-200 border-b border-white pb-3">
                      آیا از حذف نماد اعتماد اطمینان دارید؟ این عمل قابل بازگشت
                      نیست.
                    </p>

                    <div className="flex gap-3 justify-center">
                      <motion.button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isDeleting}
                      >
                        انصراف
                      </motion.button>
                      <motion.button
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <svg
                              className="animate-spin w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
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
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <h2 className="text-2xl font-bold text-white">
              افزودن نماد اعتماد جدید
            </h2>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Link Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                لینک نماد اعتماد <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.link}
                onChange={(e) => handleChange("link", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl bg-white outline-none transition-all duration-300 placeholder-gray-400 ${
                  errors.link
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
                placeholder="https://example.com/enamad-link"
                disabled={isSubmitting}
              />
              {errors.link && (
                <motion.p
                  className="text-red-500 text-sm flex items-center gap-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.link}
                </motion.p>
              )}
            </div>

            {/* Tag Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                کد نماد اعتماد <span className="text-red-500">*</span>
              </label>
              <textarea
                value={settings.tag}
                onChange={(e) => {
                  handleChange("tag", e.target.value);
                  console.log(e.target.value);
                }}
                className={`w-full px-4 py-3 border rounded-xl bg-white outline-none transition-all duration-300 placeholder-gray-400 resize-none ${
                  errors.tag
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
                rows={4}
                placeholder="کد HTML نماد اعتماد را اینجا وارد کنید..."
                disabled={isSubmitting}
              />
              {errors.tag && (
                <motion.p
                  className="text-red-500 text-sm flex items-center gap-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.tag}
                </motion.p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-600"
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
                  <h4 className="text-blue-800 font-medium mb-1">
                    راهنمای استفاده
                  </h4>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    لینک و کد نماد اعتماد را از پنل نماد اعتماد الکترونیکی
                    دریافت کرده و در فیلدهای مربوطه وارد کنید. این اطلاعات برای
                    نمایش نماد اعتماد در وب‌سایت شما استفاده خواهد شد.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : " bg-blue-600  text-white shadow-lg hover:shadow-xl"
                }`}
                onClick={handleSave}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
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
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
