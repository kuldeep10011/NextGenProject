import { useState, useEffect } from "react";

export default function AdminHomePage({ onNavigate, restaurantName = "" }) {
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const isRegistered = !!restaurantName;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => { window.removeEventListener("scroll", fn); clearTimeout(t); };
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
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 68px; background: #fff;
          box-shadow: 0 1px 0 #e5e5e5; transition: box-shadow 0.3s;
        }
        .navbar.scrolled { box-shadow: 0 2px 16px rgba(0,0,0,0.09); }

        .logo {
          font-size: 26px; font-weight: 800; letter-spacing: -0.5px;
          cursor: pointer; user-select: none; text-decoration: none;
        }
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

        /* REGISTER button (shown when not registered) */
        .btn-register-nav {
          background: #C94D1E; color: #fff;
          padding: 11px 32px; border-radius: 8px;
          font-weight: 700; font-size: 15px; letter-spacing: 0.5px;
          border: none; cursor: pointer; font-family: inherit;
          text-transform: uppercase;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 3px 12px rgba(201,77,30,0.22);
        }
        .btn-register-nav:hover {
          background: #A83C14; transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(201,77,30,0.3);
        }

        /* Restaurant name chip (shown after registration) */
        @keyframes chipPop {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .rest-chip {
          display: flex; align-items: center; gap: 10px;
          background: #FFF3EE; border: 1.5px solid #F4C4A8;
          border-radius: 24px; padding: 8px 18px 8px 10px;
          animation: chipPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
          cursor: default;
        }
        .rest-chip-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: #C94D1E;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rest-chip-icon svg { width: 18px; height: 18px; }
        .rest-chip-name {
          font-size: 14px; font-weight: 700; color: #C94D1E;
          max-width: 200px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; padding-top: 68px;
          overflow: hidden; background: #fafafa;
        }

        .hero-image-col {
          height: 100vh; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 0 40px 40px; background: #fafafa;
        }
        .hero-img {
          width: 100%; max-width: 580px; height: 580px;
          object-fit: cover; border-radius: 14px;
          opacity: 0; transform: scale(1.04);
          transition: opacity 0.9s ease, transform 1.1s cubic-bezier(0.22,1,0.36,1);
        }
        .hero-img.visible { opacity: 1; transform: scale(1); }

        .hero-text-col {
          padding: 0 72px 0 64px;
          display: flex; flex-direction: column; gap: 0;
          background: #fafafa;
        }

        .badge-line {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s;
        }
        .badge-line.visible { opacity: 1; transform: translateY(0); }
        .badge-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: #C94D1E; flex-shrink: 0;
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.35);opacity:0.65;}
        }
        .badge-text { font-size: 15px; font-weight: 500; color: #1a1a1a; }

        .hero-heading {
          font-size: 46px; font-weight: 800; line-height: 1.12;
          color: #C94D1E; margin-bottom: 22px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.65s ease 0.25s, transform 0.65s ease 0.25s;
        }
        .hero-heading.visible { opacity: 1; transform: translateY(0); }

        .hero-free {
          font-size: 18px; font-weight: 400; color: #1a1a1a; margin-bottom: 16px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.65s ease 0.38s, transform 0.65s ease 0.38s;
        }
        .hero-free.visible { opacity: 1; transform: translateY(0); }
        .hero-free strong { font-weight: 800; color: #1a1a1a; }

        .hero-manage {
          font-size: 22px; font-weight: 700; color: #2E8B3A; margin-bottom: 28px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.65s ease 0.48s, transform 0.65s ease 0.48s;
        }
        .hero-manage.visible { opacity: 1; transform: translateY(0); }

        .divider {
          width: 56px; height: 3px; border-radius: 2px;
          background: #C94D1E; margin-bottom: 36px;
          opacity: 0; transition: opacity 0.5s ease 0.54s;
        }
        .divider.visible { opacity: 1; }

        /* CTA — hidden after registration */
        .cta-wrap {
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.65s ease 0.62s, transform 0.65s ease 0.62s;
        }
        .cta-wrap.visible { opacity: 1; transform: translateY(0); }

        .btn-register-hero {
          background: #C94D1E; color: #fff;
          font-size: 17px; font-weight: 700; font-family: inherit;
          padding: 16px 44px; border-radius: 9px;
          border: none; cursor: pointer; letter-spacing: 0.3px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(201,77,30,0.28);
        }
        .btn-register-hero:hover {
          background: #A83C14; transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201,77,30,0.36);
        }

        /* Registered welcome message */
        @keyframes welcomeFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .registered-msg {
          font-size: 18px; font-weight: 600; color: #2E8B3A;
          padding: 16px 24px; border-radius: 10px;
          background: #eafbee; border: 1.5px solid #a8ddb5;
          animation: welcomeFade 0.6s ease both;
        }

        @media(max-width: 960px) {
          .hero { grid-template-columns: 1fr; background: #fff; }
          .hero-image-col { height: 42vh; padding: 24px; }
          .hero-text-col { padding: 36px 28px; background: #fff; }
          .hero-heading { font-size: 32px; }
          .hero-manage { font-size: 18px; }
          .navbar { padding: 0 24px; }
        }
      `}</style>

      {/* ── Navbar ── */}
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

        {/* Show REGISTER button OR restaurant name chip */}
        {isRegistered ? (
          <div className="rest-chip" title={restaurantName}>
            <div className="rest-chip-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="rest-chip-name">{restaurantName}</span>
          </div>
        ) : (
          <button
            className="btn-register-nav"
            onClick={() => onNavigate?.("admin-register")}
          >
            REGISTER
          </button>
        )}
      </nav>

      {/* ── Hero ── */}
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

          <h1 className={`hero-heading${heroVisible ? " visible" : ""}`}>
            Welcome to CampusBytee
          </h1>

          <p className={`hero-free${heroVisible ? " visible" : ""}`}>
            Register your LPU Food Court for <strong>FREE</strong>
          </p>

          <p className={`hero-manage${heroVisible ? " visible" : ""}`}>
            Manage Your Restaurant Completely Free
          </p>

          <div className={`divider${heroVisible ? " visible" : ""}`} />

          {/* Show Register Now button OR success message */}
          <div className={`cta-wrap${heroVisible ? " visible" : ""}`}>
            {isRegistered ? (
              <div className="registered-msg">
                🎉 {restaurantName} is registered! Go to Manage to add your menu.
              </div>
            ) : (
              <button
                className="btn-register-hero"
                onClick={() => onNavigate?.("admin-register")}
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
