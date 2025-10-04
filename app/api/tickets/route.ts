import { NextRequest, NextResponse } from "next/server";
import CustomerTicket from "@/models/customerTicket";
import  connect from "@/lib/data";
import StoreUsers from "@/models/storesUsers";

interface TicketFilter {
  storeId?: string;
  status?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const status = searchParams.get("status");
    
    const filter: TicketFilter = {};
    if (storeId) filter.storeId = storeId;
    if (status) filter.status = status;
    
    const tickets = await CustomerTicket.find(filter)
      .populate({
        path:"customer",
        model:StoreUsers
      })
      .sort({ updatedAt: -1 });
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}