import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
}
interface ProductImages {
  imageSrc: string;
  imageAlt: string;
}

interface EditModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditModal = ({ product, isOpen, onClose, onSave }: EditModalProps) => {
  const [formData, setFormData] = useState({
    imageSrc: product.images?.imageSrc || "",
    imageAlt: product.images?.imageAlt || "",
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    status: product.status,
    discount: product.discount,
    innventory: product.innventory,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: {
            imageSrc: formData.imageSrc,
            imageAlt: formData.imageAlt,
          },
          ...formData,
        }),
      });

      if (response.ok) {
        toast.success(` محصول ${product.name} با موفقیت ویرایش شد`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        onSave();
        onClose();
      } else {
        toast.error(`محصول ${product.name} ویرایش نشد`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error(`محصول ${product.name} ویرایش نشد`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.2 }}
          >
            {" "}
            <div className="bg-white/30 backdrop-blur-lg border border-white p-6 rounded-lg shadow-lg mx-2 lg:w-full max-w-4xl max-h-[90vh] overflow-y-scroll">
              <motion.h2
                className="text-2xl font-bold my-6 text-center text-blue-500 border-b border-white pb-3"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
              >
                ویرایش محصول
              </motion.h2>{" "}
              <motion.form
                onSubmit={handleSubmit}
                className="grid grid-cols-2 gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {" "}
                <div>
                  <label className="block mb-2 text-white">تصویر محصول</label>
                  <input
                    type="text"
                    value={formData.imageSrc}
                    onChange={(e) => handleChange("imageSrc", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-white">
                    متن جایگزین تصویر
                  </label>
                  <input
                    type="text"
                    value={formData.imageAlt}
                    onChange={(e) => handleChange("imageAlt", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-white">نام محصول</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-white">
                    دسته بندی محصول
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2 text-white">توضیحات محصول</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                    rows={3}
                  />
                </div>
                <div className=" items-center justify-center pt-2">
                  <label className="block mb-2 text-white font-bold">
                    تخفیف
                  </label>
                  <input
                    dir="rtl"
                    type="range"
                    value={formData.discount}
                    onChange={(e) => handleChange("discount", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                    style={{
                      background: `linear-gradient(to left, #ef4444 ${formData.discount}%, #e5e7eb ${formData.discount}%)`,
                    }}
                    max={100}
                    min={0}
                  />
                  <span className="text-white ml-2">{formData.discount}%</span>
                </div>
                <div>
                  <label className="block mb-2 text-white">وضعیت محصول</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-gray-100 focus:border-white/50 transition-all duration-300"
                  >
                    <option className="bg-blue-500" value="available">
                      موجود
                    </option>
                    <option className="bg-blue-500" value="unavailable">
                      ناموجود
                    </option>
                  </select>
                </div>
                <div className="flex flex-col  relative">
                  <label className="block mb-2 text-white font-bold">
                    قیمت
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                    required
                  />
                  {Number(formData.price) > 0 &&
                    Number(formData.discount) > 0 && (
                      <div className="absolute right-32 bg-white/85 p-3 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-black text-sm">
                            قیمت با تخفیف:
                          </span>
                          <span className="text-green-400 font-bold">
                            {(
                              Number(formData.price) *
                              (1 - Number(formData.discount) / 100)
                            ).toLocaleString()}{" "}
                            تومان
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className=" text-sm">میزان تخفیف:</span>
                          <span className="text-red-400 font-bold">
                            {(
                              Number(formData.price) *
                              (Number(formData.discount) / 100)
                            ).toLocaleString()}{" "}
                            تومان
                          </span>
                        </div>
                      </div>
                    )}
                </div>
                <div>
                  <label className="block mb-2 text-white">تعداد موجودی</label>
                  <input
                    type="text"
                    value={formData.innventory}
                    onChange={(e) => handleChange("innventory", e.target.value)}
                    className="w-full p-2 border rounded bg-white/5 border-white/20 outline-none text-white focus:border-white/50 transition-all duration-300"
                  />
                </div>
                <div className="col-span-2 flex justify-start gap-4">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    لغو
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ثبت
                  </motion.button>
                </div>
              </motion.form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditModal;
