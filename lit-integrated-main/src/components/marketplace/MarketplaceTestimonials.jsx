import React from "react";

import { motion } from "framer-motion";

import { BadgeCheck, Star } from "lucide-react";

import "./MarketplaceLuxuryHome.css";



const TESTIMONIALS = [

  {

    id: 1,

    name: "Aishwarya R.",

    review: "The curation feels genuinely luxury — every piece arrived impeccably packaged and authentic.",

    rating: 5,

    initials: "AR",

  },

  {

    id: 2,

    name: "Advik M.",

    review: "Fast delivery, seamless checkout, and a storefront that finally matches the brands it carries.",

    rating: 5,

    initials: "AM",

  },

  {

    id: 3,

    name: "Tarvika S.",

    review: "From browsing to unboxing, LIT delivers a premium experience worthy of the maisons it represents.",

    rating: 5,

    initials: "TS",

  },

  {

    id: 4,

    name: "Jay K.",

    review: "Innovation meets elegance. This is the luxury marketplace India has been waiting for.",

    rating: 5,

    initials: "JK",

  },

  {

    id: 5,

    name: "Meera P.",

    review: "Verified products, white-glove service, and collections that feel truly exclusive.",

    rating: 5,

    initials: "MP",

  },

];



const TestimonialCard = ({ item }) => (

  <article className="mp-testimonial-card">

    <div className="mp-testimonial-card__header">

      <div className="mp-testimonial-card__avatar" aria-hidden="true">

        {item.initials}

      </div>

      <div className="mp-testimonial-card__meta">

        <h4>{item.name}</h4>

        <span className="mp-testimonial-card__verified">

          <BadgeCheck size={12} strokeWidth={2} />

          Verified Buyer

        </span>

      </div>

    </div>

    <div className="mp-testimonial-card__stars" aria-label={`${item.rating} out of 5 stars`}>

      {Array.from({ length: item.rating }).map((_, index) => (

        <Star key={index} size={13} fill="currentColor" strokeWidth={0} />

      ))}

    </div>

    <blockquote>&ldquo;{item.review}&rdquo;</blockquote>

  </article>

);



const MarketplaceTestimonials = () => {

  const trackItems = [...TESTIMONIALS, ...TESTIMONIALS];



  return (

    <section className="mp-testimonials-section" aria-label="Customer reviews">

      <div className="mp-luxury-section-header">

        <p className="mp-section-kicker">Client Stories</p>

        <h2 className="mp-section-heading">Customer Reviews</h2>

        <span className="mp-luxury-section-title__line" aria-hidden="true" />

      </div>



      <motion.div

        className="mp-testimonials-track-wrap"

        initial={{ opacity: 0 }}

        whileInView={{ opacity: 1 }}

        viewport={{ once: true, margin: "-40px" }}

        transition={{ duration: 0.6 }}

      >

        <div className="mp-testimonials-track">

          {trackItems.map((item, index) => (

            <TestimonialCard key={`${item.id}-${index}`} item={item} />

          ))}

        </div>

      </motion.div>

    </section>

  );

};



export default MarketplaceTestimonials;

