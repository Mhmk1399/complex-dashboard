import React, { useEffect, useState } from "react";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { CreateCollectionModal } from "./createCollectionModal";
import { EditCollectionModal } from "./editCollectionModal";
import DeleteModal from "./DeleteModal";
import { Collection, ProductCollection } from "@/types/type";
import toast from "react-hot-toast";

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
    hasPrev: false,
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
      console.log(error);
      toast.error("خطا در ایجاد کالکشن");
    }
  };

  const fetchCollections = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
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
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    pagination.totalCollections
  );

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
      <div className="min-h-screen py-6 sm:py-8 mt-10 " dir="rtl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                مدیریت کالکشن ها
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                کالکشن های محصولات خود را مدیریت کنید
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-700 mb-3">
                هیچ کالکشنی یافت نشد
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md text-center px-4">
                شما هنوز هیچ کالکشنی ایجاد نکرده اید. کالکشن ها به شما کمک می کنند
                محصولات مرتبط را گروه بندی کنید.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-5 w-5" />
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
    <div
      className="px-3 sm:px-4 py-4 sm:py-6 min-h-screen mt-12 sm:mt-16  "
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-4 p-3 sm:p-4">
          <div className="flex flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800">
                مدیریت کالکشن ها
              </h2>
              <p className="text-slate-500 hidden md:block text-xs sm:text-sm mt-0.5">
                کالکشن های محصولات خود را مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#0077b6] hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all flex items-center gap-2 shadow-sm text-xs md:text-sm w-fit"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>ایجاد کالکشن</span>
            </button>
          </div>
        </div>

        {/* Collections Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Table Header with Stats */}
          <div className="bg-slate-800 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-semibold">
                  لیست کالکشن ها
                </h3>
                <p className="text-slate-300 text-xs mt-0.5">
                  {pagination.totalCollections} کالکشن
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm w-fit">
                <span className="text-slate-300">کل محصولات: </span>
                <span className="font-semibold">
                  {collections.reduce(
                    (total, collection) => total + collection.products.length,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    نام کالکشن
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    تعداد محصولات
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    تاریخ ایجاد
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {collections.map((collection, index) => (
                  <tr
                    key={collection._id}
                    className={`hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[120px] sm:max-w-none">
                          {collection.name}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {collection.products.length}
                        </span>
                      </div>
                    </td>

                    <td className="hidden md:table-cell px-4 py-3">
                      <div className="text-xs text-slate-600 text-center">
                        {new Date(collection.createdAt).toLocaleDateString(
                          "fa-IR"
                        )}
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex gap-1 sm:gap-2 justify-center">
                        <button
                          title="ویرایش"
                          onClick={() => handleEdit(collection)}
                          className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                          <PencilIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          title="حذف"
                          onClick={() => openDeleteModal(collection._id)}
                          className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            <div className="px-3 sm:px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-right">
                نمایش {indexOfFirstItem} تا {indexOfLastItem} از{" "}
                {pagination.totalCollections} کالکشن
              </div>
              <div className="flex gap-1 justify-center sm:justify-end overflow-x-auto">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
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
                            ? "bg-[#0077b6] text-white border-[#0077b6]"
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
                  disabled={currentPage === pagination.totalPages}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors bg-white"
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
    </div>
  );
};

export default Collections;
