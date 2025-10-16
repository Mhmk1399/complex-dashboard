import { useState, useEffect } from "react";
import { FaTrash, FaExpand } from "react-icons/fa";
import { FiImage, FiAlertTriangle } from "react-icons/fi";
import Image from "next/image";
import { ImageFile } from "@/types/type";
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
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-zoom-in { animation: zoomIn 0.3s ease-out; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface ImageResponse {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  size: number;
}

export default function ImageGallery() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    imageId: "",
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/upload`, {
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
      }));

      setImages(imageUrls);
    } catch (error) {
      console.log("Error fetching images:", error);
      setError("خطا در بارگیری تصاویر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const initiateDelete = (id: string) => {
    setDeleteModal({ isOpen: true, imageId: id });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const image = images.find((img) => img._id === deleteModal.imageId);
      if (!image) {
        return;
      }

      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileId: image._id,
        }),
      });

      if (response.ok) {
        setImages(images.filter((img) => img._id !== deleteModal.imageId));
        toast.success("عکس با موفقیت حذف شد");
        setTimeout(() => {
          setDeleteModal({ isOpen: false, imageId: "" });
        }, 1500);
      } else {
        toast.error("خطا در حذف عکس");
      }
    } catch (error) {
      toast.error("خطا در حذف عکس");
      console.log("Error deleting image:", error);
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
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative max-w-[95vw] max-h-[95vh] w-auto h-auto animate-zoom-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 left-0 z-10 p-3 bg-slate-900/80 hover:bg-white/30 rounded-full text-white transition-colors shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <Image
            src={image.fileUrl}
            alt={image.fileName}
            width={1200}
            height={800}
            style={{
              objectFit: "contain",
              maxWidth: "95vw",
              maxHeight: "95vh",
            }}
            className="rounded-lg"
            priority
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 py-6 sm:py-8 mt-10 animate-fade-in">
      <div className="w-full max-w-6xl backdrop-blur-sm  rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6 md:p-8 border border-slate-200 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-900 bg-clip-text text-transparent">
            گالری تصاویر
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2">
            مدیریت و مشاهده تصاویر آپلود شده
          </p>
          <div className="mt-3 sm:mt-4 flex flex-row-reverse items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500">تعداد تصاویر</span>
            <span className="font-bold text-slate-600">{images.length}</span>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg transition-all shadow-lg text-sm font-medium"
          >
            آپلود تصویر جدید
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] sm:h-[60vh]">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full mb-4 animate-spin" />
            <p className="text-slate-500 text-sm sm:text-base">
              در حال بارگیری تصاویر...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center h-[50vh] sm:h-[60vh] border-2 border-dashed border-red-300 rounded-lg animate-slide-up">
            <FiAlertTriangle className="w-20 h-20 sm:w-32 sm:h-32 text-red-400 mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-2xl font-semibold text-red-600 mb-2">
              {error}
            </h2>
            <button
              onClick={fetchImages}
              className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              تلاش مجدد
            </button>
          </div>
        ) : images.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[50vh] sm:h-[60vh] border-2 border-dashed border-slate-300 rounded-lg animate-slide-up">
            <FiImage className="w-20 h-20 sm:w-32 sm:h-32 text-slate-300 mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-2xl font-semibold text-slate-700 mb-2">
              تصاویری بارگذاری نشده است
            </h2>
            <p className="text-slate-500 text-center max-w-md text-xs sm:text-sm px-4">
              برای بارگذاری تصاویر، از بخش آپلود استفاده کنید
            </p>
          </div>
        ) : (
          /* Image Grid */
          <div
            dir="rtl"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 items-center justify-end gap-3 sm:gap-4 animate-slide-up"
          >
            {images.map((image, index) => (
              <div
                key={image._id}
                className="group relative bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.fileUrl}
                    alt={image.fileName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-300 flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100">
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      className="p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full text-red-500 hover:text-red-600 transition-all shadow-lg hover:scale-110"
                      onClick={() => initiateDelete(image._id)}
                      title="حذف تصویر"
                    >
                      <FaTrash className="text-sm sm:text-base" />
                    </button>
                    <button
                      className="p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full text-slate-600 hover:text-slate-700 transition-all shadow-lg hover:scale-110"
                      onClick={() => {
                        setSelectedImage(image);
                        setIsLightboxOpen(true);
                      }}
                      title="مشاهده تصویر"
                    >
                      <FaExpand className="text-sm sm:text-base" />
                    </button>
                  </div>
                </div>

                {/* Image name tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">
                    {image.fileName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="">
          {" "}
          {/* Lightbox */}
          {isLightboxOpen && selectedImage && (
            <ImageLightbox
              image={selectedImage}
              onClose={() => setIsLightboxOpen(false)}
            />
          )}
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div
            dir="rtl"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  آپلود تصاویر
                </h3>
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFiles([]);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <input
                type="file"
                id="uploadInput"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setUploadFiles(files);
                }}
                multiple
                accept=".jpeg,.jpg,.png,.gif,.webp"
                className="hidden"
              />
              <label
                htmlFor="uploadInput"
                className={`w-full block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  uploadFiles.length > 0
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <FiImage className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <div className="text-base font-semibold text-slate-700">
                  {uploadFiles.length > 0
                    ? `${uploadFiles.length} فایل انتخاب شده`
                    : "انتخاب تصاویر"}
                </div>
              </label>

              {uploadProgress && (
                <div className="mt-4 bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-slate-700 mb-2">
                    {uploadProgress}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-slate-600 h-2 rounded-full animate-progress" />
                  </div>
                </div>
              )}

              <button
                onClick={async () => {
                  if (uploadFiles.length === 0) return;
                  setUploading(true);
                  for (let i = 0; i < uploadFiles.length; i++) {
                    setUploadProgress(
                      `آپلود ${i + 1} از ${uploadFiles.length}`
                    );
                    const formData = new FormData();
                    formData.append("file", uploadFiles[i]);
                    try {
                      await fetch("/api/upload", {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                        body: formData,
                      });
                    } catch (error) {
                      console.log(error);
                    }
                  }
                  setUploading(false);
                  setUploadProgress("");
                  setUploadFiles([]);
                  setIsUploadModalOpen(false);
                  fetchImages();
                }}
                disabled={uploadFiles.length === 0 || uploading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg font-medium transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {uploading ? "در حال آپلود..." : "آپلود تصاویر"}
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="bg-white backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 w-full max-w-md border border-slate-200 shadow-2xl animate-scale-in">
              <div className="text-center">
                {/* Icon */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="text-red-600 text-lg sm:text-xl" />
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 sm:mb-4">
                  حذف تصویر
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8">
                  آیا از حذف این تصویر اطمینان دارید؟
                </p>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-3">
                  <button
                    className="w-full sm:w-auto px-5 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
                    onClick={() =>
                      setDeleteModal({ isOpen: false, imageId: "" })
                    }
                  >
                    لغو
                  </button>
                  <button
                    className="w-full sm:w-auto px-5 py-2 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm shadow-md"
                    onClick={confirmDelete}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
