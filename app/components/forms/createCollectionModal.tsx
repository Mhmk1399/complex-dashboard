import React, { useState, useEffect } from "react";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

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
interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: {
    name: string;
    products: Product[];
    storeId: string;
    description: string;
  }) => void;
}

export const CreateCollectionModal = ({
  isOpen,
  onClose,
  onSave,
}: CreateCollectionModalProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: 0,
    max: 0,
  });
  const storeId = localStorage.getItem("storeId");
  console.log(storeId);

  useEffect(() => {
    fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products));
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storeId) {
      onSave({
        name: collectionName,
        description: collectionDescription,
        products: selectedProducts,
        storeId: storeId,
      });
      onClose();
    } else {
      console.log("Store ID is not available");
    }
  };

  const toggleProduct = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.some((p) => p._id === product._id)
        ? prev.filter((p) => p._id !== product._id)
        : [...prev, product]
    );
  };

  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((p) => parseFloat(p.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceRange({ min, max });
      setSelectedPriceRange({ min, max });
    }
  }, [products]);

  if (!isOpen) return null;
  if (products.length === 0)
    return (
      <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/50 w-fit max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex flex-col justify-center items-center space-y-5 h-full">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
          <p className="text-xl text-red-600 font-bold">محصولی برای ایجاد کالکشن وجود ندارد</p>
          <div className="flex text-sm justify-center text-white items-center h-full">
            لطفا محصولات را اضافه کنید و مجددا تلاش کنید
          </div>
        </div>
      </motion.div>
    </motion.div>
    );
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white/10 border mx-4 border-white/50 backdrop-blur-lg rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4" dir="rtl">
            <h2 className="text-xl font-bold text-white">ایجاد کالکشن جدید</h2>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} dir="rtl">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-white">نام کالکشن</label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full p-2  outline-none focus:outline-blue-500 focus:ring-blue-500 rounded bg-white/10 text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-white">توضیحات کالکشن</label>
              <input
                type="text"
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
                className="w-full p-2  outline-none focus:outline-blue-500 focus:ring-blue-500 rounded bg-white/10 text-white"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-2 mb-4 justify-evenly">
              <div className="items-center">
                <input
                  type="text"
                  placeholder="جستجوی محصولات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 placeholder:text-white  outline-none focus:outline-blue-500 focus:ring-blue-500 rounded bg-white/10 text-white"
                  />
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-sm mr-2 text-white">حداقل قیمت: {selectedPriceRange.min}</span>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={selectedPriceRange.min}
                  onChange={(e) => setSelectedPriceRange(prev => ({
                    ...prev,
                    min: Math.min(parseFloat(e.target.value), prev.max)
                  }))}
                  className="w-24"
                />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm mr-2 text-white">حداکثر قیمت: {selectedPriceRange.max}</span>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={selectedPriceRange.max}
                  onChange={(e) => setSelectedPriceRange(prev => ({
                    ...prev,
                    max: Math.max(parseFloat(e.target.value), prev.min)
                  }))}
                  className="w-24"
                />
              </div>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  parseFloat(product.price) >= selectedPriceRange.min &&
                  parseFloat(product.price) <= selectedPriceRange.max
                )
                .map(product => (
                  <motion.div
                    key={product._id}
                    className={`border rounded p-3 cursor-pointer ${
                      selectedProducts.some(p => p._id === product._id)
                        ? "border-blue-500 bg-blue-50/10"
                        : "border-white/20"
                    }`}
                    onClick={() => toggleProduct(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-gray-300">{product.price} تومان</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>

            <div className="flex justify-start space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-white text-white rounded hover:bg-white/10 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={!collectionName || selectedProducts.length === 0}
              >
                ایجاد کالکشن
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
