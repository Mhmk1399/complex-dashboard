import React, { useState, useEffect } from "react";
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
import toast from "react-hot-toast";

const menuItems = [
  { id: "basic", icon: <FaStore />, title: "اطلاعات پایه" },
  { id: "design", icon: <MdColorLens />, title: "طراحی" },
  { id: "contact", icon: <FaPhone />, title: "اطلاعات تماس" },
  { id: "social", icon: <FaInstagram />, title: "شبکه‌های اجتماعی" },
];

export const InformationData: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("basic");
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInstagram = (username: string): boolean => {
    const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return instagramRegex.test(username.replace("@", ""));
  };

  const validateTelegram = (username: string): boolean => {
    const telegramRegex = /^[a-zA-Z0-9_]{5,32}$/;
    return telegramRegex.test(username.replace("@", ""));
  };

  const validateWhatsApp = (phone: string): boolean => {
    const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
    return whatsappRegex.test(phone.replace(/\s/g, ""));
  };

  const validateField = (field: string, value: string): string => {
    if (!value) return "";

    switch (field) {
      case "email":
        return validateEmail(value) ? "" : "فرمت ایمیل صحیح نیست";
      case "instagram":
        return validateInstagram(value)
          ? ""
          : "نام کاربری اینستاگرام صحیح نیست";
      case "telegram":
        return validateTelegram(value) ? "" : "نام کاربری تلگرام صحیح نیست";
      case "whatsapp":
        return validateWhatsApp(value) ? "" : "شماره واتساپ صحیح نیست";
      default:
        return "";
    }
  };

  const handleFieldChange = (section: string, field: string, value: string) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section as keyof typeof formData],
        [field]: value,
      },
    });

    const error = validateField(field, value);
    setErrors({
      ...errors,
      [`${section}.${field}`]: error,
    });
  };

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch("/api/userInfo", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const { userInfo } = await response.json();
          setFormData({
            basic: userInfo.basic || {
              storeName: "",
              logo: "",
              description: "",
            },
            design: userInfo.design || {
              backgroundColor: "#ffffff",
              font: "iranSans",
            },
            contact: userInfo.contact || {
              phone: "",
              email: "",
              address: "",
            },
            social: userInfo.social || {
              instagram: "",
              telegram: "",
              whatsapp: "",
            },
          });
        }
      } catch {
        console.log("No existing data found");
      }
    };
    loadExistingData();
  }, []);

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

  const handleNextStep = async () => {
    await handleSaveStep();
    const menuOrder = ["basic", "design", "contact", "social"];
    const currentIndex = menuOrder.indexOf(activeMenu);

    if (currentIndex < menuOrder.length - 1) {
      setActiveMenu(menuOrder[currentIndex + 1]);
    }
  };

  const handleSaveStep = async () => {
    try {
      await fetch("/api/userInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.log("Error saving step:", error);
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
                {formData.basic.logo ? (
                  <img
                    src={formData.basic.logo}
                    alt="Selected logo"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <FaImage className="text-3xl text-[#0077b6]" />
                    <span className="text-[#0077b6]">آپلود لوگو</span>
                  </div>
                )}
              </motion.button>
            </div>

            <FloatingTextarea
              label="توضیحات"
              icon={<MdDescription />}
              placeholder="توضیحات فروشگاه خود را وارد کنید"
              value={formData.basic.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({
                  ...formData,
                  basic: {
                    ...formData.basic,
                    description: e.target.value,
                  },
                })
              }
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
                value={formData.design.backgroundColor}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    design: {
                      ...formData.design,
                      backgroundColor: e.target.value,
                    },
                  })
                }
              />
            </div>
            <FloatingSelect
              label="فونت"
              icon={<MdSettings />}
              options={[
                { value: "hezare", label: "هزاره " },
                { value: "vazir", label: "وزیر" },
                { value: "esterdad", label: "استرداد" },
                { value: "rey", label: "ری" },
                { value: "sahel", label: "ساحل" },
                { value: "cairo", label: "کایرو" },
                { value: "amiri", label: "امیری" },
                { value: "almarai", label: "المرای" },
                { value: "markaziText", label: "مرکزی" },
              ]}
              value={formData.design.font}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  design: { ...formData.design, font: e.target.value },
                })
              }
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
                value={formData.contact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value },
                  })
                }
              />
              <FloatingInput
                label="ایمیل"
                icon={<MdEmail />}
                placeholder="example@domain.com"
                type="email"
                value={formData.contact.email}
                error={errors["contact.email"]}
                onChange={(e) =>
                  handleFieldChange("contact", "email", e.target.value)
                }
              />
            </div>
            <FloatingTextarea
              label="آدرس"
              icon={<MdDescription />}
              placeholder="آدرس کامل"
              value={formData.contact.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, address: e.target.value },
                })
              }
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
              value={formData.social.instagram}
              error={errors["social.instagram"]}
              onChange={(e) =>
                handleFieldChange("social", "instagram", e.target.value)
              }
            />
            <FloatingInput
              label="تلگرام"
              icon={<FaTelegram />}
              placeholder="@username"
              prefix="@"
              value={formData.social.telegram}
              error={errors["social.telegram"]}
              onChange={(e) =>
                handleFieldChange("social", "telegram", e.target.value)
              }
            />
            <FloatingInput
              label="واتساپ"
              icon={<FaWhatsapp />}
              placeholder="+98xxxxxxxxxx"
              prefix="+98"
              value={formData.social.whatsapp}
              error={errors["social.whatsapp"]}
              onChange={(e) =>
                handleFieldChange("social", "whatsapp", e.target.value)
              }
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
          const filename = image.fileUrl;
          setFormData({
            ...formData,
            basic: {
              ...formData.basic,
              logo: filename,
            },
          });
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
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
  label,
  icon,
  placeholder,
  type = "text",
  prefix,
  value,
  error,
  onChange,
}) => (
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
        className={`w-full p-4 ${prefix ? "pr-12" : " "} bg-gray-50 border ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const FloatingTextarea: React.FC<{
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, icon, placeholder, value, onChange }) => (
  <div className="relative group">
    <label className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <textarea
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300 min-h-[120px]"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const FloatingSelect: React.FC<{
  label: string;
  icon?: React.ReactNode;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, icon, options, value, onChange }) => (
  <div className="relative group">
    <label className="text-lg font-medium text-gray-700 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <select
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300"
      value={value}
      onChange={onChange}
    >
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
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, onChange }) => (
  <div className="relative group">
    <label className="text-lg font-medium text-gray-700 mb-2 block">
      {label}
    </label>
    <input
      type="color"
      value={value}
      onChange={onChange}
      className="w-full h-[54px] p-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077b6] transition-all duration-300"
    />
  </div>
);

export default InformationData;
