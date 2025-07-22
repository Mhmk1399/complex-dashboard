"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PhoneIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

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
  sortBy: 'name' | 'phone' | 'date';
  sortOrder: 'asc' | 'desc';
}

const ContactComponent: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<ContactFilters>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
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
          "Authorization": token,
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
      setError(err instanceof Error ? err.message : "دریافت پیام‌ها با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort contacts
  useEffect(() => {
    let filtered = [...contacts];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(contact =>
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
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'phone':
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 'date':
          aValue = a.createdAt || '';
          bValue = b.createdAt || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (filters.sortOrder === 'asc') {
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
          "Authorization": token || "",
        },
      });

      if (response.ok) {
        setContacts(contacts.filter(contact => contact._id !== contactId));
      }
    } catch (err) {
      console.error("حذف پیام با خطا مواجه شد:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div

          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div

        className="bg-red-50 border border-red-200 rounded-lg p-6 text-cente mt-20"
        dir="rtl"
      >
        <div className="text-red-600 font-medium mb-2">خطا در بارگذاری پیام‌ها</div>
        <div className="text-red-500 text-sm mb-4">{error}</div>
        <button
          onClick={fetchContacts}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 mt-20" dir="rtl">
      {/* Header */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">پیام‌های تماس</h1>
              <p className="text-gray-600">مدیریت پیام‌ها و درخواست‌های مشتریان</p>
            </div>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-600 font-semibold">{filteredContacts.length} پیام</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در پیام‌ها..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'name' | 'phone' | 'date' }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">مرتب‌سازی بر اساس نام</option>
              <option value="phone">مرتب‌سازی بر اساس تلفن</option>
              <option value="date">مرتب‌سازی بر اساس تاریخ</option>
            </select>
            
            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={filters.sortOrder === 'asc' ? 'صعودی' : 'نزولی'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contacts List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredContacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
            >
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">پیامی یافت نشد</h3>
              <p className="text-gray-600">
                {filters.search ? "معیارهای جستجو را تغییر دهید" : "هنوز پیام مشتری‌ای دریافت نشده"}
              </p>
            </motion.div>
          ) : (
            filteredContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-3">
                      <div className="bg-gradient-to-br from-pink-500 to-blue-600 p-2 rounded-full">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {contact.name || "ناشناس"}
                        </h3>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    {contact.massage && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {contact.massage.length > 150 
                            ? `${contact.massage.substring(0, 150)}...` 
                            : contact.massage
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 space-x-reverse mr-4">
                    <button
                      onClick={() => handleViewContact(contact)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="مشاهده جزئیات"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Contact Detail Modal */}
      <AnimatePresence>
        {showModal && selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">جزئیات پیام</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                  <p className="text-gray-900">{selectedContact.name || "ارائه نشده"}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تلفن</label>
                  <p className="text-gray-900">{selectedContact.phone}</p>
                </div>
                
                {selectedContact.massage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">پیام</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedContact.massage}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedContact.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ارسال</label>
                    <p className="text-gray-900">
                      {new Date(selectedContact.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  بستن
                </button>
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>تماس</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactComponent;
