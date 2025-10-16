"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStore as StoreIcon,
  FaShoppingCart as OrdersIcon,
  FaUsers as CustomersIcon,
  FaImage as MediaIcon,
  FaBookOpen as BlogIcon,
  FaHome,
  FaBars,
  FaPlus,
  FaBoxes,
  FaLayerGroup,
  FaTags,
  FaShoppingBag,
  FaUsers,
  FaFileUpload,
  FaImages,
  FaInstagram,
  FaBlog,
  FaEdit,
  FaCog,
  FaUserCog,
  FaCreditCard,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { AccordionItemProps, FormProps } from "@/types/type";
import { useEffect } from "react";
import { useTourGuide } from "../hooks/useTourGuide";

const dashboardMenuItems = [
  {
    id: "start",
    title: "خانه",
    icon: <FaHome />,
    color: "from-gary-200 to-gary-600",
    subMenuItems: [
      {
        title: "داشبورد مدیریت",
        value: "start",
        icon: <FaCog />,
      },
    ],
  },
  {
    id: "store",
    title: "محصولات",
    icon: <StoreIcon />,
    color: "from-gary-200 to-gary-600",
    subMenuItems: [
      { title: "افزودن محصول", value: "addProduct", icon: <FaPlus /> },
      { title: "موجودی محصول", value: "inventory", icon: <FaBoxes /> },
      { title: "کالکشن ها", value: "collections", icon: <FaLayerGroup /> },
      { title: "افزودن دسته بندی", value: "addCategory", icon: <FaTags /> },
      { title: "کارتهای هدیه", value: "addGiftCard", icon: <FaCreditCard /> },
    ],
  },
  {
    id: "orders",
    title: "سفارشات",
    icon: <OrdersIcon />,
    color: "from-gary-200 to-gary-600",
    subMenuItems: [
      { title: "سفارش ها", value: "orders", icon: <FaShoppingBag /> },
    ],
  },
  {
    id: "costumers",
    title: "کاربران",
    icon: <CustomersIcon />,
    color: "from-gary-200 to-gary-600",
    subMenuItems: [
      { title: "کاربران", value: "costumers", icon: <FaUsers /> },
      { title: " درخواست ها", value: "contact", icon: <FaUserCog /> },
      { title: "تیکت های مشتریان", value: "tickets", icon: <FaUsers /> },
      { title: "خبرنامه", value: "newsLetter", icon: <FaUsers /> },
    ],
  },
  {
    id: "media",
    title: "گالری",
    icon: <MediaIcon />,
    color: "from-gary-200 to-gary-600",
    subMenuItems: [
      { title: "افزودن تصویر", value: "addFile", icon: <FaFileUpload /> },
      { title: "مدیریت تصاویر", value: "editFile", icon: <FaImages /> },
      { title: "افزودن استوری", value: "addStory", icon: <FaInstagram /> },
    ],
  },
  {
    id: "addBlogs",
    title: "وبلاگ",
    icon: <BlogIcon />,
    color: "from-gary-200 to-gary-600",
    subMenuItems: [
      { title: "افزودن وبلاگ", value: "addBlogs", icon: <FaBlog /> },

      { title: "ویرایش وبلاگ", value: "editBlogs", icon: <FaEdit /> },
    ],
  },
  {
    id: "wallet",
    title: "کیف پول",
    icon: <FaCreditCard />,
    color: "from-green-500 to-green-600",
    subMenuItems: [
      { title: "کیف پول", value: "wallet", icon: <FaCreditCard /> },
    ],
  },
  {
    id: "settings",
    title: "تنظیمات",
    icon: <IoSettings />,
    color: "from-gary-200 to-gary-600",
    subMenuItems: [
      { title: "تنظیمات سایت", value: "siteSettings", icon: <FaCog /> },
      { title: "تنظیمات حساب", value: "accountSettings", icon: <FaUserCog /> },
      { title: "مدیریت توکن های AI", value: "tokenManagement", icon: <FaCreditCard /> },
    ],
  },
];

