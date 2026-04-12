import { useState, useEffect } from "react";

// Status flow:
// "pending"    → Accept / Reject buttons  | Status: "Pending"
// "accepted"   → Update button            | Status: "Order Accepted"
// "processing" → Update button            | Status: "Processing" + live timer
// "prepared"   → Cancel button            | Status: "Order Prepared · Ready to Pickup"
// "cancelled"  → —                        | Status: "Cancelled"

const DEMO_ORDERS = [
  {
    id: 1234,
    items: [{ name: "Paneer Thali", qty: 1 }, { name: "Veg Pulao", qty: 1 }],
    customer: { name: "Aman Singh", phone: "9876300000" },
    status: "pending",
    timeLeft: 0,
    timerRunning: false,
    totalSec: 0,
  },
  {
    id: 1233,
    items: [{ name: "Chicken Biryani", qty: 1 }],
    customer: { name: "Rahul Sharma", phone: "9352100000" },
    status: "pending",
    timeLeft: 0,
    timerRunning: false,
    totalSec: 0,
  },
  {
    id: 1232,
    items: [{ name: "Mix Veg Thali", qty: 2 }],
    customer: { name: "Sneha Verma", phone: "8926000000" },
    status: "pending",
    timeLeft: 0,
    timerRunning: false,
    totalSec: 0,
  },
];

