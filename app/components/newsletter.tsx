"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone } from "react-icons/fa";

interface Newsletter {
  _id: string;
  storeId: string;
  phoneNumber: string;
  createdAt: string;
}

export const Newsletter = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const response = await fetch("/api/newsletter");
        const data = await response.json();
        setNewsletters(data);
      } catch (error) {
        console.error("Error fetching newsletters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaEnvelope className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">خبرنامه</h2>
        </div>

        {newsletters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            هیچ عضو خبرنامه‌ای یافت نشد
          </div>
        ) : (
          <div className="grid gap-4">
            {newsletters.map((newsletter) => (
              <motion.div
                key={newsletter._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FaPhone className="text-green-600" />
                  <span className="font-medium">{newsletter.phoneNumber}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(newsletter.createdAt).toLocaleDateString("fa-IR")}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};