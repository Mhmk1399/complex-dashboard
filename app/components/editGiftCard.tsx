import { useState, useEffect } from "react";
import {
  HiOutlineGift,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineTicket,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
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
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
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

const EditGiftCard = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [editData, setEditData] = useState({
    code: "",
    type: "fixed",
    amount: 0,
  });

  const fetchGiftCards = async () => {
    try {
      const response = await fetch("/api/giftcards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setGiftCards(data.giftCards || []);
    } catch {
      toast.error("خطا در دریافت کارتهای هدیه");
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const handleEdit = (giftCard: GiftCard) => {
    setEditingCard(giftCard);
    setEditData({
      code: giftCard.code,
      type: giftCard.type,
      amount: giftCard.amount,
    });
  };

  const handleUpdate = async () => {
    if (!editingCard) return;

    try {
      const response = await fetch(`/api/giftcards/${editingCard._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        toast.success("کارت هدیه با موفقیت بروزرسانی شد");
        setEditingCard(null);
        fetchGiftCards();
      } else {
        toast.error("خطا در بروزرسانی کارت هدیه");
      }
    } catch {
      toast.error("خطا در بروزرسانی کارت هدیه");
    }
  };

  const handleDelete = async (id: string) => {
 
    try {
      const response = await fetch(`/api/giftcards/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        toast.success("کارت هدیه با موفقیت حذف شد");
        fetchGiftCards();
      } else {
        toast.error("خطا در حذف کارت هدیه");
      }
    } catch {
      toast.error("خطا در حذف کارت هدیه");
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in" dir="rtl">
      {giftCards.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <HiOutlineGift className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">
            هیچ کارت هدیهای موجود نیست
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            از بخش افزودن، کارت هدیه جدید ایجاد کنید
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {giftCards.map((giftCard, index) => (
            <div
              key={giftCard._id}
              className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {editingCard?._id === giftCard._id ? (
                // Edit Mode
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                        <HiOutlineTicket className="inline-block ml-1 text-slate-600" />
                        کد کارت
                      </label>
                      <input
                        type="text"
                        value={editData.code}
                        onChange={(e) =>
                          setEditData({ ...editData, code: e.target.value })
                        }
                        className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                        نوع کارت
                      </label>
                      <select
                        value={editData.type}
                        onChange={(e) =>
                          setEditData({ ...editData, type: e.target.value })
                        }
                        className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                      >
                        <option value="fixed">مبلغ ثابت</option>
                        <option value="percentage">درصدی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                        <HiOutlineCurrencyDollar className="inline-block ml-1 text-slate-600" />
                        {editData.type === "fixed" ? "مبلغ (تومان)" : "درصد"}
                      </label>
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            amount: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                        min="1"
                        max={editData.type === "percentage" ? "100" : undefined}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
                    <button
                      onClick={() => setEditingCard(null)}
                      className="w-full sm:w-auto px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="w-full sm:w-auto px-5 py-2 text-sm bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg transition-all font-medium shadow-md"
                    >
                      ذخیره تغییرات
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-slate-900 to-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <HiOutlineGift className="text-white text-base sm:text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <HiOutlineTicket className="text-slate-500 flex-shrink-0 text-sm" />
                        <span className="font-medium text-slate-900 text-sm sm:text-base truncate">
                          {giftCard.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <HiOutlineCurrencyDollar className="text-slate-500 flex-shrink-0 text-sm" />
                        <span className="text-xs sm:text-sm text-slate-600">
                          {giftCard.type === "fixed"
                            ? `${giftCard.amount.toLocaleString()} تومان`
                            : `${giftCard.amount}% تخفیف`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        !giftCard.used
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {!giftCard.used ? "فعال" : "استفاده شده"}
                    </span>
                    <button
                      onClick={() => handleEdit(giftCard)}
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <HiOutlinePencil className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(giftCard._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <HiOutlineTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Info */}
      {giftCards.length > 0 && (
        <div className="mt-4 bg-gradient-to-r from-slate-50 to-slate-50 border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600"
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
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
              خلاصه آمار
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="bg-white rounded-lg p-2 sm:p-3">
              <div className="text-base sm:text-lg font-bold text-slate-900">
                {giftCards.length}
              </div>
              <div className="text-xs text-slate-600">کل کارت‌ها</div>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3">
              <div className="text-base sm:text-lg font-bold text-green-600">
                {giftCards.filter((card) => !card.used).length}
              </div>
              <div className="text-xs text-slate-600">فعال</div>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3">
              <div className="text-base sm:text-lg font-bold text-red-600">
                {giftCards.filter((card) => card.used).length}
              </div>
              <div className="text-xs text-slate-600">استفاده شده</div>
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default EditGiftCard;
