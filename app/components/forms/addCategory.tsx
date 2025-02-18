import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditCategory from "./editCategory";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineFolderAdd,
  HiOutlineTag,
  HiOutlineFolderOpen,
  HiOutlineSave,
  HiOutlinePencil,
} from "react-icons/hi";

interface Category {
  _id: string;
  name: string;
  children: string[];
  storeId: string;
}

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setExistingCategories(data);
    } catch (error) {
      toast.error("خطا در دریافت دسته‌بندی‌ها");
      console.log(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: categoryName,
          children: selectedParents,
        }),
      });

      if (response.ok) {
        toast.success("دسته‌بندی با موفقیت ایجاد شد");
        setCategoryName("");
        setSelectedParents([]);
        fetchCategories();
      }
    } catch (error) {
      toast.error("خطا در ایجاد دسته‌بندی");
      console.log(error);
    }
  };

  const selectableCategories = existingCategories.filter(
    (category) => category.children.length === 0
  );

  return (
    <>
      <div className="min-h-screen bg-transparent mt-12 p-8" dir="rtl">
        <div className="max-w-6xl mx-auto backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl p-8 border border-blue-100">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold mb-8 text-[#0077b6] flex items-center gap-3"
          >
            <HiOutlineFolderAdd className="text-4xl" />
            افزودن دسته‌بندی جدید
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <label className=" text-[#0077b6] font-bold flex items-center gap-2">
                <HiOutlineTag className="text-xl" />
                نام دسته‌بندی
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full p-3 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all duration-300 outline-none"
                placeholder="نام دسته‌بندی را وارد کنید..."
                required
              />
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <label className=" text-[#0077b6] font-bold flex items-center gap-2">
                <HiOutlineFolderOpen className="text-xl" />
                انتخاب زیر دسته‌
              </label>
              <div className="bg-white/90 rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar border border-blue-100">
                {selectableCategories.map((category) => (
                  <motion.label
                    key={category._id}
                    className="flex items-center p-2 hover:bg-blue-50 rounded-lg cursor-pointer group transition-all duration-200 mb-2"
                    whileHover={{ x: 4 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParents.includes(category._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParents([
                            ...selectedParents,
                            category._id,
                          ]);
                        } else {
                          setSelectedParents(
                            selectedParents.filter((id) => id !== category._id)
                          );
                        }
                      }}
                      className="form-checkbox h-5 w-5 text-blue-500 rounded border-blue-200 ml-3"
                    />
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </span>
                  </motion.label>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center md:justify-start items-center gap-4 mt-8"
          >
            <button
              onClick={handleSubmit}
              className="flex items-center text-nowrap text-sm md:text-lg gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white md:px-6 px-3 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <HiOutlineSave className="text-xl" />
              ذخیره دسته‌بندی
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center text-nowrap text-sm md:text-lg gap-2 bg-white border border-blue-200 text-blue-500 md:px-6 px-3 py-3 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
            >
              <HiOutlinePencil className="text-xl" />
              ویرایش دسته‌بندی‌ها
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              className="fixed inset-4 z-50 overflow-auto"
            >
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  fetchCategories();
                }}
                className="absolute top-9 left-4 p-2  z-[9999] text-[#ffffff] rounded-full hover:opacity-85 transition-colors"
              >
                ✕
              </button>
              <EditCategory />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <ToastContainer rtl={true} position="top-center" />
    </>
  );
};

export default AddCategory;
