import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useShopping } from "../../context/ShoppingContext";
import { useToast } from "../../context/ToastContext";
import PageShell from "../../components/layout/PageShell";
import { fetchCheckoutPreview, placeOrder } from "../../services/checkoutApiService";
import {
  createUserAddress,
  fetchUserAddresses,
} from "../../services/addressService";
import { formatCatalogPrice } from "../../utils/catalogFormat";
import "./MarketplaceCheckoutPage.css";

const STEPS = ["Shipping", "Delivery", "Review", "Payment", "Success"];

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  addressType: "HOME",
  isDefault: false,
};

const MarketplaceCheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, displayName, profileExtensions, userProfile } = useUserAuth();
  const { cart, refreshShopping } = useShopping();
  const { showToast } = useToast();

  const checkoutMode = searchParams.get("mode") === "buy_now" ? "buy_now" : "cart";
  const buyNowProductId = searchParams.get("productId") || "";
  const buyNowQuantity = Math.max(1, Number(searchParams.get("quantity") || 1));
  const isBuyNow = checkoutMode === "buy_now" && Boolean(buyNowProductId);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("STANDARD");
  const [couponCode, setCouponCode] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [placedOrder, setPlacedOrder] = useState(null);

  const addressDefaults = useMemo(
    () => ({
      fullName: displayName,
      phone: profileExtensions.phone || userProfile?.phone || "",
    }),
    [displayName, profileExtensions.phone, userProfile?.phone],
  );

  const checkoutParams = useMemo(
    () =>
      isBuyNow
        ? {
            checkoutMode: "buy_now",
            productId: buyNowProductId,
            quantity: buyNowQuantity,
          }
        : {},
    [isBuyNow, buyNowProductId, buyNowQuantity],
  );

  const loadCheckout = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [checkoutData, userAddresses] = await Promise.all([
        fetchCheckoutPreview({
          deliveryMethod,
          addressId: selectedAddressId || undefined,
          ...checkoutParams,
        }),
        fetchUserAddresses(),
      ]);
      setPreview(checkoutData);
      setAddresses(userAddresses);
      if (!selectedAddressId) {
        const defaultAddress =
          userAddresses.find((a) => a.isDefault)?.id || userAddresses[0]?.id || "";
        setSelectedAddressId(defaultAddress);
      }
    } catch (err) {
      setError(err.message || "Failed to load checkout.");
    } finally {
      setLoading(false);
    }
  }, [deliveryMethod, selectedAddressId, checkoutParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadCheckout();
  }, [isAuthenticated, loadCheckout]);

  useEffect(() => {
    if (isBuyNow) return;
    if (isAuthenticated && cart && cart.itemCount === 0 && step < 4) {
      navigate("/cart", { replace: true });
    }
  }, [cart, isAuthenticated, isBuyNow, navigate, step]);

  const refreshPreview = async (overrides = {}) => {
    const data = await fetchCheckoutPreview({
      deliveryMethod: overrides.deliveryMethod ?? deliveryMethod,
      addressId: overrides.addressId ?? selectedAddressId,
      couponCode: overrides.couponCode ?? couponCode,
      ...checkoutParams,
    });
    setPreview(data);
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const created = await createUserAddress(addressForm, addressDefaults);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setAddressForm(EMPTY_ADDRESS);
      await refreshPreview({ addressId: created.id });
      showToast("Address saved.");
    } catch (err) {
      showToast(err.message || "Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      setError("");
      const order = await placeOrder({
        addressId: selectedAddressId,
        deliveryMethod,
        paymentProvider: "MOCK",
        paymentMethod: "mock_card",
        couponCode: couponCode || null,
        giftMessage: giftMessage || null,
        orderNotes: orderNotes || null,
        ...(isBuyNow
          ? {
              checkoutMode: "buy_now",
              buyNow: { productId: buyNowProductId, quantity: buyNowQuantity },
            }
          : {}),
      });
      setPlacedOrder(order);
      await refreshShopping();
      setStep(4);
      showToast("Order placed successfully.");
    } catch (err) {
      setError(err.message || "Payment failed.");
      showToast(err.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  const backTo = isBuyNow ? "/shop" : "/cart";
  const backLabel = isBuyNow ? "Back to Shop" : "Back to Cart";

  if (!isAuthenticated) {
    return (
      <PageShell title="Checkout" backLabel={backLabel} backTo={backTo}>
        <div className="checkout-empty">
          <p>Please sign in to complete your purchase.</p>
          <Link to="/cart" className="lit-btn lit-btn--primary">Back to Cart</Link>
        </div>
      </PageShell>
    );
  }

  if (loading || !preview) {
    return (
      <PageShell backLabel={backLabel} backTo={backTo}>
        <div className="checkout-loading">
          <div className="lit-spinner" aria-hidden="true" />
          <p>Preparing checkout...</p>
        </div>
      </PageShell>
    );
  }

  const totals = preview.totals;
  const currency = preview.cart?.items?.[0]?.product?.currency || "INR";

  return (
    <PageShell
      title={isBuyNow ? "Buy Now Checkout" : "Checkout"}
      subtitle={
        isBuyNow
          ? "Checking out this item only — your saved cart stays unchanged."
          : "Complete your luxury purchase securely."
      }
      backLabel={backLabel}
      backTo={backTo}
      narrow
      className="checkout-page"
    >
      <div className="checkout-shell">
        <div className="checkout-progress">
          <div className="checkout-steps">
            {STEPS.map((label, index) => (
              <span
                key={label}
                className={`checkout-step ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
        </div>

        {error && <p className="checkout-error">{error}</p>}

        <div className="checkout-layout">
          <section className="checkout-main">
            {step === 0 && (
              <div className="checkout-panel">
                <h2 className="checkout-section-title">Shipping Address</h2>
                <div className="checkout-address-list">
                  {addresses.map((address) => (
                    <label key={address.id} className="checkout-address-card">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === address.id}
                        onChange={() => {
                          setSelectedAddressId(address.id);
                          refreshPreview({ addressId: address.id });
                        }}
                      />
                      <div>
                        <strong>{address.fullName}</strong>
                        {address.isDefault && <span className="checkout-badge">Default</span>}
                        <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country} · {address.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {!showAddressForm ? (
                  <button type="button" className="checkout-secondary-btn" onClick={() => setShowAddressForm(true)}>
                    Add New Address
                  </button>
                ) : (
                  <form className="checkout-address-form" onSubmit={handleAddAddress}>
                    {["fullName", "phone", "line1", "line2", "city", "state", "postalCode", "country"].map((field) => (
                      <label key={field}>
                        {field.replace(/([A-Z])/g, " $1")}
                        <input
                          value={addressForm[field]}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, [field]: e.target.value }))}
                          required={field !== "line2"}
                        />
                      </label>
                    ))}
                    <div className="checkout-form-actions">
                      <button type="submit" className="checkout-primary-btn" disabled={submitting}>Save Address</button>
                      <button type="button" className="checkout-secondary-btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}

                <div className="checkout-form-actions">
                  <button
                    type="button"
                    className="checkout-primary-btn"
                    disabled={!selectedAddressId}
                    onClick={() => setStep(1)}
                  >
                    Continue to Delivery
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="checkout-panel">
                <h2 className="checkout-section-title">Delivery Method</h2>
                <div className="checkout-delivery-options">
                  {preview.deliveryOptions.map((option) => (
                    <label key={option.id} className="checkout-delivery-card">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryMethod === option.id}
                        onChange={async () => {
                          setDeliveryMethod(option.id);
                          await refreshPreview({ deliveryMethod: option.id });
                        }}
                      />
                      <div>
                        <strong>{option.label}</strong>
                        <p>{option.estimate}</p>
                        <p>{formatCatalogPrice(option.charge, currency)}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="checkout-form-actions">
                  <button type="button" className="checkout-secondary-btn" onClick={() => setStep(0)}>Back</button>
                  <button type="button" className="checkout-primary-btn" onClick={() => setStep(2)}>Continue to Review</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-panel">
                <h2 className="checkout-section-title">Order Review</h2>
                <div className="checkout-review-items">
                  {preview.cart.items.map((item) => (
                    <div key={item.id} className="checkout-review-item">
                      <img src={item.product.primaryImage || "/placeholder-product.png"} alt={item.product.name} />
                      <div>
                        <strong>{item.product.name}</strong>
                        <p>Qty {item.quantity}</p>
                      </div>
                      <span>{formatCatalogPrice(Number(item.product.price) * item.quantity, currency)}</span>
                    </div>
                  ))}
                </div>

                <label className="checkout-field">
                  Coupon Code (placeholder)
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon" />
                </label>
                <label className="checkout-field">
                  Gift Message (placeholder)
                  <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} rows={2} />
                </label>
                <label className="checkout-field">
                  Order Notes
                  <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={2} />
                </label>

                <div className="checkout-form-actions">
                  <button type="button" className="checkout-secondary-btn" onClick={() => setStep(1)}>Back</button>
                  <button type="button" className="checkout-primary-btn" onClick={() => setStep(3)}>Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-panel">
                <h2 className="checkout-section-title">Payment</h2>
                <p className="checkout-payment-note">
                  Mock payment is enabled for development. Razorpay integration will replace this in production.
                </p>
                <div className="checkout-mock-payment">
                  <strong>Mock Card Payment</strong>
                  <p>Your order total will be charged in test mode and saved to PostgreSQL.</p>
                </div>
                <div className="checkout-form-actions">
                  <button type="button" className="checkout-secondary-btn" onClick={() => setStep(2)}>Back</button>
                  <button type="button" className="checkout-primary-btn" disabled={submitting} onClick={handlePlaceOrder}>
                    {submitting ? "Processing..." : "Pay & Place Order"}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && placedOrder && (
              <div className="checkout-panel checkout-success">
                <h2>Order Placed Successfully</h2>
                <p>Thank you for shopping with LIT.</p>
                <p><strong>Order Number:</strong> {placedOrder.orderNumber}</p>
                <p><strong>Total Paid:</strong> {formatCatalogPrice(Number(placedOrder.grandTotal), placedOrder.currency)}</p>
                <div className="checkout-form-actions">
                  <Link to={`/orders/${placedOrder.id}`} className="checkout-primary-btn">View Order</Link>
                  <Link to="/shop" className="checkout-secondary-btn">Continue Shopping</Link>
                </div>
              </div>
            )}
          </section>

          {step < 4 && (
            <aside className="checkout-summary">
              <h2 className="checkout-section-title">Order Summary</h2>
              <div className="checkout-summary-row"><span>Subtotal</span><span>{formatCatalogPrice(totals.subtotal, currency)}</span></div>
              <div className="checkout-summary-row"><span>Shipping</span><span>{formatCatalogPrice(totals.shippingCharge, currency)}</span></div>
              <div className="checkout-summary-row"><span>Tax (18% placeholder)</span><span>{formatCatalogPrice(totals.tax, currency)}</span></div>
              {totals.discount > 0 && (
                <div className="checkout-summary-row"><span>Discount</span><span>-{formatCatalogPrice(totals.discount, currency)}</span></div>
              )}
              <div className="checkout-summary-row total"><span>Total</span><span>{formatCatalogPrice(totals.grandTotal, currency)}</span></div>
              <p className="checkout-estimate">Estimated delivery: {totals.deliveryEstimate}</p>
            </aside>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default MarketplaceCheckoutPage;
