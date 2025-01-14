"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
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
      setMessage(data.message);

      if (response.ok) {
        toast.success("File uploaded successfully!", {
          autoClose: 3000,
          position: "top-right",
          style: {
            background: "#0077b6",
            color: "#fff",
            borderRadius: "10px",
          },
        });
        setFile(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error);
      
      setMessage("آپلود با خطا مواجه شد");
      toast.error("Upload failed. Please try again.", {
        autoClose: 3000,
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "10px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12">
      <div className="bg-gradient-to-br  lg:mx-36 mx-6 rounded-2xl from-[#0077b6]  to-[#caf0f8] relative overflow-hidden">
        {/* Decorative SVG Background */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating Circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/20 rounded-full blur-xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md mx-4 md:mx-auto lg:mx-auto my-20 p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20"
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl rotate-45"
          />

          <motion.h1
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            className="text-3xl font-bold mb-8 text-white text-center"
          >
            آپلود فایل
          </motion.h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <label className="block text-lg font-medium text-white mb-4">
                انتخاب فایل
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-white
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-2
                file:border-white/20
                file:text-sm file:font-bold
                file:bg-white/10 file:text-white
                hover:file:bg-white/20 
                transition-all duration-300
                cursor-pointer"
              />
            </motion.div>

            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(255,255,255,0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!file || loading}
              className="w-full py-3 px-6 rounded-full font-bold text-white bg-gradient-to-r from-[#0077b6] to-[#90e0ef] hover:from-[#90e0ef] hover:to-[#0077b6] transition-all ease-in-out duration-700 disabled:opacity-50 shadow-lg"
            >
              {loading ? "در حال آپلود..." : "آپلود فایل"}
            </motion.button>
          </form>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-xl bg-white/10 text-white text-center font-medium backdrop-blur-sm border border-white/20"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
