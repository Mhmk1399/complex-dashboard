import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditModalProps, ImageFile } from "@/types/type";
import ImageSelectorModal from "./ImageSelectorModal";
import toast from "react-hot-toast";

const EditModal = ({ product, isOpen, onClose, onSave }: EditModalProps) => {
  const [formData, setFormData] = useState({
    images: product.images || [],
    video: product.video || { videoSrc: "", videoAlt: "" },
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
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addProperty = () => {
    if (newProperty.name && newProperty.value) {
      setFormData((prev) => ({
        ...prev,
        properties: [...prev.properties, newProperty],
      }));
      setNewProperty({ name: "", value: "" });
    }
  };

  const addColor = () => {
    if (newColor.code && newColor.quantity) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
      setNewColor({ code: "", quantity: "" });
    }
  };

  const handleImageSelect = (image: ImageFile) => {
    setFormData((prev) => {
      if (prev.images.length >= 6) return prev;
      const newImages = [
        ...prev.images,
        {
          imageSrc: image.fileUrl,
          imageAlt: image.fileName || "Product image",
        },
      ];
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "نام محصول الزامی است";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیحات محصول الزامی است";
    }

    if (formData.images.length === 0) {
      newErrors.images = "حداقل یک تصویر محصول الزامی است";
    }

    if (!formData.category._id) {
      newErrors.category = "انتخاب دسته بندی الزامی است";
    }

    if (!formData.price.trim()) {
      newErrors.price = "قیمت محصول الزامی است";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "قیمت باید عددی مثبت باشد";
    }

    if (!formData.status) {
      newErrors.status = "انتخاب وضعیت محصول الزامی است";
    }

    if (formData.colors.length === 0) {
      newErrors.colors = "حداقل یک رنگ برای محصول الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

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
      console.log("Error updating product:", error);
      toast.error(
        `خطا در ویرایش محصول: ${
          error instanceof Error ? error.message : "خطای نامشخص"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
          >
            <div className="bg-white border border-slate-200 shadow-xl rounded-lg w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <motion.h2
                    className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    ویرایش محصول
                  </motion.h2>
                  <motion.button
                    onClick={onClose}
                    className="text-slate-300 hover:text-white hover:bg-slate-700 p-1.5 rounded-md transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
              <div className="flex-1 overflow-y-auto">
                <motion.form
                  onSubmit={handleSubmit}
                  className="p-4 sm:p-6 space-y-4 sm:space-y-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                      <svg
                        className="w-4 h-4 text-slate-800"
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

                    {/* Images Section */}
                    <div className="space-y-3 mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-slate-700">
                        تصاویر محصول (حداکثر 6 تصویر){" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsImageSelectorOpen(true)}
                        disabled={formData.images.length >= 6}
                        className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                          formData.images.length >= 6
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-slate-800 hover:bg-slate-700 text-white"
                        }`}
                      >
                        انتخاب تصویر ({formData.images.length}/6)
                      </button>

                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.imageSrc}
                                alt={image.imageAlt}
                                className="w-full aspect-square object-cover rounded-md border border-slate-200 transition-transform group-hover:scale-105"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {errors.images && (
                        <p className="text-red-500 text-xs">{errors.images}</p>
                      )}
                    </div>

                    {/* Name & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-slate-700">
                          نام محصول <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            handleChange("name", e.target.value);
                            if (errors.name) {
                              setErrors((prev) => ({ ...prev, name: "" }));
                            }
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none transition-all placeholder-slate-400 ${
                            errors.name
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-slate-200 text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                          }`}
                          placeholder="نام محصول"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
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
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-slate-700">
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
                            if (errors.category) {
                              setErrors((prev) => ({ ...prev, category: "" }));
                            }
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none transition-all ${
                            errors.category
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-slate-200 text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
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
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
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
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-medium text-slate-700">
                        توضیحات محصول <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          handleChange("description", e.target.value);
                          if (errors.description) {
                            setErrors((prev) => ({ ...prev, description: "" }));
                          }
                        }}
                        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none transition-all placeholder-slate-400 resize-none ${
                          errors.description
                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-slate-200 text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                        }`}
                        rows={3}
                        placeholder="توضیحات کامل محصول"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
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
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                      <svg
                        className="w-4 h-4 text-green-600"
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-slate-700">
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
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none transition-all placeholder-slate-400 ${
                            errors.price
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-slate-200 text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                          }`}
                          placeholder="قیمت"
                        />
                        {errors.price && (
                          <p className="text-red-500 text-xs">{errors.price}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-slate-700">
                          تخفیف (%)
                        </label>
                        <div className="relative pt-2">
                          <input
                            dir="rtl"
                            type="range"
                            value={formData.discount}
                            onChange={(e) =>
                              handleChange("discount", e.target.value)
                            }
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to left, #ef4444 ${formData.discount}%, #e2e8f0 ${formData.discount}%)`,
                            }}
                            max={100}
                            min={0}
                          />
                          <span className="absolute -top-1 right-0 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                            {formData.discount}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-slate-700">
                          وضعیت <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => {
                            handleChange("status", e.target.value);
                            if (errors.status) {
                              setErrors((prev) => ({ ...prev, status: "" }));
                            }
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white outline-none transition-all ${
                            errors.status
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-slate-200 text-slate-800 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                          }`}
                        >
                          <option value="">انتخاب وضعیت</option>
                          <option value="available">موجود</option>
                          <option value="unavailable">ناموجود</option>
                        </select>
                        {errors.status && (
                          <p className="text-red-500 text-xs">
                            {errors.status}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price Calculation */}
                    {Number(formData.price) > 0 &&
                      Number(formData.discount) > 0 && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">
                                قیمت با تخفیف:
                              </span>
                              <span className="text-green-600 font-semibold">
                                {(
                                  Number(formData.price) *
                                  (1 - Number(formData.discount) / 100)
                                ).toLocaleString()}{" "}
                                تومان
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">
                                میزان تخفیف:
                              </span>
                              <span className="text-red-500 font-semibold">
                                {(
                                  Number(formData.price) *
                                  (Number(formData.discount) / 100)
                                ).toLocaleString()}{" "}
                                تومان
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Properties Section */}
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                      <svg
                        className="w-4 h-4 text-purple-600"
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

                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
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
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-slate-400"
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
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-slate-400"
                        />
                        <button
                          type="button"
                          onClick={addProperty}
                          className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-1 whitespace-nowrap"
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
                        </button>
                      </div>

                      {formData.properties.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {formData.properties.map((prop, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-slate-800 font-medium text-xs sm:text-sm truncate">
                                  {prop.name}:
                                </span>
                                <span className="text-slate-600 text-xs sm:text-sm mr-1 truncate">
                                  {prop.value}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    properties: prev.properties.filter(
                                      (_, i) => i !== index
                                    ),
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all flex-shrink-0"
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
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Colors Section */}
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
                      <svg
                        className="w-4 h-4 text-pink-600"
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
                      className={`bg-slate-50 rounded-lg p-3 space-y-3 ${
                        errors.colors ? "border-2 border-red-200" : ""
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-700 whitespace-nowrap">
                            رنگ:
                          </label>
                          <input
                            type="color"
                            value={newColor.code}
                            onChange={(e) =>
                              setNewColor({ ...newColor, code: e.target.value })
                            }
                            className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
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
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none text-slate-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder-slate-400"
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={addColor}
                          className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-1 whitespace-nowrap"
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
                        </button>
                      </div>

                      {formData.colors.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {formData.colors.map((color, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-slate-200 shadow-sm flex-shrink-0"
                                  style={{ backgroundColor: color.code }}
                                />
                                <div>
                                  <div className="text-xs text-slate-500">
                                    موجودی
                                  </div>
                                  <div className="font-semibold text-slate-800 text-sm">
                                    {color.quantity}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    colors: prev.colors.filter(
                                      (_, i) => i !== index
                                    ),
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all flex-shrink-0"
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
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {errors.colors && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
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
                        </p>
                      )}
                    </div>
                  </div>
                </motion.form>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-1"
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
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-6 py-2 text-sm rounded-lg font-medium transition-all flex items-center justify-center gap-1 shadow-sm ${
                      isSubmitting
                        ? "bg-slate-300 cursor-not-allowed text-slate-500"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
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
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <ImageSelectorModal
            isOpen={isImageSelectorOpen}
            onClose={() => setIsImageSelectorOpen(false)}
            onSelectImage={handleImageSelect}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default EditModal;
