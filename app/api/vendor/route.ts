import  { NextRequest, NextResponse } from 'next/server';
import connect from "@/lib/data";
import Vendor from '@/models/vendor';
import User from '@/models/users';


export async function POST(request: Request) {
    const { name, owner } = await request.json();
  
    try {
      await connect();
  
      // Ensure owner is valid
      const ownerUser = await User.findById(owner);
      if (!ownerUser || ownerUser.role !== 'vendor') {
        return NextResponse.json({ message: "Invalid vendor owner" }, { status: 400 });
      }
  
      const newVendor = new Vendor({ name, owner });
      await newVendor.save();
  
      return NextResponse.json({ message: "Vendor created successfully", vendor: newVendor }, { status: 201 });
    } catch (error) {
      console.error("Error creating vendor:", error);
      return NextResponse.json({ message: "Error creating vendor" }, { status: 500 });
    }
  }
  
  export const GET = async (req: NextRequest, { params }: { params: { vendorId: string } }) => {
    try {
      await connect();
  
      const vendors = await Vendor.find();
      return new NextResponse(JSON.stringify(vendors), { status: 200 });
    } catch (error) {
      console.error("Error fetching vendor users:", error);
      return new NextResponse('Error fetching vendor users', { status: 500 });
    }
  };
  