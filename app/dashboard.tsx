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
import AddCategory from "./components/forms/addCategory";
import { AddStory } from "./components/forms/addStory";
import { StoreSettings } from "./components/forms/storeSettings";
import InformationData from "./components/forms/informationData";

export const Dashboard = () => {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("ProductsSetting");
const[loading, setLoading] = useState(true);
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
            setLoading(false);
            // Update the greeting with user's name
          }
          if(response.status===404) {
            router.replace("/login");
            setTimeout(() => {
              setLoading(false);  
            }, 3000);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setLoading(false);
        }
      };

      fetchUserDetails();
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      router.replace("/login");
      setLoading(false);
    }
  }, [router]);
  useEffect(() => {
    console.log(selectedMenu);
  }, [selectedMenu]);

  const RenderForms = () => {
    switch (selectedMenu) {
      case "start":
        return <StartComponent setSelectedMenu={setSelectedMenu} />;
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
      case "addCategory":
        return <AddCategory />;
      case "addStory":
        return <AddStory />;
      case "siteSettings":
        return <StoreSettings />;
      case "accountSettings":
        return <InformationData />;
      default:
        return <StartComponent setSelectedMenu={setSelectedMenu} />;
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin">
              <div className="w-14 h-14 border-r-4 border-blue-400 border-solid rounded-full animate-spin-reverse"></div>
          </div>
      </div>
  );
  }
  
  return (
    <div className="">
      <Form setSelectedMenu={setSelectedMenu} />
      <RenderForms />
    </div>
  );
};
