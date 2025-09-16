"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip"; // Add this import
import ImageSelectorModal from "./ImageSelectorModal";
import { ProductSettings } from "@/types/type";
import { AIDescriptionGenerator } from "./AIDescriptionGenerator";


interface StartComponentProps {
  setSelectedMenu: (menu: string) => void;
}

export const ProductsSettings: React.FC<StartComponentProps> = ({ setSelectedMenu }) => {
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const handleImageSelect = (image: { fileUrl: string }, index: number) => {
    setSettings((prev) => {
      const newImages = [...prev.blocks.images];
      newImages[index] = { imageSrc: image.fileUrl, imageAlt: "" };
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          images: newImages,
        },
      };
    });
    clearError("images");
    setIsImageSelectorOpen(false);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.log(error);
        toast.error("خطا در دریافت دسته‌بندی‌ها");
      }
    };

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
      newErrors.category = "انتخاب دسته‌بندی الزامی است";
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

  const handleImageChange = (index: number, field: string, value: string) => {
    setSettings((prev) => {
      const newImages = [...prev.blocks.images];
      newImages[index] = { ...newImages[index], [field]: value };
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          images: newImages,
        },
      };
    });
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      dir="rtl"
    >
      <div className="bg-white/50 backdrop-blur-sm border border-[#0077b6] p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white border-b pb-2 text-center mb-4">
          ویژگی‌های اضافه شده
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
          رنگ‌های اضافه شده
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
    <div className="min-h-screen bg-gradient-to-br py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-4" dir="rtl">
          {/* Header */}
          <div className="mb-8 ">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent">
              تنظیمات محصول
            </h2>
            <p className="text-gray-500 text-center border-b pb-4 mt-2">
              اطلاعات محصول خود را وارد کنید.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div className="lg:col-span-2 space-y-6 p-6 bg-[#0077b6]/5 rounded-xl">
              <div>
                <label className="block mb-4 text-[#0077b6] font-bold text-xl">
                  تصاویر محصول (حداکثر 6 تصویر) *
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsImageSelectorOpen(true);
                      clearError("image");
                    }}
                    className="bg-white text-[#0077b6] border text-nowrap border-blue-200 px-4 py-2 rounded-xl"
                  >
                    انتخاب تصویر
                  </button>
                  <button
                    onClick={() => setSelectedMenu("addFile")}
                    className="bg-[#0077b6] text-white border text-nowrap border-blue-200 px-4 py-2 rounded-xl"
                  >
                    آپلود تصویر
                  </button>
                </div>
                {errors.images && (
                  <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                )}
              </div>

              {/* Video Section */}
              <div className="space-y-3">
                <label className="block mb-2 font-bold text-[#0077b6]">
                  ویدیو محصول (اختیاری)
                </label>
                <input
                  type="text"
                  value={settings.blocks.video?.videoSrc || ""}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      blocks: { 
                        ...prev.blocks, 
                        video: {
                          ...prev.blocks.video,
                          videoSrc: e.target.value
                        }
                      }
                    }));
                  }}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  placeholder="آدرس ویدیو محصول"
                  dir="rtl"
                />
                <input
                  type="text"
                  value={settings.blocks.video?.videoAlt || ""}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      blocks: { 
                        ...prev.blocks, 
                        video: {
                          ...prev.blocks.video,
                          videoAlt: e.target.value
                        }
                      }
                    }));
                  }}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  placeholder="متن جایگزین ویدیو"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="space-y-6 p-6 bg-[#0077b6]/5 rounded-xl">
              <div>
                <label className="block mb-2 font-bold text-[#0077b6]">
                  نام محصول *
                </label>
                <input
                  type="text"
                  value={settings.blocks.name}
                  onChange={(e) => {
                    handleChange("blocks", "name", e.target.value);
                    clearError("name");
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
                    errors.name ? "border-red-500" : "border-blue-200"
                  }`}
                  placeholder="نام محصول را وارد کنید"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-bold text-[#0077b6]">
                    توضیحات *
                  </label>
                  <AIDescriptionGenerator
                    productData={{
                      name: settings.blocks.name,
                      category: settings.blocks.category.name,
                      colors: settings.blocks.colors.map(c => c.code),
                      properties: settings.blocks.properties.reduce((acc, prop) => {
                        acc[prop.name] = prop.value;
                        return acc;
                      }, {} as Record<string, any>)
                    }}
                    onDescriptionGenerated={(description) => {
                      handleChange("blocks", "description", description);
                      clearError("description");
                    }}
                  />
                </div>
                <textarea
                  value={settings.blocks.description}
                  onChange={(e) => {
                    handleChange("blocks", "description", e.target.value);
                    clearError("description");
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all min-h-[120px] ${
                    errors.description ? "border-red-500" : "border-blue-200"
                  }`}
                  placeholder="توضیحات محصول را وارد کنید"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Category & Status Section */}
            <div className="lg:col-span-2 grid lg:grid-cols-2 gap-6">
              <div className="p-6 bg-[#0077b6]/5 rounded-xl">
                <label className="block mb-2 font-bold text-[#0077b6]">
                  دسته بندی *
                </label>
                <button
                 onClick={() => setSelectedMenu("addCategory")}
                className="bg-[#0077b6] text-white border text-nowrap border-blue-200 px-4 py-2 rounded-xl mb-2"
                >افزودن دسته بندی</button>
                <select
                  value={settings.blocks.category._id}
                  onChange={(e) => {
                    handleChange("blocks", "category", e.target.value);
                    clearError("category");
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all appearance-none ${
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
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <div className="p-6 bg-[#0077b6]/5 rounded-xl">
                <label className="block mb-2 font-bold text-[#0077b6]">
                  وضعیت
                </label>
                <select
                  value={settings.blocks.status}
                  onChange={(e) =>
                    handleChange("blocks", "status", e.target.value)
                  }
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all appearance-none"
                >
                  <option value="available">موجود</option>
                  <option value="unavailable">ناموجود</option>
                </select>
              </div>
            </div>
            {/* Color Selection Section */}
            <div className="lg:col-span-2 p-6 bg-[#0077b6]/5 rounded-xl">
              <h3 className="text-[#0077b6] font-bold text-xl mb-4">
                افزودن رنگ *
              </h3>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative">
                  <input
                    type="color"
                    value={newColor.code}
                    onChange={(e) => {
                      setNewColor({ ...newColor, code: e.target.value });
                      clearError("colorCode");
                    }}
                    className={`w-[3.5rem] mt-2 h-[3.5rem] rounded-2xl cursor-pointer transition-transform hover:scale-110 focus:outline-none ${
                      errors.colorCode ? "ring-2 ring-red-500" : ""
                    }`}
                    style={{ padding: 0 }}
                  />
                  {errors.colorCode && (
                    <p className="text-red-500 text-xs mt-1 absolute whitespace-nowrap">
                      {errors.colorCode}
                    </p>
                  )}
                </div>

                <div className="flex-1 max-w-xs">
                  <input
                    type="number"
                    placeholder="تعداد"
                    value={newColor.quantity}
                    onChange={(e) => {
                      setNewColor({ ...newColor, quantity: e.target.value });
                      clearError("colorQuantity");
                    }}
                    className={`w-full p-3 rounded-lg transition-all border ${
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

                <div className="flex gap-2">
                  <button
                    onClick={addColor}
                    className="bg-[#0077b6] hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105"
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
                      data-tooltip-content="مشاهده رنگ‌ها"
                      onClick={() => setShowColorsModal(true)}
                      className="bg-[#0077b6] hover:bg-blue-700 text-white px-4 py-2 flex items-center rounded-lg gap-2 transition-all duration-300 transform hover:scale-105"
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
                        ({settings.blocks.colors.length})
                      </span>
                    </button>
                  )}
                </div>
              </div>
              {errors.colors && (
                <p className="text-red-500 text-sm mt-2">{errors.colors}</p>
              )}
            </div>

            {/* Properties Section */}
            <div className="lg:col-span-2 p-6 bg-[#0077b6]/5 rounded-xl">
              <h3 className="text-[#0077b6] font-bold text-xl mb-4">
                افزودن ویژگی *
              </h3>

              <div className="flex gap-4 flex-wrap w-full">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="نام ویژگی"
                    value={newProperty.name}
                    onChange={(e) => {
                      setNewProperty({ ...newProperty, name: e.target.value });
                      clearError("propertyName");
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
                      errors.propertyName ? "border-red-500" : "border-blue-200"
                    }`}
                  />
                  {errors.propertyName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.propertyName}
                    </p>
                  )}
                </div>

                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="مقدار"
                    value={newProperty.value}
                    onChange={(e) => {
                      setNewProperty({ ...newProperty, value: e.target.value });
                      clearError("propertyValue");
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
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

                <div className="flex gap-2">
                  <button
                    onClick={addProperty}
                    className="bg-[#0077b6] hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105"
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
                  </button>

                  {settings.blocks.properties.length > 0 && (
                    <button
                      data-tooltip-id="view-properties"
                      data-tooltip-content="مشاهده ویژگی‌ها"
                      onClick={() => setShowPropertiesModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 flex items-center py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                      data-tip="مشاهده ویژگی‌های اضافه شده"
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
                      <span className="mr-2">
                        ({settings.blocks.properties.length})
                      </span>
                    </button>
                  )}
                </div>
              </div>
              {errors.properties && (
                <p className="text-red-500 text-sm mt-2">{errors.properties}</p>
              )}
            </div>

            {/* Price & Discount Section */}
            <div className="lg:col-span-2 grid lg:grid-cols-2 gap-6">
              <div className="relative p-6 bg-[#0077b6]/5 rounded-xl">
                <label className="block mb-2 font-bold text-[#0077b6]">
                  قیمت *
                </label>
                <input
                  type="number"
                  value={settings.blocks.price}
                  onChange={(e) => {
                    handleChange("blocks", "price", e.target.value);
                    clearError("price");
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all ${
                    errors.price ? "border-red-500" : "border-blue-200"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
                {Number(settings.blocks.price) > 0 &&
                  Number(settings.blocks.discount) > 0 && (
                    <div className="absolute left-6 top-20 bg-white shadow-lg rounded-xl p-4 border border-blue-100">
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

              <div className="p-6 bg-[#0077b6]/5 rounded-xl">
                <label className="block mb-2 font-bold text-[#0077b6]">
                  تخفیف
                </label>
                <div className="space-y-2">
                  <input
                    dir="rtl"
                    type="range"
                    value={settings.blocks.discount}
                    onChange={(e) =>
                      handleChange("blocks", "discount", e.target.value)
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                    style={{
                      background: `linear-gradient(to left, #0077b6 ${settings.blocks.discount}%, #fff ${settings.blocks.discount}%)`,
                    }}
                    max={100}
                    min={0}
                  />
                  <span className="inline-block px-3 py-1 text-[#0077b6] rounded-full text-sm font-medium">
                    {settings.blocks.discount}%
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="lg:col-span-2 mt-8">
              <button
                onClick={handelSave}
                className="w-full bg-[#0077b6]/50 hover:bg-[#0077b6] text-white text-lg font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-200"
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
        onSelectImage={(image) => handleImageSelect(image, currentImageIndex)}
      />

      <ToastContainer rtl={true} position="top-center" autoClose={3000} />
      {showPropertiesModal && <PropertiesModal />}
      {showColorsModal && <ColorsModal />}
      <Tooltip id="add-property" place="top" />
      <Tooltip id="view-properties" place="top" />
      <Tooltip id="add-color" place="top" />
      <Tooltip id="view-colors" place="top" />
    </div>
  );
};
