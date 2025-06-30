import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaExpand } from "react-icons/fa";
import { FiImage, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import Image from "next/image";
import { ImageFile } from "@/types/type";



export default function ImageGallery() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    imageId: "",
  });

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/uploadFile");
      const data = await response.json();
      console.log(data , "gallllley fetch");
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };
  useEffect(() => {
    fetchImages();
  }, []);

  const initiateDelete = (id: string) => {
    setDeleteModal({ isOpen: true, imageId: id });
    setDeleteStatus("idle");
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `/api/uploadFile?id=${deleteModal.imageId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setImages(images.filter((img) => img._id !== deleteModal.imageId));
        setDeleteStatus("success");
        setDeleteModal({ isOpen: false, imageId: "" });
      } else {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        setDeleteStatus("error");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setDeleteStatus("error");
    }
  };
  const ImageLightbox = ({
    image,
    onClose,
  }: {
    image: ImageFile;
    onClose: () => void;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.5 }}
          className="relative max-w-7xl max-h-[90vh] w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={image.fileUrl}
            alt={image.fileName}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
            priority
          />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen  mt-12 md:mt-0 flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border-2 border-[#0077b6]"
      >
        <div className="text-center mb-6">
          <FiImage className="mx-auto text-5xl text-[#0077b6] mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">گالری تصاویر</h2>
          <p className="text-gray-500 mt-2">مدیریت و مشاهده تصاویر آپلود شده</p>
        </div>

        {images.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-[#0077b6] rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FiImage className="w-32 h-32 text-[#0077b6]/50 mb-4" />
            <h2 className="text-2xl font-semibold text-[#0077b6] mb-2">
              تصاویری بارگذاری نشده است
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              برای بارگذاری تصاویر، از بخش آپلود استفاده کنید
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {images.map((image) => (
              <motion.div
                key={image._id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-md border border-[#0077b6]/20"
                whileHover={{ scale: 1.05 }}
                layout
              >
                <Image
                  src={image.fileUrl}
                  alt={image.fileName}
                  width={300}
                  height={300}
                  className="object-cover w-full h-48"
                />

                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-white/70 rounded-full text-rose-500"
                      onClick={() => initiateDelete(image._id)}
                    >
                      <FaTrash />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-white/70 rounded-full text-blue-500"
                      onClick={() => {
                        setSelectedImage(image);
                        setIsLightboxOpen(true);
                      }}
                    >
                      <FaExpand />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {isLightboxOpen && selectedImage && (
            <ImageLightbox
              image={selectedImage}
              onClose={() => setIsLightboxOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-8 w-96 border-2 border-[#0077b6] shadow-xl"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#0077b6] mb-4">
                    حذف تصویر
                  </h3>
                  <p className="text-gray-600 mb-8">
                    آیا از حذف این تصویر اطمینان دارید؟
                  </p>

                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg"
                      onClick={() =>
                        setDeleteModal({ isOpen: false, imageId: "" })
                      }
                    >
                      انصراف
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-[#0077b6] text-white rounded-lg"
                      onClick={confirmDelete}
                    >
                      تأیید حذف
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Status Notification */}
        <AnimatePresence>
          {deleteStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg flex items-center justify-center
                ${
                  deleteStatus === "success"
                    ? "bg-green-100 text-green-800 border-2 border-green-500"
                    : "bg-red-100 text-red-800 border-2 border-red-500"
                }
              `}
            >
              {deleteStatus === "success" ? (
                <>
                  <FiCheckCircle className="ml-2" /> تصویر با موفقیت حذف شد
                </>
              ) : (
                <>
                  <FiAlertTriangle className="ml-2" /> خطا در حذف تصویر
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
