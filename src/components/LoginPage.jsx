import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function LoginPage({ onLogin, canGoBack, canGoForward, onGoBack, onGoForward }) {
  const [regNo, setRegNo]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [shake, setShake]       = useState(false);

  const validate = () => {
    const e = {};
    if (!regNo)                    e.regNo    = "Registration number is required";
    else if (!/^\d+$/.test(regNo)) e.regNo    = "Only numbers allowed";
    else if (regNo.length !== 8)   e.regNo    = "Must be exactly 8 digits";
    if (!password)                 e.password = "Password is required";
    else {
      if (!/[A-Z]/.test(password))                                        e.password = "Need at least one uppercase letter";
      else if (!/[a-z]/.test(password))                                   e.password = "Need at least one lowercase letter";
      else if (!/[0-9]/.test(password))                                   e.password = "Need at least one number";
      else if (!/[!@#$%^&*()_+\-=\[\]{};':"|,.<>\/?]/.test(password))   e.password = "Need at least one special character";
    }
    return e;
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); triggerShake(); return; }
    setLoading(true); setErrors({});
    try {
  
      const userRef = doc(db, "User Login", regNo.trim());
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setErrors({ regNo: "Registration number not found" });
        triggerShake(); setLoading(false); return;
      }

      const data = userSnap.data();
      const storedPass = data["Password"] ?? data["password"] ?? "";
      if (storedPass !== password) {
        setErrors({ password: "Incorrect password" });
        triggerShake(); setLoading(false); return;
      }

      setLoading(false);
      if (onLogin) onLogin({ regNo, name: data.Name || data.name || regNo, userDocId: regNo.trim() });
    } catch (err) {
      console.error("Firebase error:", err);
      setErrors({ regNo: "Connection error. Please try again." });
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f7f7f7;color:#1a1a1a;}
        @keyframes shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-8px);}40%,80%{transform:translateX(8px);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        .login-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#fff8f5 0%,#f0faf0 100%);padding:24px;}
        .login-card{background:#fff;border-radius:20px;padding:48px 44px 40px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,0,0,0.1);animation:fadeIn 0.5s cubic-bezier(0.22,1,0.36,1) both;}
        .login-card.shake{animation:shake 0.5s cubic-bezier(0.22,1,0.36,1);}
        .login-logo{font-size:26px;font-weight:800;letter-spacing:-0.5px;margin-bottom:8px;text-align:center;}
        .logo-campus{color:#C94D1E;}.logo-byte{color:#2E8B3A;}
        .login-sub{text-align:center;font-size:14px;color:#999;margin-bottom:32px;}
        .form-group{margin-bottom:20px;}
        .form-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:7px;letter-spacing:0.3px;}
        .form-input{width:100%;padding:12px 16px;font-size:15px;font-family:inherit;font-weight:500;color:#1a1a1a;background:#f7f7f7;border:1.5px solid #e0e0e0;border-radius:10px;outline:none;transition:border-color 0.2s,background 0.2s;}
        .form-input:focus{border-color:#C94D1E;background:#fff;}
        .form-input.error{border-color:#e53e3e;background:#fff8f8;}
        .error-msg{font-size:12px;color:#e53e3e;margin-top:5px;font-weight:500;}
        .btn-submit{width:100%;background:#C94D1E;color:#fff;padding:14px;border-radius:10px;font-size:15px;font-weight:700;font-family:inherit;border:none;cursor:pointer;margin-top:8px;transition:background 0.2s,transform 0.15s;letter-spacing:0.5px;}
        .btn-submit:hover:not(:disabled){background:#A83C14;transform:translateY(-1px);}
        .btn-submit:disabled{opacity:0.6;cursor:not-allowed;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;}
      `}</style>
      <div className="login-bg">
        <div style={{position:"fixed",top:"16px",left:"16px",display:"flex",gap:"6px",zIndex:100}}>
          <button onClick={onGoBack} disabled={!canGoBack} title="Go Back" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoBack?"pointer":"default",opacity:canGoBack?1:0.35,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button onClick={onGoForward} disabled={!canGoForward} title="Go Forward" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoForward?"pointer":"default",opacity:canGoForward?1:0.35,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
        <div className={`login-card${shake ? " shake" : ""}`}>
          <div className="login-logo"><span className="logo-campus">Campus</span><span className="logo-byte">Byte</span></div>
          <p className="login-sub">Sign in to your student account</p>
          <div className="form-group">
            <label className="form-label">Registration Number</label>
            <input className={`form-input${errors.regNo ? " error" : ""}`} type="text" maxLength={8} placeholder="Enter 8-digit reg no" value={regNo} onChange={e => setRegNo(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            {errors.regNo && <p className="error-msg">⚠ {errors.regNo}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className={`form-input${errors.password ? " error" : ""}`} type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            {errors.password && <p className="error-msg">⚠ {errors.password}</p>}
          </div>
          <button className="btn-submit" onClick={handleLogin} disabled={loading}>
            {loading && <span className="spinner" />}{loading ? "Verifying..." : "LOGIN"}
          </button>
        </div>
      </div>
    </>
  );
}
