"use client";
import React, { useState } from "react";
import {
  FiUploadCloud,
  FiEdit,
  FiSave,
  FiImage,
  FiType,
   FiCheck,
  FiX,
  FiEye,
} from "react-icons/fi";
import { EditStory } from "./editStory";
import ImageSelectorModal from "./ImageSelectorModal";
import Image from "next/image";
import { StorySettings } from "@/types/type";
import toast from "react-hot-toast";

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
      console.log(error);
    } finally {
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
  const completionPercentage =
    (Object.values(settings).filter(Boolean).length / 2) * 100;

  return (
    <>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in-left {
          animation: slideInLeft 0.5s ease-out;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .slide-in-right {
          animation: slideInRight 0.5s ease-out;
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

        .scale-in {
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .hover-scale:hover {
          transform: scale(1.02);
        }

        .progress-bar {
          transition: width 0.5s ease-out;
        }
      `}</style>

      <div
        dir="rtl"
        className="min-h-screen p-4 sm:p-6 flex items-center justify-center mt-20"
      >
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              افزودن استوری جدید
            </h1>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg">
              استوری جذاب خود را ایجاد کنید و با مخاطبان به اشتراک بگذارید
            </p>
          </div>

          {/* Main Form Card */}
          <div className="scale-in backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Progress Indicator */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      settings.image ? "bg-white/20" : "bg-white/40"
                    }`}
                  >
                    <FiImage className="text-xs sm:text-sm" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                    انتخاب تصویر
                  </span>
                </div>

                <div className="flex-1 h-1 bg-white/20 rounded-full mx-2 sm:mx-4 max-w-[100px] sm:max-w-[150px]">
                  <div
                    className="progress-bar h-full bg-white rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      settings.title ? "bg-white/20" : "bg-white/40"
                    }`}
                  >
                    <FiType className="text-xs sm:text-sm" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                    عنوان
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              {/* Image Selection Section */}
              <div className="space-y-3 sm:space-y-4 slide-in-left">
                <label className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-slate-900">
                  <FiImage className="text-slate-500 text-base sm:text-xl" />
                  تصویر استوری
                </label>

                {settings.image ? (
                  /* Image Preview */
                  <div className="relative group">
                    <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-2 sm:border-4 border-slate-100">
                      <Image
                        src={settings.image}
                        alt="Selected story image"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Image Actions */}
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-2">
                      <button
                        onClick={() => setIsImageSelectorOpen(true)}
                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover-scale"
                      >
                        <FiEdit className="text-slate-500 text-sm sm:text-base" />
                      </button>
                      <button
                        onClick={clearImage}
                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover-scale"
                      >
                        <FiX className="text-red-500 text-sm sm:text-base" />
                      </button>
                    </div>

                    {/* Success Indicator */}
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 shadow-lg">
                      <FiCheck className="text-xs" />
                      تصویر انتخاب شد
                    </div>
                  </div>
                ) : (
                  /* Image Upload Area */
                  <div
                    onClick={() => setIsImageSelectorOpen(true)}
                    className="relative w-full h-48 sm:h-56 md:h-64 border-2 sm:border-3 border-dashed border-slate-300 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all duration-200 cursor-pointer group hover-scale"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                        <FiUploadCloud className="text-xl sm:text-2xl text-white" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-base sm:text-lg font-semibold text-slate-700 mb-1">
                          برای انتخاب تصویر کلیک کنید
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500">
                          تصویر استوری خود را از گالری انتخاب کنید
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Input Section */}
              <div className="space-y-3 sm:space-y-4 slide-in-right">
                <label className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-slate-900">
                  <FiType className="text-slate-500 text-base sm:text-xl" />
                  عنوان استوری
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 sm:pr-12 text-sm sm:text-base md:text-lg border-2 border-slate-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="عنوان جذاب برای استوری خود بنویسید..."
                    maxLength={100}
                    dir="rtl"
                  />
                  <FiType className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm sm:text-base" />

                  {/* Character Counter */}
                  <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-slate-400">
                    {settings.title.length}/100
                  </div>
                </div>

                {/* Title Preview */}
                {settings.title && (
                  <div className="fade-in p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg sm:rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FiEye className="text-slate-500 text-sm sm:text-base" />
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        پیش‌نمایش عنوان:
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium text-sm sm:text-base">
                      {settings.title}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={!isFormValid || saveStatus === "saving"}
                  className={`
                    flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-md
                    ${
                      isFormValid && saveStatus !== "saving"
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg hover-lift"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  {saveStatus === "saving" ? (
                    <>
                      <div className="spinner w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <FiSave className="text-lg sm:text-xl" />
                      ذخیره استوری
                    </>
                  )}
                </button>

                {/* Manage Stories Button */}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-md hover:shadow-lg hover-lift"
                >
                  <FiEdit className="text-lg sm:text-xl" />
                  مدیریت استوری‌ها
                </button>
              </div>
            </div>
          </div>

          {/* Form Validation Helper */}
          {!isFormValid && (settings.title || settings.image) && (
            <div className="fade-in mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiX className="text-white text-xs sm:text-sm" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 mb-1 text-sm sm:text-base">
                    برای ادامه، موارد زیر را تکمیل کنید:
                  </p>
                  <ul className="text-xs sm:text-sm text-amber-700 space-y-1">
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
            </div>
          )}

          {/* Tips Section */}
          <div className="fade-in mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FiImage className="text-slate-600 text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">
                تصویر باکیفیت
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                برای بهترین نتیجه، تصاویر با کیفیت بالا و ابعاد مناسب انتخاب
                کنید
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FiType className="text-green-600 text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">
                عنوان جذاب
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                عنوان کوتاه و جذاب انتخاب کنید که توجه مخاطبان را جلب کند
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FiEye className="text-purple-600 text-lg sm:text-xl" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">
                پیش‌نمایش
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                قبل از انتشار، از پیش‌نمایش استوری خود اطمینان حاصل کنید
              </p>
            </div>
          </div>
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
      </div>
    </>
  );
};
