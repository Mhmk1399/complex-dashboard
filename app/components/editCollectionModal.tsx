import React, { useState, useEffect } from "react";
import { EditCollectionModalProps, ProductCollection } from "@/types/type";
import toast from "react-hot-toast";

// CSS animations to replace framer motion
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .animate-slide-in { animation: slideIn 0.2s ease-out 0.05s both; }
  .animate-fade-in-up { animation: fadeInUp 0.2s ease-out 0.1s both; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export const EditCollectionModal = ({
  collection,
  isOpen,
  onClose,
  fetchCollections,
}: EditCollectionModalProps) => {
  const [name, setName] = useState(collection.name);
  const [selectedProducts, setSelectedProducts] = useState<ProductCollection[]>(
    []
  );
  const [availableProducts, setAvailableProducts] = useState<
    ProductCollection[]
  >([]);
  const [allProducts, setAllProducts] = useState<ProductCollection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: 0,
    max: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (allProducts.length > 0) {
      const prices = allProducts.map((p) => parseFloat(p.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
       setSelectedPriceRange({ min, max });
    }
  }, [allProducts]);

  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      setName(collection.name);
      setErrors({});

      fetch(`/api/collections/id`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          id: collection._id,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setSelectedProducts(data.products);
          setAvailableProducts(data.products);
        })
        .catch((error) => {
          console.log("Error fetching collection:", error);
          toast.error("خطا در دریافت اطلاعات کالکشن");
        });

      fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setAllProducts(data.products))
        .catch((error) => {
          console.log("Error fetching products:", error);
          toast.error("خطا در دریافت محصولات");
        });
    }
  }, [collection._id, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "نام کالکشن الزامی است";
    }

    if (selectedProducts.length === 0) {
      newErrors.products = "حداقل یک محصول برای کالکشن الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRemoveProduct = (product: ProductCollection) => {
    setAvailableProducts((prev) => prev.filter((p) => p._id !== product._id));
    setSelectedProducts((prev) => prev.filter((p) => p._id !== product._id));

    // Clear products error when user adds/removes products
    if (errors.products) {
      setErrors((prev) => ({ ...prev, products: "" }));
    }
  };

  const handleAddProduct = (product: ProductCollection) => {
    setAvailableProducts((prev) => [...prev, product]);
    setSelectedProducts((prev) => [...prev, product]);

    // Clear products error when user adds/removes products
    if (errors.products) {
      setErrors((prev) => ({ ...prev, products: "" }));
    }
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

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/collections/${collection._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          products: selectedProducts,
        }),
      });

      if (response.ok) {
        toast.success("کالکشن با موفقیت ویرایش شد");
        onClose();
        fetchCollections();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "کالکشن ویرایش نشد");
      }
    } catch (error) {
      console.log("کالکشن ویرایش نشد", error);
      toast.error("خطا در ویرایش کالکشن");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = allProducts.filter(
    (product) =>
      !availableProducts.some(
        (existingProduct) => existingProduct._id === product._id
      ) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      parseFloat(product.price) >= selectedPriceRange.min &&
      parseFloat(product.price) <= selectedPriceRange.max
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 animate-scale-in">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 animate-slide-in">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="hidden sm:inline">ویرایش کالکشن</span>
                <span className="sm:hidden">ویرایش</span>
              </h2>
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
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
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <form
              onSubmit={handleSubmit}
              className="p-3 sm:p-5 space-y-4 sm:space-y-5 animate-fade-in-up"
            >
              {/* Collection Name Section */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  اطلاعات کالکشن
                </h3>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700">
                    نام کالکشن <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    className={`w-full px-3 py-2 sm:py-2.5 text-sm border rounded-lg bg-white outline-none transition-all placeholder-slate-400 ${
                      errors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    placeholder="نام کالکشن را وارد کنید"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in">
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
              </div>

              {/* Product Filters Section */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                  فیلتر محصولات
                </h3>
                <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      جستجو در محصولات
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="جستجو..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-400"
                      />
                      <svg
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
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
                </div>
              </div>

              {/* Available Products Section */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  محصولات موجود برای افزودن
                </h3>
                <div className="bg-slate-50 rounded-lg p-2 sm:p-3">
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <div
                          key={`available-${product._id}-${index}`}
                          className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 text-xs sm:text-sm truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500 truncate">
                                  {typeof product.category === "object"
                                    ? product.category.name
                                    : product.category}
                                </span>
                                <span className="text-xs font-medium text-blue-600 whitespace-nowrap">
                                  {parseFloat(product.price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
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
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 sm:p-8 text-center text-slate-500">
                        <svg
                          className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300"
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
                        <p className="text-xs sm:text-sm">محصولی یافت نشد</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Products Section */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  محصولات انتخاب شده <span className="text-red-500">*</span>
                </h3>
                <div
                  className={`bg-slate-50 rounded-lg p-2 sm:p-3 ${
                    errors.products ? "ring-2 ring-red-200" : ""
                  }`}
                >
                  <div className="max-h-60 sm:max-h-80 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((product, index) => (
                        <div
                          key={`selected-${product._id}-${index}`}
                          className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700"
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
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 text-xs sm:text-sm truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500 truncate">
                                  {typeof product.category === "object"
                                    ? product.category.name
                                    : product.category}
                                </span>
                                <span className="text-xs font-medium text-blue-600 whitespace-nowrap">
                                  {parseFloat(product.price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(product)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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
                      ))
                    ) : (
                      <div className="p-6 sm:p-8 text-center text-slate-500">
                        <svg
                          className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300"
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
                        <p className="text-xs sm:text-sm">محصولی انتخاب نشده</p>
                        <p className="text-xs mt-1">
                          حداقل یک محصول انتخاب کنید
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.products && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1.5 animate-fade-in">
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
                      {errors.products}
                    </p>
                  )}
                </div>
              </div>

              {/* Collection Summary */}
              {selectedProducts.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-lg p-3 sm:p-4 animate-fade-in-up">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    خلاصه کالکشن
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <span className="block text-slate-600 mb-0.5">تعداد</span>
                      <span className="font-bold text-blue-600">
                        {selectedProducts.length}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-slate-600 mb-0.5">
                        کمترین
                      </span>
                      <span className="font-bold text-blue-600">
                        {Math.min(
                          ...selectedProducts.map((p) => parseFloat(p.price))
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-slate-600 mb-0.5">
                        بیشترین
                      </span>
                      <span className="font-bold text-blue-600">
                        {Math.max(
                          ...selectedProducts.map((p) => parseFloat(p.price))
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-3 sm:px-5 py-3 flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
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
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  isSubmitting
                    ? "bg-slate-300 cursor-not-allowed text-slate-500"
                    : "bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-700 text-white shadow-sm"
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
      </div>
    </>
  );
};
