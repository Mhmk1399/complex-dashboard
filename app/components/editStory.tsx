import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import Image from "next/image";
import ImageSelectorModal from "./ImageSelectorModal"; // Import the ImageSelectorModal
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa"; // Add FaTimes for close button
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

  // Handle image selection from ImageSelectorModal
  const handleImageSelect = (selectedImage: { fileUrl: string }) => {
    setImage(selectedImage.fileUrl);
    setIsImageSelectorOpen(false);
  };

  // Handle closing image selector
  const handleCloseImageSelector = () => {
    setIsImageSelectorOpen(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setSelectedStory(null);
    setTitle("");
    setImage("");
  };

  return (
    <>
      <Dialog
        open={isOpen && !isImageSelectorOpen}
        onClose={onClose}
        className="fixed inset-0 z-40 overflow-y-auto"
        dir="rtl"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

          {/* Modal Content */}
          <motion.div
            className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/30 max-w-6xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500 text-xl" />
              </button>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaPlus className="text-blue-500" />
                مدیریت استوری‌ها
              </h2>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {selectedStory ? (
              /* Edit Form */
              <motion.form
                onSubmit={handleUpdate}
                className="space-y-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-lg font-semibold">
                      عنوان استوری
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="عنوان استوری را وارد کنید"
                      required
                    />
                  </div>

                  {/* Image Selection */}
                  <div className="space-y-2">
                    <label className="block text-gray-700 text-lg font-semibold">
                      تصویر استوری
                    </label>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="text"
                          value={image}
                          readOnly
                          className="flex-grow p-4 rounded-xl bg-gray-100 text-gray-600 border border-gray-200 cursor-not-allowed"
                          placeholder="تصویر انتخاب شده نمایش داده می‌شود"
                        />
                        <button
                          type="button"
                          onClick={() => setIsImageSelectorOpen(true)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <FaEdit className="text-sm" />
                          انتخاب تصویر
                        </button>
                      </div>

                      {/* Image Preview */}
                      {image && (
                        <motion.div
                          className="mt-4 p-4 bg-gray-50 rounded-xl"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-sm text-gray-600 mb-2">
                            پیش‌نمایش تصویر:
                          </p>
                          <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-md">
                            <Image
                              src={image}
                              alt="Selected Story Image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaEdit className="text-sm" />
                    بروزرسانی استوری
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    انصراف
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Stories Grid */
              <div className="space-y-6">
                {stories.length === 0 ? (
                  <motion.div
                    className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FaPlus className="mx-auto text-6xl text-gray-400 mb-4" />
                    <p className="text-gray-600 text-xl font-medium">
                      هیچ استوری اضافه نشده است
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      برای شروع، اولین استوری خود را اضافه کنید
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {stories.map((story, idx) => (
                      <motion.div
                        key={story._id}
                        className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                          <h3 className="text-gray-800 font-bold text-lg line-clamp-2">
                            {story.title}
                          </h3>

                          <div className="text-xs text-gray-500 space-y-1">
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
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <FaEdit className="text-xs" />
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDelete(story._id)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm py-2 px-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <FaTrash className="text-xs" />
                              حذف
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </Dialog>

      {/* Image Selector Modal - Higher z-index */}
      <ImageSelectorModal
        isOpen={isImageSelectorOpen}
        onClose={handleCloseImageSelector}
        onSelectImage={handleImageSelect}
      />
    </>
  );
};
