"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageTips, setShowImageTips] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const validateFile = (file: File) => {
    const validTypes = ["image/webp", "image/png"];
    const maxSize = 10000 * 1024; // 100KB in bytes

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
    formData.append("file", files[0]);

    try {
      const response = await fetch("/api/uploadFile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        setUploadStatus("success");
        toast.success("فایل با موفقیت آپلود شد");
        setFiles([]);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      setUploadStatus("error");
      console.log(error)
      toast.error("خطا در آپلود فایل");
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
          <div className="flex items-center flex-row-reverse justify-center gap-2 relative">
            <h2 className="text-2xl font-bold text-gray-800">آپلود تصاویر</h2>
            <div className="relative">
              <i
                className="fas fa-info-circle cursor-help text-blue-400 hover:text-blue-600 transition-colors"
                onMouseEnter={() => setShowImageTips(true)}
                onMouseLeave={() => setShowImageTips(false)}
              />
              {showImageTips && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  dir="rtl"
                  className="absolute z-10 bg-blue-600 backdrop-blur-md border-2 border-white/50 rounded-xl shadow-lg p-5 text-sm text-white w-[280px]"
                >
                  <ul className="text-right space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      حجم هر تصویر باید کمتر از ۱۰۰ کیلوبایت باشد
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      فرمت تصاویر فقط PNG و WEBP مجاز است
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      می‌توانید چندین تصویر را همزمان انتخاب کنید
                    </li>
                  </ul>
                </motion.span>
              )}
            </div>
          </div>
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
                  تصاویر با موفقیت آپلود شدند <FiCheckCircle className="ml-2" />
                </>
              ) : (
                <>
                  خطا در آپلود تصاویر <FiAlertTriangle className="ml-2" />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
