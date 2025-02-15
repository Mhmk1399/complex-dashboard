import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ImageSelectorModal from "./ImageSelectorModal"; // Import the ImageSelectorModal
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa"; // Add some icons for better UX

interface Story {
  _id: string;
  title: string;
  image: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}


interface EditStoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditStory: React.FC<EditStoryProps> = ({
  isOpen,
  onClose,
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllStories();
    }
  }, [isOpen]);

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
    // Update the settings state if needed
    setIsImageSelectorOpen(false);
  };

  return (
    <AnimatePresence>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-10 overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          className="flex items-center justify-center min-h-screen p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="fixed inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70 opacity-90"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/30 max-w-4xl w-full mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-white text-center flex items-center justify-center gap-4">
              <FaPlus className="text-blue-300" />
              مدیریت استوری‌ها
            </h2>

            {selectedStory ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-semibold">عنوان</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/30 focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="عنوان استوری را وارد کنید"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">تصویر</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={image}
                        readOnly
                        className="flex-grow p-3 rounded-xl bg-white/10 text-white border border-white/30"
                        placeholder="تصویر انتخاب شده"
                      />
                      <button
                        type="button"
                        onClick={() => setIsImageSelectorOpen(true)}
                        className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <FaEdit /> انتخاب تصویر
                      </button>
                    </div>
                    {image && (
                      <div className="mt-4">
                        <Image 
                          src={image} 
                          alt="Selected Story Image" 
                          width={200} 
                          height={200} 
                          className="rounded-xl object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <FaEdit /> بروزرسانی
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStory(null)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    لغو
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {stories.length === 0 ? (
                  <div className="text-center py-12 bg-white/10 rounded-xl">
                    <p className="text-gray-300 text-xl">
                      هیچ استوری اضافه نشده است
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {stories.map((story,idx) => (
                      <div 
                        key={story._id+idx} 
                        className="bg-white/10 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform"
                      >
                        <Image
                          src={story.image}
                          alt={story.title}
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2">{story.title}</h3>
                          <div className="flex justify-between" >
                            <button
                              onClick={() => handleEdit(story)}
                              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                              <FaEdit /> ویرایش
                            </button>
                            <button
                              onClick={() => handleDelete(story._id)}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                              <FaTrash /> حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </Dialog>

      {/* Image Selector Modal */}
      <ImageSelectorModal
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelectImage={handleImageSelect}
      />
    </AnimatePresence>
  );
};
