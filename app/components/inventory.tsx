import React, { useEffect, useState } from "react";
import { TrashIcon, PencilIcon, PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";
import EditModal from "./editModal";
import Modal from "./Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InventoryProps, Product } from "@/types/type";

export const Inventory: React.FC<InventoryProps> = ({ setSelectedMenu }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
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
        console.error("Error deleting product:", error);
      }
      const isSuccess = true; // Replace with actual success/failure logic

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
      ...(categoryFilter && { category: categoryFilter }),
      ...(statusFilter && { status: statusFilter })
    });

    return fetch(`/api/products?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((result) => result.json())
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
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
      .catch((error) => console.error("Error:", error));
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
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, pagination.totalProducts);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0077b6]"></div>
      </div>
    );
  }

  // Empty products section
  if (!products || products.length === 0) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent">
                مدیریت موجودی محصولات
              </h2>
              <p className="text-gray-500 mt-2">
                موجودی و وضعیت محصولات خود را مدیریت کنید
              </p>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-8">
                <svg
                  className="mx-auto h-32 w-32 text-gray-300"
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
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                هیچ محصولی یافت نشد
              </h3>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                شما هنوز هیچ محصولی اضافه نکرده‌اید. برای شروع، اولین محصول خود
                را اضافه کنید.
              </p>
              <button
                onClick={() => setSelectedMenu("addProduct")}
                className="bg-gradient-to-r from-[#0077b6] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg"
              >
                <PlusIcon className="h-6 w-6" />
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
      className="px-2 md:px-4 py-4 md:py-8 min-h-screen mt-12"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-4 md:mb-6 p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent">
                مدیریت موجودی محصولات
              </h2>
              <p className="text-gray-500 hidden md:block mt-2">
                موجودی و وضعیت محصولات خود را مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setSelectedMenu("addProduct")}
              className="bg-gradient-to-r from-[#0077b6] to-blue-600 text-xs md:text-lg hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 md:py-3 px-3 md:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg w-fit"
            >
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="whitespace-nowrap">افزودن محصول</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Filters Section */}
          <div className="p-3 md:p-6 border-b">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 md:h-5 md:w-5 text-[#0077b6]" />
                <span className="font-medium text-[#0077b6] text-sm md:text-base">فیلترها:</span>
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="available">موجود</option>
                <option value="unavailable">ناموجود</option>
              </select>



              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>

          {/* Table Header with Stats */}
          <div className="bg-gradient-to-r from-[#0077b6] to-blue-600 p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-3">
              <div>
                <h3 className="text-base md:text-xl font-bold">لیست محصولات</h3>
                <p className="text-blue-100 text-xs md:text-sm mt-1">
                  {pagination.totalProducts} محصول
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="bg-white/20 flex items-center justify-center backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2">
                  <span className="text-xs md:text-sm">موجود: </span>
                  <span className="font-bold mr-1">
                    {
                      products.filter(
                        (product) => product.status === "available"
                      ).length
                    }
                  </span>
                </div>
                <div className="bg-white/20 flex items-center justify-center backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2">
                  <span className="text-xs md:text-sm">کل: </span>
                  <span className="font-bold mr-1">
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
              <thead className="bg-blue-50 border-b-2 border-[#0077b6]">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    محصول
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    دسته بندی
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    قیمت
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    موجودی
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    عملیات‌ها
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-6 py-3 md:py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0">
                          <img
                            className="h-8 w-8 md:h-12 md:w-12 rounded-lg object-cover"
                            src={product.images?.[0]?.imageSrc || '/placeholder.jpg'}
                            alt={product.name}
                          />
                        </div>
                        <div className="mr-2 md:mr-4">
                          <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-none">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {product.category?.name || 'بدون دسته‌بندی'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {parseInt(product.price).toLocaleString()} تومان
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'available' ? 'موجود' : 'ناموجود'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {quantity(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal(product._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <TrashIcon className="h-5 w-5" />
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
            <div className="px-3 md:px-6 py-3 md:py-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-xs md:text-sm text-gray-700 text-center md:text-right">
                نمایش {indexOfFirstItem} تا {indexOfLastItem} از {pagination.totalProducts} محصول
              </div>
              <div className="flex gap-1 md:gap-2 justify-center md:justify-end overflow-x-auto">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-2 md:px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
                >
                  قبلی
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
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
                      className={`px-2 md:px-3 py-1 border rounded text-xs md:text-sm ${
                        currentPage === page
                          ? 'bg-[#0077b6] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage}
                  className="px-2 md:px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs md:text-sm whitespace-nowrap"
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

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};
