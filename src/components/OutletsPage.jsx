import { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=80";

export default function OutletsPage({ restaurant, isLoggedIn = false, onLoginClick, onNavigate, userName = "K", onLogout, canGoBack, canGoForward, onGoBack, onGoForward }) {
  const [scrolled, setScrolled]   = useState(false);
  const [outlets, setOutlets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const restaurantName  = restaurant?.name || "Restaurant";
  const restaurantDocId = restaurant?.id   || "";

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
    if (restaurantDocId) fetchOutlets();
    else { setError("Restaurant not found."); setLoading(false); }
  }, [restaurantDocId]);

  const fetchOutlets = async () => {
    setLoading(true); setError("");
    try {
      const snap = await getDocs(
        collection(db, "Restaurant Registration", restaurantDocId, "Outlets")
      );
      const list = snap.docs.map(d => ({
        id:         d.id,
        name:       d.data()["Outlet Name"] || "Outlet",
        location:   d.data()["Location"]    || "",
        isOpen:     d.data()["Is Open"]     ?? true,
        image:      DEFAULT_IMAGE,
        university: "Lovely Professional University",
      }));
      setOutlets(list);
    } catch (err) {
      console.error("Error fetching outlets:", err);
      setError("Failed to load outlets. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#fff; color:#1a1a1a; }

        /* Navbar */
        .navbar {
          position:sticky; top:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 40px; height:64px; background:#fff;
          box-shadow:0 1px 0 #eee; transition:box-shadow 0.3s;
        }
        .navbar.scrolled { box-shadow:0 1px 12px rgba(0,0,0,0.08); }
        .logo { font-size:22px; font-weight:800; letter-spacing:-0.5px; cursor:pointer; user-select:none; }
        .logo-campus { color:#C94D1E; }
        .logo-byte   { color:#2E8B3A; }
        .nav-links { display:flex; align-items:center; gap:4px; list-style:none; }
        .nav-btn {
          display:block; padding:8px 18px; font-size:15px; font-weight:500; color:#1a1a1a;
          background:none; border:none; cursor:pointer; font-family:inherit; border-radius:6px;
          position:relative; transition:color 0.2s;
        }
        .nav-btn::after {
          content:''; position:absolute; bottom:4px; left:18px; right:18px;
          height:2px; border-radius:1px; background:#C94D1E;
          transform:scaleX(0); transition:transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin:left;
        }
        .nav-btn:hover { color:#C94D1E; } .nav-btn:hover::after { transform:scaleX(1); }
        .nav-btn.active { color:#C94D1E; } .nav-btn.active::after { transform:scaleX(1); }
        .btn-login { background:#C94D1E; color:#fff; padding:10px 28px; border-radius:8px; font-weight:700; font-size:14px; letter-spacing:0.5px; border:none; cursor:pointer; font-family:inherit; transition:background 0.2s, transform 0.15s; }
        .btn-login:hover { background:#A83C14; transform:translateY(-1px); }
        @keyframes avatarPop { from{transform:scale(0.5);opacity:0;} to{transform:scale(1);opacity:1;} }
        .user-avatar { width:40px; height:40px; border-radius:50%; background:#d0d0d0; color:#1a1a1a; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; cursor:pointer; border:none; flex-shrink:0; animation:avatarPop 0.4s cubic-bezier(0.22,1,0.36,1) both; transition:background 0.2s, transform 0.15s; }
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

        /* Page */
        .page-wrap { max-width:1240px; margin:0 auto; padding:40px 40px 80px; }

        /* Breadcrumb */
        .breadcrumb {
          display:flex; align-items:center; gap:8px;
          font-size:14px; color:#888; margin-bottom:24px;
        }
        .breadcrumb-link {
          color:#C94D1E; font-weight:600; cursor:pointer; background:none; border:none;
          font-family:inherit; font-size:14px; padding:0; transition:color 0.2s;
        }
        .breadcrumb-link:hover { color:#A83C14; text-decoration:underline; }
        .breadcrumb-sep { color:#ccc; }
        .breadcrumb-current { color:#888; font-weight:500; }

        /* Section title */
        .section-title { font-size:22px; font-weight:700; color:#C94D1E; margin-bottom:8px; }
        .section-sub   { font-size:15px; color:#666; margin-bottom:32px; }

        /* Loading skeleton */
        @keyframes shimmer {
          0%   { background-position:-600px 0; }
          100% { background-position: 600px 0; }
        }
        .skeleton-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:28px; }
        .skeleton-card { border-radius:14px; overflow:hidden; border:1px solid #e8e8e8; }
        .skeleton-img  { width:100%; height:220px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; }
        .skeleton-body { padding:20px; display:flex; flex-direction:column; gap:10px; }
        .skeleton-line { height:16px; border-radius:4px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; }

        /* Grid */
        .outlets-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:28px; }

        /* Card */
        @keyframes cardIn { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .outlet-card {
          border-radius:14px; border:1px solid #e8e8e8; overflow:hidden;
          cursor:pointer; background:#fff;
          animation:cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
          transition:box-shadow 0.2s, transform 0.2s;
        }
        .outlet-card:hover { box-shadow:0 8px 32px rgba(0,0,0,0.12); transform:translateY(-3px); }
        .outlet-card.closed { opacity:0.6; cursor:not-allowed; }
        .outlet-card.closed:hover { transform:none; box-shadow:none; }

        .card-img-wrap { width:100%; height:200px; overflow:hidden; }
        .card-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }
        .outlet-card:not(.closed):hover .card-img-wrap img { transform:scale(1.06); }

        .card-body { padding:18px 20px 20px; }

        .card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; }
        .outlet-name { font-size:18px; font-weight:800; color:#1a1a1a; line-height:1.3; }

        /* Status badge */
        .status-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700;
          white-space:nowrap; flex-shrink:0;
        }
        .status-badge.open   { background:#E8F5E9; color:#2E8B3A; border:1px solid #A5D6A7; }
        .status-badge.closed { background:#f5f5f5;  color:#999;    border:1px solid #ddd; }
        .badge-dot { width:7px; height:7px; border-radius:50%; }
        .status-badge.open   .badge-dot { background:#2E8B3A; animation:dotPulse 1.4s ease-in-out infinite; }
        .status-badge.closed .badge-dot { background:#ccc; }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.4);opacity:0.5;} }

        .card-location { font-size:13px; color:#888; line-height:1.5; margin-bottom:14px; }

        /* Select button */
        .btn-select {
          width:100%; padding:12px; border-radius:8px;
          font-size:14px; font-weight:700; font-family:inherit;
          border:none; cursor:pointer;
          transition:background 0.2s, transform 0.15s;
        }
        .btn-select.open   { background:#C94D1E; color:#fff; box-shadow:0 3px 10px rgba(201,77,30,0.22); }
        .btn-select.open:hover { background:#A83C14; transform:translateY(-1px); }
        .btn-select.closed { background:#f0f0f0; color:#aaa; cursor:not-allowed; }

        /* Closed notice */
        .closed-notice { font-size:12px; color:#e53e3e; margin-top:8px; text-align:center; font-weight:600; }

        /* Error state */
        .error-state { text-align:center; padding:60px 24px; display:flex; flex-direction:column; align-items:center; gap:16px; }
        .error-icon  { font-size:48px; }
        .error-title { font-size:18px; font-weight:700; color:#C94D1E; }
        .error-sub   { font-size:14px; color:#888; }
        .btn-retry   { margin-top:8px; background:#C94D1E; color:#fff; padding:12px 32px; border-radius:9px; font-size:15px; font-weight:700; font-family:inherit; border:none; cursor:pointer; transition:background 0.2s, transform 0.15s; }
        .btn-retry:hover { background:#A83C14; transform:translateY(-1px); }

        /* Empty state */
        .empty-state { text-align:center; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:14px; }
        .empty-icon  { font-size:52px; }
        .empty-title { font-size:18px; font-weight:700; color:#444; }
        .empty-sub   { font-size:14px; color:#999; }

        @media(max-width:860px) {
          .outlets-grid, .skeleton-grid { grid-template-columns:1fr; }
          .navbar, .page-wrap { padding-left:20px; padding-right:20px; }
          .section-title { font-size:19px; }
        }
      `}</style>

      {/* Navbar */}
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
          ? (
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
          )
          : (
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
          )
        }
      </nav>

      {/* Content */}
      <div className="page-wrap">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button className="breadcrumb-link" onClick={() => onNavigate?.("foodcourt")}>
            Food Court
          </button>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{restaurantName}</span>
        </div>

        <h2 className="section-title">Select an Outlet — {restaurantName}</h2>
        <p className="section-sub">Choose which outlet you want to order from.</p>

        {/* Loading skeleton */}
        {loading && (
          <div className="skeleton-grid">
            {[1, 2].map(i => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line" style={{ width:"70%" }} />
                  <div className="skeleton-line" style={{ width:"50%" }} />
                  <div className="skeleton-line" style={{ width:"100%", height:"40px", borderRadius:"8px", marginTop:"8px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-title">{error}</p>
            <p className="error-sub">Please check your internet connection and try again.</p>
            <button className="btn-retry" onClick={fetchOutlets}>Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && outlets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <p className="empty-title">No outlets available yet</p>
            <p className="empty-sub">{restaurantName} hasn't added any outlets yet. Check back soon!</p>
          </div>
        )}

        {/* Outlets grid */}
        {!loading && !error && outlets.length > 0 && (
          <div className="outlets-grid">
            {outlets.map((outlet, i) => (
              <div
                key={outlet.id}
                className={`outlet-card${!outlet.isOpen ? " closed" : ""}`}
                style={{ animationDelay:`${i * 0.08}s` }}
                onClick={() => {
                  if (!outlet.isOpen) return;
                  // Pass both restaurant and outlet to menu page
                  onNavigate?.("menu", { restaurant, outlet });
                }}
              >
                {/* Image */}
                <div className="card-img-wrap">
                  <img src={outlet.image} alt={outlet.name} loading="lazy" />
                </div>

                {/* Body */}
                <div className="card-body">
                  <div className="card-top">
                    <p className="outlet-name">{outlet.name}</p>
                    <span className={`status-badge ${outlet.isOpen ? "open" : "closed"}`}>
                      <span className="badge-dot" />
                      {outlet.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <div className="card-location">
                    <div>{outlet.location}</div>
                    <div>{outlet.university}</div>
                  </div>

                  <button className={`btn-select ${outlet.isOpen ? "open" : "closed"}`}>
                    {outlet.isOpen ? "Select This Outlet →" : "Currently Closed"}
                  </button>

                  {!outlet.isOpen && (
                    <p className="closed-notice">This outlet is currently not accepting orders.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
