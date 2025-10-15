import { useState, useEffect } from "react";
import EditGiftCard from "./editGiftCard";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineGift,
  HiOutlineTicket,
  HiOutlineCurrencyDollar,
  HiOutlineSave,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface GiftCard {
  _id: string;
  code: string;
  type: string;
  amount: number;
  storeId: string;
  used: boolean;
  userId?: string;
}

const AddGiftCard = () => {
  const [giftCardData, setGiftCardData] = useState({
    code: "",
    type: "fixed",
    amount: 0,
  });
  const [existingGiftCards, setExistingGiftCards] = useState<GiftCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGiftCards = async () => {
    try {
      const response = await fetch("/api/giftcards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setExistingGiftCards(data.giftCards || []);
    } catch (error) {
      toast.error("خطا در دریافت کارت‌های هدیه");
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGiftCardData({ ...giftCardData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardData.code.trim() || giftCardData.amount <= 0) {
      toast.error("تمام فیلدها الزامی است");
      return;
    }

    try {
      const response = await fetch("/api/giftcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...giftCardData,
          storeId: localStorage.getItem("storeId"),
        }),
      });

      if (response.ok) {
        toast.success("کارت هدیه با موفقیت ایجاد شد");
        setGiftCardData({ code: "", type: "fixed", amount: 0 });
        fetchGiftCards();
      } else {
        toast.error("خطا در ایجاد کارت هدیه");
      }
    } catch (error) {
      toast.error("خطا در ایجاد کارت هدیه");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen p-4 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 mt-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="md:text-3xl font-bold bg-gradient-to-r from-[#0077b6] to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                <HiOutlineGift className="text-4xl text-[#0077b6]" />
                مدیریت کارت‌های هدیه
              </h2>
              <p className="text-gray-500 hidden md:block mt-2">
                کارت‌های هدیه فروشگاه خود را ایجاد و مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r text-sm md:text-lg from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              ویرایش کارت‌های هدیه
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Gift Card Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <motion.h3
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xl font-bold mb-6 text-[#0077b6] flex items-center gap-3"
            >
              <PlusIcon className="h-6 w-6" />
              افزودن کارت هدیه جدید
            </motion.h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <label className="text-[#0077b6] font-bold flex items-center gap-2">
                  <HiOutlineTicket className="text-xl" />
                  کد کارت هدیه
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCardData.code}
                    onChange={(e) =>
                      setGiftCardData({ ...giftCardData, code: e.target.value })
                    }
                    className="flex-1 p-4 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all duration-300 outline-none"
                    placeholder="کد کارت هدیه را وارد کنید..."
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    تولید خودکار
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <label className="text-[#0077b6] font-bold flex items-center gap-2">
                  <HiOutlineCurrencyDollar className="text-xl" />
                  نوع کارت هدیه
                </label>
                <select
                  value={giftCardData.type}
                  onChange={(e) =>
                    setGiftCardData({ ...giftCardData, type: e.target.value })
                  }
                  className="w-full p-4 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all duration-300 outline-none"
                >
                  <option value="fixed">مبلغ ثابت</option>
                  <option value="percentage">درصدی</option>
                </select>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <label className="text-[#0077b6] font-bold flex items-center gap-2">
                  <HiOutlineCurrencyDollar className="text-xl" />
                  {giftCardData.type === "fixed"
                    ? "مبلغ (تومان)"
                    : "درصد تخفیف"}
                </label>
                <input
                  type="number"
                  value={giftCardData.amount}
                  onChange={(e) =>
                    setGiftCardData({
                      ...giftCardData,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full p-4 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all duration-300 outline-none"
                  placeholder={
                    giftCardData.type === "fixed"
                      ? "مبلغ را وارد کنید..."
                      : "درصد تخفیف را وارد کنید..."
                  }
                  min="1"
                  max={giftCardData.type === "percentage" ? "100" : undefined}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-center"
              >
                <button
                  type="submit"
                  className="flex items-center gap-3 bg-gradient-to-r from-[#0077b6] to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-bold"
                >
                  <HiOutlineSave className="text-xl" />
                  ذخیره کارت هدیه
                </button>
              </motion.div>
            </form>
          </div>

          {/* Gift Cards List */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0077b6] to-blue-600 p-6">
              <div className="flex justify-between items-center text-white">
                <div>
                  <h3 className="text-xl font-bold">کارت‌های هدیه موجود</h3>
                  <p className="text-blue-100 mt-1">
                    مجموع {existingGiftCards.length} کارت هدیه
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">فعال: </span>
                  <span className="font-bold">
                    {existingGiftCards.filter((card) => !card.used).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {existingGiftCards.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {existingGiftCards.map((giftCard, index) => (
                    <motion.div
                      key={giftCard._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-[#0077b6] to-blue-400 rounded-full flex items-center justify-center">
                          <HiOutlineGift className="text-white text-lg" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {giftCard.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {giftCard.type === "fixed"
                              ? `${giftCard.amount.toLocaleString()} تومان`
                              : `${giftCard.amount}% تخفیف`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            !giftCard.used
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {!giftCard.used ? "فعال" : "استفاده شده"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HiOutlineGift className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    هیچ کارت هدیه‌ای موجود نیست
                  </h3>
                  <p className="text-gray-500">
                    اولین کارت هدیه خود را ایجاد کنید
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  کل کارت‌های هدیه
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {existingGiftCards.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiOutlineGift className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  کارت‌های فعال
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {existingGiftCards.filter((card) => !card.used).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HiOutlineTicket className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">استفاده شده</p>
                <p className="text-2xl font-bold text-red-600">
                  {existingGiftCards.filter((card) => card.used).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <HiOutlineViewGrid className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              className="fixed inset-4 z-50 overflow-auto"
            >
              <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900">
                      ویرایش کارت‌های هدیه
                    </h3>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        fetchGiftCards();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg
                        className="h-6 w-6 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <EditGiftCard />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddGiftCard;
