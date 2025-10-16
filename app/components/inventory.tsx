import React, { useEffect, useState } from "react";
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import EditModal from "./editModal";
import Modal from "./Modal";
import { InventoryProps, Product } from "@/types/type";
import toast from "react-hot-toast";

export const Inventory: React.FC<InventoryProps> = ({ setSelectedMenu }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(
    null
  );

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const openModal = (productId: string) => {
    setProductIdToDelete(productId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProductIdToDelete(null);
  };

  const confirmDelete = () => {
    handleDelete(productIdToDelete);
    closeModal();
  };

  const handleDelete = (productId: string | null) => {
    if (productId) {
      try {
        fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });
        setProducts(products.filter((product) => product._id !== productId));
      } catch (error) {
        console.log("Error deleting product:", error);
      }
      const isSuccess = true;

      if (isSuccess) {
        toast.success(` محصول با شناسه ${productId} با موفقیت حذف شد`);
      } else {
        toast.error(` خطا در حذف محصول با شناسه ${productId}`);
      }
    }
  };

  let count = 0;

  const quantity = (product: {
    colors: { code: string; quantity: string }[];
  }) => {
    count = 0;
    product.colors.forEach((color) => {
      count += parseInt(color.quantity);
    });
    return count;
  };

  const fetchProducts = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
    });

    if (categoryFilter) params.append("category", categoryFilter);
    if (statusFilter) params.append("status", statusFilter);

    return fetch(`/api/products?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((result) => result.json())
      .then((data) => {
        setProducts(data.products || []);
        setPagination(data.pagination || {
          totalPages: 0,
          totalProducts: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error:", error);
        setProducts([]);
        setIsLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch("/api/category", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((result) => result.json())
      .then((data) => setCategories(data))
      .catch((error) => console.log("Error:", error));
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, categoryFilter, statusFilter]);

  // Pagination logic
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    pagination.totalProducts
  );

  const hasActiveFilters = categoryFilter || statusFilter;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0077b6]"></div>
      </div>
    );
  }

  if (!products || (products.length === 0 && !hasActiveFilters)) {
    return (
      <div className="min-h-screen mt-10 py-6 sm:py-8" dir="rtl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className=" backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                مدیریت موجودی محصولات
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                موجودی و وضعیت محصولات خود را مدیریت کنید
              </p>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="mb-6">
                <svg
                  className="mx-auto h-24 w-24 sm:h-32 sm:w-32 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-3">
                هیچ محصولی یافت نشد
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md text-center px-4">
                شما هنوز هیچ محصولی اضافه نکرده‌اید. برای شروع، اولین محصول خود
                را اضافه کنید.
              </p>
              <button
                onClick={() => setSelectedMenu("addProduct")}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-5 w-5" />
                افزودن اولین محصول
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-3 sm:px-4 py-4 sm:py-6 min-h-screen mt-12 sm:mt-16  "
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 mb-4 p-3 sm:p-4">
          <div className="flex  flex-row justify-between sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800">
                موجودی محصولات
              </h2>
              <p className="text-slate-500 hidden md:block text-xs sm:text-sm mt-0.5">
                موجودی و وضعیت محصولات خود را مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setSelectedMenu("addProduct")}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all flex items-center gap-2 shadow-sm text-xs text-nowrap md:text-sm w-fit"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>افزودن محصول</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Filters Section */}
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-slate-600" />
                <span className="font-medium text-slate-700 text-sm">
                  فیلترها:
                </span>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="available">موجود</option>
                <option value="unavailable">ناموجود</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>

          {/* Table Header with Stats */}
          <div className="bg-slate-800 p-3 sm:p-4">
            <div className="flex justify-between items-center text-white gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">
                  لیست محصولات
                </h3>
                <p className="text-slate-300 text-xs mt-0.5">
                  {pagination.totalProducts} محصول
                </p>
              </div>
              <div className="flex gap-2">
                <div className="  backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm">
                  <span className="text-slate-300">موجود: </span>
                  <span className="font-semibold">
                    {
                      products.filter(
                        (product) => product.status === "available"
                      ).length
                    }
                  </span>
                </div>
                <div className="  backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm">
                  <span className="text-slate-300">کل: </span>
                  <span className="font-semibold">
                    {products.reduce(
                      (total, product) => total + quantity(product),
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs text-nowrap font-semibold text-slate-700 uppercase tracking-wider">
                    محصول
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs text-nowrap font-semibold text-slate-700 uppercase tracking-wider">
                    دسته بندی
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs text-nowrap font-semibold text-slate-700 uppercase tracking-wider">
                    قیمت
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs text-nowrap font-semibold text-slate-700 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs text-nowrap font-semibold text-slate-700 uppercase tracking-wider">
                    موجودی
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs text-nowrap font-semibold text-slate-700 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FunnelIcon className="h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                          محصولی با این فیلتر یافت نشد
                        </h3>
                        <p className="text-slate-500 text-sm mb-4">
                          لطفا فیلترهای دیگری را امتحان کنید
                        </p>
                        <button
                          onClick={clearFilters}
                          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          پاک کردن فیلترها
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <img
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover border border-slate-200"
                            src={
                              product.images?.[0]?.imageSrc ||
                              "/placeholder.jpg"
                            }
                            alt={product.name}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[120px] sm:max-w-none">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-xs sm:text-sm text-slate-700">
                        {product.category?.name || "بدون دسته‌بندی"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-xs sm:text-sm font-medium text-slate-800">
                        {parseInt(product.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 mr-1">تومان</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          product.status === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.status === "available" ? "موجود" : "ناموجود"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-xs sm:text-sm font-medium text-slate-800">
                        {quantity(product)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
                          title="ویرایش"
                        >
                          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => openModal(product._id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-3 sm:px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-right">
                نمایش {indexOfFirstItem} تا {indexOfLastItem} از{" "}
                {pagination.totalProducts} محصول
              </div>
              <div className="flex gap-1 justify-center sm:justify-end overflow-x-auto">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!pagination.hasPrevPage}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors bg-white"
                >
                  قبلی
                </button>
                {Array.from(
                  { length: Math.min(pagination.totalPages, 5) },
                  (_, i) => {
                    let page;
                    if (pagination.totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      page = pagination.totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-md transition-colors ${
                          currentPage === page
                            ? "bg-slate-800 text-white border-slate-800"
                            : "border-slate-200 hover:bg-slate-100 bg-white"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages)
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors bg-white"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {isEditModalOpen && selectedProduct && (
          <EditModal
            product={selectedProduct}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={fetchProducts}
          />
        )}

        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </div>
  );
};
