"use client";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EditStory } from "./editStory";


interface StorySettings {
  title: string;
  image: string;
}

export const AddStory = () => {
  const [settings, setSettings] = useState<StorySettings>({
    title: "",
    image: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || "",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Story created successfully");
        setSettings({
          title: "",
          image: "",
        });
      } else {
        toast.error("Error creating story");
      }
    } catch (error) {
      toast.error("Error creating story");
      console.log(error);
    }
  };
 

    const [stories, setStories] = useState([]);

    const fetchStories = async () => {
        try {
            const response = await fetch('/api/story', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setStories(data);
        } catch (error) {
            toast.error('خطا در دریافت استوری‌ها');
            console.log(error);
        }
    };
  return (
    <>
      <div className="p-6 grid lg:mx-auto lg:max-w-6xl mx-6 grid-cols-1 rounded-2xl bg-[#0077b6] md:grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
        <h2 className="text-2xl font-bold mb-2 text-white lg:col-span-2 col-span-1">
          افزودن استوری جدید
        </h2>

        <div>
          <label className="block mb-2 text-white font-bold">تصویر استوری</label>
          <input
            type="text"
            onChange={(e) => handleChange("image", e.target.value)}
            className="w-full p-2 border rounded-xl"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-white font-bold">عنوان استوری</label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full p-2 border rounded-xl"
            required
          />
        </div>

        <button
          className="lg:col-span-2 w-full bg-gradient-to-r border from-sky-600 to-sky-500 text-white mt-5 py-2 text-xl font-bold rounded-full mx-auto hover:from-sky-700 hover:to-sky-600 transition-all"
          onClick={handleSave}
        >
          ذخیره استوری
        </button>

        <button
          className="lg:col-span-2 w-full bg-gradient-to-r border from-purple-600 to-purple-500 text-white mt-2 py-2 text-xl font-bold rounded-full mx-auto hover:from-purple-700 hover:to-purple-600 transition-all"
          onClick={() => setIsEditModalOpen(true)}
        >
          مدیریت استوری‌ها
        </button>
        
        <ToastContainer rtl={true} position="top-center" />
      </div>

      <EditStory 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        fetchStories={fetchStories}
      />
    </>
  );
};