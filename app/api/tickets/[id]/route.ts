import { NextRequest, NextResponse } from "next/server";
import CustomerTicket from "@/models/customerTicket";
import connect from "@/lib/data";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const { id } = await params;
    const ticket = await CustomerTicket.findById(id).populate("customer", "name email");
    
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const body = await request.json();
    const { id } = await params;
    
    const ticket = await CustomerTicket.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    ).populate("customer", "name email");
    
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}