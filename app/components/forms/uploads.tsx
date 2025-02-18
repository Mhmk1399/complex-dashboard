"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const validateFile = (file: File) => {
    const validTypes = ["image/webp", "image/png"];
    const maxSize = 100 * 1024; // 100KB in bytes

    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name} باید فرمت PNG یا WEBP باشد`, {
        position: "top-right",
        theme: "light",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${file.name} باید کمتر از 100 کیلوبایت باشد`, {
        position: "top-right",
        theme: "light",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoading(true);
    setUploadStatus("idle");
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      const response = await fetch("/api/uploadFile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("success");
        toast.success("فایل‌ها با موفقیت آپلود شدند", {
          position: "top-right",
          theme: "light",
        });
        setFiles([]);
      } else {
        setUploadStatus("error");
        toast.error("آپلود فایل‌ها با خطا مواجه شد", {
          position: "top-right",
          theme: "light",
        });
      }
    } catch (error) {
      setUploadStatus("error");
      toast.error("خطای غیرمنتظره", {
        position: "top-right",
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => validateFile(file));
    setFiles(validFiles);
    setUploadStatus("idle");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-6">
          <FiUploadCloud className="mx-auto text-5xl text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">آپلود تصاویر</h2>
          <p className="text-gray-500 mt-2 text-sm">
            حداکثر حجم هر تصویر: 100 کیلوبایت
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              multiple
              accept=".webp,.png"
              className="hidden"
            />
            <label
              htmlFor="fileUpload"
              className={`
                w-full block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                ${
                  files.length > 0
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600"
                }
                transition-all duration-300
              `}
            >
              {files.length > 0
                ? `${files.length} فایل انتخاب شده`
                : "انتخاب تصاویر"}
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              ))}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={files.length === 0 || loading}
            className={`
              w-full py-3 rounded-lg text-white font-bold transition-all duration-300
              ${
                files.length > 0 && !loading
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              }
            `}
          >
            {loading ? "در حال آپلود..." : "آپلود تصاویر"}
          </motion.button>
        </form>

        <AnimatePresence>
          {uploadStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                mt-4 p-4 rounded-lg flex items-center justify-center
                ${
                  uploadStatus === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              `}
            >
              {uploadStatus === "success" ? (
                <>
                  <FiCheckCircle className="ml-2" /> تصاویر با موفقیت آپلود شدند
                </>
              ) : (
                <>
                  <FiAlertTriangle className="ml-2" /> خطا در آپلود تصاویر
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
