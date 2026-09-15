import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const STATUS_CONFIG = {
  placed:     { label: "Order Placed",    color: "#C94D1E", bg: "#FFF3EE", border: "#F4C4A8", dot: true  },
  pending:    { label: "Pending",         color: "#C94D1E", bg: "#FFF3EE", border: "#F4C4A8", dot: true  },
  accepted:   { label: "Accepted",        color: "#2E8B3A", bg: "#E8F5E9", border: "#A5D6A7", dot: true  },
  processing: { label: "Processing",      color: "#E65100", bg: "#FFF8E1", border: "#FFD54F", dot: false },
  prepared:   { label: "Ready to Pickup", color: "#2E8B3A", bg: "#E8F5E9", border: "#A5D6A7", dot: false },
  completed:  { label: "Completed",       color: "#1565C0", bg: "#E3F2FD", border: "#90CAF9", dot: false },
  cancelled:  { label: "Cancelled",       color: "#999",    bg: "#f5f5f5", border: "#ddd",    dot: false },
  rejected:   { label: "Rejected",        color: "#e53e3e", bg: "#fff5f5", border: "#feb2b2", dot: false },
};

const fmtDate = (date) =>
  !date ? "—" : date.toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });

const fmtTime = (sec) => {
  if (!sec || sec <= 0) return "00:00";
  return `${Math.floor(sec/60).toString().padStart(2,"0")}:${(sec%60).toString().padStart(2,"0")}`;
};

