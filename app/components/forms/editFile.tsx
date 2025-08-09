import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaExpand } from "react-icons/fa";
import { FiImage, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import Image from "next/image";
import { ImageFile } from "@/types/type";

interface ApiImageResponse {
  _id: string;
  fileName: string;
  storeId: string;
  fileUrl: string;
}

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
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/uploadFile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch images");
      return;
    }

    const data = await response.json();
    const imageUrls = data.images.images.map((image: ApiImageResponse) => ({
      _id: image._id,
      fileName: image.fileName,
      storeId: image.storeId,
      fileUrl: `${process.env.NEXT_PUBLIC_MAMAD_URL}${image.fileUrl}`
    }));

    setImages(imageUrls);
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
    const token = localStorage.getItem("token");
    const image = images.find((img) => img._id === deleteModal.imageId);
    if (!image) {
      setDeleteStatus("error");
      return;
    }

    const response = await fetch("/api/uploadFile", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        storeId: image.storeId,
        filename: image.fileName,
      }),
    });

    if (response.ok) {
      setImages(images.filter((img) => img._id !== deleteModal.imageId));
      setDeleteStatus("success");
      setDeleteModal({ isOpen: false, imageId: "" });
    } else {
      setDeleteStatus("error");
    }
  } catch {
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
                      onClick={() => setDeleteModal({ isOpen: false, imageId: "" })}
                    >
                      لغو
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg"
                      onClick={confirmDelete}
                    >
                      حذف
                    </motion.button>
                  </div>

                  {deleteStatus === "success" && (
                    <div className="mt-4 flex items-center justify-center text-green-600">
                      <FiCheckCircle className="mr-2" />
                      تصویر با موفقیت حذف شد
                    </div>
                  )}
                  {deleteStatus === "error" && (
                    <div className="mt-4 flex items-center justify-center text-red-600">
                      <FiAlertTriangle className="mr-2" />
                      خطا در حذف تصویر
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
