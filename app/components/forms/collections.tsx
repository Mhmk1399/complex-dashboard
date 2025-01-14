import React, { useEffect, useState } from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CreateCollectionModal } from "./createCollectionModal";
import { toast, ToastContainer } from "react-toastify";
import { EditCollectionModal } from "./editCollectionModal";
import DeleteModal from "./DeleteModal";
import "react-toastify/dist/ReactToastify.css";

interface Collection {
  _id: string;
  name: string;
  products: Product[]; // Changed from string[] to Product[]
  createdAt: string;
  updatedAt: string;
}

interface Product {
  images?: ProductImages;
  _id: string;
  imageSrc?: string;
  imageAlt?: string;
  name: string;
  description: string;
  category: string;
  price: string;
  status: string;
  discount: string;
  id: string;
  innventory: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  storeId: string;
}
interface ProductImages {
  imageSrc: string;
  imageAlt: string;
}
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
    products: Product[];
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

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setCollections(data.collections);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching collections:", error);
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleEdit = async (collection: Collection) => {
    try {
      const response = await fetch(`/api/collections/${collection._id}`);
      const data = await response.json();
      setSelectedCollection({
        ...collection,
        // This will contain only the products in this collection
        products: data.products,
      });
      setIsEditModalOpen(true);

      fetchCollections();
    } catch (error) {
      console.error("Error fetching collection details:", error);
    }
  };

  return (
    <div className="px-4 py-8" dir="rtl">
      <div className="flex justify-center lg:mx-16 items-center mb-6">
        <h2 className="text-2xl text-center font-bold">کالکشن</h2>
      </div>
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
      <div className=" overflow-x-auto bg-white rounded-lg lg:mx-16 mx-6 shadow">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-500 absolute lg:-mr-8 -mr-9 text-white text-2xl text-center font-extrabold lg:px-2 lg:py-1 p-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          +
        </button>
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-500">
            <tr>
              <th className="px-8 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                نام
              </th>
              <th className="px-8 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                تعداد محصولات
              </th>
              <th className="px-8 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                تاریخ ایجاد
              </th>
              <th className="px-8 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {collections.map((collection) => (
              <tr
                key={collection._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-8 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {collection.name}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {collection.products.length}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon
                        className="h-5 w-5"
                        onClick={() => handleEdit(collection)}
                      />
                    </button>
                    <button
                      onClick={() => openDeleteModal(collection._id)}
                      className="text-red-600 hover:text-red-900"
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
      <ToastContainer rtl={true} />
    </div>
  );
};

export default Collections;
