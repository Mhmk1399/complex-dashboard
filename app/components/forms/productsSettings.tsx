"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProductSettings {
  type: string;
  blocks: {
    images: {
      imageSrc: string; 
      imageAlt: string;
    }
    properties: {
      name: string;
      value: string;
    }[]
    colors:
      {
        code: string;
        quantity: string;
      }[];
  
    name: string;
    description: string;
    category: {_id: string, name: string};
    price: string;
    status: string;
    discount: string;
    id: string;
  };
}

export const ProductsSettings = () => {
  const [categories, setCategories] = useState<Array<{_id: string, name: string}>>([]);
  const [settings, setSettings] = useState<ProductSettings>({
    type: "productDetails",
    blocks: {
      images: {
        imageSrc: "/assets/images/product-detail.jpg",
        imageAlt: "محصول",
      },
      name: "نام محصول",
      description: "توضیحات محصول",
      category:{
        _id: "",
        name: ""
      },
      price: "0",
      status: "available",
      discount: "0",
      id: "1",
      properties: [
   
      ],
      colors: [
        
      ]
    },
  });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/category', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast.error('خطا در دریافت دسته‌بندی‌ها');
      }
    };
  
    fetchCategories();
  }, []);
  const [newProperty, setNewProperty] = useState({ name: "", value: "" });
  const [newColor, setNewColor] = useState({ code: "", quantity: "" });

  const handleChange = (section: string, field: string, value: string) => {
    if (field === "category") {
      const selectedCategory = categories.find(cat => cat._id === value);
      setSettings((prev) => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          category: selectedCategory || {_id: "", name: ""}
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          [field]: value
        },
      }));
    }
  };
  

  // const handleImageChange = (field: string, value: string) => {
  //   setSettings((prev) => ({
  //     ...prev,
  //     blocks: {
  //       ...prev.blocks,
  //       images: {
  //         ...prev.blocks.images,
  //         [field]: value
  //       }
  //     }
  //   }));
  // };

  const addProperty = () => {
    if (newProperty.name && newProperty.value) {
      setSettings(prev => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          properties: [...prev.blocks.properties, newProperty]
        }
      }));
      setNewProperty({ name: "", value: "" });
    }
  };

  const addColor = () => {
    if (newColor.code && newColor.quantity) {
      setSettings(prev => ({
        ...prev,
        blocks: {
          ...prev.blocks,
          colors: [...prev.blocks.colors, newColor]
        }
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
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Add this line
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
          value={settings.blocks.images.imageAlt}
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
  <label className="block mb-2 text-white font-bold">دسته بندی</label>
  <select
    value={settings.blocks.category._id}
    onChange={(e) => handleChange("blocks", "category", e.target.value)}
    className="w-full p-2 border rounded-xl"
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

      <div className="lg:col-span-1">
        <h3 className="text-white font-bold mb-2">افزودن ویژگی</h3>
        <div className="flex gap-2 flex-wrap w-full">
          <input
            type="text"
            placeholder="نام ویژگی"
            value={newProperty.name}
            onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
            className="p-2 border rounded-xl"
          />
          <input
            type="text"
            placeholder="مقدار"
            value={newProperty.value}
            onChange={(e) => setNewProperty({...newProperty, value: e.target.value})}
            className="p-2 border rounded-xl"
          />
          <button onClick={addProperty} className="bg-sky-500 text-white px-4 rounded-xl">
            افزودن
          </button>
        </div>
        
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
      <div className="lg:col-span-1">
        <h3 className="text-white font-bold mb-2">افزودن رنگ</h3>
        <div className="flex gap-2">
          <input
          style={{borderRadius: "70%"}}
            type="color"
            value={newColor.code}
            onChange={(e) => setNewColor({...newColor, code: e.target.value})}
            className="border p-0 w-10 h-10 rounded-xl"
          />
          <input
            type="number"
            placeholder="تعداد"
            value={newColor.quantity}
            onChange={(e) => setNewColor({...newColor, quantity: e.target.value})}
            className="p-2 border rounded-xl"
          />
          <button onClick={addColor} className="bg-sky-500 text-white px-4 rounded-xl">
            افزودن رنگ
          </button>
        </div>
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
        {Number(settings.blocks.price) > 0 &&
          Number(settings.blocks.discount) > 0 && (
            <div className="absolute left-0 bg-white/85 p-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-black text-sm">قیمت با تخفیف:</span>
                <span className="text-green-400 font-bold">
                  {(
                    Number(settings.blocks.price) *
                    (1 - Number(settings.blocks.discount) / 100)
                  ).toLocaleString()}{" "}
                  تومان
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className=" text-sm">میزان تخفیف:</span>
                <span className="text-red-400 font-bold">
                  {(
                    Number(settings.blocks.price) *
                    (Number(settings.blocks.discount) / 100)
                  ).toLocaleString()}{" "}
                  تومان
                </span>
              </div>
            </div>
          )}
      </div>
     

      {/* Add new color section */}
    
      <div>
        <label className="block mb-2 text-white font-bold">تخفیف</label>
        <input
          dir="rtl"
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
      

      <button
        className="w-full bg-gradient-to-r border from-sky-600 to-sky-500 text-white mt-5 text-xl font-bold rounded-full mx-auto"
        onClick={handelSave}
      >
        save
      </button>
      <ToastContainer rtl={true} />
    </div>
  );
};

