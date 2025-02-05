import { useState, useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditCategory from './editCategory';
import { AnimatePresence, motion } from "framer-motion";

interface Category {
  _id: string;
  name: string;
  children: string[];
  storeId: string;
}

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setExistingCategories(data);
    } catch (error) {
      toast.error('خطا در دریافت دسته‌بندی‌ها');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: categoryName,
          children: selectedParents
        })
      });

      if (response.ok) {
        toast.success("دسته‌بندی با موفقیت ایجاد شد");
        setCategoryName('');
        setSelectedParents([]);
        fetchCategories();
      }
    } catch (error) {
      toast.error("خطا در ایجاد دسته‌بندی");
      console.error(error);
    }
  };

  const selectableCategories = existingCategories.filter(category => category.children.length === 0);

  return (
    <>
    <div className="p-4 grid lg:mx-auto lg:max-w-6xl mx-3 grid-cols-1 rounded-2xl bg-[#0077b6] md:grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-2 text-white lg:col-span-2 col-span-1">
        افزودن دسته‌بندی جدید
      </h2>

      <div>
        <label className="block mb-2 text-white font-bold">نام دسته‌بندی</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full p-2 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-white font-bold">انتخاب زیر دسته‌ </label>
        <div className="bg-white rounded-xl p-2 max-h-40 overflow-y-auto">
          {selectableCategories.map((category) => (
            <label key={category._id} className="flex items-center text-gray-800 mb-2">
              <input
                type="checkbox"
                checked={selectedParents.includes(category._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedParents([...selectedParents, category._id]);
                  } else {
                    setSelectedParents(selectedParents.filter(id => id !== category._id));
                  }
                }}
                className="mr-2"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>
          <div className="flex justify-center w-full col-span-2 gap-2">
            <button
        onClick={handleSubmit}
        className=" w-full bg-gradient-to-r border from-sky-600 to-sky-500 text-white mt-5 py-2 text-xl font-bold rounded-full mx-auto hover:from-sky-700 hover:to-sky-600 transition-all"
      >
        ذخیره دسته‌بندی
      </button>
      <motion.button
          
          onClick={() => setIsModalOpen(true)}
          className=" w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white mt-3 py-2 text-xl font-bold rounded-full hover:from-indigo-700 hover:to-indigo-600 transition-all"
        >
          ویرایش دسته‌بندی‌ها
        </motion.button>

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
                onClick={() =>{setIsModalOpen(false)
                  fetchCategories()
                } }
                className="absolute top-4 left-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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
