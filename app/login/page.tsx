"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        router.replace("http://localhost:3000");
        console.log(data.token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to login. Please try again."+err);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 to-purple-700"
        dir="rtl"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16 bg-white/50 p-10 rounded-full shadow-lg text-center text-xl font-bold text-purple-800"
        >
          <span className="text-purple-900 text-4xl">صفحه ورود</span>
        </motion.h1>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-md w-full space-y-8 p-8 border-l-2 border-purple-600 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md"
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-700">
              لطفا وارد شوید
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-red-500 text-center text-sm"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-4">
              <div className="relative">
                <FaPhoneAlt className="text-gray-500 absolute top-4 z-50 -right-5" />

                <input
                  dir="rtl"
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-violet-400 focus:border-indigo-100"
                  placeholder="شماره تلفن"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="relative">
                <FaLock className="text-gray-500 absolute top-4 z-50 -right-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Change type dynamically
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-violet-400 focus:border-indigo-100"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-4 left-3 text-gray-500 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="#" className=" text-gray-500 mr-2 hover:underline underline-offset-4">
                فراموشی رمز عبور؟
                </Link>
                <Link href="/signIn" className=" text-gray-500 ml-2 hover:underline underline-offset-4">
                  ثبت نام
                </Link>
            </div>
            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-base transition-all duration-200 font-medium rounded-md text-white bg-violet-700 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ورود
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}
