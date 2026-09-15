import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminOrdersPage({
  onNavigate,
  restaurantName = "",
  restaurantDocId = "",
  onAdminLogout,
  orderTimers = {},
  onSetTimer,
  onClearTimer,
  onStopTimer,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
}) {
  const [scrolled, setScrolled]   = useState(false);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("all");
  const [modal, setModal]         = useState(null);
  const [upStatus, setUpStatus]   = useState("processing");
  const [upMin, setUpMin]         = useState("10");
  const [removing, setRemoving]   = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { fetchOrders(); }, [restaurantDocId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, "User Login"));
      const allOrders = [];

      for (const userDoc of usersSnap.docs) {
        const userData  = userDoc.data();
        const uName     = userData.Name || userData.name || userData["Reg No"] || userData.regNo || "Student";
        const uPhone    = userData.Phone || userData.phone || userData.Mobile || userData.mobile || "—";

        const ordersSnap = await getDocs(collection(db, "User Login", userDoc.id, "Orders"));

        ordersSnap.docs.forEach((orderDoc) => {
          const data = orderDoc.data();
          const itemsBelongHere = (data.items || []).some(item => {
            const itemRest = (item.restaurantName || "").toLowerCase().trim();
            const myRest   = (restaurantName      || "").toLowerCase().trim();
            return itemRest === myRest && myRest !== "";
          });

          if (!restaurantName || itemsBelongHere) {
            const rawStatus = data.status === "Placed" ? "pending" : (data.status?.toLowerCase() || "pending");
            allOrders.push({
              firestoreId: orderDoc.id,
              userDocId:   userDoc.id,
              id:          orderDoc.id.slice(-6).toUpperCase(),
              items:       (data.items || []).map(i => ({ name: i.name, qty: i.quantity })),
              total:       data.totalAmount || 0,
              customer:    { name: uName, phone: uPhone },
              status:      rawStatus,
              placedAt:    data.placedAt?.toDate?.() || null,
            });
          }
        });
      }

      allOrders.sort((a, b) => {
        if (!a.placedAt && !b.placedAt) return 0;
        if (!a.placedAt) return 1;
        if (!b.placedAt) return -1;
        return b.placedAt - a.placedAt;
      });

      setOrders(allOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
    setLoading(false);
  };

  const fmtTime = (sec) => {
    if (!sec || sec <= 0) return "00:00";
    return `${Math.floor(sec/60).toString().padStart(2,"0")}:${(sec%60).toString().padStart(2,"0")}`;
  };

  const fmtDate = (date) => (!date ? "—" : date.toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }));

  const updateOrderStatus = async (userDocId, firestoreId, newStatus) => {
    try {
      await updateDoc(doc(db, "User Login", userDocId, "Orders", firestoreId), { status: newStatus });
    } catch (err) { console.error("Status update error:", err); }
  };

  const acceptOrder = async (order) => {
    await updateOrderStatus(order.userDocId, order.firestoreId, "accepted");
    setOrders(p => p.map(o => o.firestoreId === order.firestoreId ? { ...o, status: "accepted" } : o));
  };

  const rejectOrder = async (order) => {
    setRemoving(order.firestoreId);
    await updateOrderStatus(order.userDocId, order.firestoreId, "rejected");
    onClearTimer?.(order.firestoreId);
    setTimeout(() => setOrders(p => p.filter(o => o.firestoreId !== order.firestoreId)), 380);
  };

  const cancelOrder = async (order) => {
    setRemoving(order.firestoreId);
    await updateOrderStatus(order.userDocId, order.firestoreId, "cancelled");
    onStopTimer?.(order.firestoreId);
    setTimeout(() => setOrders(p => p.map(o =>
      o.firestoreId === order.firestoreId ? { ...o, status: "cancelled" } : o
    )), 380);
  };

  const completeOrder = async (order) => {
    setRemoving(order.firestoreId);
    await updateOrderStatus(order.userDocId, order.firestoreId, "completed");
    onClearTimer?.(order.firestoreId);
    setTimeout(() => setOrders(p => p.map(o =>
      o.firestoreId === order.firestoreId ? { ...o, status: "completed" } : o
    )), 380);
  };

  const openUpdateModal = (order) => {
    setUpStatus(order.status === "accepted" ? "processing" : "prepared");
    setUpMin("10");
    setModal(order);
  };

  const saveUpdate = async () => {
    const newStatus = upStatus === "processing" ? "processing" : "prepared";
    await updateOrderStatus(modal.userDocId, modal.firestoreId, newStatus);
    setOrders(p => p.map(o => {
      if (o.firestoreId !== modal.firestoreId) return o;
      return { ...o, status: newStatus };
    }));
    if (upStatus === "processing") {
      const secs = Math.max(1, parseInt(upMin, 10)) * 60;
      onSetTimer?.(modal.firestoreId, secs);
    } else {
      onStopTimer?.(modal.firestoreId);
    }
    setModal(null);
  };

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    active:    orders.filter(o => ["accepted","processing","prepared"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  const displayed = orders.filter(o => {
    if (tab === "pending")   return o.status === "pending";
    if (tab === "active")    return ["accepted","processing","prepared"].includes(o.status);
    if (tab === "completed") return o.status === "completed";
    return true;
  });

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#f5f5f5; color:#1a1a1a; }
        .navbar { position:sticky; top:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:68px; background:#fff; box-shadow:0 1px 0 #e5e5e5; transition:box-shadow 0.3s; }
        .navbar.scrolled { box-shadow:0 2px 16px rgba(0,0,0,0.09); }
        .logo { font-size:24px; font-weight:800; letter-spacing:-0.5px; cursor:pointer; user-select:none; }
        .logo-campus { color:#C94D1E; } .logo-byte { color:#2E8B3A; }
        .nav-links { display:flex; align-items:center; gap:4px; list-style:none; }
        .nav-btn { display:block; padding:8px 20px; font-size:15px; font-weight:500; color:#1a1a1a; background:none; border:none; cursor:pointer; font-family:inherit; border-radius:6px; position:relative; transition:color 0.2s; }
        .nav-btn::after { content:''; position:absolute; bottom:4px; left:20px; right:20px; height:2.5px; border-radius:2px; background:#C94D1E; transform:scaleX(0); transition:transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin:left; }
        .nav-btn:hover { color:#C94D1E; } .nav-btn:hover::after { transform:scaleX(1); }
        .nav-btn.active { color:#C94D1E; } .nav-btn.active::after { transform:scaleX(1); }
        @keyframes chipPop { from{transform:scale(0.7);opacity:0;} to{transform:scale(1);opacity:1;} }
        .rest-chip { display:flex; align-items:center; gap:10px; background:#FFF3EE; border:1.5px solid #F4C4A8; border-radius:24px; padding:8px 18px 8px 10px; animation:chipPop 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .rest-chip-icon { width:32px; height:32px; border-radius:50%; background:#C94D1E; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rest-chip-name { font-size:14px; font-weight:700; color:#C94D1E; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .btn-logout-nav { background:#fff; color:#e53e3e; padding:9px 18px; border-radius:8px; font-weight:700; font-size:13px; border:1.5px solid #e53e3e; cursor:pointer; font-family:inherit; transition:background 0.2s; display:flex; align-items:center; gap:6px; }
        .btn-logout-nav:hover { background:#fff5f5; }
        .nav-arrow-btn { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:1.5px solid #e0e0e0; background:#fff; cursor:pointer; transition:background 0.2s, border-color 0.2s, opacity 0.2s; }
        .nav-arrow-btn:hover:not(:disabled) { background:#FFF3EE; border-color:#C94D1E; }
        .nav-arrow-btn:disabled { opacity:0.3; cursor:default; }
        .nav-arrows { display:flex; align-items:center; gap:6px; margin-right:4px; }
        .btn-done { padding:9px 18px; font-size:13px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; background:#2196F3; color:#fff; transition:background 0.2s; white-space:nowrap; }
        .btn-done:hover { background:#1565C0; }
        .page-wrap { max-width:1280px; margin:0 auto; padding:40px 40px 80px; }
        .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .page-title { font-size:28px; font-weight:800; color:#1a1a1a; }
        .btn-refresh { display:flex; align-items:center; gap:7px; padding:10px 20px; background:#fff; border:1.5px solid #e0e0e0; border-radius:9px; font-size:14px; font-weight:700; font-family:inherit; color:#555; cursor:pointer; transition:background 0.2s, border-color 0.2s, color 0.2s; }
        .btn-refresh:hover { background:#FFF3EE; border-color:#C94D1E; color:#C94D1E; }
        .page-sub { font-size:15px; color:#666; margin-bottom:28px; }
        .tabs { display:flex; gap:0; margin-bottom:28px; border:1.5px solid #e0e0e0; border-radius:10px; overflow:hidden; width:fit-content; background:#fff; }
        .tab-btn { padding:11px 28px; font-size:15px; font-weight:600; font-family:inherit; background:none; border:none; cursor:pointer; color:#555; transition:background 0.2s, color 0.2s; display:flex; align-items:center; gap:7px; border-right:1px solid #e0e0e0; }
        .tab-btn:last-child { border-right:none; }
        .tab-btn.active { background:#C94D1E; color:#fff; }
        .tab-btn:not(.active):hover { background:#FFF3EE; color:#C94D1E; }
        .tab-count { font-size:12px; font-weight:700; padding:2px 8px; border-radius:10px; }
        .tab-btn.active .tab-count { background:rgba(255,255,255,0.25); color:#fff; }
        .tab-btn:not(.active) .tab-count { background:#f0f0f0; color:#666; }
        .table-card { background:#fff; border-radius:14px; border:1px solid #e8e8e8; overflow:hidden; }
        table { width:100%; border-collapse:collapse; }
        thead tr { background:#fafafa; border-bottom:2px solid #f0f0f0; }
        th { padding:14px 18px; font-size:13px; font-weight:700; color:#666; text-align:left; white-space:nowrap; }
        td { padding:16px 18px; font-size:14px; vertical-align:middle; border-bottom:1px solid #f5f5f5; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:#fafafa; }
        @keyframes rowIn  { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes rowOut { from{opacity:1;} to{opacity:0;transform:translateX(20px);} }
        tbody tr { animation:rowIn 0.3s ease both; }
        tbody tr.removing td { animation:rowOut 0.38s ease forwards; }
        .order-id   { font-size:13px; font-weight:800; color:#C94D1E; font-family:monospace; }
        .order-time { font-size:11px; color:#bbb; margin-top:3px; }
        .item-list  { display:flex; flex-direction:column; gap:2px; }
        .item-line  { font-size:14px; color:#1a1a1a; }
        .order-total { font-size:13px; font-weight:700; color:#2E8B3A; margin-top:4px; }
        .cust-name  { font-size:14px; font-weight:600; color:#1a1a1a; }
        .cust-phone { font-size:13px; color:#C94D1E; margin-top:2px; font-weight:500; }
        .status-cell { min-width:200px; }
        .pill-pending { display:inline-flex; align-items:center; gap:8px; background:#FFF3EE; border:1.5px solid #F4C4A8; border-radius:8px; padding:9px 14px; }
        .pill-dot { width:8px; height:8px; border-radius:50%; background:#C94D1E; animation:dotPulse 1.4s ease-in-out infinite; flex-shrink:0; }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.5;} }
        .pill-pending-text { font-size:13px; font-weight:700; color:#C94D1E; }
        .pill-accepted { display:inline-flex; align-items:center; gap:8px; background:#E8F5E9; border:1.5px solid #A5D6A7; border-radius:8px; padding:9px 14px; }
        .pill-accepted-dot { width:8px; height:8px; border-radius:50%; background:#2E8B3A; animation:dotPulse 1.4s ease-in-out infinite; flex-shrink:0; }
        .pill-accepted-text { font-size:13px; font-weight:700; color:#2E8B3A; }
        .pill-processing { background:#FFF8E1; border:1.5px solid #FFD54F; border-radius:8px; padding:9px 14px; display:flex; flex-direction:column; gap:7px; }
        .pill-proc-top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .pill-proc-label { font-size:13px; font-weight:700; color:#E65100; }
        .pill-proc-timer { font-size:16px; font-weight:800; color:#E65100; font-variant-numeric:tabular-nums; letter-spacing:1px; }
        .proc-bar-wrap { height:5px; background:#FFE082; border-radius:3px; overflow:hidden; }
        .proc-bar { height:100%; border-radius:3px; background:#E65100; transition:width 1s linear; }
        .proc-bar.urgent { animation:urgentPulse 0.7s ease-in-out infinite; background:#e53e3e; }
        @keyframes urgentPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .pill-prepared { display:flex; flex-direction:column; gap:3px; background:#E8F5E9; border:1.5px solid #A5D6A7; border-radius:8px; padding:9px 14px; }
        .pill-prepared-title { font-size:13px; font-weight:800; color:#2E8B3A; }
        .pill-prepared-sub   { font-size:12px; color:#388E3C; }
        .pill-cancelled { display:inline-flex; align-items:center; background:#f5f5f5; border:1.5px solid #ddd; border-radius:8px; padding:9px 14px; }
        .pill-cancelled-text { font-size:13px; font-weight:600; color:#999; }
        .pill-completed { display:inline-flex; align-items:center; gap:8px; background:#E3F2FD; border:1.5px solid #90CAF9; border-radius:8px; padding:9px 14px; }
        .pill-completed-text { font-size:13px; font-weight:700; color:#1565C0; }
        .actions-cell { display:flex; gap:8px; align-items:center; }
        .btn-accept  { padding:9px 18px; font-size:13px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; background:#2E8B3A; color:#fff; transition:background 0.2s; white-space:nowrap; }
        .btn-accept:hover  { background:#236B2C; }
        .btn-reject  { padding:9px 18px; font-size:13px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; background:#e53e3e; color:#fff; transition:background 0.2s; white-space:nowrap; }
        .btn-reject:hover  { background:#c53030; }
        .btn-update  { padding:9px 20px; font-size:13px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; background:#C94D1E; color:#fff; transition:background 0.2s; white-space:nowrap; }
        .btn-update:hover  { background:#A83C14; }
        .btn-cancel  { padding:9px 18px; font-size:13px; font-weight:700; font-family:inherit; border:1.5px solid #e53e3e; border-radius:7px; cursor:pointer; background:#fff; color:#e53e3e; transition:background 0.2s, color 0.2s; white-space:nowrap; }
        .btn-cancel:hover  { background:#e53e3e; color:#fff; }
        @keyframes spin { to{transform:rotate(360deg);} }
        .spinner { width:36px; height:36px; border:3px solid #f0f0f0; border-top-color:#C94D1E; border-radius:50%; animation:spin 0.8s linear infinite; }
        .loading-state { text-align:center; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:16px; }
        .empty-state { text-align:center; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:14px; }
        .empty-icon  { font-size:52px; }
        .empty-title { font-size:19px; font-weight:700; color:#555; }
        .empty-sub   { font-size:14px; color:#999; }
        .not-logged-warn { display:flex; flex-direction:column; align-items:center; gap:14px; padding:60px 24px; text-align:center; }
        .not-logged-warn-title { font-size:18px; font-weight:700; color:#C94D1E; }
        .not-logged-warn-sub { font-size:14px; color:#999; }
        @keyframes overlayIn { from{opacity:0;} to{opacity:1;} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.92) translateY(20px);} to{opacity:1;transform:scale(1) translateY(0);} }
        .modal-overlay { position:fixed; inset:0; z-index:500; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; padding:24px; animation:overlayIn 0.2s ease both; }
        .modal { background:#fff; border-radius:16px; padding:36px 40px 32px; width:100%; max-width:460px; box-shadow:0 16px 56px rgba(0,0,0,0.18); animation:modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both; position:relative; }
        .modal-title { font-size:21px; font-weight:800; color:#1a1a1a; margin-bottom:6px; }
        .modal-sub   { font-size:14px; color:#666; margin-bottom:26px; }
        .modal-close { position:absolute; top:18px; right:18px; background:none; border:none; cursor:pointer; font-size:22px; color:#888; transition:color 0.2s; }
        .modal-close:hover { color:#C94D1E; }
        .status-opts { display:flex; flex-direction:column; gap:10px; margin-bottom:22px; }
        .status-opt { display:flex; align-items:flex-start; gap:13px; padding:14px 16px; border-radius:9px; border:1.5px solid #e0e0e0; cursor:pointer; transition:border-color 0.2s, background 0.2s; user-select:none; }
        .status-opt.sel { border-color:#C94D1E; background:#FFF3EE; }
        .status-opt input[type=radio] { accent-color:#C94D1E; width:16px; height:16px; margin-top:2px; flex-shrink:0; cursor:pointer; }
        .opt-label { font-size:14px; font-weight:700; color:#1a1a1a; margin-bottom:2px; }
        .opt-sub   { font-size:12px; color:#888; }
        .time-field { display:flex; flex-direction:column; gap:7px; margin-bottom:22px; }
        .time-field label { font-size:13px; font-weight:700; color:#1a1a1a; }
        .time-field input { padding:12px 14px; border-radius:8px; border:1.5px solid #e0e0e0; background:#fafafa; font-size:15px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .time-field input:focus { border-color:#C94D1E; background:#fff; }
        .time-field input:disabled { background:#f0f0f0; color:#aaa; cursor:not-allowed; border-color:#e8e8e8; }
        .time-note { font-size:12px; color:#aaa; margin-top:4px; }
        .btn-save { width:100%; padding:14px; background:#C94D1E; color:#fff; font-size:16px; font-weight:700; font-family:inherit; border:none; border-radius:9px; cursor:pointer; transition:background 0.2s, transform 0.15s; box-shadow:0 4px 14px rgba(201,77,30,0.25); }
        .btn-save:hover { background:#A83C14; transform:translateY(-1px); }
        @media(max-width:900px) { .navbar, .page-wrap { padding-left:20px; padding-right:20px; } .page-title { font-size:22px; } th, td { padding:10px 10px; } }
      `}</style>

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
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div className="nav-arrows">
            <button className="nav-arrow-btn" onClick={onGoBack} disabled={!canGoBack} title="Go Back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="nav-arrow-btn" onClick={onGoForward} disabled={!canGoForward} title="Go Forward">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          {restaurantName && (
            <div className="rest-chip">
              <div className="rest-chip-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="rest-chip-name">{restaurantName}</span>
            </div>
          )}
          {restaurantName && (
            <button className="btn-logout-nav" onClick={() => onAdminLogout?.()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          )}
        </div>
      </nav>

      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">
            {restaurantName ? `Orders — ${restaurantName}` : "Manage Orders"}
          </h1>
          <button className="btn-refresh" onClick={fetchOrders}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
        <p className="page-sub">
          {restaurantName ? `Showing only orders placed for ${restaurantName}.` : "Login to see orders for your restaurant."}
        </p>

        {!restaurantName && (
          <div className="table-card">
            <div className="not-logged-warn">
              <div style={{fontSize:"48px"}}>🔐</div>
              <div className="not-logged-warn-title">You're not logged in as a restaurant</div>
              <div className="not-logged-warn-sub">Go to Admin Home and login or register your restaurant to see orders.</div>
            </div>
          </div>
        )}

        {restaurantName && (
          <>
            <div className="tabs">
              {[{key:"all",label:"All"},{key:"pending",label:"Pending"},{key:"active",label:"Active"},{key:"completed",label:"Completed"}].map(t => (
                <button key={t.key} className={`tab-btn${tab===t.key?" active":""}`} onClick={() => setTab(t.key)}>
                  {t.label}<span className="tab-count">{counts[t.key]}</span>
                </button>
              ))}
            </div>

            <div className="table-card">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p style={{color:"#999",fontSize:"15px"}}>Loading orders...</p>
                </div>
              ) : displayed.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p className="empty-title">No orders here yet</p>
                  <p className="empty-sub">Orders will appear once students place them.</p>
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
                      const timer  = orderTimers[order.firestoreId];
                      const tLeft  = timer?.timeLeft  ?? 0;
                      const tTotal = timer?.totalSec  ?? 0;
                      const urgent = order.status === "processing" && tLeft < 60;

                      return (
                        <tr key={order.firestoreId} className={removing===order.firestoreId?"removing":""} style={{animationDelay:`${i*0.05}s`}}>
                          <td>
                            <div className="order-id">#{order.id}</div>
                            <div className="order-time">{fmtDate(order.placedAt)}</div>
                          </td>
                          <td>
                            <div className="item-list">
                              {order.items.map((it,j) => <span key={j} className="item-line">{it.name} × {it.qty}</span>)}
                            </div>
                            <div className="order-total">₹{order.total}</div>
                          </td>
                          <td>
                            <div className="cust-name">{order.customer.name}</div>
                            <div className="cust-phone">{order.customer.phone}</div>
                          </td>
                          <td className="status-cell">
                            {order.status === "pending" && <div className="pill-pending"><span className="pill-dot"/><span className="pill-pending-text">Pending</span></div>}
                            {order.status === "accepted" && <div className="pill-accepted"><span className="pill-accepted-dot"/><span className="pill-accepted-text">Accepted</span></div>}
                            {order.status === "processing" && (
                              <div className="pill-processing">
                                <div className="pill-proc-top">
                                  <span className="pill-proc-label">Processing</span>
                                  <span className="pill-proc-timer">{fmtTime(tLeft)}</span>
                                </div>
                                <div className="proc-bar-wrap">
                                  <div className={`proc-bar${urgent?" urgent":""}`} style={{width:`${tTotal ? Math.max(0,(tLeft/tTotal)*100) : 0}%`}}/>
                                </div>
                              </div>
                            )}
                            {order.status === "prepared" && <div className="pill-prepared"><div className="pill-prepared-title">Order Prepared</div><div className="pill-prepared-sub">Ready to Pickup</div></div>}
                            {order.status === "completed" && <div className="pill-completed"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span className="pill-completed-text">Completed</span></div>}
                            {(order.status === "cancelled" || order.status === "rejected") && <div className="pill-cancelled"><span className="pill-cancelled-text">{order.status === "rejected" ? "Rejected" : "Cancelled"}</span></div>}
                          </td>
                          <td>
                            <div className="actions-cell">
                              {order.status === "pending" && <><button className="btn-accept" onClick={() => acceptOrder(order)}>Accept</button><button className="btn-reject" onClick={() => rejectOrder(order)}>Reject</button></>}
                              {(order.status === "accepted" || order.status === "processing") && <button className="btn-update" onClick={() => openUpdateModal(order)}>Update</button>}
                              {order.status === "prepared" && <><button className="btn-done" onClick={() => completeOrder(order)}>✓ Done</button><button className="btn-cancel" onClick={() => cancelOrder(order)}>Cancel</button></>}
                              {(order.status === "cancelled" || order.status === "rejected" || order.status === "completed") && <span style={{fontSize:"13px",color:"#ccc"}}>—</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setModal(null); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <h2 className="modal-title">Update Order #{modal.id}</h2>
            <p className="modal-sub">{modal.items.map(i=>`${i.name} × ${i.qty}`).join(", ")}</p>
            <div className="status-opts">
              <label className={`status-opt${upStatus==="processing"?" sel":""}`}>
                <input type="radio" name="upStatus" value="processing" checked={upStatus==="processing"} onChange={() => setUpStatus("processing")} />
                <div><div className="opt-label">Processing (Cooking)</div><div className="opt-sub">Order is being prepared — set estimated time</div></div>
              </label>
              <label className={`status-opt${upStatus==="prepared"?" sel":""}`}>
                <input type="radio" name="upStatus" value="prepared" checked={upStatus==="prepared"} onChange={() => setUpStatus("prepared")} />
                <div><div className="opt-label">Prepared (Food is Ready)</div><div className="opt-sub">Food is ready — student can come pick up</div></div>
              </label>
            </div>
            <div className="time-field">
              <label>Estimated Time (minutes)</label>
              <input type="number" min="1" max="120" value={upMin} disabled={upStatus==="prepared"} onChange={e => setUpMin(e.target.value)} placeholder="e.g. 10" />
              {upStatus==="prepared" && <span className="time-note">Time not needed — order is ready!</span>}
            </div>
            <button className="btn-save" onClick={saveUpdate}>Save Changes</button>
          </div>
        </div>
      )}
    </>
  );
}