import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types/type";

const EditCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedParentId, setSelectedParentId] = useState<string>("");

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

  useEffect(() => {
    fetchCategories();
  }, []);

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
      const childCategory = categories.find((cat) => cat._id === childId);

      if (parentCategory && childCategory) {
        // Check if child already has children - if so, prevent adding
        if (childCategory.children.length > 0) {
          toast.error(
            "این دسته‌بندی دارای زیر دسته است و نمی‌تواند به عنوان زیر دسته انتخاب شود"
          );
          return;
        }

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
    const categoryToDelete = categories.find((cat) => cat._id === categoryId);

    if (categoryToDelete && categoryToDelete.children.length > 0) {
      toast.error(
        "نمی‌توانید دسته‌ای را که دارای زیر دسته است حذف کنید. ابتدا زیر دسته‌ها را حذف کنید."
      );
      return;
    }

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

  // Helper function to check if a category is a child (has a parent)
  const isChildCategory = (categoryId: string) => {
    return categories.some((cat) => cat.children.includes(categoryId));
  };

  // Helper function to get parent category of a child
  const getParentCategory = (childId: string) => {
    return categories.find((cat) => cat.children.includes(childId));
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category._id);
    const hasChildren = category.children && category.children.length > 0;
    const isChild = isChildCategory(category._id);
    const parentCategory = isChild ? getParentCategory(category._id) : null;

    const childCategories = hasChildren
      ? categories.filter((cat) => category.children.includes(cat._id))
      : [];

    return (
      <motion.div
        key={category._id}
        className={`ml-${level * 4}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: level * 0.1 }}
      >
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 mb-4 overflow-hidden">
          {/* Category Header */}
          <div
            className={`p-4 border-b border-gray-100 ${
              level === 0
                ? "bg-gradient-to-r from-blue-50 to-indigo-50"
                : "bg-gradient-to-r from-green-50 to-emerald-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Expand/Collapse Button - Only for parent categories */}
                {hasChildren && level === 0 && (
                  <motion.button
                    onClick={() => toggleExpand(category._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                )}

                {/* Category Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    level === 0
                      ? "bg-gradient-to-br from-blue-500 to-purple-600"
                      : "bg-gradient-to-br from-green-500 to-emerald-600"
                  }`}
                >
                  <span className="text-white font-bold text-sm">
                    {category.name.charAt(0)}
                  </span>
                </div>

                {/* Category Name or Edit Input */}
                {editingCategory?._id === category._id ? (
                  <div className="flex items-center gap-2">
                    <motion.input
                      initial={{ width: 200 }}
                      animate={{ width: "auto" }}
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 outline-none bg-white"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleUpdate();
                        }
                        if (e.key === "Escape") {
                          setEditingCategory(null);
                          setNewName("");
                        }
                      }}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleUpdate}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        title="ذخیره"
                      >
                        <svg
                          className="w-4 h-4"
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
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setNewName("");
                        }}
                        className="w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        title="لغو"
                      >
                        <svg
                          className="w-4 h-4"
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
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            level === 0
                              ? hasChildren
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {level === 0
                            ? hasChildren
                              ? `دسته اصلی (${category.children.length} زیر دسته)`
                              : "دسته اصلی"
                            : `زیر دسته از ${parentCategory?.name}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          سطح {level + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editingCategory?._id !== category._id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                    title="ویرایش نام"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                    title="حذف دسته‌بندی"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category Management Section - Only for categories without children (potential child categories) */}
          {!hasChildren && level === 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تبدیل به زیر دسته:
                  </label>
                  <select
                    value={selectedParentId || ""}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  >
                    <option value="">انتخاب دسته والد</option>
                    {categories
                      .filter((cat) => {
                        // Only show parent categories (level 0) that are not the current category
                        // and don't already contain this category as a child
                        const isParentCategory = !isChildCategory(cat._id);
                        const isNotCurrentCategory = cat._id !== category._id;
                        const doesNotContainThisChild = !cat.children.includes(
                          category._id
                        );

                        return (
                          isParentCategory &&
                          isNotCurrentCategory &&
                          doesNotContainThisChild
                        );
                      })
                      .map((cat, index) => (
                        <option key={index} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  onClick={() =>
                    selectedParentId &&
                    addToParent(selectedParentId, category._id)
                  }
                  disabled={!selectedParentId}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  title="تبدیل به زیردسته"
                >
                  <svg
                    className="w-4 h-4"
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
                  افزودن
                </button>
              </div>

              {selectedParentId && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{category.name}</strong> به عنوان زیر دسته از{" "}
                    <strong>
                      {categories.find((c) => c._id === selectedParentId)?.name}
                    </strong>{" "}
                    اضافه خواهد شد.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Remove from parent section - Only for child categories */}
          {level === 1 && (
            <div className="p-4 bg-green-50 border-t border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      این دسته زیر مجموعه{" "}
                      <strong>{parentCategory?.name}</strong> است
                    </p>
                    <p className="text-xs text-green-600">
                      می‌توانید آن را به دسته اصلی تبدیل کنید
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromParent(category._id)}
                  className="w-full sm:w-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  title="تبدیل به دسته اصلی"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                  جدا کردن
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Children Categories - Only render if level is 0 (parent categories) */}
        <AnimatePresence>
          {isExpanded && hasChildren && level === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mr-8 relative"
            >
              {/* Connection Line */}
              <div className="absolute right-4 top-0 bottom-0 w-px bg-gradient-to-b from-green-300 to-transparent"></div>

              {childCategories.map((child, index) => (
                <div key={index} className="relative">
                  {/* Horizontal Line */}
                  <div className="absolute right-4 top-6 w-4 h-px bg-green-300"></div>
                  {renderCategory(child, level + 1)}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Get parent categories (categories that are not children of any other category)
  const getParentCategories = () => {
    return categories.filter(
      (category) =>
        !categories.some((cat) => cat.children.includes(category._id))
    );
  };

  // Get child categories count
  const getChildCategoriesCount = () => {
    return categories.filter((category) =>
      categories.some((cat) => cat.children.includes(category._id))
    ).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-3 sm:p-6"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl mb-6 p-4 sm:p-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                <svg
                  className="h-8 w-8 text-[#0077b6]"
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
                ویرایش دسته‌بندی‌ها (2 سطحه)
              </h2>
              <p className="text-gray-500 mt-2">
                دسته‌بندی‌های خود را در 2 سطح (اصلی و فرعی) سازماندهی کنید
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-blue-100 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getParentCategories().length}
                </div>
                <div className="text-xs text-blue-600">دسته اصلی</div>
              </div>
              <div className="bg-green-100 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getChildCategoriesCount()}
                </div>
                <div className="text-xs text-green-600">زیر دسته</div>
              </div>
              <div className="bg-purple-100 rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {categories.length}
                </div>
                <div className="text-xs text-purple-600">کل دسته‌ها</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white mb-6">
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
            راهنمای استفاده - سیستم 2 سطحه
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">📁 دسته‌های اصلی</h4>
              <p className="text-blue-100">
                دسته‌های اصلی می‌توانند زیر دسته داشته باشند اما خودشان زیر دسته
                نیستند
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">📄 زیر دسته‌ها</h4>
              <p className="text-blue-100">
                زیر دسته‌ها نمی‌توانند خودشان زیر دسته داشته باشند (حداکثر 2
                سطح)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-semibold mb-2">🔄 تبدیل و انتقال</h4>
              <p className="text-blue-100">
                می‌توانید دسته‌ها را بین سطح اصلی و فرعی جابجا کنید
              </p>
            </div>
          </div>
        </div>

        {/* Categories Tree */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              ساختار دسته‌بندی‌ها (2 سطحه)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const parentIds = getParentCategories().map((cat) => cat._id);
                  setExpandedCategories(new Set(parentIds));
                }}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors text-sm"
              >
                باز کردن همه
              </button>
              <button
                onClick={() => setExpandedCategories(new Set())}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors text-sm"
              >
                بستن همه
              </button>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="space-y-4">
              {getParentCategories().map((category) =>
                renderCategory(category)
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                هیچ دسته‌بندی موجود نیست
              </h3>
              <p className="text-gray-500">
                ابتدا دسته‌بندی‌های خود را ایجاد کنید
              </p>
            </div>
          )}
        </div>

        {/* Category Hierarchy Visualization */}
        {categories.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              نمای کلی ساختار (2 سطحه)
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 space-y-3">
                {getParentCategories().length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    هیچ دسته اصلی موجود نیست
                  </p>
                ) : (
                  getParentCategories().map((rootCategory, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-blue-200 pl-4"
                    >
                      <div className="font-medium text-blue-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        📁 {rootCategory.name}
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          دسته اصلی
                        </span>
                      </div>
                      {rootCategory.children.length > 0 ? (
                        <div className="mr-6 mt-2 space-y-1 border-l-2 border-green-200 pl-4">
                          {rootCategory.children.map((childId, childIndex) => {
                            const child = categories.find(
                              (c) => c._id === childId
                            );
                            return child ? (
                              <div
                                key={childIndex}
                                className="text-green-600 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                📄 {child.name}
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                  زیر دسته
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <div className="mr-6 mt-1 text-xs text-gray-400 italic">
                          بدون زیر دسته
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rules and Limitations */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-amber-200">
          <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            قوانین و محدودیت‌ها
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">✅ مجاز:</h4>
              <ul className="space-y-1 text-amber-700">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  ایجاد دسته‌های اصلی
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  افزودن زیر دسته به دسته‌های اصلی
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  تبدیل دسته اصلی به زیر دسته
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  تبدیل زیر دسته به دسته اصلی
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">❌ غیرمجاز:</h4>
              <ul className="space-y-1 text-amber-700">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  افزودن زیر دسته به زیر دسته‌ها
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  ایجاد بیش از 2 سطح
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  حذف دسته‌ای که دارای زیر دسته است
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  تبدیل دسته دارای زیر دسته به زیر دسته
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        {categories.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    دسته‌های اصلی
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {getParentCategories().length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    زیر دسته‌ها
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {getChildCategoriesCount()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    میانگین زیر دسته
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {getParentCategories().length > 0
                      ? (
                          getChildCategoriesCount() /
                          getParentCategories().length
                        ).toFixed(1)
                      : "0"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EditCategory;
