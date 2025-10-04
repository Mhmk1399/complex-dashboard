"use client";
import { useState, useEffect } from "react";

interface Ticket {
  status: string;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export default function TicketStats() {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/tickets");
      const tickets = await response.json();
      
      if (Array.isArray(tickets)) {
        const newStats = {
          total: tickets.length,
          open: tickets.filter((t: Ticket) => t.status === "open").length,
          inProgress: tickets.filter((t: Ticket) => t.status === "in-progress").length,
          resolved: tickets.filter((t: Ticket) => t.status === "resolved").length,
          closed: tickets.filter((t: Ticket) => t.status === "closed").length
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error("Failed to fetch ticket stats:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">آمار تیکت‌ها</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">کل تیکت‌ها</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.open}</div>
          <div className="text-sm text-gray-600">باز</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">در حال بررسی</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">حل شده</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
          <div className="text-sm text-gray-600">بسته شده</div>
        </div>
      </div>
    </div>
  );
}