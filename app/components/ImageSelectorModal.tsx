"use client";

import { useState, useEffect } from "react";
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
      const token = localStorage.getItem("token");
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
        fileType: "image",
      }));

      setImages(imageUrls);
    } catch (error) {
      console.log("Error fetching images:", error);
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
    setSelectedImages((prev) => {
      const isSelected = prev.some((img) => img._id === image._id);
      if (isSelected) {
        return prev.filter((img) => img._id !== image._id);
      } else if (prev.length < 6) {
        return [...prev, image];
      }
      return prev;
    });
  };

  // Confirm image selection
  const confirmSelection = () => {
    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => onSelectImage(image));
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
    <>
      <style jsx>{`
        .modal-backdrop {
          animation: fadeIn 0.2s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-container {
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .image-item {
          animation: fadeInUp 0.3s ease-out backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .check-badge {
          animation: popIn 0.2s ease-out;
        }

        @keyframes popIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>

      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal Container */}
        <div
           className="modal-container relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] sm:h-[90vh] flex flex-col overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center flex-row justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-slate-500 rounded-lg">
                <FiImage className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  انتخاب تصویر
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {images.length} تصویر موجود
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors group"
            >
              <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 group-hover:text-slate-700" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:p-6 border-b border-slate-100 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در تصاویر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 outline-none"
                dir="rtl"
              />
              <FiImage className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 min-h-0">
            {isLoading ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center h-full space-y-3 sm:space-y-4">
                <FaSpinner className="spinner w-10 h-10 sm:w-12 sm:h-12 text-slate-500" />
                <p className="text-slate-600 text-sm sm:text-base">
                  در حال بارگذاری تصاویر...
                </p>
              </div>
            ) : filteredImages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-6 bg-slate-100 rounded-full">
                  <FiImage className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-700">
                    {searchTerm ? "تصویری یافت نشد" : "تصویری موجود نیست"}
                  </h3>
                  <p className="text-slate-500 text-sm sm:text-base">
                    {searchTerm
                      ? "لطفاً کلمه کلیدی دیگری امتحان کنید"
                      : "ابتدا تصاویر خود را آپلود کنید"}
                  </p>
                </div>
              </div>
            ) : (
              /* Images Grid */
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {filteredImages.map((image, index) => (
                  <div
                    key={image._id}
                    className={`image-item relative cursor-pointer rounded-lg overflow-hidden group transition-all duration-200 hover-lift ${
                      selectedImages.some((img) => img._id === image._id)
                        ? "ring-2 sm:ring-4 ring-slate-500 ring-offset-1 sm:ring-offset-2 shadow-lg hover-scale"
                        : "hover:shadow-md"
                    } ${
                      selectedImages.length >= 6 &&
                      !selectedImages.some((img) => img._id === image._id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                    onClick={() => {
                      if (
                        selectedImages.length < 6 ||
                        selectedImages.some((img) => img._id === image._id)
                      ) {
                        handleImageSelect(image);
                      }
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square bg-slate-100">
                      <Image
                        src={image.fileUrl}
                        alt={image.fileName}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          console.log("Failed to load image:", image.fileUrl);
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />

                      {/* Selection Indicator */}
                      {selectedImages.some((img) => img._id === image._id) && (
                        <div className="check-badge absolute top-1 sm:top-2 right-1 sm:right-2 bg-slate-500 text-white p-1 sm:p-1.5 rounded-full shadow-lg">
                          <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      )}

                      {/* Selection Count */}
                      {selectedImages.some((img) => img._id === image._id) && (
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-slate-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                          {selectedImages.findIndex(
                            (img) => img._id === image._id
                          ) + 1}
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">
                        {image.fileName}
                      </p>
                      <p className="text-white/80 text-xs hidden sm:block">
                        {formatFileSize(image.fileSize)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0 gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-slate-600 w-full sm:flex-1 sm:min-w-0">
              {selectedImages.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {selectedImages.slice(0, 3).map((image) => (
                      <div
                        key={image._id}
                        className="w-6 h-6 sm:w-8 sm:h-8 relative rounded-lg overflow-hidden border-2 border-white shadow-md"
                      >
                        <img
                          src={image.fileUrl}
                          alt={image.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {selectedImages.length > 3 && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-medium">
                        +{selectedImages.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-slate-800 text-xs sm:text-sm">
                    {selectedImages.length} تصویر انتخاب شده
                  </span>
                  {selectedImages.length >= 6 && (
                    <span className="text-orange-500 text-xs">(حداکثر)</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <FiImage className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">
                    تصاویر مورد نظر خود را انتخاب کنید (حداکثر 6)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
              >
                انصراف
              </button>
              <button
                onClick={confirmSelection}
                disabled={selectedImages.length === 0}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 ${
                  selectedImages.length > 0
                    ? "bg-slate-500 text-white hover:bg-slate-600 shadow-md hover:shadow-lg"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {selectedImages.length > 0
                  ? `تایید انتخاب (${selectedImages.length})`
                  : "انتخاب کنید"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
