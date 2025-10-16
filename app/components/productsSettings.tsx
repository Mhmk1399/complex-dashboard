"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { Tooltip } from "react-tooltip";
import ImageSelectorModal from "./ImageSelectorModal";
import { ProductSettings, ImageFile } from "@/types/type";
import { AIDescriptionGenerator } from "./AIDescriptionGenerator";
import UploadPage from "./uploads";
import toast from "react-hot-toast";

interface StartComponentProps {
  setSelectedMenu: (menu: string) => void;
}

interface CategoryFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onClose, onSuccess }) => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("نام دستهبندی الزامی است");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: categoryName,
          children: [],
        }),
      });

      if (response.ok) {
        toast.success("دستهبندی با موفقیت ایجاد شد");
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "خطا در ایجاد دستهبندی");
      }
    } catch {
      toast.error("خطا در ایجاد دستهبندی");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700">
          نام دسته بندی
        </label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
          placeholder="نام دسته بندی را وارد کنید"
          required
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </form>
  );
};

export const ProductsSettings: React.FC<StartComponentProps> = ({}) => {
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [settings, setSettings] = useState<ProductSettings>({
    type: "productDetails",
    blocks: {
      images: [],
      video: {
        videoSrc: "",
        videoAlt: "",
      },
      name: "",
      description: "",
      category: {
        _id: "",
        name: "",
      },
      price: "0",
      status: "available",
      discount: "0",
      id: "1",
      properties: [],
      colors: [],
    },
  });

  const handleImageSelect = (image: ImageFile) => {
    console.log("Selected image:", image);
    setSettings((prev) => {
      if (prev.blocks.images.length >= 6) return prev;
      const newImages = [
        ...prev.blocks.images,
        {
          imageSrc: image.fileUrl,
          imageAlt: image.fileName || "Product image",
        },
      ];
      console.log("New images array:", newImages);
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          images: newImages,
        },
      };
    });
    clearError("images");
  };

  const removeImage = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        images: prev.blocks.images.filter((_, i) => i !== index),
      },
    }));
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setCategories(data);
    } catch {
      console.log("Error fetching categories");
      toast.error("خطا در دریافت دستهبندیها");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [newProperty, setNewProperty] = useState({ name: "", value: "" });
  const [newColor, setNewColor] = useState({ code: "#000", quantity: "" });
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [showColorsModal, setShowColorsModal] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (settings.blocks.colors.length === 0) {
      newErrors.colors = "حداقل یک رنگ باید اضافه شود";
    }
    if (settings.blocks.properties.length === 0) {
      newErrors.properties = "حداقل یک ویژگی باید اضافه شود";
    }

    if (!settings.blocks.name.trim()) {
      newErrors.name = "نام محصول الزامی است";
    }

    if (!settings.blocks.description.trim()) {
      newErrors.description = "توضیحات محصول الزامی است";
    }

    if (!settings.blocks.category._id) {
      newErrors.category = "انتخاب دستهبندی الزامی است";
    }

    if (!settings.blocks.price || Number(settings.blocks.price) <= 0) {
      newErrors.price = "قیمت باید بیشتر از صفر باشد";
    }

    if (settings.blocks.images.length === 0) {
      newErrors.images = "حداقل یک تصویر محصول الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (section: string, field: string, value: string) => {
    if (field === "category") {
      const selectedCategory = categories.find((cat) => cat._id === value);
      setSettings((prev) => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          category: selectedCategory || { _id: "", name: "" },
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          [field]: value,
        },
      }));
    }
  };

  const addProperty = () => {
    const propertyErrors: { [key: string]: string } = {};

    if (!newProperty.name.trim()) {
      propertyErrors.propertyName = "نام ویژگی الزامی است";
    }

    if (!newProperty.value.trim()) {
      propertyErrors.propertyValue = "مقدار ویژگی الزامی است";
    }

    const propertyExists = settings.blocks.properties.some(
      (prop) => prop.name.toLowerCase() === newProperty.name.toLowerCase()
    );
    if (propertyExists) {
      propertyErrors.propertyName = "این ویژگی قبلاً اضافه شده است";
    }

    if (Object.keys(propertyErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...propertyErrors }));
      toast.error("لطفاً اطلاعات ویژگی را صحیح وارد کنید");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        properties: [...prev.blocks.properties, newProperty],
      },
    }));
    setNewProperty({ name: "", value: "" });
    clearError("properties");
    clearError("propertyName");
    clearError("propertyValue");
  };

  const addColor = () => {
    const colorErrors: { [key: string]: string } = {};

    if (!newColor.code) {
      colorErrors.colorCode = "انتخاب رنگ الزامی است";
    }

    if (!newColor.quantity || Number(newColor.quantity) <= 0) {
      colorErrors.colorQuantity = "تعداد باید بیشتر از صفر باشد";
    }

    const colorExists = settings.blocks.colors.some(
      (color) => color.code === newColor.code
    );
    if (colorExists) {
      colorErrors.colorCode = "این رنگ قبلاً اضافه شده است";
    }

    if (Object.keys(colorErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...colorErrors }));
      toast.error("لطفاً اطلاعات رنگ را صحیح وارد کنید");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        colors: [...prev.blocks.colors, newColor],
      },
    }));
    setNewColor({ code: "#000000", quantity: "" });
    clearError("colors");
    clearError("colorCode");
    clearError("colorQuantity");
  };

  const removeColor = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        colors: prev.blocks.colors.filter((_, i) => i !== index),
      },
    }));
    toast.success("رنگ حذف شد");
  };

  const removeProperty = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        properties: prev.blocks.properties.filter((_, i) => i !== index),
      },
    }));
    toast.success("ویژگی حذف شد");
  };

  const PropertiesModal = () => (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50"
      dir="rtl"
    >
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
        <div className="sticky top-0 bg-slate-800 px-4 py-3 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white text-center">
            ویژگیهای اضافه شده
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {settings.blocks.properties.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              هیچ ویژگی اضافه نشده است
            </div>
          ) : (
            <div className="space-y-2">
              {settings.blocks.properties.map((prop, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg group transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-slate-800 text-sm truncate">
                      {prop.name}
                    </span>
                    <span className="text-slate-400">:</span>
                    <span className="text-slate-600 text-sm truncate">
                      {prop.value}
                    </span>
                  </div>
                  <button
                    onClick={() => removeProperty(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-all flex-shrink-0"
                    title="حذف ویژگی"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="18px"
                      fill="currentColor"
                    >
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3">
          <button
            onClick={() => setShowPropertiesModal(false)}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );

  const ColorsModal = () => (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50"
      dir="rtl"
    >
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
        <div className="sticky top-0 bg-slate-800 px-4 py-3 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white text-center">
            رنگهای اضافه شده
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {settings.blocks.colors.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              هیچ رنگی اضافه نشده است
            </div>
          ) : (
            <div className="space-y-2">
              {settings.blocks.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-200"
                      style={{ backgroundColor: color.code }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-700">
                        {color.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        تعداد: {color.quantity}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeColor(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-all flex-shrink-0"
                    title="حذف رنگ"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="18px"
                      viewBox="0 -960 960 960"
                      width="18px"
                      fill="currentColor"
                    >
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3">
          <button
            onClick={() => setShowColorsModal(false)}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );

  const storeId = localStorage.getItem("storeId");

  const handelSave = async () => {
    if (!validateForm()) {
      toast.error("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }
    try {
      const productData = {
        images: settings.blocks.images,
        video: settings.blocks.video,
        name: settings.blocks.name,
        description: settings.blocks.description,
        category: settings.blocks.category._id,
        price: settings.blocks.price,
        status: settings.blocks.status,
        discount: settings.blocks.discount,
        properties: settings.blocks.properties,
        colors: settings.blocks.colors,
        storeId: storeId,
      };
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success("محصول با موفقیت ایجاد شد");
        setSettings({
          type: "productDetails",
          blocks: {
            name: "",
            description: "",
            category: { _id: "", name: "" },
            price: "0",
            status: "available",
            discount: "0",
            id: "1",
            images: [],
            video: {
              videoSrc: "",
              videoAlt: "",
            },
            properties: [],
            colors: [],
          },
        });
        setErrors({});
      } else {
        toast.error("خطا در ایجاد محصول");
      }
    } catch (error) {
      toast.error("خطا در بروزرسانی محصول");
      console.log(error);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen   py-4 sm:py-6 mt-12 sm:mt-16">
      <div className="max-w-4xl mx-auto px-1 sm:px-4">
        <div
          className="backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6"
          dir="rtl"
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center">
              تنظیمات محصول
            </h2>
            <p className="text-slate-500 text-center text-xs sm:text-sm mt-1.5 pb-4 border-b border-slate-200">
              اطلاعات محصول خود را وارد کنید
            </p>
          </div>

          <div className="space-y-4">
            {/* Images Section */}
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block mb-3 text-slate-800 font-semibold text-sm sm:text-base">
                تصاویر محصول (حداکثر 6 تصویر) *
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                  onClick={() => {
                    setIsImageSelectorOpen(true);
                    clearError("images");
                  }}
                  disabled={settings.blocks.images.length >= 6}
                  className={`flex-1 px-3 py-2.5 text-sm rounded-lg font-medium transition-all ${
                    settings.blocks.images.length >= 6
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  انتخاب تصویر ({settings.blocks.images.length}/6)
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2.5 text-sm rounded-lg font-medium transition-all"
                >
                  آپلود تصویر
                </button>
              </div>

              {settings.blocks.images.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    {settings.blocks.images.length} تصویر انتخاب شده
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {settings.blocks.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image.imageSrc}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-md border border-slate-200 transition-transform group-hover:scale-105"
                          onLoad={() =>
                            console.log(
                              "Image loaded successfully:",
                              image.imageSrc
                            )
                          }
                          onError={(e) => {
                            console.log(
                              "Image failed to load:",
                              image.imageSrc
                            );
                            e.currentTarget.style.backgroundColor = "#f1f5f9";
                          }}
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.images && (
                <p className="text-red-500 text-xs mt-2">{errors.images}</p>
              )}
            </div>

            {/* Name & Properties */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block mb-2 font-semibold text-slate-800 text-sm">
                  نام محصول *
                </label>
                <input
                  type="text"
                  value={settings.blocks.name}
                  onChange={(e) => {
                    handleChange("blocks", "name", e.target.value);
                    clearError("name");
                  }}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all ${
                    errors.name ? "border-red-500" : "border-slate-200"
                  }`}
                  placeholder="نام محصول را وارد کنید"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Properties */}
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block mb-2 font-semibold text-slate-800 text-sm">
                  افزودن ویژگی *
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="نام ویژگی"
                      value={newProperty.name}
                      onChange={(e) => {
                        setNewProperty({
                          ...newProperty,
                          name: e.target.value,
                        });
                        clearError("propertyName");
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all ${
                        errors.propertyName
                          ? "border-red-500"
                          : "border-slate-200"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="مقدار"
                      value={newProperty.value}
                      onChange={(e) => {
                        setNewProperty({
                          ...newProperty,
                          value: e.target.value,
                        });
                        clearError("propertyValue");
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all ${
                        errors.propertyValue
                          ? "border-red-500"
                          : "border-slate-200"
                      }`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={addProperty}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-all text-sm font-medium"
                      data-tooltip-id="add-property"
                      data-tooltip-content="افزودن ویژگی جدید"
                    >
                      افزودن
                    </button>
                    {settings.blocks.properties.length > 0 && (
                      <button
                        onClick={() => setShowPropertiesModal(true)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all text-sm font-medium"
                        data-tooltip-id="view-properties"
                        data-tooltip-content="مشاهده ویژگیها"
                      >
                        مشاهده ({settings.blocks.properties.length})
                      </button>
                    )}
                  </div>
                  {errors.properties && (
                    <p className="text-red-500 text-xs">{errors.properties}</p>
                  )}
                </div>
              </div>
            </div>
            {/* Category & Status */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-slate-800 text-sm">
                    دسته بندی *
                  </label>
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    + افزودن
                  </button>
                </div>
                <select
                  value={settings.blocks.category._id}
                  onChange={(e) => {
                    handleChange("blocks", "category", e.target.value);
                    clearError("category");
                  }}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all appearance-none bg-white ${
                    errors.category ? "border-red-500" : "border-slate-200"
                  }`}
                >
                  <option value="">انتخاب دسته بندی</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block mb-2 font-semibold text-slate-800 text-sm">
                  وضعیت
                </label>
                <select
                  value={settings.blocks.status}
                  onChange={(e) =>
                    handleChange("blocks", "status", e.target.value)
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all appearance-none bg-white"
                >
                  <option value="available">موجود</option>
                  <option value="unavailable">ناموجود</option>
                </select>
              </div>
            </div>
            {/* Description */}
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <label className="font-semibold text-slate-800 text-sm">
                  توضیحات *
                </label>
                <div
                  data-tooltip-id="ai-generator"
                  data-tooltip-content={
                    !settings.blocks.name.trim() ||
                    !settings.blocks.category.name.trim() ||
                    settings.blocks.properties.length === 0
                      ? "لطفاً ابتدا نام، دسته‌بندی و ویژگی‌ها را وارد کنید"
                      : "ایجاد توضیحات با هوش مصنوعی"
                  }
                >
                  <AIDescriptionGenerator
                    productData={{
                      name: settings.blocks.name,
                      category: settings.blocks.category.name,
                      properties: settings.blocks.properties.reduce(
                        (acc, prop) => {
                          acc[prop.name] = prop.value;
                          return acc;
                        },
                        {} as Record<string, unknown>
                      ),
                    }}
                    onDescriptionGenerated={(description) => {
                      handleChange("blocks", "description", description);
                      clearError("description");
                    }}
                  />
                </div>
              </div>
              <textarea
                value={settings.blocks.description}
                onChange={(e) => {
                  handleChange("blocks", "description", e.target.value);
                  clearError("description");
                }}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all min-h-[100px] resize-none ${
                  errors.description ? "border-red-500" : "border-slate-200"
                }`}
                placeholder="توضیحات محصول را وارد کنید"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Colors */}
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block mb-3 font-semibold text-slate-800 text-sm">
                افزودن رنگ *
              </label>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-600 mb-1">رنگ</span>
                    <input
                      type="color"
                      value={newColor.code}
                      onChange={(e) => {
                        setNewColor({ ...newColor, code: e.target.value });
                        clearError("colorCode");
                      }}
                      className={`w-12 h-10 rounded-lg cursor-pointer border-2 ${
                        errors.colorCode ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-slate-600 mb-1 block">
                      تعداد
                    </span>
                    <input
                      type="number"
                      placeholder="تعداد"
                      value={newColor.quantity}
                      onChange={(e) => {
                        setNewColor({ ...newColor, quantity: e.target.value });
                        clearError("colorQuantity");
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all ${
                        errors.colorQuantity
                          ? "border-red-500"
                          : "border-slate-200"
                      }`}
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addColor}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
                    data-tooltip-id="add-color"
                    data-tooltip-content="افزودن رنگ جدید"
                  >
                    افزودن
                  </button>
                  {settings.blocks.colors.length > 0 && (
                    <button
                      onClick={() => setShowColorsModal(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all text-sm font-medium whitespace-nowrap"
                      data-tooltip-id="view-colors"
                      data-tooltip-content="مشاهده رنگها"
                    >
                      مشاهده ({settings.blocks.colors.length})
                    </button>
                  )}
                </div>
              </div>
              {errors.colors && (
                <p className="text-red-500 text-xs mt-2">{errors.colors}</p>
              )}
            </div>

            {/* Price & Discount */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block mb-2 font-semibold text-slate-800 text-sm">
                  قیمت (تومان) *
                </label>
                <input
                  type="text"
                  value={
                    settings.blocks.price
                      ? Number(settings.blocks.price).toLocaleString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(value)) {
                      handleChange("blocks", "price", value);
                      clearError("price");
                    }
                  }}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all ${
                    errors.price ? "border-red-500" : "border-slate-200"
                  }`}
                  placeholder="0"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.price}</p>
                )}
                {Number(settings.blocks.price) > 0 &&
                  Number(settings.blocks.discount) > 0 && (
                    <div className="mt-3 bg-white rounded-lg p-3 border border-slate-200">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">قیمت با تخفیف:</span>
                          <span className="font-semibold text-green-600">
                            {(
                              Number(settings.blocks.price) *
                              (1 - Number(settings.blocks.discount) / 100)
                            ).toLocaleString()}{" "}
                            تومان
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">میزان تخفیف:</span>
                          <span className="font-semibold text-red-500">
                            {(
                              Number(settings.blocks.price) *
                              (Number(settings.blocks.discount) / 100)
                            ).toLocaleString()}{" "}
                            تومان
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block mb-2 font-semibold text-slate-800 text-sm">
                  تخفیف (%)
                </label>
                <input
                  dir="rtl"
                  type="range"
                  value={settings.blocks.discount}
                  onChange={(e) =>
                    handleChange("blocks", "discount", e.target.value)
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
                  style={{
                    background: `linear-gradient(to left, #0077b6 ${settings.blocks.discount}%, #e2e8f0 ${settings.blocks.discount}%)`,
                  }}
                  max={100}
                  min={0}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-slate-500">0%</span>
                  <span className="inline-block px-3 py-1.5 bg-slate-800 text-white rounded-full text-sm font-semibold">
                    {settings.blocks.discount}%
                  </span>
                  <span className="text-xs text-slate-500">100%</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handelSave}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm sm:text-base font-semibold py-3 rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-slate-300 shadow-sm hover:shadow-md"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImageSelectorModal
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelectImage={handleImageSelect}
      />

      {isUploadModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3"
          dir="rtl"
        >
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-3 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">آپلود تصویر</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-3">
              <UploadPage />
            </div>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3"
          dir="rtl"
        >
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                افزودن دسته بندی
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <CategoryForm
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={() => {
                  setIsCategoryModalOpen(false);
                  fetchCategories();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showPropertiesModal && <PropertiesModal />}
      {showColorsModal && <ColorsModal />}

      <Tooltip id="add-property" place="top" />
      <Tooltip id="view-properties" place="top" />
      <Tooltip id="add-color" place="top" />
      <Tooltip id="view-colors" place="top" />
      <Tooltip id="ai-generator" place="top" />
    </div>
  );
};
