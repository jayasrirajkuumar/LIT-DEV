import React from "react";

import { Link } from "react-router-dom";

import emailIcon from "../../assets/email-logo.svg";

import linkedinIcon from "../../assets/linkedin-logo.svg";

import instagramIcon from "../../assets/instagram-logo.svg";

import "./MarketplaceLuxuryHome.css";



const LIT_LOGO = "/lit-logo.svg";



const FOOTER_LINKS = {

  shop: [

    { label: "Men", to: "/shop/products?gender=men" },

    { label: "Women", to: "/shop/products?gender=women" },

    { label: "Kids", to: "/shop/products?kids=true" },

    { label: "Brands", to: "/shop#brands" },

    { label: "Gift Cards", to: "/gift-cards" },

  ],

  company: [

    { label: "About", to: "/about" },

    { label: "Careers", to: "/contact" },

    { label: "Press", to: "/contact" },

    { label: "Sustainability", to: "/about" },

  ],

  support: [

    { label: "Contact Us", to: "/contact" },

    { label: "Shipping", to: "/returnpolicy" },

    { label: "Returns", to: "/returnpolicy" },

    { label: "Size Guide", to: "/shop/products" },

  ],

  legal: [

    { label: "Privacy Policy", to: "/privacy" },

    { label: "Terms of Service", to: "/terms" },

    { label: "Return Policy", to: "/returnpolicy" },

  ],

};



const MarketplaceFooter = () => (

  <footer className="mp-home-footer" id="footer-community-section">

    <div className="mp-home-footer__inner">

      <div className="mp-home-footer__brand">

        <img src={LIT_LOGO} alt="LIT Luxury In Taste" className="mp-home-footer__logo" />

        <p>

          Luxury In Taste — India&apos;s destination for authenticated luxury fashion, curated with

          precision and delivered with care.

        </p>

        <div className="mp-home-footer__social">

          <a href="mailto:info@luxuryintaste.com" aria-label="Email">

            <img src={emailIcon} alt="" />

          </a>

          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">

            <img src={linkedinIcon} alt="" />

          </a>

          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">

            <img src={instagramIcon} alt="" />

          </a>

        </div>

      </div>



      <div className="mp-home-footer__columns">

        <div>

          <h4>Shop</h4>

          <ul>

            {FOOTER_LINKS.shop.map((link) => (

              <li key={link.label}>

                <Link to={link.to}>{link.label}</Link>

              </li>

            ))}

          </ul>

        </div>

        <div>

          <h4>Company</h4>

          <ul>

            {FOOTER_LINKS.company.map((link) => (

              <li key={link.label}>

                <Link to={link.to}>{link.label}</Link>

              </li>

            ))}

          </ul>

        </div>

        <div>

          <h4>Support</h4>

          <ul>

            {FOOTER_LINKS.support.map((link) => (

              <li key={link.label}>

                <Link to={link.to}>{link.label}</Link>

              </li>

            ))}

          </ul>

        </div>

        <div>

          <h4>Legal</h4>

          <ul>

            {FOOTER_LINKS.legal.map((link) => (

              <li key={link.label}>

                <Link to={link.to}>{link.label}</Link>

              </li>

            ))}

          </ul>

        </div>

      </div>

    </div>



    <div className="mp-home-footer__divider" aria-hidden="true" />



    <div className="mp-home-footer__bottom">

      <div className="mp-home-footer__payments" aria-label="Accepted payment methods">

        <span>VISA</span>

        <span>MASTERCARD</span>

        <span>UPI</span>

        <span>AMEX</span>

        <span>RAZORPAY</span>

      </div>

      <div className="mp-home-footer__badges" aria-label="Store badges">

        <span className="mp-home-footer__badge">100% Authentic</span>

        <span className="mp-home-footer__badge">Premium Delivery</span>

        <span className="mp-home-footer__badge">Secure Checkout</span>

      </div>

      <p>© {new Date().getFullYear()} Luxury In Taste. All rights reserved.</p>

    </div>

  </footer>

);



export default MarketplaceFooter;

