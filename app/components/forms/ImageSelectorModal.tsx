"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiImage } from "react-icons/fi";

// Interface for image file
interface ImageFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storeId: string;
}

// Props interface for the modal
interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: ImageFile) => void;
}

export default function ImageSelectorModal({
  isOpen,
  onClose,
  onSelectImage,
}: ImageSelectorModalProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  // Fetch images based on store ID from token
  const fetchImages = async () => {
    try {
      const response = await fetch("/api/uploadFile");
      const data = await response.json();
      console.log("Fetched images:", data);
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Fetch images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  // Handle image selection
  const handleImageSelect = (image: ImageFile) => {
    setSelectedImage(image);
  };

  // Confirm image selection
  const confirmSelection = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      onClose();
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 w-[90%] max-w-4xl max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">انتخاب تصویر</h2>

          {/* Image Grid */}
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <FiImage className="w-32 h-32 text-gray-400 mb-4" />
              <h3 className="text-xl text-gray-600">تصویری یافت نشد</h3>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <motion.div
                  key={image._id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden 
                    ${
                      selectedImage?._id === image._id
                        ? "border-4 border-blue-500"
                        : "border-2 border-transparent"
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleImageSelect(image)}
                >
                  <Image
                    src={image.fileUrl}
                    alt={image.fileName}
                    width={300}
                    height={300}
                    className="object-cover w-full h-48"
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              انصراف
            </button>
            <button
              onClick={confirmSelection}
              disabled={!selectedImage}
              className={`px-4 py-2 rounded-lg ${
                selectedImage
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              تایید
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
