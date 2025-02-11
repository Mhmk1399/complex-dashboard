"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip"; // Add this import

interface ProductSettings {
  type: string;
  blocks: {
    images: {
      imageSrc: string;
      imageAlt: string;
    };
    properties: {
      name: string;
      value: string;
    }[];
    colors: {
      code: string;
      quantity: string;
    }[];

    name: string;
    description: string;
    category: { _id: string; name: string };
    price: string;
    status: string;
    discount: string;
    id: string;
  };
}

export const ProductsSettings = () => {
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [settings, setSettings] = useState<ProductSettings>({
    type: "productDetails",
    blocks: {
      images: {
        imageSrc: "/assets/images/product-detail.jpg",
        imageAlt: "محصول",
      },
      name: "نام محصول",
      description: "توضیحات محصول",
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
        toast.error("خطا در دریافت دسته‌بندی‌ها");
      }
    };

    fetchCategories();
  }, []);
  const [newProperty, setNewProperty] = useState({ name: "", value: "" });
  const [newColor, setNewColor] = useState({ code: "", quantity: "" });
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [showColorsModal, setShowColorsModal] = useState(false);

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

  const handleImageChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        images: {
          ...prev.blocks.images,
          [field]: value,
        },
      },
    }));
  };

  const addProperty = () => {
    if (newProperty.name && newProperty.value) {
      setSettings((prev) => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          properties: [...prev.blocks.properties, newProperty],
        },
      }));
      setNewProperty({ name: "", value: "" });
    }
  };

  const addColor = () => {
    if (newColor.code && newColor.quantity) {
      setSettings((prev) => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          colors: [...prev.blocks.colors, newColor],
        },
      }));
      setNewColor({ code: "", quantity: "" });
    }
  };

  const storeId = localStorage.getItem("storeId");

  const handelSave = async () => {
    try {
      const productData = {
        images: settings.blocks.images,
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
      } else {
        toast.error("خطا در ایجاد محصول");
      }
    } catch (error) {
      toast.error("خطا در بروزرسانی محصول");
      console.log(error);
    }
  };
  const PropertiesModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex  items-center justify-center z-50"
      dir="rtl"
    >
      <div className="bg-white/50 backdrop-blur-sm border border-[#0077b6] p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white border-b pb-2 text-center mb-4">
          ویژگی‌های اضافه شده
        </h3>
        {settings.blocks.properties.map((prop, index) => (
          <div
            key={index}
            className="flex justify-center items-center gap-12 mb-2 p-2 bg-gray-50 rounded-lg"
          >
            <span className="font-bold">{prop.name}</span>
            <span className="text-base">↔</span>
            <span>{prop.value}</span>
          </div>
        ))}
        <button
          onClick={() => setShowPropertiesModal(false)}
          className="mt-4 w-full bg-rose-400/70 font-bold text-white py-2 rounded-xl"
        >
          بستن
        </button>
      </div>
    </div>
  );

  const ColorsModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex  items-center justify-center z-50"
      dir="rtl"
    >
      <div className="bg-white/50 backdrop-blur-sm border border-[#0077b6] p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white border-b pb-2 text-center mb-4">
          رنگ‌های اضافه شده
        </h3>
        {settings.blocks.colors.map((color, index) => (
          <div
            key={index}
            className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: color.code }}
              />
              <span>{color.code}</span>
            </div>
            <span>تعداد: {color.quantity}</span>
          </div>
        ))}
        <button
          onClick={() => setShowColorsModal(false)}
          className="mt-4 w-full bg-rose-400/70 font-bold text-white py-2 rounded-xl"
        >
          بستن
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="bg-white rounded-2xl p-4"
          dir="rtl"
        >
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
            {/* Image Section */}
            <div className="space-y-6 p-6 bg-[#0077b6]/5 rounded-xl">
              <div className="group">
                <label className="block mb-2 font-bold text-[#0077b6] group-hover:text-blue-700 transition-colors">
                  تصویر محصول
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleChange("blocks", "imageSrc", e.target.value)
                    }
                    className="w-full p-3 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 transition-all focus:outline-none focus:border-[#0077b6]"
                    required
                  />
                  <span className="absolute right-3 top-3 text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-bold text-[#0077b6]">
                  متن جایگزین تصویر
                </label>
                <input
                  type="text"
                  value={settings.blocks.images?.imageAlt || ""}
                  onChange={(e) =>
                    handleImageChange("imageAlt", e.target.value)
                  }
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-none transition-all"
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="space-y-6 p-6 bg-[#0077b6]/5 rounded-xl">
              <div>
                <label className="block mb-2 font-bold text-[#0077b6]">
                  نام محصول
                </label>
                <input
                  type="text"
                  value={settings.blocks.name}
                  onChange={(e) =>
                    handleChange("blocks", "name", e.target.value)
                  }
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all"
                  placeholder="نام محصول را وارد کنید"
                />
              </div>

              <div>
                <label className="block mb-2 font-bold text-[#0077b6]">
                  توضیحات
                </label>
                <textarea
                  value={settings.blocks.description}
                  onChange={(e) =>
                    handleChange("blocks", "description", e.target.value)
                  }
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all min-h-[120px]"
                  placeholder="توضیحات محصول را وارد کنید"
                  required
                />
              </div>
            </div>

            {/* Category & Status Section */}
            <div className="lg:col-span-2 grid lg:grid-cols-2 gap-6">
              <div className="p-6 bg-[#0077b6]/5 rounded-xl">
                <label className="block mb-2 font-bold text-[#0077b6]">
                  دسته بندی
                </label>
                <select
                  value={settings.blocks.category._id}
                  onChange={(e) =>
                    handleChange("blocks", "category", e.target.value)
                  }
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all appearance-none"
                  required
                >
                  <option value="">انتخاب دسته بندی</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                افزودن رنگ
              </h3>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative">
                  <input
                    type="color"
                    value={newColor.code}
                    onChange={(e) =>
                      setNewColor({ ...newColor, code: e.target.value })
                    }
                    className="w-8 h-8 rounded-sm cursor-pointer transition-transform hover:scale-110 focus:outline-none "
                    style={{ padding: 0 }}
                  />
                </div>

                <div className="flex-1 max-w-xs">
                  <input
                    type="number"
                    placeholder="تعداد"
                    value={newColor.quantity}
                    onChange={(e) =>
                      setNewColor({ ...newColor, quantity: e.target.value })
                    }
                    className="w-full p-3  rounded-lg  transition-all"
                  />
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
            </div>

            {/* Properties Section */}
            <div className="lg:col-span-2 p-6 bg-[#0077b6]/5 rounded-xl">
              <h3 className="text-[#0077b6] font-bold text-xl mb-4">
                افزودن ویژگی
              </h3>

              <div className="flex gap-4 flex-wrap w-full">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="نام ویژگی"
                    value={newProperty.name}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, name: e.target.value })
                    }
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="مقدار"
                    value={newProperty.value}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, value: e.target.value })
                    }
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all"
                  />
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
            </div>

            {/* Price & Discount Section */}
            <div className="lg:col-span-2 grid lg:grid-cols-2 gap-6">
              <div className="relative p-6 bg-[#0077b6]/5 rounded-xl">
                <label className="block mb-2 font-bold text-[#0077b6]">
                  قیمت
                </label>
                <input
                  type="text"
                  value={settings.blocks.price}
                  onChange={(e) =>
                    handleChange("blocks", "price", e.target.value)
                  }
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-[#0077b6] transition-all"
                  required
                />
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                    style={{
                      background: `linear-gradient(to left, #0077b6 ${settings.blocks.discount}%, #0077b6 ${settings.blocks.discount}%)`,
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

      <ToastContainer rtl={true} />
      {showPropertiesModal && <PropertiesModal />}
      {showColorsModal && <ColorsModal />}
      <Tooltip id="add-property" place="top" />
      <Tooltip id="view-properties" place="top" />
      <Tooltip id="add-color" place="top" />
      <Tooltip id="view-colors" place="top" />
    </div>
  );
};
