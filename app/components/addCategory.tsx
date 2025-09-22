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
  HiOutlineViewGrid,
} from "react-icons/hi";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Category } from "@/types/type";

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("نام دسته‌بندی الزامی است");
      return;
    }

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
      } else {
        toast.error("خطا در ایجاد دسته‌بندی");
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
    <div className="min-h-screen p-4 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 mt-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="md:text-3xl font-bold bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                <HiOutlineFolderAdd className="text-4xl text-[#0077b6]" />
                مدیریت دسته‌بندی‌ها
              </h2>
              <p className="text-gray-500 hidden md:block mt-2">
                دسته‌بندی‌های محصولات خود را ایجاد و مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r text-sm md:text-lg from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              ویرایش دسته‌بندی‌ها
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Category Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <motion.h3
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-bold mb-6 text-[#0077b6] flex items-center gap-3"
            >
              <PlusIcon className="h-6 w-6" />
              افزودن دسته‌بندی جدید
            </motion.h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <label className="text-[#0077b6] font-bold flex items-center gap-2">
                  <HiOutlineTag className="text-xl" />
                  نام دسته‌بندی
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-4 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all duration-300 outline-none"
                  placeholder="نام دسته‌بندی را وارد کنید..."
                  required
                />
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <label className="text-[#0077b6] font-bold flex items-center gap-2">
                  <HiOutlineFolderOpen className="text-xl" />
                  انتخاب زیر دسته‌ها
                </label>
                <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-blue-100">
                  {selectableCategories.length > 0 ? (
                    selectableCategories.map((category) => (
                      <motion.label
                        key={category._id}
                        className="flex items-center p-3 hover:bg-blue-50 rounded-lg cursor-pointer group transition-all duration-200 mb-2"
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
                                selectedParents.filter(
                                  (id) => id !== category._id
                                )
                              );
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-500 rounded border-blue-200 ml-3"
                        />
                        <span className="text-gray-800 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </span>
                      </motion.label>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <HiOutlineViewGrid className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                      <p>هیچ دسته‌بندی برای انتخاب موجود نیست</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-center"
              >
                <button
                  type="submit"
                  className="flex items-center gap-3 bg-gradient-to-r from-[#0077b6] to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-bold"
                >
                  <HiOutlineSave className="text-xl" />
                  ذخیره دسته‌بندی
                </button>
              </motion.div>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0077b6] to-blue-600 p-6">
              <div className="flex justify-between items-center text-white">
                <div>
                  <h3 className="text-xl font-bold">دسته‌بندی‌های موجود</h3>
                  <p className="text-blue-100 mt-1">
                    مجموع {existingCategories.length} دسته‌بندی
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">دسته‌های اصلی: </span>
                  <span className="font-bold">
                    {
                      existingCategories.filter(
                        (cat) => cat.children.length === 0
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {existingCategories.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {existingCategories.map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-[#0077b6] to-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.children.length} زیر دسته
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category.children.length === 0
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {category.children.length === 0
                            ? "دسته اصلی"
                            : "دارای زیر دسته"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HiOutlineFolderOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    هیچ دسته‌بندی موجود نیست
                  </h3>
                  <p className="text-gray-500">
                    اولین دسته‌بندی خود را ایجاد کنید
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  کل دسته‌بندی‌ها
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {existingCategories.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiOutlineFolderOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  دسته‌های اصلی
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    existingCategories.filter(
                      (cat) => cat.children.length === 0
                    ).length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HiOutlineTag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  دارای زیر دسته
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    existingCategories.filter((cat) => cat.children.length > 0)
                      .length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <HiOutlineViewGrid className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            نکات مهم
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">دسته‌بندی اصلی</h4>
              <p className="text-blue-100">
                دسته‌هایی که زیر دسته ندارند و می‌توانند به عنوان والد برای
                دسته‌های جدید انتخاب شوند.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">زیر دسته‌ها</h4>
              <p className="text-blue-100">
                با انتخاب دسته‌های اصلی، می‌توانید ساختار درختی برای
                دسته‌بندی‌هایتان ایجاد کنید.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
              <div className="min-h-full flex items-center justify-center p-1">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900">
                      ویرایش دسته‌بندی‌ها
                    </h3>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        fetchCategories();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <EditCategory />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ToastContainer rtl={true} position="top-center" />
    </div>
  );
};

export default AddCategory;
