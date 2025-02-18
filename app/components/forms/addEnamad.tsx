"use client";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface EnamadSettings {
  link: string;
  tag: string;
  _id?: string;
}

export const AddEnamad = () => {
  const [settings, setSettings] = useState<EnamadSettings>({
    link: "",
    tag: "",
  });
  const [hasEnamad, setHasEnamad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchEnamadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/enamad", {
        method: "GET",
        headers: {
          Authorization: token || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data[0].link && data[0].tag) {
          setSettings({
            link: data[0].link,
            tag: data[0].tag,
            _id: data[0]._id,
          });
          setHasEnamad(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchEnamadData();
  }, []);

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
          Authorization: token || "",
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
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/enamad", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ id: settings._id }),
      });

      if (response.ok) {
        toast.success("نماد اعتماد با موفقیت حذف شد");
        setHasEnamad(false);
        setSettings({ link: "", tag: "" });
      } else {
        toast.error("خطا در حذف نماد اعتماد");
      }
    } catch (error) {
      toast.error("خطا در حذف نماد اعتماد");
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
      <div
        className="p-6 grid lg:mx-auto mt-24 md:mt-36 lg:max-w-6xl mx-6 grid-cols-1 rounded-2xl bg-[#0077b6] md:grid-cols-1 lg:grid-cols-2 gap-4 transform transition-all duration-500 hover:shadow-2xl"
        dir="rtl"
      >
        <div className="lg:col-span-2 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white transform transition-all duration-300 hover:scale-105">
            اطلاعات نماد اعتماد شما
          </h2>
          <div className="bg-white p-4 rounded-xl transform transition-all duration-300 hover:shadow-lg">
            <p className="mb-2 transition-all duration-300 hover:text-[#0077b6]">
              <span className="font-bold">لینک نماد:</span> {settings.link}
            </p>
            <p className="transition-all duration-300 hover:text-[#0077b6]">
              <span className="font-bold">کد نماد:</span> {settings.tag}
            </p>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500 text-white px-6 py-2 rounded-full transform transition-all duration-300 hover:bg-red-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              حذف نماد اعتماد
            </button>

            {isDeleteModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div
                  className="bg-white/40 border border-gray-300 backdrop-blur-md p-6 rounded-lg max-w-sm w-full mx-4"
                  dir="rtl"
                >
                  <h3 className="text-xl font-bold mb-4">تایید حذف</h3>
                  <p className="mb-6">آیا از حذف نماد اعتماد اطمینان دارید؟</p>
                  <div className="flex justify-start gap-4">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setIsDeleteModalOpen(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 grid lg:mx-auto lg:max-w-2xl mx-6 grid-cols-1 rounded-2xl bg-[#fff] border-[#0077b6] border-2 md:grid-cols-1 lg:grid-cols-2 gap-4"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold mb-2 text-[#0077b6] lg:col-span-2 col-span-1">
        افزودن نماد اعتماد جدید
      </h2>

      <div>
        <label className="block mb-2 text-[#0077b6] font-bold">
          لینک نماد اعتماد
        </label>
        <input
          type="text"
          value={settings.link}
          onChange={(e) => handleChange("link", e.target.value)}
          className="w-full p-2 border border-[#0077b6] rounded-xl focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-[#0077b6] font-bold">
          کد نماد اعتماد
        </label>
        <input
          type="text"
          value={settings.tag}
          onChange={(e) => handleChange("tag", e.target.value)}
          className="w-full p-2 border border-[#0077b6] rounded-xl focus:outline-none"
          required
        />
      </div>

      <button
        className="lg:col-span-2 w-full bg-gradient-to-r border-[#0077b6] border-2 text-[#0077b6] mt-5 py-2 text-xl font-bold rounded-full mx-auto duration-200 hover:text-white hover:bg-[#0077b6] transition-all"
        onClick={handleSave}
      >
        ذخیره نماد اعتماد
      </button>

      <ToastContainer rtl={true} position="top-center" />
    </div>
  );
};
