import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStore,
  FaImage,
  FaPhone,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa";
import {
  MdEmail,
  MdDescription,
  MdColorLens,
  MdSettings,
} from "react-icons/md";
import ImageSelectorModal from "./ImageSelectorModal";
import { toast } from "react-toastify";

const menuItems = [
  { id: "basic", icon: <FaStore />, title: "اطلاعات پایه" },
  { id: "design", icon: <MdColorLens />, title: "طراحی" },
  { id: "contact", icon: <FaPhone />, title: "اطلاعات تماس" },
  { id: "social", icon: <FaInstagram />, title: "شبکه‌های اجتماعی" },
];

export const InformationData: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("basic");
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  const [formData, setFormData] = useState({
    basic: {
      storeName: "",
      logo: "",
      description: "",
    },
    design: {
      backgroundColor: "#ffffff",
      font: "iranSans",
    },
    contact: {
      phone: "",
      email: "",
      address: "",
    },
    social: {
      instagram: "",
      telegram: "",
      whatsapp: "",
    },
  });

  const handleSubmitForm = async () => {
    try {
      const response = await fetch("/api/userInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("اطلاعات با موفقیت ذخیره شد");
      } else {
        throw new Error("خطا در ارسال اطلاعات");
      }
    } catch (error) {
      toast.error("خطا در ارسال اطلاعات");
      console.log(error);
    }
  };

  const handleNextStep = () => {
    const menuOrder = ["basic", "design", "contact", "social"];
    const currentIndex = menuOrder.indexOf(activeMenu);

    if (currentIndex < menuOrder.length - 1) {
      setActiveMenu(menuOrder[currentIndex + 1]);
    }
  };

  const slideVariants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "basic":
        return (
          <motion.div
            className="space-y-6"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <FloatingInput
              label="نام فروشگاه"
              icon={<FaStore />}
              placeholder="نام فروشگاه خود را وارد کنید"
              value={formData.basic.storeName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  basic: {
                    ...formData.basic,
                    storeName: e.target.value,
                  },
                })
              }
            />

            <div className="relative group">
              <label className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaImage className="text-[#000]" />
                لوگو
              </label>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsImageSelectorOpen(true)}
                className="w-full h-40 border-2 border-dashed border-[#0077b6] rounded-2xl hover:bg-[#0077b6]/5 transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <FaImage className="text-3xl text-[#0077b6]" />
                  <span className="text-[#0077b6]">آپلود لوگو</span>
                </div>
              </motion.button>
            </div>

            <FloatingTextarea
              label="توضیحات"
              icon={<MdDescription />}
              placeholder="توضیحات فروشگاه خود را وارد کنید"
            />
          </motion.div>
        );

      case "design":
        return (
          <motion.div
            className="space-y-6"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="grid grid-cols-2 gap-6">
              <ColorPicker
                label="رنگ پس زمینه صفحات سایت"
                defaultValue="#ffffff"
              />
            </div>
            <FloatingSelect
              label="فونت"
              icon={<MdSettings />}
              options={[
                { value: "iranSans", label: "ایران سنس" },
                { value: "vazir", label: "وزیر" },
                { value: "yekan", label: "یکان" },
              ]}
            />
          </motion.div>
        );

      case "contact":
        return (
          <motion.div
            className="space-y-6"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="grid grid-cols-2 gap-6 text-right">
              <FloatingInput
                label="شماره تماس"
                icon={<FaPhone />}
                placeholder="09xxxxxxxxx"
                type="tel"
              />
              <FloatingInput
                label="ایمیل"
                icon={<MdEmail />}
                placeholder="example@domain.com"
                type="email"
              />
            </div>
            <FloatingTextarea
              label="آدرس"
              icon={<MdDescription />}
              placeholder="آدرس کامل"
            />
          </motion.div>
        );

      case "social":
        return (
          <motion.div
            className="space-y-6"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <FloatingInput
              label="اینستاگرام"
              icon={<FaInstagram />}
              placeholder="@username"
              prefix="@"
            />
            <FloatingInput
              label="تلگرام"
              icon={<FaTelegram />}
              placeholder="@username"
              prefix="@"
            />
            <FloatingInput
              label="واتساپ"
              icon={<FaWhatsapp />}
              placeholder="+98xxxxxxxxxx"
              prefix="+98"
            />
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-4xl mt-16 mx-auto p-2 sm:p-6" dir="rtl">
      <h1 className="text-center my-4 font-bold text-[#0077b6] text-2xl">
        اطلاعات فروشگاه
      </h1>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 bg-gray-50 p-4 lg:p-6 border-b lg:border-l lg:border-b-0">
            <div className="flex lg:block overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveMenu(item.id)}
                  className={` flex justify-center items-center mx-auto font-bold md:font-medium md:mx-0 gap-1 px-1 py-2 md:p-3 rounded-xl text-right transition-all whitespace-nowrap lg:w-full ${
                    activeMenu === item.id
                      ? "bg-[#0077b6]/80 text-white text-xs md:text-lg  "
                      : "text-gray-500 hover:bg-gray-100 text-xs md:text-lg"
                  }`}
                >
                  <span className="text-sm md:text-lg">{item.icon}</span>
                  <span>{item.title}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 lg:p-8">
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-8 w-full bg-[#0077b6] text-white py-4 rounded-xl hover:bg-[#005f8f] transition-all duration-300 text-lg font-medium"
              onClick={() => {
                if (activeMenu === "social") {
                  handleSubmitForm();
                } else {
                  handleNextStep();
                }
              }}
            >
              {activeMenu === "social" ? "ثبت اطلاعات" : "مرحله بعدی"}
            </motion.button>
          </div>
        </div>
      </div>

      <ImageSelectorModal
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelectImage={(image) => {
          console.log(image);
          setIsImageSelectorOpen(false);
        }}
      />
    </div>
  );
};

// Reusable Components
const FloatingInput: React.FC<{
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  type?: string;
  prefix?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, icon, placeholder, type = "text", prefix }) => (
  <div className="relative group">
    <label className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {prefix}
        </span>
      )}
      <input
        type={type}
        className={`w-full p-4 ${
          prefix ? "pr-12" : ""
        } bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const FloatingTextarea: React.FC<{
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
}> = ({ label, icon, placeholder }) => (
  <div className="relative group">
    <label className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <textarea
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300 min-h-[120px]"
      placeholder={placeholder}
    />
  </div>
);

const FloatingSelect: React.FC<{
  label: string;
  icon?: React.ReactNode;
  options: Array<{ value: string; label: string }>;
}> = ({ label, icon, options }) => (
  <div className="relative group">
    <label className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ColorPicker: React.FC<{
  label: string;
  defaultValue?: string;
}> = ({ label, defaultValue }) => (
  <div className="relative group">
    <label className="text-lg font-medium text-gray-700 mb-2 block">
      {label}
    </label>
    <input
      type="color"
      defaultValue={defaultValue}
      className="w-full h-[54px] p-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300"
    />
  </div>
);

export default InformationData;
