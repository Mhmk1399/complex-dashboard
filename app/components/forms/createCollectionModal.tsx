import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { CreateCollectionModalProps, ProductCollection } from "@/types/type";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CreateCollectionModal = ({
  isOpen,
  onClose,
  onSave,
}: CreateCollectionModalProps) => {
  const [products, setProducts] = useState<ProductCollection[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductCollection[]>(
    []
  );
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: 0,
    max: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storeId = localStorage.getItem("storeId");

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setCollectionName("");
      setCollectionDescription("");
      setSelectedProducts([]);
      setSearchQuery("");
      setErrors({});

      fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setProducts(data.products))
        .catch((error) => {
          console.error("Error fetching products:", error);
          toast.error("خطا در دریافت محصولات");
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((p) => parseFloat(p.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceRange({ min, max });
      setSelectedPriceRange({ min, max });
    }
  }, [products]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!collectionName.trim()) {
      newErrors.name = "نام کالکشن الزامی است";
    }

    if (!collectionDescription.trim()) {
      newErrors.description = "توضیحات کالکشن الزامی است";
    }

    if (selectedProducts.length === 0) {
      newErrors.products = "حداقل یک محصول برای کالکشن الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    if (!storeId) {
      toast.error("شناسه فروشگاه یافت نشد");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        name: collectionName,
        description: collectionDescription,
        products: selectedProducts,
        storeId: storeId,
      });

      toast.success("کالکشن با موفقیت ایجاد شد");
      onClose();
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("خطا در ایجاد کالکشن");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProduct = (product: ProductCollection) => {
    setSelectedProducts((prev) =>
      prev.some((p) => p._id === product._id)
        ? prev.filter((p) => p._id !== product._id)
        : [...prev, product]
    );

    // Clear products error when user adds/removes products
    if (errors.products) {
      setErrors((prev) => ({ ...prev, products: "" }));
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      !selectedProducts.some((p) => p._id === product._id) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      parseFloat(product.price) >= selectedPriceRange.min &&
      parseFloat(product.price) <= selectedPriceRange.max
  );

  if (!isOpen) return null;

  if (products.length === 0) {
    return (
      <AnimatePresence>
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
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-2xl p-8 max-w-md w-full">
            <div className="flex flex-col justify-center items-center space-y-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  محصولی وجود ندارد
                </h3>
                <p className="text-gray-600">
                  برای ایجاد کالکشن، ابتدا محصولاتی به فروشگاه خود اضافه کنید
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                متوجه شدم
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                ایجاد کالکشن جدید
              </motion.h2>
              <motion.button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <motion.form
              onSubmit={handleSubmit}
              className="p-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Collection Information Section */}
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  اطلاعات کالکشن
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Collection Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      نام کالکشن <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={collectionName}
                      onChange={(e) => {
                        setCollectionName(e.target.value);
                        if (errors.name) {
                          setErrors((prev) => ({ ...prev, name: "" }));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 placeholder-gray-400 ${
                        errors.name
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-gray-300 text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      }`}
                      placeholder="نام کالکشن را وارد کنید"
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

                  {/* Collection Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      توضیحات کالکشن <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={collectionDescription}
                      onChange={(e) => {
                        setCollectionDescription(e.target.value);
                        if (errors.description) {
                          setErrors((prev) => ({ ...prev, description: "" }));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 placeholder-gray-400 ${
                        errors.description
                          ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-gray-300 text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      }`}
                      placeholder="توضیحات کالکشن را وارد کنید"
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

              {/* Product Filters Section */}
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                  فیلتر محصولات
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        جستجو در محصولات
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="نام محصول را جستجو کنید..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white outline-none text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400"
                        />
                        <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Price Range Min */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        حداقل قیمت: {selectedPriceRange.min.toLocaleString()}{" "}
                        تومان
                      </label>
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={selectedPriceRange.min}
                        onChange={(e) =>
                          setSelectedPriceRange((prev) => ({
                            ...prev,
                            min: Math.min(parseFloat(e.target.value), prev.max),
                          }))
                        }
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 ${
                            ((selectedPriceRange.min - priceRange.min) /
                              (priceRange.max - priceRange.min)) *
                            100
                          }%, #e5e7eb ${
                            ((selectedPriceRange.min - priceRange.min) /
                              (priceRange.max - priceRange.min)) *
                            100
                          }%)`,
                        }}
                      />
                    </div>

                    {/* Price Range Max */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        حداکثر قیمت: {selectedPriceRange.max.toLocaleString()}{" "}
                        تومان
                      </label>
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={selectedPriceRange.max}
                        onChange={(e) =>
                          setSelectedPriceRange((prev) => ({
                            ...prev,
                            max: Math.max(parseFloat(e.target.value), prev.min),
                          }))
                        }
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 ${
                            ((selectedPriceRange.max - priceRange.min) /
                              (priceRange.max - priceRange.min)) *
                            100
                          }%, #e5e7eb ${
                            ((selectedPriceRange.max - priceRange.min) /
                              (priceRange.max - priceRange.min)) *
                            100
                          }%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Products Section */}
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  محصولات موجود برای انتخاب
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <motion.div
                          key={`available-product-${product._id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200 cursor-pointer"
                          onClick={() => toggleProduct(product)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-500">
                                  دسته:{" "}
                                  {typeof product.category === "object"
                                    ? product.category.name
                                    : product.category}
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                  {parseFloat(product.price).toLocaleString()}{" "}
                                  تومان
                                </span>
                              </div>
                            </div>
                          </div>
                          <motion.div
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </motion.div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p>محصولی برای انتخاب یافت نشد</p>
                        <p className="text-sm mt-1">
                          فیلترهای جستجو را تغییر دهید
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Products Section */}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  محصولات انتخاب شده <span className="text-red-500">*</span>
                </h3>
                <div
                  className={`bg-gray-50 rounded-xl p-6 ${
                    errors.products ? "border-2 border-red-200" : ""
                  }`}
                >
                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((product, index) => (
                        <motion.div
                          key={`selected-product-${product._id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-500">
                                  دسته:{" "}
                                  {typeof product.category === "object"
                                    ? product.category.name
                                    : product.category}
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                  {parseFloat(product.price).toLocaleString()}{" "}
                                  تومان
                                </span>
                              </div>
                            </div>
                          </div>
                          <motion.button
                            type="button"
                            onClick={() => toggleProduct(product)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
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
                          </motion.button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p>هیچ محصولی انتخاب نشده است</p>
                        <p className="text-sm mt-1">
                          از بالا محصولات مورد نظر را انتخاب کنید
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.products && (
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
                      {errors.products}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Collection Summary */}
              {selectedProducts.length > 0 && (
                <motion.div
                  className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    پیش‌نمایش کالکشن
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">تعداد محصولات:</span>
                      <span className="font-bold text-blue-600">
                        {selectedProducts.length} محصول
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">کمترین قیمت:</span>
                      <span className="font-bold text-green-600">
                        {Math.min(
                          ...selectedProducts.map((p) => parseFloat(p.price))
                        ).toLocaleString()}{" "}
                        تومان
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">بیشترین قیمت:</span>
                      <span className="font-bold text-purple-600">
                        {Math.max(
                          ...selectedProducts.map((p) => parseFloat(p.price))
                        ).toLocaleString()}{" "}
                        تومان
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
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
                disabled={isSubmitting}
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
                disabled={
                  isSubmitting ||
                  !collectionName ||
                  selectedProducts.length === 0
                }
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  isSubmitting ||
                  !collectionName ||
                  selectedProducts.length === 0
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                }`}
                whileHover={
                  !isSubmitting && collectionName && selectedProducts.length > 0
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !isSubmitting && collectionName && selectedProducts.length > 0
                    ? { scale: 0.98 }
                    : {}
                }
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
                    در حال ایجاد...
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    ایجاد کالکشن
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
