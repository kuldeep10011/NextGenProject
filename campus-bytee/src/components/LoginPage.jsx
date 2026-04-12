import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  const validate = () => {
    const e = {};
    if (!regNo) e.regNo = "Registration number is required";
    else if (!/^\d+$/.test(regNo)) e.regNo = "Only numbers allowed";
    else if (regNo.length !== 8) e.regNo = "Must be exactly 8 digits";

    if (!password) e.password = "Password is required";
    else {
      if (!/[A-Z]/.test(password)) e.password = "Need at least one uppercase letter";
      else if (!/[a-z]/.test(password)) e.password = "Need at least one lowercase letter";
      else if (!/[0-9]/.test(password)) e.password = "Need at least one number";
      else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
        e.password = "Need at least one special character";
    }
    return e;
  };

  const handleLogin = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setErrors({});
    if (onLogin) onLogin();
  };

  const handleRegNo = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
    setRegNo(val);
    if (errors.regNo) setErrors(prev => ({ ...prev, regNo: null }));
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-6px); }
          80%     { transform: translateX(6px); }
        }
        @keyframes dotTrail {
          0%,100% { opacity: 0.3; transform: scale(0.6); }
          50%     { opacity: 0.9; transform: scale(1); }
        }
        @keyframes burgerBounce {
          0%,100% { transform: translateY(0) rotate(-6deg); }
          50%     { transform: translateY(-5px) rotate(-6deg); }
        }

        .login-root {
          min-height: 100vh;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          padding: 40px 20px;
        }

        .login-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 520px;
          animation: fadeIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Logo */
        .logo-wrap {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 32px;
        }
        .burger-wrap {
          position: relative; width: 110px; height: 80px;
        }
        .speed-line {
          position: absolute; height: 4px; border-radius: 2px;
          background: #E8631A;
        }
        .sl1{width:38px;top:42%;left:8px; animation:dotTrail 1.8s ease-in-out 0s infinite;}
        .sl2{width:28px;top:33%;left:10px;animation:dotTrail 1.8s ease-in-out 0.3s infinite;}
        .sl3{width:20px;top:54%;left:12px;animation:dotTrail 1.8s ease-in-out 0.5s infinite;}
        .sl4{width:14px;top:24%;left:18px;animation:dotTrail 1.8s ease-in-out 0.7s infinite;}
        .sl5{width:14px;top:64%;left:14px;animation:dotTrail 1.8s ease-in-out 0.2s infinite;}
        .sdot {
          position: absolute; border-radius: 50%;
          background: #E8631A;
        }
        .sd1{width:8px;height:8px;top:36%;left:0;  animation:dotTrail 1.6s ease-in-out 0.2s infinite;}
        .sd2{width:5px;height:5px;top:20%;left:8px; animation:dotTrail 1.6s ease-in-out 0.5s infinite;}
        .sd3{width:9px;height:9px;top:56%;left:3px; animation:dotTrail 1.6s ease-in-out 0.1s infinite;}
        .sd4{width:5px;height:5px;top:72%;left:10px;animation:dotTrail 1.6s ease-in-out 0.6s infinite;}
        .burger-svg {
          position:absolute; right:0; top:50%;
          transform:translateY(-50%) rotate(-6deg);
          animation: burgerBounce 2.2s ease-in-out 0.9s infinite;
        }
        .brand-campus { font-size: 40px; font-weight: 900; color: #C94D1E; text-transform: uppercase; letter-spacing: -1px; }
        .brand-bytee  { font-size: 40px; font-weight: 900; color: #2E8B3A; text-transform: uppercase; letter-spacing: -1px; }

        /* Heading */
        .login-heading {
          font-size: 22px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #000;
          text-align: center;
          margin-bottom: 32px;
        }

        /* Form */
        .form-group {
          width: 100%;
          margin-bottom: 24px;
        }
        .inp {
          width: 100%;
          padding: 16px 20px;
          font-size: 18px;
          color: #fff;
          background: #E8631A;
          border: none;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .inp::placeholder { color: rgba(255,255,255,0.85); }
        .inp:focus {
          background: #C94D1E;
          box-shadow: 0 0 0 3px rgba(201,77,30,0.25);
        }
        .inp.error-inp {
          background: #b84010;
          box-shadow: 0 0 0 3px rgba(184,64,16,0.3);
        }
        .err-msg {
          margin-top: 7px;
          font-size: 12px;
          color: #b84010;
          font-weight: 600;
          padding-left: 4px;
        }

        /* Shake */
        .shake { animation: shake 0.45s ease both; }

        /* Login Button */
        .btn-login {
          background: #2E8B3A;
          color: #000;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 14px 56px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          font-family: inherit;
          box-shadow: 0 4px 16px rgba(46,139,58,0.22);
        }
        .btn-login:hover {
          background: #236B2C;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(46,139,58,0.32);
        }
        .btn-login:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(46,139,58,0.18);
        }
      `}</style>

      <div className="login-root">
        <div className={`login-card ${shake ? "shake" : ""}`}>

          {/* Logo */}
          <div className="logo-wrap">
            <div className="burger-wrap">
              <div className="speed-line sl1" />
              <div className="speed-line sl2" />
              <div className="speed-line sl3" />
              <div className="speed-line sl4" />
              <div className="speed-line sl5" />
              <div className="sdot sd1" />
              <div className="sdot sd2" />
              <div className="sdot sd3" />
              <div className="sdot sd4" />
              <svg className="burger-svg" width="74" height="74" viewBox="0 0 72 72" fill="none">
                <ellipse cx="36" cy="22" rx="24" ry="13" fill="#F5A623"/>
                <ellipse cx="29" cy="17" rx="3" ry="1.5" fill="#C94D1E" opacity="0.65"/>
                <ellipse cx="40" cy="15" rx="2.5" ry="1.2" fill="#C94D1E" opacity="0.65"/>
                <ellipse cx="36" cy="20" rx="2" ry="1" fill="#C94D1E" opacity="0.55"/>
                <rect x="13" y="33" width="46" height="8" rx="3" fill="#C94D1E"/>
                <path d="M13 33 Q20 28 27 33 Q34 28 41 33 Q48 28 59 33" stroke="#2E8B3A" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <rect x="12" y="38" width="48" height="5" rx="2" fill="#F5C842" opacity="0.9"/>
                <ellipse cx="36" cy="49" rx="24" ry="9" fill="#F5A623"/>
              </svg>
            </div>
            <div>
              <span className="brand-campus">Campus </span>
              <span className="brand-bytee">Bytee</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="login-heading">Login for order your first meal</h2>

          {/* Reg No */}
          <div className="form-group">
            <input
              className={`inp${errors.regNo ? " error-inp" : ""}`}
              type="text"
              inputMode="numeric"
              placeholder="Enter your Reg. No"
              value={regNo}
              onChange={handleRegNo}
              maxLength={8}
            />
            {errors.regNo && <div className="err-msg">⚠ {errors.regNo}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <input
              className={`inp${errors.password ? " error-inp" : ""}`}
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={handlePassword}
            />
            {errors.password && <div className="err-msg">⚠ {errors.password}</div>}
          </div>

          {/* Login Button */}
          <button className="btn-login" onClick={handleLogin}>
            LOGIN
          </button>

        </div>
      </div>
    </>
  );
}
