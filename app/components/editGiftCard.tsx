import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  HiOutlineGift,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineTicket,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

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
    if (!confirm("آیا از حذف این کارت هدیه اطمینان دارید؟")) return;

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
    <div className="space-y-6" dir="rtl">
      {giftCards.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineGift className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            هیچ کارت هدیهای موجود نیست
          </h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {giftCards.map((giftCard, index) => (
            <motion.div
              key={giftCard._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              {editingCard?._id === giftCard._id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        کد کارت هدیه
                      </label>
                      <input
                        type="text"
                        value={editData.code}
                        onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع
                      </label>
                      <select
                        value={editData.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="fixed">مبلغ ثابت</option>
                        <option value="percentage">درصدی</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {editData.type === "fixed" ? "مبلغ (تومان)" : "درصد"}
                      </label>
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max={editData.type === "percentage" ? "100" : undefined}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setEditingCard(null)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ذخیره
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <HiOutlineGift className="text-white text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <HiOutlineTicket className="text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {giftCard.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <HiOutlineCurrencyDollar className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {giftCard.type === "fixed" 
                            ? `${giftCard.amount.toLocaleString()} تومان`
                            : `${giftCard.amount}% تخفیف`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        !giftCard.used
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {!giftCard.used ? "فعال" : "استفاده شده"}
                    </span>
                    <button
                      onClick={() => handleEdit(giftCard)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <HiOutlinePencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(giftCard._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditGiftCard;