import React, { useEffect, useState } from "react";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import EditModal from "./editModal";
import Modal from "./Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InventoryProps, Product } from "@/types/type";

export const Inventory: React.FC<InventoryProps> = ({ setSelectedMenu }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(
    null
  );

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
    return fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((result) => result.json())
      .then((data) => {
        setProducts(data.products);
        setIsLoading(false);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      className="px-4 py-8 min-h-screen "
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="md:text-3xl font-bold bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent">
                مدیریت موجودی محصولات
              </h2>
              <p className="text-gray-500 hidden md:block mt-2">
                موجودی و وضعیت محصولات خود را مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setSelectedMenu("addProduct")}
              className="bg-gradient-to-r from-[#0077b6] to-blue-600 text-sm md:text-lg hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              افزودن محصول جدید
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Table Header with Stats */}
          <div className="bg-gradient-to-r from-[#0077b6] to-blue-600 p-6">
            <div className="flex justify-between items-center text-white">
              <div>
                <h3 className="md:text-xl font-bold">لیست محصولات</h3>
                <p className="text-blue-100 text-sm mt-1">
                  مجموع {products.length} محصول
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 flex items-center justify-center backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">محصولات موجود: </span>
                  <span className="font-bold">
                    {
                      products.filter(
                        (product) => product.status === "available"
                      ).length
                    }
                  </span>
                </div>
                <div className="bg-white/20 flex items-center justify-center backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">کل موجودی: </span>
                  <span className="font-bold">
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
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-blue-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-[#0077b6] to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.description.substring(0, 30)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {product?.category?.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {product.price} تومان
                        </div>
                        {product.discount !== "0" && (
                          <div className="text-xs text-green-600">
                            -{product.discount}% تخفیف
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.status === "available" ? "موجود" : "ناموجود"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            quantity(product) > 10
                              ? "bg-green-100 text-green-800"
                              : quantity(product) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {quantity(product)} عدد
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        <button
                          title="ویرایش"
                          onClick={() => handleEdit(product)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          title="حذف"
                          onClick={() => openModal(product._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>نمایش {products.length} محصول</div>
              <div className="flex items-center gap-4">
                <span>
                  آخرین بروزرسانی: {new Date().toLocaleDateString("fa-IR")}
                </span>
              </div>
            </div>
          </div>
        </div>

      

        {/* Statistics Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل محصولات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  محصولات موجود
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    products.filter((product) => product.status === "available")
                      .length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  محصولات ناموجود
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    products.filter((product) => product.status !== "available")
                      .length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل موجودی</p>
                <p className="text-2xl font-bold text-purple-600">
                  {products.reduce(
                    (total, product) => total + quantity(product),
                    0
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && selectedProduct && (
        <EditModal
          product={selectedProduct}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            fetchProducts();
          }}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />

      <ToastContainer position="top-center" className="text-sm" rtl={true} />
    </div>
  );
};

export default Inventory;
