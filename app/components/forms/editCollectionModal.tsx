import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

interface EditCollectionModalProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  fetchCollections: () => void;
}

interface Collection {
  _id: string;
  name: string;
  products: Product[];
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
  category: {name: string; _id: string };
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

export const EditCollectionModal = ({
  collection,
  isOpen,
  onClose,
  fetchCollections,
}: EditCollectionModalProps) => {
  const [name, setName] = useState(collection.name);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: 0,
    max: 0,
  });

  useEffect(() => {
    if (allProducts.length > 0) {
      const prices = allProducts.map((p) => parseFloat(p.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceRange({ min, max });
      setSelectedPriceRange({ min, max });
    }
  }, [allProducts]);

  useEffect(() => {
    fetch(`/api/collections/id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        id: collection._id,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setSelectedProducts(data.products);
        setAvailableProducts(data.products);
      });

    fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAllProducts(data.products));
    console.log(allProducts);
  }, [collection._id]);

  const handleRemoveProduct = (product: Product) => {
    setAvailableProducts((prev) => prev.filter((p) => p._id !== product._id));
    setSelectedProducts((prev) => prev.filter((p) => p._id !== product._id));
  };

  const handleAddProduct = (product: Product) => {
    setAvailableProducts((prev) => [...prev, product]);
    setSelectedProducts((prev) => [...prev, product]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        toast.error("کالکشن ویرایش نشد");
      }
    } catch (error) {
      console.log("کالکشن ویرایش نشد", error);
      toast.error("کالکشن ویرایش نشد");
    }
  };

  return (
    <AnimatePresence>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="w-full fixed inset-0 z-10 overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          className="flex items-center justify-center min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/50 max-w-2xl w-full mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <motion.h3
              className="text-xl font-bold mb-4 text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ویرایش کالکشن
            </motion.h3>
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {" "}
              <div className="mb-4">
                <label className="block text-sm text-white  font-medium mb-3">
                  نام کالکشن:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded bg-white/10 text-white"
                />
              </div>
              <div className="flex items-center gap-2 mb-4 justify-evenly">
                <div className="items-center">
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded mb-2 text-sm"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm mr-2">
                    کمترین: {selectedPriceRange.min}
                  </span>
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
                    className="w-24"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm mr-2">
                    بیشترین: {selectedPriceRange.max}
                  </span>
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
                    className="w-24"
                  />
                </div>
              </div>
              <div className="mb-4">
                <div className="mb-4 h-[150px] border p-1 overflow-y-auto">
                {allProducts &&
  allProducts
    .filter(
      (product) =>
        !availableProducts.some(
          (existingProduct) => existingProduct._id === product._id
        ) &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        parseFloat(product.price) >= selectedPriceRange.min &&
        parseFloat(product.price) <= selectedPriceRange.max
    )
    .map((product, index) => (
      <motion.div
        key={`available-${index}`}
        className="flex items-center border rounded-lg justify-between p-2 hover:bg-gray-200"
      >
        <div className="flex items-center">
          <span>{product.name}</span>
          <span>{typeof product.category === 'object' ? product.category.name : product.category}</span>
        </div>
                          <button
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            className="text-green-500 hover:text-green-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </motion.div>
                      ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  انتخاب محصول :
                </label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                  {availableProducts.map((product, index) => (
                    <div
                      key={`selected-${product._id}-${index}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50"
                    >
                      <div className="flex  justify-around gap-x-3">
                        {/* <Image
                                                src={product.images?.imageSrc || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-8 h-8 rounded-full object-cover mr-2"
                                                width={32}
                                                height={32}
                                            /> */}
                      </div>
                      <span>نام:{product.name}</span>
                      {/* <span> دسته بندی:{product.category}</span> */}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-start gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 hover:text-gray-50"
                >
                  لغو
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:text-gray-50"
                >
                  ثبت
                </button>
              </div>
            </motion.form>
          </motion.div>
        </motion.div>
      </Dialog>
    </AnimatePresence>
  );
};
