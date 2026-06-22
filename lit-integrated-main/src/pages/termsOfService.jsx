import React from "react";
import "../styles/termsOfService.css";

const TermsOfService = () => {
  return (
    <div className="terms-of-service-page">
      <header className="terms-header">
        <div className="header-glow"></div>
        <p className="sub-heading">LEGAL & COMPLIANCE</p>
        <h1 className="terms-title">Terms of Service</h1>
      </header>

      <main className="terms-content">
        <p>
          Welcome to LIT. By using our website, services, or mobile
          applications, you agree to comply with and be bound by the following
          terms and conditions.
        </p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our platform, you acknowledge that you have
            read, understood, and agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2>2. Intellectual Property</h2>
          <p>
            All content, layout, designs, trademarks, logo brands, graphics, and
            gameplay features displayed on this site are the intellectual
            property of LIT or its licensors. You may not reproduce, distribute,
            or modify any assets without prior written consent.
          </p>
        </section>

        <section>
          <h2>3. User Account Security</h2>
          <ul>
            <li>
              You are responsible for keeping your account login details secure.
            </li>
            <li>
              All activities under your account are your sole responsibility.
            </li>
            <li>
              You must notify us immediately if you suspect unauthorized access.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. In-App Purchases & Billing</h2>
          <ul>
            <li>Prices and availability of products are subject to change.</li>
            <li>
              All payments are processed securely via approved third-party
              gateways.
            </li>
            <li>
              You agree to provide current, complete, and accurate billing and
              purchase information.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            LIT and its affiliates shall not be liable for any direct, indirect,
            incidental, or consequential damages resulting from your use of or
            inability to use the platform.
          </p>
        </section>

        <section>
          <h2>6. Amendments & Contact</h2>
          <p>
            We reserve the right to modify these terms at any time. Your
            continued use of the website following changes indicates your
            acceptance of the updated terms. If you have questions, please reach
            out to us at{" "}
            <a href="mailto:info@luxuryintaste.com">info@luxuryintaste.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsOfService;
