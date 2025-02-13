"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";


const generateStoreId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `store_${timestamp}${randomStr}`;
};

const SignInForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    title: "",
    storeId: generateStoreId(),
  });
  const [errors, setErrors] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitFormData = async () => {
    const storeId = generateStoreId();
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData}),
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
      className="min-h-screen  flex flex-col items-center justify-center p-4"
      dir="rtl"
    >
      <motion.div className="bg-white/20 bg-opacity-20 backdrop-blur-3xl rounded-2xl px-10 py-12 w-full max-w-4xl border border-[#0077b6]">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
            <>
              <h1 className="text-2xl  lg:text-4xl bg-white/10 p-3 rounded-2xl backdrop-blur-sm font-bold text-center text-[#0077b6] my-4 lg:my-10">
                خوش اومدی به سایکو بیا باهم سایت بسازیم
              </h1>
              <hr />
              <br />
              <label
                htmlFor="name"
                className="block text-lg font-medium text-[#0077b6] mb-2"
              >
                اسم فروشگاه
              </label>
              <input
                id="title"
                type="text"
                placeholder="اسم فروشگاهتو اینجا وارد کن"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-4 ring-1 ring-[#0077b6]  focus:ring-[#0077b6] outline-none duration-300 placeholder:opacity-100 rounded-lg  focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
              />
              <label
                htmlFor="password"
                className="block text-lg font-medium text-[#0077b6] mb-2 mt-4"
              >
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                placeholder="رمز عبور خود را وارد کنید"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-4 ring-1 ring-[#0077b6]  focus:ring-[#0077b6] outline-none duration-300 placeholder:opacity-100 rounded-lg  focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
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
                className="w-full p-4 ring-1 ring-[#0077b6]  focus:ring-[#0077b6] outline-none duration-300 placeholder:opacity-100 rounded-lg  focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
              />
            </>
          

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-1 px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex items-center gap-1  hover:shadow-[#0077b6] hover:shadow-md"
              onClick={submitFormData}
            >
              ثبت نام
              <FiArrowLeft />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <Modal />
    </motion.div>
  );
};

export default SignInForm;
