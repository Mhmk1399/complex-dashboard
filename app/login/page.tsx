"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import NetworkBackground from "../components/networkBg";
import OTPInput from "../components/OTPInput";
import LoadingModal from "../components/LoadingModal";

const generateStoreId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `store${timestamp}${randomStr}`;
};

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [smsExpiresAt, setSmsExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Signup states
  const [signupFormData, setSignupFormData] = useState({
    phoneNumber: "",
    password: "",
    title: "",
    storeId: generateStoreId(),
  });
  const [signupVerificationCode, setSignupVerificationCode] = useState("");
  const [signupErrors, setSignupErrors] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [signupPasswordError, setSignupPasswordError] = useState<string>("");
  const [signupPhoneError, setSignupPhoneError] = useState<string>("");
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [signupSmsExpiresAt, setSignupSmsExpiresAt] = useState<string | null>(null);
  const [signupCountdown, setSignupCountdown] = useState<number>(0);

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

  useEffect(() => {
    if (!signupSmsExpiresAt) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const expiryTime = new Date(signupSmsExpiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setSignupCountdown(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [signupSmsExpiresAt]);

  // Validation functions
  const validatePassword = (password: string) => {
    if (!password) return "رمز عبور را وارد کنید";
    if (!/[a-zA-Z]/.test(password)) return "رمز عبور باید حداقل یک حرف داشته باشد";
    return "";
  };

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return "شماره تلفن را وارد کنید";
    if (!/^\d+$/.test(phone)) return "شماره تلفن باید فقط شامل اعداد باشد";
    if (!phone.startsWith("09")) return "شماره تلفن باید با 09 شروع شود";
    if (phone.length !== 11) return "شماره تلفن باید 11 رقم باشد";
    return "";
  };

  const handlePhoneKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, setError: (error: string) => void) => {
    const value = e.currentTarget.value;
    if (!/^\d*$/.test(value)) {
      setError("فقط عدد وارد کنید");
    } else {
      setError("");
    }
  };

  // Login functions
  const sendCode = async () => {
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }
    setPhoneError("");
    try {
      const response = await fetch("/api/auth/send-code-login", {
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
    } catch {
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
    } catch {
      toast.error("خطا در تایید کد");
    }
  };

  const resetPassword = async () => {
    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      toast.error(passwordValidation);
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
    } catch {
      toast.error("خطا در تغییر رمز");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneValidation = validatePhoneNumber(phoneNumber);
    
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }
    if (!password) {
      setPasswordError("رمز عبور را وارد کنید");
      return;
    }
    
    setPhoneError("");
    setPasswordError("");
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
    } catch {
      toast.error("خطا در ورود");
    }
  };

  // Signup functions
  const sendSignupCode = async () => {
    const phoneValidation = validatePhoneNumber(signupFormData.phoneNumber);
    if (phoneValidation) {
      setSignupPhoneError(phoneValidation);
      return;
    }
    setSignupPhoneError("");
    try {
      const response = await fetch("/api/auth/send-code-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: signupFormData.phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        setSignupSmsExpiresAt(data.expiresAt);
        const remaining = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
        setSignupCountdown(remaining);
        setSignupStep(2);
      } else {
        setSignupErrors(data.message);
      }
    } catch {
      setSignupErrors("خطا در ارسال کد");
    }
  };

  const verifySignupCode = async () => {
    if (!signupVerificationCode) {
      setSignupErrors("کد تایید را وارد کنید");
      return;
    }
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: signupFormData.phoneNumber, code: signupVerificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setSignupStep(3);
      } else {
        setSignupErrors(data.message);
      }
    } catch {
      setSignupErrors("خطا در تایید کد");
    }
  };

  const submitSignupData = async () => {
    const phoneValidation = validatePhoneNumber(signupFormData.phoneNumber);
    const passwordValidation = validatePassword(signupFormData.password);
    
    if (!signupFormData.title) {
      setSignupErrors("نام فروشگاه را وارد کنید");
      return;
    }
    if (phoneValidation) {
      setSignupPhoneError(phoneValidation);
      return;
    }
    if (passwordValidation) {
      setSignupPasswordError(passwordValidation);
      return;
    }
    
    setSignupPhoneError("");
    setSignupPasswordError("");
    setSignupErrors("");
    setShowSignupModal(true);
    
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupFormData),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token);
      } else {
        setSignupErrors(result.message || "Registration failed");
        setShowSignupModal(false);
      }
    } catch {
      setSignupErrors("An unexpected error occurred");
      setShowSignupModal(false);
    }
  };



  return (
    <div className="min-h-screen  flex items-center justify-center relative" dir="rtl">
      <NetworkBackground />
      <div className="w-full max-w-md lg:max-w-4xl">
        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isSignUp ? "ثبت نام" : "ورود"}
          </h1>
          <p className="text-gray-600 text-sm">
            {isSignUp ? "حساب جدید بسازید" : "به حساب خود وارد شوید"}
          </p>
        </div>

        {/* Desktop Layout */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="hidden lg:block relative w-full h-[600px] bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
        >
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/80 backdrop-blur-sm z-10 flex items-center justify-center"
            animate={{ x: isSignUp ? "-100%" : "0%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-center text-white px-8">
              <motion.h2 
                className="text-4xl font-bold mb-4"
                key={isSignUp ? "create" : "signin"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isSignUp ? "ورود" : "ساخت حساب!"}
              </motion.h2>
              <motion.p 
                className="text-lg mb-8 opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isSignUp 
                  ? "با جزئیات شخصی خود وارد شوید تا از تمام امکانات سایت استفاده کنید" 
                  : "اگر هنوز حساب کاربری ندارید ثبت نام کنید ..."}
              </motion.p>
              <motion.button
                onClick={() => setIsSignUp(!isSignUp)}
                className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-500 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSignUp ? "ورود" : "ثبت نام"}
              </motion.button>
            </div>
          </motion.div>

          {/* Desktop Login Panel */}
          <div className="absolute left-0 top-0 w-1/2 h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              {!isSignUp && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm"
                >
                  <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    {isForgotPassword ? "فراموشی رمز عبور" : "ورود"}
                  </h2>
                  
                  <p className="text-center text-gray-500 mb-6">یا با شماره تلفن وارد شوید</p>

                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="tel"
                          placeholder="شماره تلفن"
                          value={phoneNumber}
                          maxLength={11}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(value);
                            setPhoneError("");
                          }}
                          onKeyUp={(e) => handlePhoneKeyUp(e, setPhoneError)}
                          className={`w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none focus:bg-gray-200 transition-colors text-right ${phoneError ? 'border-2 border-red-500' : ''}`}
                        />
                        {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                      </div>
                      <motion.button
                        onClick={sendCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ارسال کد تایید
                      </motion.button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <OTPInput
                        value={verificationCode}
                        onChange={setVerificationCode}
                      />
                      {smsExpiresAt && (
                        <div className="text-center">
                          {countdown > 0 ? (
                            <p className={`text-lg font-bold ${countdown > 60 ? 'text-green-600' : countdown > 30 ? 'text-blue-600' : 'text-red-600'}`}>
                              {countdown} ثانیه
                            </p>
                          ) : (
                            <motion.button onClick={sendCode} className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium" whileHover={{ scale: 1.05 }}>
                              ارسال مجدد کد
                            </motion.button>
                          )}
                        </div>
                      )}
                      <motion.button
                        onClick={verifyCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        تایید کد
                      </motion.button>
                    </div>
                  )}

                  {step === 3 && !isForgotPassword && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="رمز عبور"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError("");
                          }}
                          className={`w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none focus:bg-gray-200 transition-colors text-right ${passwordError ? 'border-2 border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-3 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                      <motion.button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ورود
                      </motion.button>
                    </form>
                  )}

                  {step === 3 && isForgotPassword && (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="رمز جدید"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none focus:bg-gray-200 transition-colors text-right"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-3 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <motion.button
                        onClick={resetPassword}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        تغییر رمز
                      </motion.button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 text-sm">
                    <button 
                      onClick={() => setIsSignUp(true)}
                      className="text-blue-500 hover:underline"
                    >
                      ثبت نام
                    </button>
                    <button 
                      onClick={() => {
                        setIsForgotPassword(!isForgotPassword);
                        setStep(1);
                        setPhoneNumber("");
                        setVerificationCode("");
                        setNewPassword("");
                        setSmsExpiresAt(null);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      {isForgotPassword ? "برگشت به ورود" : "فراموشی رمز عبور"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Signup Panel */}
          <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm"
                >
                  <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">خوش اومدی به سایکو</h2>
                  
                  <p className="text-center text-gray-500 mb-6">یا با شماره تلفن ثبت نام کنید</p>

                  {signupStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="tel"
                          placeholder="شماره تلفن خود را وارد کنید"
                          maxLength={11}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setSignupFormData({ ...signupFormData, phoneNumber: value });
                            setSignupPhoneError("");
                          }}
                          onKeyUp={(e) => handlePhoneKeyUp(e, setSignupPhoneError)}
                          className={`w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none focus:bg-gray-200 transition-colors text-right ${signupPhoneError ? 'border-2 border-red-500' : ''}`}
                        />
                        {signupPhoneError && <p className="text-red-500 text-sm mt-1">{signupPhoneError}</p>}
                      </div>
                      <motion.button
                        onClick={sendSignupCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex justify-center items-center gap-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ارسال کد تایید
                        <FiArrowLeft />
                      </motion.button>
                    </div>
                  )}

                  {signupStep === 2 && (
                    <div className="space-y-4">
                      <OTPInput
                        value={signupVerificationCode}
                        onChange={setSignupVerificationCode}
                      />
                      {signupSmsExpiresAt && (
                        <div className="text-center">
                          {signupCountdown > 0 ? (
                            <p className={`text-lg font-bold ${signupCountdown > 60 ? 'text-green-600' : signupCountdown > 30 ? 'text-blue-600' : 'text-red-600'}`}>
                              {signupCountdown} ثانیه
                            </p>
                          ) : (
                            <motion.button onClick={sendSignupCode} className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium" whileHover={{ scale: 1.05 }}>
                              ارسال مجدد کد
                            </motion.button>
                          )}
                        </div>
                      )}
                      <motion.button
                        onClick={verifySignupCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex justify-center items-center gap-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        تایید کد
                        <FiArrowLeft />
                      </motion.button>
                    </div>
                  )}

                  {signupStep === 3 && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="اسم فروشگاهتو اینجا وارد کن"
                        onChange={(e) => setSignupFormData({ ...signupFormData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none focus:bg-gray-200 transition-colors text-right"
                      />
                      <div>
                        <input
                          type="password"
                          placeholder="رمز عبور خود را وارد کنید"
                          onChange={(e) => {
                            setSignupFormData({ ...signupFormData, password: e.target.value });
                            setSignupPasswordError("");
                          }}
                          className={`w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none focus:bg-gray-200 transition-colors text-right ${signupPasswordError ? 'border-2 border-red-500' : ''}`}
                        />
                        {signupPasswordError && <p className="text-red-500 text-sm mt-1">{signupPasswordError}</p>}
                      </div>
                      <motion.button
                        onClick={submitSignupData}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex justify-center items-center gap-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ثبت نام
                        <FiArrowLeft />
                      </motion.button>
                    </div>
                  )}

                  {signupErrors && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 mt-2 font-bold text-center">
                      {signupErrors}
                    </motion.p>
                  )}

                  <div className="flex justify-center items-center mt-4">
                    <motion.button
                      onClick={() => setIsSignUp(false)}
                      className="py-3 text-blue-500 font-medium flex items-center gap-1 hover:opacity-70 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ورود به حساب
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl p-6"
          >
            {/* Mobile Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  !isSignUp ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ورود
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isSignUp ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ثبت نام
              </button>
            </div>

            {/* Mobile Forms */}
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.div
                  key="mobile-login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[250px]"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    {isForgotPassword ? "فراموشی رمز عبور" : "ورود به حساب"}
                  </h3>
                  
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="tel"
                          placeholder="شماره تلفن"
                          value={phoneNumber}
                          maxLength={11}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(value);
                            setPhoneError("");
                          }}
                          onKeyUp={(e) => handlePhoneKeyUp(e, setPhoneError)}
                          className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 outline-none focus:border-blue-500 transition-colors text-right ${phoneError ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                      </div>
                      <button
                        onClick={sendCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        ارسال کد تایید
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <OTPInput
                        value={verificationCode}
                        onChange={setVerificationCode}
                      />
                      {smsExpiresAt && (
                        <div className="text-center">
                          {countdown > 0 ? (
                            <p className={`text-sm font-medium ${countdown > 60 ? 'text-green-600' : countdown > 30 ? 'text-blue-600' : 'text-red-600'}`}>
                              {countdown} ثانیه تا انقضا
                            </p>
                          ) : (
                            <button onClick={sendCode} className="text-blue-500 text-sm font-medium">
                              ارسال مجدد کد
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        onClick={verifyCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        تایید کد
                      </button>
                    </div>
                  )}

                  {step === 3 && !isForgotPassword && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="رمز عبور"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError("");
                          }}
                          className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 outline-none focus:border-blue-500 transition-colors text-right ${passwordError ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-3 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                      <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        ورود
                      </button>
                    </form>
                  )}

                  {step === 3 && isForgotPassword && (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="رمز جدید"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-500 transition-colors text-right"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-3 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <button
                        onClick={resetPassword}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        تغییر رمز
                      </button>
                    </div>
                  )}

                  <div className="flex justify-center items-center mt-6 text-sm">
                    <button 
                      onClick={() => {
                        setIsForgotPassword(!isForgotPassword);
                        setStep(1);
                        setPhoneNumber("");
                        setVerificationCode("");
                        setNewPassword("");
                        setSmsExpiresAt(null);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      {isForgotPassword ? "برگشت به ورود" : "فراموشی رمز عبور"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[250px]"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">ساخت حساب جدید</h3>
                  
                  {signupStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="tel"
                          placeholder="شماره تلفن"
                          maxLength={11}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setSignupFormData({ ...signupFormData, phoneNumber: value });
                            setSignupPhoneError("");
                          }}
                          onKeyUp={(e) => handlePhoneKeyUp(e, setSignupPhoneError)}
                          className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 outline-none focus:border-blue-500 transition-colors text-right ${signupPhoneError ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {signupPhoneError && <p className="text-red-500 text-sm mt-1">{signupPhoneError}</p>}
                      </div>
                      <button
                        onClick={sendSignupCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        ارسال کد تایید
                      </button>
                    </div>
                  )}

                  {signupStep === 2 && (
                    <div className="space-y-4">
                      <OTPInput
                        value={signupVerificationCode}
                        onChange={setSignupVerificationCode}
                      />
                      {signupSmsExpiresAt && (
                        <div className="text-center">
                          {signupCountdown > 0 ? (
                            <p className={`text-sm font-medium ${signupCountdown > 60 ? 'text-green-600' : signupCountdown > 30 ? 'text-blue-600' : 'text-red-600'}`}>
                              {signupCountdown} ثانیه تا انقضا
                            </p>
                          ) : (
                            <button onClick={sendSignupCode} className="text-blue-500 text-sm font-medium">
                              ارسال مجدد کد
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        onClick={verifySignupCode}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        تایید کد
                      </button>
                    </div>
                  )}

                  {signupStep === 3 && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="نام فروشگاه"
                        onChange={(e) => setSignupFormData({ ...signupFormData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 outline-none focus:border-blue-500 transition-colors text-right"
                      />
                      <div>
                        <input
                          type="password"
                          placeholder="رمز عبور"
                          onChange={(e) => {
                            setSignupFormData({ ...signupFormData, password: e.target.value });
                            setSignupPasswordError("");
                          }}
                          className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 outline-none focus:border-blue-500 transition-colors text-right ${signupPasswordError ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {signupPasswordError && <p className="text-red-500 text-sm mt-1">{signupPasswordError}</p>}
                      </div>
                      <button
                        onClick={submitSignupData}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        ثبت نام
                      </button>
                    </div>
                  )}

                  {signupErrors && (
                    <p className="text-red-500 text-sm mt-4 text-center">{signupErrors}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <LoadingModal 
        isOpen={showSignupModal} 
        onComplete={() => {
          setShowSignupModal(false);
          toast.success("ثبت نام با موفقیت انجام شد");
        }} 
      />
    </div>
  );
}