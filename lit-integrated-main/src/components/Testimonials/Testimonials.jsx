import React, { useRef } from "react";
import "./Testimonials.css";
import girlProfileFace from "../../assets/girl-profile-face.svg";
import boyProfileFace from "../../assets/boy-profile-face.svg";

const Testimonials = () => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      const scrollPosition =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const testimonials = [
    {
      name: "Aishwarya",
      text: "It hasn't even launched yet and I'm already obsessed. The energy, the ideas, the vision 👏",
      gender: "female",
    },
    {
      name: "Advik",
      text: "It's giving... next-gen. I just know this platform's going to blow up.",
      gender: "male",
    },
    {
      name: "Tarvika",
      text: "Can't wait for the e commerce platform to drop in",
      gender: "female",
    },
    {
      name: "Jay",
      text: "From what I've seen so far? Innovation + fun + community = LIT. Can't wait to try it.",
      gender: "male",
    },
    {
      name: "Nisha",
      text: "Their newsletter is so goood and fine.",
      gender: "female",
    },
    {
      name: "Vihan",
      text: "I've seen a sneak peek of the platform and let me tell you—this is going to change the game.",
      gender: "male",
    },
    {
      name: "Ishaan",
      text: "The design is so good, well curated🔥",
      gender: "male",
    },
  ];

  return (
    <section className="testimonials-container flex min-h-dvh w-full max-w-full flex-col justify-center px-[clamp(1rem,10vw,12rem)] py-16 max-sm:px-4" aria-labelledby="testimonials-title">
      <h1 id="testimonials-title" className="!mx-0 !w-full !max-w-none !px-0">What Our Users Say</h1>

      <div className="testimonials-slider-container w-full max-w-none">
        <button
          className="testimonial-nav-btn left"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <span>‹</span>
        </button>

        <div className="testimonials-scroll" ref={scrollContainerRef}>
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-card" key={index}>
              <div className={`testimonial-user-image ${testimonial.gender}`}>
                <img
                  src={
                    testimonial.gender === "female"
                      ? girlProfileFace
                      : boyProfileFace
                  }
                  alt={`${testimonial.name}'s profile`}
                  className="profile-svg"
                  id={testimonial.gender === "male" ? "male-image" : ""}
                />
              </div>
              <h3>{testimonial.name}</h3>
              <p>{testimonial.text}</p>
            </div>
          ))}
        </div>

        <button
          className="testimonial-nav-btn right"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <span>›</span>
        </button>
      </div>
    </section>
  );
};

export default Testimonials;
