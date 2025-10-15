import React, { useState, useEffect } from "react";
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

  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (activeMenu) {
      case "basic":
        if (!formData.basic.storeName.trim()) {
          newErrors["basic.storeName"] = "نام فروشگاه الزامی است";
        }
        if (!formData.basic.logo) {
          newErrors["basic.logo"] = "لوگو الزامی است";
        }
        if (!formData.basic.description.trim()) {
          newErrors["basic.description"] = "توضیحات الزامی است";
        }
        break;

      case "design":
        if (!formData.design.backgroundColor) {
          newErrors["design.backgroundColor"] = "رنگ پس زمینه الزامی است";
        }
        if (!formData.design.font) {
          newErrors["design.font"] = "فونت الزامی است";
        }
        break;

      case "contact":
        if (!formData.contact.phone.trim()) {
          newErrors["contact.phone"] = "شماره تماس الزامی است";
        }
        if (!formData.contact.email.trim()) {
          newErrors["contact.email"] = "ایمیل الزامی است";
        } else if (!validateEmail(formData.contact.email)) {
          newErrors["contact.email"] = "فرمت ایمیل صحیح نیست";
        }
        if (!formData.contact.address.trim()) {
          newErrors["contact.address"] = "آدرس الزامی است";
        }
        break;

      case "social":
        if (
          formData.social.instagram &&
          !validateInstagram(formData.social.instagram)
        ) {
          newErrors["social.instagram"] = "نام کاربری اینستاگرام صحیح نیست";
        }
        if (
          formData.social.telegram &&
          !validateTelegram(formData.social.telegram)
        ) {
          newErrors["social.telegram"] = "نام کاربری تلگرام صحیح نیست";
        }
        if (
          formData.social.whatsapp &&
          !validateWhatsApp(formData.social.whatsapp)
        ) {
          newErrors["social.whatsapp"] = "شماره واتساپ صحیح نیست";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateCurrentStep()) {
      toast.error("لطفا تمام فیلدهای الزامی را تکمیل کنید");
      return;
    }

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

  const renderContent = () => {
    switch (activeMenu) {
      case "basic":
        return (
          <div className="space-y-4 sm:space-y-5 fade-in">
            <FloatingInput
              label="نام فروشگاه"
              icon={<FaStore />}
              placeholder="نام فروشگاه خود را وارد کنید"
              value={formData.basic.storeName}
              error={errors["basic.storeName"]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({
                  ...formData,
                  basic: {
                    ...formData.basic,
                    storeName: e.target.value,
                  },
                });
                if (errors["basic.storeName"]) {
                  setErrors({ ...errors, "basic.storeName": "" });
                }
              }}
            />

            <div className="relative group">
              <label className="text-sm sm:text-base font-medium text-slate-900 mb-1.5 sm:mb-2 flex items-center gap-2">
                <FaImage className="text-slate-900 text-sm sm:text-base" />
                لوگو
              </label>

              <button
                type="button"
                onClick={() => setIsImageSelectorOpen(true)}
                className={`w-full h-32 sm:h-40 border-2 border-dashed rounded-lg hover:bg-slate-50 transition-all duration-200 ${
                  errors["basic.logo"]
                    ? "border-red-500"
                    : "border-slate-300 hover:border-slate-900"
                }`}
              >
                {formData.basic.logo ? (
                  <img
                    src={formData.basic.logo}
                    alt="Selected logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <FaImage className="text-2xl sm:text-3xl text-slate-900" />
                    <span className="text-slate-600 text-sm sm:text-base">
                      آپلود لوگو
                    </span>
                  </div>
                )}
              </button>
              {errors["basic.logo"] && (
                <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors["basic.logo"]}
                </p>
              )}
            </div>

            <FloatingTextarea
              label="توضیحات"
              icon={<MdDescription />}
              placeholder="توضیحات فروشگاه خود را وارد کنید"
              value={formData.basic.description}
              error={errors["basic.description"]}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setFormData({
                  ...formData,
                  basic: {
                    ...formData.basic,
                    description: e.target.value,
                  },
                });
                if (errors["basic.description"]) {
                  setErrors({ ...errors, "basic.description": "" });
                }
              }}
            />
          </div>
        );

      case "design":
        return (
          <div className="space-y-4 sm:space-y-5 fade-in">
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
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4 sm:space-y-5 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <FloatingInput
                label="شماره تماس"
                icon={<FaPhone />}
                placeholder="09xxxxxxxxx"
                type="tel"
                value={formData.contact.phone}
                error={errors["contact.phone"]}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value },
                  });
                  if (errors["contact.phone"]) {
                    setErrors({ ...errors, "contact.phone": "" });
                  }
                }}
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
              error={errors["contact.address"]}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, address: e.target.value },
                });
                if (errors["contact.address"]) {
                  setErrors({ ...errors, "contact.address": "" });
                }
              }}
            />
          </div>
        );

      case "social":
        return (
          <div className="space-y-4 sm:space-y-5 fade-in">
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
          </div>
        );
    }
  };

  return (
    <>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-hover:hover {
          transform: translateX(-4px);
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" dir="rtl">
        <h1 className="text-center mb-4 sm:mb-6 font-bold text-slate-900 text-xl sm:text-2xl">
          اطلاعات فروشگاه
        </h1>

        <div className="backdrop-blur-sm rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Menu */}
            <div className="w-full lg:w-56   p-3 sm:p-4 border-b lg:border-l lg:border-b-0">
              <div className="grid grid-cols-2 lg:block overflow-x-auto lg:overflow-visible gap-2 lg:space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-right transition-all duration-200 whitespace-nowrap lg:w-full text-xs sm:text-sm font-medium slide-hover ${
                      activeMenu === item.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-sm sm:text-base">{item.icon}</span>
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {renderContent()}

              <button
                type="button"
                className="mt-6 sm:mt-8 w-full bg-slate-900 text-white py-3 sm:py-3.5 rounded-lg hover:bg-slate-600 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
                onClick={() => {
                  if (activeMenu === "social") {
                    if (validateCurrentStep()) {
                      handleSubmitForm();
                    } else {
                      toast.error("لطفا خطاهای فرم را برطرف کنید");
                    }
                  } else {
                    handleNextStep();
                  }
                }}
              >
                {activeMenu === "social" ? "ثبت اطلاعات" : "مرحله بعدی"}
              </button>
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
    </>
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
    <label className="text-sm sm:text-base font-medium text-slate-900 mb-1.5 flex items-center gap-2">
      {icon && (
        <span className="text-slate-900 text-sm sm:text-base">{icon}</span>
      )}
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm sm:text-base">
          {prefix}
        </span>
      )}
      <input
        type={type}
        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${
          prefix ? "pr-10 sm:pr-12" : ""
        } bg-slate-50 border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:ring-slate-900"
        } rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-sm sm:text-base outline-none`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const FloatingTextarea: React.FC<{
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  value?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, icon, placeholder, value, error, onChange }) => (
  <div className="relative group">
    <label className="text-sm sm:text-base font-medium text-slate-900 mb-1.5 flex items-center gap-2">
      {icon && (
        <span className="text-slate-900 text-sm sm:text-base">{icon}</span>
      )}
      {label}
    </label>
    <textarea
      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border ${
        error
          ? "border-red-500 focus:ring-red-500"
          : "border-slate-300 focus:ring-slate-900"
      } rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base outline-none`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    {error && (
      <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {error}
      </p>
    )}
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
    <label className="text-sm sm:text-base font-medium text-slate-900 mb-1.5 flex items-center gap-2">
      {icon && (
        <span className="text-slate-900 text-sm sm:text-base">{icon}</span>
      )}
      {label}
    </label>
    <select
      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 text-sm sm:text-base outline-none"
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
    <label className="text-sm sm:text-base font-medium text-slate-900 mb-1.5 flex items-center gap-2">
      <MdColorLens className="text-slate-900 text-sm sm:text-base" />
      {label}
    </label>
    <input
      type="color"
      value={value}
      onChange={onChange}
      className="w-full h-12 sm:h-14 p-1 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 cursor-pointer"
    />
  </div>
);

export default InformationData;
