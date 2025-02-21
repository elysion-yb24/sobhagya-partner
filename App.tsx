"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IRootState } from "@/store";
import { addUser } from "./store/userSlice";
import { getUserProfile } from "./utils";
import { toggleTheme, toggleMenu, toggleLayout } from "@/store/themeConfigSlice";
import Cookies from "universal-cookie";
import Loading from "@/components/layouts/loading";
import { AppProgressBar } from "next-nprogress-bar";
import Swal from "sweetalert2";
import "./global.css";

function App({ children }: PropsWithChildren) {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const cookies = new Cookies(null, { path: "/" });

  useEffect(() => {
    dispatch(toggleTheme(localStorage.getItem("theme") || themeConfig.theme));
    dispatch(toggleMenu(localStorage.getItem("menu") || themeConfig.menu));
    dispatch(toggleLayout(localStorage.getItem("layout") || themeConfig.layout));
  }, [dispatch, themeConfig]);

  async function checkAuthentication() {
    try {
      setIsLoading(true);
      const token = cookies.get("access_token");

      // If there's no token, just stop loading. Let the user see the child route or 404, etc.
      // We'll handle explicit "/" → "/auth/login" redirection below.
      if (!token) {
        setIsLoading(false);
        return;
      }

      const apiData = await getUserProfile("/profile", token);
      if (apiData?.success) {
        if (apiData?.data?.role === "user") {
          Swal.fire({ title: "You are not authorized", icon: "error" });
          cookies.remove("access_token");
          cookies.remove("token");
          router.replace("/auth/login");
        }
        dispatch(addUser(apiData.data));
      } else {
        dispatch(addUser(null));
        cookies.remove("access_token");
        cookies.remove("token");
        router.replace("/auth/login");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      cookies.remove("access_token");
      cookies.remove("token");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuthentication(); // Runs once on mount
  }, []);

  // ✅ Redirect to "/auth/login" if path === "/"
  useEffect(() => {
    // If the current path is "/", redirect to "/auth/login"
    if (window.location.pathname === "/") {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden ${themeConfig.menu}`}
    >
      {isLoading ? <Loading /> : children}
      <AppProgressBar height="4px" color="#4287f5" options={{ showSpinner: false }} />
    </div>
  );
}

export default App;
