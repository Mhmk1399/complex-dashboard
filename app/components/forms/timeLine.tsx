import React from "react";

const TimeLineData = [
  {
    text: "به وبسایت ما خوش آمدید",
    position: "start",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
  },
  {
    text: "ما بهترین خدمات را ارائه می‌دهیم",
    position: "end",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    ),
  },
  {
    text: "تیم ما با تجربه و متخصص است",
    position: "start",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    text: "با ما در ارتباط باشید",
    position: "end",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    ),
  },
];


const TimeLine = () => {
  const TimeLineItem = ({ text, position, icon, isLast }: any) => (
    <div className={`mt-6 sm:mt-0 ${!isLast ? 'sm:mb-12' : ''}`}>
      <div className="flex flex-col sm:flex-row items-center">
        <div className={`flex justify-${position} w-full mx-auto items-center`}>
          <div className={`w-full sm:w-1/2 ${position === 'start' ? 'sm:pr-8' : 'sm:pl-8'}`}>
            <div className="p-4 bg-white rounded shadow">
              {text}
            </div>
          </div>
        </div>
        <div className="rounded-full bg-blue-500 border-white border-4 w-8 h-8 absolute left-1/2 -translate-y-4 sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {icon}
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50 py-6 flex flex-col justify-center sm:py-12" dir="rtl"> 
      <div className="py-3 sm:max-w-xl sm:mx-auto w-full px-2 sm:px-0">
        <div className="relative text-gray-700 antialiased text-sm font-semibold">
          <div className="hidden sm:block w-1 bg-blue-300 absolute h-full left-1/2 transform -translate-x-1/2"></div>
          {TimeLineData.map((item, index) => (
            <TimeLineItem
              key={index}
              text={item.text}
              position={item.position}
              icon={item.icon}
              isLast={index === TimeLineData.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeLine;
