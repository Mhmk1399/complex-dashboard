import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import EditCategory from "./editCategory";
import {
  HiOutlineFolderAdd,
  HiOutlineTag,
  HiOutlineFolderOpen,
  HiOutlineSave,
  HiOutlineViewGrid,
  HiOutlineArrowDown,
} from "react-icons/hi";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Category } from "@/types/type";
import toast from "react-hot-toast";

// CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-slide-down { animation: slideDown 0.2s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .draggable-item {
    cursor: grab;
    user-select: none;
    -webkit-user-drag: element;
    transition: all 0.2s ease;
    position: relative;
  }
  .draggable-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .draggable-item:active {
    cursor: grabbing;
  }
  .drop-zone {
    min-height: 120px;
    border: 3px dashed #d1d5db;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #f9fafb 0%, #f1f5f9 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  }
  .drop-zone.drag-over {
    border-color: #3b82f6;
    border-width: 3px;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    transform: scale(1.03);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), inset 0 2px 8px rgba(59, 130, 246, 0.1);
  }
  .drop-zone.drag-over::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.75rem;
    background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    margin: 0.25rem;
    transition: all 0.2s ease;
    animation: scaleIn 0.2s ease-out;
  }
  .chip:hover {
    background-color: #bfdbfe;
  }
  .chip button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }
  .chip button:hover {
    background-color: rgba(30, 64, 175, 0.2);
  }
  @media (max-width: 640px) {
    .drop-zone {
      min-height: 100px;
    }
    .chip {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
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
      setExistingCategories(data);
    } catch (error) {
      toast.error("خطا در دریافت دسته‌بندی‌ها");
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    draggablesRef.current.forEach((draggable) => draggable.kill());
    draggablesRef.current = [];

    if (!containerRef.current || !dropZoneRef.current) return;

    // Only categories WITHOUT children can be dragged (2-level system)
    const leafCategories = existingCategories.filter(
      (category) => category.children.length === 0
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
            gsap.to(this.target, { 
              scale: 1.1, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              duration: 0.2,
              zIndex: 30
            });
            this.target.style.cursor = "grabbing";
          },
          onDrag: function () {
            const dropEl = dropZoneRef.current;
            if (dropEl && this.hitTest(dropEl, "20%")) {
              dropEl.classList.add("drag-over");
            } else {
              dropEl?.classList.remove("drag-over");
            }
          },
          onDragEnd: function () {
            const dropEl = dropZoneRef.current;
            const isOverDropZone = dropEl && this.hitTest(dropEl, "30%");
            
            dropEl?.classList.remove("drag-over");
            this.target.style.cursor = "grab";

            if (isOverDropZone && !selectedChildren.includes(category._id)) {
              setSelectedChildren((prev) => [...prev, category._id]);
              gsap.to(this.target, {
                x: 0,
                y: 0,
                scale: 1,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                duration: 0.4,
                ease: "back.out(1.7)",
              });
              toast.success(`${category.name} اضافه شد`);
            } else {
              gsap.to(this.target, {
                x: 0,
                y: 0,
                scale: 1,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
              });
              if (isOverDropZone) {
                toast.error("این دسته قبلاً اضافه شده");
              }
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
  }, [existingCategories, selectedChildren]);

  const handleRemoveChild = (id: string) => {
    setSelectedChildren((prev) => prev.filter((childId) => childId !== id));
    toast.success("زیر دسته حذف شد");
  };

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
          children: selectedChildren,
        }),
      });

      if (response.ok) {
        toast.success("دسته‌بندی با موفقیت ایجاد شد");
        setCategoryName("");
        setSelectedChildren([]);
        fetchCategories();
      } else {
        toast.error("خطا در ایجاد دسته‌بندی");
      }
    } catch (error) {
      toast.error("خطا در ایجاد دسته‌بندی");
      console.log(error);
    }
  };

  // Only categories WITHOUT children can be used as children (2-level system)
  const leafCategories = existingCategories.filter(
    (category) => category.children.length === 0
  );

  const getCategoryById = (id: string) => {
    return existingCategories.find((cat) => cat._id === id);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 py-4 sm:py-6 mt-10" dir="rtl">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6 animate-slide-down">
          <div className="flex flex-row justify-between items-center sm:items-center gap-3">
            <div>
              <h2 className="text-xs text-nowrap sm:text-2xl  font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent flex items-center gap-2">
                <HiOutlineFolderAdd className="text-xl   md:text-3xl text-slate-900" />
                مدیریت دسته‌بندی‌ها
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 hidden md:block sm:mt-2">
                دسته‌بندی‌های محصولات خود را ایجاد و مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white font-medium text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              ویرایش دسته‌بندی‌ها
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Category Form */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 animate-slide-up">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
              <PlusIcon className="h-5 w-5 text-blue-600" />
              افزودن دسته‌بندی جدید
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                  <HiOutlineTag className="text-base sm:text-lg text-blue-600" />
                  نام دسته‌بندی
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="نام دسته‌بندی را وارد کنید..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                  <HiOutlineFolderOpen className="text-base sm:text-lg text-blue-600" />
                  انتقال زیر دسته‌ها
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  دسته‌بندی‌های بدون زیر دسته را از لیست سمت چپ بکشید و اینجا
                  رها کنید
                </p>
                <div ref={dropZoneRef} className="drop-zone mb-3">
                  <HiOutlineArrowDown className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">منطقه رها کردن</p>
                  {selectedChildren.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      هیچ زیر دسته‌ای انتخاب نشده
                    </p>
                  )}
                </div>
                {selectedChildren.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {selectedChildren.map((id) => {
                      const cat = getCategoryById(id);
                      if (!cat) return null;
                      return (
                        <div key={id} className="chip">
                          <span>{cat.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(id)}
                            aria-label="حذف"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  // disabled={selectedChildren.length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <HiOutlineSave className="text-base sm:text-lg" />
                  ذخیره دسته‌بندی
                </button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-slate-900 to-slate-900 p-4 sm:p-5">
              <div className="flex  flex-row justify-between items-start sm:items-center gap-2 text-white">
                <div>
                  <h3 className="text-sm sm:text-lg font-bold">
                    دسته‌بندی‌های موجود
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    مجموع {existingCategories.length} دسته‌بندی
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                  <span>دسته‌های فرعی: </span>
                  <span className="font-bold">{leafCategories.length}</span>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {existingCategories.length > 0 ? (
                <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto mt-5">
                  {existingCategories.map((category, index) => (
                    <div
                      key={category._id}
                      ref={(el) => {
                        if (category.children.length === 0) {
                          categoryRefs.current[category._id] = el;
                        } else {
                          categoryRefs.current[category._id] = null;
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-all duration-200 animate-slide-down flex-shrink-0 ${
                        category.children.length === 0 ? "draggable-item" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {category.children.length === 0 && (
                          <HiOutlineArrowDown className="h-4 w-4 text-slate-400 flex-shrink-0 cursor-grab" />
                        )}
                      
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-slate-900 text-xs sm:text-sm truncate ${
                              selectedChildren.includes(category._id)
                                ? "text-green-600"
                                : ""
                            }`}
                          >
                            {category.name}
                            {selectedChildren.includes(category._id) && (
                              <span className="ml-1 text-xs text-green-500">
                                (انتخاب شده)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {category.children.length} زیر دسته
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${
                            category.children.length === 0
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {category.children.length === 0
                            ? "قابل انتقال"
                            : "اصلی"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12">
                  <HiOutlineFolderOpen className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
                    هیچ دسته‌بندی موجود نیست
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    اولین دسته‌بندی خود را ایجاد کنید
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4 animate-slide-up">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-center sm:text-right w-full">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  کل دسته‌بندی‌ها
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {existingCategories.length}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg items-center justify-center flex-shrink-0">
                <HiOutlineFolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-center sm:text-right w-full">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  دسته‌های فرعی
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {leafCategories.length}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg items-center justify-center flex-shrink-0">
                <HiOutlineTag className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-center sm:text-right w-full">
                <p className="text-xs font-medium text-slate-600 mb-1">
                 اصلی
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {
                    existingCategories.filter((cat) => cat.children.length > 0)
                      .length
                  }
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg items-center justify-center flex-shrink-0">
                <HiOutlineViewGrid className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white animate-slide-up">
          <h3 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
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
            نکات مهم
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">کشیدن و رها کردن</h4>
              <p className="text-blue-100">
                دسته‌ها   (قابل انتقال) را بکشید و در ناحیه مشخص شده رها
                کنید تا به عنوان زیر دسته اضافه شوند.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">پشتیبانی موبایل</h4>
              <p className="text-blue-100">
                روی موبایل، لمس طولانی کنید و بکشید تا انتقال انجام شود.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-0 z-[110] overflow-auto p-2 sm:p-4 animate-scale-in">
            <div className="min-h-full flex items-center justify-center">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex justify-between items-center z-10">
                  <h3 className="text-base sm:text-xl font-bold text-slate-900">
                    ویرایش دسته‌بندی‌ها
                  </h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      fetchCategories();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500"
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
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                  <EditCategory />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddCategory;
