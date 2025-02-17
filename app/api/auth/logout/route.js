import { serialize } from "cookie";

export async function POST() {
  try {
    // Clear the JWT cookie by setting it with an expired date
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/", // Ensure the cookie is removed site-wide
        expires: new Date(0), // Expire immediately
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "You have been signed out successfully!",
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred while signing out.",
      }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ success: false, message: "Method not allowed." }),
    { status: 405 }
  );
}
