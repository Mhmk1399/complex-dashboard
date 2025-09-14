import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProfileDateProps {
  userName: string;
}

const ProfileDate: React.FC<ProfileDateProps> = ({ userName }) => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const getPersianDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "persian",
    };
    return new Intl.DateTimeFormat("fa-IR", options).format(date);
  };

  const getTime = () => {
    const date = new Date();
    return date.toLocaleTimeString("fa-IR");
  };

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDate(getPersianDate());
      setCurrentTime(getTime());
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      transition={{ duration: 0.5, type: "spring" }}
      className="absolute lg:top-2 lg:left-4 top-16 left-6 lg:p-1.5 p-0.5 mt-4 bg-white backdrop-blur-md rounded-md border border-white/20 transition-all duration-300"
      dir="rtl"
    >
      <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse px-2">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="h-8 w-8 bg-gradient-to-br from-pink-500 to-blue-600 rounded-full flex items-center justify-center"
        >
          <span className="text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </span>
        </motion.div>

        <span className="text-black font-semibold min-w-[80px]">
          {userName}
        </span>

        <motion.div className="flex items-center space-x-4 space-x-reverse text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <motion.span dir="rtl" className="transition-all">
              {currentDate}
            </motion.span>
          </div>

          <div className="flex lg:w-24 items-center gap-2 border-r border-white/20 pr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <motion.span dir="ltr" className=" transition-all">
              {currentTime}
            </motion.span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileDate;
