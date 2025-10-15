import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import Products from "@/models/products";
import jwt, { JwtPayload } from "jsonwebtoken";
import category from "@/models/category";

interface CustomJwtPayload extends JwtPayload {
  storeId?: string;
}

interface ProductFilterQuery {
  storeId: string;
  category?: string;
  status?: string;
}
export async function POST(request: Request) {
  const productData = await request.json();

  try {
    await connect();
    console.log("Connected to MongoDB");
    if(!connect){
        return NextResponse.json({ error: "Failed to connect to database" });
    }
    const token = request.headers.get("Authorization")?.split(' ')[1];
    
    if (!token){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decodedToken = jwt.decode(token) as CustomJwtPayload
    if (!decodedToken){
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    const newProduct = new Products(productData);
    await newProduct.save();
    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating product:", error);
    return NextResponse.json(
      { message: "Error creating product", error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await connect();
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedToken = jwt.decode(token) as CustomJwtPayload;

    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const storeId = decodedToken.storeId;
    console.log(storeId, "storeId");

    if (!storeId)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get pagination and filter parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryFilter = searchParams.get('category');
    const statusFilter = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery: ProductFilterQuery = { storeId };
    if (categoryFilter) {
      filterQuery.category = categoryFilter;
    }
    if (statusFilter) {
      filterQuery.status = statusFilter;
    }

    // Get total count for pagination info
    const totalProducts = await Products.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Products.find(filterQuery)
      .populate({
        path: "category",
        model: category
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 });
  } catch (error) {
    console.log("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 }
    );
  }
}
