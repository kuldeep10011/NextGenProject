import { useState, useEffect } from "react";

export default function HomePage({ isLoggedIn = false, onLoginClick, onNavigate, userName = "K" }) {
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #fff;
          color: #1a1a1a;
        }

        /* ── Navbar ── */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px; background: #fff;
          box-shadow: 0 1px 0 #eee;
          transition: box-shadow 0.3s ease;
        }
        .navbar.scrolled { box-shadow: 0 1px 12px rgba(0,0,0,0.08); }

        .logo {
          font-size: 24px; font-weight: 800; letter-spacing: -0.5px;
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
          position: relative; transition: color 0.2s ease;
        }
        .nav-btn::after {
          content: ''; position: absolute; bottom: 4px; left: 18px; right: 18px;
          height: 2px; border-radius: 1px; background: #C94D1E;
          transform: scaleX(0);
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
          transform-origin: left;
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
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .btn-login:hover { background: #A83C14; transform: translateY(-1px); }
        .btn-login:active { transform: translateY(0); }

        @keyframes avatarPop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .user-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: #888; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; cursor: pointer;
          border: 2px solid #888; flex-shrink: 0;
          animation: avatarPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
          transition: background 0.2s, transform 0.15s;
        }
        .user-avatar:hover { background: #555; transform: scale(1.06); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; padding-top: 64px; overflow: hidden;
        }

        .hero-image-col { position: relative; height: 100vh; overflow: hidden; }
        .hero-image-col img {
          width: 100%; height: 100%; object-fit: cover; object-position: center;
          opacity: 0; transform: scale(1.04);
          transition: opacity 0.9s ease, transform 1.1s cubic-bezier(0.22,1,0.36,1);
        }
        .hero-image-col img.visible { opacity: 1; transform: scale(1); }

        .hero-text-col {
          padding: 0 64px 0 56px;
          display: flex; flex-direction: column;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FFF3EE; border: 1px solid #F4C4A8;
          color: #C94D1E; font-size: 12px; font-weight: 600;
          padding: 5px 14px; border-radius: 20px; letter-spacing: 0.4px;
          margin-bottom: 20px; width: fit-content;
          opacity: 0; transform: translateY(12px);
          transition: opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s;
        }
        .badge.visible { opacity: 1; transform: translateY(0); }
        .badge-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #C94D1E;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }

        .hero-heading {
          font-size: 42px; font-weight: 800; line-height: 1.15;
          color: #C94D1E; margin-bottom: 14px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.65s ease 0.3s, transform 0.65s ease 0.3s;
        }
        .hero-heading.visible { opacity: 1; transform: translateY(0); }

        .hero-sub {
          font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 40px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.65s ease 0.42s, transform 0.65s ease 0.42s;
        }
        .hero-sub.visible { opacity: 1; transform: translateY(0); }

        .divider {
          width: 52px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, #C94D1E, #F5A623);
          margin-bottom: 32px;
          opacity: 0; transition: opacity 0.5s ease 0.48s;
        }
        .divider.visible { opacity: 1; }

        .offer-block {
          margin-bottom: 12px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.65s ease 0.52s, transform 0.65s ease 0.52s;
        }
        .offer-block.visible { opacity: 1; transform: translateY(0); }
        .offer-title {
          font-size: 30px; font-weight: 800; color: #2E8B3A;
          text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .offer-desc { font-size: 17px; font-style: italic; color: #333; }

        .cta-wrap {
          margin-top: 32px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.65s ease 0.62s, transform 0.65s ease 0.62s;
        }
        .cta-wrap.visible { opacity: 1; transform: translateY(0); }

        .btn-order {
          display: inline-block; background: #C94D1E; color: #fff;
          font-size: 16px; font-weight: 700; padding: 14px 40px;
          border-radius: 8px; letter-spacing: 0.3px;
          border: none; cursor: pointer; font-family: inherit;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 16px rgba(201,77,30,0.25);
        }
        .btn-order:hover {
          background: #A83C14; transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,77,30,0.32);
        }
        .btn-order:active { transform: translateY(0); }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; }
          .hero-image-col { height: 45vh; }
          .hero-text-col { padding: 40px 32px; }
          .hero-heading { font-size: 30px; }
          .offer-title { font-size: 22px; }
          .navbar { padding: 0 24px; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>

        <span className="logo" onClick={() => onNavigate?.("home")}>
          <span className="logo-campus">Campus</span>
          <span className="logo-byte">Byte</span>
        </span>

        <ul className="nav-links">
          <li>
            <button className="nav-btn active">
              Home
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => onNavigate?.("foodcourt")}>
              Food Court
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => onNavigate?.("orders")}>
              Your Order
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => onNavigate?.("contact")}>
              Contact Us
            </button>
          </li>
        </ul>

        {isLoggedIn ? (
          <div className="user-avatar" title="My Account">{userName}</div>
        ) : (
          <button className="btn-login" onClick={onLoginClick}>LOGIN</button>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="hero">

        <div className="hero-image-col">
          <img
            src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900&q=80"
            alt="Delicious Indian food"
            className={heroVisible ? "visible" : ""}
          />
        </div>

        <div className="hero-text-col">

          <div className={`badge${heroVisible ? " visible" : ""}`}>
            <span className="badge-dot" />
            Now Live at LPU Food Court
          </div>

          <h1 className={`hero-heading${heroVisible ? " visible" : ""}`}>
            A Pre Food Ordering Website for LPU!!
          </h1>

          <p className={`hero-sub${heroVisible ? " visible" : ""}`}>
            Skip the Queue, Hassle free order from Hostel or Classrooms!!
          </p>

          <div className={`divider${heroVisible ? " visible" : ""}`} />

          <div className={`offer-block${heroVisible ? " visible" : ""}`}>
            <p className="offer-title">Order Your First Meal</p>
            <p className="offer-desc">And Get 30% Discount</p>
          </div>

          <div className={`cta-wrap${heroVisible ? " visible" : ""}`}>
            <button
              className="btn-order"
              onClick={() => onNavigate?.("foodcourt")}
            >
              Order Now
            </button>
          </div>

        </div>
      </section>
    </>
  );
}
