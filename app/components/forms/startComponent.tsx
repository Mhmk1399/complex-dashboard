import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import ProfileDate from "./profileDate";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTruck,
  FaMotorcycle,
  FaCloudDownloadAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface StartComponentProps {
  setSelectedMenu: (menu: string) => void;
}

const StartComponent: React.FC<StartComponentProps> = ({ setSelectedMenu }) => {
  const router = useRouter();
  const [userName, setUserName] = useState("کاربر");
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isShippingMethodOpen, setIsShippingMethodOpen] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<string>("");
  const [DiskUrl, setDiskUrl] = useState("");
  const [ShowsettingTips, setShowsettingTips] = useState(false);
  const [showAddTips, setShowAddTips] = useState(false);
  const [showPayTips, setShowPayTips] = useState(false);
  const [showShippingTips, setShowShippingTips] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwt.decode(token);
      console.log("decodedToken", decodedToken);
      if (decodedToken && typeof decodedToken === "object") {
        setDiskUrl(decodedToken.DiskUrl || "");
      }
    }
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token"); // Or however you store the token

    if (!token) {
      router.replace("/login"); // Redirect to login if token doesn't exist
      return;
    }
    try {
      // Extract user ID from token (assuming you store user ID in token)
      const decodedToken = jwt.decode(token);

      // Extract user ID from decoded token
      const userId =
        typeof decodedToken === "object" && decodedToken !== null
          ? decodedToken.sub || decodedToken.userId || decodedToken.id
          : undefined;

      if (!userId) {
        throw new Error("Invalid token: User ID not found");
      }

      // Fetch user details using the decoded user ID
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
            // Update the greeting with user's name
            setUserName(userData.title);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  const handleOpenProduct = () => {
    setSelectedMenu("addProduct");
  };
  const toggleShippingMethodDropdown = () => {
    setIsShippingMethodOpen(!isShippingMethodOpen);
  };

  const handleShippingMethodSelect = (method: string) => {
    console.log(`Selected shipping method: ${method}`);
    setSelectedShippingMethod(method);
    setIsShippingMethodOpen(false);
  };

  const togglePaymentMethodDropdown = () => {
    setIsPaymentMethodOpen(!isPaymentMethodOpen);
  };
  const handlePaymentMethodSelect = (method: string) => {
    // Logic for selecting payment method
    console.log(`Selected payment method: ${method}`);
    setSelectedPaymentMethod(method); // Store the selected method
    setIsPaymentMethodOpen(false);
  };
  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-t from-blue-50 to-white px-4 py-16"
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

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 px-4">
          {/* Site Settings Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-[#0077b6]">
            <Link
              href={`${process.env.COMPLEX_URL}?DiskUrl=${DiskUrl}`}
              target="_blank"
              className="flex items-center space-x-4 space-x-reverse"
            >
              <div className="bg-[#0077b6] md:p-4 p-2 rounded-xl">
                <svg
                  width="25"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005Z"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="relative">
                  <h1
                    className="text-xl
                 text-right mb-4 flex items-center justify-start gap-2"
                    onMouseEnter={() => setShowsettingTips(true)}
                    onMouseLeave={() => setShowsettingTips(false)}
                  >
                    تنظیمات سایت
                    <i className="fas fa-info-circle cursor-help text-blue-400 hover:text-blue-600 transition-colors" />
                  </h1>

                  {ShowsettingTips && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 bg-blue-600 backdrop-blur-md border-2 border-white/50 rounded-xl shadow-lg p-5 right-0 mt-1 text-sm text-white"
                    >
                      <ul className="text-right space-y-2">
                        <li className="flex items-center gap-2 text-nowrap">
                          <i className="fas fa-check-circle" />
                          در این بخش می توانید تنظیمات ظاهری سایت خود را انجام
                          دهید
                        </li>
                      </ul>
                    </motion.span>
                  )}
                </div>
                <p className="text-gray-600">
                  تنظیمات اولیه و پیکربندی سایت شما
                </p>
              </div>
            </Link>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-[#0077b6]">
            <button
              onClick={handleOpenProduct}
              className="w-full flex items-center space-x-4 space-x-reverse"
            >
              <div className="bg-[#0077b6] md:p-4 p-2 rounded-xl">
                <svg
                  width="25"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 12H12M12 12H9M12 12V9M12 12V15M17 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21Z"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-right">
                <div className="relative">
                  <h1
                    className="text-xl text-right mb-4 flex items-center justify-start gap-2"
                    onMouseEnter={() => setShowAddTips(true)}
                    onMouseLeave={() => setShowAddTips(false)}
                  >
                    افزودن محصول
                    <i className="fas fa-info-circle cursor-help text-blue-400 hover:text-blue-600 transition-colors" />
                  </h1>

                  {showAddTips && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 bg-blue-600 backdrop-blur-md border-2 border-white/50 rounded-xl shadow-lg p-5 right-0 mt-1 text-sm text-white"
                    >
                      <ul className="text-right space-y-2">
                        <li className="flex items-center gap-2 text-nowrap">
                          <i className="fas fa-check-circle" />
                          در این بخش می توانید محصولات فروشگاه خود را اضافه کنید
                        </li>
                      </ul>
                    </motion.span>
                  )}
                </div>
                <p className="text-gray-600">مدیریت و افزودن محصولات فروشگاه</p>
              </div>
            </button>
          </div>

          {/* Payment Methods Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 relative border-2 border-transparent hover:border-[#0077b6]">
            <button
              onClick={togglePaymentMethodDropdown}
              className="w-full flex items-center space-x-4 space-x-reverse"
            >
              <div className="bg-[#0077b6] md:p-4 p-2 rounded-xl">
                <svg
                  width="25"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="13"
                    rx="2"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 10H20.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 15H9"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-right">
                <div className="relative">
                  <h1
                    className="text-xl text-right mb-4 flex items-center justify-start gap-2"
                    onMouseEnter={() => setShowPayTips(true)}
                    onMouseLeave={() => setShowPayTips(false)}
                  >
                    روش پرداخت
                    <i className="fas fa-info-circle cursor-help text-blue-400 hover:text-blue-600 transition-colors" />
                  </h1>

                  {showPayTips && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 bg-blue-600 backdrop-blur-md border-2 border-white/50 rounded-xl shadow-lg p-5 right-0 mt-1 text-sm text-white"
                    >
                      <ul className="text-right space-y-2">
                        <li className="flex items-center gap-2 text-nowrap">
                          <i className="fas fa-check-circle" />
                          در این بخش می توانید روش پرداخت خود را انتخاب کنید
                        </li>
                      </ul>
                    </motion.span>
                  )}
                </div>
                <p className="text-gray-600">
                  {selectedPaymentMethod
                    ? `انتخاب شده: ${
                        selectedPaymentMethod === "online"
                          ? "آنلاین"
                          : selectedPaymentMethod === "cash"
                          ? "نقدی"
                          : "اقساطی"
                      }`
                    : "انتخاب روش پرداخت"}
                </p>
              </div>
            </button>

            {isPaymentMethodOpen && (
              <div className="absolute bottom-full border-2 left-0 right-0 mt-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl z-20 p-3   transform transition-all duration-300">
                {[
                  {
                    id: "online",
                    label: "پرداخت آنلاین",
                    icon: <FaCreditCard />,
                  },
                  {
                    id: "cash",
                    label: "پرداخت نقدی",
                    icon: <FaMoneyBillWave />,
                  },
                  {
                    id: "installment",
                    label: "پرداخت اقساطی",
                    icon: <FaCalendarAlt />,
                  },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    className="flex items-center gap-3 p-4 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 group"
                  >
                    <span className="text-2xl text-[#0077b6] group-hover:scale-110 transition-transform">
                      {method.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 group-hover:text-blue-600">
                        {method.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {method.id === "online" && "پرداخت امن و سریع"}
                        {method.id === "cash" && "پرداخت در محل"}
                        {method.id === "installment" && "پرداخت چند مرحله‌ای"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping Methods Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 relative border-2 border-transparent hover:border-[#0077b6]">
            <button
              onClick={toggleShippingMethodDropdown}
              className="w-full flex items-center space-x-4 space-x-reverse"
            >
              <div className="bg-[#0077b6] md:p-4 p-2 rounded-xl">
                <svg
                  fill="#ffffff"
                  width="25"
                  height="32"
                  viewBox="0 0 50 50"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24.964844 1 A 1.0001 1.0001 0 0 0 24.382812 1.2128906L1.3828125 19.212891 A 1.0002305 1.0002305 0 1 0 2.6171875 20.787109L4 19.705078L4 46 A 1.0001 1.0001 0 0 0 5 47L45 47 A 1.0001 1.0001 0 0 0 46 46L46 19.705078L47.382812 20.787109 A 1.0002308 1.0002308 0 1 0 48.617188 19.212891L25.617188 1.2128906 A 1.0001 1.0001 0 0 0 24.964844 1 z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="relative">
                  <h1
                    className="text-xl text-right mb-4 flex items-center justify-start gap-2"
                    onMouseEnter={() => setShowShippingTips(true)}
                    onMouseLeave={() => setShowShippingTips(false)}
                  >
                    روش ارسال
                    <i className="fas fa-info-circle cursor-help text-blue-400 hover:text-blue-600 transition-colors" />
                  </h1>

                  {showShippingTips && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 bg-blue-600 backdrop-blur-md border-2 border-white/50 rounded-xl shadow-lg p-5 right-0 mt-1 text-sm text-white"
                    >
                      <ul className="text-right space-y-2">
                        <li className="flex items-center gap-2 text-nowrap">
                          <i className="fas fa-check-circle" />
                          در این بخش می توانید روش ارسال خود را انتخاب کنید.
                        </li>
                      </ul>
                    </motion.span>
                  )}
                </div>
                <p className="text-gray-600">
                  {selectedShippingMethod
                    ? `انتخاب شده: ${
                        selectedShippingMethod === "post"
                          ? "پست"
                          : selectedShippingMethod === "express"
                          ? "پیک"
                          : "دیجیتال"
                      }`
                    : "انتخاب روش ارسال"}
                </p>
              </div>
            </button>

            {isShippingMethodOpen && (
              <div className="absolute bottom-full border-2 left-0 right-0 mt-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl z-20 p-3   transform transition-all duration-300">
                {[
                  {
                    id: "post",
                    label: "ارسال با پست",
                    icon: <FaTruck />,
                    desc: "ارسال به تمام نقاط کشور",
                  },
                  {
                    id: "express",
                    label: "ارسال با پیک",
                    icon: <FaMotorcycle />,
                    desc: "تحویل سریع درون شهری",
                  },
                  {
                    id: "digital",
                    label: "محصول دیجیتال",
                    icon: <FaCloudDownloadAlt />,
                    desc: "دانلود مستقیم محصول",
                  },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handleShippingMethodSelect(method.id)}
                    className="flex items-center gap-3 p-4 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 group"
                  >
                    <span className="text-2xl text-[#0077b6] group-hover:scale-110 transition-transform">
                      {method.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 group-hover:text-blue-600">
                        {method.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {method.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ProfileDate userName={userName} />
    </>
  );
};

export default StartComponent;
