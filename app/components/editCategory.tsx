import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Category } from "@/types/type";
import toast from "react-hot-toast";

const EditCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const draggablesRef = useRef<Draggable[]>([]);

  // Register GSAP plugin
  useLayoutEffect(() => {
    gsap.registerPlugin(Draggable);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Cleanup previous draggables
    draggablesRef.current.forEach((draggable) => draggable.kill());
    draggablesRef.current = [];

    if (!containerRef.current) return;

    const leafCategories = categories.filter(
      (category) =>
        category.children.length === 0 && !isChildCategory(category._id)
    );

    leafCategories.forEach((category) => {
      const el = categoryRefs.current[category._id];
      if (el) {
        const draggable = Draggable.create(el, {
          type: "x,y",
          bounds: containerRef.current,
          edgeResistance: 0.65,
          inertia: true,
          onDragStart: function () {
            gsap.to(this.target, { scale: 1.05, duration: 0.1 });
          },
          onDrag: function () {
            // Highlight potential drop zones during drag
            document.querySelectorAll(".drop-zone").forEach((zone: any) => {
              if (this.hitTest(zone, "30%")) {
                zone.classList.add("drag-over");
              } else {
                zone.classList.remove("drag-over");
              }
            });
          },
          onDragEnd: function () {
            document.querySelectorAll(".drop-zone").forEach((zone: any) => {
              zone.classList.remove("drag-over");
            });
            gsap.to(this.target, { scale: 1, duration: 0.1 });

            // Check hit on any drop zone
            const dropZones = document.querySelectorAll(".drop-zone");
            let dropped = false;
            dropZones.forEach((zone: any) => {
              if (this.hitTest(zone, "50%")) {
                const parentId = zone.dataset.parentId;
                if (
                  parentId &&
                  !categories
                    .find((cat) => cat._id === parentId)
                    ?.children.includes(category._id)
                ) {
                  addToParent(parentId, category._id);
                  dropped = true;
                  // Animate success
                  gsap.to(this.target, {
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                  });
                }
              }
            });

            if (!dropped) {
              gsap.to(this.target, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
              });
            }
          },
        })[0];
        draggablesRef.current.push(draggable);
      }
    });

    return () => {
      draggablesRef.current.forEach((draggable) => draggable.kill());
      draggablesRef.current = [];
    };
  }, [categories]);

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

    // if (categoryToDelete && categoryToDelete.children.length > 0) {
    //   toast.error(
    //     "نمی‌توانید دسته‌ای را که دارای زیر دسته است حذف کنید. ابتدا زیر دسته‌ها را حذف کنید."
    //   );
    //   return;
    // }

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
        style={{ marginRight: level * 16 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: level * 0.1 }}
      >
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 mb-4 overflow-hidden animate-slide-up">
          {/* Category Header */}
          <div
            className={`p-4 border-b border-slate-100 ${
              level === 0
                ? "bg-gradient-to-r from-slate-50 to-blue-50"
                : "bg-gradient-to-r from-green-50 to-emerald-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-start sm:items-center gap-3 flex-1">
                {/* Expand/Collapse Button - Only for parent categories */}
                {hasChildren && level === 0 && (
                  <motion.button
                    onClick={() => toggleExpand(category._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    level === 0
                      ? "bg-gradient-to-br from-slate-900 to-blue-900"
                      : "bg-gradient-to-br from-green-500 to-emerald-600"
                  }`}
                >
                  <span className="text-white font-bold text-sm">
                    {category.name.charAt(0)}
                  </span>
                </div>

                {/* Category Name or Edit Input */}
                {editingCategory?._id === category._id ? (
                  <div className="flex flex-col items-start gap-2 flex-1">
                    <motion.input
                      initial={{ width: 200 }}
                      animate={{ width: "100%" }}
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="w-8 h-8 bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white rounded-lg flex items-center justify-center transition-all duration-300"
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
                        className="w-8 h-8 bg-slate-500 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center transition-all duration-300"
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
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-base sm:text-lg truncate">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            level === 0
                              ? hasChildren
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {level === 0
                            ? hasChildren
                              ? `دسته اصلی (${category.children.length} زیر دسته)`
                              : "دسته اصلی"
                            : `زیر دسته از ${parentCategory?.name}`}
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:block">
                          سطح {level + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editingCategory?._id !== category._id && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(category)}
                    className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-all duration-300"
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
                    className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all duration-300"
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

          {/* Drop Zone for Adding Children - Only for parent categories (level 0) */}
          {level === 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="space-y-3">
                <label className="  text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  افزودن زیر دسته (کشیدن و رها کردن)
                </label>
                <div
                  data-parent-id={category._id}
                  className="drop-zone min-h-[80px] text-center"
                >
                  <svg
                    className="mx-auto h-6 w-6 text-slate-400 mb-2"
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
                  <p className="text-sm text-slate-500">
                    دسته‌های اصلی را از لیست بکشید و اینجا رها کنید
                  </p>
                  {hasChildren && (
                    <p className="text-xs text-slate-400 mt-1">
                      فعلی: {category.children.length} زیر دسته
                    </p>
                  )}
                </div>
                {hasChildren && (
                  <div className="flex flex-wrap gap-1">
                    {childCategories.map((child) => (
                      <div
                        key={child._id}
                        className="chip bg-red-100 text-red-700"
                      >
                        <span className="text-xs">{child.name}</span>
                        <button
                          onClick={() => removeFromParent(child._id)}
                          className="ml-1 text-red-500 hover:text-red-700"
                          title="حذف زیر دسته"
                        >
                          <svg
                            className="w-3 h-3"
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remove from parent section - Only for child categories */}
          {level > 0 && (
            <div className="p-4 bg-green-50 border-t border-green-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                      زیر مجموعه <strong>{parentCategory?.name}</strong>
                    </p>
                    <p className="text-xs text-green-600">
                      برای تبدیل به دسته اصلی، جدا کنید
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromParent(category._id)}
                  className="w-full sm:w-auto bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium text-sm shadow-md"
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
              style={{ marginRight: 32 }}
            >
              {/* Connection Line */}
              <div className="absolute right-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 to-transparent"></div>

              {childCategories.map((child, index) => (
                <div key={child._id} className="relative">
                  {/* Horizontal Line */}
                  <div className="absolute right-4 top-6 w-4 h-px bg-blue-300"></div>
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

  const leafCategories = categories.filter(
    (category) =>
      category.children.length === 0 && !isChildCategory(category._id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-3 sm:p-4 py-4 sm:py-6 bg-slate-50"
      dir="rtl"
    >
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6 animate-slide-down">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent flex items-center gap-2">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-slate-900"
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
              <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2">
                دسته‌بندی‌های خود را در 2 سطح (اصلی و فرعی) سازماندهی کنید
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 sm:gap-4">
              <div className="bg-blue-100 rounded-lg py-2 px-3 text-center min-w-[60px]">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {getParentCategories().length}
                </div>
                <div className="text-xs text-blue-600">دسته اصلی</div>
              </div>
              <div className="bg-green-100 rounded-lg py-2 px-3 text-center min-w-[60px]">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {getChildCategoriesCount()}
                </div>
                <div className="text-xs text-green-600">زیر دسته</div>
              </div>
              <div className="bg-purple-100 rounded-lg py-2 px-3 text-center min-w-[60px]">
                <div className="text-lg sm:text-xl font-bold text-purple-600">
                  {categories.length}
                </div>
                <div className="text-xs text-purple-600">کل دسته‌ها</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white mb-4 sm:mb-6 animate-slide-up">
          <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
            <svg
              className="h-5 w-5"
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
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">📁 دسته‌های اصلی</h4>
              <p className="text-blue-100">
                دسته‌های اصلی می‌توانند زیر دسته داشته باشند اما خودشان زیر دسته
                نیستند
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">📄 زیر دسته‌ها</h4>
              <p className="text-blue-100">
                زیر دسته‌ها نمی‌توانند خودشان زیر دسته داشته باشند (حداکثر 2
                سطح)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">🔄 کشیدن و رها کردن</h4>
              <p className="text-blue-100">
                دسته‌های قابل انتقال را بکشید و در ناحیه والد رها کنید
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Categories Tree */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-4 sm:p-5 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    ساختار دسته‌بندی‌ها (2 سطحه)
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const parentIds = getParentCategories().map(
                        (cat) => cat._id
                      );
                      setExpandedCategories(new Set(parentIds));
                    }}
                    className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs transition-colors hover:bg-white/30"
                  >
                    باز کردن همه
                  </button>
                  <button
                    onClick={() => setExpandedCategories(new Set())}
                    className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs transition-colors hover:bg-white/30"
                  >
                    بستن همه
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {categories.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getParentCategories().map((category) =>
                    renderCategory(category)
                  )}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12">
                  <svg
                    className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mb-3 sm:mb-4"
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
                  <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
                    هیچ دسته‌بندی موجود نیست
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    ابتدا دسته‌بندی‌های خود را ایجاد کنید
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Available Draggable Categories */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-4 sm:p-5 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    دسته‌های قابل انتقال
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                    {leafCategories.length} دسته بدون والد
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {leafCategories.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leafCategories.map((category, index) => (
                    <div
                      key={category._id}
                      ref={(el) => { categoryRefs.current[category._id] = el; }}
                      className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-all duration-200 animate-slide-down draggable-item flex-shrink-0"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <svg
                          className="h-4 w-4 text-slate-400 cursor-grab flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-slate-900 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs sm:text-sm">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-xs sm:text-sm truncate">
                            {category.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            آماده برای انتقال
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        قابل انتقال
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12">
                  <svg
                    className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mb-3 sm:mb-4"
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
                  <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
                    هیچ دسته قابل انتقال موجود نیست
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    همه دسته‌ها در ساختار قرار دارند
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Hierarchy Visualization */}
        {categories.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 animate-slide-up">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
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
            <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
              <div className="text-sm text-slate-600 space-y-3">
                {getParentCategories().length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    هیچ دسته اصلی موجود نیست
                  </p>
                ) : (
                  getParentCategories().map((rootCategory, index) => (
                    <div
                      key={index}
                      className="border-r-2 border-slate-200 pr-4"
                      style={{ paddingRight: "1rem" }}
                    >
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        📁 {rootCategory.name}
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          دسته اصلی
                        </span>
                      </div>
                      {rootCategory.children.length > 0 ? (
                        <div
                          className="pl-6 mt-2 space-y-1 border-r-2 border-green-200 pr-4"
                          style={{ paddingRight: "1rem" }}
                        >
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
                        <div className="pl-6 mt-1 text-xs text-slate-400 italic">
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
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-amber-200 animate-slide-up">
          <h3 className="text-base sm:text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
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
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-slide-up">
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 border-r-4 border-blue-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-center sm:text-right w-full">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    دسته‌های اصلی
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {getParentCategories().length}
                  </p>
                </div>
                <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg items-center justify-center flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
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

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 border-r-4 border-green-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-center sm:text-right w-full">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    زیر دسته‌ها
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {getChildCategoriesCount()}
                  </p>
                </div>
                <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg items-center justify-center flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"
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

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-5 border-r-4 border-purple-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-center sm:text-right w-full">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    میانگین زیر دسته
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {getParentCategories().length > 0
                      ? (
                          getChildCategoriesCount() /
                          getParentCategories().length
                        ).toFixed(1)
                      : "0"}
                  </p>
                </div>
                <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg items-center justify-center flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600"
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

        <style>{`
          .drop-zone {
            min-height: 80px;
            border: 2px dashed #d1d5db;
            border-radius: 0.5rem;
            background-color: #f9fafb;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
          }
          .drop-zone.drag-over {
            border-color: #3b82f6;
            background-color: #eff6ff;
            transform: scale(1.02);
          }
          .chip {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            margin: 0.25rem;
            transition: all 0.2s ease;
          }
          .chip button {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0;
            width: 1rem;
            height: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
          }
          .chip button:hover {
            background-color: rgba(239, 68, 68, 0.2);
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up { animation: slideUp 0.3s ease-out; }
          .animate-slide-down { animation: slideDown 0.2s ease-out; }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </motion.div>
  );
};

export default EditCategory;
