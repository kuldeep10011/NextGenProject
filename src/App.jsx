import { useState, useEffect, useRef } from "react";
import SplashScreen        from "./components/SplashScreen";
import HomePage            from "./components/HomePage";
import LoginPage           from "./components/LoginPage";
import FoodCourtPage       from "./components/FoodCourtPage";
import OutletsPage         from "./components/OutletsPage";
import MenuPage            from "./components/MenuPage";
import YourOrderPage       from "./components/YourOrderPage";
import ContactUsPage       from "./components/ContactUsPage";
import AdminHomePage       from "./components/admin/AdminHomePage";
import AdminRegisterPage   from "./components/admin/AdminRegisterPage";
import AdminManagePage     from "./components/admin/AdminManagePage";
import AdminEditPage       from "./components/admin/AdminEditPage";
import AdminOrdersPage     from "./components/admin/AdminOrdersPage";

// Cart helpers
const addToCart = (prev, item) => {
  const exists = prev.find(i => i.id === item.id);
  if (exists) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
  return [...prev, { ...item, quantity: item.quantity ?? 1 }];
};
const updateQty = (prev, id, delta) =>
  prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0);
const removeFromCart = (prev, id) => prev.filter(i => i.id !== id);

// Admin session (localStorage — persists across tabs/restarts)
const loadAdminSession = () => {
  try { const r = localStorage.getItem("adminSession"); return r ? JSON.parse(r) : null; } catch { return null; }
};
const saveAdminSession = (s) => { try { localStorage.setItem("adminSession", JSON.stringify(s)); } catch {} };
const clearAdminSession = () => { try { localStorage.removeItem("adminSession"); } catch {} };

// User session (sessionStorage — survives refresh, cleared on tab close)
const loadUserSession = () => {
  try { const r = sessionStorage.getItem("userSession"); return r ? JSON.parse(r) : null; } catch { return null; }
};
const saveUserSession = (s) => { try { sessionStorage.setItem("userSession", JSON.stringify(s)); } catch {} };
const clearUserSession = () => { try { sessionStorage.removeItem("userSession"); } catch {} };

// Current page persistence
const loadSavedPage = () => { try { return sessionStorage.getItem("currentPage") || null; } catch { return null; } };
const savePage = (p) => { try { sessionStorage.setItem("currentPage", p); } catch {} };

