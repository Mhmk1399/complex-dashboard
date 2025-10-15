"use client";
import { useState } from "react";
import {
  FiUploadCloud,
  FiCheckCircle,
  FiAlertTriangle,
  FiImage,
  FiX,
} from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";

// CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-slide-in-left { animation: slideInLeft 0.3s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-progress { animation: progress 1s ease-in-out infinite; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

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
  const [, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name} باید فرمت JPEG، PNG، GIF یا WEBP باشد`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${file.name} باید کمتر از 10 مگابایت باشد`);
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
            fileId,
          });
        } else {
          results.push({
            success: false,
            url: "",
            message: data.error || "Upload failed",
            displayName,
            fileId,
          });
        }
      } catch {
        results.push({
          success: false,
          url: "",
          message: "خطا در آپلود فایل",
          displayName,
          fileId,
        });
      }
    }

    setUploadResults(results);
    const successCount = results.filter((r) => r.success).length;

    if (successCount === files.length) {
      setUploadStatus("success");
      toast.success(`همه ${files.length} فایل با موفقیت آپلود شدند`);
    } else if (successCount > 0) {
      setUploadStatus("success");
      toast.success(`${successCount} از ${files.length} فایل آپلود شد`);
    } else {
      setUploadStatus("error");
      toast.error("خطا در آپلود فایلها");
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
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="w-full max-w-2xl backdrop-blur-sm  rounded-lg sm:rounded-xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8 animate-scale-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 to-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <FiUploadCloud className="text-2xl sm:text-3xl text-white" />
          </div>
          <div className="flex items-center flex-row-reverse justify-center gap-2 sm:gap-3 relative">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-900 bg-clip-text text-transparent">
              آپلود تصاویر
            </h2>
            <div className="relative">
              <div
                className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center cursor-help hover:bg-slate-200 transition-colors"
                onMouseEnter={() => setShowImageTips(true)}
                onMouseLeave={() => setShowImageTips(false)}
                onClick={() => setShowImageTips(!showImageTips)}
              >
                <span className="text-slate-600 text-sm font-bold">؟</span>
              </div>
              {showImageTips && (
                <div
                  dir="rtl"
                  className="absolute z-20 -left-4 sm:-left-32 top-8 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 text-xs sm:text-sm text-slate-700 w-72 sm:w-80 animate-scale-in"
                >
                  <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45"></div>
                  <ul className="text-right space-y-2 sm:space-y-3">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      حجم هر تصویر باید کمتر از ۱۰ مگابایت باشد
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      فرمتهای JPEG، PNG، GIF و WEBP مجاز است
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      میتوانید چندین تصویر را همزمان انتخاب کنید
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                w-full block border-2 border-dashed rounded-lg sm:rounded-xl p-6 sm:p-8 text-center cursor-pointer group transition-all
                ${
                  files.length > 0
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700"
                    : "border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-600 hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-50"
                }
              `}
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                {files.length > 0 ? (
                  <>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <FiCheckCircle className="text-xl sm:text-2xl text-emerald-600" />
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      {files.length} فایل انتخاب شده
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 group-hover:bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors">
                      <FiImage className="text-xl sm:text-2xl text-slate-500 group-hover:text-slate-500 transition-colors" />
                    </div>
                    <div className="text-base sm:text-lg font-semibold">
                      انتخاب تصاویر
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      کلیک کنید یا فایل‌ها را بکشید
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2 sm:space-y-3 bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  فایل‌های انتخاب شده ({files.length})
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-lg p-2 sm:p-3 shadow-sm animate-slide-in-left"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiImage className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                        تصویر {index + 1}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap ml-2">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadProgress && (
            <div className="text-center animate-slide-up">
              <div className="bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  {uploadProgress}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-slate-500 to-slate-600 h-2 rounded-full animate-progress" />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={files.length === 0 || loading}
            className={`
              w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-white font-medium sm:font-bold transition-all shadow-lg text-sm sm:text-base
              ${
                files.length > 0 && !loading
                  ? "bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 hover:shadow-xl"
                  : "bg-slate-300 cursor-not-allowed"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "در حال آپلود..." : "آپلود تصاویر"}
            </div>
          </button>
        </form>

        {uploadResults.length > 0 && (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 animate-slide-up">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-900 bg-clip-text text-transparent">
                نتایج آپلود
              </h3>
              <div className="w-16 h-1 bg-gradient-to-r from-slate-900 to-slate-900 rounded-full mx-auto mt-2"></div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg sm:rounded-xl overflow-hidden shadow-lg border animate-slide-in-left ${
                    result.success
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
                      : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                            result.success ? "bg-emerald-100" : "bg-red-100"
                          }`}
                        >
                          {result.success ? (
                            <FiCheckCircle className="text-emerald-600 text-base sm:text-lg" />
                          ) : (
                            <FiAlertTriangle className="text-red-600 text-base sm:text-lg" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm sm:text-base">
                          {result.displayName}
                        </span>
                      </div>
                    </div>
                    {result.success && result.url && (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm">
                          <Image
                            width={200}
                            height={200}
                            src={result.url}
                            alt={result.displayName}
                            className="w-full h-auto rounded-lg shadow-md max-h-48 object-cover"
                          />
                        </div>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700 text-xs sm:text-sm font-medium bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all"
                        >
                          <FiImage className="w-4 h-4" />
                          مشاهده تصویر
                        </a>
                      </div>
                    )}
                    {!result.success && (
                      <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm">
                        <p className="text-red-600 text-xs sm:text-sm font-medium">
                          {result.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
