import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("token");

  if (token && token.value !== "null") {
    redirect("/auth/register"); // Redirect to register page immediately
  }

  return <>{children}</>;
}
