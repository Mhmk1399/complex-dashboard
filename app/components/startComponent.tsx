import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { FaCheck, FaPlus } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useTourGuide } from "../../hooks/useTourGuide";
import { useUserProgress } from "../../hooks/useUserProgress";

interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  images: string[];
}

interface StartComponentProps {
  setSelectedMenu: (menu: string) => void;
  onTourComplete?: () => void;
}

const StartComponent: React.FC<StartComponentProps> = ({
  setSelectedMenu,
  onTourComplete,
}) => {
  const { tourCompleted, startTour, TourOverlay } = useTourGuide();
  const router = useRouter();
  const [userName, setUserName] = useState("کاربر");
  const { progress } = useUserProgress();
  const hasProducts = progress?.hasProducts || false;
  const hasBlogs = progress?.hasBlogs || false;
  const hasCollections = progress?.hasCollections || false;
  const hasUserInfo = progress?.hasUserInfo || false;
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showProgressForTour, setShowProgressForTour] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

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
      const userId =
        typeof decodedToken === "object" && decodedToken !== null
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
          console.log("Template check - userData:", userData);
          setSelectedTemplateName(userData.selctedTemplate || "");
        }
      }
    } catch (error) {
      console.log("Error checking template status:", error);
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
            console.log("User data:", userData);
            console.log("Selected template:", userData.selctedTemplate);
            localStorage.setItem("storeId", userData.storeId);
            setUserName(userData.title);
            setSelectedTemplateName(userData.selctedTemplate || "");
          }
        } catch (error) {
          console.log("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
      checkTemplateStatus();
    } catch (error) {
      console.log("Error decoding token:", error);
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    checkTemplateStatus();
  }, []);

  const templates = [
    {
      id: "digiKalai",
      name: "دیجی کالای",
      description: "قالب فروشگاهی مدرن",
      previewImage:
        "/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.02.32.jpeg",
      images: [
        "/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.02.32.jpeg",
        "/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.03.42.jpeg",
        "/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.04.18.jpeg",
        "/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.04.50.jpeg",
        "/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.37.52.jpeg",
        "/images/templates/digiiKalai/WhatsApp Image 2025-10-05 at 13.43.36.jpeg",
      ],
    },
    {
      id: "sazmani",
      name: "سازمانی",
      description: "قالب سازمانی و شرکتی",
      previewImage:
        "/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.28.39.jpeg",
      images: [
        "/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.28.39.jpeg",
        "/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.29.36.jpeg",
        "/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.30.10.jpeg",
        "/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.31.29.jpeg",
        "/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.34.14.jpeg",
        "/images/templates/sazmani/WhatsApp Image 2025-10-05 at 17.36.08.jpeg",
      ],
    },
  ];

  const handleSelectTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleApplyTemplate = async (templateName: string) => {
    const storeId = localStorage.getItem("storeId");
    const token = localStorage.getItem("token");
    if (!storeId || !token) return;

    setIsApplyingTemplate(true);

    try {
      const templateResponse = await fetch("/api/template-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          templateName,
        }),
      });

      if (templateResponse.ok) {
        const userResponse = await fetch("/api/auth/update-template", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selctedTemplate: templateName,
          }),
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
      console.log("Error applying template:", error);
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const progressItems = [
    {
      id: "userInfo",
      title: "اطلاعات فروشگاه",
      description: "تکمیل اطلاعات پایه فروشگاه",
      completed: hasUserInfo,
      action: () => setSelectedMenu("accountSettings"),
    },
    {
      id: "products",
      title: "محصولات",
      description: "افزودن محصولات به فروشگاه",
      completed: hasProducts,
      action: () => setSelectedMenu("addProduct"),
    },
    {
      id: "blogs",
      title: "وبلاگ",
      description: "ایجاد محتوای وبلاگ",
      completed: hasBlogs,
      action: () => setSelectedMenu("addBlogs"),
    },
    {
      id: "collections",
      title: "کالشن ها",
      description: " ایجاد مجموعه های محصولات",
      completed: hasCollections,
      action: () => setSelectedMenu("collections"),
    },
    {
      id: "template",
      title: "انتخاب قالب",
      description: "انتخاب قالب آماده برای فروشگاه",
      completed: selectedTemplateName !== "",
      action: handleSelectTemplate,
    },
  ];
  const completedCount = progressItems.filter((item) => item.completed).length;

  useEffect(() => {
    if (!tourCompleted && progressItems.length > 0) {
      const timer = setTimeout(() => {
        if (completedCount === progressItems.length) {
          setShowProgressForTour(true);
        }

        const tourSteps = [
          {
            element: ".progress-section",
            popover: {
              title: "پیشرفت راه اندازی",
              description:
                "در اینجا می‌توانید پیشرفت راه اندازی فروشگاه خود را مشاهده کنید.",
              side: "bottom",
              align: "left",
            },
          },
          ...progressItems.map((item) => ({
            element: `#progress-item-${item.id}`,
            popover: {
              title: item.title,
              description:
                item.description + " - برای شروع روی این مورد کلیک کنید.",
              side: "bottom",
              align: "start",
            },
          })),
          {
            element: ".site-view-button",
            popover: {
              title: "مشاهده سایت",
              description:
                "پس از تکمیل مراحل، می‌توانید سایت خود را مشاهده کنید.",
              side: "bottom",
              align: "center",
            },
          },
        ];

        startTour(tourSteps, () => {
          setShowProgressForTour(false);
          if (onTourComplete) onTourComplete();
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [tourCompleted, progressItems.length, completedCount]);

  const progressPercentage = (completedCount / progressItems.length) * 100;

  const getProgressColor = () => {
    if (progressPercentage < 40) return "text-red-500";
    if (progressPercentage < 80) return "text-yellow-500";
    return "text-blue-500";
  };

  const handleRedirectToSite = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/auth/generate-redirect-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const { redirectToken } = await response.json();
        const redirectUrl = `${process.env.NEXT_PUBLIC_COMPLEX_URL}?token=${redirectToken}`;
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.log("Error generating redirect token:", error);
    }
  };

  return (
    <>
      <TourOverlay />
      <div className="min-h-screen   py-8 lg:py-12" dir="rtl">
        <div className="max-w-5xl mx-auto mb-8 lg:mb-12 mt-20 text-center   ">
          <h1 className="text-xl lg:text-4xl font-bold text-slate-700 mb-4 lg:mb-6">
            <strong className="text-blue-500">{userName}</strong> , به داشبورد
            مدیریت خوش آمدید
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            برای شروع کار با سیستم، لطفاً مراحل زیر را به ترتیب تکمیل نمایید.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {(progressPercentage < 100 || showProgressForTour) && (
            <div className="progress-section bg-white/80 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-4 lg:p-5 mb-4 lg:mb-6 mx-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h2 className="text-base lg:text-lg font-bold text-slate-800 mb-1">
                    پیشرفت راه اندازی
                  </h2>
                  <p className="text-xs text-slate-600">
                    {completedCount}/{progressItems.length} مرحله
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`text-xl lg:text-2xl font-bold ${getProgressColor()}`}
                  >
                    {Math.round(progressPercentage)}%
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-l from-slate-300 via-slate-500 to-slate-900 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                مراحل راه اندازی
              </h2>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all text-sm font-medium text-slate-700"
              >
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                </motion.svg>
                {isExpanded ? "جمع کردن" : "باز کردن"}
              </button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <div className="absolute right-5 top-3 bottom-3 w-0.5 bg-slate-700" />
                    {progressItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        id={`progress-item-${item.id}`}
                        className="relative flex items-start sm:items-center mb-4 last:mb-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.completed
                              ? "bg-blue-500 text-white"
                              : "bg-slate-700 text-slate-400"
                          } transition-all duration-300`}
                        >
                          {item.completed ? (
                            <FaCheck className="text-sm" />
                          ) : (
                            <FaPlus className="text-sm" />
                          )}
                        </div>

                        <div className="mr-4 flex-1">
                          <button
                            onClick={item.action}
                            className={`w-full text-right p-3 rounded-lg transition-all duration-200 group ${
                              item.completed ? "bg-white/5" : "bg-white/50 "
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1">
                                <h3
                                  className={`text-sm font-semibold mb-1 ${
                                    item.completed
                                      ? "text-blue-400"
                                      : "text-black"
                                  } group-hover:text-slate-800 transition-colors`}
                                >
                                  {item.title}
                                </h3>
                                <p className="text-slate-400  text-xs">
                                  {item.description}
                                </p>
                              </div>
                              {item.completed && (
                                <span className="px-2 py-0.5 bg-blue-500/80 text-blue-100 text-xs rounded-full border border-blue-500/30 flex-shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className={`${
                isExpanded ? "mt-8 pt-8 border-t border-slate-700" : "mt-4"
              }`}
            >
              <button
                onClick={handleRedirectToSite}
                disabled={selectedTemplateName === ""}
                className={`site-view-button w-full flex items-center justify-between p-5 rounded-xl transition-all duration-200 ${
                  selectedTemplateName !== ""
                    ? "bg-gradient-to-r from-slate-600 to-slate-900 text-white hover:shadow-lg hover:shadow-blue-500/50"
                    : "bg-slate-700 text-slate-100 cursor-not-allowed"
                }`}
              >
                <div className="text-right">
                  <h3 className="text-base font-bold mb-1">مشاهده سایت</h3>
                  <p className="text-slate-400 text-sm">
                    دسترسی به سایت عمومی شما
                  </p>
                </div>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTemplateModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          dir="rtl"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 lg:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 gap-3">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                {selectedTemplate
                  ? `پیشنمای ${selectedTemplate.name}`
                  : "انتخاب قالب"}
              </h2>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-slate-400 hover:text-white flex-shrink-0"
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
                </svg>
              </button>
            </div>

            {!selectedTemplate ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {templates.map((template) => {
                  const isCurrentTemplate =
                    selectedTemplateName === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer relative ${
                        isCurrentTemplate
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-blue-500"
                      }`}
                    >
                      {isCurrentTemplate && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                          فعال
                        </div>
                      )}
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-40 lg:h-48 object-cover"
                      />
                      <div className="p-4 lg:p-6">
                        <h3
                          className={`text-lg lg:text-xl font-bold mb-2 ${
                            isCurrentTemplate ? "text-blue-400" : "text-white"
                          }`}
                        >
                          {template.name}
                        </h3>
                        <p className="text-sm text-slate-300 mb-4">
                          {template.description}
                        </p>
                        <div
                          className={`text-sm font-medium ${
                            isCurrentTemplate
                              ? "text-blue-400"
                              : "text-blue-400"
                          }`}
                        >
                          {isCurrentTemplate ? "قالب فعال" : "مشاهده پیشنمای →"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {selectedTemplate.images.map((image, index) => (
                    <div
                      key={index}
                      className="border border-slate-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={image}
                        alt={`${selectedTemplate.name} preview ${index + 1}`}
                        className="w-full h-40 lg:h-48 object-cover"
                        onClick={() => setFullscreenImage(image)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder.jpg";
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 text-base border border-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={() => handleApplyTemplate(selectedTemplate.id)}
                    disabled={
                      isApplyingTemplate ||
                      selectedTemplateName === selectedTemplate.id
                    }
                    className={`px-6 py-3 text-base rounded-xl transition-colors flex items-center justify-center gap-2 ${
                      isApplyingTemplate ||
                      selectedTemplateName === selectedTemplate.id
                        ? "bg-slate-700 cursor-not-allowed text-slate-500"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    }`}
                  >
                    {isApplyingTemplate && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isApplyingTemplate
                      ? "در حال اعمال..."
                      : selectedTemplateName === selectedTemplate.id
                      ? "قالب فعال"
                      : "انتخاب این قالب"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]"
          onClick={() => setFullscreenImage(null)}
        >
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-[70] flex items-center gap-2 text-base">
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
