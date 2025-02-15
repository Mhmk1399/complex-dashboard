import React, { useEffect, useState } from "react";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import EditModal from "./editModal";
import Modal from "./Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  images: {
    imageSrc: string;
    imageAlt: string;
  };
  _id: string;
  name: string;
  description: string;
  category: { _id: string; name: string };
  price: string;
  status: string;
  discount: string;
  storeId: string;
  properties: {
    name: string;
    value: string;
  }[];
  colors: {
    code: string;
    quantity: string;
  }[];
}
export const Inventory = () => {
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
        toast.success(`Product with ID ${productId} deleted successfully.`);
      } else {
        toast.error(`Failed to delete product with ID ${productId}.`);
      }
    }
  };
  let count = 0;
  const quantity=(product:{colors: {code: string, quantity: string}[]})=> {
    count=0;
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className=" py-8" dir="rtl">
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

      <h2 className="text-2xl font-bold text-center mx-16 mb-6">
        موجودی محصول{" "}
      </h2>
      <div className="overflow-x-auto lg:mx-16 mx-6 bg-white border border-[#0077b6]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-blue-100 border border-[#0077b6]">
            <tr>
              <th className="px-10 py-3 border-l border-[#0077b6]  text-right text-base font-bold text-[#0077b6] uppercase tracking-wider">
                محصول
              </th>
              <th className="px-6 py-3 text-right border-l border-[#0077b6] text-base font-bold text-[#0077b6] uppercase tracking-wider">
                دسته بندی
              </th>
              <th className="px-6 py-3 text-right border-l border-[#0077b6] text-base font-bold text-[#0077b6] uppercase tracking-wider">
                قیمت
              </th>
              <th className="px-6 py-3 text-right border-l border-[#0077b6] text-base font-bold text-[#0077b6] uppercase tracking-wider">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right border-l border-[#0077b6] text-base font-bold text-[#0077b6] uppercase tracking-wider">
                موجودی
              </th>
              <th className="px-6 py-3 text-right  text-base font-bold text-[#0077b6] uppercase tracking-wider">
                عملیات ها
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap border-l border-[#0077b6]">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium  text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.description.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className=" border-l px-5 py-4 border-[#0077b6] whitespace-nowrap">
                  <div >
                    <div className="text-sm text-center font-medium text-gray-900">
                     {product.category.name}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap border-l border-[#0077b6]">
                  <div className="text-sm text-gray-900">${product.price}</div>
                  {product.discount !== "0" && (
                    <div className="text-xs text-green-600">
                      -{product.discount}% تخفیف
                    </div>
                  )}
                </td>
               
                <td className="px-6 py-4 whitespace-nowrap border-l border-[#0077b6]">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === "available"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {product.status}
                  </span>
                </td>
                      <td className="px-6 py-4 whitespace-nowrap border-l border-[#0077b6]">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            
                              
                              <span
                               
                                className="inline-block px-2 py-1 text-xs font-semibold text-white bg-gray-600 rounded-full mr-2"
                              >
                                {quantity(product)}
                              </span>
                            
                          </div>
                        </div>

                      </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-l border-[#0077b6]">
                  <div className="flex space-x-3">
                    <button
                      title="edit"
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>

                    <button
                      title="delete"
                      onClick={() => openModal(product._id)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />
      <ToastContainer rtl={true} />
    </div>
  );
};

export default Inventory;
