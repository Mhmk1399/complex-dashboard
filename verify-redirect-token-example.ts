// Complete flow for your other app
import jwt from "jsonwebtoken";

// 1. Verify redirect token from URL
export async function verifyRedirectToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== "redirect") {
      throw new Error("Invalid token type");
    }
    
    return {
      userId: decoded.userId,
      storeId: decoded.storeId,
      valid: true
    };
  } catch (error) {
    return { valid: false };
  }
}

// 2. Generate long-lived token for localStorage
export function generateUserToken(userId: string, storeId: string) {
  return jwt.sign(
    { userId, storeId },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" } // 7 days
  );
}

// 3. Check if stored token is valid
export function isTokenValid(token: string) {
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
}

// 4. Client-side usage in other app:
/*
// On page load:
const urlParams = new URLSearchParams(window.location.search);
const redirectToken = urlParams.get('token');

if (redirectToken) {
  // Verify redirect token
  const verification = await verifyRedirectToken(redirectToken);
  if (verification.valid) {
    // Generate and save long-lived token
    const userToken = generateUserToken(verification.userId, verification.storeId);
    localStorage.setItem('token', userToken);
    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
} else {
  // Check existing token
  const storedToken = localStorage.getItem('token');
  if (!storedToken || !isTokenValid(storedToken)) {
    localStorage.removeItem('token');
    // Redirect to login
  }
}
*/