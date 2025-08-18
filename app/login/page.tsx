"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import { FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [codeSent, setCodeSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token exists, redirect to login
      router.replace("/login");
      return;
    }

    // Check if token is expired
    try {
      // Decode the token to check expiration
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired (exp is in seconds)
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        // Token is expired, clear it and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("storeId");
        localStorage.removeItem("userName");
        router.replace("/login");
        return;
      }
    } catch (error) {
      // Token is malformed or invalid, clear it and redirect
      console.error("Invalid token format:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("storeId");
      localStorage.removeItem("userName");
      router.replace("/login");
      return;
    }
  }, [router]);

  const sendCode = async () => {
    if (!phoneNumber) {
      setError("شماره تلفن را وارد کنید");
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (response.ok) {
        setCodeSent(true);
        setStep(2);
      } else {
        setError(data.message);
        setShowModal(true);
      }
    } catch (err) {
      setError("خطا در ارسال کد");
      setShowModal(true);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      setError("کد تایید را وارد کنید");
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      });

      const data = await response.json();
      if (response.ok) {
        setStep(3);
      } else {
        setError(data.message);
        setShowModal(true);
      }
    } catch (err) {
      setError("خطا در تایید کد");
      setShowModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      setError("لطفا تمام فیلدها را پر کنید");
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        setIsSuccess(true);
        setShowModal(true);
        setTimeout(() => router.replace("/"), 1500);
      } else {
        setError(data.message);
        setIsSuccess(false);
        setShowModal(true);
      }
    } catch (err) {
      setError("خطا در ورود");
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                ? "ورود با موفقیت انجام شد"
                : error || "مشکلی پیش آمد. لطفا دوباره امتحان کنید."}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium"
            >
              {isSuccess ? "ورود موفق" : "تلاش مجدد"}
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
      className="min-h-screen flex flex-col items-center justify-center p-4"
      dir="rtl"
    >
      <motion.div className="bg-white/20 bg-opacity-20 backdrop-blur-3xl rounded-2xl px-10 py-12 w-full max-w-4xl border border-[#0077b6]">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-2xl lg:text-4xl bg-white/10 p-3 rounded-2xl backdrop-blur-sm font-bold text-center text-[#0077b6] my-4 lg:my-10">
            ورود به داشبورد
          </h1>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-[#0077b6] mb-2">
                  شماره تلفن
                </label>
                <div className="relative">
                  <FaPhoneAlt className="absolute -left-7 top-5 text-[#0077b6] opacity-50" />
                  <input
                    type="tel"
                    placeholder="شماره تلفن خود را وارد کنید"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-4 pl-10 ring-1 text-right ring-[#0077b6] focus:ring-[#0077b6] outline-none duration-300 rounded-lg focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendCode}
                className="w-full px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex items-center justify-center gap-2"
              >
                ارسال کد تایید
                <FiArrowLeft />
              </motion.button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-[#0077b6] mb-2">
                  کد تایید
                </label>
                <input
                  type="text"
                  placeholder="کد 6 رقمی را وارد کنید"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full p-4 ring-1 text-center ring-[#0077b6] focus:ring-[#0077b6] outline-none duration-300 rounded-lg focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={verifyCode}
                className="w-full px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex items-center justify-center gap-2"
              >
                تایید کد
                <FiArrowLeft />
              </motion.button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-[#0077b6] mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <FaLock className="absolute -left-7 top-5 text-[#0077b6] opacity-50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="رمز عبور خود را وارد کنید"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 pl-10 ring-1 ring-[#0077b6] focus:ring-[#0077b6] outline-none duration-300 rounded-lg focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute left-3 top-5 text-[#0077b6] opacity-50 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex items-center justify-center gap-2"
              >
                ورود
                <FiArrowLeft />
              </motion.button>
            </form>
          )}

          <div className="flex justify-between items-center mt-4">
            <Link href="/signIn" className="text-[#0077b6] hover:underline">
              ثبت نام
            </Link>
            <Link href="#" className="text-[#0077b6] hover:underline">
              فراموشی رمز عبور
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <Modal />
    </motion.div>
  );
}
