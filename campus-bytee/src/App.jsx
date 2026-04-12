import { useState } from "react";
import SplashScreen        from "./components/SplashScreen";
import HomePage            from "./components/HomePage";
import LoginPage           from "./components/LoginPage";
import FoodCourtPage       from "./components/FoodCourtPage";
import MenuPage            from "./components/MenuPage";
import YourOrderPage       from "./components/YourOrderPage";
import ContactUsPage       from "./components/ContactUsPage";
import AdminHomePage       from "./components/admin/AdminHomePage";
import AdminRegisterPage   from "./components/admin/AdminRegisterPage";
import AdminManagePage     from "./components/admin/AdminManagePage";
import AdminEditPage       from "./components/admin/AdminEditPage";
import AdminOrdersPage     from "./components/admin/AdminOrdersPage";

export default function App() {
  // ── User state ────────────────────────────────
  const [page, setPage]                             = useState("splash");
  const [isLoggedIn, setIsLoggedIn]                 = useState(false);
  const [userName, setUserName]                     = useState("K");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // ── Admin state ───────────────────────────────
  const [restaurantName, setRestaurantName]         = useState("");
  const [selectedOutlet, setSelectedOutlet]         = useState(null);

  // ── Navigation ────────────────────────────────
  const navigate = (target, data = null) => {
    const simple = [
      "home","login","foodcourt","orders","contact",
      "admin","admin-home","admin-register","admin-manage",
      "admin-orders","admin-contact",
    ];
    if (simple.includes(target)) { setPage(target); return; }
    if (target === "menu" && data)       { setSelectedRestaurant(data); setPage("menu");       return; }
    if (target === "admin-edit" && data) { setSelectedOutlet(data);     setPage("admin-edit"); return; }
  };

  const sharedUserProps = { isLoggedIn, userName, onLoginClick: () => setPage("login"), onNavigate: navigate };
  const adminProps      = { onNavigate: navigate, restaurantName };

  // ── Render ────────────────────────────────────
  if (page === "splash")         return <SplashScreen onFinish={() => setPage("home")} />;
  if (page === "login")          return <LoginPage onLogin={() => { setIsLoggedIn(true); setPage("home"); }} />;
  if (page === "foodcourt")      return <FoodCourtPage {...sharedUserProps} />;
  if (page === "menu")           return <MenuPage {...sharedUserProps} restaurant={selectedRestaurant} />;
  if (page === "orders")         return <YourOrderPage {...sharedUserProps} />;
  if (page === "contact")        return <ContactUsPage {...sharedUserProps} />;

  // Admin
  if (page === "admin" || page === "admin-home")
    return <AdminHomePage {...adminProps} />;

  if (page === "admin-register")
    return (
      <AdminRegisterPage
        {...adminProps}
        onRegisterSuccess={(name) => { setRestaurantName(name); setPage("admin-home"); }}
      />
    );

  if (page === "admin-manage")   return <AdminManagePage  {...adminProps} />;
  if (page === "admin-edit")     return <AdminEditPage    {...adminProps} outlet={selectedOutlet} />;
  if (page === "admin-orders")   return <AdminOrdersPage  {...adminProps} />;

  return <HomePage {...sharedUserProps} />;
}
