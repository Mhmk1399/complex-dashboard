"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .animate-spin { animation: spin 1s linear infinite; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface Contact {
  _id: string;
  storeId: string;
  phone: string;
  massage: string;
  name: string;
  createdAt?: string;
}

interface ContactFilters {
  search: string;
  sortBy: "name" | "phone" | "date";
  sortOrder: "asc" | "desc";
}

const ContactComponent: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<ContactFilters>({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("توکن احراز هویت یافت نشد");
        return;
      }

      const response = await fetch("/api/contact", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`خطای HTTP! وضعیت: ${response.status}`);
      }

      const data = await response.json();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت پیام‌ها با خطا مواجه شد"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort contacts
  useEffect(() => {
    let filtered = [...contacts];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          contact.phone.includes(filters.search) ||
          contact.massage?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "phone":
          aValue = a.phone;
          bValue = b.phone;
          break;
        case "date":
          aValue = a.createdAt || "";
          bValue = b.createdAt || "";
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, filters]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("آیا از حذف این پیام اطمینان دارید؟")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/contact/${contactId}`, {
        method: "DELETE",
        headers: {
          Authorization: token || "",
        },
      });

      if (response.ok) {
        setContacts(contacts.filter((contact) => contact._id !== contactId));
      }
    } catch (err) {
      console.log("حذف پیام با خطا مواجه شد:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        dir="rtl"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center max-w-md w-full">
          <div className="text-red-600 font-medium mb-2 text-sm sm:text-base">
            خطا در بارگذاری پیام‌ها
          </div>
          <div className="text-red-500 text-xs sm:text-sm mb-4">{error}</div>
          <button
            onClick={fetchContacts}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-3 sm:p-4 py-4 sm:py-6 animate-fade-in mt-10"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6 animate-slide-up">
          <div className="flex  items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-slate-900 to-slate-900 p-2 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                  پیام‌های تماس
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  مدیریت پیام‌ها و درخواست‌های مشتریان
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-200">
              <span className="text-slate-600 font-semibold text-sm sm:text-base">
                {filteredContacts.length} پیام
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در پیام‌ها..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pr-9 sm:pr-10 pl-3 sm:pl-4 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as "name" | "phone" | "date",
                  }))
                }
                className="flex-1 sm:flex-none px-3 py-2 sm:py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              >
                <option value="name">بر اساس نام</option>
                <option value="phone">بر اساس تلفن</option>
                <option value="date">بر اساس تاریخ</option>
              </select>

              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                  }))
                }
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                title={filters.sortOrder === "asc" ? "صعودی" : "نزولی"}
              >
                {filters.sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="grid gap-3 sm:gap-4">
          {filteredContacts.length === 0 ? (
            <div className="backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center animate-slide-up">
              <ChatBubbleLeftRightIcon className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">
                پیامی یافت نشد
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm">
                {filters.search
                  ? "معیارهای جستجو را تغییر دهید"
                  : "هنوز پیام مشتری‌ای دریافت نشده"}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact, index) => (
              <div
                key={contact._id}
                className="bg-white rounded-lg sm:rounded-xl shadow-md border border-slate-200 p-3 sm:p-5 hover:shadow-lg hover:border-slate-300 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="bg-gradient-to-br from-slate-900 to-slate-900 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                          {contact.name || "ناشناس"}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                          <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate" dir="ltr">
                            {contact.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {contact.massage && (
                      <div className="bg-slate-50 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                          {contact.massage.length > 150
                            ? `${contact.massage.substring(0, 150)}...`
                            : contact.massage}
                        </p>
                      </div>
                    )}

                    {contact.createdAt && (
                      <p className="text-xs text-slate-500">
                        {new Date(contact.createdAt).toLocaleDateString(
                          "fa-IR"
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewContact(contact)}
                      className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="مشاهده جزئیات"
                    >
                      <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Card */}
        {filteredContacts.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white animate-slide-up">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              آمار پیام‌ها
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                <div className="text-lg sm:text-2xl font-bold mb-1">
                  {contacts.length}
                </div>
                <div className="text-slate-100">کل پیام‌ها</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                <div className="text-lg sm:text-2xl font-bold mb-1">
                  {filteredContacts.length}
                </div>
                <div className="text-slate-100">نمایش داده شده</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center col-span-2 sm:col-span-1">
                <div className="text-lg sm:text-2xl font-bold mb-1">
                  {
                    contacts.filter(
                      (c) =>
                        c.createdAt &&
                        new Date(c.createdAt).toDateString() ===
                          new Date().toDateString()
                    ).length
                  }
                </div>
                <div className="text-slate-100">امروز</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                جزئیات پیام
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
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

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  نام
                </label>
                <p className="text-slate-900 text-sm sm:text-base">
                  {selectedContact.name || "ارائه نشده"}
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  تلفن
                </label>
                <p className="text-slate-900 text-sm sm:text-base" dir="ltr">
                  {selectedContact.phone}
                </p>
              </div>

              {selectedContact.massage && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    پیام
                  </label>
                  <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200">
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedContact.massage}
                    </p>
                  </div>
                </div>
              )}

              {selectedContact.createdAt && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    تاریخ ارسال
                  </label>
                  <p className="text-slate-900 text-sm sm:text-base">
                    {new Date(selectedContact.createdAt).toLocaleDateString(
                      "fa-IR"
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
              >
                بستن
              </button>
              <a
                href={`tel:${selectedContact.phone}`}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-md"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>تماس</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactComponent;
