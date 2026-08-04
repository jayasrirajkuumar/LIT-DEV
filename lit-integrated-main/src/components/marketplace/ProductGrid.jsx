import React, { memo } from "react";

import { motion } from "framer-motion";

import ProductCard from "./ProductCard";



const containerVariants = {

  hidden: { opacity: 0 },

  visible: {

    opacity: 1,

    transition: { staggerChildren: 0.08, delayChildren: 0.12 },

  },

};



const itemVariants = {

  hidden: { opacity: 0, y: 20, scale: 0.97 },

  visible: {

    opacity: 1,

    y: 0,

    scale: 1,

    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },

  },

};



const ProductGrid = memo(({

  products,

  title = "Fresh Arrivals",

  showTitle = true,

  className = "",

  titleClassName = "mp-section-title",

  variant = "default",

}) => (

  <motion.section

    className={`mp-products-section ${className}`.trim()}

    initial="hidden"

    whileInView="visible"

    viewport={{ once: true, margin: "-60px" }}

    variants={containerVariants}

  >

    {showTitle && (

      <motion.h2

        className={titleClassName}

        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}

      >

        {title}

      </motion.h2>

    )}

    <div className="mp-product-list-container">

      <div className="mp-product-grid">

        {products.map((product) => (

          <motion.div key={product.id} variants={itemVariants}>

            <ProductCard product={product} variant={variant} />

          </motion.div>

        ))}

      </div>

    </div>

  </motion.section>

));



ProductGrid.displayName = "ProductGrid";



export default ProductGrid;

