"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiUploadCloud, FiEdit, FiSave } from "react-icons/fi";
import { EditStory } from "./editStory";
import ImageSelectorModal from "./ImageSelectorModal";

interface StorySettings {
  title: string;
  image: string;
}

export const AddStory = () => {
  const [settings, setSettings] = useState<StorySettings>({
    title: "",
    image: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Validate inputs
    if (!settings.title.trim()) {
      toast.error("لطفا عنوان استوری را وارد کنید");
      return;
    }

    if (!settings.image) {
      toast.error("لطفا تصویر استوری را انتخاب کنید");
      return;
    }

    setSaveStatus("saving");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus("success");
        toast.success("استوری با موفقیت ایجاد شد");
        setSettings({
          title: "",
          image: "",
        });
      } else {
        setSaveStatus("error");
        toast.error("خطا در ایجاد استوری");
      }
    } catch (error) {
      setSaveStatus("error");
      toast.error("خطای غیرمنتظره در ایجاد استوری");
      console.error(error);
    } finally {
      // Reset save status after a short delay
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleImageSelect = (image: { fileUrl: string }) => {
    setSettings((prev) => ({
      ...prev,
      image: image.fileUrl,
    }));
    setIsImageSelectorOpen(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border-2 border-[#0077b6]"
        >
          <div className="text-center mb-6">
            <FiEdit className="mx-auto text-5xl text-[#0077b6] mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">
              افزودن استوری جدید
            </h2>
            <p className="text-gray-500 mt-2">استوری جدید خود را ایجاد کنید</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-[#0077b6] mb-2">
                تصویر استوری
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={settings.image}
                  readOnly
                  className="flex-grow p-3 border-2 border-[#0077b6]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]/50"
                  placeholder="انتخاب تصویر"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsImageSelectorOpen(true)}
                  className="bg-[#0077b6] text-white px-4 py-3 rounded-lg flex items-center space-x-2"
                >
                  <FiUploadCloud />
                  <span>انتخاب تصویر</span>
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-[#0077b6] mb-2">
                عنوان استوری
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full p-3 border-2 border-[#0077b6]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]/50"
                placeholder="عنوان استوری را وارد کنید"
                required
              />
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className={`
                w-full py-3 rounded-lg flex items-center justify-center space-x-2 
                ${
                  saveStatus === "saving"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0077b6] text-white hover:bg-[#0077b6]/90"
                }
              `}
              >
                {saveStatus === "saving" ? (
                  <span>در حال ذخیره...</span>
                ) : (
                  <>
                    <FiSave />
                    <span>ذخیره استوری</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-3 rounded-lg bg-purple-600 text-white flex items-center justify-center space-x-2 hover:bg-purple-700"
              >
                <FiEdit />
                <span>مدیریت استوری‌ها</span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {saveStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`
                mt-4 p-4 rounded-lg flex items-center justify-center
                ${
                  saveStatus === "success"
                    ? "bg-green-100 text-green-800 border-2 border-green-500"
                    : "bg-red-100 text-red-800 border-2 border-red-500"
                }
              `}
              >
                {saveStatus === "success"
                  ? "استوری با موفقیت ذخیره شد"
                  : "خطا در ذخیره استوری"}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <EditStory
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />

        <ImageSelectorModal
          isOpen={isImageSelectorOpen}
          onClose={() => setIsImageSelectorOpen(false)}
          onSelectImage={handleImageSelect}
        />

        <ToastContainer rtl={true} position="top-center" />
      </div>
    </>
  );
};
