import mongoose from "mongoose";

interface ProductColor {
  code: string;
  quantity: string;
}

interface ProductDocument extends mongoose.Document {
  colors: ProductColor[];
}

export async function decreaseProductQuantity(
  productId: string,
  quantity: number,
  colorCode: string
) {
  const Products = mongoose.models.Products || mongoose.model("Products");
  const product = (await Products.findById(
    productId
  )) as ProductDocument | null;

  if (!product) return;

  const color = product.colors.find((c) => c.code === colorCode);
  if (color) {
    const currentQty = parseInt(color.quantity);
    const newQty = Math.max(0, currentQty - quantity);
    color.quantity = newQty.toString();
    await product.save();
  }
}
