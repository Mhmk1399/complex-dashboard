"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import { FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState(1);
  const [smsExpiresAt, setSmsExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
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

  useEffect(() => {
    if (!smsExpiresAt) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const expiryTime = new Date(smsExpiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      
      setCountdown(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [smsExpiresAt]);

  const sendCode = async () => {
    if (!phoneNumber) {
      toast.error("شماره تلفن را وارد کنید");
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
        setSmsExpiresAt(data.expiresAt);
        const remaining = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
        setCountdown(remaining);
        setStep(2);
      } else {
        toast.error(data.message || "خطا در ارسال کد");
      }
    } catch (err) {
      toast.error("خطا در ارسال کد");
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      toast.error("کد تایید را وارد کنید");
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
        toast.error(data.message || "کد نامعتبر است");
      }
    } catch (err) {
      toast.error("خطا در تایید کد");
    }
  };

  const resetPassword = async () => {
    if (!newPassword) {
      toast.error("رمز جدید را وارد کنید");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: verificationCode, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("رمز عبور با موفقیت تغییر یافت");
        setTimeout(() => {
          setIsForgotPassword(false);
          setStep(1);
          setVerificationCode("");
          setNewPassword("");
          setPhoneNumber("");
          setSmsExpiresAt(null);
        }, 1500);
      } else {
        toast.error(data.message || "خطا در تغییر رمز");
      }
    } catch (err) {
      toast.error("خطا در تغییر رمز");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      toast.error("لطفا تمام فیلدها را پر کنید");
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
        toast.success("ورود با موفقیت انجام شد");
        setTimeout(() => router.replace("/"), 1500);
      } else {
        toast.error(data.message || "نام کاربری یا رمز اشتباه است");
      }
    } catch (err) {
      toast.error("خطا در ورود");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };



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
            {isForgotPassword ? "فراموشی رمز عبور" : "ورود به داشبورد"}
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
                {smsExpiresAt && (
                  <div className="text-center mt-4 mb-2">
                    {countdown > 0 ? (
                      <p className={`text-lg font-bold ${
                        countdown > 60 ? 'text-green-600' : countdown > 30 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {countdown} ثانیه
                      </p>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendCode}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium"
                      >
                        ارسال مجدد کد
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={verifyCode}
                className="w-full mt-2 px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex items-center justify-center gap-2"
              >
                تایید کد
                <FiArrowLeft />
              </motion.button>
            </div>
          )}

          {step === 3 && !isForgotPassword && (
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

          {step === 3 && isForgotPassword && (
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-[#0077b6] mb-2">
                  رمز جدید
                </label>
                <div className="relative">
                  <FaLock className="absolute -left-7 top-5 text-[#0077b6] opacity-50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="رمز جدید را وارد کنید"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                onClick={resetPassword}
                className="w-full px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex items-center justify-center gap-2"
              >
                تغییر رمز
                <FiArrowLeft />
              </motion.button>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Link href="/signIn" className="text-[#0077b6] hover:underline">
              ثبت نام
            </Link>
            <button 
              onClick={() => {
                setIsForgotPassword(!isForgotPassword);
                setStep(1);
                setPhoneNumber("");
                setVerificationCode("");
                setNewPassword("");
                setSmsExpiresAt(null);
              }}
              className="text-[#0077b6] hover:underline"
            >
              {isForgotPassword ? "برگشت به ورود" : "فراموشی رمز عبور"}
            </button>
          </div>
        </motion.div>
      </motion.div>


    </motion.div>
  );
}
