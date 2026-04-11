import { useState } from "react";
import SplashScreen    from "./components/SplashScreen";
import HomePage        from "./components/HomePage";
import LoginPage       from "./components/LoginPage";
import FoodCourtPage   from "./components/FoodCourtPage";
import MenuPage        from "./components/MenuPage";
import YourOrderPage   from "./components/YourOrderPage";

export default function App() {
  const [page, setPage]                     = useState("splash");
  const [isLoggedIn, setIsLoggedIn]         = useState(false);
  const [userName, setUserName]             = useState("K");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const navigate = (target, data = null) => {
    if (target === "home")      { setPage("home");      return; }
    if (target === "login")     { setPage("login");     return; }
    if (target === "foodcourt") { setPage("foodcourt"); return; }
    if (target === "orders")    { setPage("orders");    return; }
    if (target === "contact")   { setPage("contact");   return; } // build later
    if (target === "menu" && data) {
      setSelectedRestaurant(data);
      setPage("menu");
    }
  };

  const sharedProps = {
    isLoggedIn,
    userName,
    onLoginClick: () => setPage("login"),
    onNavigate: navigate,
  };

  if (page === "splash")
    return <SplashScreen onFinish={() => setPage("home")} />;

  if (page === "login")
    return (
      <LoginPage
        onLogin={() => { setIsLoggedIn(true); setPage("home"); }}
      />
    );

  if (page === "foodcourt")
    return <FoodCourtPage {...sharedProps} />;

  if (page === "menu")
    return <MenuPage {...sharedProps} restaurant={selectedRestaurant} />;

  if (page === "orders")
    return <YourOrderPage {...sharedProps} />;

  // default → home
  return <HomePage {...sharedProps} />;
}
