"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";
import { BiEdit, BiBuildingHouse } from "react-icons/bi";
import { BsAward } from "react-icons/bs";

const emptyDirectory = process.env.NEXT_PUBLIC_EMPTY_DIRECTORY;

const generateStoreId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `store_${timestamp}${randomStr}`;
};

const SignInForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    phoneNumber: "",
    category: "",
    subdomain: "",
    title: "",
    logo: "",
    targetProjectDirectory: "",
    templatesDirectory: "",
    emptyDirectory: "",
    storeId: "",
  });
  const [errors, setErrors] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || formData.name.length < 3) {
          setErrors("نام باید حداقل 3 کاراکتر باشد");
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          setErrors("رمز عبور باید حداقل 6 کاراکتر باشد");
          return false;
        }
        if (!formData.phoneNumber || !/^09\d{9}$/.test(formData.phoneNumber)) {
          setErrors("شماره تلفن معتبر نیست");
          return false;
        }
        return true; // Add this
  
      case 2:
        if (!formData.category) {
          setErrors("لطفا دسته‌بندی سایت را انتخاب کنید");
          return false;
        }
        return true; // Add this
  
      default:
        return true; // Add this
    }
  };
  



  const submitFormData = async () => {
    const storeId = generateStoreId();
    const targetProjectDirectory = formData.name;
    formData.title = formData.name;
    formData.subdomain = formData.name;
    formData.logo = formData.name;
    formData.category = formData.name;
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          targetProjectDirectory,
          templatesDirectory: `${targetProjectDirectory}/public/template`,
          emptyDirectory,
          storeId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        router.replace("/");
        setErrors("");
        setIsSuccess(true);
        setShowModal(true);
      } else {
        setIsSuccess(false);
        setErrors(result.message || "Registration failed");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setIsSuccess(false);
      setErrors("An unexpected error occurred");
      setShowModal(true);
    }
  };


  const Modal = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4"
          >
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                isSuccess ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isSuccess ? (
                <FiCheck className="w-8 h-8 text-green-500" />
              ) : (
                <FiX className="w-8 h-8 text-red-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-center mt-4">
              {isSuccess ? "موفق!" : "ناموفق!"}
            </h3>
            <p className="text-center text-gray-600 mt-2">
              {isSuccess
                ? "اطلاعات سایت شما با موفقیت ذخیره شد.."
                : "مشکلی پیش آمد. لطفا دوباره امتحان کنید."}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium"
            >
              {isSuccess ? "عالی بود!" : "دوباره امتحان کنید"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-tr from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4"
      dir="rtl"
    >
      <h1 className="text-2xl  lg:text-4xl bg-white/10 p-3 rounded-2xl backdrop-blur-sm font-bold text-center text-white my-4 lg:my-10">
        به سایت ساز تومک خوش آمدید!
      </h1>

      <motion.div className="bg-white bg-opacity-20 backdrop-blur-3xl rounded-2xl px-10 py-12 w-full max-w-4xl shadow-2xl border-2 border-white/50">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {step === 1 && (
            <>
              <h2 className="text-2xl text-center font-bold text-white mb-6 drop-shadow-md">
                اطلاعات کاربری
              </h2>
              <hr />
              <br />
              <label
                htmlFor="name"
                className="block text-lg font-medium text-white mb-2"
              >
                نام*
              </label>
              <input
                id="name"
                type="text"
                placeholder="نام خود را وارد کنید"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-4 ring-1 ring-purple-400 focus:ring-2 focus:ring-purple-400 outline-none duration-300 placeholder:opacity-100 rounded-lg shadow-md focus:shadow-lg focus:shadow-purple-400 backdrop-blur-md bg-white/80"
              />
              <label
                htmlFor="password"
                className="block text-lg font-medium text-white mb-2 mt-4"
              >
                رمز عبور*
              </label>
              <input
                id="password"
                type="password"
                placeholder="رمز عبور خود را وارد کنید"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-4 ring-1 ring-purple-400 focus:ring-2 focus:ring-purple-400 outline-none duration-300 placeholder:opacity-100 rounded-lg shadow-md focus:shadow-lg focus:shadow-purple-400 backdrop-blur-md bg-white/80"
              />
              <label
                htmlFor="phoneNumber"
                className="block text-lg font-medium text-white mb-2 mt-4"
              >
                شماره تلفن*
              </label>
              <input
                id="phoneNumber"
                type="text"
                placeholder="شماره تلفن خود را وارد کنید"
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full p-4 ring-1 ring-purple-400 focus:ring-2 focus:ring-purple-400 outline-none duration-300 placeholder:opacity-100 rounded-lg shadow-md focus:shadow-lg focus:shadow-purple-400 backdrop-blur-md bg-white/80"
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl text-center font-bold text-white mb-6 drop-shadow-md">
                دسته‌بندی سایت
              </h2>
              <hr />
              <br />
              <div className="grid grid-cols-1 gap-4 mt-4">
                {[
                  {
                    value: "ecommerce",
                    label: "فروشگاه آنلاین",
                    icon: FiShoppingCart,
                  },
                  { value: "portfolio", label: "نمونه کار", icon: BsAward },
                  { value: "blog", label: "وبلاگ", icon: BiEdit },
                  { value: "company", label: "شرکتی", icon: BiBuildingHouse },
                  { value: "personal", label: "شخصی", icon: FiUser },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setFormData({ ...formData, category: option.value });
                        setErrors("");
                      }}
                      className={`p-4 rounded-lg cursor-pointer border border-gray-50 transition-all
                        backdrop-blur-sm bg-transparent shadow-md
                        ${
                          formData.category === option.value
                            ? " bg-purple-700 hover:bg-purple-700 "
                            : " hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-6 h-6 text-purple-800 ${
                            formData.category === option.value
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="text-lg font-medium text-white">
                          {option.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {errors && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 mt-2 font-bold"
            >
              {errors}
            </motion.p>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-gray-100/80 text-gray-700 font-medium backdrop-blur-md shadow-sm hover:shadow-md"
                onClick={() => setStep(step - 1)}
              >
                Back
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-1 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium flex items-center gap-1 shadow-lg hover:shadow-purple-500"
              onClick={submitFormData}
            >
              {step === 2 ? "Complete" : "Next"}
              <FiArrowLeft />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex gap-2 mt-8 justify-center">
          {[1, 2].map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-[5px] mx-3 shadow-sm shadow-gray-200 rounded-full ${
                idx == step ? "bg-purple-600" : "bg-gray-200"
              }`}
              style={{ width: `${100 / 2}%` }}
            />
          ))}
        </div>
      </motion.div>

      <Modal />
    </motion.div>
  );
};

export default SignInForm;
