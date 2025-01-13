"use client";
import React from 'react';
import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ProductSettings {
  type: string;
  blocks: {
    imageSrc: string;
    imageAlt: string;
    name: string;
    description: string;
    category: string;
    price: string;
    status: string;
    discount: string;
    id: string;
    innventory: string;
  };
}

export const ProductsSettings = () => {
  const [settings, setSettings] = useState<ProductSettings>({
    type: "productDetails",
    blocks: {
      imageSrc: "/assets/images/product-detail.jpg",
      imageAlt: "محصول",
      name: "نام محصول",
      description: "توضیحات محصول",
      category: "دسته بندی",
      price: "0",
      status: "available",
      discount: "0",
      id: "1",
      innventory: "0",
    },
  });

  // Changes settings general
  const handleChange = (section: string, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        ...(section === "blocks" ? { [field]: value } : {}),
      },
    }));
    console.log(settings.blocks);
  };
  const storeId = localStorage.getItem("storeId")
  console.log(storeId);

  const handelSave = async () => {
    try {
      const productData = {
        images: {
          imageSrc: settings.blocks.imageSrc,
          imageAlt: settings.blocks.imageAlt,
        },
        name: settings.blocks.name,
        description: settings.blocks.description,
        category: settings.blocks.category,
        price: settings.blocks.price,
        status: settings.blocks.status,
        discount: settings.blocks.discount,
        id: settings.blocks.id,
        innventory: settings.blocks.innventory,
        storeId: storeId,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success('Product created successfully');
      } else {
        toast.error('Error creating product');
      }
    } catch (error) {
      toast.error('Error updating product');
      console.log(error);


    }
  };

  return (
    <div
      className="p-6 grid lg:mx-auto lg:max-w-6xl mx-6 grid-cols-1 rounded-2xl bg-[#0077b6]  md:grid-cols-1 lg:grid-cols-2 gap-4"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold mb-2 text-white lg:col-span-2 col-span-1">
        تنظیمات محصول
      </h2>

      <div>
        <label className="block mb-2 text-white font-bold">تصویر محصول</label>
        <input
          type="file"
          onChange={(e) => handleChange("blocks", "imageSrc", e.target.value)}
          className="w-full p-2 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-white font-bold">
          متن جایگزین تصویر
        </label>
        <input
          type="text"
          value={settings.blocks.imageAlt}
          onChange={(e) => handleChange("blocks", "imageAlt", e.target.value)}
          className="w-full p-2 border rounded-xl"
          required
        />
      </div>
      <div>
        <label className="block mb-2 text-white font-bold">نام محصول</label>
        <input
          type="text"
          value={settings.blocks.name}
          onChange={(e) => handleChange("blocks", "name", e.target.value)}
          className="w-full p-2 border rounded-xl"
        />
      </div>
      <div>
        <label className="block mb-2 text-white font-bold">توضیحات</label>
        <textarea
          value={settings.blocks.description}
          onChange={(e) =>
            handleChange("blocks", "description", e.target.value)
          }
          className="w-full p-2 border rounded-xl"
          required

        />
      </div>
      <div>
        <label className="block mb-2 text-white font-bold"> دسته بندی</label>
        <input
          type="text"
          value={settings.blocks.category}
          onChange={(e) => handleChange("blocks", "category", e.target.value)}
          className="w-full p-2 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-white font-bold"> وضعیت</label>
        <select
          name="status"
          id="status"
          className="w-full p-2 border rounded-xl"
          value={settings.blocks.status}
          onChange={(e) => handleChange("blocks", "status", e.target.value)}
        >
          <option value="available">موجود</option>
          <option value="unavailable">نا موجود</option>
        </select>
      </div>
      <div className="flex flex-col space-y-2 relative">
        <label className="block mb-2 text-white font-bold">قیمت</label>
        <input
          type="text"
          value={settings.blocks.price}
          onChange={(e) => handleChange("blocks", "price", e.target.value)}
          className="w-full p-2 border rounded-xl "
          required
        />
        {Number(settings.blocks.price) > 0 && Number(settings.blocks.discount) > 0 && (
          <div className="absolute left-0 bg-white/85 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-black text-sm">قیمت با تخفیف:</span>
              <span className="text-green-400 font-bold">
                {(Number(settings.blocks.price) * (1 - Number(settings.blocks.discount) / 100)).toLocaleString()} تومان
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className=" text-sm">میزان تخفیف:</span>
              <span className="text-red-400 font-bold">
                {(Number(settings.blocks.price) * (Number(settings.blocks.discount) / 100)).toLocaleString()} تومان
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="block mb-2 text-white font-bold">تخفیف</label>
        <input
          dir='rtl'
          type="range"
          value={settings.blocks.discount}
          onChange={(e) => handleChange("blocks", "discount", e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          style={{
            background: `linear-gradient(to left, #ef4444 ${settings.blocks.discount}%, #e5e7eb ${settings.blocks.discount}%)`,
          }}
          max={100}
          min={0}
        />
        <span className="text-white ml-2">{settings.blocks.discount}%</span>
      </div>
      <div>
        <label className="block mb-2 text-white font-bold"> موجودی</label>
        <input
          type="text"
          value={settings.blocks.innventory}
          onChange={(e) => handleChange("blocks", "innventory", e.target.value)}
          className="w-full p-2 border rounded-xl"
        />
      </div>



      <button
        className="w-full bg-gradient-to-r border from-sky-600 to-sky-500 text-white mt-5 text-xl font-bold rounded-full mx-auto"
        onClick={handelSave}
      >
        save
      </button>
      <ToastContainer />
    </div>
  );
};
