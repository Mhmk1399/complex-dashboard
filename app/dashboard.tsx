"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Form from "./form";
import { ProductsSettings } from "./components/forms/productsSettings";
import { Inventory } from "./components/forms/inventory";
import { Collections } from "./components/forms/collections";
import { AddBlog } from "./components/forms/addBlog";
import { EditBlogs } from "./components/forms/editBlogs";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import { Orders } from "./components/forms/orders";
import { Costumers } from "./components/forms/costumers";
import UploadPage from "./components/forms/uploads";
import ImageGallery from "./components/forms/editFile";
import StartComponent from "./components/forms/startComponent";
import AddCategory from "./components/forms/addCategory";
import { AddStory } from "./components/forms/addStory";
import { StoreSettings } from "./components/forms/storeSettings";
import InformationData from "./components/forms/informationData";
import {
  FaExclamationTriangle,
  FaHome,
  FaStore,
  FaShoppingCart,
  FaUsers,
  FaImage,
  FaBlog,
  FaCog,
} from "react-icons/fa";
import Contact from "./components/forms/contact";

// Enhanced loading component
const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="text-center"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative w-24 h-24 mx-auto mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </motion.div>

      <motion.h2
        className="text-2xl font-bold text-gray-700 mb-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        در حال بارگذاری...
      </motion.h2>

      <motion.p
        className="text-gray-500"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        لطفاً صبر کنید
      </motion.p>
    </motion.div>
  </motion.div>
);

// Error component
const ErrorComponent = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <motion.div
    className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <FaExclamationTriangle className="text-red-500 text-2xl" />
      </motion.div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">خطا در بارگذاری</h2>
      <p className="text-gray-600 mb-6">{message}</p>

      <motion.button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        تلاش مجدد
      </motion.button>
    </motion.div>
  </motion.div>
);

// Breadcrumb component
const Breadcrumb = ({ selectedMenu }: { selectedMenu: string }) => {
  const getMenuInfo = (menuValue: string) => {
    const menuMap: Record<
      string,
      { title: string; icon: React.ReactNode; color: string }
    > = {
      start: { title: "داشبورد", icon: <FaHome />, color: "text-blue-600" },
      addProduct: {
        title: "افزودن محصول",
        icon: <FaStore />,
        color: "text-green-600",
      },
      inventory: {
        title: "موجودی محصول",
        icon: <FaStore />,
        color: "text-green-600",
      },
      collections: {
        title: "کالکشن ها",
        icon: <FaStore />,
        color: "text-green-600",
      },
      addCategory: {
        title: "افزودن دسته بندی",
        icon: <FaStore />,
        color: "text-green-600",
      },
      orders: {
        title: "سفارشات",
        icon: <FaShoppingCart />,
        color: "text-orange-600",
      },
      costumers: {
        title: "کاربران",
        icon: <FaUsers />,
        color: "text-purple-600",
      },
      addFile: {
        title: "افزودن تصویر",
        icon: <FaImage />,
        color: "text-pink-600",
      },
      editFile: {
        title: "مدیریت تصاویر",
        icon: <FaImage />,
        color: "text-pink-600",
      },
      addStory: {
        title: "افزودن استوری",
        icon: <FaImage />,
        color: "text-pink-600",
      },
      addBlogs: {
        title: "افزودن وبلاگ",
        icon: <FaBlog />,
        color: "text-indigo-600",
      },
      editBlogs: {
        title: "ویرایش وبلاگ",
        icon: <FaBlog />,
        color: "text-indigo-600",
      },
      siteSettings: {
        title: "تنظیمات سایت",
        icon: <FaCog />,
        color: "text-gray-600",
      },
      accountSettings: {
        title: "تنظیمات حساب",
        icon: <FaCog />,
        color: "text-gray-600",
      },
    };

    return (
      menuMap[menuValue] || {
        title: "صفحه اصلی",
        icon: <FaHome />,
        color: "text-blue-600",
      }
    );
  };

  const menuInfo = getMenuInfo(selectedMenu);

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm right-20  px-6 py-4 absolute top-2 z-30"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3" dir="rtl">
        <motion.div
          className={`${menuInfo.color} text-xl`}
          whileHover={{ scale: 1.1 }}
        >
          {menuInfo.icon}
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-800">{menuInfo.title}</h1>
        <div className="flex-1"></div>
        <motion.div
          className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {new Date().toLocaleDateString("fa-IR")}
        </motion.div>
      </div>
    </motion.div>
  );
};

export const Dashboard = () => {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("start");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const decodedToken = jwt.decode(token);
      const userId =
        typeof decodedToken === "object" && decodedToken !== null
          ? decodedToken.sub || decodedToken.userId || decodedToken.id
          : undefined;

      if (!userId) {
        throw new Error("توکن نامعتبر است");
      }

      const response = await fetch(`/api/auth/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("storeId", userData.storeId);
        localStorage.setItem("userName", userData.name || "مدیر");
      } else if (response.status === 404) {
        router.replace("/login");
        return;
      } else {
        throw new Error("خطا در دریافت اطلاعات کاربر");
      }
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      setError(error instanceof Error ? error.message : "خطای غیرمنتظره");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, [router]);

  const RenderForms = () => {
    const formComponents: Record<string, React.ReactNode> = {
      start: <StartComponent setSelectedMenu={setSelectedMenu} />,
      addProduct: <ProductsSettings />,
      inventory: <Inventory setSelectedMenu={setSelectedMenu} />,
      collections: <Collections />,
      addBlogs: <AddBlog />,
      editBlogs: <EditBlogs />,
      orders: <Orders />,
      costumers: <Costumers />,
      addFile: <UploadPage />,
      editFile: <ImageGallery />,
      addCategory: <AddCategory />,
      addStory: <AddStory />,
      siteSettings: <StoreSettings />,
      accountSettings: <InformationData />,
      contact: <Contact />,
    };

    const component = formComponents[selectedMenu] || formComponents.start;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMenu}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {component}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorComponent message={error} onRetry={initializeDashboard} />;
  }

  return (
    <motion.div
      className="min-h-screen "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Form Component */}
      <Form setSelectedMenu={setSelectedMenu} />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumb selectedMenu={selectedMenu} />

        {/* Content */}
        <motion.main
          className="flex-1 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <RenderForms />
        </motion.main>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </motion.div>
  );
};
