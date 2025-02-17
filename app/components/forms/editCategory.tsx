import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip"; // Add this import

interface Category {
  _id: string;
  name: string;
  children: string[];
  storeId: string;
}

const EditCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedParentId, setSelectedParentId] = useState<string>("");

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
      setCategories(data);
    } catch (error) {
      console.log(error);
      toast.error("خطا در دریافت دسته‌بندی‌ها");
    }
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEdit = async (category: Category) => {
    setEditingCategory(category);
    setNewName(category.name);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch("/api/category", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: editingCategory._id,
          name: newName,
          children: editingCategory.children,
        }),
      });

      if (response.ok) {
        toast.success("دسته‌بندی با موفقیت ویرایش شد");
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.log(error);

      toast.error("خطا در ویرایش دسته‌بندی");
    }
  };

  const removeFromParent = async (childId: string) => {
    // Find the parent category that contains this child
    const parentCategory = categories.find((cat) =>
      cat.children.includes(childId)
    );

    if (parentCategory) {
      try {
        const updatedChildren = parentCategory.children.filter(
          (id) => id !== childId
        );

        const response = await fetch("/api/category", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: parentCategory._id,
            children: updatedChildren,
          }),
        });

        if (response.ok) {
          toast.success("زیر دسته با موفقیت حذف شد");
          fetchCategories();
        }
      } catch (error) {
        console.log(error);

        toast.error("خطا در حذف زیر دسته");
      }
    }
  };

  const addToParent = async (parentId: string, childId: string) => {
    try {
      const parentCategory = categories.find((cat) => cat._id === parentId);
      if (parentCategory) {
        const updatedChildren = [...parentCategory.children, childId];

        const response = await fetch("/api/category", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id: parentId,
            children: updatedChildren,
          }),
        });

        if (response.ok) {
          toast.success("زیر دسته با موفقیت اضافه شد");
          fetchCategories();
        }
      }
    } catch (error) {
      console.log(error);

      toast.error("خطا در افزودن زیر دسته");
    }
  };
  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch("/api/category", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: categoryId }),
      });

      if (response.ok) {
        toast.success("دسته‌بندی با موفقیت حذف شد");
        fetchCategories();
      } else {
        toast.error("خطا در حذف دسته‌بندی");
      }
    } catch (error) {
      console.log(error);

      toast.error("خطا در حذف دسته‌بندی");
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const childCategories = categories.filter((cat) =>
      category.children.includes(cat._id)
    );

    return (
      <motion.div
        key={category._id}
        className={`mr-${level * 2} sm:mr-${level * 4}`}
      >
        <motion.div
          className="bg-gradient-to-r from-white to-gray-50 p-2 rounded-xl flex lg:flex-row flex-col  lg:items-center justify-between mb-2 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 gap-2"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 w-full">
            {hasChildren && (
              <motion.button
                onClick={() => toggleExpand(category._id)}
                className="text-blue-600 hover:text-blue-800 w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                whileHover={{ rotate: 180 }}
                animate={{ rotate: isExpanded ? 180 : 0 }}
              >
                {isExpanded ? "▼" : "▶"}
              </motion.button>
            )}
            {editingCategory?._id === category._id ? (
              <motion.input
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-b-2 border-blue-400 focus:border-blue-600 outline-none px-2 py-1 bg-transparent"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 w-full justify-between ">
                <span className="font-medium text-gray-700 ">
                  {category.name}
                </span>
                <div className="flex items-center gap-x-2">
                  <motion.button
                    data-tooltip-id="delete"
                    data-tooltip-content="حذف دسته‌بندی"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(category._id)}
                    className="p-2 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </motion.button>

                  <motion.button
                    data-tooltip-id="edit"
                    data-tooltip-content="ویرایش"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(category)}
                    className="p-2 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {editingCategory?._id === category._id ? (
              <motion.button
                data-tooltip-id="save"
                data-tooltip-content="ذخیره"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap sm:flex-wrap justify-end w-full sm:w-auto">
                {(!category.children || category.children.length === 0) && (
                  <div className="flex items-center  gap-2 flex-col sm:flex-row w-full sm:w-auto">
                    <div className="flex gap-2 w-full sm:w-auto lg:justify-start justify-center ">
                      <motion.button
                        data-tooltip-id="add"
                        data-tooltip-content="افزودن به زیردسته"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          selectedParentId &&
                          addToParent(selectedParentId, category._id)
                        }
                        className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </motion.button>

                      <motion.button
                        data-tooltip-id="remove"
                        data-tooltip-content="حذف از زیردسته"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFromParent(category._id)}
                        className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </motion.button>
                      <select
                        onChange={(e) => setSelectedParentId(e.target.value)}
                        className="text-xs h-12 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-200 outline-none w-fit sm:w-auto min-w-[120px] transition-all duration-300"
                      >
                        <option value="">انتخاب دسته والد</option>
                        {categories
                          .filter((cat) => cat._id !== category._id)
                          .map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Tooltip id="edit" place="top" />
          <Tooltip id="save" place="top" />
          <Tooltip id="add" place="top" />
          <Tooltip id="remove" place="top" />
          <Tooltip id="delete" place="top" />
        </motion.div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mr-4 sm:mr-8 border-r-2 border-blue-300 pr-2 sm:pr-4"
            >
              {childCategories.map((child) => renderCategory(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/10 backdrop-blur-md border border-white p-10 rounded-lg shadow-lg z-10"
      dir="rtl"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#fff]/80 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        ویرایش دسته‌بندی‌ها
      </h2>

      <div className="space-y-4 bg-white/10 p-3 sm:p-6 rounded-xl backdrop-blur-lg">
        {categories
          .filter(
            (category) =>
              !categories.some((cat) => cat.children.includes(category._id))
          )
          .map((category) => renderCategory(category))}
      </div>
    </motion.div>
  );
};

export default EditCategory;
