"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

interface UploadResult {
  success: boolean;
  url: string;
  message: string;
  displayName: string;
  fileId: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageTips, setShowImageTips] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name} باید فرمت JPEG، PNG، GIF یا WEBP باشد`, {
        position: "top-right",
        theme: "light",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${file.name} باید کمتر از 10 مگابایت باشد`, {
        position: "top-right",
        theme: "light",
      });
      return false;
    }

    if (isVideo && file.size > maxVideoSize) {
      toast.error(`${file.name} باید کمتر از 50 مگابایت باشد`, {
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
    setUploadResults([]);
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file_${Date.now()}_${i}`;
      const displayName = `تصویر ${i + 1}`;
      setUploadProgress(`آپلود ${i + 1} از ${files.length}`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          results.push({
            success: true,
            url: data.url,
            message: data.message,
            displayName,
            fileId
          });
        } else {
          results.push({
            success: false,
            url: "",
            message: data.error || "Upload failed",
            displayName,
            fileId
          });
        }
      } catch (error) {
        results.push({
          success: false,
          url: "",
          message: "خطا در آپلود فایل",
          displayName,
          fileId
        });
      }
    }

    setUploadResults(results);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === files.length) {
      setUploadStatus("success");
      toast.success(`همه ${files.length} فایل با موفقیت آپلود شدند`);
    } else if (successCount > 0) {
      setUploadStatus("success");
      toast.success(`${successCount} از ${files.length} فایل آپلود شد`);
    } else {
      setUploadStatus("error");
      toast.error("خطا در آپلود فایل‌ها");
    }

    setFiles([]);
    setUploadProgress("");
    setLoading(false);
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
            <h2 className="text-2xl font-bold text-gray-800">آپلود فایل‌ها</h2>
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
                      حجم هر تصویر باید کمتر از ۱۰ مگابایت باشد
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      فرمت‌های JPEG، PNG، GIF و WEBP مجاز است
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      میتوانید چندین تصویر را همزمان انتخاب کنید
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
              accept=".jpeg,.jpg,.png,.gif,.webp"
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
                : "انتخاب فایل‌ها"}
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="text-sm text-gray-600">
                  تصویر {index + 1} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              ))}
            </div>
          )}

          {uploadProgress && (
            <div className="text-center text-sm text-blue-600">
              {uploadProgress}
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
            {loading ? "در حال آپلود..." : "آپلود فایل‌ها"}
          </motion.button>
        </form>

        <AnimatePresence>
          {uploadResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                نتایج آپلود
              </h3>
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    result.success
                      ? "bg-green-100 border border-green-300"
                      : "bg-red-100 border border-red-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {result.displayName}
                    </span>
                    {result.success ? (
                      <FiCheckCircle className="text-green-600" />
                    ) : (
                      <FiAlertTriangle className="text-red-600" />
                    )}
                  </div>
                  {result.success && result.url && (
                    <div className="mt-3">
                      <img
                        src={result.url}
                        alt={result.displayName}
                        className="max-w-full h-auto rounded-lg shadow-md"
                        style={{ maxHeight: "200px" }}
                      />
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs hover:underline mt-2 block"
                      >
                        مشاهده تصویر
                      </a>
                    </div>
                  )}
                  {!result.success && (
                    <p className="text-red-600 text-sm mt-1">
                      {result.message}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}