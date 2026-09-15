import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminHomePage({ onNavigate, restaurantName = "", restaurantDocId = "", onAdminSession, onAdminLogout, canGoBack, canGoForward, onGoBack, onGoForward }) {
  const [scrolled, setScrolled]       = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const [showLogin, setShowLogin]     = useState(false);
  const [loginPhone, setLoginPhone]   = useState("");
  const [loginPass, setLoginPass]     = useState("");
  const [loginErr, setLoginErr]       = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginShake, setLoginShake]   = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isRegistered = !!restaurantName;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => { window.removeEventListener("scroll", fn); clearTimeout(t); };
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") { setShowLogin(false); setShowLogoutConfirm(false); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const triggerLoginShake = () => {
    setLoginShake(true);
    setTimeout(() => setLoginShake(false), 500);
  };

  const handleAdminLogin = async () => {
    setLoginErr("");
    if (!loginPhone.trim() || !loginPass.trim()) {
      setLoginErr("Please enter phone number and password.");
      triggerLoginShake(); return;
    }
    setLoginLoading(true);
    try {
      const snap = await getDocs(collection(db, "Restaurant Registration"));
      let matched = null;
      let matchedDocId = null;

      snap.forEach((docSnap) => {
        const d = docSnap.data();
        const storedPhone = (d["Phone Number"] || d["phone"] || "").toString().trim();
        const storedPass  = (d["Password"]     || d["password"] || "").toString();
        if (storedPhone === loginPhone.trim() && storedPass === loginPass) {
          matched      = d;
          matchedDocId = docSnap.id;
        }
      });

      if (!matched) {
        setLoginErr("Incorrect phone number or password.");
        triggerLoginShake();
        setLoginLoading(false); return;
      }

      const rName = matched["Name of the Restaurant"] || matched["name"] || "Restaurant";
      setLoginLoading(false);
      setShowLogin(false);
      setLoginPhone(""); setLoginPass(""); setLoginErr("");
      onAdminSession?.({ restaurantName: rName, restaurantDocId: matchedDocId });

    } catch (err) {
      console.error("Admin login error:", err);
      setLoginErr("Connection error. Please try again.");
      setLoginLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #fff; color: #1a1a1a; }
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 68px; background: #fff;
          box-shadow: 0 1px 0 #e5e5e5; transition: box-shadow 0.3s;
        }
        .navbar.scrolled { box-shadow: 0 2px 16px rgba(0,0,0,0.09); }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; cursor: pointer; user-select: none; }
        .logo-campus { color: #C94D1E; }
        .logo-byte   { color: #2E8B3A; }
        .nav-links { display: flex; align-items: center; gap: 4px; list-style: none; }
        .nav-btn {
          display: block; padding: 8px 20px;
          font-size: 15px; font-weight: 500; color: #1a1a1a;
          background: none; border: none; cursor: pointer;
          font-family: inherit; border-radius: 6px;
          position: relative; transition: color 0.2s;
        }
        .nav-btn::after {
          content: ''; position: absolute; bottom: 4px; left: 20px; right: 20px;
          height: 2.5px; border-radius: 2px; background: #C94D1E;
          transform: scaleX(0);
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin: left;
        }
        .nav-btn:hover { color: #C94D1E; }
        .nav-btn:hover::after { transform: scaleX(1); }
        .nav-btn.active { color: #C94D1E; }
        .nav-btn.active::after { transform: scaleX(1); }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .btn-login-nav {
          background: #fff; color: #C94D1E;
          padding: 10px 26px; border-radius: 8px;
          font-weight: 700; font-size: 14px; letter-spacing: 0.4px;
          border: 2px solid #C94D1E; cursor: pointer; font-family: inherit;
          transition: background 0.2s, color 0.2s;
        }
        .btn-login-nav:hover { background: #FFF3EE; }
        .btn-register-nav {
          background: #C94D1E; color: #fff;
          padding: 11px 28px; border-radius: 8px;
          font-weight: 700; font-size: 14px; letter-spacing: 0.4px;
          border: none; cursor: pointer; font-family: inherit;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 3px 12px rgba(201,77,30,0.22);
        }
        .btn-register-nav:hover { background: #A83C14; transform: translateY(-1px); }
        .btn-logout-nav {
          background: #fff; color: #e53e3e;
          padding: 9px 18px; border-radius: 8px;
          font-weight: 700; font-size: 13px;
          border: 1.5px solid #e53e3e; cursor: pointer; font-family: inherit;
          transition: background 0.2s, color 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .btn-logout-nav:hover { background: #fff5f5; }
        @keyframes chipPop { from{transform:scale(0.7);opacity:0;} to{transform:scale(1);opacity:1;} }
        .rest-chip {
          display: flex; align-items: center; gap: 10px;
          background: #FFF3EE; border: 1.5px solid #F4C4A8;
          border-radius: 24px; padding: 8px 18px 8px 10px;
          animation: chipPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .rest-chip-icon { width: 32px; height: 32px; border-radius: 50%; background: #C94D1E; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rest-chip-name { font-size: 14px; font-weight: 700; color: #C94D1E; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hero {
          min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; padding-top: 68px;
          overflow: hidden; background: #fafafa;
        }
        .hero-image-col { height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 40px 0 40px 40px; background: #fafafa; }
        .hero-img { width: 100%; max-width: 580px; height: 580px; object-fit: cover; border-radius: 14px; opacity: 0; transform: scale(1.04); transition: opacity 0.9s ease, transform 1.1s cubic-bezier(0.22,1,0.36,1); }
        .hero-img.visible { opacity: 1; transform: scale(1); }
        .hero-text-col { padding: 0 72px 0 64px; display: flex; flex-direction: column; gap: 0; background: #fafafa; }
        .badge-line { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; opacity: 0; transform: translateY(14px); transition: opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s; }
        .badge-line.visible { opacity: 1; transform: translateY(0); }
        .badge-dot { width: 12px; height: 12px; border-radius: 50%; background: #C94D1E; flex-shrink: 0; animation: pulse-dot 1.8s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.35);opacity:0.65;} }
        .badge-text { font-size: 15px; font-weight: 500; color: #1a1a1a; }
        .hero-heading { font-size: 46px; font-weight: 800; line-height: 1.12; color: #C94D1E; margin-bottom: 22px; opacity: 0; transform: translateY(20px); transition: opacity 0.65s ease 0.25s, transform 0.65s ease 0.25s; }
        .hero-heading.visible { opacity: 1; transform: translateY(0); }
        .hero-free { font-size: 18px; font-weight: 400; color: #1a1a1a; margin-bottom: 16px; opacity: 0; transform: translateY(14px); transition: opacity 0.65s ease 0.38s, transform 0.65s ease 0.38s; }
        .hero-free.visible { opacity: 1; transform: translateY(0); }
        .hero-free strong { font-weight: 800; color: #1a1a1a; }
        .hero-manage { font-size: 22px; font-weight: 700; color: #2E8B3A; margin-bottom: 28px; opacity: 0; transform: translateY(14px); transition: opacity 0.65s ease 0.48s, transform 0.65s ease 0.48s; }
        .hero-manage.visible { opacity: 1; transform: translateY(0); }
        .divider { width: 56px; height: 3px; border-radius: 2px; background: #C94D1E; margin-bottom: 36px; opacity: 0; transition: opacity 0.5s ease 0.54s; }
        .divider.visible { opacity: 1; }
        .cta-wrap { opacity: 0; transform: translateY(14px); transition: opacity 0.65s ease 0.62s, transform 0.65s ease 0.62s; }
        .cta-wrap.visible { opacity: 1; transform: translateY(0); }
        .btn-register-hero {
          background: #C94D1E; color: #fff;
          font-size: 17px; font-weight: 700; font-family: inherit;
          padding: 16px 44px; border-radius: 9px;
          border: none; cursor: pointer; letter-spacing: 0.3px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(201,77,30,0.28);
        }
        .btn-register-hero:hover { background: #A83C14; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,77,30,0.36); }
        @keyframes welcomeFade { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        .registered-msg { font-size: 18px; font-weight: 600; color: #2E8B3A; padding: 16px 24px; border-radius: 10px; background: #eafbee; border: 1.5px solid #a8ddb5; animation: welcomeFade 0.6s ease both; }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        @keyframes popupIn   { from{opacity:0;transform:scale(0.93) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .login-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          animation: overlayIn 0.2s ease both;
        }
        .login-popup {
          background: #fff; border-radius: 18px;
          width: 100%; max-width: 420px;
          padding: 36px 36px 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          animation: popupIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
          position: relative;
        }
        .login-popup.shake { animation: shake 0.45s ease both; }
        .logout-confirm-popup {
          background: #fff; border-radius: 18px;
          width: 100%; max-width: 360px;
          padding: 36px 32px 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          animation: popupIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
          position: relative; text-align: center;
        }
        .popup-close {
          position: absolute; top: 16px; right: 16px;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid #e8e8e8; background: #fff; color: #888;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .popup-close:hover { background: #fff0ee; border-color: #C94D1E; color: #C94D1E; }
        .popup-logo { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .popup-sub  { font-size: 13px; color: #999; margin-bottom: 26px; }
        .popup-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .popup-field label { font-size: 13px; font-weight: 700; color: #555; }
        .popup-field input {
          padding: 11px 14px; border-radius: 8px;
          border: 1.5px solid #e0e0e0; background: #f7f7f7;
          font-size: 15px; font-family: inherit; color: #1a1a1a; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .popup-field input:focus { border-color: #C94D1E; background: #fff; }
        .popup-err {
          background: #FFF3EE; border: 1.5px solid #F4C4A8;
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #C94D1E; font-weight: 600;
          margin-bottom: 14px;
        }
        .popup-btn {
          width: 100%; padding: 13px;
          background: #C94D1E; color: #fff;
          border: none; border-radius: 10px;
          font-size: 15px; font-weight: 800; font-family: inherit;
          cursor: pointer; letter-spacing: 0.3px;
          transition: background 0.15s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(201,77,30,0.28);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .popup-btn:hover:not(:disabled) { background: #A83C14; transform: translateY(-1px); }
        .popup-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .popup-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .popup-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
        .popup-divider-line { flex: 1; height: 1px; background: #f0f0f0; }
        .popup-divider-text { font-size: 12px; color: #bbb; white-space: nowrap; }
        .popup-register-link {
          width: 100%; padding: 11px;
          background: #fff; color: #C94D1E;
          border: 2px solid #C94D1E; border-radius: 10px;
          font-size: 14px; font-weight: 700; font-family: inherit;
          cursor: pointer; transition: background 0.15s;
        }
        .popup-register-link:hover { background: #FFF3EE; }
        .btn-logout-confirm {
          width: 100%; padding: 12px;
          background: #e53e3e; color: #fff;
          border: none; border-radius: 9px;
          font-size: 15px; font-weight: 700; font-family: inherit;
          cursor: pointer; margin-bottom: 10px;
          transition: background 0.2s;
        }
        .btn-logout-confirm:hover { background: #c53030; }
        .btn-logout-cancel {
          width: 100%; padding: 11px;
          background: #fff; color: #555;
          border: 1.5px solid #e0e0e0; border-radius: 9px;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-logout-cancel:hover { background: #f5f5f5; }
        @media(max-width: 960px) {
          .hero { grid-template-columns: 1fr; background: #fff; }
          .hero-image-col { height: 42vh; padding: 24px; }
          .hero-text-col { padding: 36px 28px; background: #fff; }
          .hero-heading { font-size: 32px; }
          .hero-manage { font-size: 18px; }
          .navbar { padding: 0 24px; }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => onNavigate?.("admin-home")}>
          <span className="logo-campus">Campus</span><span className="logo-byte">Byte</span>
        </span>
        <ul className="nav-links">
          <li><button className="nav-btn active">Home</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-manage")}>Manage</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-orders")}>Orders</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-contact")}>Contact Us</button></li>
        </ul>
        <div className="nav-right">
          <div style={{display:"flex",gap:"6px",marginRight:"4px"}}>
            <button onClick={onGoBack} disabled={!canGoBack} title="Go Back" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoBack?"pointer":"default",opacity:canGoBack?1:0.35,transition:"all 0.2s"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button onClick={onGoForward} disabled={!canGoForward} title="Go Forward" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoForward?"pointer":"default",opacity:canGoForward?1:0.35,transition:"all 0.2s"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
          {isRegistered ? (
            <>
              <div className="rest-chip" title={restaurantName}>
                <div className="rest-chip-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="rest-chip-name">{restaurantName}</span>
              </div>
              <button className="btn-logout-nav" onClick={() => setShowLogoutConfirm(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-login-nav" onClick={() => setShowLogin(true)}>Login</button>
              <button className="btn-register-nav" onClick={() => onNavigate?.("admin-register")}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-image-col">
          <img
            className={`hero-img${heroVisible ? " visible" : ""}`}
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85"
            alt="Delicious food at LPU Food Court"
          />
        </div>
        <div className="hero-text-col">
          <div className={`badge-line${heroVisible ? " visible" : ""}`}>
            <span className="badge-dot" />
            <span className="badge-text">Now Manage LPU Food Court Easily</span>
          </div>
          <h1 className={`hero-heading${heroVisible ? " visible" : ""}`}>Welcome to CampusByte</h1>
          <p className={`hero-free${heroVisible ? " visible" : ""}`}>Register your LPU Food Court for <strong>FREE</strong></p>
          <p className={`hero-manage${heroVisible ? " visible" : ""}`}>Manage Your Restaurant Completely Free</p>
          <div className={`divider${heroVisible ? " visible" : ""}`} />
          <div className={`cta-wrap${heroVisible ? " visible" : ""}`}>
            {isRegistered ? (
              <div className="registered-msg">
                {restaurantName} is registered! Go to Manage to add your menu.
              </div>
            ) : (
              <button className="btn-register-hero" onClick={() => onNavigate?.("admin-register")}>
                Register Now
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Login Popup */}
      {showLogin && (
        <div className="login-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className={`login-popup${loginShake ? " shake" : ""}`}>
            <button className="popup-close" onClick={() => setShowLogin(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="popup-logo">
              <span style={{color:"#C94D1E"}}>Campus</span><span style={{color:"#2E8B3A"}}>Byte</span>
            </div>
            <p className="popup-sub">Admin login — enter your registered details</p>
            {loginErr && <div className="popup-err">{loginErr}</div>}
            <div className="popup-field">
              <label>Phone Number</label>
              <input type="tel" placeholder="Enter registered phone number" value={loginPhone}
                onChange={e => { setLoginPhone(e.target.value.replace(/\D/g,"").slice(0,10)); setLoginErr(""); }}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
            </div>
            <div className="popup-field">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={loginPass}
                onChange={e => { setLoginPass(e.target.value); setLoginErr(""); }}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
            </div>
            <button className="popup-btn" onClick={handleAdminLogin} disabled={loginLoading}>
              {loginLoading ? <><span className="popup-spinner" />Logging in...</> : "Login"}
            </button>
            <div className="popup-divider">
              <div className="popup-divider-line" />
              <span className="popup-divider-text">New restaurant?</span>
              <div className="popup-divider-line" />
            </div>
            <button className="popup-register-link" onClick={() => { setShowLogin(false); onNavigate?.("admin-register"); }}>
              Register your restaurant
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirm Popup */}
      {showLogoutConfirm && (
        <div className="login-overlay" onClick={e => e.target === e.currentTarget && setShowLogoutConfirm(false)}>
          <div className="logout-confirm-popup">
            <button className="popup-close" onClick={() => setShowLogoutConfirm(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>🔐</div>
            <div style={{fontSize:"18px",fontWeight:800,color:"#1a1a1a",marginBottom:"8px"}}>Logout?</div>
            <div style={{fontSize:"13px",color:"#999",marginBottom:"26px"}}>
              You'll be logged out from <strong style={{color:"#C94D1E"}}>{restaurantName}</strong>. You can log back in anytime.
            </div>
            <button className="btn-logout-confirm" onClick={() => { setShowLogoutConfirm(false); onAdminLogout?.(); }}>
              Yes, Logout
            </button>
            <button className="btn-logout-cancel" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}  
    </>
  );
}