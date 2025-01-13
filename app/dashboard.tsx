"use client";
import { useEffect, useState } from "react";
import Form from "./form";
import { ProductsSettings } from "./components/forms/productsSettings";
import { Inventory } from "./components/forms/inventory";
import { Collections } from "./components/forms/collections";
import { AddBlog } from "./components/forms/addBlog";
import { EditBlogs } from "./components/forms/editBlogs";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import { Orders } from "./components/forms/orders";
import { Costumers } from "./components/forms/costumers";
import UploadPage from "./components/forms/uploads";
import ImageGallery from "./components/forms/editFile";
import StartComponent from "./components/forms/startComponent";

export const Dashboard = () => {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("ProductsSetting");
  const [userName, setUserName] = useState("کاربر");

  useEffect(() => {
    const token = localStorage.getItem("token"); // Or however you store the token

    if (!token) {
      router.replace("/login"); // Redirect to login if token doesn't exist
      return;
    }
    try {
      // Extract user ID from token (assuming you store user ID in token)
      const decodedToken = jwt.decode(token);

      // Extract user ID from decoded token
      const userId =
        typeof decodedToken === "object" && decodedToken !== null
          ? decodedToken.sub || decodedToken.userId || decodedToken.id
          : undefined;

      if (!userId) {
        throw new Error("Invalid token: User ID not found");
      }

      // Fetch user details using the decoded user ID
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(`/api/auth/${userId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            console.log(userData.storeId);
            localStorage.setItem("storeId", userData.storeId);
            // Update the greeting with user's name
            setUserName(userData.name || "عزیز");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);
  useEffect(() => {
    console.log(selectedMenu);
  }, [selectedMenu]);

  const RenderForms = () => {
    switch (selectedMenu) {
      case "start":
        return <StartComponent />;
      case "addProduct":
        return <ProductsSettings />;
      case "inventory":
        return <Inventory />;
      case "collections":
        return <Collections />;
      case "addBlogs":
        return <AddBlog />;
      case "editBlogs":
        return <EditBlogs />;
      case "orders":
        return <Orders />;
      case "costumers":
        return <Costumers />;
      case "addFile":
        return <UploadPage />;
      case "editFile":
        return <ImageGallery />;
      case "orders":
        return <Orders />;
      default:
        return <StartComponent />;
    }
  };
  return (
    <div className="h-screen my-12">
      {/* <div className="px-4 py-16 mx-auto" dir="rtl">
        <div className="max-w-xl mb-10 md:mx-auto text-center">
          <div>
            <p className="inline-block px-3 py-4 text-base tracking-wider bg-pink-400 text-white rounded-full">
              <strong className="text-lg">{userName}</strong> عزیز به تومک خوش
              آمدی!
            </p>
          </div>
          <br />
          <h2 className="max-w-lg mb-6 text-3xl font-bold leading-none tracking-tight text-[#0077b6] sm:text-4xl md:mx-auto">
            راهنمای راه اندازی
          </h2>
          <p className="text-base text-gray-800 md:text-lg">
            با پر کردن اطلاعات مورد نیاز در این بخش می توانید محصولات خود را با
            تومک به فروش نزدیک کنید.
          </p>
        </div>
        <div className="space-y-3 p-10 mx-2 lg:mx-32 bg-[#0077b6]  rounded-2xl shadow-lg">
          <div className="flex items-center p-2 transition-colors duration-200 border rounded-lg shadow group hover:border-gray-200 hover:bg-white/60">
            <div className="mx-2">
              <svg
                width="25px"
                height="32px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </div>
            <Link
              href="/complex"
              className="text-gray-100 font-bold transition-colors ease-in-out duration-300 group-hover:text-[#0077b6]"
            >
              تدوین و تنظیمات سایت
            </Link>
          </div>
          <div className="flex items-center p-2 transition-colors duration-200 border rounded-lg shadow group         hover:border-gray-200 hover:bg-white/60">
            <div className="mx-2">
              <svg
                width="25px"
                height="32px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M15 12H12M12 12H9M12 12V9M12 12V15M17 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21Z"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  ></path>{" "}
                </g>
              </svg>
            </div>
            <button
              onClick={handleOpenProduct}
              className="text-gray-100 font-bold transition-colors ease-in-out duration-300 group-hover:text-[#0077b6]"
            >
              افزودن محصول
            </button>
          </div>
          <div className="flex items-center p-2 transition-colors duration-200 border rounded-lg shadow group         hover:border-gray-200 hover:bg-white/60">
            <div className="mx-2">
              <svg
                width="25px"
                height="32px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="13"
                    rx="2"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></rect>{" "}
                  <path
                    d="M3 10H20.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M7 15H9"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </div>
            <button
              onClick={togglePaymentMethodDropdown}
              className="text-gray-100 font-bold transition-colors ease-in-out duration-300 group-hover:text-[#0077b6]"
            >
              تعریف روش پرداخت - (
              {selectedPaymentMethod === "online"
                ? "آنلاین"
                : selectedPaymentMethod === "cash"
                ? "نقدی"
                : selectedPaymentMethod === "installment"
                ? "اقساطی"
                : ""}
              )
            </button>
            {isPaymentMethodOpen && (
              <div className="absolute top-[40%] right-1/2 mt-2 px-10 py-3  bg-white shadow-lg rounded-lg z-10">
                <div
                  onClick={() => handlePaymentMethodSelect("online")}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  پرداخت آنلاین
                </div>
                <hr />
                <div
                  onClick={() => handlePaymentMethodSelect("cash")}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  پرداخت نقدی
                </div>
                <hr />
                <div
                  onClick={() => handlePaymentMethodSelect("installment")}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  پرداخت اقساطی
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center p-2 transition-colors duration-200 border rounded-lg shadow group         hover:border-gray-200 hover:bg-white/60">
            <div className="mx-2">
              <svg
                fill="#ffffff"
                width="25px"
                height="32px"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M24.964844 1 A 1.0001 1.0001 0 0 0 24.382812 1.2128906L1.3828125 19.212891 A 1.0002305 1.0002305 0 1 0 2.6171875 20.787109L4 19.705078L4 46 A 1.0001 1.0001 0 0 0 5 47L45 47 A 1.0001 1.0001 0 0 0 46 46L46 19.705078L47.382812 20.787109 A 1.0002308 1.0002308 0 1 0 48.617188 19.212891L25.617188 1.2128906 A 1.0001 1.0001 0 0 0 24.964844 1 z M 25 3.2695312L44 18.138672L44 45L6 45L6 18.138672L25 3.2695312 z M 12 19L12 20L12 38L38 38L38 19L12 19 z M 14 21L36 21L36 21.494141L26.400391 28.570312L26.392578 28.576172C25.664322 29.132295 24.534897 29.132295 23.806641 28.576172L23.796875 28.566406L14 21.488281L14 21 z M 14 23.957031L19.462891 27.902344L14 32L14 23.957031 z M 36 23.978516L36 32L30.605469 27.955078L36 23.978516 z M 21.162109 29.128906L22.59375 30.164062C24.065494 31.28794 26.135678 31.287939 27.607422 30.164062L28.923828 29.193359L36 34.5L36 36L14 36L14 34.5L21.162109 29.128906 z"></path>
                </g>
              </svg>
            </div>
            <button
              onClick={toggleShippingMethodDropdown}
              className="text-gray-100 font-bold transition-colors ease-in-out duration-300 group-hover:text-[#0077b6]"
            >
              تعریف روش ارسال - (
              {selectedShippingMethod === "post"
                ? "پست"
                : selectedShippingMethod === "express"
                ? "پیک"
                : selectedShippingMethod === "digital"
                ? "دیجیتال"
                : ""}
              )
            </button>
            {isShippingMethodOpen && (
              <div className="absolute top-[40%] right-1/2 mt-2 px-10 py-3 bg-white shadow-lg rounded-lg z-10">
                <div
                  onClick={() => handleShippingMethodSelect("post")}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  ارسال با پست
                </div>
                <hr />
                <div
                  onClick={() => handleShippingMethodSelect("express")}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  ارسال با پیک
                </div>
                <hr />
                <div
                  onClick={() => handleShippingMethodSelect("digital")}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  محصول دیجیتال
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center p-2 transition-colors duration-200 border rounded-lg shadow group         hover:border-gray-200 hover:bg-white/60">
            <div className="mx-2">
              <svg
                width="25px"
                height="32px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M8 14.5714L6.17716 12.8354C5.53522 12.224 4.51329 12.2705 3.92953 12.9377V12.9377C3.40196 13.5406 3.41749 14.4453 3.96544 15.0298L9.90739 21.3679C10.2855 21.7712 10.8127 22 11.3655 22C12.4505 22 14.2343 22 16 22C18.4 22 20 20 20 18C20 18 20 18 20 18C20 18 20 11.1429 20 9.42859"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M17 9.99995C17 9.99995 17 9.87483 17 9.42852C17 7.1428 20 7.1428 20 9.42852"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M14 9.99998C14 9.99998 14 9.17832 14 8.2857C14 5.99998 17 5.99998 17 8.2857C17 8.50885 17 9.2054 17 9.42855C17 9.87487 17 9.99998 17 9.99998"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M11 10.0001C11 10.0001 11 8.61584 11 7.50005C11 5.21434 14 5.21434 14 7.50005C14 7.50005 14 7.50005 14 7.50005C14 7.50005 14 8.06261 14 8.28577C14 9.17839 14 10.0001 14 10.0001"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M8 14.5714V3.5C8 2.67157 8.67157 2 9.5 2V2C10.3284 2 11 2.67056 11 3.49899C11 4.68968 11 6.34156 11 7.5C11 8.61578 11 10 11 10"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </div>
            <Link
              href=""
              className="text-gray-100 font-bold transition-colors ease-in-out duration-300 group-hover:text-[#0077b6]"
            >
              افتتاح سایت
            </Link>
          </div>
        </div>
      </div> */}
      <Form setSelectedMenu={setSelectedMenu} />
      <RenderForms />
    </div>
  );
};
