"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip"; // Add this import
import ImageSelectorModal from "./ImageSelectorModal";
import { ProductSettings, ImageFile } from "@/types/type";
import { AIDescriptionGenerator } from "./AIDescriptionGenerator";
import UploadPage from "./uploads";


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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 font-medium text-gray-700">نام دسته بندی</label>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all"
          placeholder="نام دسته بندی را وارد کنید"
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[#0077b6] hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
        >
          {loading ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </form>
  );
};

export const ProductsSettings: React.FC<StartComponentProps> = ({  }) => {
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
    console.log('Selected image:', image);
    setSettings((prev) => {
      if (prev.blocks.images.length >= 6) return prev;
      const newImages = [...prev.blocks.images, { 
        imageSrc: image.fileUrl, 
        imageAlt: image.fileName || "Product image" 
      }];
      console.log('New images array:', newImages);
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

    // Color validation
    if (settings.blocks.colors.length === 0) {
      newErrors.colors = "حداقل یک رنگ باید اضافه شود";
    }
    // Properties validation
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


  // add property
  const addProperty = () => {
    const propertyErrors: { [key: string]: string } = {};

    if (!newProperty.name.trim()) {
      propertyErrors.propertyName = "نام ویژگی الزامی است";
    }

    if (!newProperty.value.trim()) {
      propertyErrors.propertyValue = "مقدار ویژگی الزامی است";
    }

    // Check if property already exists
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
  //  Add Color
  const addColor = () => {
    const colorErrors: { [key: string]: string } = {};

    if (!newColor.code) {
      colorErrors.colorCode = "انتخاب رنگ الزامی است";
    }

    if (!newColor.quantity || Number(newColor.quantity) <= 0) {
      colorErrors.colorQuantity = "تعداد باید بیشتر از صفر باشد";
    }

    // Check if color already exists
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
  // This function removes a color from the list of colors
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
  // This function removes a property from the list of properties
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
  // This modal displays the list of added properties
  const PropertiesModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center mt-5 z-50"
      dir="rtl"
    >
      <div className="bg-white/50 backdrop-blur-sm border border-[#0077b6] p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white border-b pb-2 text-center mb-4">
          ویژگیهای اضافه شده
        </h3>
        {settings.blocks.properties.length === 0 ? (
          <div className="text-center text-red-500 py-4">
            هیچ ویژگی اضافه نشده است
          </div>
        ) : (
          settings.blocks.properties.map((prop, index) => (
            <div
              key={index}
              className="flex justify-between items-center mb-2 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">{prop.name}</span>
                    <span className="text-base text-gray-400">↔</span>
                    <span className="text-gray-600">{prop.value}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeProperty(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200 mr-2"
                title="حذف ویژگی"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="currentColor"
                >
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </button>
            </div>
          ))
        )}
        <button
          onClick={() => setShowPropertiesModal(false)}
          className="mt-4 w-full bg-rose-600 hover:bg-rose-700 font-bold text-white py-2 rounded-xl transition-colors"
        >
          بستن
        </button>
      </div>
    </div>
  );
  // colors modal
  const ColorsModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      dir="rtl"
    >
      <div className="bg-white/50 backdrop-blur-sm border border-[#0077b6] p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white border-b pb-2 text-center mb-4">
          رنگهای اضافه شده
        </h3>
        {settings.blocks.colors.length === 0 ? (
          <div className="text-center text-gray-300 py-4">
            هیچ رنگی اضافه نشده است
          </div>
        ) : (
          settings.blocks.colors.map((color, index) => (
            <div
              key={index}
              className="flex justify-between items-center mb-2 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: color.code }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {color.code}
                  </span>
                  <span className="text-xs text-gray-500">
                    تعداد: {color.quantity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeColor(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200"
                title="حذف رنگ"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="currentColor"
                >
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </button>
            </div>
          ))
        )}
        <button
          onClick={() => setShowColorsModal(false)}
          className="mt-4 w-full bg-rose-600 hover:bg-rose-700 font-bold text-white py-2 rounded-xl transition-colors"
        >
          بستن
        </button>
      </div>
    </div>
  );

  const storeId = localStorage.getItem("storeId");
  // save product function
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
        category: settings.blocks.category._id, // This will now correctly send the category ID
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
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add this line
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success("محصول با موفقیت ایجاد شد");
        // Reset form after successful save
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
  // error clearing function
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
    <div className="min-h-screen bg-gradient-to-br py-1 sm:py-2 mt-4  pt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-2">
        <div className="bg-white rounded-2xl p-1 sm:p-1" dir="rtl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent">
              تنظیمات محصول
            </h2>
            <p className="text-gray-500 text-center border-b pb-4 mt-2 text-sm sm:text-base">
              اطلاعات محصول خود را وارد کنید.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Images Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
              <div>
                <label className="block mb-4 text-[#0077b6] font-bold text-lg sm:text-xl">
                  تصاویر محصول (حداکثر 6 تصویر) *
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <button
                    onClick={() => {
                      setIsImageSelectorOpen(true);
                      clearError("images");
                    }}
                    disabled={settings.blocks.images.length >= 6}
                    className={`flex-1 sm:flex-none px-4 py-3 rounded-xl font-medium transition-all ${
                      settings.blocks.images.length >= 6
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-[#0077b6] border-2 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    انتخاب تصویر ({settings.blocks.images.length}/6)
                  </button>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex-1 sm:flex-none bg-[#0077b6] hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all"
                  >
                    آپلود تصویر
                  </button>
                </div>
                
                {/* Display Selected Images */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">تعداد تصاویر انتخاب شده: {settings.blocks.images.length}</p>
                  {settings.blocks.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {settings.blocks.images.map((image, index) => {
                        console.log('Rendering image:', image.imageSrc);
                        return (
                          <div key={index} className="relative group aspect-square">
                            <img
                              src={image.imageSrc}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border-2 border-blue-200 transition-transform group-hover:scale-105"
                              onLoad={() => console.log('Image loaded successfully:', image.imageSrc)}
                              onError={(e) => {
                                console.log('Image failed to load:', image.imageSrc);
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.display = 'flex';
                                e.currentTarget.style.alignItems = 'center';
                                e.currentTarget.style.justifyContent = 'center';
                                e.currentTarget.innerHTML = 'خطا در بارگیری';
                              }}
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {errors.images && (
                  <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                )}
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
                <div>
                  <label className="block mb-3 font-bold text-[#0077b6] text-lg">
                    نام محصول *
                  </label>
                  <input
                    type="text"
                    value={settings.blocks.name}
                    onChange={(e) => {
                      handleChange("blocks", "name", e.target.value);
                      clearError("name");
                    }}
                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
                      errors.name ? "border-red-500" : "border-blue-200"
                    }`}
                    placeholder="نام محصول را وارد کنید"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Properties Section */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-[#0077b6] font-bold text-lg sm:text-xl mb-4">
                  افزودن ویژگی *
                </h3>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">نام ویژگی</label>
                      <input
                        type="text"
                        placeholder="نام ویژگی"
                        value={newProperty.name}
                        onChange={(e) => {
                          setNewProperty({ ...newProperty, name: e.target.value });
                          clearError("propertyName");
                        }}
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
                          errors.propertyName ? "border-red-500" : "border-blue-200"
                        }`}
                      />
                      {errors.propertyName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.propertyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">مقدار</label>
                      <input
                        type="text"
                        placeholder="مقدار"
                        value={newProperty.value}
                        onChange={(e) => {
                          setNewProperty({ ...newProperty, value: e.target.value });
                          clearError("propertyValue");
                        }}
                        className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
                          errors.propertyValue
                            ? "border-red-500"
                            : "border-blue-200"
                        }`}
                      />
                      {errors.propertyValue && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.propertyValue}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={addProperty}
                      className="flex-1 sm:flex-none bg-[#0077b6] hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                      data-tooltip-id="add-property"
                      data-tooltip-content="افزودن ویژگی جدید"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="white"
                      >
                        <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Z" />
                      </svg>
                      <span className="font-medium">افزودن</span>
                    </button>

                    {settings.blocks.properties.length > 0 && (
                      <button
                        data-tooltip-id="view-properties"
                        data-tooltip-content="مشاهده ویژگیها"
                        onClick={() => setShowPropertiesModal(true)}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 flex items-center justify-center rounded-xl gap-2 transition-all duration-300 transform hover:scale-105"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#ffffff"
                        >
                          <path d="M120-280v-80h560v80H120Zm0-160v-80h560v80H120Zm0-160v-80h560v80H120Zm680 320q-17 0-28.5-11.5T760-320q0-17 11.5-28.5T800-360q17 0 28.5 11.5T840-320q0 17-11.5 28.5T800-280Zm0-160q-17 0-28.5-11.5T760-480q0-17 11.5-28.5T800-520q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440Zm0-160q-17 0-28.5-11.5T760-640q0-17 11.5-28.5T800-680q17 0 28.5 11.5T840-640q0 17-11.5 28.5T800-600Z" />
                        </svg>
                        <span className="font-medium">
                          مشاهده ({settings.blocks.properties.length})
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                {errors.properties && (
                  <p className="text-red-500 text-sm mt-3">{errors.properties}</p>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <label className="block font-bold text-[#0077b6] text-lg">
                  توضیحات *
                </label>
                <div 
                  data-tooltip-id="ai-generator"
                  data-tooltip-content={
                    !settings.blocks.name.trim() || !settings.blocks.category.name.trim() || settings.blocks.properties.length === 0
                      ? `برای عملکرد بهتر هوش مصنوعی، لطفاً ابتدا ${[
                          !settings.blocks.name.trim() && "نام محصول",
                          !settings.blocks.category.name.trim() && "دسته بندی",
                          settings.blocks.properties.length === 0 && "ویژگیها"
                        ].filter(Boolean).join("، ")} را وارد کنید`
                      : "ایجاد توضیحات با هوش مصنوعی"
                  }
                >
                  <AIDescriptionGenerator
                    productData={{
                      name: settings.blocks.name,
                      category: settings.blocks.category.name,
                      properties: settings.blocks.properties.reduce((acc, prop) => {
                        acc[prop.name] = prop.value;
                        return acc;
                      }, {} as Record<string, unknown>)
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
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all min-h-[120px] resize-none ${
                  errors.description ? "border-red-500" : "border-blue-200"
                }`}
                placeholder="توضیحات محصول را وارد کنید"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category & Status Section */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-4">
                  <label className="block mb-3 font-bold text-[#0077b6] text-lg">
                  دسته بندی *
                </label>  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="w-full sm:w-auto bg-[#0077b6] hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all"
                  >
                    افزودن دسته بندی
                  </button>
              </div>
                <div className="space-y-3">
                
                  <select
                    value={settings.blocks.category._id}
                    onChange={(e) => {
                      handleChange("blocks", "category", e.target.value);
                      clearError("category");
                    }}
                    className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all appearance-none bg-white ${
                      errors.category ? "border-red-500" : "border-blue-200"
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
                    <p className="text-red-500 text-sm mt-2">{errors.category}</p>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
                <label className="block mb-3 font-bold text-[#0077b6] text-lg">
                  وضعیت
                </label>
                <select
                  value={settings.blocks.status}
                  onChange={(e) =>
                    handleChange("blocks", "status", e.target.value)
                  }
                  className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all appearance-none bg-white"
                >
                  <option value="available">موجود</option>
                  <option value="unavailable">ناموجود</option>
                </select>
              </div>
            </div>

            {/* Color Selection Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-[#0077b6] font-bold text-lg sm:text-xl mb-4">
                افزودن رنگ *
              </h3>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                <div className="flex flex-col items-center">
                  <label className="text-sm text-gray-600 mb-2">انتخاب رنگ</label>
                  <input
                    type="color"
                    value={newColor.code}
                    onChange={(e) => {
                      setNewColor({ ...newColor, code: e.target.value });
                      clearError("colorCode");
                    }}
                    className={`w-16 h-16 rounded-2xl cursor-pointer transition-transform hover:scale-110 focus:outline-none border-4 border-white shadow-lg ${
                      errors.colorCode ? "ring-2 ring-red-500" : ""
                    }`}
                    style={{ padding: 0 }}
                  />
                  {errors.colorCode && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors.colorCode}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-sm text-gray-600 mb-2 block">تعداد</label>
                  <input
                    type="number"
                    placeholder="تعداد"
                    value={newColor.quantity}
                    onChange={(e) => {
                      setNewColor({ ...newColor, quantity: e.target.value });
                      clearError("colorQuantity");
                    }}
                    className={`w-full p-4 rounded-xl transition-all border-2 ${
                      errors.colorQuantity
                        ? "border-red-500"
                        : "border-blue-200"
                    }`}
                    min="1"
                  />
                  {errors.colorQuantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.colorQuantity}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={addColor}
                    className="bg-[#0077b6] hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    data-tooltip-id="add-color"
                    data-tooltip-content="افزودن رنگ جدید"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="white"
                    >
                      <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Z" />
                    </svg>
                  </button>

                  {settings.blocks.colors.length > 0 && (
                    <button
                      data-tooltip-id="view-colors"
                      data-tooltip-content="مشاهده رنگها"
                      onClick={() => setShowColorsModal(true)}
                      className="bg-[#0077b6] hover:bg-blue-700 text-white px-4 py-4 flex items-center rounded-xl gap-2 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#ffffff"
                      >
                        <path d="M120-280v-80h560v80H120Zm0-160v-80h560v80H120Zm0-160v-80h560v80H120Zm680 320q-17 0-28.5-11.5T760-320q0-17 11.5-28.5T800-360q17 0 28.5 11.5T840-320q0 17-11.5 28.5T800-280Zm0-160q-17 0-28.5-11.5T760-480q0-17 11.5-28.5T800-520q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440Zm0-160q-17 0-28.5-11.5T760-640q0-17 11.5-28.5T800-680q17 0 28.5 11.5T840-640q0 17-11.5 28.5T800-600Z" />
                      </svg>
                      <span className="font-medium hidden sm:inline">
                        ({settings.blocks.colors.length})
                      </span>
                    </button>
                  )}
                </div>
              </div>
              {errors.colors && (
                <p className="text-red-500 text-sm mt-3">{errors.colors}</p>
              )}
            </div>



            {/* Price & Discount Section */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
                <label className="block mb-3 font-bold text-[#0077b6] text-lg">
                  قیمت *
                </label>
                <input
                  type="text"
                  value={settings.blocks.price ? Number(settings.blocks.price).toLocaleString() : ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(value)) {
                      handleChange("blocks", "price", value);
                      clearError("price");
                    }
                  }}
                  className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
                    errors.price ? "border-red-500" : "border-blue-200"
                  }`}
                  placeholder="قیمت به تومان"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-2">{errors.price}</p>
                )}
                {Number(settings.blocks.price) > 0 &&
                  Number(settings.blocks.discount) > 0 && (
                    <div className="mt-4 bg-white shadow-lg rounded-xl p-4 border border-blue-100">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            قیمت با تخفیف:
                          </span>
                          <span className="font-bold text-green-500">
                            {(
                              Number(settings.blocks.price) *
                              (1 - Number(settings.blocks.discount) / 100)
                            ).toLocaleString()}{" "}
                            تومان
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            میزان تخفیف:
                          </span>
                          <span className="font-bold text-red-500">
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

              <div className="p-4 sm:p-6 bg-gradient-to-br from-[#0077b6]/5 to-blue-50 rounded-xl border border-blue-100">
                <label className="block mb-3 font-bold text-[#0077b6] text-lg">
                  تخفیف
                </label>
                <div className="space-y-4">
                  <input
                    dir="rtl"
                    type="range"
                    value={settings.blocks.discount}
                    onChange={(e) =>
                      handleChange("blocks", "discount", e.target.value)
                    }
                    className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer"
                    style={{
                      background: `linear-gradient(to left, #0077b6 ${settings.blocks.discount}%, #e5e7eb ${settings.blocks.discount}%)`,
                    }}
                    max={100}
                    min={0}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">0%</span>
                    <span className="inline-block px-4 py-2 bg-[#0077b6] text-white rounded-full text-lg font-bold">
                      {settings.blocks.discount}%
                    </span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 sm:mt-8">
              <button
                onClick={handelSave}
                className="w-full bg-gradient-to-r from-[#0077b6] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold py-4 sm:py-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl"
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      </div>
      <ImageSelectorModal
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelectImage={handleImageSelect}
      />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 scrollbar-hide" dir="rtl">
          <div className="bg-white rounded-2xl p-2 w-full max-w-md  max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex flex-row-reverse items-center ">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 text-2xl hover:text-gray-700 p-2"
              >
                ×
              </button>
            </div>
            <UploadPage />
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0077b6]">افزودن دسته بندی</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                ×
              </button>
            </div>
            <CategoryForm 
              onClose={() => setIsCategoryModalOpen(false)} 
              onSuccess={() => {
                setIsCategoryModalOpen(false);
                fetchCategories();
              }}
            />
          </div>
        </div>
      )}

      <ToastContainer rtl={true} position="top-center" autoClose={3000} />
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