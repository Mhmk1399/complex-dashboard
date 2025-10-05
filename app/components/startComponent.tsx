import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import ProfileDate from "./profileDate";
import { FaCheck, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  images: string[];
}

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
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt.decode(token);
      if (decodedToken && typeof decodedToken === "object") {
      }
    }
  }, []);

  const checkTemplateStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const decodedToken = jwt.decode(token);
      const userId = typeof decodedToken === "object" && decodedToken !== null
        ? decodedToken.sub || decodedToken.userId || decodedToken.id
        : undefined;
      
      if (userId) {
        const response = await fetch(`/api/auth/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Template check - userData:', userData);
          setSelectedTemplateName(userData.selctedTemplate || "");
        }
      }
    } catch (error) {
      console.error("Error checking template status:", error);
    }
  };

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
            console.log('User data:', userData);
            console.log('Selected template:', userData.selctedTemplate);
            localStorage.setItem("storeId", userData.storeId);
            setUserName(userData.title);
            setSelectedTemplateName(userData.selctedTemplate || "");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
      checkUserProgress();
      checkTemplateStatus();
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    checkTemplateStatus();
  }, []);

  const templates = [
    {
      id: 'digiKalai',
      name: 'دیجی کالای',
      description: 'قالب فروشگاهی مدرن',
      previewImage: '/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.02.32.jpeg',
      images: [
        '/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.02.32.jpeg',
        '/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.03.42.jpeg',
        '/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.04.18.jpeg',
        '/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.04.50.jpeg',
        '/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.37.52.jpeg',
        '/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.43.36.jpeg'
      ]
    },
    {
      id: 'sazmani',
      name: 'سازمانی',
      description: 'قالب سازمانی و شرکتی',
      previewImage: '/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.28.39.jpeg',
      images: [
        '/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.28.39.jpeg',
        '/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.29.36.jpeg',
        '/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.30.10.jpeg',
        '/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.31.29.jpeg',
        '/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.34.14.jpeg',
        '/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.36.08.jpeg'
      ]
    }
  ];

  const handleSelectTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleApplyTemplate = async (templateName: string) => {
    const storeId = localStorage.getItem('storeId');
    const token = localStorage.getItem('token');
    if (!storeId || !token) return;
    
    setIsApplyingTemplate(true);
    
    try {
      const templateResponse = await fetch('/api/template-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          templateName
        })
      });
      
      if (templateResponse.ok) {
        const userResponse = await fetch('/api/auth/update-template', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            selctedTemplate: templateName
          })
        });
        
        if (userResponse.ok) {
          setSelectedTemplateName(templateName);
          setShowTemplateModal(false);
          setSelectedTemplate(null);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      }
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setIsApplyingTemplate(false);
    }
  };

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
      description: ' ایجاد مجموعههای محصولات',
      completed: hasCollections,
      action: () => setSelectedMenu('collections')
    },
    {
      id: 'template',
      title: 'انتخاب قالب',
      description: 'انتخاب قالب آماده برای فروشگاه',
      completed: selectedTemplateName !== "",
      action: handleSelectTemplate
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
                پیشرفت راهاندازی فروشگاه
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
                disabled={selectedTemplateName === ""}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                  selectedTemplateName !== "" 
                    ? 'bg-gradient-to-r from-[#0077b6] to-blue-400 text-white hover:shadow-lg' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
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
      
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0077b6]">
                {selectedTemplate ? `پیشنمای ${selectedTemplate.name}` : 'انتخاب قالب'}
              </h2>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
                </svg>
              </button>
            </div>
            
            {!selectedTemplate ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className="border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:border-[#0077b6]"
                  >
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                      <p className="text-gray-600 mb-4">{template.description}</p>
                      <div className="text-[#0077b6] font-medium">مشاهده پیشنمای →</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {selectedTemplate.images.map((image, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      <img
                        src={image}
                        alt={`${selectedTemplate.name} preview ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onClick={() => setFullscreenImage(image)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={() => handleApplyTemplate(selectedTemplate.id)}
                    disabled={isApplyingTemplate}
                    className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                      isApplyingTemplate 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#0077b6] hover:bg-blue-700'
                    } text-white`}
                  >
                    {isApplyingTemplate && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isApplyingTemplate ? 'در حال اعمال...' : 'انتخاب این قالب'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]" onClick={() => setFullscreenImage(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={fullscreenImage}
              alt="Fullscreen preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[70] flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          قالب با موفقیت اعمال شد
        </div>
      )}
    </>
  );
};

export default StartComponent;