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
  FaBars, // Add menu icon
} from "react-icons/fa";
import { IoSettings } from "react-icons/io5";

const dashboardMenuItems = [
  {
    id: "start",
    title: "راهنمای سایت",
    icon: <FaHome />,
    subMenuItems: [
      {
        title: "راهنمای سایت",
        value: "start",
      },
    ],
  },
  {
    id: "store",
    title: " محصولات",
    icon: <StoreIcon />,
    subMenuItems: [
      { title: "افزودن محصول", value: "addProduct" },
      { title: "موجودی محصول", value: "inventory" },
      { title: "کالکشن ها ", value: "collections" },
      { title: "افزودن دسته بندی", value: "addCategory" },
    ],
  },
  {
    id: "orders",
    title: "سفارشات",
    icon: <OrdersIcon />,
    subMenuItems: [{ title: "سفارش ها", value: "orders" }],
  },
  {
    id: "costumers",
    title: "کاربران",
    icon: <CustomersIcon />,
    subMenuItems: [
      { title: "کاربران", value: "costumers" },
      { title: "بخش ", value: "segment" },
    ],
  },
  {
    id: "media",
    title: "گالری",
    icon: <MediaIcon />,
    subMenuItems: [
      { title: "افزودن تصویر", value: "addFile" },
      { title: "مدیریت تصاویر", value: "editFile" },
      { title: "افزودن استوری", value: "addStory" },
    ],
  },
  {
    id: "addBlogs",
    title: "وبلاگ",
    icon: <BlogIcon />,
    subMenuItems: [
      { title: "افزودن وبلاگ ", value: "addBlogs" },
      { title: "افزودن متا دیتا ها", value: "addMetaData" },
      { title: "ویرایش وبلاگ", value: "editBlogs" },
    ],
  },
  {
    id: "settings",
    title: "تنظیمات",
    icon: <IoSettings />,
    subMenuItems: [
      { title: "تنظیمات سایت", value: "siteSettings" },
      { title: "تنظیمات حساب", value: "accountSettings" },
      { title: "تنظیمات پرداخت", value: "paymentSettings" },
      { title: "تنظیمات امنیت", value: "securitySettings" },
    ],
  },
];
interface FormProps {
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  icon?: React.ReactNode; // Optional icon prop
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  icon,
}) => {
  return (
    <div className="rounded-lg mb-2 right-0" dir="ltr">
      <button
        className="w-full py-4 px-2 text-right bg-transparent hover:bg-[#0077b6] hover:bg-opacity-10 border-2 border-[#0077b6] group transition-all duration-500 ease-in-out rounded-lg flex justify-between items-center"
        onClick={onToggle}
      >
        <span className=" text-[#0077b6] group-hover:text-blue-400 p-0 text-xl transition-all duration-500 ease-in-out">
          {icon}
        </span>

        <span className="text-[#0077b6] group-hover:text-gray-500 font-semibold transition-all duration-500 ease-in-out">
          {title}
        </span>

        {/* <span
          className={`transform transition-transform ${
            isOpen ? "rotate-180 text-[#344e41]" : "text-[#fff]"
          }`}
        >
          ▼
        </span> */}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-2 bg-[#0077b6]/10 rounded-lg my-2 ">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Form: React.FC<FormProps> = ({ setSelectedMenu }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // const toggleSection = (sectionId: string) => {
  //   setActiveSection(activeSection === sectionId ? null : sectionId);
  // };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const renderAccordionContent = (
    item: { subMenuItems?: Array<{ title: string; value: string }> },
    setSelectedMenu: React.Dispatch<React.SetStateAction<string>>
  ) => {
    return (
      <>
        {item.subMenuItems?.map((subItem, index) => (
          <div
            key={index}
            className="text-right transition-all duration-300 ease-in-out border-b hover:-translate-x-1 border-[#0077b6]/50 p-1 cursor-pointer hover:text-gray-500 hover:font-bold text-[#0077b6] m-2"
            onClick={() => setSelectedMenu(subItem.value)}
          >
            {/* <span className="mx-2">{`<`}</span> */}
            {subItem.title}
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        className={`fixed top-4 right-4 ${
          isOpen ? "left-4 bg-transparent shadow-none" : ""
        } z-50  p-3 rounded-full text-[#0077b6]`}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <FaBars />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/70 z-40"
            />

            {/* Sliding Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              dir="rtl"
              // Add this class to your sliding menu panel div
              className="w-64  bg-[#f8f9fa]  fixed top-0 right-0 h-full flex flex-col overflow-y-auto p-6 z-50 custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#0077b6]" dir="rtl">
                  منوی مدیریت
                </h2>
              </div>

              {dashboardMenuItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  isOpen={activeSection === item.id}
                  onToggle={() =>
                    setActiveSection(activeSection === item.id ? null : item.id)
                  }
                >
                  {renderAccordionContent(item, setSelectedMenu)}
                </AccordionItem>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Form;
