"use client";
import { useEffect, useState } from "react";
import Form from "./form";
import { ProductsSettings } from "./components/forms/productsSettings";
import { Inventory } from "./components/forms/inventory";
import { Collection } from "./components/forms/collections";
import { AddBlog } from "./components/forms/addBlog";
import { EditBlogs } from "./components/forms/editBlogs";
import { useRouter } from "next/navigation";
import { 
  FaEdit, 
  FaCreditCard, 
  FaTruck, 
  FaExternalLinkAlt 
} from 'react-icons/fa';

const paymentMethods = [
  { id: 'stripe', name: 'Stripe', icon: <FaCreditCard /> },
  { id: 'paypal', name: 'PayPal', icon: <FaCreditCard /> },
  { id: 'bank', name: 'Bank Transfer', icon: <FaCreditCard /> }
];

const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', icon: <FaTruck /> },
  { id: 'express', name: 'Express Shipping', icon: <FaTruck /> },
  { id: 'international', name: 'International Shipping', icon: <FaTruck /> }
];
export const Dashboard = () => {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("ProductsSetting");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem("token"); // Or however you store the token

    if (!token) {
      router.replace("/login"); // Redirect to login if token doesn't exist
    }
    // Optionally, you can verify the token on the server here
    // and redirect if it's invalid.  Example below:
    // fetch('/api/auth/verify', {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // })
    // .then(res => {
    //   if (!res.ok) {
    //     localStorage.removeItem('token'); // Remove invalid token
    //     router.push('/login');
    //   }
    // })
    // .catch(err => {
    //   console.error("Error verifying token:", err);
    //   localStorage.removeItem('token');
    //   router.push('/login');
    // });
  }, [router]);

  useEffect(() => {
    console.log(selectedMenu);
  }, [selectedMenu]);
  const RenderForms = () => {
    switch (selectedMenu) {
      case "addProduct":
        return <ProductsSettings />;
      case "inventory":
        return <Inventory />;
      case "collections":
        return <Collection />;
      case "addBlogs":
        return <AddBlog />;
      case "editBlogs":
        return <EditBlogs />;
      default:
        return null;
    }
  };
  return (
    <div className="h-screen bg-[#caf0f8]">
      <Form setSelectedMenu={setSelectedMenu} />
      <RenderForms />
      
      
    
    </div>
  );
};
