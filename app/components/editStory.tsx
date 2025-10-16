import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import ImageSelectorModal from "./ImageSelectorModal";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { EditStoryProps, Story } from "@/types/type";
import toast from "react-hot-toast";

export const EditStory: React.FC<EditStoryProps> = ({ isOpen, onClose }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  const fetchAllStories = async () => {
    try {
      const response = await fetch("/api/story", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.log(error);
      toast.error("خطا در دریافت استوری‌ها");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllStories();
    }
  }, [isOpen]);

  const handleDelete = async (storyId: string) => {
    try {
      const response = await fetch("/api/story", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ _id: storyId }),
      });

      if (response.ok) {
        toast.success("استوری با موفقیت حذف شد");
        fetchAllStories();
      } else {
        toast.error("خطا در حذف استوری");
      }
    } catch (error) {
      console.log(error);
      toast.error("خطا در حذف استوری");
    }
  };

  const handleEdit = (story: Story) => {
    setSelectedStory(story);
    setTitle(story.title);
    setImage(story.image);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;

    try {
      const response = await fetch("/api/story", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          _id: selectedStory._id,
          title,
          image,
        }),
      });

      if (response.ok) {
        toast.success("استوری با موفقیت بروزرسانی شد");
        setSelectedStory(null);
        setTitle("");
        setImage("");
        fetchAllStories();
      } else {
        toast.error("خطا در بروزرسانی استوری");
      }
    } catch (error) {
      console.log(error);
      toast.error("خطا در بروزرسانی استوری");
    }
  };

  const handleImageSelect = (selectedImage: { fileUrl: string }) => {
    setImage(selectedImage.fileUrl);
    setIsImageSelectorOpen(false);
  };

  const handleCloseImageSelector = () => {
    setIsImageSelectorOpen(false);
  };

  const handleCancelEdit = () => {
    setSelectedStory(null);
    setTitle("");
    setImage("");
  };

  return (
    <>
      <style jsx>{`
        .modal-backdrop {
          animation: fadeIn 0.2s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.3s ease-out backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .story-card {
          animation: fadeInUp 0.4s ease-out backwards;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
        }

        .hover-scale:hover {
          transform: scale(1.02);
        }

        .image-zoom:hover img {
          transform: scale(1.1);
        }
      `}</style>

      <Dialog
        open={isOpen && !isImageSelectorOpen}
        onClose={onClose}
        className="fixed inset-0 z-40 overflow-y-auto"
        dir="rtl"
      >
        <div className="flex items-center justify-center min-h-screen p-3 sm:p-4">
          {/* Backdrop */}
          <div className="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div className="modal-content relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-200 max-w-6xl w-full mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-slate-200">
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors order-1"
              >
                <FaTimes className="text-slate-500 text-lg sm:text-xl" />
              </button>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3 order-2">
                مدیریت استوری‌ها
              </h2>
              <div className="w-8 sm:w-10 order-3" />
            </div>

            {selectedStory ? (
              /* Edit Form */
              <form
                onSubmit={handleUpdate}
                className="space-y-6 sm:space-y-8 slide-in-right"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 text-sm sm:text-base md:text-lg font-semibold">
                      عنوان استوری
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl bg-slate-50 text-slate-800 border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base outline-none"
                      placeholder="عنوان استوری را وارد کنید"
                      required
                    />
                  </div>

                  {/* Image Selection */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 text-sm sm:text-base md:text-lg font-semibold">
                      تصویر استوری
                    </label>
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={image}
                          readOnly
                          className="flex-grow px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed text-xs sm:text-sm"
                          placeholder="تصویر انتخاب شده نمایش داده می‌شود"
                        />
                        <button
                          type="button"
                          onClick={() => setIsImageSelectorOpen(true)}
                          className="bg-slate-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl hover:bg-slate-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
                        >
                          <FaEdit className="text-xs sm:text-sm" />
                          انتخاب تصویر
                        </button>
                      </div>

                      {/* Image Preview */}
                      {image && (
                        <div className="fade-in-up p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                          <p className="text-xs sm:text-sm text-slate-600 mb-2">
                            پیش‌نمایش تصویر:
                          </p>
                          <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden shadow-md">
                            <Image
                              src={image}
                              alt="Selected Story Image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
                  <button
                    type="submit"
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg sm:rounded-xl hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base order-2 sm:order-1"
                  >
                    <FaEdit className="text-xs sm:text-sm" />
                    بروزرسانی استوری
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-slate-500 text-white rounded-lg sm:rounded-xl hover:bg-slate-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base order-1 sm:order-2"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            ) : (
              /* Stories Grid */
              <div className="space-y-4 sm:space-y-6">
                {stories.length === 0 ? (
                  <div className="fade-in-up text-center py-12 sm:py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl border-2 border-dashed border-slate-300">
                    <FaPlus className="mx-auto text-4xl sm:text-5xl md:text-6xl text-slate-400 mb-3 sm:mb-4" />
                    <p className="text-slate-600 text-base sm:text-lg md:text-xl font-medium">
                      هیچ استوری اضافه نشده است
                    </p>
                    <p className="text-slate-500 text-xs sm:text-sm mt-2">
                      برای شروع، اولین استوری خود را اضافه کنید
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {stories.map((story, idx) => (
                      <div
                        key={story._id}
                        className="story-card bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover-lift"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {/* Image */}
                        <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden image-zoom">
                          <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            className="object-cover transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <h3 className="text-slate-800 font-bold text-sm sm:text-base md:text-lg line-clamp-2">
                            {story.title}
                          </h3>

                          <div className="text-xs text-slate-500 space-y-1">
                            <p>
                              تاریخ ایجاد:{" "}
                              {new Date(story.createdAt).toLocaleDateString(
                                "fa-IR"
                              )}
                            </p>
                            <p>
                              آخرین بروزرسانی:{" "}
                              {new Date(story.updatedAt).toLocaleDateString(
                                "fa-IR"
                              )}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleEdit(story)}
                              className="flex-1 bg-slate-500 text-white text-xs sm:text-sm py-2 px-2 sm:px-3 rounded-lg hover:bg-slate-600 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md"
                            >
                              <FaEdit className="text-xs" />
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDelete(story._id)}
                              className="flex-1 bg-red-500 text-white text-xs sm:text-sm py-2 px-2 sm:px-3 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md"
                            >
                              <FaTrash className="text-xs" />
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Image Selector Modal */}
      <ImageSelectorModal
        isOpen={isImageSelectorOpen}
        onClose={handleCloseImageSelector}
        onSelectImage={handleImageSelect}
      />
    </>
  );
};