const AccordionItem: React.FC<AccordionItemProps & { color?: string }> = ({
  title,
  children,
  isOpen,
  onToggle,
  icon,
  color = "from-slate-500 to-slate-600",
}) => {
  return (
    <motion.div className="mb-1.5" dir="rtl">
      <button
        className={`w-full py-4 px-3 text-right bg-gradient-to-r ${color} hover:shadow-md transition-all duration-200 rounded-lg flex justify-between items-center cursor-pointer`}
        onClick={onToggle}
        type="button"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-white text-xs transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <FaChevronDown />
          </span>
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        <span className="text-white text-base">{icon}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 bg-white/5 rounded-lg">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ExtendedFormProps extends FormProps {
  shouldStartTour?: boolean;
}

const Form: React.FC<ExtendedFormProps> = ({
  setSelectedMenu,
  shouldStartTour = false,
}) => {
  const { startTour, TourOverlay } = useTourGuide();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldStartSidebarTour, setShouldStartSidebarTour] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shouldStartTour && !sessionStorage.getItem("sidebarTourCompleted")) {
      setIsOpen(true);
      setShouldStartSidebarTour(true);
    }
  }, [shouldStartTour]);

  useEffect(() => {
    if (shouldStartSidebarTour && isOpen) {
      const timer = setTimeout(() => {
        const isMobile = window.innerWidth < 768;
        const sidebarSteps = [
          ...dashboardMenuItems.map((item) => ({
            element: `#menu-item-${item.id}`,
            popover: {
              title: item.title,
              description: `بخش ${item.title} - برای دسترسی به زیرمنوها کلیک کنید.`,
              side: isMobile ? "bottom" : "left",
              align: "start",
            },
          })),
          {
            element: ".logout-btn",
            popover: {
              title: "خروج از سیستم",
              description:
                "برای خروج از حساب کاربری خود از این دکمه استفاده کنید.",
              side: isMobile ? "bottom" : "left",
              align: "start",
            },
          },
        ];

        startTour(sidebarSteps, () => {
          sessionStorage.setItem("sidebarTourCompleted", "true");
          setShouldStartSidebarTour(false);
          setIsOpen(false);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldStartSidebarTour, isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("storeId");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  const renderAccordionContent = (
    item: {
      subMenuItems?: Array<{
        title: string;
        value: string;
        icon: React.ReactNode;
      }>;
    },
    setSelectedMenu: (menu: string) => void
  ) => {
    return (
      <div className="p-1">
        {item.subMenuItems?.map((subItem, index) => (
          <motion.div
            dir="rtl"
            key={index}
            className="cursor-pointer hover:bg-white/20 text-white/90 py-2 px-3 rounded-md flex flex-row-reverse items-center justify-between group transition-colors"
            onClick={() => {
              setSelectedMenu(subItem.value);
              setIsOpen(false);
            }}
            whileHover={{ x: -3 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="text-xs">{subItem.icon}</span>
            <span className="text-xs font-medium">{subItem.title}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <>
      <TourOverlay />
      {/* Menu Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        className={`menu-toggle-btn fixed top-4 right-4 z-[50] p-3 rounded-xl shadow-lg transition-all duration-200 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <FaBars className="text-white w-5 h-5" />
          )}
        </motion.div>
      </motion.button>

      {/* Sidebar with Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              dir="rtl"
              className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-l border-white/10 fixed top-0 right-0 h-full flex flex-col overflow-hidden z-50 shadow-2xl"
            >
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white text-center">پنل مدیریت</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {dashboardMenuItems.map((item) => (
                  <div key={item.id} id={`menu-item-${item.id}`}>
                    <AccordionItem
                      title={item.title}
                      icon={item.icon}
                      color={item.color}
                      isOpen={activeSection === item.id}
                      onToggle={() => setActiveSection(activeSection === item.id ? null : item.id)}
                    >
                      {renderAccordionContent(item, setSelectedMenu)}
                    </AccordionItem>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-white/10">
                <motion.button
                  onClick={handleLogout}
                  className="logout-btn w-full py-2.5 px-3 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaSignOutAlt />
                  <span>خروج از سیستم</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Form;
