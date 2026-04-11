import { useState, useEffect } from "react";

export default function YourOrderPage({ isLoggedIn = false, onLoginClick, onNavigate, userName = "K" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Future: orders will come from DB/props
  const orders = [];

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

        /* ── Page ── */
        .page-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 36px 40px 80px;
          min-height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
        }

        /* Top heading */
        .page-heading {
          font-size: 18px;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 0;
        }

        /* Empty state — vertically + horizontally centered in remaining space */
        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .empty-text {
          font-size: 22px;
          font-weight: 600;
          color: #E8631A;
          text-align: center;
        }

        @media(max-width: 900px) {
          .navbar, .page-wrap { padding-left: 20px; padding-right: 20px; }
          .page-heading { font-size: 16px; }
          .empty-text { font-size: 18px; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => onNavigate?.("home")}>
          <span className="logo-campus">Campus</span><span className="logo-byte">Byte</span>
        </span>

        <ul className="nav-links">
          <li><button className="nav-btn" onClick={() => onNavigate?.("home")}>Home</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("foodcourt")}>Food Court</button></li>
          <li><button className="nav-btn active">Your Order</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("contact")}>Contact Us</button></li>
        </ul>

        {isLoggedIn
          ? <div className="user-avatar" title="My Account">{userName}</div>
          : <button className="btn-login" onClick={onLoginClick}>LOGIN</button>
        }
      </nav>

      {/* ── Content ── */}
      <div className="page-wrap">

        {/* Heading */}
        <p className="page-heading">Here ! What You Order 🍔😎</p>

        {/* Orders list — empty for now, will be populated from DB */}
        {orders.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">Opps!!! No Order Till NOW</p>
          </div>
        ) : (
          <div className="orders-list">
            {/* Future: map over orders from DB here */}
            {orders.map((order) => (
              <div key={order.id}>{/* order card */}</div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
