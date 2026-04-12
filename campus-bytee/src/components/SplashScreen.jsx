import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState("enter"); // enter | idle | exit

  useEffect(() => {
    // After 4.5s start exit animation, then call onFinish at 5s
    const exitTimer = setTimeout(() => setPhase("exit"), 4500);
    const doneTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 5000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  useEffect(() => {
    if (phase === "enter") {
      const t = setTimeout(() => setPhase("idle"), 900);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px) scale(0.85); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes taglineFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.18; }
          50%       { transform: scale(1.12) rotate(6deg); opacity: 0.26; }
        }
        @keyframes blobPulse2 {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.14; }
          50%       { transform: scale(1.08) rotate(-8deg); opacity: 0.22; }
        }
        @keyframes dotTrail {
          0%   { opacity: 0.3; transform: scale(0.6); }
          50%  { opacity: 0.9; transform: scale(1); }
          100% { opacity: 0.3; transform: scale(0.6); }
        }
        @keyframes burgerBounce {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50%       { transform: translateY(-6px) rotate(-6deg); }
        }
        @keyframes exitFade {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.96); }
        }
        .splash-root {
          position: fixed; inset: 0;
          background: #E8A882;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          transition: opacity 0.5s ease;
        }
        .blob1 {
          position: absolute; width: 520px; height: 520px;
          border-radius: 50%;
          background: #D4845A;
          top: -160px; left: -140px;
          animation: blobPulse 6s ease-in-out infinite;
        }
        .blob2 {
          position: absolute; width: 420px; height: 420px;
          border-radius: 50%;
          background: #C97040;
          bottom: -140px; right: -100px;
          animation: blobPulse2 8s ease-in-out infinite;
        }
        .blob3 {
          position: absolute; width: 260px; height: 260px;
          border-radius: 50%;
          background: #D4845A;
          top: 60%; left: 10%;
          animation: blobPulse 10s ease-in-out infinite;
        }
        .content {
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .logo-row {
          display: flex; align-items: center; gap: 14px;
          animation: slideInLeft 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .brand-text {
          display: flex; align-items: baseline; gap: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        .brand-campus {
          font-size: 52px; font-weight: 800; letter-spacing: -1px;
          color: #C94D1E;
          text-transform: uppercase;
        }
        .brand-bytee {
          font-size: 52px; font-weight: 800; letter-spacing: -1px;
          color: #2E8B3A;
          text-transform: uppercase;
        }
        .tagline {
          font-size: 18px; font-style: italic;
          color: #2C2C2A;
          letter-spacing: 0.3px;
          animation: taglineFade 0.9s ease 0.55s both;
        }
        .exit-anim {
          animation: exitFade 0.5s ease forwards;
        }

        /* SVG burger + trail */
        .burger-wrap {
          position: relative; width: 110px; height: 90px;
        }
        .burger-icon {
          animation: burgerBounce 2.2s ease-in-out 1s infinite;
          transform-origin: center;
        }
        .dot {
          position: absolute;
          border-radius: 50%;
          background: #E8631A;
        }
        .dot1 { width:8px;height:8px; top:38%; left:0px;   animation: dotTrail 1.6s ease-in-out 0.2s infinite; }
        .dot2 { width:6px;height:6px; top:28%; left:8px;   animation: dotTrail 1.6s ease-in-out 0.4s infinite; }
        .dot3 { width:9px;height:9px; top:52%; left:4px;   animation: dotTrail 1.6s ease-in-out 0.1s infinite; }
        .dot4 { width:5px;height:5px; top:18%; left:18px;  animation: dotTrail 1.6s ease-in-out 0.6s infinite; }
        .dot5 { width:7px;height:7px; top:65%; left:12px;  animation: dotTrail 1.6s ease-in-out 0.3s infinite; }

        /* speed lines */
        .speed-line {
          position: absolute;
          height: 4px; border-radius: 2px;
          background: #E8631A;
          left: 10px;
        }
        .sl1 { width: 36px; top: 42%; animation: dotTrail 1.8s ease-in-out 0s infinite; }
        .sl2 { width: 26px; top: 34%; animation: dotTrail 1.8s ease-in-out 0.3s infinite; }
        .sl3 { width: 20px; top: 52%; animation: dotTrail 1.8s ease-in-out 0.5s infinite; }
        .sl4 { width: 14px; top: 26%; animation: dotTrail 1.8s ease-in-out 0.7s infinite; }
        .sl5 { width: 14px; top: 60%; animation: dotTrail 1.8s ease-in-out 0.2s infinite; }

        /* loading dots */
        .loader { display: flex; gap: 8px; margin-top: 8px; animation: taglineFade 0.8s ease 1s both; }
        .ldot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #2E8B3A;
          animation: dotTrail 1.2s ease-in-out infinite;
        }
        .ldot:nth-child(2) { animation-delay: 0.2s; }
        .ldot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className={`splash-root${phase === "exit" ? " exit-anim" : ""}`}>
        {/* Decorative blobs */}
        <div className="blob1" />
        <div className="blob2" />
        <div className="blob3" />

        <div className="content">
          {/* Logo row */}
          <div className="logo-row">
            {/* Burger with speed trail */}
            <div className="burger-wrap">
              {/* Speed lines */}
              <div className="speed-line sl1" />
              <div className="speed-line sl2" />
              <div className="speed-line sl3" />
              <div className="speed-line sl4" />
              <div className="speed-line sl5" />

              {/* Corner dots */}
              <div className="dot dot1" />
              <div className="dot dot2" />
              <div className="dot dot3" />
              <div className="dot dot4" />
              <div className="dot dot5" />

              {/* Burger SVG */}
              <svg
                className="burger-icon"
                style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%) rotate(-6deg)" }}
                width="72" height="72" viewBox="0 0 72 72" fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Bun top */}
                <ellipse cx="36" cy="22" rx="24" ry="13" fill="#F5A623"/>
                {/* Sesame seeds */}
                <ellipse cx="30" cy="18" rx="3" ry="1.5" fill="#E8631A" opacity="0.7"/>
                <ellipse cx="40" cy="16" rx="2.5" ry="1.2" fill="#E8631A" opacity="0.7"/>
                <ellipse cx="36" cy="20" rx="2" ry="1" fill="#E8631A" opacity="0.6"/>
                {/* Patty */}
                <rect x="13" y="33" width="46" height="8" rx="3" fill="#C94D1E"/>
                {/* Lettuce */}
                <path d="M13 33 Q20 29 27 33 Q34 29 41 33 Q48 29 59 33" stroke="#2E8B3A" strokeWidth="4" strokeLinecap="round" fill="none"/>
                {/* Cheese */}
                <rect x="12" y="38" width="48" height="5" rx="2" fill="#F5C842" opacity="0.9"/>
                {/* Bun bottom */}
                <ellipse cx="36" cy="49" rx="24" ry="9" fill="#F5A623"/>
              </svg>
            </div>

            {/* Brand name */}
            <div className="brand-text">
              <span className="brand-campus">Campus&nbsp;</span>
              <span className="brand-bytee">Bytee</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="tagline">Skip the Queue, Choose CampusBytee</p>

          {/* Loading indicator */}
          <div className="loader">
            <div className="ldot" />
            <div className="ldot" />
            <div className="ldot" />
          </div>
        </div>
      </div>
    </>
  );
}
