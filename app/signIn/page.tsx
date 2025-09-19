"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

const generateStoreId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `store${timestamp}${randomStr}`;
};

const SignInForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    title: "",
    storeId: generateStoreId(),
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [, setIsSuccess] = useState(false);
  const [, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [, setCodeSent] = useState(false);
  const [smsExpiresAt, setSmsExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!smsExpiresAt) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const expiryTime = new Date(smsExpiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setCountdown(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [smsExpiresAt]);

  const sendCode = async () => {
    if (!formData.phoneNumber) {
      setErrors("شماره تلفن را وارد کنید");
      setShowModal(true);
      return;
    }
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        setCodeSent(true);
        setSmsExpiresAt(data.expiresAt);
        const remaining = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
        setCountdown(remaining);
        setStep(2);
      } else {
        setErrors(data.message);
        setShowModal(true);
      }
    } catch {
      setErrors("خطا در ارسال کد");
      setShowModal(true);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      setErrors("کد تایید را وارد کنید");
      setShowModal(true);
      return;
    }
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(3);
      } else {
        setErrors(data.message);
        setShowModal(true);
      }
    } catch {
      setErrors("خطا در تایید کد");
      setShowModal(true);
    }
  };

  const submitFormData = async () => {
    if (!formData.phoneNumber || !formData.password || !formData.title) {
      setErrors("لطفا تمام فیلدها را پر کنید");
      setShowModal(true);
      return;
    }
    setIsLoading(true);
    setShowModal(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token);
        setIsLoading(false);
        setIsSuccess(true);
        setShowModal(true);
        router.push("/");
      } else {
        setIsLoading(false);
        setIsSuccess(false);
        setErrors(result.message || "Registration failed");
        setShowModal(true);
      }
    } catch {
      setIsLoading(false);
      setIsSuccess(false);
      setErrors("An unexpected error occurred");
      setShowModal(true);
    }
  };

  const LoadingModal = () => {
    const [currentStep] = useState(0);
    const steps = [
      { title: "شروع فرآیند", message: "در حال آماده سازی ساخت وبسایت شما...", icon: "🚀" },
      { title: "ایجاد مخزن", message: "در حال ایجاد مخزن از قالب اصلی...", icon: "⚡" },
      { title: "پیکربندی فروشگاه", message: "در حال اعمال تنظیمات فروشگاه شما...", icon: "⚙️" },
      { title: "اتمام فرآیند", message: "وبسایت شما با موفقیت ایجاد شد!", icon: "🎉" },
    ];

    return (
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4"
            >
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: currentStep >= index ? 1 : 0.3 }}
                    transition={{ delay: index * 0.2 }}
                    className={`flex items-center space-x-4 ${currentStep >= index ? "text-blue-600" : "text-gray-400"}`}
                  >
                    <span className="text-2xl">{step.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold">{step.title}</h3>
                      <p className="text-sm">{step.message}</p>
                    </div>
                    {currentStep > index && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">✓</motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              {currentStep === steps.length && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
                  <p className="text-green-600 font-bold">آدرس مخزن شما:</p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    ورود به پنل مدیریت
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
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
            خوش اومدی به سایکو بیا باهم سایت بسازیم
          </h1>
          <hr />
          <br />

          {step === 1 && (
            <>
              <label className="block text-lg font-medium text-[#0077b6] mb-2">
                شماره تلفن
              </label>
              <input
                type="text"
                placeholder="شماره تلفن خود را وارد کنید"
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full p-4 ring-1 ring-[#0077b6] focus:ring-[#0077b6] outline-none duration-300 placeholder:opacity-100 rounded-lg focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendCode}
                className="w-full mt-4 px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex justify-center items-center gap-1"
              >
                ارسال کد تایید
                <FiArrowLeft />
              </motion.button>
            </>
          )}

          {step === 2 && (
            <>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={verifyCode}
                className="w-full mt-2 px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex justify-center items-center gap-1"
              >
                تایید کد
                <FiArrowLeft />
              </motion.button>
            </>
          )}

          {step === 3 && (
            <>
              <label className="block text-lg font-medium text-[#0077b6] mb-2">
                اسم فروشگاه
              </label>
              <input
                type="text"
                placeholder="اسم فروشگاهتو اینجا وارد کن"
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-4 ring-1 ring-[#0077b6] focus:ring-[#0077b6] outline-none duration-300 placeholder:opacity-100 rounded-lg focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
              />
              <label className="block text-lg font-medium text-[#0077b6] mb-2 mt-4">
                رمز عبور
              </label>
              <input
                type="password"
                placeholder="رمز عبور خود را وارد کنید"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-4 ring-1 ring-[#0077b6] focus:ring-[#0077b6] outline-none duration-300 placeholder:opacity-100 rounded-lg focus:shadow-md focus:shadow-[#0077b6] backdrop-blur-md bg-white/80"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { submitFormData(); setShowModal(true); }}
                className="w-full mt-4 px-6 py-3 rounded-lg bg-[#0077b6] text-white font-medium flex justify-center items-center gap-1"
              >
                ثبت نام
                <FiArrowLeft />
              </motion.button>
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

          <div className="flex justify-between items-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              className="py-3 text-[#0077b6] font-medium flex items-center gap-1 hover:opacity-70 transition-colors duration-300"
            >
              ورود به حساب
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
      <LoadingModal />
    </motion.div>
  );
};

export default SignInForm;
