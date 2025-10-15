"use client";
import { useState, useEffect } from "react";

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
      body: JSON.stringify({ status })
    });
    fetchTickets();
    if (selectedTicket?._id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: status as Ticket['status'] });
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    
    const response = await fetch(`/api/tickets/${selectedTicket._id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage, sender: "admin" })
    });
    
    const updatedTicket = await response.json();
    setSelectedTicket(updatedTicket);
    setNewMessage("");
    fetchTickets();
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800", 
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/3 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Customer Tickets</h2>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-2 w-full p-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div className="overflow-y-auto">
          {tickets.length > 0 ? tickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedTicket?._id === ticket._id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium truncate">{ticket.subject}</h3>
                <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{ticket.customer.name}</p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-4 text-center text-gray-500">
              هیچ تیکتی یافت نشد
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            <div className="p-4 border-b bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                  <p className="text-gray-600">{selectedTicket.customer.name} - {selectedTicket.customer.email}</p>
                </div>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket._id, e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "admin"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === "admin" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 p-2 border rounded"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a ticket to view details
          </div>
        )}
      </div>
    </div>
  );
}