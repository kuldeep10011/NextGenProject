import { useState, useRef } from "react";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminRegisterPage({ onNavigate, onRegisterSuccess, canGoBack, canGoForward, onGoBack, onGoForward }) {
  const [form, setForm] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]   = useState({});
  const [shake, setShake]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [fireErr, setFireErr] = useState("");

  const handle = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setFireErr("");
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.restaurantName.trim()) e.restaurantName = "Restaurant name is required";
    if (!form.ownerName.trim())      e.ownerName      = "Owner name is required";
    if (!form.email.trim())          e.email          = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())          e.phone          = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit number";
    if (!form.password)              e.password       = "Password is required";
    else if (form.password.length < 6) e.password     = "Minimum 6 characters";
    return e;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async () => {
    setFireErr("");
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); triggerShake(); return; }

    setLoading(true);
    try {
      // Check if email already registered
      const existing = await getDocs(
        query(collection(db, "Restaurant Registration"), where("Email", "==", form.email.trim()))
      );
      if (!existing.empty) {
        setFireErr("This email is already registered. Please login instead.");
        triggerShake(); setLoading(false); return;
      }

      // Use restaurant name as document ID
      const restaurantDocId = form.restaurantName.trim();
      const restaurantRef = doc(db, "Restaurant Registration", restaurantDocId);

      // Check if restaurant name already taken
      const nameSnap = await getDocs(query(collection(db, "Restaurant Registration"), where("Name of the Restaurant", "==", restaurantDocId)));
      if (!nameSnap.empty) {
        setFireErr("A restaurant with this name already exists. Please use a different name.");
        triggerShake(); setLoading(false); return;
      }

      // Set document with restaurant name as ID
      await setDoc(restaurantRef, {
        "Name of the Restaurant": restaurantDocId,
        "Owner Name":             form.ownerName.trim(),
        "Email":                  form.email.trim(),
        "Phone Number":           form.phone.trim(),
        "Password":               form.password,
        "Created At":             new Date().toISOString(),
      });

      setLoading(false);
      // Pass doc ID + restaurant name up so ManagePage can use it
      if (onRegisterSuccess) onRegisterSuccess({
        restaurantName: restaurantDocId,
        docId: restaurantDocId,
        ownerName: form.ownerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

    } catch (err) {
      console.error("Firebase error:", err);
      setFireErr("Something went wrong. Check your connection and try again.");
      triggerShake(); setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#f5f5f5; color:#1a1a1a; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
        @keyframes shake  { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-8px);} 40%{transform:translateX(8px);} 60%{transform:translateX(-6px);} 80%{transform:translateX(6px);} }
        @keyframes spin   { to{transform:rotate(360deg);} }

        .page { min-height:100vh; background:#f5f5f5; display:flex; flex-direction:column; align-items:center; padding:56px 24px 60px; }

        .page-title { font-size:36px; font-weight:800; color:#2E3B1E; text-align:center; margin-bottom:10px; animation:fadeUp 0.6s ease both; }
        .page-sub   { font-size:17px; color:#555; text-align:center; margin-bottom:40px; animation:fadeUp 0.6s ease 0.1s both; }

        .card {
          background:#fff; border-radius:16px; box-shadow:0 2px 24px rgba(0,0,0,0.08);
          display:grid; grid-template-columns:380px 1fr;
          width:100%; max-width:980px; overflow:hidden;
          animation:fadeUp 0.7s ease 0.15s both;
        }
        .card.shake { animation:shake 0.45s ease both; }

        .card-img { width:100%; height:100%; object-fit:cover; display:block; min-height:500px; }

        .form-side { padding:40px 44px 36px; display:flex; flex-direction:column; }

        .fields-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px 28px; margin-bottom:20px; }

        .field { display:flex; flex-direction:column; gap:7px; }
        .field label { font-size:14px; font-weight:600; color:#1a1a1a; }
        .field input {
          padding:12px 14px; border-radius:8px; border:1.5px solid #e0e0e0;
          background:#fafafa; font-size:15px; color:#1a1a1a; font-family:inherit;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .field input::placeholder { color:#b0b0b0; }
        .field input:focus { border-color:#C94D1E; box-shadow:0 0 0 3px rgba(201,77,30,0.12); background:#fff; }
        .field input.err { border-color:#e53e3e; }
        .err-msg { font-size:11.5px; color:#e53e3e; margin-top:3px; padding-left:2px; }

        /* Password full-width */
        .password-wrap { grid-column:1 / -1; display:flex; flex-direction:column; gap:7px; }
        .pw-input-wrap { position:relative; }
        .pw-input-wrap input {
          width:100%; padding:12px 44px 12px 14px; border-radius:8px;
          border:1.5px solid #e0e0e0; background:#fafafa;
          font-size:15px; font-family:inherit; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .pw-input-wrap input:focus { border-color:#C94D1E; box-shadow:0 0 0 3px rgba(201,77,30,0.12); background:#fff; }
        .pw-input-wrap input.err { border-color:#e53e3e; }
        .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:4px; color:#888; transition:color 0.2s; }
        .eye-btn:hover { color:#C94D1E; }

        /* Firebase error */
        .fire-err { grid-column:1/-1; padding:12px 16px; background:#FFF3EE; border:1.5px solid #F4C4A8; border-radius:8px; font-size:13px; color:#C94D1E; font-weight:600; margin-bottom:4px; }

        /* Register button */
        .btn-register {
          width:100%; padding:17px; background:#C94D1E; color:#fff;
          font-size:17px; font-weight:700; font-family:inherit;
          border:none; border-radius:10px; cursor:pointer;
          margin-top:24px; margin-bottom:14px; letter-spacing:0.4px;
          transition:background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow:0 4px 18px rgba(201,77,30,0.25);
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .btn-register:hover:not(:disabled) { background:#A83C14; transform:translateY(-2px); box-shadow:0 8px 28px rgba(201,77,30,0.34); }
        .btn-register:disabled { opacity:0.75; cursor:not-allowed; }

        .spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }

        .terms { font-size:13px; color:#666; text-align:center; }
        .terms a { color:#2E8B3A; text-decoration:none; }
        .terms a:hover { text-decoration:underline; }

        @media(max-width:820px) {
          .card { grid-template-columns:1fr; }
          .card-img { display:none; }
          .form-side { padding:28px 22px; }
          .fields-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="page">
        <div style={{display:"flex",gap:"6px",marginBottom:"16px",alignSelf:"flex-start"}}>
          <button onClick={onGoBack} disabled={!canGoBack} title="Go Back" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoBack?"pointer":"default",opacity:canGoBack?1:0.35}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button onClick={onGoForward} disabled={!canGoForward} title="Go Forward" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoForward?"pointer":"default",opacity:canGoForward?1:0.35}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
        <h1 className="page-title">Register Your Restaurant</h1>
        <p className="page-sub">Sign up your LPU Food Court restaurant for free.</p>

        <div className={`card${shake ? " shake" : ""}`}>
          <img className="card-img"
            src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=85"
            alt="Food" />

          <div className="form-side">
            <div className="fields-grid">

              {/* Firebase error */}
              {fireErr && <div className="fire-err">⚠ {fireErr}</div>}

              {/* Restaurant Name */}
              <div className="field">
                <label>Restaurant Name</label>
                <input type="text" placeholder="Lovely Cafeteria"
                  value={form.restaurantName} onChange={handle("restaurantName")}
                  className={errors.restaurantName ? "err" : ""} />
                {errors.restaurantName && <span className="err-msg">⚠ {errors.restaurantName}</span>}
              </div>

              {/* Owner Name */}
              <div className="field">
                <label>Owner Name</label>
                <input type="text" placeholder="Owner Name"
                  value={form.ownerName} onChange={handle("ownerName")}
                  className={errors.ownerName ? "err" : ""} />
                {errors.ownerName && <span className="err-msg">⚠ {errors.ownerName}</span>}
              </div>

              {/* Email */}
              <div className="field">
                <label>Email Address</label>
                <input type="email" placeholder="Email Address"
                  value={form.email} onChange={handle("email")}
                  className={errors.email ? "err" : ""} />
                {errors.email && <span className="err-msg">⚠ {errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="field">
                <label>Phone Number</label>
                <input type="tel" placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm(p => ({ ...p, phone: v }));
                    if (errors.phone) setErrors(p => ({ ...p, phone: null }));
                    setFireErr("");
                  }}
                  className={errors.phone ? "err" : ""} />
                {errors.phone && <span className="err-msg">⚠ {errors.phone}</span>}
              </div>

              {/* Password — full width */}
              <div className="password-wrap">
                <label style={{ fontSize:"14px", fontWeight:"600" }}>Password</label>
                <div className="pw-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password} onChange={handle("password")}
                    className={errors.password ? "err" : ""} />
                  <button className="eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="err-msg">⚠ {errors.password}</span>}
              </div>
            </div>

            <button className="btn-register" onClick={handleSubmit} disabled={loading}>
              {loading ? <><div className="spinner" /> Registering...</> : "Register"}
            </button>

            <p className="terms">
              By registering, you agree to our{" "}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
