import { useState, useEffect } from "react";

export default function MenuPage({ restaurant, isLoggedIn = false, onLoginClick, onNavigate, userName = "K" }) {
  const [scrolled, setScrolled] = useState(false);
  const [category, setCategory] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Placeholder categories — replace with real DB data later
  const categories = []; // will be populated from database

  const restaurantName = restaurant?.name || "Restaurant";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".dropdown-wrap")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #fff; color: #1a1a1a;
        }

        /* ── Navbar ── */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px; background: #fff;
          box-shadow: 0 1px 0 #eee; transition: box-shadow 0.3s;
        }
        .navbar.scrolled { box-shadow: 0 1px 12px rgba(0,0,0,0.08); }

        .logo {
          font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
          text-decoration: none; cursor: pointer; user-select: none;
        }
        .logo-campus { color: #C94D1E; }
        .logo-byte   { color: #2E8B3A; }

        .nav-links { display: flex; align-items: center; gap: 4px; list-style: none; }
        .nav-btn {
          display: block; padding: 8px 18px;
          font-size: 15px; font-weight: 500; color: #1a1a1a;
          background: none; border: none; cursor: pointer;
          font-family: inherit; border-radius: 6px;
          position: relative; transition: color 0.2s;
        }
        .nav-btn::after {
          content: ''; position: absolute; bottom: 4px; left: 18px; right: 18px;
          height: 2px; border-radius: 1px; background: #C94D1E;
          transform: scaleX(0);
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin: left;
        }
        .nav-btn:hover { color: #C94D1E; }
        .nav-btn:hover::after { transform: scaleX(1); }
        .nav-btn.active { color: #C94D1E; }
        .nav-btn.active::after { transform: scaleX(1); }

        .btn-login {
          background: #C94D1E; color: #fff;
          padding: 10px 28px; border-radius: 8px;
          font-weight: 700; font-size: 14px; letter-spacing: 0.5px;
          border: none; cursor: pointer; font-family: inherit;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-login:hover { background: #A83C14; transform: translateY(-1px); }

        @keyframes avatarPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .user-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: #d0d0d0; color: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; cursor: pointer;
          border: none; flex-shrink: 0;
          animation: avatarPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
          transition: background 0.2s, transform 0.15s;
        }
        .user-avatar:hover { background: #b0b0b0; transform: scale(1.06); }

        /* ── Page content ── */
        .page-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 36px 40px 80px;
        }

        /* Welcome heading */
        .welcome-heading {
          font-size: 20px;
          font-weight: 700;
          color: #C94D1E;
          margin-bottom: 28px;
        }

        /* ── Dropdown ── */
        .dropdown-wrap {
          position: relative;
          display: inline-block;
        }

        .dropdown-trigger {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 18px;
          font-size: 15px; font-weight: 500;
          color: #2E8B3A;
          background: #f0f0f0;
          border: 1.5px solid #d0d0d0;
          border-radius: 6px;
          cursor: pointer; font-family: inherit;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
          min-width: 200px;
          justify-content: space-between;
        }
        .dropdown-trigger:hover {
          background: #e6e6e6;
          border-color: #b0b0b0;
        }

        .arrow-icon {
          font-size: 16px; color: #1a1a1a;
          transition: transform 0.2s;
          display: inline-block;
        }
        .arrow-icon.open { transform: rotate(180deg); }

        /* Dropdown menu */
        .dropdown-menu {
          position: absolute; top: calc(100% + 4px); left: 0;
          background: #fff;
          border: 1.5px solid #d0d0d0;
          border-radius: 6px;
          min-width: 200px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          overflow: hidden;
          z-index: 50;
        }
        .dropdown-item {
          padding: 10px 18px;
          font-size: 15px; font-weight: 500; color: #1a1a1a;
          cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .dropdown-item:hover { background: #f5f5f5; color: #C94D1E; }
        .dropdown-item.selected { color: #2E8B3A; font-weight: 600; }

        /* Empty state */
        .empty-state {
          margin-top: 60px;
          text-align: center;
          color: #999;
          font-size: 15px;
        }

        @media(max-width: 900px) {
          .navbar, .page-wrap { padding-left: 20px; padding-right: 20px; }
          .welcome-heading { font-size: 17px; }
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

        {isLoggedIn
          ? <div className="user-avatar" title="My Account">{userName}</div>
          : <button className="btn-login" onClick={onLoginClick}>LOGIN</button>
        }
      </nav>

      {/* ── Content ── */}
      <div className="page-wrap">

        {/* Welcome heading */}
        <h2 className="welcome-heading">
          Welcome To {restaurantName}! Choose Your Favourite Meal!
        </h2>

        {/* Category dropdown */}
        <div className="dropdown-wrap">
          <button
            className="dropdown-trigger"
            onClick={() => setDropdownOpen(prev => !prev)}
          >
            <span style={{ color: category ? "#1a1a1a" : "#2E8B3A" }}>
              {category || "Choose Category"}
            </span>
            <span className={`arrow-icon${dropdownOpen ? " open" : ""}`}>↓</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              {categories.length === 0 ? (
                <div className="dropdown-item" style={{ color: "#aaa", cursor: "default" }}>
                  Categories coming soon...
                </div>
              ) : (
                categories.map((cat, i) => (
                  <div
                    key={i}
                    className={`dropdown-item${category === cat ? " selected" : ""}`}
                    onClick={() => { setCategory(cat); setDropdownOpen(false); }}
                  >
                    {cat}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Menu items will appear here after category is selected & DB connected */}
        {!category && (
          <div className="empty-state">
            Select a category to see the menu
          </div>
        )}

      </div>
    </>
  );
}
