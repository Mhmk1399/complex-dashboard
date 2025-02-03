"use client";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface EnamadSettings {
  link: string;
  tag: string;
}

export const AddEnamad = () => {
  const [settings, setSettings] = useState<EnamadSettings>({
    link: "",
    tag: "",
  });
  const [hasEnamad, setHasEnamad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchEnamadData();
  }, []);

  const fetchEnamadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/enamad", {
        headers: {
          "Authorization": token || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data[0].link && data[0].tag) {
          setSettings(data[0]);
          setHasEnamad(true);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/enamad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || "",
        },
        body: JSON.stringify({ link: settings }),
      });

      if (response.ok) {
        toast.success("نماد اعتماد با موفقیت اضافه شد");
        setHasEnamad(true);
      } else {
        toast.error("خطا در ایجاد نماد اعتماد");
      }
    } catch (error) {
      toast.error("خطا در ایجاد نماد اعتماد");
      console.log(error);
    }
  };
 
if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin">
                <div className="w-14 h-14 border-r-4 border-blue-400 border-solid rounded-full animate-spin-reverse"></div>
            </div>
        </div>
    );
}

  if (hasEnamad) {
    return (
      <div className="p-6 grid lg:mx-auto lg:max-w-6xl mx-6 grid-cols-1 rounded-2xl bg-[#0077b6] md:grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
        <div className="lg:col-span-2 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">اطلاعات نماد اعتماد شما</h2>
          <div className="bg-white p-4 rounded-xl">
            <p className="mb-2"><span className="font-bold">لینک نماد:</span> {settings.link}</p>
            <p><span className="font-bold">کد نماد:</span> {settings.tag}</p>
          </div>
          <p className="text-white mt-4">شما در حال حاضر دارای نماد اعتماد هستید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 grid lg:mx-auto lg:max-w-2xl mx-6 grid-cols-1 rounded-2xl bg-[#0077b6] md:grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-2 text-white lg:col-span-2 col-span-1">
        افزودن نماد اعتماد جدید
      </h2>

      <div>
        <label className="block mb-2 text-white font-bold">لینک نماد اعتماد</label>
        <input
          type="text"
          value={settings.link}
          onChange={(e) => handleChange("link", e.target.value)}
          className="w-full p-2 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-white font-bold">کد نماد اعتماد</label>
        <input
          type="text"
          value={settings.tag}
          onChange={(e) => handleChange("tag", e.target.value)}
          className="w-full p-2 border rounded-xl"
          required
        />
      </div>

      <button
        className="lg:col-span-2 w-full bg-gradient-to-r border from-sky-600 to-sky-500 text-white mt-5 py-2 text-xl font-bold rounded-full mx-auto hover:from-sky-700 hover:to-sky-600 transition-all"
        onClick={handleSave}
      >
        ذخیره نماد اعتماد
      </button>

      <ToastContainer rtl={true} position="top-center" />
    </div>
  );
};
