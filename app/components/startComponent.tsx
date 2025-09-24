import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import ProfileDate from "./profileDate";
import { FaCheck, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

interface StartComponentProps {
  setSelectedMenu: (menu: string) => void;
}

const StartComponent: React.FC<StartComponentProps> = ({ setSelectedMenu }) => {
  const router = useRouter();
  const [userName, setUserName] = useState("کاربر");
  const [hasProducts, setHasProducts] = useState(false);
  const [hasBlogs, setHasBlogs] = useState(false);
  const [hasCollections, setHasCollections] = useState(false);
  const [hasUserInfo, setHasUserInfo] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt.decode(token);
      if (decodedToken && typeof decodedToken === "object") {
      }
    }
  }, []);

  const checkUserProgress = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const productsRes = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (productsRes.ok) {
        const data = await productsRes.json();
        setHasProducts(data.products && data.products.length > 0);
      }
      
      const blogsRes = await fetch("/api/blog", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (blogsRes.ok) {
        const data = await blogsRes.json();
        setHasBlogs(data.blogs && data.blogs.length > 0);
      }
      
      const collectionsRes = await fetch("/api/collections", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (collectionsRes.ok) {
        const data = await collectionsRes.json();
        setHasCollections(data.collections && data.collections.length > 0);
      }
      
      const userInfoRes = await fetch("/api/userInfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (userInfoRes.ok) {
        setHasUserInfo(true);
      } else {
        setHasUserInfo(false);
      }
    } catch (error) {
      console.error("Error checking progress:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const decodedToken = jwt.decode(token);

      const userId =
        typeof decodedToken === "object" && decodedToken !== null
          ? decodedToken.sub || decodedToken.userId || decodedToken.id
          : undefined;

      if (!userId) {
        throw new Error("Invalid token: User ID not found");
      }

      const fetchUserDetails = async () => {
        try {
          const response = await fetch(`/api/auth/${userId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            console.log(userData);
            localStorage.setItem("storeId", userData.storeId);
            setUserName(userData.title);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
      checkUserProgress();
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  const progressItems = [
    {
      id: 'userInfo',
      title: 'اطلاعات فروشگاه',
      description: 'تکمیل اطلاعات پایه فروشگاه',
      completed: hasUserInfo,
      action: () => setSelectedMenu('accountSettings')
    },
    {
      id: 'products',
      title: 'محصولات',
      description: 'افزودن محصولات به فروشگاه',
      completed: hasProducts,
      action: () => setSelectedMenu('addProduct')
    },
    {
      id: 'blogs',
      title: 'وبلاگ',
      description: 'ایجاد محتوای وبلاگ',
      completed: hasBlogs,
      action: () => setSelectedMenu('addBlogs')
    },
    {
      id: 'collections',
      title: 'کالشن ها',
      description: ' ایجاد مجموعه‌های محصولات',
      completed: hasCollections,
      action: () => setSelectedMenu('collections')
    }
  ];

  const completedCount = progressItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / progressItems.length) * 100;

  const handleRedirectToSite = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await fetch("/api/auth/generate-redirect-token", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const { redirectToken } = await response.json();
        const redirectUrl = `${process.env.NEXT_PUBLIC_COMPLEX_URL}?token=${redirectToken}`;
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error generating redirect token:", error);
    }
  };

  return (
    <>
      <div
        className="min-h-screen  px-4 py-16"
        dir="rtl"
      >
        <div className="max-w-4xl mx-auto my-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0077b6] mb-6">
            به داشبورد مدیریت خوش آمدید
          </h1>
          <p className="text-lg text-gray-600 md:text-xl max-w-2xl mx-auto">
            برای شروع کار با سیستم، لطفاً مراحل زیر را به ترتیب تکمیل نمایید.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#0077b6] mb-2">
                پیشرفت راه‌اندازی فروشگاه
              </h2>
              <p className="text-gray-600">
                {completedCount} از {progressItems.length} مرحله تکمیل شده
              </p>
            </div>
            
            <div className="relative mb-8">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-[#0077b6] to-blue-400 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {Math.round(progressPercentage)}% تکمیل شده
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="relative">
              <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gray-200"/>
              {progressItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="relative flex items-center mb-8 last:mb-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  } transition-all duration-300`}>
                    {item.completed ? <FaCheck /> : <FaPlus />}
                  </div>
                  
                  <div className="mr-6 flex-1">
                    <button
                      onClick={item.action}
                      className="w-full text-right p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-lg font-bold mb-1 ${
                            item.completed ? 'text-green-600' : 'text-gray-700'
                          } group-hover:text-[#0077b6] transition-colors`}>
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.description}
                          </p>
                          {item.completed && (
                            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              تکمیل شده
                            </span>
                          )}
                        </div>
                        <div className="text-[#0077b6] opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleRedirectToSite}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#0077b6] to-blue-400 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <h3 className="font-bold mb-1">مشاهده سایت</h3>
                  <p className="text-blue-100 text-sm">دسترسی به سایت عمومی شما</p>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ProfileDate userName={userName} />
    </>
  );
};

export default StartComponent;