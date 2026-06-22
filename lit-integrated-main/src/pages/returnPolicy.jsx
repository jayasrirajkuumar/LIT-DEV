import React from "react";
import "../styles/returnPolicy.css";

const ReturnPolicy = () => {
  return (
    <div className="return-policy-page">
      <header className="policy-header">
        <div className="header-glow"></div>
        <p className="sub-heading">SHOPPING INFO</p>
        <h1 className="policy-title">Return Policy</h1>
      </header>

      <main className="policy-content">
        <p>
          At LIT, we stand behind the quality of our luxury items. If you are
          not fully satisfied with your purchase, we are here to help you with a
          return or exchange.
        </p>

        <section>
          <h2>1. Return Window</h2>
          <p>
            You have <strong>30 days</strong> from the date of delivery to
            request a return or exchange for eligible items.
          </p>
        </section>

        <section>
          <h2>2. Eligibility Criteria</h2>
          <p>To qualify for a full refund, please ensure that:</p>
          <ul>
            <li>The item is unused, unworn, and in its original packaging.</li>
            <li>
              All product tags, authenticity cards, and brand boxes remain
              intact.
            </li>
            <li>You provide the original receipt or proof of purchase.</li>
          </ul>
        </section>

        <section>
          <h2>3. Non-Returnable Items</h2>
          <p>Certain classes of items cannot be returned or refunded:</p>
          <ul>
            <li>Digital items, avatar purchases, and in-game collectibles.</li>
            <li>Custom-made or personalized luxury items.</li>
            <li>Opened beauty, fragrance, or personal care products.</li>
          </ul>
        </section>

        <section>
          <h2>4. Refund Processing</h2>
          <p>
            Once your return is received and thoroughly inspected by our quality
            control team, we will send you an email notification. Approved
            refunds will be credited back to your original payment method within{" "}
            <strong>5–7 business days</strong>.
          </p>
        </section>

        <section>
          <h2>5. Return Shipping</h2>
          <ul>
            <li>Standard return shipping is free for domestic orders.</li>
            <li>
              For international orders, shipping fees and import duties are the
              customer's responsibility.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>
            To initiate a return request, please contact our support team at{" "}
            <a href="mailto:info@luxuryintaste.com">info@luxuryintaste.com</a>{" "}
            with your order number.
          </p>
        </section>
      </main>
    </div>
  );
};

export default ReturnPolicy;
