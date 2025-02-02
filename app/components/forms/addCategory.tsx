import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CategoryFormData {
  name: string;
  description: string;
  parentCategory?: string;
  isActive: boolean;
}

export const AddCategory: React.FC = () => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <motion.div 
      className="p-6 bg-gray-200 backdrop-blur-md rounded-xl border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-white text-center">افزودن دسته‌بندی جدید</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div className="space-y-2">
          <label className="block text-gray-500">نام دسته‌بندی</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white border border-white/10 text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        

        <div className="space-y-2">
          <label className="block text-gray-500">دسته‌بندی والد</label>
          <select
            name="parentCategory"
            value={formData.parentCategory}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white border border-white/10 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">بدون دسته‌بندی والد</option>
            {/* Add category options dynamically here */}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="rounded bg-white border border-white/10"
          />
          <label className="text-gray-500">فعال</label>
        </div>

        <motion.button
          type="submit"
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ثبت دسته‌بندی
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddCategory;
