import { useState, useEffect, useRef } from "react";
import {
  collection, getDocs, deleteDoc, doc, updateDoc, setDoc
} from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminEditPage({ onNavigate, restaurantName = "", restaurantDocId = "", outlet = null, canGoBack, canGoForward, onGoBack, onGoForward }) {
  const [scrolled, setScrolled]       = useState(false);
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fireErr, setFireErr]         = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch]           = useState("");
  const [filterCat, setFilterCat]     = useState("all");
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [removing, setRemoving]       = useState(null);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState({ category: "", name: "", price: "", image: null });
  const [imgName, setImgName]         = useState("");
  const [formErr, setFormErr]         = useState({});
  const [catInput, setCatInput]       = useState("");
  const fileRef                       = useRef();

  const outletName    = outlet?.name         || restaurantName || "Outlet";
  const outletLoc     = outlet?.location     || "Main Food Court";
  const outletDocId   = outlet?.firestoreId  || outlet?.id || "";

  const menuCollection = () =>
    collection(db, "Restaurant Registration", restaurantDocId, "Outlets", outletDocId, "Menu");

  const menuDoc = (itemId) =>
    doc(db, "Restaurant Registration", restaurantDocId, "Outlets", outletDocId, "Menu", itemId);

  // Derive unique categories from items
  const categories = [...new Set(items.map(i => i.category))].filter(Boolean);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (!e.target.closest(".cat-drop-wrap")) setCatDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Fetch menu items from Firestore on mount
  useEffect(() => {
    if (!restaurantDocId || !outletDocId) { setLoading(false); return; }
    fetchItems();
  }, [restaurantDocId, outletDocId]);

  const fetchItems = async () => {
    setLoading(true); setFireErr("");
    try {
      const snap = await getDocs(menuCollection());
      const list = snap.docs.map(d => ({
        firestoreId: d.id,
        id:          d.id,
        category:    d.data()["Category"]  || "",
        name:        d.data()["Item Name"] || "",
        price:       d.data()["Price"]     || 0,
        available:   d.data()["Is Available"] ?? true,
        location:    outletLoc,
        university:  "Lovely Professional University",
      }));
      setItems(list);
    } catch (err) {
      console.error("Fetch menu error:", err);
      setFireErr("Failed to load menu items. Please refresh.");
    }
    setLoading(false);
  };

  // ── Add / Edit modal ───────────────────────────
  const openAddModal = () => {
    setEditingItem(null);
    setForm({ category: categories[0] || "", name: "", price: "", image: null });
    setCatInput(""); setImgName(""); setFormErr({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({ category: item.category, name: item.name, price: String(item.price), image: null });
    setCatInput(""); setImgName(""); setFormErr({});
    setShowModal(true);
  };

  const validateForm = () => {
    const e = {};
    const cat = catInput.trim() || form.category;
    if (!cat)                                              e.category = "Category is required";
    if (!form.name.trim())                                 e.name     = "Item name is required";
    if (!form.price)                                       e.price    = "Price is required";
    else if (isNaN(form.price) || Number(form.price) <= 0) e.price    = "Enter a valid price";
    return e;
  };

  // ── Save to Firestore ──────────────────────────
  const handleSubmit = async () => {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErr(e); return; }

    const finalCategory = catInput.trim() || form.category;
    setSaving(true); setFireErr("");

    try {
      if (editingItem) {
        // Update existing document
        await updateDoc(menuDoc(editingItem.firestoreId), {
          "Category":     finalCategory,
          "Item Name":    form.name.trim(),
          "Price":        Number(form.price),
        });
        setItems(p => p.map(i => i.id === editingItem.id
          ? { ...i, category: finalCategory, name: form.name.trim(), price: Number(form.price) }
          : i
        ));
      } else {
        // Add new document with item name as doc ID
        const itemDocId = form.name.trim();
        const itemRef = doc(db, "Restaurant Registration", restaurantDocId, "Outlets", outletDocId, "Menu", itemDocId);
        await setDoc(itemRef, {
          "Category":     finalCategory,
          "Item Name":    itemDocId,
          "Price":        Number(form.price),
          "Is Available": true,
          "Created At":   new Date().toISOString(),
        });
        setItems(p => [...p, {
          firestoreId: itemDocId,
          id:          itemDocId,
          category:    finalCategory,
          name:        itemDocId,
          price:       Number(form.price),
          available:   true,
          location:    outletLoc,
          university:  "Lovely Professional University",
        }]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Save item error:", err);
      setFireErr("Failed to save item. Please try again.");
    }
    setSaving(false);
  };

  // ── Remove from Firestore ──────────────────────
  const removeItem = async (item) => {
    setRemoving(item.id);
    try {
      await deleteDoc(menuDoc(item.firestoreId));
      setTimeout(() => { setItems(p => p.filter(i => i.id !== item.id)); setRemoving(null); }, 350);
    } catch (err) {
      console.error("Remove item error:", err);
      setRemoving(null);
      setFireErr("Failed to remove item. Please try again.");
    }
  };

  // ── Toggle available in Firestore ──────────────
  const toggleAvailable = async (item) => {
    const newVal = !item.available;
    setItems(p => p.map(i => i.id === item.id ? { ...i, available: newVal } : i));
    try {
      await updateDoc(menuDoc(item.firestoreId), { "Is Available": newVal });
    } catch (err) {
      console.error("Toggle error:", err);
      setItems(p => p.map(i => i.id === item.id ? { ...i, available: !newVal } : i));
    }
  };

  // ── Filter & group ─────────────────────────────
  const filtered = items.filter(i => {
    const matchCat    = filterCat === "all" || i.category === filterCat;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#f5f5f5; color:#1a1a1a; }

        @keyframes spin    { to{transform:rotate(360deg);} }
        @keyframes rowIn   { from{opacity:0;transform:translateX(-12px);} to{opacity:1;transform:translateX(0);} }
        @keyframes rowOut  { from{opacity:1;max-height:200px;} to{opacity:0;max-height:0;} }
        @keyframes overlayIn { from{opacity:0;} to{opacity:1;} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.92) translateY(20px);} to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes chipPop   { from{transform:scale(0.7);opacity:0;} to{transform:scale(1);opacity:1;} }

        /* Navbar */
        .navbar { position:sticky; top:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:68px; background:#fff; box-shadow:0 1px 0 #e5e5e5; transition:box-shadow 0.3s; }
        .navbar.scrolled { box-shadow:0 2px 16px rgba(0,0,0,0.09); }
        .logo { font-size:24px; font-weight:800; letter-spacing:-0.5px; cursor:pointer; user-select:none; }
        .logo-campus { color:#C94D1E; } .logo-byte { color:#2E8B3A; }
        .nav-links { display:flex; align-items:center; gap:4px; list-style:none; }
        .nav-btn { display:block; padding:8px 20px; font-size:15px; font-weight:500; color:#1a1a1a; background:none; border:none; cursor:pointer; font-family:inherit; border-radius:6px; position:relative; transition:color 0.2s; }
        .nav-btn::after { content:''; position:absolute; bottom:4px; left:20px; right:20px; height:2.5px; border-radius:2px; background:#C94D1E; transform:scaleX(0); transition:transform 0.22s cubic-bezier(0.22,1,0.36,1); transform-origin:left; }
        .nav-btn:hover { color:#C94D1E; } .nav-btn:hover::after { transform:scaleX(1); }
        .nav-btn.active { color:#C94D1E; } .nav-btn.active::after { transform:scaleX(1); }
        .rest-chip { display:flex; align-items:center; gap:10px; background:#FFF3EE; border:1.5px solid #F4C4A8; border-radius:24px; padding:8px 18px 8px 10px; animation:chipPop 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .rest-chip-icon { width:32px; height:32px; border-radius:50%; background:#C94D1E; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rest-chip-name { font-size:14px; font-weight:700; color:#C94D1E; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .btn-nav-login { background:#C94D1E; color:#fff; padding:11px 32px; border-radius:8px; font-weight:700; font-size:15px; letter-spacing:0.5px; text-transform:uppercase; border:none; cursor:pointer; font-family:inherit; transition:background 0.2s; }
        .btn-nav-login:hover { background:#A83C14; }

        /* Page */
        .page-wrap { max-width:1280px; margin:0 auto; padding:40px 40px 80px; }

        /* Breadcrumb */
        .breadcrumb { display:flex; align-items:center; gap:8px; font-size:14px; color:#888; margin-bottom:24px; }
        .breadcrumb-link { color:#C94D1E; font-weight:600; cursor:pointer; background:none; border:none; font-family:inherit; font-size:14px; padding:0; transition:color 0.2s; }
        .breadcrumb-link:hover { color:#A83C14; text-decoration:underline; }
        .breadcrumb-sep { color:#ccc; }
        .breadcrumb-cur { color:#888; }

        /* Header */
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; gap:16px; }
        .page-title { font-size:28px; font-weight:800; color:#1a1a1a; margin-bottom:6px; }
        .page-sub   { font-size:15px; color:#666; }
        .btn-add-item { display:flex; align-items:center; gap:8px; background:#C94D1E; color:#fff; padding:14px 28px; border-radius:9px; font-size:16px; font-weight:700; font-family:inherit; border:none; cursor:pointer; white-space:nowrap; flex-shrink:0; transition:background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow:0 4px 14px rgba(201,77,30,0.25); }
        .btn-add-item:hover { background:#A83C14; transform:translateY(-2px); box-shadow:0 8px 24px rgba(201,77,30,0.32); }

        /* Error / loading */
        .fire-banner { padding:12px 20px; background:#FFF3EE; border:1.5px solid #F4C4A8; border-radius:10px; font-size:14px; color:#C94D1E; font-weight:600; margin-bottom:24px; }
        .loading-state { text-align:center; padding:60px; display:flex; flex-direction:column; align-items:center; gap:16px; }
        .big-spinner { width:40px; height:40px; border:3px solid #f0f0f0; border-top-color:#C94D1E; border-radius:50%; animation:spin 0.8s linear infinite; }

        /* Controls */
        .controls-row { display:flex; align-items:center; gap:14px; margin-bottom:32px; flex-wrap:wrap; }
        .cat-drop-wrap { position:relative; }
        .cat-trigger { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:11px 16px; min-width:220px; border-radius:8px; border:1.5px solid #d0d0d0; background:#fff; font-size:15px; font-weight:500; color:#1a1a1a; cursor:pointer; font-family:inherit; transition:border-color 0.2s; }
        .cat-trigger:hover { border-color:#C94D1E; }
        .cat-trigger .arrow { font-size:14px; color:#666; transition:transform 0.2s; }
        .cat-trigger .arrow.open { transform:rotate(180deg); }
        .cat-menu { position:absolute; top:calc(100% + 4px); left:0; min-width:220px; background:#fff; border:1.5px solid #e0e0e0; border-radius:8px; box-shadow:0 6px 20px rgba(0,0,0,0.1); z-index:50; overflow:hidden; }
        .cat-item { padding:10px 16px; font-size:15px; cursor:pointer; transition:background 0.15s, color 0.15s; }
        .cat-item:hover { background:#FFF3EE; color:#C94D1E; }
        .cat-item.selected { color:#C94D1E; font-weight:700; }
        .search-wrap { position:relative; flex:1; max-width:360px; }
        .search-wrap input { width:100%; padding:11px 16px 11px 42px; border-radius:8px; border:1.5px solid #d0d0d0; background:#fff; font-size:15px; font-family:inherit; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .search-wrap input:focus { border-color:#C94D1E; box-shadow:0 0 0 3px rgba(201,77,30,0.12); }
        .search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#aaa; }

        /* Category section */
        .cat-section { margin-bottom:32px; }
        .cat-heading { font-size:20px; font-weight:800; color:#1a1a1a; margin-bottom:16px; }
        .cat-card { background:#fff; border-radius:14px; border:1px solid #e8e8e8; overflow:hidden; }

        /* Item row */
        .item-row { display:grid; grid-template-columns:auto 1fr auto; align-items:stretch; border-bottom:1px solid #f0f0f0; animation:rowIn 0.35s cubic-bezier(0.22,1,0.36,1) both; transition:background 0.15s; }
        .item-row:last-child { border-bottom:none; }
        .item-row:hover { background:#fafafa; }
        .item-row.removing { animation:rowOut 0.35s ease forwards; overflow:hidden; }
        .item-img-wrap { width:130px; height:100px; flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .item-info { padding:16px 20px; display:flex; flex-direction:column; justify-content:space-between; }
        .item-name  { font-size:18px; font-weight:700; color:#1a1a1a; margin-bottom:4px; }
        .item-price { font-size:17px; font-weight:700; color:#C94D1E; margin-bottom:10px; }
        .item-loc   { font-size:13px; color:#666; line-height:1.5; }
        .item-actions { display:flex; flex-direction:column; align-items:flex-end; justify-content:space-between; padding:16px 20px; gap:10px; min-width:200px; }
        .action-btns { display:flex; gap:10px; }
        .btn-edit, .btn-remove { padding:9px 22px; font-size:14px; font-weight:700; font-family:inherit; border:none; border-radius:7px; cursor:pointer; transition:background 0.2s, transform 0.12s; }
        .btn-edit   { background:#2E8B3A; color:#fff; } .btn-edit:hover   { background:#236B2C; }
        .btn-remove { background:#C94D1E; color:#fff; } .btn-remove:hover { background:#A83C14; }
        .btn-edit:active, .btn-remove:active { transform:scale(0.97); }
        .avail-row { display:flex; align-items:center; gap:10px; }
        .avail-label { font-size:14px; font-weight:600; color:#1a1a1a; }
        .toggle-track { position:relative; width:52px; height:28px; border-radius:14px; cursor:pointer; display:flex; align-items:center; transition:background 0.3s; flex-shrink:0; }
        .toggle-track.on  { background:#2E8B3A; } .toggle-track.off { background:#ccc; }
        .toggle-thumb { position:absolute; right:3px; width:22px; height:22px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:right 0.25s cubic-bezier(0.22,1,0.36,1); }
        .toggle-track.off .toggle-thumb { right:27px; }

        /* Empty / no results */
        .empty-state { text-align:center; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:16px; }
        .empty-icon  { font-size:56px; }
        .empty-title { font-size:20px; font-weight:700; color:#444; }
        .empty-sub   { font-size:15px; color:#999; }
        .btn-empty-add { margin-top:8px; background:#C94D1E; color:#fff; padding:13px 32px; border-radius:9px; font-size:15px; font-weight:700; font-family:inherit; border:none; cursor:pointer; transition:background 0.2s, transform 0.15s; box-shadow:0 4px 14px rgba(201,77,30,0.22); }
        .btn-empty-add:hover { background:#A83C14; transform:translateY(-1px); }
        .no-results { text-align:center; padding:40px; color:#aaa; font-size:15px; }

        /* Modal */
        .modal-overlay { position:fixed; inset:0; z-index:500; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; padding:24px; animation:overlayIn 0.2s ease both; }
        .modal { background:#fff; border-radius:16px; padding:36px 40px 32px; width:100%; max-width:500px; box-shadow:0 16px 56px rgba(0,0,0,0.18); animation:modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both; position:relative; max-height:90vh; overflow-y:auto; }
        .modal-title { font-size:22px; font-weight:800; color:#1a1a1a; margin-bottom:6px; }
        .modal-sub   { font-size:14px; color:#666; margin-bottom:28px; }
        .modal-close { position:absolute; top:18px; right:18px; background:none; border:none; cursor:pointer; font-size:22px; color:#888; transition:color 0.2s, transform 0.15s; }
        .modal-close:hover { color:#C94D1E; transform:scale(1.15); }
        .m-fire-err { font-size:13px; color:#C94D1E; font-weight:600; margin-bottom:12px; padding:10px 14px; background:#FFF3EE; border-radius:8px; border:1px solid #F4C4A8; }
        .m-field { display:flex; flex-direction:column; gap:7px; margin-bottom:18px; }
        .m-field label { font-size:13px; font-weight:700; color:#1a1a1a; }
        .m-field input, .m-field select { padding:12px 14px; border-radius:8px; border:1.5px solid #e0e0e0; background:#fafafa; font-size:15px; font-family:inherit; outline:none; transition:border-color 0.2s, box-shadow 0.2s; width:100%; appearance:none; }
        .m-field input:focus, .m-field select:focus { border-color:#C94D1E; box-shadow:0 0 0 3px rgba(201,77,30,0.12); background:#fff; }
        .m-field input.err { border-color:#e53e3e; }
        .m-err { font-size:11.5px; color:#e53e3e; margin-top:3px; }
        .cat-or { font-size:12px; color:#999; text-align:center; margin:6px 0; }
        .new-cat-input { padding:12px 14px; border-radius:8px; border:1.5px solid #e0e0e0; background:#fafafa; font-size:15px; font-family:inherit; outline:none; width:100%; transition:border-color 0.2s, box-shadow 0.2s; }
        .new-cat-input:focus { border-color:#C94D1E; box-shadow:0 0 0 3px rgba(201,77,30,0.12); background:#fff; }
        .new-cat-input.err  { border-color:#e53e3e; }
        .price-wrap { position:relative; }
        .price-prefix { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:15px; font-weight:600; color:#444; pointer-events:none; }
        .price-wrap input { padding-left:28px; }
        .logo-row { display:flex; align-items:stretch; border-radius:8px; border:1.5px solid #e0e0e0; overflow:hidden; background:#fafafa; }
        .logo-fake { flex:1; padding:12px 14px; font-size:14px; color:#b0b0b0; font-family:inherit; background:transparent; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .logo-fake.filled { color:#1a1a1a; }
        .btn-upload { background:#C94D1E; color:#fff; font-size:13px; font-weight:700; font-family:inherit; padding:0 20px; border:none; cursor:pointer; white-space:nowrap; transition:background 0.2s; }
        .btn-upload:hover { background:#A83C14; }
        .btn-modal-submit { width:100%; padding:15px; margin-top:8px; background:#C94D1E; color:#fff; font-size:16px; font-weight:700; font-family:inherit; border:none; border-radius:9px; cursor:pointer; transition:background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow:0 4px 14px rgba(201,77,30,0.25); display:flex; align-items:center; justify-content:center; gap:10px; }
        .btn-modal-submit:hover:not(:disabled) { background:#A83C14; transform:translateY(-1px); }
        .btn-modal-submit:disabled { opacity:0.75; cursor:not-allowed; }
        .spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }

        @media(max-width:860px) {
          .navbar, .page-wrap { padding-left:20px; padding-right:20px; }
          .page-title { font-size:22px; }
          .item-row { grid-template-columns:100px 1fr; }
          .item-actions { flex-direction:row; flex-wrap:wrap; min-width:unset; padding:12px 16px; }
          .item-img-wrap { width:100px; height:80px; }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo" onClick={() => onNavigate?.("admin-home")}>
          <span className="logo-campus">Campus</span><span className="logo-byte">Byte</span>
        </span>
        <ul className="nav-links">
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-home")}>Home</button></li>
          <li><button className="nav-btn active" onClick={() => onNavigate?.("admin-manage")}>Manage</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-orders")}>Orders</button></li>
          <li><button className="nav-btn" onClick={() => onNavigate?.("admin-contact")}>Contact Us</button></li>
        </ul>
        {restaurantName ? (
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{display:"flex",gap:"6px"}}>
              <button onClick={onGoBack} disabled={!canGoBack} title="Go Back" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoBack?"pointer":"default",opacity:canGoBack?1:0.35}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
              <button onClick={onGoForward} disabled={!canGoForward} title="Go Forward" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoForward?"pointer":"default",opacity:canGoForward?1:0.35}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
            </div>
            <div className="rest-chip">
            <div className="rest-chip-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="rest-chip-name">{restaurantName}</span>
          </div>
          </div>
        ) : (
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={onGoBack} disabled={!canGoBack} title="Go Back" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoBack?"pointer":"default",opacity:canGoBack?1:0.35}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button onClick={onGoForward} disabled={!canGoForward} title="Go Forward" style={{width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",border:"1.5px solid #e0e0e0",background:"#fff",cursor:canGoForward?"pointer":"default",opacity:canGoForward?1:0.35}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
            <button className="btn-nav-login" onClick={() => onNavigate?.("admin-register")}>LOGIN</button>
          </div>
        )}
      </nav>

      {/* Page */}
      <div className="page-wrap">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button className="breadcrumb-link" onClick={() => onNavigate?.("admin-manage")}>Manage</button>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-cur">{outletName}</span>
        </div>

        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Items for {outletName}</h1>
            <p className="page-sub">Add, edit, and manage menu items for this outlet.</p>
          </div>
          {!loading && items.length > 0 && (
            <button className="btn-add-item" onClick={openAddModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Item
            </button>
          )}
        </div>

        {/* Error banner */}
        {fireErr && <div className="fire-banner">⚠ {fireErr}</div>}

        {/* Loading */}
        {loading ? (
          <div className="loading-state">
            <div className="big-spinner" />
            <p style={{ color:"#999", fontSize:"15px" }}>Loading menu items...</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            {items.length > 0 && (
              <div className="controls-row">
                <div className="cat-drop-wrap">
                  <button className="cat-trigger" onClick={() => setCatDropOpen(p => !p)}>
                    <span>{filterCat === "all" ? "Select Category" : filterCat}</span>
                    <span className={`arrow${catDropOpen ? " open" : ""}`}>▾</span>
                  </button>
                  {catDropOpen && (
                    <div className="cat-menu">
                      <div className={`cat-item${filterCat === "all" ? " selected" : ""}`} onClick={() => { setFilterCat("all"); setCatDropOpen(false); }}>All Categories</div>
                      {categories.map(c => (
                        <div key={c} className={`cat-item${filterCat === c ? " selected" : ""}`} onClick={() => { setFilterCat(c); setCatDropOpen(false); }}>{c}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="search-wrap">
                  <span className="search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input type="text" placeholder="Search items by name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            )}

            {/* Empty state */}
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <p className="empty-title">No menu items yet</p>
                <p className="empty-sub">Click below to add your first item to {outletName}.</p>
                <button className="btn-empty-add" onClick={openAddModal}>+ Add Your First Item</button>
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="no-results">No items match your search.</div>
            ) : (
              Object.entries(grouped).map(([cat, catItems]) => (
                <div className="cat-section" key={cat}>
                  <h2 className="cat-heading">{cat}</h2>
                  <div className="cat-card">
                    {catItems.map((item, idx) => (
                      <div key={item.id} className={`item-row${removing === item.id ? " removing" : ""}`} style={{ animationDelay:`${idx*0.06}s` }}>
                      <div className="item-img-wrap" style={{
  background: (() => {
    const colors = ["#FFF3EE","#f0faf0","#EEF4FF","#FFF9DB","#F3F0FF","#FFF0F6"];
    let h = 0; for (let c of item.name) h = item.name.charCodeAt(0) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  })()
}}>
  <span style={{
    fontSize:"24px", fontWeight:"800", letterSpacing:"1px",
    color: (() => {
      const colors = ["#C94D1E","#2E8B3A","#3B5BDB","#E67700","#7048E8","#C2255C"];
      let h = 0; for (let c of item.name) h = item.name.charCodeAt(0) + ((h << 5) - h);
      return colors[Math.abs(h) % colors.length];
    })()
  }}>
    {item.name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join("")}
  </span>
</div>
                        <div className="item-info">
                          <div>
                            <p className="item-name">{item.name}</p>
                            <p className="item-price">₹{item.price}</p>
                          </div>
                          <div className="item-loc">
                            <div>{item.location}</div>
                            <div>{item.university}</div>
                          </div>
                        </div>
                        <div className="item-actions">
                          <div className="action-btns">
                            <button className="btn-edit"   onClick={() => openEditModal(item)}>Edit</button>
                            <button className="btn-remove" onClick={() => removeItem(item)}>Remove</button>
                          </div>
                          <div className="avail-row">
                            <div className={`toggle-track ${item.available ? "on" : "off"}`} onClick={() => toggleAvailable(item)} title={item.available ? "Mark unavailable" : "Mark available"}>
                              <span className="toggle-thumb" />
                            </div>
                            <span className="avail-label">{item.available ? "Available" : "Unavailable"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="modal-title">{editingItem ? "Edit Item" : "Add New Item"}</h2>
            <p className="modal-sub">{editingItem ? `Editing "${editingItem.name}"` : `Add a new item to ${outletName}.`}</p>

            {fireErr && <div className="m-fire-err">⚠ {fireErr}</div>}

            {/* Category */}
            <div className="m-field">
              <label>Category</label>
              {categories.length > 0 && (
                <>
                  <select
                    value={form.category}
                    className={formErr.category && !catInput ? "err" : ""}
                    onChange={e => { setForm(p => ({...p, category: e.target.value})); setFormErr(p => ({...p, category: null})); }}
                    style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center" }}
                  >
                    <option value="">Select existing category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="cat-or">— or type a new category below —</p>
                </>
              )}
              <input
                className={`new-cat-input${formErr.category && !form.category && !catInput ? " err" : ""}`}
                type="text"
                placeholder={categories.length > 0 ? "New category name..." : "e.g. Rice Dishes, Beverages..."}
                value={catInput}
                onChange={e => { setCatInput(e.target.value); setFormErr(p => ({...p, category: null})); }}
              />
              {formErr.category && <span className="m-err">⚠ {formErr.category}</span>}
            </div>

            {/* Item Name */}
            <div className="m-field">
              <label>Item Name</label>
              <input type="text" placeholder="e.g. Chicken Biryani"
                value={form.name} className={formErr.name ? "err" : ""}
                onChange={e => { setForm(p => ({...p, name: e.target.value})); setFormErr(p => ({...p, name: null})); }} />
              {formErr.name && <span className="m-err">⚠ {formErr.name}</span>}
            </div>

            {/* Price */}
            <div className="m-field">
              <label>Price (₹)</label>
              <div className="price-wrap">
                <span className="price-prefix">₹</span>
                <input type="number" placeholder="0" min="1"
                  value={form.price} className={formErr.price ? "err" : ""}
                  onChange={e => { setForm(p => ({...p, price: e.target.value})); setFormErr(p => ({...p, price: null})); }} />
              </div>
              {formErr.price && <span className="m-err">⚠ {formErr.price}</span>}
            </div>

            {/* Image — UI only, not stored in Firestore for now */}
            <div className="m-field">
              <label>Image <span style={{fontWeight:400,color:"#888"}}>(optional)</span></label>
              <div className="logo-row">
                <span className={`logo-fake${imgName ? " filled" : ""}`}>{imgName || "Choose image..."}</span>
                <button className="btn-upload" onClick={() => fileRef.current.click()}>Upload</button>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                  onChange={e => { const f = e.target.files[0]; if(f){setForm(p=>({...p,image:f}));setImgName(f.name);} }} />
              </div>
            </div>

            <button className="btn-modal-submit" onClick={handleSubmit} disabled={saving}>
              {saving ? <><div className="spinner" /> Saving...</> : (editingItem ? "Save Changes" : "Add")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
