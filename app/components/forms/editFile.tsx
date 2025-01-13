import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaExpand } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import Image from "next/image";

interface ImageFile {
  id: string;
  url: string;
  name: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<ImageFile[]>([
    {
      id: "1",
      url: "/images/1.jpg",
      name: "Image 1",
    },
    {
      id: "2",
      url: "/images/2.jpg",
      name: "Image 2",
    },
    {
      id: "3",
      url: "/images/3.jpg",
      name: "Image 3",
    },
  ]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    imageId: "",
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/upload");
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.log("Error fetching images:", error);
    }
  };

  const initiateDelete = (id: string) => {
    setDeleteModal({ isOpen: true, imageId: id });
  };

  const confirmDelete = async () => {
    try {
      await fetch(`/api/upload/${deleteModal.imageId}`, { method: "DELETE" });
      setImages(images.filter((img) => img.id !== deleteModal.imageId));
      setDeleteModal({ isOpen: false, imageId: "" });
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="pb-6">
      <div className="p-6 bg-gradient-to-br mx-44 rounded-2xl from-[#0077b6] to-[#caf0f8]">
        <motion.h1
          className="text-3xl font-bold text-white mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          گالری تصاویر
        </motion.h1>
        {images.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-[60vh]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FiImage className="w-32 h-32 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              تصاویری بارگذاری نشده است
            </h2>
            <p className="text-gray-400 text-center max-w-md">
              برای بارگذاری تصاویر ، از گزینه های بالا استفاده کنید.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            dir="rtl"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                className="group relative bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                layout
                dir="rtl"
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-48"
                />

                <motion.div
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-red-500 rounded-full mx-2 text-white"
                      onClick={() => initiateDelete(image.id)}
                    >
                      <FaTrash />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-green-500 rounded-full text-white"
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

        <AnimatePresence>
          {isLightboxOpen && selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
              onClick={() => setIsLightboxOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className="relative max-w-4xl max-h-[90vh]"
              >
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  width={800}
                  height={600}
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {deleteModal.isOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteModal({ isOpen: false, imageId: "" })}
              />
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <motion.div
                  className="bg-gray-800/20 backdrop-blur-md rounded-xl p-8 w-96 border border-gray-400"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      حذف تصویر
                    </h3>
                    <p className="text-gray-300 mb-8">
                      آیا از حذف این تصویر اطمینان دارید؟
                    </p>

                    <div className="flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg transition-colors hover:bg-gray-500"
                        onClick={() =>
                          setDeleteModal({ isOpen: false, imageId: "" })
                        }
                      >
                        لغو
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg transition-colors hover:bg-red-600"
                        onClick={confirmDelete}
                      >
                        حذف
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
