import { useState, useEffect, useRef } from "react";


const INSTAGRAM_URL = "https://www.instagram.com/imkulldeep";
const EMAIL         = "mailto:gogoikuldeep@gmail.com";
const PHONE         = "tel:+918822892994";
const WHATSAPP_URL  = "https://wa.me/918708480086";
// ─────────────────────────────────────────────────────────

export default function ContactUsPage({ isLoggedIn = false, onLoginClick, onNavigate, userName = "K", onLogout, canGoBack, canGoForward, onGoBack, onGoForward }) {
  const [scrolled, setScrolled] = useState(false);

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

  const contacts = [
    {
      label: "Instagram",
      sub:   "Visit our Instagram Page",
      href:  INSTAGRAM_URL,
      icon: (
        /* Instagram gradient icon */
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <defs>
            <radialGradient id="ig1" cx="30%" cy="107%" r="130%">
              <stop offset="0%"  stopColor="#fdf497"/>
              <stop offset="5%"  stopColor="#fdf497"/>
              <stop offset="45%" stopColor="#fd5949"/>
              <stop offset="60%" stopColor="#d6249f"/>
              <stop offset="90%" stopColor="#285AEB"/>
            </radialGradient>
          </defs>
          <rect width="36" height="36" rx="9" fill="url(#ig1)"/>
          <circle cx="18" cy="18" r="7" stroke="#fff" strokeWidth="2.5" fill="none"/>
          <circle cx="25.5" cy="10.5" r="1.8" fill="#fff"/>
        </svg>
      ),
    },
    {
      label: "Email",
      sub:   "Mail Us! We will reply you within 24 hour",
      href:  EMAIL,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="9" fill="#fff" fillOpacity="0.15"/>
          <rect x="6" y="10" width="24" height="16" rx="3" stroke="#6ab3f5" strokeWidth="2.2" fill="none"/>
          <path d="M6 13l12 8 12-8" stroke="#6ab3f5" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Call",
      sub:   "Call our Helpline Number",
      href:  PHONE,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="9" fill="#fff" fillOpacity="0.12"/>
          <path d="M11 10h4l2 5-2.5 1.5a13 13 0 006 6L22 20l5 2v4a2 2 0 01-2 2C12 28 8 17 8 13a2 2 0 012-2z"
            stroke="#7ed87e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M22 10a6 6 0 016 6" stroke="#7ed87e" strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 13a3 3 0 013 3"  stroke="#7ed87e" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      sub:   "Drop a Hi! to our official whatsapp no.",
      href:  WHATSAPP_URL,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="9" fill="#25D366"/>
          <path d="M18 7C12.477 7 8 11.477 8 17c0 1.9.527 3.674 1.44 5.19L8 29l7-1.41A10 10 0 1018 7z"
            fill="#fff"/>
          <path d="M14 16.5c.5 1 1.5 2.5 3 3.5l1.5-1s1 .5 2.5 1l-.5 2C17 23 13 19 12.5 16l1.5-.5z"
            fill="#25D366"/>
        </svg>
      ),
    },
  ];

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
        .page-wrap {
          max-width: 700px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          display: flex; flex-direction: column; align-items: center;
        }

        /* Support emoji */
        .support-emoji {
          font-size: 64px;
          line-height: 1;
          margin-bottom: 10px;
          animation: floatEmoji 3s ease-in-out infinite;
        }
        @keyframes floatEmoji {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .any-query {
          font-size: 28px; font-weight: 800;
          color: #E8631A;
          text-align: center;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .expert-text {
          font-size: 15px; font-weight: 600;
          color: #1a1a1a;
          text-align: center;
          margin-bottom: 32px;
        }

        /* ── Contact cards ── */
        .contacts-list {
          width: 100%;
          display: flex; flex-direction: column; gap: 14px;
          margin-bottom: 36px;
        }

        .contact-card {
          display: flex; align-items: center; justify-content: space-between;
          background: #E8631A;
          border-radius: 10px;
          padding: 16px 22px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(232,99,26,0.18);
        }
        .contact-card:hover {
          background: #C94D1E;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201,77,30,0.28);
        }
        .contact-card:active { transform: translateY(0); }

        .card-left {
          display: flex; align-items: center; gap: 16px;
        }
        .card-icon { flex-shrink: 0; display: flex; align-items: center; }

        .card-text-wrap { display: flex; flex-direction: column; gap: 2px; }
        .card-label {
          font-size: 17px; font-weight: 700; color: #fff;
          line-height: 1.2;
        }
        .card-sub {
          font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.88);
          line-height: 1.3;
        }

        /* Arrow */
        .card-arrow {
          font-size: 22px; color: #fff; font-weight: 300;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .contact-card:hover .card-arrow { transform: translateX(4px); }

        /* Register line */
        .register-line {
          font-size: 15px; font-weight: 500;
          color: #1a1a1a; text-align: center;
        }
        .register-link {
          color: #E8631A; font-weight: 600;
          cursor: pointer; text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s, color 0.2s;
        }
        .register-link:hover {
          color: #C94D1E;
          border-bottom-color: #C94D1E;
        }

        @media(max-width: 600px) {
          .navbar { padding: 0 20px; }
          .any-query { font-size: 22px; }
          .card-label { font-size: 15px; }
          .card-sub   { font-size: 12px; }
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
          <li><button className="nav-btn" onClick={() => onNavigate?.("orders")}>Your Order</button></li>
          <li><button className="nav-btn active">Contact Us</button></li>
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

      {/* ── Content ── */}
      <div className="page-wrap">

        {/* Support emoji */}
        <div className="support-emoji">🤩</div>

        <h2 className="any-query">ANY QUERY??</h2>
        <p className="expert-text">Contact US ! Our Expert will available 24*7</p>

        {/* Contact cards */}
        <div className="contacts-list">
          {contacts.map((c) => (
            <a
              key={c.label}
              className="contact-card"
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
            >
              <div className="card-left">
                <div className="card-icon">{c.icon}</div>
                <div className="card-text-wrap">
                  <span className="card-label">{c.label}</span>
                  <span className="card-sub">{c.sub}</span>
                </div>
              </div>
              <span className="card-arrow">→</span>
            </a>
          ))}
        </div>

        {/* Register line */}
        <p className="register-line">
          Want to Register your Food Court with US?&nbsp;
          <span
            className="register-link"
            onClick={() => onNavigate?.("admin")}
          >
            Click Here
          </span>
        </p>

      </div>
    </>
  );
}