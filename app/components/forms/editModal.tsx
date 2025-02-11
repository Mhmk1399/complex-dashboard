import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
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
  properties: {
    name: string;
    value: string;
  }[];
  colors: {
    code: string;
    quantity: string;
  }[];
  storeId: string;
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
    properties: product.properties || [],
    colors: product.colors || []
  });
  const [categories, setCategories] = useState<Array<{ _id: string, name: string }>>([]);
  const [newProperty, setNewProperty] = useState({ name: "", value: "" });
  const [newColor, setNewColor] = useState({ code: "", quantity: "" });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/category', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast.error('خطا در دریافت دسته‌بندی‌ها');
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const addProperty = () => {
    if (newProperty.name && newProperty.value) {
      setFormData(prev => ({
        ...prev,
        properties: [...prev.properties, newProperty]
      }));
      setNewProperty({ name: "", value: "" });
    }
  };
  const addColor = () => {
    if (newColor.code && newColor.quantity) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor({ code: "", quantity: "" });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(
          formData
        ),
      });

      if (response.ok) {
        toast.success(`محصول ${product.name} با موفقیت ویرایش شد`);
        onSave();
        onClose();
      } else {
        toast.error(`خطا در ویرایش محصول ${product.name}`);
      }
    } catch (error) {
      toast.error(`خطا در ویرایش محصول: ${error}`);
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
                className="text-2xl font-bold my-6 text-center text-white border-b border-white pb-3"
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
                {/* Category dropdown */}
                <div>
                  <label className="block mb-2 text-white">دسته بندی</label>
                  <select
                    value={formData.category._id}
                    onChange={(e) => {
                      const selectedCategory = categories.find(cat => cat._id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        category: selectedCategory || { _id: "", name: "" }
                      }));
                    }}
                    className="w-full p-2 border rounded bg-white/5 border-white/20"
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Properties section */}
                <div className="col-span-2">
                  <h3 className="text-white font-bold mb-2">ویژگی‌ها</h3>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="نام ویژگی"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      className="p-2 border rounded bg-white/5 border-white/20"
                    />
                    <input
                      type="text"
                      placeholder="مقدار"
                      value={newProperty.value}
                      onChange={(e) => setNewProperty({ ...newProperty, value: e.target.value })}
                      className="p-2 border rounded bg-white/5 border-white/20"
                    />
                    <button
                      type="button"
                      onClick={addProperty}
                      className="bg-blue-500 text-white px-4 rounded"
                    >
                      افزودن
                    </button>
                  </div>
                  {/* Display existing properties */}
                  <div className="grid grid-cols-2 gap-2">
                    {formData.properties.map((prop, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white/10 rounded">
                        <span>{prop.name}: {prop.value}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              properties: prev.properties.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-500"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors section */}
                <div className="col-span-2">
                  <h3 className="text-white font-bold mb-2">رنگ‌ها</h3>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="color"
                      value={newColor.code}
                      onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                      className="w-10 h-10 rounded"
                    />
                    <input
                      type="number"
                      placeholder="تعداد"
                      value={newColor.quantity}
                      onChange={(e) => setNewColor({ ...newColor, quantity: e.target.value })}
                      className="p-2 border rounded bg-white/5 border-white/20"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="bg-blue-500 text-white px-4 rounded"
                    >
                      افزودن
                    </button>
                  </div>
                  {/* Display existing colors */}
                  <div className="grid grid-cols-2 gap-2">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white/10 rounded">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: color.code }}
                          />
                          <span>تعداد: {color.quantity}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              colors: prev.colors.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-500"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
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
