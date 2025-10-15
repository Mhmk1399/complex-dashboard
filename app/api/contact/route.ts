import { NextResponse } from "next/server";
import contact from "@/models/contact";
import connect from '@/lib/data';
import Jwt , { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
storeId: string;
}

export async function GET(request: Request) {
  await connect();
  try {
      const token = request.headers.get("Authorization");
      if (!token)
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const decodedToken = Jwt.decode(token) as CustomJwtPayload;
      if (!decodedToken)
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });

      const storeId = decodedToken.storeId;
      if (!storeId)
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });     
        
      const contacts = await contact.find({ storeId: storeId }).sort({ createdAt: -1 });
      return NextResponse.json(contacts);
  } catch (error) {
      console.log("Contact fetch error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await connect();
  try {
      const token = request.headers.get("Authorization");
      if (!token)
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const decodedToken = Jwt.decode(token) as CustomJwtPayload;
      if (!decodedToken)
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });

      const storeId = decodedToken.storeId;
      if (!storeId)
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });

      const url = new URL(request.url);
      const contactId = url.pathname.split('/').pop();

      if (!contactId) {
          return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
      }

      const deletedContact = await contact.findOneAndDelete({ 
          _id: contactId, 
          storeId: storeId 
      });

      if (!deletedContact) {
          return NextResponse.json({ error: "Contact not found" }, { status: 404 });
      }

      return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (error) {
      console.log("Contact delete error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
