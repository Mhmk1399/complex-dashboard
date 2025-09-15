"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiUploadCloud,
  FiEdit,
  FiSave,
  FiImage,
  FiType,
  FiPlus,
  FiCheck,
  FiX,
  FiEye,
} from "react-icons/fi";
import { EditStory } from "./editStory";
import ImageSelectorModal from "./ImageSelectorModal";
import Image from "next/image";
import { StorySettings } from "@/types/type";

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

  const clearImage = () => {
    setSettings((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const isFormValid = settings.title.trim() && settings.image;

  return (
    <>
      <div
        dir="rtl"
        className="min-h-screen  p-4 flex items-center justify-center"
      >
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <FiPlus className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              افزودن استوری جدید
            </h1>
            <p className="text-gray-600 text-lg">
              استوری جذاب خود را ایجاد کنید و با مخاطبان به اشتراک بگذارید
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
          >
            {/* Progress Indicator */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      settings.image ? "bg-white/20" : "bg-white/40"
                    }`}
                  >
                    <FiImage className="text-sm" />
                  </div>
                  <span className="text-sm font-medium">انتخاب تصویر</span>
                </div>

                <div className="w-16 h-1 bg-white/20 rounded-full mx-4">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (Object.values(settings).filter(Boolean).length / 2) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      settings.title ? "bg-white/20" : "bg-white/40"
                    }`}
                  >
                    <FiType className="text-sm" />
                  </div>
                  <span className="text-sm font-medium">عنوان</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Image Selection Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <label className="flex items-center gap-3 text-xl font-semibold text-gray-800 mb-4">
                  <FiImage className="text-blue-500" />
                  تصویر استوری
                </label>

                {settings.image ? (
                  /* Image Preview */
                  <div className="relative group">
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-blue-100">
                      <Image
                        src={settings.image}
                        alt="Selected story image"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Image Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => setIsImageSelectorOpen(true)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group"
                      >
                        <FiEdit className="text-blue-500 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={clearImage}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group"
                      >
                        <FiX className="text-red-500 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Success Indicator */}
                    <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                      <FiCheck className="text-xs" />
                      تصویر انتخاب شد
                    </div>
                  </div>
                ) : (
                  /* Image Upload Area */
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsImageSelectorOpen(true)}
                    className="relative w-full h-64 border-3 border-dashed border-blue-300 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <FiUploadCloud className="text-2xl text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-700 mb-1">
                          برای انتخاب تصویر کلیک کنید
                        </p>
                        <p className="text-sm text-gray-500">
                          تصویر استوری خود را از گالری انتخاب کنید
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Title Input Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4"
              >
                <label className="flex items-center gap-3 text-xl font-semibold text-gray-800 mb-4">
                  <FiType className="text-blue-500" />
                  عنوان استوری
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full p-4 pr-12 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                    placeholder="عنوان جذاب برای استوری خود بنویسید..."
                    dir="rtl"
                  />
                  <FiType className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />

                  {/* Character Counter */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                    {settings.title.length}/100
                  </div>
                </div>

                {/* Title Preview */}
                {settings.title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FiEye className="text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">
                        پیش‌نمایش عنوان:
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">
                      {settings.title}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
              >
                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                  whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                  onClick={handleSave}
                  disabled={!isFormValid || saveStatus === "saving"}
                  className={`
                    flex-1 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg
                    ${
                      isFormValid && saveStatus !== "saving"
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-1"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {saveStatus === "saving" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <FiSave className="text-xl" />
                      ذخیره استوری
                    </>
                  )}
                </motion.button>

                {/* Manage Stories Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FiEdit className="text-xl" />
                  مدیریت استوری‌ها
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Form Validation Helper */}
          {!isFormValid && (settings.title || settings.image) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiX className="text-white text-xs" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 mb-1">
                    برای ادامه، موارد زیر را تکمیل کنید:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {!settings.title && (
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-600 rounded-full" />
                        عنوان استوری را وارد کنید
                      </li>
                    )}
                    {!settings.image && (
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-600 rounded-full" />
                        تصویر استوری را انتخاب کنید
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FiImage className="text-blue-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                تصویر باکیفیت
              </h3>
              <p className="text-sm text-gray-600">
                برای بهترین نتیجه، تصاویر با کیفیت بالا و ابعاد مناسب انتخاب
                کنید
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FiType className="text-green-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">عنوان جذاب</h3>
              <p className="text-sm text-gray-600">
                عنوان کوتاه و جذاب انتخاب کنید که توجه مخاطبان را جلب کند
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FiEye className="text-purple-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">پیش‌نمایش</h3>
              <p className="text-sm text-gray-600">
                قبل از انتشار، از پیش‌نمایش استوری خود اطمینان حاصل کنید
              </p>
            </div>
          </motion.div>
        </div>

        {/* Modals */}
        <EditStory
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />

        <ImageSelectorModal
          isOpen={isImageSelectorOpen}
          onClose={() => setIsImageSelectorOpen(false)}
          onSelectImage={handleImageSelect}
        />

        {/* Toast Container */}
        <ToastContainer
          rtl={true}
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="backdrop-blur-sm"
        />
      </div>
    </>
  );
};
