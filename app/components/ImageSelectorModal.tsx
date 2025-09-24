"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiImage, FiX, FiCheck } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { ImageFile, ImageSelectorModalProps } from "@/types/type";

interface ImageResponse {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  size: number;
}

export default function ImageSelectorModal({
  isOpen,
  onClose,
  onSelectImage,
}: ImageSelectorModalProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch images based on store ID from token
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/upload", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      const imageUrls = data.images.map((image: ImageResponse) => ({
        _id: image.id,
        fileName: image.filename,
        storeId: image.id,
        fileUrl: image.url,
        fileSize: image.size,
        fileType: 'image'
      }));

      setImages(imageUrls);
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelectedImages([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Handle image selection
  const handleImageSelect = (image: ImageFile) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img._id === image._id);
      if (isSelected) {
        return prev.filter(img => img._id !== image._id);
      } else if (prev.length < 6) {
        return [...prev, image];
      }
      return prev;
    });
  };

  // Confirm image selection
  const confirmSelection = () => {
    if (selectedImages.length > 0) {
      selectedImages.forEach(image => onSelectImage(image));
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter images based on search term
  const filteredImages = (images || []).filter((image) =>
    image.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // If modal is not open, return null
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        {/* Enhanced Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal Container - Fixed Height Structure */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden z-10"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="flex items-center flex-row-reverse justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiImage className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  انتخاب تصویر
                </h2>
                <p className="text-sm text-gray-600">
                  {images.length} تصویر موجود
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <FiX className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>

          {/* Search Bar - Fixed */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در تصاویر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                dir="rtl"
              />
              <FiImage className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {isLoading ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-600 text-lg">
                  در حال بارگذاری تصاویر...
                </p>
              </div>
            ) : filteredImages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="p-6 bg-gray-100 rounded-full">
                  <FiImage className="w-16 h-16 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-gray-700">
                    {searchTerm ? "تصویری یافت نشد" : "تصویری موجود نیست"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "لطفاً کلمه کلیدی دیگری امتحان کنید"
                      : "ابتدا تصاویر خود را آپلود کنید"}
                  </p>
                </div>
              </div>
            ) : (
              /* Images Grid */
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image._id}
                    className={`relative cursor-pointer rounded-xl overflow-hidden group transition-all duration-300 ${
                      selectedImages.some(img => img._id === image._id)
                        ? "ring-4 ring-blue-500 ring-offset-2 shadow-xl scale-105"
                        : "hover:shadow-lg hover:scale-102"
                    } ${
                      selectedImages.length >= 6 && !selectedImages.some(img => img._id === image._id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (selectedImages.length < 6 || selectedImages.some(img => img._id === image._id)) {
                        handleImageSelect(image);
                      }
                    }}
                    whileHover={{ y: -2 }}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={image.fileUrl}
                        alt={image.fileName}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          console.log('Failed to load image:', image.fileUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                      {/* Selection Indicator */}
                      {selectedImages.some(img => img._id === image._id) && (
                        <motion.div
                          className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <FiCheck className="w-4 h-4" />
                        </motion.div>
                      )}
                      
                      {/* Selection Count */}
                      {selectedImages.some(img => img._id === image._id) && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {selectedImages.findIndex(img => img._id === image._id) + 1}
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-medium truncate">
                        {image.fileName}
                      </p>
                      <p className="text-white/80 text-xs">
                        {formatFileSize(image.fileSize)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions - Fixed at Bottom */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 gap-4">
            <div className="text-sm text-gray-600 w-full sm:flex-1 sm:min-w-0">
              {selectedImages.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {selectedImages.slice(0, 3).map((image) => (
                      <div key={image._id} className="w-8 h-8 relative rounded-lg overflow-hidden border-2 border-white shadow-md">
                        <img
                          src={image.fileUrl}
                          alt={image.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {selectedImages.length > 3 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-medium">
                        +{selectedImages.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-800">
                    {selectedImages.length} تصویر انتخاب شده
                  </span>
                  {selectedImages.length >= 6 && (
                    <span className="text-orange-500 text-xs">(حداکثر)</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <FiImage className="w-5 h-5" />
                  <span>تصاویر مورد نظر خود را انتخاب کنید (حداکثر 6)</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
              >
                انصراف
              </button>
              <button
                onClick={confirmSelection}
                disabled={selectedImages.length === 0}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  selectedImages.length > 0
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {selectedImages.length > 0 ? `تایید انتخاب (${selectedImages.length})` : "انتخاب کنید"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