export default function AdminOrdersPage({ onNavigate, restaurantName = "Lovely Cafeteria" }) {
  const [scrolled, setScrolled]       = useState(false);
  const [orders, setOrders]           = useState(DEMO_ORDERS);
  const [tab, setTab]                 = useState("all");
  const [modal, setModal]             = useState(null);        // order being updated
  const [upStatus, setUpStatus]       = useState("processing");
  const [upMin, setUpMin]             = useState("10");
  const [removing, setRemoving]       = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Live timer tick — only for processing orders
  useEffect(() => {
    const tick = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.status !== "processing" || !o.timerRunning || o.timeLeft <= 0) return o;
        return { ...o, timeLeft: o.timeLeft - 1 };
      }));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const fmtTime = (sec) => {
    if (sec <= 0) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const pct = (o) => {
    if (!o.totalSec) return 0;
    return Math.max(0, (o.timeLeft / o.totalSec) * 100);
  };

  // ── Actions ──────────────────────────────────
  const acceptOrder = (id) =>
    setOrders(p => p.map(o => o.id === id ? { ...o, status: "accepted" } : o));

  const rejectOrder = (id) => {
    setRemoving(id);
    setTimeout(() => setOrders(p => p.filter(o => o.id !== id)), 380);
  };

  const cancelOrder = (id) => {
    setRemoving(id);
    setTimeout(() => setOrders(p => p.map(o => o.id === id ? { ...o, status: "cancelled", timerRunning: false } : o)), 380);
  };

  const openUpdateModal = (order) => {
    // Default next state
    const nextStatus = order.status === "accepted" ? "processing" : order.status === "processing" ? "prepared" : "processing";
    setUpStatus(nextStatus);
    setUpMin("10");
    setModal(order);
  };

  const saveUpdate = () => {
    setOrders(p => p.map(o => {
      if (o.id !== modal.id) return o;
      if (upStatus === "processing") {
        const secs = Math.max(1, parseInt(upMin, 10)) * 60;
        return { ...o, status: "processing", timeLeft: secs, totalSec: secs, timerRunning: true };
      }
      if (upStatus === "prepared") {
        return { ...o, status: "prepared", timerRunning: false, timeLeft: 0 };
      }
      return o;
    }));
    setModal(null);
  };

  // ── Tab counts ────────────────────────────────
  const counts = {
    all:      orders.length,
    pending:  orders.filter(o => o.status === "pending").length,
    active:   orders.filter(o => ["accepted","processing","prepared"].includes(o.status)).length,
  };

  const displayed = orders.filter(o => {
    if (tab === "pending") return o.status === "pending";
    if (tab === "active")  return ["accepted","processing","prepared"].includes(o.status);
    return true;
  });

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#f5f5f5; color:#1a1a1a; }

        /* Navbar */
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
          padding:8px 18px 8px 10px; animation:chipPop 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .rest-chip-icon { width:32px; height:32px; border-radius:50%; background:#C94D1E; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rest-chip-name { font-size:14px; font-weight:700; color:#C94D1E; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* Page */
        .page-wrap { max-width:1280px; margin:0 auto; padding:40px 40px 80px; }
        .page-title { font-size:28px; font-weight:800; color:#1a1a1a; margin-bottom:6px; }
        .page-sub   { font-size:15px; color:#666; margin-bottom:28px; }

        /* Tabs */
        .tabs { display:flex; gap:0; margin-bottom:28px; border:1.5px solid #e0e0e0; border-radius:10px; overflow:hidden; width:fit-content; background:#fff; }
        .tab-btn {
          padding:11px 32px; font-size:15px; font-weight:600; font-family:inherit;
          background:none; border:none; cursor:pointer; color:#555;
          transition:background 0.2s, color 0.2s;
          display:flex; align-items:center; gap:7px;
          border-right:1px solid #e0e0e0;
        }
        .tab-btn:last-child { border-right:none; }
        .tab-btn.active { background:#C94D1E; color:#fff; }
        .tab-btn:not(.active):hover { background:#FFF3EE; color:#C94D1E; }
        .tab-count { font-size:12px; font-weight:700; padding:2px 8px; border-radius:10px; }
        .tab-btn.active .tab-count       { background:rgba(255,255,255,0.25); color:#fff; }
        .tab-btn:not(.active) .tab-count { background:#f0f0f0; color:#666; }

        /* Table card */
        .table-card { background:#fff; border-radius:14px; border:1px solid #e8e8e8; overflow:hidden; }
        table { width:100%; border-collapse:collapse; }
        thead tr { background:#fafafa; border-bottom:2px solid #f0f0f0; }
        th { padding:14px 18px; font-size:13px; font-weight:700; color:#666; text-align:left; white-space:nowrap; }
        td { padding:16px 18px; font-size:14px; vertical-align:middle; border-bottom:1px solid #f5f5f5; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:#fafafa; }

        @keyframes rowIn  { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes rowOut { from{opacity:1;max-height:200px;padding:16px 18px;} to{opacity:0;max-height:0;padding:0 18px;} }
        tbody tr { animation:rowIn 0.3s ease both; }
        tbody tr.removing td { animation:rowOut 0.38s ease forwards; overflow:hidden; }

        .order-id   { font-size:15px; font-weight:800; color:#C94D1E; }
        .item-list  { display:flex; flex-direction:column; gap:2px; }
        .item-line  { font-size:14px; color:#1a1a1a; }
        .cust-name  { font-size:14px; font-weight:600; color:#1a1a1a; }
        .cust-phone { font-size:13px; color:#C94D1E; margin-top:2px; font-weight:500; }

        /* ── Status pills ── */
        .status-cell { min-width:200px; }

        /* Pending */
        .pill-pending {
          display:inline-flex; align-items:center; gap:8px;
          background:#FFF3EE; border:1.5px solid #F4C4A8;
          border-radius:8px; padding:9px 14px;
        }
        .pill-dot { width:8px; height:8px; border-radius:50%; background:#C94D1E; animation:dotPulse 1.4s ease-in-out infinite; flex-shrink:0; }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.5;} }
        .pill-pending-text { font-size:13px; font-weight:700; color:#C94D1E; }

        /* Accepted */
        .pill-accepted {
          display:inline-flex; align-items:center; gap:8px;
          background:#E8F5E9; border:1.5px solid #A5D6A7;
          border-radius:8px; padding:9px 14px;
        }
        .pill-accepted-dot { width:8px; height:8px; border-radius:50%; background:#2E8B3A; animation:dotPulse 1.4s ease-in-out infinite; flex-shrink:0; }
        .pill-accepted-text { font-size:13px; font-weight:700; color:#2E8B3A; }

        /* Processing */
        .pill-processing {
          background:#FFF8E1; border:1.5px solid #FFD54F;
          border-radius:8px; padding:9px 14px;
          display:flex; flex-direction:column; gap:7px;
        }
        .pill-proc-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .pill-proc-label { font-size:13px; font-weight:700; color:#E65100; }
        .pill-proc-timer { font-size:16px; font-weight:800; color:#E65100; font-variant-numeric:tabular-nums; letter-spacing:1px; }
        .proc-bar-wrap { height:5px; background:#FFE082; border-radius:3px; overflow:hidden; }
        .proc-bar {
          height:100%; border-radius:3px; background:#E65100;
          transition:width 1s linear;
        }
        .proc-bar.urgent { animation:urgentPulse 0.7s ease-in-out infinite; background:#e53e3e; }
        @keyframes urgentPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

        /* Prepared */
        .pill-prepared {
          display:flex; flex-direction:column; gap:3px;
          background:#E8F5E9; border:1.5px solid #A5D6A7;
          border-radius:8px; padding:9px 14px;
        }
        .pill-prepared-title { font-size:13px; font-weight:800; color:#2E8B3A; }
        .pill-prepared-sub   { font-size:12px; color:#388E3C; }

        /* Cancelled */
        .pill-cancelled {
          display:inline-flex; align-items:center;
          background:#f5f5f5; border:1.5px solid #ddd;
          border-radius:8px; padding:9px 14px;
        }
        .pill-cancelled-text { font-size:13px; font-weight:600; color:#999; }

        /* Action buttons */
        .actions-cell { display:flex; gap:8px; align-items:center; }
        .btn-accept  { padding:9px 18px; font-size:13px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; background:#2E8B3A; color:#fff; transition:background 0.2s, transform 0.12s; white-space:nowrap; }
        .btn-accept:hover  { background:#236B2C; }
        .btn-reject  { padding:9px 18px; font-size:13px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; background:#C94D1E; color:#fff; transition:background 0.2s, transform 0.12s; white-space:nowrap; }
        .btn-reject:hover  { background:#A83C14; }
        .btn-update  { padding:9px 20px; font-size:13px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; background:#C94D1E; color:#fff; transition:background 0.2s, transform 0.12s; white-space:nowrap; }
        .btn-update:hover  { background:#A83C14; }
        .btn-cancel  { padding:9px 18px; font-size:13px; font-weight:700; font-family:inherit; border:1.5px solid #e53e3e; border-radius:7px; cursor:pointer; background:#fff; color:#e53e3e; transition:background 0.2s, color 0.2s, transform 0.12s; white-space:nowrap; }
        .btn-cancel:hover  { background:#e53e3e; color:#fff; }
        .btn-accept:active, .btn-reject:active, .btn-update:active, .btn-cancel:active { transform:scale(0.97); }

        /* Empty */
        .empty-state { text-align:center; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:14px; }
        .empty-icon  { font-size:52px; }
        .empty-title { font-size:19px; font-weight:700; color:#555; }
        .empty-sub   { font-size:14px; color:#999; }

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
          width:100%; max-width:460px; box-shadow:0 16px 56px rgba(0,0,0,0.18);
          animation:modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both; position:relative;
        }
        .modal-title { font-size:21px; font-weight:800; color:#1a1a1a; margin-bottom:6px; }
        .modal-sub   { font-size:14px; color:#666; margin-bottom:26px; }
        .modal-close { position:absolute; top:18px; right:18px; background:none; border:none; cursor:pointer; font-size:22px; color:#888; transition:color 0.2s, transform 0.15s; }
        .modal-close:hover { color:#C94D1E; transform:scale(1.15); }

        /* Radio status options */
        .status-opts { display:flex; flex-direction:column; gap:10px; margin-bottom:22px; }
        .status-opt  {
          display:flex; align-items:flex-start; gap:13px;
          padding:14px 16px; border-radius:9px; border:1.5px solid #e0e0e0;
          cursor:pointer; transition:border-color 0.2s, background 0.2s;
          user-select:none;
        }
        .status-opt.sel  { border-color:#C94D1E; background:#FFF3EE; }
        .status-opt input[type=radio] { accent-color:#C94D1E; width:16px; height:16px; margin-top:2px; flex-shrink:0; cursor:pointer; }
        .opt-label { font-size:14px; font-weight:700; color:#1a1a1a; margin-bottom:2px; }
        .opt-sub   { font-size:12px; color:#888; }

        /* Time input */
        .time-field { display:flex; flex-direction:column; gap:7px; margin-bottom:22px; }
        .time-field label { font-size:13px; font-weight:700; color:#1a1a1a; }
        .time-field input {
          padding:12px 14px; border-radius:8px; border:1.5px solid #e0e0e0;
          background:#fafafa; font-size:15px; font-family:inherit; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .time-field input:focus { border-color:#C94D1E; box-shadow:0 0 0 3px rgba(201,77,30,0.12); background:#fff; }
        .time-field input:disabled { background:#f0f0f0; color:#aaa; cursor:not-allowed; border-color:#e8e8e8; }
        .time-note { font-size:12px; color:#aaa; margin-top:4px; }

        .btn-save {
          width:100%; padding:14px;
          background:#C94D1E; color:#fff; font-size:16px; font-weight:700; font-family:inherit;
          border:none; border-radius:9px; cursor:pointer;
          transition:background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow:0 4px 14px rgba(201,77,30,0.25);
        }
        .btn-save:hover { background:#A83C14; transform:translateY(-1px); }
        .btn-save:active { transform:translateY(0); }

        @media(max-width:900px) {
          .navbar, .page-wrap { padding-left:20px; padding-right:20px; }
          .page-title { font-size:22px; }
          th, td { padding:10px 10px; }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => onNavigate?.("admin-home")}>
          <span className="logo-campus">Campus</span><span className="logo-byte">Byte</span>
        </span>
        <ul className="nav-links">
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-home")}>Home</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-manage")}>Manage</button></li>
          <li><button className="nav-btn active">Orders</button></li>
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
        ) : null}
      </nav>

      {/* Page */}
      <div className="page-wrap">
        <h1 className="page-title">Manage Orders for {restaurantName || "Your Restaurant"}</h1>
        <p className="page-sub">Track and update all your {restaurantName || "restaurant"} orders.</p>

        {/* Tabs */}
        <div className="tabs">
          {[
            { key:"all",     label:"All" },
            { key:"pending", label:"Pending" },
            { key:"active",  label:"Active" },
          ].map(t => (
            <button key={t.key} className={`tab-btn${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
              <span className="tab-count">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-card">
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-title">No orders here yet</p>
              <p className="empty-sub">Orders will appear here once students start placing them.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((order, i) => {
                  const urgent = order.status === "processing" && order.timeLeft < 60;
                  return (
                    <tr key={order.id} className={removing === order.id ? "removing" : ""} style={{ animationDelay:`${i*0.05}s` }}>

                      {/* Order ID */}
                      <td><span className="order-id">#{order.id}</span></td>

                      {/* Items */}
                      <td>
                        <div className="item-list">
                          {order.items.map((it, j) => (
                            <span key={j} className="item-line">{it.name} × {it.qty}</span>
                          ))}
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="cust-name">{order.customer.name}</div>
                        <div className="cust-phone">{order.customer.phone}</div>
                      </td>

                      {/* Status */}
                      <td className="status-cell">
                        {order.status === "pending" && (
                          <div className="pill-pending">
                            <span className="pill-dot" />
                            <span className="pill-pending-text">Pending</span>
                          </div>
                        )}
                        {order.status === "accepted" && (
                          <div className="pill-accepted">
                            <span className="pill-accepted-dot" />
                            <span className="pill-accepted-text">Order Accepted</span>
                          </div>
                        )}
                        {order.status === "processing" && (
                          <div className="pill-processing">
                            <div className="pill-proc-top">
                              <span className="pill-proc-label">🍳 Processing</span>
                              <span className="pill-proc-timer">{fmtTime(order.timeLeft)}</span>
                            </div>
                            <div className="proc-bar-wrap">
                              <div className={`proc-bar${urgent ? " urgent" : ""}`} style={{ width:`${pct(order)}%` }} />
                            </div>
                          </div>
                        )}
                        {order.status === "prepared" && (
                          <div className="pill-prepared">
                            <div className="pill-prepared-title">✅ Order Prepared</div>
                            <div className="pill-prepared-sub">Ready to Pickup</div>
                          </div>
                        )}
                        {order.status === "cancelled" && (
                          <div className="pill-cancelled">
                            <span className="pill-cancelled-text">Cancelled</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="actions-cell">
                          {order.status === "pending" && (
                            <>
                              <button className="btn-accept" onClick={() => acceptOrder(order.id)}>Accept</button>
                              <button className="btn-reject" onClick={() => rejectOrder(order.id)}>Reject</button>
                            </>
                          )}
                          {(order.status === "accepted" || order.status === "processing") && (
                            <button className="btn-update" onClick={() => openUpdateModal(order)}>Update</button>
                          )}
                          {order.status === "prepared" && (
                            <button className="btn-cancel" onClick={() => cancelOrder(order.id)}>Cancel</button>
                          )}
                          {order.status === "cancelled" && (
                            <span style={{ fontSize:"13px", color:"#ccc" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <h2 className="modal-title">Update Order #{modal.id}</h2>
            <p className="modal-sub">{modal.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</p>

            {/* Status options */}
            <div className="status-opts">
              <label className={`status-opt${upStatus === "processing" ? " sel" : ""}`}>
                <input type="radio" name="upStatus" value="processing"
                  checked={upStatus === "processing"}
                  onChange={() => setUpStatus("processing")} />
                <div>
                  <div className="opt-label">🍳 Processing (Cooking)</div>
                  <div className="opt-sub">Order is being prepared — set estimated time</div>
                </div>
              </label>
              <label className={`status-opt${upStatus === "prepared" ? " sel" : ""}`}>
                <input type="radio" name="upStatus" value="prepared"
                  checked={upStatus === "prepared"}
                  onChange={() => setUpStatus("prepared")} />
                <div>
                  <div className="opt-label">✅ Prepared (Food is Ready)</div>
                  <div className="opt-sub">Food is ready — student can come pick up</div>
                </div>
              </label>
            </div>

            {/* Time input — disabled when Prepared */}
            <div className="time-field">
              <label>Estimated Time (minutes)</label>
              <input
                type="number" min="1" max="120"
                value={upMin}
                disabled={upStatus === "prepared"}
                onChange={e => setUpMin(e.target.value)}
                placeholder="e.g. 10"
              />
              {upStatus === "prepared" && (
                <span className="time-note">Time not needed — order is ready!</span>
              )}
            </div>

            <button className="btn-save" onClick={saveUpdate}>Save Changes</button>
          </div>
        </div>
      )}
    </>
  );
}
