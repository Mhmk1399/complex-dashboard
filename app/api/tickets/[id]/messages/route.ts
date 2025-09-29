import { NextRequest, NextResponse } from "next/server";
import CustomerTicket from "@/models/customerTicket";
import connect from "@/lib/data";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const { content, sender } = await request.json();
    
    const ticket = await CustomerTicket.findById(params.id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    
    ticket.messages.push({
      sender,
      content,
      timestamp: new Date()
    });
    
    if (sender === "admin" && ticket.status === "open") {
      ticket.status = "in-progress";
    }
    
    await ticket.save();
    
    const updatedTicket = await CustomerTicket.findById(params.id).populate("customer", "name email");
    return NextResponse.json(updatedTicket);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 });
  }
}