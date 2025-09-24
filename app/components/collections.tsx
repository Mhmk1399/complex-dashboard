import React, { useEffect, useState } from "react";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { CreateCollectionModal } from "./createCollectionModal";
import { toast, ToastContainer } from "react-toastify";
import { EditCollectionModal } from "./editCollectionModal";
import DeleteModal from "./DeleteModal";
import "react-toastify/dist/ReactToastify.css";
import { Collection, ProductCollection } from "@/types/type";

export const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collectionIdToDelete, setCollectionIdToDelete] = useState<
    string | null
  >(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [pagination, setPagination] = useState({
    totalCollections: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  });

  const openDeleteModal = (collectionId: string) => {
    setCollectionIdToDelete(collectionId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCollectionIdToDelete(null);
  };

  const confirmDelete = () => {
    handleDelete(collectionIdToDelete);
    closeDeleteModal();
  };

  const handleCreateCollection = async (collectionData: {
    name: string;
    products: ProductCollection[];
  }) => {
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectionData),
      });

      if (response.ok) {
        fetchCollections();
        setIsCreateModalOpen(false);
        toast.success("کالکشن با موفقیت ایجاد شد");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ایجاد کالکشن");
    }
  };

  const fetchCollections = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      const response = await fetch(`/api/collections?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setCollections(data.collections);
      setPagination(data.pagination);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching collections:", error);
      setIsLoading(false);
    }
  };

  // Fetch collections on component mount and page change
  useEffect(() => {
    fetchCollections();
  }, [currentPage]);

  const handleDelete = async (id: string | null) => {
    if (id) {
      try {
        const response = await fetch(`/api/collections/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCollections(
            collections.filter((collection) => collection._id !== id)
          );
          toast.success("کالکشن با موفقیت حذف شد");
        } else {
          toast.error("خطا در حذف کالکشن");
        }
      } catch (error) {
        console.log(error);
        toast.error("خطا در حذف کالکشن");
      }
    }
  };

  // Pagination logic
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, pagination.totalCollections);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0077b6]"></div>
      </div>
    );
  }

  // Empty collections section
  if (!collections || collections.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="bg-white rounded-2xl p-4 md:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold  text-black">
                مدیریت کالکشنها
              </h2>
              <p className="text-gray-500 mt-2">
                کالکشنهای محصولات خود را مدیریت کنید
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                هیچ کالکشنی یافت نشد
              </h3>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                شما هنوز هیچ کالکشنی ایجاد نکردهاید. کالکشنها به شما کمک
                میکنند محصولات مرتبط را گروهبندی کنید.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-[#0077b6] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg"
              >
                <PlusIcon className="h-6 w-6" />
                ایجاد اولین کالکشن
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isCreateModalOpen && (
          <CreateCollectionModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateCollection}
          />
        )}
      </div>
    );
  }

  const handleEdit = async (collection: Collection) => {
    setSelectedCollection(collection);
    setIsEditModalOpen(true);
  };

  return (
    <div className="px-2 md:px-4 py-4 md:py-8 min-h-screen mt-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-4 md:mb-6 p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-black">
                مدیریت کالکشنها
              </h2>
              <p className="text-gray-500 hidden md:block text-base mt-2">
                کالکشنهای محصولات خود را مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-[#0077b6] text-xs md:text-lg to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 md:py-3 px-3 md:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg w-fit"
            >
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="whitespace-nowrap">ایجاد کالکشن</span>
            </button>
          </div>
        </div>

        {/* Collections Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Table Header with Stats */}
          <div className="bg-gradient-to-r from-[#0077b6] to-blue-600 p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-3">
              <div>
                <h3 className="text-base md:text-xl font-bold">لیست کالکشنها</h3>
                <p className="text-blue-100 text-xs md:text-sm mt-1">
                  {pagination.totalCollections} کالکشن
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2">
                  <span className="text-xs md:text-sm">کل محصولات: </span>
                  <span className="font-bold">
                    {collections.reduce(
                      (total, collection) => total + collection.products.length,
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
                  <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    نام کالکشن
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    تعداد محصولات
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-center text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    تاریخ ایجاد
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-bold text-[#0077b6] uppercase tracking-wider">
                    عملیاتها
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {collections.map((collection, index) => (
                  <tr
                    key={collection._id}
                    className={`hover:bg-blue-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-[#0077b6] to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs md:text-sm">
                              {collection.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs md:text-sm font-medium text-gray-900">
                              {collection.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-blue-100 text-blue-800">
                          {collection.products.length}
                        </span>
                      </div>
                    </td>

                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-center">
                        {new Date(collection.createdAt).toLocaleDateString(
                          "fa-IR"
                        )}
                      </div>
                    </td>

                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="flex gap-1 md:gap-2 justify-center">
                        <button
                          title="ویرایش"
                          onClick={() => handleEdit(collection)}
                          className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-200"
                        >
                          <PencilIcon className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                        <button
                          title="حذف"
                          onClick={() => openDeleteModal(collection._id)}
                          className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                        >
                          <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
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
              <div className="text-xs md:text-sm text-gray-700">
                نمایش {indexOfFirstItem} تا {indexOfLastItem} از {pagination.totalCollections} کالکشن
              </div>
              <div className="flex gap-1 md:gap-2 justify-center md:justify-end">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-1 border rounded text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  قبلی
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
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
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-2 md:px-3 py-1 border rounded text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateCollectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateCollection}
        />
      )}

      {isEditModalOpen && selectedCollection && (
        <EditCollectionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          collection={selectedCollection}
          fetchCollections={fetchCollections}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Collections;