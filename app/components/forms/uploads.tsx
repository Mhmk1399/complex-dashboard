"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setUploadStatus('idle');
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploadFile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        toast.success("فایل با موفقیت آپلود شد", {
          position: "top-right",
          theme: "light"
        });
        setFile(null);
      } else {
        setUploadStatus('error');
        toast.error("آپلود فایل با خطا مواجه شد", {
          position: "top-right",
          theme: "light"
        });
      }
    } catch (error) {
      setUploadStatus('error');
      toast.error("خطای غیرمنتظره", {
        position: "top-right",
        theme: "light"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setUploadStatus('idle');
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
          <h2 className="text-2xl font-bold text-gray-800">آپلود فایل</h2>
          <p className="text-gray-500 mt-2">فایل خود را انتخاب و آپلود کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              className="hidden"
            />
            <label 
              htmlFor="fileUpload" 
              className={`
                w-full block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                ${file 
                  ? 'border-green-500 bg-green-50 text-green-600' 
                  : 'border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600'}
                transition-all duration-300
              `}
            >
              {file 
                ? `${file.name} (${(file.size / 1024).toFixed(2)} KB)` 
                : 'انتخاب فایل'}
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!file || loading}
            className={`
              w-full py-3 rounded-lg text-white font-bold transition-all duration-300
              ${file && !loading 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-400 cursor-not-allowed'}
            `}
          >
            {loading ? 'در حال آپلود...' : 'آپلود فایل'}
          </motion.button>
        </form>

        <AnimatePresence>
          {uploadStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                mt-4 p-4 rounded-lg flex items-center justify-center
                ${uploadStatus === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'}
              `}
            >
              {uploadStatus === 'success' 
                ? <><FiCheckCircle className="ml-2" /> فایل با موفقیت آپلود شد</>
                : <><FiAlertTriangle className="ml-2" /> خطا در آپلود فایل</>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
