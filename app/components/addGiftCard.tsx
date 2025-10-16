import { useState, useEffect } from "react";
import EditGiftCard from "./editGiftCard";
import {
  HiOutlineGift,
  HiOutlineTicket,
  HiOutlineCurrencyDollar,
  HiOutlineSave,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

// CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-slide-down { animation: slideDown 0.2s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

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
    <div className="min-h-screen p-3 sm:p-4 py-4 sm:py-6 mt-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6 animate-slide-down">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
                <HiOutlineGift className="text-2xl sm:text-3xl md:text-4xl text-slate-900" />
                مدیریت کارت‌های هدیه
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 sm:mt-2">
                کارت‌های هدیه فروشگاه خود را ایجاد و مدیریت کنید
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white font-medium text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              ویرایش کارت‌های هدیه
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Gift Card Form */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 animate-slide-up">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-slate-900 flex items-center gap-2">
              <PlusIcon className="h-5 w-5 text-slate-600" />
              افزودن کارت هدیه جدید
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                  <HiOutlineTicket className="text-base sm:text-lg text-slate-600" />
                  کد کارت هدیه
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCardData.code}
                    onChange={(e) =>
                      setGiftCardData({ ...giftCardData, code: e.target.value })
                    }
                    className="flex-1 p-2.5 sm:p-3 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                    placeholder="کد کارت هدیه..."
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 sm:px-4 py-2 bg-slate-600 text-white text-xs sm:text-sm rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    تولید خودکار
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                  <HiOutlineCurrencyDollar className="text-base sm:text-lg text-slate-600" />
                  نوع کارت هدیه
                </label>
                <select
                  value={giftCardData.type}
                  onChange={(e) =>
                    setGiftCardData({ ...giftCardData, type: e.target.value })
                  }
                  className="w-full p-2.5 sm:p-3 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="fixed">مبلغ ثابت</option>
                  <option value="percentage">درصدی</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                  <HiOutlineCurrencyDollar className="text-base sm:text-lg text-slate-600" />
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
                  className="w-full p-2.5 sm:p-3 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all outline-none"
                  placeholder={
                    giftCardData.type === "fixed"
                      ? "مبلغ را وارد کنید..."
                      : "درصد تخفیف را وارد کنید..."
                  }
                  min="1"
                  max={giftCardData.type === "percentage" ? "100" : undefined}
                  required
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg"
                >
                  <HiOutlineSave className="text-base sm:text-lg" />
                  ذخیره کارت هدیه
                </button>
              </div>
            </form>
          </div>

          {/* Gift Cards List */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-slate-900 to-slate-900 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-white">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    کارت‌های هدیه موجود
                  </h3>
                  <p className="text-slate-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    مجموع {existingGiftCards.length} کارت هدیه
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                  <span>فعال: </span>
                  <span className="font-bold">
                    {existingGiftCards.filter((card) => !card.used).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {existingGiftCards.length > 0 ? (
                <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
                  {existingGiftCards.map((giftCard, index) => (
                    <div
                      key={giftCard._id}
                      className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-50 transition-all duration-200 animate-slide-down"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-slate-900 to-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <HiOutlineGift className="text-white text-sm sm:text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-xs sm:text-sm truncate">
                            {giftCard.code}
                          </div>
                          <div className="text-xs text-slate-500">
                            {giftCard.type === "fixed"
                              ? `${giftCard.amount.toLocaleString()} تومان`
                              : `${giftCard.amount}% تخفیف`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${
                            !giftCard.used
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {!giftCard.used ? "فعال" : "استفاده شده"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12">
                  <HiOutlineGift className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
                    هیچ کارت هدیه‌ای موجود نیست
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    اولین کارت هدیه خود را ایجاد کنید
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4 animate-slide-up">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-center sm:text-right w-full">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  کل کارت‌ها
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {existingGiftCards.length}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-slate-100 rounded-lg items-center justify-center flex-shrink-0">
                <HiOutlineGift className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-center sm:text-right w-full">
                <p className="text-xs font-medium text-slate-600 mb-1">فعال</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {existingGiftCards.filter((card) => !card.used).length}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg items-center justify-center flex-shrink-0">
                <HiOutlineTicket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-center sm:text-right w-full">
                <p className="text-xs font-medium text-slate-600 mb-1">
                  استفاده شده
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {existingGiftCards.filter((card) => card.used).length}
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-lg items-center justify-center flex-shrink-0">
                <HiOutlineViewGrid className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-slate-900 to-slate-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white animate-slide-up">
          <h3 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            نکات مهم
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">💳 کارت ثابت</h4>
              <p className="text-slate-100">
                مبلغ مشخصی از هزینه خرید کسر می‌شود (مثلاً 50,000 تومان)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-1.5">📊 کارت درصدی</h4>
              <p className="text-slate-100">
                درصدی از هزینه خرید کسر می‌شود (مثلاً 10%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 overflow-auto p-2 sm:p-4 animate-scale-in">
            <div className="min-h-full flex items-center justify-center">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex justify-between items-center z-10">
                  <h3 className="text-base sm:text-xl font-bold text-slate-900">
                    ویرایش کارت‌های هدیه
                  </h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      fetchGiftCards();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500"
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
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                  <EditGiftCard />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddGiftCard;
