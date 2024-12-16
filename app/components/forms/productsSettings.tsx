"use client";
import { useState } from "react";

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
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        console.log("Product updated successfully");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div
      className="p-6 mx-auto mt-32 w-[1400px] lg:mx-10 grid grid-cols-1 rounded-2xl bg-[#0077b6] md:grid-cols-1 lg:grid-cols-2 gap-4"
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
        />
      </div>
      <div>
        <label className="block mb-2 text-white font-bold"> دسته بندی</label>
        <input
          type="text"
          value={settings.blocks.category}
          onChange={(e) => handleChange("blocks", "category", e.target.value)}
          className="w-full p-2 border rounded-xl"
        />
      </div>
      <div>
        <label className="block mb-2 text-white font-bold"> قیمت</label>
        <input
          type="text"
          value={settings.blocks.price}
          onChange={(e) => handleChange("blocks", "price", e.target.value)}
          className="w-full p-2 border rounded-xl"
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
          <option value="available">available</option>
          <option value="unavailable">unavailable</option>
        </select>
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
        className="w-full bg-[#03045e] hover:bg-transparent text-white mt-5 text-xl font-bold rounded-full mx-auto"
        onClick={handelSave}
      >
        save
      </button>
    </div>
  );
};
