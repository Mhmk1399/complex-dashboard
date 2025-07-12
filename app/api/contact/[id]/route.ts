import { NextResponse } from "next/server";
import contact from "@/models/contact";
import connect from '@/lib/data';
import Jwt , { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  storeId: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const contactId = params.id;
        
        const deletedContact = await contact.findOneAndDelete({ 
            _id: contactId, 
            storeId: storeId 
        });

        if (!deletedContact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Contact delete error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
