"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStore as StoreIcon,
  FaShoppingCart as OrdersIcon,
  FaUsers as CustomersIcon,
  FaImage as MediaIcon,
  FaBlog as BlogIcon,
} from "react-icons/fa";

const dashboardMenuItems = [
  {
    id: "store",
    title: " محصولات",
    icon: <StoreIcon />,
    subMenuItems: [
      { title: "add product", value: "addProduct" },
      { title: "inventory", value: "inventory" },
      { title: "collections ", value: "collections" },
      { title: "discount", value: "discount" },
    ],
  },
  {
    id: "orders",
    title: "سفارشات",
    icon: <OrdersIcon />,
    subMenuItems: [
      { title: "orders", value: "orders" },
      { title: "shipping", value: "shipping" },
      { title: "aboundend Checkouts", value: "aboundendCheckouts" },
    ],
  },
  {
    id: "customers",
    title: "کاربران",
    icon: <CustomersIcon />,
    subMenuItems: [
      { title: "customers", value: "customers" },
      { title: "segment ", value: "segment" },
    ],
  },
  {
    id: "media",
    title: "گالری",
    icon: <MediaIcon />,
    subMenuItems: [{ title: "add file", value: "addFile" }],
  },
  {
    id: "addBlogs",
    title: "وبلاگ",
    icon: <BlogIcon />,
    subMenuItems: [
      { title: "add Blogs", value: "addBlogs" },
      { title: "add Meta Data", value: "addMetaData" },
      { title: "editBlogs", value: "editBlogs" },
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
    <div className="rounded-lg mb-2 right-0" dir="rtl">
      <button
        className="w-full p-4 text-right bg-[#90e0ef] hover:bg-[#caf0f8] transition-all duration-500 ease-in-out rounded-full flex justify-between items-center"
        onClick={onToggle}
      >
        <span className=" text-[#00b4d8] p-0 text-xl">{icon}</span>

        <span className="">{title}</span>

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
            <div className="p-4 ">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Form: React.FC<FormProps> = ({ setSelectedMenu }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

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
            className="text-right  transition-all duration-200 ease-in-out cursor-pointer hover:font-bold text-[#dad7cd] m-2"
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
      <AnimatePresence>
        <>
          {/* Overlay for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          />

          {/* Sliding Menu Panel */}
          <motion.div
            dir="rtl"
            className="w-40 bg-[#0077b6] rounded-xl fixed top-0 right-0 h-full shadow-lg flex flex-col overflow-y-auto p-6 "
          >
            <h2 className="text-2xl font-bold text-[#dad7cd] mb-6" dir="rtl">
              منوی مدیریت
            </h2>

            {dashboardMenuItems.map((item) => (
              <AccordionItem
                key={item.id}
                title={item.title}
                icon={item.icon} // Pass the icon
                isOpen={activeSection === item.id}
                onToggle={() => toggleSection(item.id)}
              >
                {renderAccordionContent(item, setSelectedMenu)}
              </AccordionItem>
            ))}
          </motion.div>
        </>
      </AnimatePresence>
    </>
  );
};

export default Form;
