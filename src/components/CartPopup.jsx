import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const IconCart    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconClose   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconTrash   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconLock    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconCheck   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconShield  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// Loads the Razorpay Checkout script once (skips if already loaded)
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) { existing.addEventListener("load", () => resolve(true)); return; }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function CartPopup({
  cartItems = [],
  onClose,
  onUpdateQty,
  onRemove,
  isLoggedIn = false,
  userDocId = "",
  onLoginClick,
  onClearCart,
  userName = "",
  userEmail = "",
  userPhone = "",
}) {
  const [paying, setPaying] = useState(false); // true while Razorpay checkout is open / processing
  const [placing, setPlacing] = useState(false); // true while order is being saved to Firestore
  const [success, setSuccess] = useState(false);

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  // Saves the order to Firestore. Only ever called AFTER Razorpay confirms payment success.
  const placeOrder = async (paymentId, razorpayOrderId) => {
    if (!isLoggedIn || !userDocId || cartItems.length === 0) return;
    setPlacing(true);
    try {
      await addDoc(collection(db, "User Login", userDocId, "Orders"), {
        items: cartItems.map(i => ({
          itemId: i.id, name: i.name, price: i.price,
          quantity: i.quantity, subtotal: i.price * i.quantity,
          restaurantName: i.restaurantName || "", outletName: i.outletName || "",
        })),
        totalAmount: total,
        status: "Placed",
        paymentMode: "Razorpay",
        paymentId: paymentId || null,
        razorpayOrderId: razorpayOrderId || null,
        placedAt: serverTimestamp(),
      });
      setPlacing(false);
      setPaying(false);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClearCart?.(); onClose?.(); }, 3500);
    } catch (err) {
      console.error("Order save error:", err);
      setPlacing(false);
      setPaying(false);
      alert(
        "Payment succeeded but saving your order failed. Please contact support with Payment ID: " +
        paymentId
      );
    }
  };

  // Opens Razorpay Checkout. Order is placed ONLY inside the success handler —
  // if payment fails or is cancelled, no order is created.
  const handlePayment = async () => {
    if (!isLoggedIn || !userDocId || cartItems.length === 0 || paying || placing) return;

    if (!RAZORPAY_KEY_ID) {
      alert("Payment is not configured yet. Add your Razorpay Test Key ID to the .env file as VITE_RAZORPAY_KEY_ID.");
      return;
    }

    setPaying(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaying(false);
      alert("Could not load the payment gateway. Please check your internet connection and try again.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(total * 100), // Razorpay expects the amount in paise
      currency: "INR",
      name: "Campus Bytee",
      description: `Order · ${totalQty} item${totalQty !== 1 ? "s" : ""}`,
      prefill: {
        name: userName || undefined,
        email: userEmail || undefined,
        contact: userPhone || undefined,
      },
      theme: { color: "#C94D1E" },
      handler: function (response) {
        // response.razorpay_payment_id is only present on a verified successful payment
        placeOrder(response.razorpay_payment_id, response.razorpay_order_id);
      },
      modal: {
        ondismiss: function () {
          setPaying(false); // user closed the popup without paying -> no order placed
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function () {
      setPaying(false);
      alert("Payment failed. Your order was not placed. Please try again.");
    });
    rzp.open();
  };


  const S = {
    overlay: {
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    popup: {
      background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "460px",
      maxHeight: "92vh", display: "flex", flexDirection: "column",
      boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden", position: "relative",
    },
    head: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px 12px", borderBottom: "1.5px solid #f0f0f0", flexShrink: 0,
    },
    headLeft: { display: "flex", alignItems: "center", gap: "10px" },
    headIcon: {
      width: "34px", height: "34px", borderRadius: "9px",
      background: "#FFF3EE", color: "#C94D1E",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    headTitle: {
      fontSize: "16px", fontWeight: 800, color: "#1a1a1a",
      letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: "8px",
    },
    badge: {
      background: "#C94D1E", color: "#fff", borderRadius: "20px",
      padding: "2px 9px", fontSize: "11px", fontWeight: 700,
    },
    closeBtn: {
      width: "32px", height: "32px", borderRadius: "8px",
      border: "1.5px solid #e8e8e8", background: "#fff", color: "#888",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    },
    body: { flex: 1, overflowY: "auto", padding: "0 16px" },
    empty: {
      textAlign: "center", padding: "48px 20px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
    },
    // Each item row
    item: {
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 0", borderBottom: "1px solid #f5f5f5",
    },
    // Name column — takes all free space, truncation OFF so full name shows
    itemInfo: { flex: 1, minWidth: 0 },
    itemName: { fontSize: "13px", fontWeight: 700, color: "#1a1a1a", wordBreak: "break-word" },
    itemMeta: { fontSize: "11px", color: "#b8b8b8", marginTop: "1px", wordBreak: "break-word" },
    // Stepper — fixed small width
    qty: {
      display: "flex", alignItems: "center",
      border: "1.5px solid #e0e0e0", borderRadius: "6px",
      overflow: "hidden", flexShrink: 0,
    },
    qtyBtn: {
      width: "22px", height: "22px", border: "none",
      background: "#f5f5f5", fontSize: "14px", fontWeight: 800,
      color: "#555", cursor: "pointer", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1,
    },
    qtyVal: {
      width: "22px", textAlign: "center", fontSize: "12px",
      fontWeight: 700, color: "#1a1a1a", background: "#fff", lineHeight: "22px",
    },
    itemPrice: {
      fontSize: "13px", fontWeight: 800, color: "#1a1a1a",
      minWidth: "38px", textAlign: "right", flexShrink: 0,
    },
    delBtn: {
      width: "24px", height: "24px", borderRadius: "5px",
      border: "1.5px solid #ececec", background: "#fff", color: "#bbb",
      cursor: "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0, padding: 0,
    },
    summary: { padding: "12px 0 4px", borderTop: "2px solid #f0f0f0", marginTop: "4px" },
    summaryRow: {
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "3px 0", fontSize: "12.5px", color: "#999",
    },
    totalRow: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0 0", fontSize: "16px", fontWeight: 800, color: "#1a1a1a",
      borderTop: "1.5px dashed #e8e8e8", marginTop: "8px",
    },
    foot: {
      padding: "12px 16px 16px", borderTop: "1.5px solid #f0f0f0",
      flexShrink: 0, display: "flex", flexDirection: "column", gap: "9px", background: "#fff",
    },
    payPanel: {
      border: "1.5px solid #ebebeb", borderRadius: "12px",
      padding: "11px 14px", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: "10px", background: "#fff",
    },
    payPanelLeft: { display: "flex", alignItems: "center", gap: "8px" },
    payPanelIcon: {
      width: "30px", height: "30px", borderRadius: "7px",
      background: "#FFF3EE", color: "#C94D1E",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    loginWarn: {
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
      background: "#FFF3EE", border: "1.5px solid #F4C4A8",
      borderRadius: "10px", padding: "10px 13px",
    },
    loginWarnLeft: { display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: 600, color: "#C94D1E" },
    loginBtn: {
      whiteSpace: "nowrap", background: "#C94D1E", color: "#fff",
      border: "none", borderRadius: "7px", padding: "7px 14px",
      fontSize: "13px", fontWeight: 700,
      fontFamily: "'Segoe UI', system-ui, sans-serif", cursor: "pointer",
    },
    orderBtn: (disabled) => ({
      width: "100%", padding: "13px",
      background: disabled ? "#ddd" : "#C94D1E",
      color: disabled ? "#aaa" : "#fff",
      border: "none", borderRadius: "10px",
      fontSize: "15px", fontWeight: 800, letterSpacing: "0.3px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 14px rgba(201,77,30,0.28)",
    }),
    successOverlay: {
      position: "absolute", inset: 0, background: "rgba(255,255,255,0.97)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: "14px", zIndex: 20, borderRadius: "18px",
    },
    successRing: {
      width: "84px", height: "84px", borderRadius: "50%",
      background: "#2E8B3A", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={S.popup}>

        {/* Header */}
        <div style={S.head}>
          <div style={S.headLeft}>
            <div style={S.headIcon}><IconCart /></div>
            <div style={S.headTitle}>
              Your Cart
              {cartItems.length > 0 && (
                <span style={S.badge}>{totalQty} item{totalQty !== 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose}><IconClose /></button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {cartItems.length === 0 ? (
            <div style={S.empty}>
              <div style={{ ...S.headIcon, width: 52, height: 52, borderRadius: 14, background: "#f5f5f5", color: "#ccc" }}><IconCart /></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#999" }}>Your cart is empty</div>
              <div style={{ fontSize: 12, color: "#bbb" }}>Add items from the menu to continue</div>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} style={S.item}>
                  {/* Full name, wraps if needed */}
                  <div style={S.itemInfo}>
                    <div style={S.itemName}>{item.name}</div>
                    {item.restaurantName && (
                      <div style={S.itemMeta}>
                        {item.restaurantName}{item.outletName ? ` · ${item.outletName}` : ""}
                      </div>
                    )}
                  </div>

                  {/* Small stepper */}
                  <div style={S.qty}>
                    <button style={S.qtyBtn} onClick={() => onUpdateQty?.(item.id, -1)}>−</button>
                    <span style={S.qtyVal}>{item.quantity}</span>
                    <button style={S.qtyBtn} onClick={() => onUpdateQty?.(item.id, +1)}>+</button>
                  </div>

                  <div style={S.itemPrice}>₹{item.price * item.quantity}</div>

                  {/* Small trash */}
                  <button style={S.delBtn} onClick={() => onRemove?.(item.id)} title="Remove">
                    <IconTrash />
                  </button>
                </div>
              ))}

              {/* Summary — no delivery row */}
              <div style={S.summary}>
                <div style={S.summaryRow}>
                  <span>Items ({totalQty})</span>
                  <span>₹{total}</span>
                </div>
                <div style={S.totalRow}>
                  <span>Total</span>
                  <span style={{ color: "#C94D1E" }}>₹{total}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={S.foot}>

            {/* Secure payment info panel */}
            <div style={S.payPanel}>
              <div style={S.payPanelLeft}>
                <div style={S.payPanelIcon}><IconShield /></div>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1a1a1a", textAlign: "left" }}>Secure payment via Razorpay</div>
                  <div style={{ fontSize: "11.5px", color: "#bbb", marginTop: "1px", textAlign: "left" }}>Cards, UPI, Netbanking & Wallets</div>
                </div>
              </div>
            </div>

            {/* Login / Pay button */}
            {!isLoggedIn ? (
              <div style={S.loginWarn}>
                <div style={S.loginWarnLeft}><IconLock /> Login required to place order</div>
                <button style={S.loginBtn} onClick={() => { onClose?.(); onLoginClick?.(); }}>Login</button>
              </div>
            ) : (
              <button
                style={S.orderBtn(placing || paying || cartItems.length === 0)}
                disabled={placing || paying || cartItems.length === 0}
                onClick={handlePayment}
              >
                {placing ? "Placing Order..." : paying ? "Processing Payment..." : `Pay ₹${total} & Place Order`}
              </button>
            )}
          </div>
        )}

        {/* Success overlay */}
        {success && (
          <div style={S.successOverlay}>
            <div style={S.successRing}><IconCheck /></div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: "#1a1a1a" }}>Order Placed! 🎉</div>
            <div style={{ fontSize: "13.5px", color: "#999" }}>Your order has been confirmed.</div>
          </div>
        )}

      </div>
    </div>
  );
}