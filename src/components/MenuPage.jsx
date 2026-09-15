import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CartPopup from "./CartPopup";

const getInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const AVATAR_COLORS = [
  { bg: "#FFF3EE", text: "#C94D1E" },
  { bg: "#f0faf0", text: "#2E8B3A" },
  { bg: "#EEF4FF", text: "#3B5BDB" },
  { bg: "#FFF9DB", text: "#E67700" },
  { bg: "#F3F0FF", text: "#7048E8" },
  { bg: "#FFF0F6", text: "#C2255C" },
];
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function MenuPage({
  restaurant, outlet,
  isLoggedIn = false, onLoginClick, onNavigate, userName = "K",
  // Cart props passed from App (shared cart state)
  cartItems = [], onAddToCart, onUpdateQty, onRemoveFromCart, onClearCart,
  userDocId = "",
  qrImageUrl = "",
}) {
  const [scrolled, setScrolled]         = useState(false);
  const [category, setCategory]         = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [cartOpen, setCartOpen]         = useState(false);

  const restaurantName  = restaurant?.name || "Restaurant";
  const restaurantDocId = restaurant?.id   || "";
  const outletName      = outlet?.name     || "";
  const outletDocId     = outlet?.firestoreId || outlet?.id || "";

  const categories    = [...new Set(items.filter(i => i.available).map(i => i.category))].filter(Boolean);
  const searchFiltered = searchQuery.trim()
    ? items.filter(i => i.available && i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;
  const categoryFiltered = category ? items.filter(i => i.category === category && i.available) : null;

  const totalCartQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (!e.target.closest(".dropdown-wrap")) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!restaurantDocId || !outletDocId) { setError("Outlet information missing."); setLoading(false); return; }
    fetchMenu();
  }, [restaurantDocId, outletDocId]);

  const fetchMenu = async () => {
    setLoading(true); setError(""); setCategory(""); setSearchQuery("");
    try {
      const snap = await getDocs(collection(db, "Restaurant Registration", restaurantDocId, "Outlets", outletDocId, "Menu"));
      const list = snap.docs.map(d => ({
        id:        d.id,
        category:  d.data()["Category"]     || "",
        name:      d.data()["Item Name"]    || "",
        price:     d.data()["Price"]        || 0,
        available: d.data()["Is Available"] ?? true,
      }));
      setItems(list);
    } catch (err) {
      console.error("Fetch menu error:", err);
      setError("Failed to load menu. Please check your connection.");
    }
    setLoading(false);
  };


  const handleAddToCart = (item) => {
    onAddToCart?.({
      id:             item.id,
      name:           item.name,
      price:          item.price,
      restaurantName: restaurantName,
      outletName:     outletName,
      quantity:       1,
    });
  };

  const getItemQty = (id) => cartItems.find(i => i.id === id)?.quantity || 0;

  const renderItems = (list) => (
    <div className="menu-list">
      {list.map((item, i) => {
        const qty = getItemQty(item.id);
        return (
          <div key={item.id} className="menu-item" style={{ animationDelay:`${i * 0.07}s` }}>
            <div className="mi-img">
              {(() => {
                const { bg, text } = getAvatarColor(item.name);
                return (
                  <div style={{ width:"100%", height:"100%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
                    <span style={{ fontSize:"22px", fontWeight:"800", color:text, letterSpacing:"1px", lineHeight:1 }}>{getInitials(item.name)}</span>
                  </div>
                );
              })()}
            </div>
            <div className="mi-info">
              <p className="mi-name">{item.name}</p>
              <p className="mi-price">₹{item.price}</p>
            </div>
            <div className="mi-action">
              {qty === 0 ? (
                <button className="btn-add-cart" onClick={() => handleAddToCart(item)}>
                  + Add
                </button>
              ) : (
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => onUpdateQty?.(item.id, -1)}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty?.(item.id, +1)}>+</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#fff; color:#1a1a1a; }
        @keyframes spin    { to{transform:rotate(360deg);} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
        @keyframes cardIn  { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }

        /* Navbar */
        .navbar { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 40px; height:64px; background:#fff; box-shadow:0 1px 0 #eee; transition:box-shadow 0.3s; }
        .navbar.scrolled { box-shadow:0 1px 12px rgba(0,0,0,0.08); }
        .logo { font-size:22px; font-weight:800; letter-spacing:-0.5px; cursor:pointer; user-select:none; }
        .logo-campus { color:#C94D1E; } .logo-byte { color:#2E8B3A; }
        .nav-links { display:flex; align-items:center; gap:4px; list-style:none; }
        .nav-btn { display:block; padding:8px 18px; font-size:15px; font-weight:500; color:#1a1a1a; background:none; border:none; cursor:pointer; font-family:inherit; border-radius:6px; position:relative; transition:color 0.2s; }
        .nav-btn::after { content:''; position:absolute; bottom:4px; left:18px; right:18px; height:2px; border-radius:1px; background:#C94D1E; transform:scaleX(0); transition:transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin:left; }
        .nav-btn:hover { color:#C94D1E; } .nav-btn:hover::after { transform:scaleX(1); }
        .nav-btn.active { color:#C94D1E; } .nav-btn.active::after { transform:scaleX(1); }
        .btn-login { background:#C94D1E; color:#fff; padding:10px 28px; border-radius:8px; font-weight:700; font-size:14px; letter-spacing:0.5px; border:none; cursor:pointer; font-family:inherit; transition:background 0.2s, transform 0.15s; }
        .btn-login:hover { background:#A83C14; transform:translateY(-1px); }
        @keyframes avatarPop { from{transform:scale(0.5);opacity:0;} to{transform:scale(1);opacity:1;} }
        .user-avatar { width:40px; height:40px; border-radius:50%; background:#d0d0d0; color:#1a1a1a; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; cursor:pointer; border:none; flex-shrink:0; animation:avatarPop 0.4s cubic-bezier(0.22,1,0.36,1) both; transition:background 0.2s, transform 0.15s; }
        .user-avatar:hover { background:#b0b0b0; transform:scale(1.06); }

        /* ── Cart icon in navbar ── */
        .nav-cart-btn {
          position:relative; width:42px; height:42px; border-radius:10px;
          background:#FFF3EE; border:1.5px solid #F4C4A8;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; cursor:pointer; transition:background 0.2s, transform 0.15s;
          flex-shrink:0;
        }
        .nav-cart-btn:hover { background:#FFE8DC; transform:scale(1.08); }
        @keyframes cartBounce { 0%,100%{transform:scale(1)} 30%{transform:scale(1.25)} 60%{transform:scale(0.9)} }
        .nav-cart-btn.bump { animation:cartBounce 0.4s cubic-bezier(0.22,1,0.36,1); }
        .cart-badge {
          position:absolute; top:-6px; right:-6px;
          background:#C94D1E; color:#fff;
          width:20px; height:20px; border-radius:50%;
          font-size:11px; font-weight:800;
          display:flex; align-items:center; justify-content:center;
          border:2px solid #fff;
          animation:badgePop 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes badgePop { from{transform:scale(0)} to{transform:scale(1)} }

        /* nav-right cluster */
        .nav-right { display:flex; align-items:center; gap:10px; }

        /* Page */
        .page-wrap { max-width:1240px; margin:0 auto; padding:36px 40px 80px; }
        .breadcrumb { display:flex; align-items:center; gap:8px; font-size:14px; color:#888; margin-bottom:24px; flex-wrap:wrap; }
        .breadcrumb-link { color:#C94D1E; font-weight:600; cursor:pointer; background:none; border:none; font-family:inherit; font-size:14px; padding:0; transition:color 0.2s; }
        .breadcrumb-link:hover { color:#A83C14; text-decoration:underline; }
        .breadcrumb-sep { color:#ccc; } .breadcrumb-current { color:#888; font-weight:500; }
        .welcome-heading { font-size:20px; font-weight:700; color:#C94D1E; margin-bottom:16px; }
        .outlet-tag { display:inline-flex; align-items:center; gap:6px; background:#FFF3EE; border:1px solid #F4C4A8; border-radius:20px; padding:5px 14px; font-size:13px; font-weight:600; color:#C94D1E; margin-bottom:28px; }
        .loading-state { text-align:center; padding:60px; display:flex; flex-direction:column; align-items:center; gap:16px; margin-top:20px; }
        .big-spinner { width:40px; height:40px; border:3px solid #f0f0f0; border-top-color:#C94D1E; border-radius:50%; animation:spin 0.8s linear infinite; }
        .error-state { text-align:center; padding:40px 24px; display:flex; flex-direction:column; align-items:center; gap:14px; margin-top:20px; }
        .error-icon { font-size:44px; } .error-title { font-size:17px; font-weight:700; color:#C94D1E; }
        .btn-retry { background:#C94D1E; color:#fff; padding:11px 28px; border-radius:9px; font-size:14px; font-weight:700; font-family:inherit; border:none; cursor:pointer; transition:background 0.2s; }
        .btn-retry:hover { background:#A83C14; }
        .empty-menu { text-align:center; padding:60px 24px; display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:10px; }
        .empty-menu-icon { font-size:48px; } .empty-menu-title { font-size:18px; font-weight:700; color:#444; } .empty-menu-sub { font-size:14px; color:#999; }
        .controls-row { display:flex; align-items:center; gap:12px; margin-bottom:32px; flex-wrap:wrap; }
        .dropdown-wrap { position:relative; display:inline-block; }
        .dropdown-trigger { display:flex; align-items:center; gap:10px; padding:10px 18px; font-size:15px; font-weight:500; color:#2E8B3A; background:#f0f0f0; border:1.5px solid #d0d0d0; border-radius:6px; cursor:pointer; font-family:inherit; transition:background 0.2s, border-color 0.2s; white-space:nowrap; min-width:220px; justify-content:space-between; }
        .dropdown-trigger:hover { background:#e6e6e6; border-color:#b0b0b0; }
        .arrow-icon { font-size:16px; color:#1a1a1a; transition:transform 0.2s; display:inline-block; }
        .arrow-icon.open { transform:rotate(180deg); }
        .dropdown-menu { position:absolute; top:calc(100% + 4px); left:0; background:#fff; border:1.5px solid #d0d0d0; border-radius:6px; min-width:220px; box-shadow:0 4px 16px rgba(0,0,0,0.1); overflow:hidden; z-index:50; }
        .dropdown-item { padding:10px 18px; font-size:15px; font-weight:500; color:#1a1a1a; cursor:pointer; transition:background 0.15s, color 0.15s; }
        .dropdown-item:hover { background:#f5f5f5; color:#C94D1E; }
        .dropdown-item.selected { color:#2E8B3A; font-weight:600; background:#f5fff7; }
        .search-wrap { position:relative; flex:1; min-width:200px; max-width:360px; }
        .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:16px; pointer-events:none; color:#aaa; }
        .search-input { width:100%; padding:10px 14px 10px 38px; font-size:15px; font-family:inherit; font-weight:500; color:#1a1a1a; background:#f0f0f0; border:1.5px solid #d0d0d0; border-radius:6px; outline:none; transition:border-color 0.2s, background 0.2s; }
        .search-input:focus { border-color:#C94D1E; background:#fff; }
        .search-input::placeholder { color:#aaa; }
        .search-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; color:#aaa; line-height:1; padding:2px; transition:color 0.2s; }
        .search-clear:hover { color:#C94D1E; }
        .category-section { margin-bottom:32px; }
        .category-heading { font-size:17px; font-weight:700; color:#1a1a1a; margin-bottom:14px; padding-bottom:8px; border-bottom:2px solid #f0f0f0; display:flex; align-items:center; gap:8px; }
        .category-pill { background:#FFF3EE; color:#C94D1E; border:1px solid #F4C4A8; border-radius:20px; padding:3px 12px; font-size:13px; font-weight:600; }
        .search-results-label { font-size:15px; color:#888; margin-bottom:20px; font-weight:500; }
        .search-results-label span { color:#1a1a1a; font-weight:700; }
        .menu-list { display:flex; flex-direction:column; gap:16px; }
        .menu-item { display:grid; grid-template-columns:100px 1fr auto; align-items:center; gap:0; background:#fff; border:1px solid #e8e8e8; border-radius:12px; overflow:hidden; animation:cardIn 0.35s cubic-bezier(0.22,1,0.36,1) both; transition:box-shadow 0.2s, transform 0.2s; }
        .menu-item:hover { box-shadow:0 4px 20px rgba(0,0,0,0.09); transform:translateY(-2px); }
        .mi-img { width:100px; height:90px; overflow:hidden; flex-shrink:0; }
        .mi-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.35s; }
        .menu-item:hover .mi-img img { transform:scale(1.06); }
        .mi-info { padding:14px 18px; display:flex; flex-direction:column; gap:4px; }
        .mi-name { font-size:17px; font-weight:700; color:#1a1a1a; }
        .mi-price { font-size:16px; font-weight:700; color:#C94D1E; }
        .mi-action { padding:0 20px; flex-shrink:0; }

        /* Add to cart / qty buttons */
        .btn-add-cart { background:#C94D1E; color:#fff; padding:10px 22px; border-radius:8px; font-size:14px; font-weight:700; font-family:inherit; border:none; cursor:pointer; white-space:nowrap; transition:background 0.2s, transform 0.15s; box-shadow:0 3px 10px rgba(201,77,30,0.2); }
        .btn-add-cart:hover { background:#A83C14; transform:translateY(-1px); }
        .btn-add-cart:active { transform:translateY(0); }
        .qty-ctrl { display:flex; align-items:center; gap:0; border:2px solid #C94D1E; border-radius:8px; overflow:hidden; }
        .qty-btn { width:32px; height:36px; background:#FFF3EE; border:none; font-size:18px; font-weight:800; color:#C94D1E; cursor:pointer; transition:background 0.15s; display:flex; align-items:center; justify-content:center; }
        .qty-btn:hover { background:#C94D1E; color:#fff; }
        .qty-val { width:32px; text-align:center; font-size:15px; font-weight:800; color:#C94D1E; background:#fff; }

        @keyframes shimmer { 0%{background-position:-600px 0;} 100%{background-position:600px 0;} }
        .skeleton-item { display:grid; grid-template-columns:100px 1fr; height:90px; border:1px solid #e8e8e8; border-radius:12px; overflow:hidden; }
        .sk-img { width:100px; height:90px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; }
        .sk-body { padding:14px 18px; display:flex; flex-direction:column; gap:10px; }
        .sk-line { height:14px; border-radius:4px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; }

        @media(max-width:900px) {
          .navbar, .page-wrap { padding-left:20px; padding-right:20px; }
          .welcome-heading { font-size:17px; }
          .menu-item { grid-template-columns:80px 1fr; }
          .mi-img { width:80px; height:80px; }
          .mi-action { display:none; }
          .controls-row { flex-direction:column; align-items:flex-start; }
          .search-wrap { max-width:100%; width:100%; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => onNavigate?.("home")}>
          <span className="logo-campus">Campus</span><span className="logo-byte">Byte</span>
        </span>
        <ul className="nav-links">
          <li><button className="nav-btn" onClick={() => onNavigate?.("home")}>Home</button></li>
          <li><button className="nav-btn active" onClick={() => onNavigate?.("foodcourt")}>Food Court</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("orders")}>Your Order</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("contact")}>Contact Us</button></li>
        </ul>
        <div className="nav-right">
          {/* Cart icon — only visible when cart has items */}
          {totalCartQty > 0 && (
            <button className="nav-cart-btn" onClick={() => setCartOpen(true)} title="View Cart">
              🛒
              <span className="cart-badge">{totalCartQty}</span>
            </button>
          )}
          {isLoggedIn
            ? <div className="user-avatar" title="My Account">{userName}</div>
            : <button className="btn-login" onClick={onLoginClick}>LOGIN</button>
          }
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="page-wrap">
        <div className="breadcrumb">
          <button className="breadcrumb-link" onClick={() => onNavigate?.("foodcourt")}>Food Court</button>
          <span className="breadcrumb-sep">›</span>
          <button className="breadcrumb-link" onClick={() => onNavigate?.("outlets")}>{restaurantName}</button>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{outletName || "Menu"}</span>
        </div>

        <h2 className="welcome-heading">Welcome To {restaurantName}! Choose Your Favourite Meal!</h2>
        {outletName && <div className="outlet-tag">📍 {outletName}</div>}

        {loading && (<div className="loading-state"><div className="big-spinner" /><p style={{color:"#999",fontSize:"15px"}}>Loading menu...</p></div>)}

        {!loading && error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-title">{error}</p>
            <button className="btn-retry" onClick={fetchMenu}>Try Again</button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="empty-menu">
            <div className="empty-menu-icon">🍽️</div>
            <p className="empty-menu-title">No menu items yet</p>
            <p className="empty-menu-sub">This outlet hasn't added any items yet. Check back soon!</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="controls-row">
              <div className="dropdown-wrap">
                <button className="dropdown-trigger" onClick={() => setDropdownOpen(p => !p)}>
                  <span style={{ color: category ? "#1a1a1a" : "#2E8B3A" }}>{category || "Choose Category"}</span>
                  <span className={`arrow-icon${dropdownOpen ? " open" : ""}`}>↓</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className={`dropdown-item${!category ? " selected" : ""}`} onClick={() => { setCategory(""); setDropdownOpen(false); }}>All Categories</div>
                    {categories.map((cat, i) => (
                      <div key={i} className={`dropdown-item${category === cat ? " selected" : ""}`} onClick={() => { setCategory(cat); setDropdownOpen(false); }}>{cat}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input className="search-input" type="text" placeholder="Search items..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCategory(""); }} />
                {searchQuery && <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>}
              </div>
            </div>

            {searchFiltered && (
              <>
                <p className="search-results-label">
                  {searchFiltered.length === 0 ? <>No items found for <span>"{searchQuery}"</span></> : <><span>{searchFiltered.length}</span> result{searchFiltered.length !== 1 ? "s" : ""} for <span>"{searchQuery}"</span></>}
                </p>
                {searchFiltered.length > 0 && renderItems(searchFiltered)}
              </>
            )}
            {!searchFiltered && category && (
              categoryFiltered.length === 0 ? (
                <p style={{color:"#aaa",fontSize:"15px",textAlign:"center",padding:"30px"}}>No available items in this category.</p>
              ) : renderItems(categoryFiltered)
            )}
            {!searchFiltered && !category && (
              categories.map((cat) => {
                const catItems = items.filter(i => i.category === cat && i.available);
                if (catItems.length === 0) return null;
                return (
                  <div className="category-section" key={cat}>
                    <div className="category-heading"><span className="category-pill">{cat}</span></div>
                    {renderItems(catItems)}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* ── Cart Popup ── */}
      {cartOpen && (
        <CartPopup
          cartItems={cartItems}
          onClose={() => setCartOpen(false)}
          onUpdateQty={onUpdateQty}
          onRemove={onRemoveFromCart}
          isLoggedIn={isLoggedIn}
          userDocId={userDocId}
          onLoginClick={onLoginClick}
          onClearCart={onClearCart}
          qrImageUrl={qrImageUrl}
        />
      )}
    </>
  );
}