export default function YourOrderPage({
  isLoggedIn = false,
  onLoginClick,
  onNavigate,
  userName = "K",
  onLogout,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  userDocId = "",
  orderTimers = {},
}) {
  const [scrolled, setScrolled] = useState(false);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowLogoutPopup(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !userDocId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, "User Login", userDocId, "Orders"),
      (snap) => {
        const list = snap.docs.map(d => {
          const data = d.data();
          const rawStatus = (data.status || "pending").toLowerCase();
          const status = rawStatus === "placed" ? "pending" : rawStatus;
          return {
            id:         d.id,
            shortId:    d.id.slice(-6).toUpperCase(),
            items:      data.items || [],
            total:      data.totalAmount || 0,
            status,
            placedAt:   data.placedAt?.toDate?.() || null,
            outletName: (data.items?.[0]?.outletName) || "",
            restaurantName: (data.items?.[0]?.restaurantName) || "",
          };
        });
        list.sort((a, b) => {
          if (!a.placedAt && !b.placedAt) return 0;
          if (!a.placedAt) return 1;
          if (!b.placedAt) return -1;
          return b.placedAt - a.placedAt;
        });
        setOrders(list);
        setLoading(false);
      },
      (err) => {
        console.error("Orders listener error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [isLoggedIn, userDocId]);

  // completed moves to Past Orders along with cancelled/rejected
  const activeOrders = orders.filter(o => !["cancelled","rejected","completed"].includes(o.status));
  const pastOrders   = orders.filter(o =>  ["cancelled","rejected","completed"].includes(o.status));

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f7f8fa; color: #1a1a1a; }

        .navbar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 64px; background: #fff; box-shadow: 0 1px 0 #eee; transition: box-shadow 0.3s; }
        .navbar.scrolled { box-shadow: 0 1px 12px rgba(0,0,0,0.08); }
        .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; cursor: pointer; user-select: none; }
        .logo-campus { color: #C94D1E; } .logo-byte { color: #2E8B3A; }
        .nav-links { display: flex; align-items: center; gap: 4px; list-style: none; }
        .nav-btn { display: block; padding: 8px 18px; font-size: 15px; font-weight: 500; color: #1a1a1a; background: none; border: none; cursor: pointer; font-family: inherit; border-radius: 6px; position: relative; transition: color 0.2s; }
        .nav-btn::after { content: ''; position: absolute; bottom: 4px; left: 18px; right: 18px; height: 2px; border-radius: 1px; background: #C94D1E; transform: scaleX(0); transition: transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin: left; }
        .nav-btn:hover { color: #C94D1E; } .nav-btn:hover::after { transform: scaleX(1); }
        .nav-btn.active { color: #C94D1E; } .nav-btn.active::after { transform: scaleX(1); }
        .btn-login { background: #C94D1E; color: #fff; padding: 10px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; border: none; cursor: pointer; font-family: inherit; transition: background 0.2s, transform 0.15s; }
        .btn-login:hover { background: #A83C14; transform: translateY(-1px); }
        @keyframes avatarPop { from{transform:scale(0.5);opacity:0;} to{transform:scale(1);opacity:1;} }
        .user-avatar { width:40px; height:40px; border-radius:50%; background:#d0d0d0; color:#1a1a1a; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; cursor:pointer; border:none; flex-shrink:0; animation:avatarPop 0.4s cubic-bezier(0.22,1,0.36,1) both; transition:background 0.2s,transform 0.15s; }
        .user-avatar:hover { background:#b0b0b0; transform:scale(1.06); }
        .nav-arrow-btn { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:1.5px solid #e0e0e0; background:#fff; cursor:pointer; transition:background 0.2s, border-color 0.2s, opacity 0.2s; }
        .nav-arrow-btn:hover:not(:disabled) { background:#FFF3EE; border-color:#C94D1E; }
        .nav-arrow-btn:disabled { opacity:0.3; cursor:default; }
        .nav-arrows { display:flex; align-items:center; gap:6px; margin-right:6px; }
        .avatar-wrap { position:relative; }
        .logout-popup { position:absolute; top:calc(100% + 8px); right:0; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; box-shadow:0 6px 24px rgba(0,0,0,0.12); padding:6px; min-width:130px; z-index:999; animation:popIn 0.18s cubic-bezier(0.22,1,0.36,1); }
        @keyframes popIn { from{opacity:0;transform:scale(0.88) translateY(-6px);} to{opacity:1;transform:scale(1) translateY(0);} }
        .logout-btn-pop { width:100%; padding:10px 14px; font-size:14px; font-weight:700; font-family:inherit; background:none; border:none; cursor:pointer; color:#e53e3e; border-radius:7px; text-align:left; transition:background 0.2s; display:flex; align-items:center; gap:8px; }
        .logout-btn-pop:hover { background:#fff5f5; }

        .page-wrap { max-width: 860px; margin: 0 auto; padding: 36px 24px 80px; }
        .page-heading { font-size: 22px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
        .page-sub { font-size: 14px; color: #888; margin-bottom: 32px; }

        @keyframes spin { to{transform:rotate(360deg);} }
        .spinner { width:36px; height:36px; border:3px solid #f0f0f0; border-top-color:#C94D1E; border-radius:50%; animation:spin 0.8s linear infinite; }
        .loading-state { display:flex; flex-direction:column; align-items:center; gap:14px; padding:80px; }

        .login-prompt { display:flex; flex-direction:column; align-items:center; gap:16px; padding:80px 24px; text-align:center; background:#fff; border-radius:16px; border:1px solid #e8e8e8; }
        .login-prompt-icon { font-size:52px; }
        .login-prompt-title { font-size:20px; font-weight:800; color:#1a1a1a; }
        .login-prompt-sub { font-size:14px; color:#999; }
        .btn-login-prompt { background:#C94D1E; color:#fff; padding:13px 36px; border-radius:9px; font-size:15px; font-weight:700; font-family:inherit; border:none; cursor:pointer; transition:background 0.2s,transform 0.15s; box-shadow:0 4px 14px rgba(201,77,30,0.25); }
        .btn-login-prompt:hover { background:#A83C14; transform:translateY(-1px); }

        .empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:80px 24px; text-align:center; background:#fff; border-radius:16px; border:1px solid #e8e8e8; }
        .empty-state-icon { font-size:52px; }
        .empty-state-title { font-size:20px; font-weight:800; color:#1a1a1a; }
        .empty-state-sub { font-size:14px; color:#999; }

        .section-label { font-size:13px; font-weight:700; color:#888; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:12px; margin-top:28px; }

        @keyframes cardIn { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        .order-card { background:#fff; border-radius:14px; border:1px solid #e8e8e8; overflow:hidden; margin-bottom:14px; animation:cardIn 0.35s cubic-bezier(0.22,1,0.36,1) both; box-shadow:0 2px 8px rgba(0,0,0,0.04); transition:box-shadow 0.2s,transform 0.2s; }
        .order-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.09); transform:translateY(-1px); }
        .order-card-head { display:flex; align-items:center; justify-content:space-between; padding:14px 18px 10px; border-bottom:1px solid #f5f5f5; flex-wrap:wrap; gap:8px; }
        .order-id { font-size:13px; font-weight:800; color:#C94D1E; font-family:monospace; }
        .order-date { font-size:11px; color:#bbb; margin-top:2px; }
        .order-outlet { font-size:12px; color:#888; margin-top:1px; }
        .status-pill { display:inline-flex; align-items:center; gap:7px; border-radius:20px; padding:5px 13px; border:1.5px solid; font-size:12px; font-weight:700; white-space:nowrap; }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.5;} }
        .status-dot { width:7px; height:7px; border-radius:50%; animation:dotPulse 1.4s ease-in-out infinite; }

        .timer-section { padding:10px 18px 12px; background:#FFFBF0; border-bottom:1px solid #FFE082; }
        .timer-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .timer-label { font-size:12px; font-weight:700; color:#E65100; }
        .timer-value { font-size:20px; font-weight:800; color:#E65100; font-variant-numeric:tabular-nums; letter-spacing:1px; }
        .timer-bar-wrap { height:5px; background:#FFE082; border-radius:3px; overflow:hidden; }
        .timer-bar { height:100%; border-radius:3px; background:#E65100; transition:width 1s linear; }
        .timer-bar.urgent { background:#e53e3e; animation:urgentPulse 0.7s ease-in-out infinite; }
        @keyframes urgentPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

        .order-body { padding:12px 18px; }
        .order-items-list { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; }
        .order-item-row { display:flex; align-items:center; justify-content:space-between; font-size:13.5px; }
        .order-item-name { color:#1a1a1a; font-weight:500; }
        .order-item-price { color:#C94D1E; font-weight:700; font-size:13px; }
        .order-divider { height:1px; background:#f0f0f0; margin:8px 0; }
        .order-total-row { display:flex; align-items:center; justify-content:space-between; }
        .order-total-label { font-size:13px; font-weight:700; color:#555; }
        .order-total-val { font-size:15px; font-weight:800; color:#2E8B3A; }

        .ready-banner { display:flex; align-items:center; gap:10px; padding:10px 18px; background:linear-gradient(90deg,#E8F5E9,#f0fff4); border-bottom:1px solid #A5D6A7; }
        .ready-icon { font-size:20px; }
        .ready-text { font-size:13px; font-weight:700; color:#2E8B3A; }
        .ready-sub { font-size:11px; color:#388E3C; }

        @media(max-width:640px) { .navbar,.page-wrap{padding-left:16px;padding-right:16px;} .page-heading{font-size:19px;} }
      `}</style>

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
        {isLoggedIn ? (
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <div className="nav-arrows">
              <button className="nav-arrow-btn" onClick={onGoBack} disabled={!canGoBack} title="Go Back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button className="nav-arrow-btn" onClick={onGoForward} disabled={!canGoForward} title="Go Forward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div className="avatar-wrap" ref={avatarRef}>
              <div className="user-avatar" title="My Account" onClick={() => setShowLogoutPopup(v => !v)}>{userName}</div>
              {showLogoutPopup && (
                <div className="logout-popup">
                  <button className="logout-btn-pop" onClick={() => { setShowLogoutPopup(false); onLogout?.(); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <div className="nav-arrows">
              <button className="nav-arrow-btn" onClick={onGoBack} disabled={!canGoBack} title="Go Back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button className="nav-arrow-btn" onClick={onGoForward} disabled={!canGoForward} title="Go Forward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <button className="btn-login" onClick={onLoginClick}>LOGIN</button>
          </div>
        )}
      </nav>

      <div className="page-wrap">
        <h1 className="page-heading">Your Orders 🍔</h1>
        <p className="page-sub">Track your current and past orders in real-time</p>

        {!isLoggedIn && (
          <div className="login-prompt">
            <div className="login-prompt-icon">🔐</div>
            <div className="login-prompt-title">Login to see your orders</div>
            <div className="login-prompt-sub">You need to be logged in to track your orders.</div>
            <button className="btn-login-prompt" onClick={onLoginClick}>Login Now</button>
          </div>
        )}

        {isLoggedIn && loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p style={{color:"#999",fontSize:"15px"}}>Loading your orders...</p>
          </div>
        )}

        {isLoggedIn && !loading && orders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <div className="empty-state-title">No orders yet</div>
            <div className="empty-state-sub">Go explore the food court and place your first order!</div>
          </div>
        )}

        {isLoggedIn && !loading && activeOrders.length > 0 && (
          <>
            <div className="section-label">Active Orders</div>
            {activeOrders.map((order, i) => {
              const cfg    = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const timer  = orderTimers[order.id];
              const tLeft  = timer?.timeLeft  ?? 0;
              const tTotal = timer?.totalSec  ?? 0;
              const urgent = order.status === "processing" && tLeft < 60;

              return (
                <div className="order-card" key={order.id} style={{animationDelay:`${i*0.07}s`}}>
                  {order.status === "prepared" && (
                    <div className="ready-banner">
                      <div className="ready-icon">🔔</div>
                      <div>
                        <div className="ready-text">Your food is ready!</div>
                        <div className="ready-sub">Please collect your order from the counter.</div>
                      </div>
                    </div>
                  )}
                  {order.status === "processing" && (
                    <div className="timer-section">
                      <div className="timer-top">
                        <div className="timer-label">⏱ Estimated time remaining</div>
                        <div className="timer-value">{fmtTime(tLeft)}</div>
                      </div>
                      <div className="timer-bar-wrap">
                        <div className={`timer-bar${urgent?" urgent":""}`}
                          style={{width:`${tTotal ? Math.max(0,(tLeft/tTotal)*100) : 0}%`}}/>
                      </div>
                    </div>
                  )}
                  <div className="order-card-head">
                    <div>
                      <div className="order-id">#{order.shortId}</div>
                      <div className="order-date">{fmtDate(order.placedAt)}</div>
                      {order.restaurantName && (
                        <div className="order-outlet">
                          📍 {order.restaurantName}{order.outletName ? ` · ${order.outletName}` : ""}
                        </div>
                      )}
                    </div>
                    <div className="status-pill" style={{color:cfg.color, background:cfg.bg, borderColor:cfg.border}}>
                      {cfg.dot && <span className="status-dot" style={{background:cfg.color}}/>}
                      {cfg.label}
                    </div>
                  </div>
                  <div className="order-body">
                    <div className="order-items-list">
                      {order.items.map((it, j) => (
                        <div className="order-item-row" key={j}>
                          <span className="order-item-name">{it.name} × {it.quantity}</span>
                          <span className="order-item-price">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-divider"/>
                    <div className="order-total-row">
                      <span className="order-total-label">Total</span>
                      <span className="order-total-val">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {isLoggedIn && !loading && pastOrders.length > 0 && (
          <>
            <div className="section-label" style={{marginTop: activeOrders.length > 0 ? "36px" : "0"}}>Past Orders</div>
            {pastOrders.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.cancelled;
              return (
                <div className="order-card" key={order.id} style={{animationDelay:`${i*0.07}s`,opacity:0.75}}>
                  <div className="order-card-head">
                    <div>
                      <div className="order-id">#{order.shortId}</div>
                      <div className="order-date">{fmtDate(order.placedAt)}</div>
                      {order.restaurantName && (
                        <div className="order-outlet">
                          📍 {order.restaurantName}{order.outletName ? ` · ${order.outletName}` : ""}
                        </div>
                      )}
                    </div>
                    <div className="status-pill" style={{color:cfg.color, background:cfg.bg, borderColor:cfg.border}}>
                      {cfg.label}
                    </div>
                  </div>
                  <div className="order-body">
                    <div className="order-items-list">
                      {order.items.map((it, j) => (
                        <div className="order-item-row" key={j}>
                          <span className="order-item-name">{it.name} × {it.quantity}</span>
                          <span className="order-item-price">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-divider"/>
                    <div className="order-total-row">
                      <span className="order-total-label">Total</span>
                      <span className="order-total-val">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

      </div>
    </>
  );
}