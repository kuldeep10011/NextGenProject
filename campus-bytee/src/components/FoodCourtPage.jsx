import { useState, useEffect } from "react";

const restaurants = [
  { id: 1, name: "Kitchen Ette",    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&q=80" },
  { id: 2, name: "Oven Xpress",     image: "https://images.unsplash.com/photo-1571066811602-716837d681de?w=700&q=80" },
  { id: 3, name: "cafe coffee Day", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&q=80" },
  { id: 4, name: "WOW Momo",        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=700&q=80" },
  { id: 5, name: "Chai Sutta Bar",  image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80" },
  { id: 6, name: "Chicago Delights",image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&q=80" },
];

export default function FoodCourtPage({ isLoggedIn = false, onLoginClick, onNavigate, userName = "K" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#fff; color:#1a1a1a; }

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
          display:block; padding:8px 18px; font-size:15px; font-weight:500;
          color:#1a1a1a; background:none; border:none; cursor:pointer;
          font-family:inherit; border-radius:6px; position:relative; transition:color 0.2s;
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
          background:#888; color:#fff;
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:700; cursor:pointer;
          border:2px solid #888; flex-shrink:0;
          animation:avatarPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
          transition:background 0.2s, transform 0.15s;
        }
        .user-avatar:hover { background:#555; transform:scale(1.06); }

        /* Page */
        .page-wrap { max-width:1240px; margin:0 auto; padding:40px 40px 80px; }

        .section-title {
          font-size:22px; font-weight:700; color:#C94D1E; margin-bottom:32px;
        }

        /* Grid — 3 columns matching screenshot */
        .grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          row-gap:48px; column-gap:36px;
        }

        /* Card */
        .card { display:flex; flex-direction:column; align-items:center; cursor:pointer; }

        .img-wrap {
          width:100%; aspect-ratio:4/3;
          overflow:hidden; border-radius:4px;
          background:#f0f0f0; margin-bottom:14px;
        }
        .img-wrap img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 0.38s cubic-bezier(0.22,1,0.36,1);
        }
        .card:hover .img-wrap img { transform:scale(1.06); }

        .rest-name {
          font-size:18px; font-weight:700; color:#2E8B3A;
          text-align:center; transition:color 0.2s;
        }
        .card:hover .rest-name { color:#1a5e24; }

        @media(max-width:900px){
          .grid { grid-template-columns:repeat(2,1fr); }
          .navbar,.page-wrap { padding-left:20px; padding-right:20px; }
        }
        @media(max-width:560px){
          .grid { grid-template-columns:1fr; }
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
          ? <div className="user-avatar" title="My Account">{userName}</div>
          : <button className="btn-login" onClick={onLoginClick}>LOGIN</button>
        }
      </nav>

      {/* Content */}
      <div className="page-wrap">
        <h2 className="section-title">Choose Your Favourites Food Court</h2>

        <div className="grid">
          {restaurants.map(r => (
            <div className="card" key={r.id} onClick={() => onNavigate?.("menu", r)}>
              <div className="img-wrap">
                <img src={r.image} alt={r.name} loading="lazy" />
              </div>
              <p className="rest-name">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
