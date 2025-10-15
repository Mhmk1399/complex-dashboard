"use client";
import { useState, useEffect } from "react";

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
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.3s ease-out; }
  .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
  .animate-slide-in-left { animation: slideInLeft 0.3s ease-out; }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface Message {
  sender: "customer" | "admin";
  content: string;
  timestamp: Date;
}

interface Ticket {
  _id: string;
  customer: { name: string; email: string };
  subject: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/tickets?${params}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.log("Failed to fetch tickets:", error);
      setTickets([]);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTickets();
    if (selectedTicket?._id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        status: status as Ticket["status"],
      });
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    const response = await fetch(
      `/api/tickets/${selectedTicket._id}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, sender: "admin" }),
      }
    );

    const updatedTicket = await response.json();
    setSelectedTicket(updatedTicket);
    setNewMessage("");
    fetchTickets();
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority as keyof typeof colors];
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      low: "کم",
      medium: "متوسط",
      high: "بالا",
      urgent: "فوری",
    };
    return texts[priority as keyof typeof texts];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-slate-100 text-slate-700",
      "in-progress": "bg-purple-100 text-purple-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-slate-100 text-slate-700",
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const texts = {
      open: "باز",
      "in-progress": "در حال بررسی",
      resolved: "حل شده",
      closed: "بسته شده",
    };
    return texts[status as keyof typeof texts];
  };

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowMobileChat(true);
  };

  return (
    <div
      className="flex flex-col lg:flex-row h-screen  backdrop-blur-md animate-fade-in mt-20"
      dir="rtl"
    >
      {/* Tickets List */}
      <div
        className={`w-full lg:w-1/3 bg-white border-l border-slate-200 flex flex-col ${
          showMobileChat ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-900">
          <h2 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
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
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            تیکت‌های مشتریان
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none bg-white text-slate-900"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="open">باز</option>
            <option value="in-progress">در حال بررسی</option>
            <option value="resolved">حل شده</option>
            <option value="closed">بسته شده</option>
          </select>
        </div>

        {/* Tickets List */}
        <div className="overflow-y-auto flex-1">
          {tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <div
                key={ticket._id}
                onClick={() => handleTicketSelect(ticket)}
                className={`p-3 sm:p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors animate-slide-up ${
                  selectedTicket?._id === ticket._id
                    ? "bg-slate-50 border-r-4 border-r-slate-600"
                    : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-medium text-slate-900 text-sm sm:text-base truncate flex-1">
                    {ticket.subject}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {getPriorityText(ticket.priority)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mb-2 flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="truncate">{ticket.customer.name}</span>
                </p>
                <div className="flex justify-between items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusText(ticket.status)}
                  </span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(ticket.updatedAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 sm:p-8 text-center text-slate-500 animate-slide-up">
              <svg
                className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <p className="text-sm sm:text-base">هیچ تیکتی یافت نشد</p>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {tickets.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50">
            <div className="grid grid-cols-2 gap-2 text-center text-xs sm:text-sm">
              <div className="bg-white rounded-lg p-2 border border-slate-200">
                <div className="font-bold text-slate-900">{tickets.length}</div>
                <div className="text-slate-600">کل تیکت‌ها</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-slate-200">
                <div className="font-bold text-slate-600">
                  {tickets.filter((t) => t.status === "open").length}
                </div>
                <div className="text-slate-600">باز</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div
        className={`flex-1 flex flex-col ${
          showMobileChat ? "flex" : "hidden lg:flex"
        }`}
      >
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-white animate-slide-in-right">
              <div className="flex items-center justify-between gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
                    {selectedTicket.customer.name} -{" "}
                    {selectedTicket.customer.email}
                  </p>
                </div>
                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    updateTicketStatus(selectedTicket._id, e.target.value)
                  }
                  className="p-2 sm:p-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="open">باز</option>
                  <option value="in-progress">در حال بررسی</option>
                  <option value="resolved">حل شده</option>
                  <option value="closed">بسته شده</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50">
              {selectedTicket.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "admin" ? "justify-start" : "justify-end"
                  } animate-slide-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg ${
                      message.sender === "admin"
                        ? "bg-gradient-to-r from-slate-900 to-slate-900 text-white"
                        : "bg-white text-slate-800 border border-slate-200"
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "admin"
                          ? "text-slate-200"
                          : "text-slate-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                  className="flex-1 p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg transition-all text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  ارسال
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 animate-fade-in">
            <svg
              className="h-16 w-16 sm:h-20 sm:w-20 mb-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm sm:text-base text-center">
              یک تیکت را انتخاب کنید تا جزئیات آن نمایش داده شود
            </p>
          </div>
        )}
      </div>

      {/* Help Card - Only on desktop */}
      {!selectedTicket && (
        <div className="hidden lg:block absolute bottom-4 right-4 max-w-sm">
          <div className="bg-gradient-to-r from-slate-900 to-slate-900 rounded-xl shadow-lg p-4 text-white">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <svg
                className="h-4 w-4"
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
              راهنما
            </h3>
            <p className="text-xs text-slate-100">
              با انتخاب تیکت از لیست، می‌توانید پیام‌ها را مشاهده و پاسخ دهید
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
