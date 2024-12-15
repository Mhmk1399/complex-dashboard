"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiShoppingCart,
  FiUser,
  FiDollarSign,
  FiMonitor,
  FiTarget,
  FiCpu,
  FiHeart,
  FiBook,
} from "react-icons/fi";
import { BiEdit, BiBuildingHouse } from "react-icons/bi";
import { GiClothes, GiCoffeeCup } from "react-icons/gi";
import { MdContentPaste, MdCastForEducation } from "react-icons/md";
import { BsAward } from "react-icons/bs";

interface QuestionOption {
  icon: React.ElementType;
  value: string;
  label: string;
}

interface Question {
  id: number;
  question: string;
  field: string;
  options: QuestionOption[];
  placeholder: string;
  validation: (value: string) => string;
}

export const SignInForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    siteName: "",
    purpose: "",
    industry: "",
  });
  const [errors, setErrors] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const questionOptions = {
    siteName: [
      { value: "ecommerce", label: "فروشگاه آنلاین", icon: FiShoppingCart },
      { value: "portfolio", label: "نمونه کار", icon: BsAward },
      { value: "blog", label: "وبلاگ", icon: BiEdit },
      { value: "company", label: "شرکتی", icon: BiBuildingHouse },
      { value: "personal", label: "شخصی", icon: FiUser },
    ],
    purpose: [
      { value: "sales", label: "فروش محصولات", icon: FiDollarSign },
      { value: "showcase", label: "نمایش خدمات", icon: FiMonitor },
      { value: "content", label: "محتوا نویسی", icon: MdContentPaste },
      { value: "education", label: "آموزش", icon: MdCastForEducation },
      { value: "other", label: "سایر", icon: FiTarget },
    ],
    industry: [
      { value: "tech", label: "تکنولوژی", icon: FiCpu },
      { value: "fashion", label: "مد و پوشاک", icon: GiClothes },
      { value: "food", label: "غذا و نوشیدنی", icon: GiCoffeeCup },
      { value: "health", label: "سلامت و درمان", icon: FiHeart },
      { value: "education", label: "آموزش", icon: FiBook },
    ],
  };

  const questions: Question[] = [
    {
      id: 1,
      question: "فعالیت وب سایت شما چیست؟",
      field: "siteName",
      placeholder: "عنوان سایت",
      validation: (value: string) =>
        value.length >= 3 ? "" : "نام سایت باید حداقل 3 کاراکتر باشد",
      options: questionOptions.siteName,
    },
    {
      id: 2,
      question: "هدف اصلی وب سایت شما چیست؟",
      field: "purpose",
      placeholder: "به عنوان مثال تجارت الکترونیک، نمونه کارها، وبلاگ ...",
      validation: (value: string) =>
        value ? "" : "لطفا یک هدف دقیق ارائه دهید",
      options: questionOptions.purpose,
    },
    {
      id: 3,
      question: "شما در کدام صنعت هستید؟",
      field: "industry",
      placeholder: "به عنوان مثال فناوری، مد، آموزش ...",
      validation: (value: string) =>
        value ? "" : "لطفا یک صنعت را انتخاب کنید",
      options: questionOptions.industry,
    },
  ];

  const validateCurrentStep = () => {
    const currentQuestion = questions[step - 1];
    const currentValue =
      formData[currentQuestion.field as keyof typeof formData];
    const error = currentQuestion.validation(currentValue);
    setErrors(error);
    return !error;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < questions.length) {
        setStep(step + 1);
        setErrors("");
      } else {
        submitFormData();
      }
    }
  };

  const submitFormData = async () => {
    try {
      const response = await fetch("/api/site-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setIsSuccess(response.ok);
      setShowModal(true);
    } catch (error) {
      setIsSuccess(false);
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
      //   whileHover={{
      //     background:
      //       "radial-gradient(circle at var(--x) var(--y), #6366f1  0%, #0052D4 30%)",
      //     transition: { duration: 0.3 },
      //   }}
      //   onMouseMove={(e) => {
      //     const rect = e.currentTarget.getBoundingClientRect();
      //     const x = ((e.clientX - rect.left) / rect.width) * 100;
      //     const y = ((e.clientY - rect.top) / rect.height) * 100;
      //     e.currentTarget.style.setProperty("--x", `${x}%`);
      //     e.currentTarget.style.setProperty("--y", `${y}%`);
      //   }}
      className="min-h-screen bg-gradient-to-tr  from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4"
      dir="rtl"
    >
      <h1 className="text-2xl lg:text-4xl  font-bold text-center text-white my-4 lg:my-10">
        به سایت ساز تومک خوش آمدید!
      </h1>

      <motion.div className="bg-white bg-opacity-20 backdrop-blur-3xl rounded-2xl px-10 py-12 w-full max-w-4xl shadow-2xl border-2 border-white/50">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {step === 1 ? (
            <>
              <h2 className="text-2xl text-center font-bold text-white mb-6 drop-shadow-md">
                {questions[step - 1].question}
              </h2>
              <label
                htmlFor="siteName"
                className="block text-lg font-medium text-white mb-2"
              >
                نام سایت خود را وارد کنید*
              </label>
              <input
                id="siteName"
                placeholder="مثال: سایت تومک"
                type="text"
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                className="w-full p-4  ring-1 ring-purple-400 focus:ring-2 focus:ring-purple-400 outline-none duration-300  placeholder:opacity-100 rounded-lg shadow-md focus:shadow-lg focus:shadow-purple-400 backdrop-blur-md bg-white/80"
              />
              {errors && (
                <p className="text-red-400 font-bold mt-2">{errors}</p>
              )}
            </>
          ) : (
            <h2 className="text-2xl text-center font-bold text-purple-700 mb-6 drop-shadow-md">
              {questions[step - 1].question}
            </h2>
          )}

          <div className="grid grid-cols-1 gap-4 mt-4 ">
            {questions[step - 1].options.map((option) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      [questions[step - 1].field]: option.value,
                    });
                    setErrors("");
                  }}
                  className={`p-4 rounded-lg cursor-pointer border border-gray-50 transition-all
                     backdrop-blur-sm bg-transparent shadow-md
              ${
                formData[questions[step - 1].field as keyof typeof formData] ===
                option.value
                  ? " bg-purple-800 hover:bg-purple-700 "
                  : " hover:bg-white/10 hover:text-white"
              }
            `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-6 h-6 text-purple-800 ${
                        formData[
                          questions[step - 1].field as keyof typeof formData
                        ] === option.value
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
              onClick={handleNext}
            >
              {step === questions.length ? "Complete" : "Next"}
              <FiArrowLeft />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex gap-2 mt-8 justify-center">
          {questions.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-[5px] mx-3 shadow-sm shadow-gray-200 rounded-full ${
                idx + 1 <= step ? "bg-purple-600" : "bg-gray-200"
              }`}
              style={{ width: `${100 / questions.length}%` }}
              //   initial={{ scale: 0.8 }}
              //   animate={{ scale: idx + 1 === step ? 1.2 : 1 }}
            />
          ))}
        </div>
      </motion.div>

      <Modal />
    </motion.div>
  );
};