export default function App() {
  const savedAdmin = loadAdminSession();
  const savedUser  = loadUserSession();
  const savedPage  = loadSavedPage();

  // Restore page on refresh (skip splash if already visited)
  const initialPage = (savedPage && savedPage !== "splash") ? savedPage : "splash";

  const [page, _setPage]            = useState(initialPage);
  const [isLoggedIn, setIsLoggedIn] = useState(savedUser?.isLoggedIn || false);
  const [userName, setUserName]     = useState(savedUser?.userName || "K");
  const [userDocId, setUserDocId]   = useState(savedUser?.userDocId || "");

  // Back/forward history stack
  const [history, setHistory]   = useState([initialPage]);
  const [histIdx, setHistIdx]   = useState(0);

  const setPage = (newPage) => {
    _setPage(newPage);
    savePage(newPage);
    setHistory(prev => {
      const trimmed = prev.slice(0, histIdx + 1);
      if (trimmed[trimmed.length - 1] === newPage) return prev;
      const next = [...trimmed, newPage];
      setHistIdx(next.length - 1);
      return next;
    });
  };

  const canGoBack    = histIdx > 0;
  const canGoForward = histIdx < history.length - 1;

  const goBack = () => {
    if (!canGoBack) return;
    const ni = histIdx - 1;
    setHistIdx(ni);
    _setPage(history[ni]);
    savePage(history[ni]);
  };
  const goForward = () => {
    if (!canGoForward) return;
    const ni = histIdx + 1;
    setHistIdx(ni);
    _setPage(history[ni]);
    savePage(history[ni]);
  };

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedOutlet, setSelectedOutlet]         = useState(null);
  const [cartItems, setCartItems]                   = useState([]);

  const [restaurantName,  setRestaurantName]  = useState(savedAdmin?.restaurantName  || "");
  const [restaurantDocId, setRestaurantDocId] = useState(savedAdmin?.restaurantDocId || "");
  const [adminSelectedOutlet, setAdminSelectedOutlet] = useState(null);

  const [orderTimers, setOrderTimers] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setOrderTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          const t = next[id];
          if (t.timerRunning && t.timeLeft > 0) { next[id] = { ...t, timeLeft: t.timeLeft - 1 }; changed = true; }
          else if (t.timerRunning && t.timeLeft <= 0) { next[id] = { ...t, timerRunning: false }; changed = true; }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const setTimer   = (id, sec) => setOrderTimers(p => ({ ...p, [id]: { timeLeft: sec, totalSec: sec, timerRunning: true } }));
  const clearTimer = (id) => setOrderTimers(p => { const n = { ...p }; delete n[id]; return n; });
  const stopTimer  = (id) => setOrderTimers(p => ({ ...p, [id]: { ...(p[id] || { timeLeft:0, totalSec:0 }), timerRunning: false } }));

  const handleAddToCart      = (item) => setCartItems(prev => addToCart(prev, item));
  const handleUpdateQty      = (id, delta) => setCartItems(prev => updateQty(prev, id, delta));
  const handleRemoveFromCart = (id) => setCartItems(prev => removeFromCart(prev, id));
  const handleClearCart      = () => setCartItems([]);

  const handleAdminSession = (info) => {
    setRestaurantName(info.restaurantName);
    setRestaurantDocId(info.restaurantDocId || info.docId || "");
    saveAdminSession({ restaurantName: info.restaurantName, restaurantDocId: info.restaurantDocId || info.docId || "" });
  };

  const handleAdminLogout = () => {
    setRestaurantName(""); setRestaurantDocId(""); clearAdminSession(); setOrderTimers({});
    setPage("admin-home");
  };

  const handleUserLogout = () => {
    setIsLoggedIn(false); setUserName("K"); setUserDocId(""); clearUserSession();
    setPage("home");
  };

  const navigate = (target, data = null) => {
    const simple = ["home","login","foodcourt","outlets","orders","contact","admin","admin-home","admin-register","admin-manage","admin-orders","admin-contact"];
    if (simple.includes(target)) { setPage(target); return; }
    if (target === "menu" && data) { setSelectedRestaurant(data.restaurant); setSelectedOutlet(data.outlet); setPage("menu"); return; }
    if (target === "restaurant" && data) { setSelectedRestaurant(data); setPage("outlets"); return; }
    if (target === "admin-edit" && data) { setAdminSelectedOutlet(data); setPage("admin-edit"); return; }
  };

  const navControls = { canGoBack, canGoForward, onGoBack: goBack, onGoForward: goForward };

  const sharedUserProps = {
    isLoggedIn, userName,
    onLoginClick: () => setPage("login"),
    onNavigate: navigate,
    onLogout: handleUserLogout,
    ...navControls,
  };

  const adminProps = {
    onNavigate: navigate,
    restaurantName, restaurantDocId,
    onAdminLogout: handleAdminLogout,
    ...navControls,
  };

  const cartProps = {
    cartItems,
    onAddToCart: handleAddToCart, onUpdateQty: handleUpdateQty,
    onRemoveFromCart: handleRemoveFromCart, onClearCart: handleClearCart,
    userDocId, qrImageUrl: "/upi-qr.jpeg", upiId: "", upiName: "CampusByte",
  };

  const timerProps = { orderTimers, onSetTimer: setTimer, onClearTimer: clearTimer, onStopTimer: stopTimer };

  if (page === "splash") return <SplashScreen onFinish={() => setPage("home")} />;

  if (page === "login")
    return (
      <LoginPage
        onLogin={(user) => {
          const uName = user.regNo ? user.regNo[0].toUpperCase() : "U";
          setIsLoggedIn(true); setUserName(uName); setUserDocId(user.userDocId || "");
          saveUserSession({ isLoggedIn: true, userName: uName, userDocId: user.userDocId || "" });
          setPage("home");
        }}
        {...navControls}
      />
    );

  if (page === "foodcourt")
    return (
      <FoodCourtPage
        {...sharedUserProps}
        onNavigate={(target, data) => {
          if (target === "menu") navigate("restaurant", data);
          else navigate(target, data);
        }}
      />
    );

  if (page === "outlets")   return <OutletsPage {...sharedUserProps} restaurant={selectedRestaurant} />;
  if (page === "menu")      return <MenuPage {...sharedUserProps} {...cartProps} restaurant={selectedRestaurant} outlet={selectedOutlet} />;
  if (page === "orders")    return <YourOrderPage {...sharedUserProps} userDocId={userDocId} orderTimers={orderTimers} />;
  if (page === "contact")   return <ContactUsPage {...sharedUserProps} />;

  if (page === "admin" || page === "admin-home")
    return <AdminHomePage {...adminProps} onAdminSession={handleAdminSession} />;

  if (page === "admin-register")
    return (
      <AdminRegisterPage
        {...adminProps}
        onRegisterSuccess={(info) => {
          handleAdminSession({ restaurantName: info.restaurantName, restaurantDocId: info.docId });
          setPage("admin-home");
        }}
      />
    );

  if (page === "admin-manage")  return <AdminManagePage  {...adminProps} />;
  if (page === "admin-edit")    return <AdminEditPage    {...adminProps} outlet={adminSelectedOutlet} />;
  if (page === "admin-orders")  return <AdminOrdersPage  {...adminProps} {...timerProps} />;

  return <HomePage {...sharedUserProps} />;
}
