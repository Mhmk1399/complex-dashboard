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
  FaDatabase,
  FaEdit,
  FaCog,
  FaUserCog,
  FaCreditCard,
  FaShieldAlt,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { AccordionItemProps, FormProps } from "@/types/type";

const dashboardMenuItems = [
  {
    id: "start",
    title: "خانه",
    icon: <FaHome />,
    color: "from-blue-500 to-blue-600",
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
    color: "from-blue-500 to-blue-600",
    subMenuItems: [
      { title: "افزودن محصول", value: "addProduct", icon: <FaPlus /> },
      { title: "موجودی محصول", value: "inventory", icon: <FaBoxes /> },
      { title: "کالکشن ها", value: "collections", icon: <FaLayerGroup /> },
      { title: "افزودن دسته بندی", value: "addCategory", icon: <FaTags /> },
    ],
  },
  {
    id: "orders",
    title: "سفارشات",
    icon: <OrdersIcon />,
    color: "from-blue-500 to-blue-600",
    subMenuItems: [
      { title: "سفارش ها", value: "orders", icon: <FaShoppingBag /> },
    ],
  },
  {
    id: "costumers",
    title: "کاربران",
    icon: <CustomersIcon />,
    color: "from-blue-500 to-blue-600",
    subMenuItems: [{ title: "کاربران", value: "costumers", icon: <FaUsers /> },{title: " درخواست ها", value: "contact", icon: <FaUserCog />},],
    
  },
  {
    id: "media",
    title: "گالری",
    icon: <MediaIcon />,
    color: "from-blue-500 to-blue-600",
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
    color: "from-blue-500 to-blue-600",
    subMenuItems: [
      { title: "افزودن وبلاگ", value: "addBlogs", icon: <FaBlog /> },
      {
        title: "افزودن متا دیتا ها",
        value: "addMetaData",
        icon: <FaDatabase />,
      },
      { title: "ویرایش وبلاگ", value: "editBlogs", icon: <FaEdit /> },
    ],
  },
  {
    id: "settings",
    title: "تنظیمات",
    icon: <IoSettings />,
    color: "from-blue-500 to-blue-600",
    subMenuItems: [
      { title: "تنظیمات سایت", value: "siteSettings", icon: <FaCog /> },
      { title: "تنظیمات حساب", value: "accountSettings", icon: <FaUserCog /> },
      {
        title: "تنظیمات پرداخت",
        value: "paymentSettings",
        icon: <FaCreditCard />,
      },
      {
        title: "تنظیمات امنیت",
        value: "securitySettings",
        icon: <FaShieldAlt />,
      },
    ],
  },
];

const AccordionItem: React.FC<AccordionItemProps & { color?: string }> = ({
  title,
  children,
  isOpen,
  onToggle,
  icon,
  color = "from-blue-500 to-blue-600",
}) => {
  return (
    <motion.div
      className="mb-3"
      dir="rtl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        className={`w-full py-4 px-4 text-right bg-gradient-to-r ${color} hover:shadow-lg group transition-all duration-300 ease-in-out rounded-xl flex justify-between items-center relative overflow-hidden`}
        onClick={onToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

        <div className="flex items-center gap-3 z-10">
          <motion.span
            className="text-white text-xl"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronDown />
          </motion.span>
          <span className="text-white font-semibold text-lg">{title}</span>
        </div>

        <motion.span
          className="text-white text-xl z-10"
          whileHover={{ scale: 1.1 }}
        >
          {icon}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              className="mt-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Form: React.FC<FormProps> = ({ setSelectedMenu }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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
    setSelectedMenu: React.Dispatch<React.SetStateAction<string>>
  ) => {
    return (
      <div className="p-2">
        {item.subMenuItems?.map((subItem, index) => (
          <motion.div
            dir="rtl"
            key={index}
            className=" transition-all duration-300 ease-in-out border-b border-white/10 p-3 cursor-pointer hover:bg-white/30 text-black/70 m-1 rounded-lg flex flex-row-reverse items-center justify-between group"
            onClick={() => {
              setSelectedMenu(subItem.value);
              setIsOpen(false); // Close menu on mobile after selection
            }}
            whileHover={{ x: -5 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-sm group-hover:scale-110 transition-transform duration-200">
              {subItem.icon}
            </span>
            <span className="font-medium">{subItem.title}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Enhanced Menu Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        className={`fixed top-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <FaBars className="text-white" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Enhanced Overlay with improved blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
            />

            {/* Enhanced Sliding Menu Panel with modern glass morphism */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              dir="rtl"
              className="w-80 bg-white/10 backdrop-blur-xl border-l border-white/20 fixed top-0 right-0 h-full flex flex-col overflow-hidden z-50 shadow-2xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/10 before:to-transparent before:backdrop-blur-3xl"
            >
              {/* Header Section with glass effect */}
              <motion.div
                className="relative p-6 border-b border-white/20 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                dir="rtl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-t-lg" />
                <h2 className="relative text-2xl font-bold text-white text-center drop-shadow-lg">
                  پنل مدیریت
                </h2>
              </motion.div>

              {/* Menu Items with improved scrolling */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  dir="rtl"
                  className="relative z-10"
                >
                  {dashboardMenuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      dir="rtl"
                    >
                      <AccordionItem
                        title={item.title}
                        icon={item.icon}
                        color={item.color}
                        isOpen={activeSection === item.id}
                        onToggle={() =>
                          setActiveSection(
                            activeSection === item.id ? null : item.id
                          )
                        }
                      >
                        {renderAccordionContent(item, setSelectedMenu)}
                      </AccordionItem>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Footer Section with enhanced glass effect */}
              <motion.div
                className="relative p-4 border-t border-white/20 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5" />
                <motion.button
                  onClick={handleLogout}
                  className="relative w-full py-3 px-4 text-red-600 border border-red-500 hover:bg-red-600 hover:text-white hover:border-red-300/70 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold group overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FaSignOutAlt className="relative z-10" />
                  <span className="relative z-10">خروج از سیستم</span>
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Enhanced Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 8px 0;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 100%
          );
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.2) 100%
          );
          background-clip: content-box;
        }

        /* Glass morphism support */
        @supports (backdrop-filter: blur(20px)) {
          .backdrop-blur-3xl {
            backdrop-filter: blur(20px);
          }
        }
      `}</style>
    </>
  );
};

export default Form;
