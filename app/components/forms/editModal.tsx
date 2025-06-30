import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EditModalProps } from "@/types/type";

const EditModal = ({ product, isOpen, onClose, onSave }: EditModalProps) => {
  const [formData, setFormData] = useState({
    imageSrc: product.images?.imageSrc || "",
    imageAlt: product.images?.imageAlt || "",
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    status: product.status,
    discount: product.discount,
    properties: product.properties || [],
    colors: product.colors || [],
  });
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [newProperty, setNewProperty] = useState({ name: "", value: "" });
  const [newColor, setNewColor] = useState({ code: "", quantity: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories when the modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.log(error);

        toast.error("خطا در دریافت دسته‌بندی‌ها");
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Handle form submission
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add new property and color
  const addProperty = () => {
    if (newProperty.name && newProperty.value) {
      setFormData((prev) => ({
        ...prev,
        properties: [...prev.properties, newProperty],
      }));
      setNewProperty({ name: "", value: "" });
    }
  };

  // Add new color
  const addColor = () => {
    if (newColor.code && newColor.quantity) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
      setNewColor({ code: "", quantity: "" });
    }
  };

  // Add validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Basic Information Validation
    if (!formData.name.trim()) {
      newErrors.name = "نام محصول الزامی است";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیحات محصول الزامی است";
    }

    if (!formData.imageSrc.trim()) {
      newErrors.imageSrc = "تصویر محصول الزامی است";
    }

    if (!formData.imageAlt.trim()) {
      newErrors.imageAlt = "متن جایگزین تصویر الزامی است";
    }

    // Category Validation
    if (!formData.category._id) {
      newErrors.category = "انتخاب دسته بندی الزامی است";
    }

    // Price Validation
    if (!formData.price.trim()) {
      newErrors.price = "قیمت محصول الزامی است";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "قیمت باید عددی مثبت باشد";
    }

    // Status Validation
    if (!formData.status) {
      newErrors.status = "انتخاب وضعیت محصول الزامی است";
    }

    // Colors Validation (at least one color should exist)
    if (formData.colors.length === 0) {
      newErrors.colors = "حداقل یک رنگ برای محصول الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form Patch submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(`محصول ${product.name} با موفقیت ویرایش شد`);
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `خطا در ویرایش محصول ${product.name}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        `خطا در ویرایش محصول: ${
          error instanceof Error ? error.message : "خطای نامشخص"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form reset
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
          >
            <div className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-2xl w-full max-w-5xl h-[90vh] overflow-y-scroll">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 border-b border-gray-200/20">
                <div className="flex items-center justify-between">
                  <motion.h2
                    className="text-2xl font-bold text-white flex items-center gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    ویرایش محصول
                  </motion.h2>
                  <motion.button
                    onClick={onClose}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-140px)] custom-scrollbar">
                <motion.form
                  onSubmit={handleSubmit}
                  className="p-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Basic Information Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                      اطلاعات پایه
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          تصویر محصول <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.imageSrc}
                          onChange={(e) => {
                            handleChange("imageSrc", e.target.value);
                            // Clear error when user starts typing
                            if (errors.imageSrc) {
                              setErrors((prev) => ({ ...prev, imageSrc: "" }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 placeholder-gray-400 ${
                            errors.imageSrc
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          }`}
                          placeholder="آدرس تصویر محصول"
                        />
                        {errors.imageSrc && (
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
                            {errors.imageSrc}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          متن جایگزین تصویر{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.imageAlt}
                          onChange={(e) => {
                            handleChange("imageAlt", e.target.value);
                            // Clear error when user starts typing
                            if (errors.imageAlt) {
                              setErrors((prev) => ({ ...prev, imageAlt: "" }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 placeholder-gray-400 ${
                            errors.imageAlt
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          }`}
                          placeholder="توضیح تصویر"
                        />
                        {errors.imageAlt && (
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
                            {errors.imageAlt}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          نام محصول <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            handleChange("name", e.target.value);
                            // Clear error when user starts typing
                            if (errors.name) {
                              setErrors((prev) => ({ ...prev, name: "" }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 placeholder-gray-400 ${
                            errors.name
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          }`}
                          placeholder="نام محصول"
                        />
                        {errors.name && (
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
                            {errors.name}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          دسته بندی <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category._id}
                          onChange={(e) => {
                            const selectedCategory = categories.find(
                              (cat) => cat._id === e.target.value
                            );
                            setFormData((prev) => ({
                              ...prev,
                              category: selectedCategory || {
                                _id: "",
                                name: "",
                              },
                            }));
                            // Clear error when user selects a category
                            if (errors.category) {
                              setErrors((prev) => ({ ...prev, category: "" }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 ${
                            errors.category
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          }`}
                        >
                          <option value="">انتخاب دسته بندی</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
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
                            {errors.category}
                          </motion.p>
                        )}
                      </div>
                      <div className="lg:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          توضیحات محصول <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => {
                            handleChange("description", e.target.value);
                            // Clear error when user starts typing
                            if (errors.description) {
                              setErrors((prev) => ({
                                ...prev,
                                description: "",
                              }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 placeholder-gray-400 resize-none ${
                            errors.description
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          }`}
                          rows={4}
                          placeholder="توضیحات کامل محصول"
                        />
                        {errors.description && (
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
                            {errors.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      قیمت گذاری
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          قیمت (تومان) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) => {
                            handleChange("price", e.target.value);
                            if (errors.price) {
                              setErrors((prev) => ({ ...prev, price: "" }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 placeholder-gray-400 ${
                            errors.price
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          }`}
                          placeholder="قیمت محصول"
                          required
                        />
                        {errors.price && (
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
                            {errors.price}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          تخفیف (%)
                        </label>
                        <div className="relative">
                          <input
                            dir="rtl"
                            type="range"
                            value={formData.discount}
                            onChange={(e) =>
                              handleChange("discount", e.target.value)
                            }
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to left, #ef4444 ${formData.discount}%, #e5e7eb ${formData.discount}%)`,
                            }}
                            max={100}
                            min={0}
                          />
                          <span className="absolute -top-8 right-0 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {formData.discount}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          وضعیت محصول <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => {
                            handleChange("status", e.target.value);
                            // Clear error when user selects a status
                            if (errors.status) {
                              setErrors((prev) => ({ ...prev, status: "" }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 ${
                            errors.status
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          }`}
                        >
                          <option value="">انتخاب وضعیت</option>
                          <option value="available">موجود</option>
                          <option value="unavailable">ناموجود</option>
                        </select>
                        {errors.status && (
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
                            {errors.status}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Price Calculation Display */}
                    {Number(formData.price) > 0 &&
                      Number(formData.discount) > 0 && (
                        <motion.div
                          className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                قیمت با تخفیف:
                              </span>
                              <span className="text-green-600 font-bold text-lg">
                                {(
                                  Number(formData.price) *
                                  (1 - Number(formData.discount) / 100)
                                ).toLocaleString()}{" "}
                                تومان
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                میزان تخفیف:
                              </span>
                              <span className="text-red-500 font-bold">
                                {(
                                  Number(formData.price) *
                                  (Number(formData.discount) / 100)
                                ).toLocaleString()}{" "}
                                تومان
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                  </div>

                  {/* Properties Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      ویژگی‌ها
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                          type="text"
                          placeholder="نام ویژگی"
                          value={newProperty.name}
                          onChange={(e) =>
                            setNewProperty({
                              ...newProperty,
                              name: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="مقدار"
                          value={newProperty.value}
                          onChange={(e) =>
                            setNewProperty({
                              ...newProperty,
                              value: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-400"
                        />
                        <motion.button
                          type="button"
                          onClick={addProperty}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          افزودن
                        </motion.button>
                      </div>

                      {/* Display existing properties */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.properties.map((prop, index) => (
                          <motion.div
                            key={index}
                            className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex-1">
                              <span className="text-gray-800 font-medium">
                                {prop.name}:
                              </span>
                              <span className="text-gray-600 mr-2">
                                {prop.value}
                              </span>
                            </div>
                            <motion.button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  properties: prev.properties.filter(
                                    (_, i) => i !== index
                                  ),
                                }));
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Colors Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
                      <svg
                        className="w-5 h-5 text-pink-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                        />
                      </svg>
                      رنگ‌ها و موجودی <span className="text-red-500">*</span>
                    </h3>
                    <div
                      className={`bg-gray-50 rounded-xl p-6 ${
                        errors.colors ? "border-2 border-red-200" : ""
                      }`}
                    >
                      {" "}
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-gray-700">
                            رنگ:
                          </label>
                          <input
                            type="color"
                            value={newColor.code}
                            onChange={(e) =>
                              setNewColor({ ...newColor, code: e.target.value })
                            }
                            className="w-12 h-12 rounded-xl border-2 border-gray-300 cursor-pointer"
                          />
                        </div>
                        <input
                          type="number"
                          placeholder="تعداد موجودی"
                          value={newColor.quantity}
                          onChange={(e) =>
                            setNewColor({
                              ...newColor,
                              quantity: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none text-gray-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 placeholder-gray-400"
                          min="0"
                        />
                        <motion.button
                          type="button"
                          onClick={addColor}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          افزودن
                        </motion.button>
                      </div>
                      {/* Display existing colors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {formData.colors.map((color, index) => (
                          <motion.div
                            key={index}
                            className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: color.code }}
                              />
                              <div>
                                <div className="text-xs text-gray-500">
                                  موجودی
                                </div>
                                <div className="font-semibold text-gray-800">
                                  {color.quantity}
                                </div>
                              </div>
                            </div>
                            <motion.button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  colors: prev.colors.filter(
                                    (_, i) => i !== index
                                  ),
                                }));
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                      {errors.colors && (
                        <motion.p
                          className="text-red-500 text-sm flex items-center gap-1 mt-2"
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
                          {errors.colors}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.form>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
                <div className="flex flex-col sm:flex-row justify-start gap-4">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    لغو
                  </motion.button>
                  <motion.button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    }`}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
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
                        در حال ذخیره...
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        ذخیره تغییرات
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
  );
};

export default EditModal;
