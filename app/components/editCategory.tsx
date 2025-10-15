import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Category } from "@/types/type";
import toast from "react-hot-toast";

const EditCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const draggablesRef = useRef<Draggable[]>([]);

  useLayoutEffect(() => {
    gsap.registerPlugin(Draggable);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(await response.json());
    } catch {
      toast.error("خطا در دریافت دسته بندی ها");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    draggablesRef.current.forEach((d) => d.kill());
    draggablesRef.current = [];

    if (!containerRef.current) return;

    // Only categories without children AND not already a child can be dragged
    const draggableCategories = categories.filter(
      (cat) => cat.children.length === 0 && !isChild(cat._id)
    );

    draggableCategories.forEach((category) => {
      const el = categoryRefs.current[category._id];
      if (el) {
        const draggable = Draggable.create(el, {
          type: "x,y",
          bounds: containerRef.current,
          onDragStart: function () {
            gsap.to(this.target, {
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              duration: 0.2,
            });
          },
          onDrag: function () {
            document.querySelectorAll(".drop-zone").forEach((zone: any) => {
              zone.classList.toggle("drag-over", this.hitTest(zone, "25%"));
            });
          },
          onDragEnd: function () {
            document.querySelectorAll(".drop-zone").forEach((zone: any) => {
              zone.classList.remove("drag-over");
            });

            let dropped = false;
            document.querySelectorAll(".drop-zone").forEach((zone: any) => {
              if (this.hitTest(zone, "40%")) {
                const parentId = zone.dataset.parentId;
                if (parentId) {
                  addToParent(parentId, category._id);
                  dropped = true;
                }
              }
            });

            gsap.to(this.target, {
              x: 0,
              y: 0,
              scale: 1,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              duration: dropped ? 0.3 : 0.5,
              ease: dropped ? "back.out(1.7)" : "elastic.out(1, 0.3)",
            });
          },
        })[0];
        draggablesRef.current.push(draggable);
      }
    });

    return () => {
      draggablesRef.current.forEach((d) => d.kill());
      draggablesRef.current = [];
    };
  }, [categories]);

  const isChild = (id: string) =>
    categories.some((cat) => cat.children.includes(id));

  const addToParent = async (parentId: string, childId: string) => {
    const parent = categories.find((c) => c._id === parentId);
    const child = categories.find((c) => c._id === childId);

    if (child?.children && child.children.length > 0) {
      toast.error("این دسته دارای زیر دسته است");
      return;
    }

    try {
      const response = await fetch("/api/category", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: parentId,
          children: [...(parent?.children || []), childId],
        }),
      });

      if (response.ok) {
        toast.success("زیر دسته اضافه شد");
        fetchCategories();
      }
    } catch {
      toast.error("خطا در افزودن زیر دسته");
    }
  };

  const removeFromParent = async (childId: string) => {
    const parent = categories.find((cat) => cat.children.includes(childId));
    if (!parent) return;

    try {
      const response = await fetch("/api/category", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: parent._id,
          children: parent.children.filter((id) => id !== childId),
        }),
      });

      if (response.ok) {
        toast.success("زیر دسته حذف شد");
        fetchCategories();
      }
    } catch {
      toast.error("خطا در حذف زیر دسته");
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      const category = categories.find((c) => c._id === editingId);
      const response = await fetch("/api/category", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: editingId,
          name: editName,
          children: category?.children || [],
        }),
      });

      if (response.ok) {
        toast.success("دستهبندی ویرایش شد");
        setEditingId(null);
        fetchCategories();
      }
    } catch {
      toast.error("خطا در ویرایش");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/category", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success("دستهبندی حذف شد");
        fetchCategories();
      }
    } catch {
      toast.error("خطا در حذف");
    }
  };

  // Parents: categories that have children (actual parents only)
  const parents = categories.filter((cat) => cat.children.length > 0);

  // Draggables: only categories with NO children and NOT already a child
  const draggables = categories.filter(
    (cat) => cat.children.length === 0 && !isChild(cat._id)
  );

  return (
    <div ref={containerRef} className="p-4 space-y-4" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          ویرایش دسته بندی ها
        </h2>
        <p className="text-sm text-slate-600">مدیریت دسته بندی ها در 2 سطح</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Parent Categories */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-slate-900 text-white p-4">
            <h3 className="font-bold">دسته های اصلی ({parents.length})</h3>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {parents.map((cat) => (
              <div
                key={cat._id}
                className="border border-slate-200 rounded-lg p-3"
              >
                {editingId === cat._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm"
                      >
                        ذخیره
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-slate-200 px-3 py-1.5 rounded-lg text-sm"
                      >
                        لغو
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">
                        {cat.name}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingId(cat._id);
                            setEditName(cat.name);
                          }}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"
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
                          onClick={() => handleDelete(cat._id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg"
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
                    </div>

                    {/* Drop Zone */}
                    <div
                      data-parent-id={cat._id}
                      className="drop-zone min-h-[60px] border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-500 bg-slate-50"
                    >
                      {cat.children.length > 0 ? (
                        <div className="flex flex-wrap gap-1 p-2">
                          {cat.children.map((childId) => {
                            const child = categories.find(
                              (c) => c._id === childId
                            );
                            return child ? (
                              <span
                                key={childId}
                                className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                              >
                                {child.name}
                                <button
                                  onClick={() => removeFromParent(childId)}
                                  className="hover:bg-green-200 rounded-full p-0.5"
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
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        "بکشید و اینجا رها کنید"
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Draggable Categories */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-slate-900 text-white p-4">
            <h3 className="font-bold">
              دسته های قابل انتقال ({draggables.length})
            </h3>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
            {draggables.map((cat) => (
              <div
                key={cat._id}
                ref={(el) => {
                  categoryRefs.current[cat._id] = el;
                }}
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-blue-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
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
                <span className="font-medium text-slate-900 text-sm">
                  {cat.name}
                </span>
              </div>
            ))}
            {draggables.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                همه دسته ها در ساختار قرار دارند
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .drop-zone {
          transition: all 0.3s ease;
        }
        .drop-zone.drag-over {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default EditCategory;
