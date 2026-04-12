import { useState, useEffect, useRef } from "react";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80";

export default function AdminManagePage({ onNavigate, restaurantName = "" }) {
  const [scrolled, setScrolled]   = useState(false);
  const [outlets, setOutlets]     = useState([]);   // ← starts EMPTY
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: "", location: "", logo: null });
  const [logoName, setLogoName]   = useState("");
  const [formErr, setFormErr]     = useState({});
  const [removing, setRemoving]   = useState(null);
  const fileRef                   = useRef();
  const nextId                    = useRef(1);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const openModal = () => {
    setForm({ name: restaurantName ? restaurantName + " " : "", location: "", logo: null });
    setLogoName(""); setFormErr({});
    setShowModal(true);
  };

  const handleAdd = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Outlet name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (Object.keys(e).length) { setFormErr(e); return; }

    const newOutlet = {
      id: nextId.current++,
      name: form.name.trim(),
      location: form.location.trim(),
      university: "Lovely Professional University",
      image: form.logo ? URL.createObjectURL(form.logo) : DEFAULT_IMAGE,
      isOpen: true,
    };
    setOutlets(p => [...p, newOutlet]);
    setShowModal(false);
  };

  const toggleOpen = (id) =>
    setOutlets(p => p.map(o => o.id === id ? { ...o, isOpen: !o.isOpen } : o));

  const removeOutlet = (id) => {
    setRemoving(id);
    setTimeout(() => { setOutlets(p => p.filter(o => o.id !== id)); setRemoving(null); }, 350);
  };

  const handleLogoFile = (e) => {
    const f = e.target.files[0];
    if (f) { setForm(p => ({ ...p, logo: f })); setLogoName(f.name); }
  };

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#f5f5f5; color:#1a1a1a; }

        .navbar {
          position:sticky; top:0; z-index:200;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 48px; height:68px; background:#fff;
          box-shadow:0 1px 0 #e5e5e5; transition:box-shadow 0.3s;
        }
        .navbar.scrolled { box-shadow:0 2px 16px rgba(0,0,0,0.09); }

        .logo { font-size:24px; font-weight:800; letter-spacing:-0.5px; cursor:pointer; user-select:none; }
        .logo-campus { color:#C94D1E; }
        .logo-byte   { color:#2E8B3A; }

        .nav-links { display:flex; align-items:center; gap:4px; list-style:none; }
        .nav-btn {
          display:block; padding:8px 20px; font-size:15px; font-weight:500; color:#1a1a1a;
          background:none; border:none; cursor:pointer; font-family:inherit; border-radius:6px;
          position:relative; transition:color 0.2s;
        }
        .nav-btn::after {
          content:''; position:absolute; bottom:4px; left:20px; right:20px;
          height:2.5px; border-radius:2px; background:#C94D1E;
          transform:scaleX(0); transition:transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin:left;
        }
        .nav-btn:hover { color:#C94D1E; }
        .nav-btn:hover::after { transform:scaleX(1); }
        .nav-btn.active { color:#C94D1E; }
        .nav-btn.active::after { transform:scaleX(1); }

        @keyframes chipPop { from{transform:scale(0.7);opacity:0;} to{transform:scale(1);opacity:1;} }
        .rest-chip {
          display:flex; align-items:center; gap:10px;
          background:#FFF3EE; border:1.5px solid #F4C4A8; border-radius:24px;
          padding:8px 18px 8px 10px;
          animation:chipPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .rest-chip-icon {
          width:32px; height:32px; border-radius:50%; background:#C94D1E;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .rest-chip-name { font-size:14px; font-weight:700; color:#C94D1E; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .btn-login {
          background:#C94D1E; color:#fff; padding:11px 32px; border-radius:8px;
          font-weight:700; font-size:15px; letter-spacing:0.5px; text-transform:uppercase;
          border:none; cursor:pointer; font-family:inherit;
          transition:background 0.2s, transform 0.15s;
        }
        .btn-login:hover { background:#A83C14; transform:translateY(-1px); }

        /* Page */
        .page-wrap { max-width:1280px; margin:0 auto; padding:40px 40px 80px; }

        .page-header {
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:32px; gap:16px;
        }
        .page-title { font-size:30px; font-weight:800; color:#1a1a1a; margin-bottom:6px; }
        .page-sub   { font-size:15px; color:#666; }

        .btn-add-outlet {
          display:flex; align-items:center; gap:8px;
          background:#C94D1E; color:#fff; padding:14px 28px; border-radius:9px;
          font-size:16px; font-weight:700; font-family:inherit;
          border:none; cursor:pointer; white-space:nowrap; flex-shrink:0;
          transition:background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow:0 4px 14px rgba(201,77,30,0.25);
        }
        .btn-add-outlet:hover { background:#A83C14; transform:translateY(-2px); box-shadow:0 8px 24px rgba(201,77,30,0.32); }
        .btn-add-outlet:active { transform:translateY(0); }

        .header-divider { height:1px; background:#e0e0e0; margin-bottom:32px; }

        /* Empty state */
        .empty-state {
          text-align:center; padding:80px 24px;
          display:flex; flex-direction:column; align-items:center; gap:16px;
        }
        .empty-icon { font-size:56px; }
        .empty-title { font-size:20px; font-weight:700; color:#444; }
        .empty-sub   { font-size:15px; color:#999; }
        .btn-empty-add {
          margin-top:8px; background:#C94D1E; color:#fff;
          padding:13px 32px; border-radius:9px; font-size:15px; font-weight:700;
          font-family:inherit; border:none; cursor:pointer;
          transition:background 0.2s, transform 0.15s;
          box-shadow:0 4px 14px rgba(201,77,30,0.22);
        }
        .btn-empty-add:hover { background:#A83C14; transform:translateY(-1px); }

        /* Grid */
        .outlets-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:28px; }

        /* Card */
        @keyframes cardIn  { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes cardOut { from{opacity:1;transform:scale(1);}          to{opacity:0;transform:scale(0.92);} }

        .outlet-card {
          background:#fff; border-radius:14px; border:1px solid #e8e8e8;
          overflow:hidden; animation:cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
          transition:box-shadow 0.2s;
        }
        .outlet-card:hover { box-shadow:0 6px 28px rgba(0,0,0,0.10); }
        .outlet-card.removing { animation:cardOut 0.35s ease forwards; }

        .card-img-wrap { width:100%; height:220px; overflow:hidden; }
        .card-img-wrap img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .outlet-card:hover .card-img-wrap img { transform:scale(1.04); }

        .card-body { padding:20px 22px 0; }
        .card-name  { font-size:20px; font-weight:800; color:#1a1a1a; margin-bottom:8px; }

        .status-row { display:flex; align-items:center; gap:7px; margin-bottom:16px; }
        .status-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; transition:background 0.3s; }
        .status-dot.open   { background:#2E8B3A; }
        .status-dot.closed { background:#ccc; }
        .status-text { font-size:14px; font-weight:600; color:#1a1a1a; }

        .location-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 0; border-top:1px solid #f0f0f0;
        }
        .location-text { font-size:14px; color:#444; line-height:1.5; }

        /* Toggle */
        .toggle-track {
          position:relative; width:68px; height:32px; border-radius:16px; cursor:pointer;
          display:flex; align-items:center; transition:background 0.3s; flex-shrink:0;
        }
        .toggle-track.on  { background:#2E8B3A; }
        .toggle-track.off { background:#ccc; }
        .toggle-label {
          position:absolute; left:10px;
          font-size:12px; font-weight:700; color:#fff;
          pointer-events:none; user-select:none; transition:opacity 0.2s;
        }
        .toggle-label.hide { opacity:0; }
        .toggle-thumb {
          position:absolute; right:4px; width:24px; height:24px; border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:right 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .toggle-track.off .toggle-thumb { right:40px; }

        .card-actions { display:grid; grid-template-columns:1fr 1fr; border-top:1px solid #f0f0f0; }
        .btn-edit, .btn-remove {
          padding:14px; font-size:15px; font-weight:700; font-family:inherit;
          border:none; cursor:pointer; transition:background 0.2s, transform 0.12s;
        }
        .btn-edit   { background:#2E8B3A; color:#fff; border-bottom-left-radius:14px; }
        .btn-edit:hover   { background:#236B2C; }
        .btn-remove { background:#C94D1E; color:#fff; border-bottom-right-radius:14px; }
        .btn-remove:hover { background:#A83C14; }
        .btn-edit:active, .btn-remove:active { transform:scale(0.98); }

        /* Modal */
        @keyframes overlayIn { from{opacity:0;} to{opacity:1;} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.92) translateY(20px);} to{opacity:1;transform:scale(1) translateY(0);} }

        .modal-overlay {
          position:fixed; inset:0; z-index:500; background:rgba(0,0,0,0.45);
          display:flex; align-items:center; justify-content:center; padding:24px;
          animation:overlayIn 0.2s ease both;
        }
        .modal {
          background:#fff; border-radius:16px; padding:36px 40px 32px;
          width:100%; max-width:480px; box-shadow:0 16px 56px rgba(0,0,0,0.18);
          animation:modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both; position:relative;
        }
        .modal-title { font-size:22px; font-weight:800; color:#1a1a1a; margin-bottom:6px; }
        .modal-sub   { font-size:14px; color:#666; margin-bottom:28px; }
        .modal-close {
          position:absolute; top:18px; right:18px; background:none; border:none;
          cursor:pointer; font-size:22px; color:#888; transition:color 0.2s, transform 0.15s;
        }
        .modal-close:hover { color:#C94D1E; transform:scale(1.15); }

        .m-field { display:flex; flex-direction:column; gap:7px; margin-bottom:18px; }
        .m-field label { font-size:13px; font-weight:700; color:#1a1a1a; }
        .m-field input {
          padding:12px 14px; border-radius:8px; border:1.5px solid #e0e0e0;
          background:#fafafa; font-size:15px; font-family:inherit; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .m-field input:focus { border-color:#C94D1E; box-shadow:0 0 0 3px rgba(201,77,30,0.12); background:#fff; }
        .m-field input.err  { border-color:#e53e3e; }
        .m-err { font-size:11.5px; color:#e53e3e; margin-top:3px; }

        .logo-row { display:flex; align-items:stretch; border-radius:8px; border:1.5px solid #e0e0e0; overflow:hidden; background:#fafafa; }
        .logo-fake-input { flex:1; padding:12px 14px; font-size:14px; color:#b0b0b0; font-family:inherit; background:transparent; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .logo-fake-input.filled { color:#1a1a1a; }
        .btn-upload { background:#C94D1E; color:#fff; font-size:13px; font-weight:700; font-family:inherit; padding:0 20px; border:none; cursor:pointer; white-space:nowrap; transition:background 0.2s; }
        .btn-upload:hover { background:#A83C14; }

        .btn-modal-add {
          width:100%; padding:15px; margin-top:8px;
          background:#C94D1E; color:#fff; font-size:16px; font-weight:700;
          font-family:inherit; border:none; border-radius:9px; cursor:pointer;
          transition:background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow:0 4px 14px rgba(201,77,30,0.25);
        }
        .btn-modal-add:hover { background:#A83C14; transform:translateY(-1px); box-shadow:0 8px 22px rgba(201,77,30,0.32); }
        .btn-modal-add:active { transform:translateY(0); }

        @media(max-width:860px) {
          .outlets-grid { grid-template-columns:1fr; }
          .navbar, .page-wrap { padding-left:20px; padding-right:20px; }
          .page-title { font-size:22px; }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => onNavigate?.("admin-home")}>
          <span className="logo-campus">Campus</span><span className="logo-byte">Byte</span>
        </span>
        <ul className="nav-links">
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-home")}>Home</button></li>
          <li><button className="nav-btn active">Manage</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-orders")}>Orders</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-contact")}>Contact Us</button></li>
        </ul>
        {restaurantName ? (
          <div className="rest-chip">
            <div className="rest-chip-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="rest-chip-name">{restaurantName}</span>
          </div>
        ) : (
          <button className="btn-login" onClick={() => onNavigate?.("admin-register")}>LOGIN</button>
        )}
      </nav>

      {/* Page */}
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Outlets for {restaurantName || "Your Restaurant"}</h1>
            <p className="page-sub">Easily manage all your {restaurantName || "restaurant"} outlets.</p>
          </div>
          {outlets.length > 0 && (
            <button className="btn-add-outlet" onClick={openModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Outlet
            </button>
          )}
        </div>

        <div className="header-divider" />

        {/* Empty state */}
        {outlets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <p className="empty-title">No outlets yet</p>
            <p className="empty-sub">Click below to add your first outlet for {restaurantName || "your restaurant"}.</p>
            <button className="btn-empty-add" onClick={openModal}>
              + Add Your First Outlet
            </button>
          </div>
        ) : (
          <div className="outlets-grid">
            {outlets.map((outlet, i) => (
              <div
                key={outlet.id}
                className={`outlet-card${removing === outlet.id ? " removing" : ""}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="card-img-wrap">
                  <img src={outlet.image} alt={outlet.name} />
                </div>
                <div className="card-body">
                  <p className="card-name">{outlet.name}</p>
                  <div className="status-row">
                    <span className={`status-dot ${outlet.isOpen ? "open" : "closed"}`} />
                    <span className="status-text">{outlet.isOpen ? "Open" : "Closed"}</span>
                  </div>
                  <div className="location-row">
                    <div className="location-text">
                      <div>{outlet.location}</div>
                      <div>{outlet.university}</div>
                    </div>
                    <div
                      className={`toggle-track ${outlet.isOpen ? "on" : "off"}`}
                      onClick={() => toggleOpen(outlet.id)}
                      title={outlet.isOpen ? "Click to close" : "Click to open"}
                    >
                      <span className={`toggle-label${!outlet.isOpen ? " hide" : ""}`}>On</span>
                      <span className="toggle-thumb" />
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-edit"   onClick={() => onNavigate?.("admin-edit", outlet)}>Edit</button>
                  <button className="btn-remove" onClick={() => removeOutlet(outlet.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Outlet Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="modal-title">Add New Outlet</h2>
            <p className="modal-sub">Add a new outlet for {restaurantName || "your restaurant"}.</p>

            <div className="m-field">
              <label>Outlet Name</label>
              <input
                type="text"
                placeholder={`${restaurantName} New Outlet`}
                value={form.name}
                className={formErr.name ? "err" : ""}
                onChange={(e) => { setForm(p => ({...p, name: e.target.value})); setFormErr(p => ({...p, name: null})); }}
              />
              {formErr.name && <span className="m-err">⚠ {formErr.name}</span>}
            </div>

            <div className="m-field">
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g. Block 32 Food Court"
                value={form.location}
                className={formErr.location ? "err" : ""}
                onChange={(e) => { setForm(p => ({...p, location: e.target.value})); setFormErr(p => ({...p, location: null})); }}
              />
              {formErr.location && <span className="m-err">⚠ {formErr.location}</span>}
            </div>

            <div className="m-field">
              <label>Logo <span style={{fontWeight:400,color:"#888"}}>(optional)</span></label>
              <div className="logo-row">
                <span className={`logo-fake-input${logoName ? " filled" : ""}`}>
                  {logoName || "Choose image..."}
                </span>
                <button className="btn-upload" onClick={() => fileRef.current.click()}>Upload</button>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogoFile} />
              </div>
            </div>

            <button className="btn-modal-add" onClick={handleAdd}>Add</button>
          </div>
        </div>
      )}
    </>
  );
}
