import { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";


const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80", 
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&q=80", 
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80", 
  "https://images.unsplash.com/photo-1574484284002-952d92456975?w=700&q=80", 
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&q=80", 
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80", 
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80", 
  "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=700&q=80", 
  "https://images.unsplash.com/photo-1559847844-5315695dadae?w=700&q=80", 
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=700&q=80", 
];


const getDefaultImage = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return DEFAULT_IMAGES[Math.abs(hash) % DEFAULT_IMAGES.length];
};

export default function FoodCourtPage({ isLoggedIn = false, onLoginClick, onNavigate, userName = "K", onLogout, canGoBack, canGoForward, onGoBack, onGoForward }) {
  const [scrolled, setScrolled]         = useState(false);
  const [restaurants, setRestaurants]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

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
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "Restaurant Registration"));
      const list = snap.docs.map(d => ({
        id:    d.id,
        name:  d.data()["Name of the Restaurant"] || "Unknown Restaurant",
        image: getDefaultImage(d.data()["Name of the Restaurant"] || d.id),
      }));
      setRestaurants(list);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to load food courts. Please check your connection.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#fff; color:#1a1a1a; }

        /* ── Navbar ── */
        .navbar {
          position:sticky; top:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 40px; height:64px; background:#fff;
          box-shadow:0 1px 0 #eee; transition:box-shadow 0.3s;
        }
        .navbar.scrolled { box-shadow:0 1px 12px rgba(0,0,0,0.08); }

        .logo { font-size:22px; font-weight:800; letter-spacing:-0.5px; text-decoration:none; cursor:pointer; user-select:none; }
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
        .nav-btn:hover { color:#C94D1E; }
        .nav-btn:hover::after { transform:scaleX(1); }
        .nav-btn.active { color:#C94D1E; }
        .nav-btn.active::after { transform:scaleX(1); }

        .btn-login {
          background:#C94D1E; color:#fff; padding:10px 28px; border-radius:8px;
          font-weight:700; font-size:14px; letter-spacing:0.5px;
          border:none; cursor:pointer; font-family:inherit;
          transition:background 0.2s, transform 0.15s;
        }
        .btn-login:hover { background:#A83C14; transform:translateY(-1px); }

        @keyframes avatarPop { from{transform:scale(0.5);opacity:0;} to{transform:scale(1);opacity:1;} }
        .user-avatar {
          width:40px; height:40px; border-radius:50%;
          background:#d0d0d0; color:#1a1a1a;
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:700; cursor:pointer;
          border:none; flex-shrink:0;
          animation:avatarPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
          transition:background 0.2s, transform 0.15s;
        }
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

        /* ── Page ── */
        .page-wrap { max-width:1240px; margin:0 auto; padding:40px 40px 80px; }

        .section-title { font-size:22px; font-weight:700; color:#C94D1E; margin-bottom:32px; }

        /* ── Loading skeleton ── */
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:40px 36px; }
        .skeleton-card { display:flex; flex-direction:column; align-items:center; gap:14px; }
        .skeleton-img {
          width:100%; aspect-ratio:4/3; border-radius:4px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size:600px 100%;
          animation:shimmer 1.4s infinite linear;
        }
        .skeleton-text {
          height:18px; width:60%; border-radius:4px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size:600px 100%;
          animation:shimmer 1.4s infinite linear;
        }

        /* ── Restaurant grid ── */
        .grid { display:grid; grid-template-columns:repeat(3,1fr); row-gap:48px; column-gap:36px; }

        /* ── Card ── */
        @keyframes cardIn { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .card {
          display:flex; flex-direction:column; align-items:center; cursor:pointer;
          animation:cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .img-wrap {
          width:100%; aspect-ratio:4/3; overflow:hidden; border-radius:4px;
          background:#f0f0f0; margin-bottom:14px;
        }
        .img-wrap img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 0.38s cubic-bezier(0.22,1,0.36,1);
        }
        .card:hover .img-wrap img { transform:scale(1.06); }
        .rest-name { font-size:18px; font-weight:700; color:#2E8B3A; text-align:center; transition:color 0.2s; }
        .card:hover .rest-name { color:#1a5e24; }

        /* ── Error state ── */
        .error-state {
          text-align:center; padding:60px 24px;
          display:flex; flex-direction:column; align-items:center; gap:16px;
        }
        .error-icon  { font-size:48px; }
        .error-title { font-size:18px; font-weight:700; color:#C94D1E; }
        .error-sub   { font-size:14px; color:#888; }
        .btn-retry {
          margin-top:8px; background:#C94D1E; color:#fff; padding:12px 32px;
          border-radius:9px; font-size:15px; font-weight:700; font-family:inherit;
          border:none; cursor:pointer; transition:background 0.2s, transform 0.15s;
        }
        .btn-retry:hover { background:#A83C14; transform:translateY(-1px); }

        /* ── Empty state ── */
        .empty-state {
          text-align:center; padding:80px 24px;
          display:flex; flex-direction:column; align-items:center; gap:14px;
        }
        .empty-icon  { font-size:52px; }
        .empty-title { font-size:18px; font-weight:700; color:#444; }
        .empty-sub   { font-size:14px; color:#999; }

        @media(max-width:900px) {
          .grid, .skeleton-grid { grid-template-columns:repeat(2,1fr); gap:28px; }
          .navbar, .page-wrap { padding-left:20px; padding-right:20px; }
        }
        @media(max-width:560px) {
          .grid, .skeleton-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => onNavigate?.("home")}>
          <span className="logo-campus">Campus</span><span className="logo-byte">Byte</span>
        </span>
        <ul className="nav-links">
          <li><button className="nav-btn" onClick={() => onNavigate?.("home")}>Home</button></li>
          <li><button className="nav-btn active">Food Court</button></li>
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
        <h2 className="section-title">Choose Your Favourites Food Court</h2>

        {/* Loading skeleton */}
        {loading && (
          <div className="skeleton-grid">
            {[1,2,3,4,5,6].map(i => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton-img" style={{ animationDelay:`${i*0.1}s` }} />
                <div className="skeleton-text" style={{ animationDelay:`${i*0.1}s` }} />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-title">{error}</p>
            <p className="error-sub">Please check your internet connection and try again.</p>
            <button className="btn-retry" onClick={fetchRestaurants}>Try Again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p className="empty-title">No food courts registered yet</p>
            <p className="empty-sub">Check back soon — restaurants are being added.</p>
          </div>
        )}

        {/* Restaurant grid */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="grid">
            {restaurants.map((r, i) => (
              <div
                className="card"
                key={r.id}
                style={{ animationDelay:`${i * 0.07}s` }}
                onClick={() => onNavigate?.("menu", r)}
              >
                <div className="img-wrap">
                  <img src={r.image} alt={r.name} loading="lazy" />
                </div>
                <p className="rest-name">{r.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
