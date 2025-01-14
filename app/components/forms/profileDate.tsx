import { useEffect, useState } from "react";

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
    <div className="absolute top-2 left-4 p-2 bg-blue-400 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
      <div className="flex flex-col items-start space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-full bg-gradient-to-br from-pink-500 to-blue-600 rounded-full px-2 flex items-center justify-center">
            <span className="text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-white font-semibold">{userName}</span>
        </div>

        <div className="text-gray-100 text-sm">
          <div className="flex items-center space-x-2">
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
            <span dir="rtl">{currentDate}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
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
            <span dir="ltr">{currentTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDate;
