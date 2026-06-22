import React, { useState } from "react";

const SubscriptionForm = ({
  inputClassName = "",
  buttonClassName = "",
  containerClassName = "",
}) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    // In a real app, you would send the email to a backend here
    setSubscribed(true);
    alert(`Thank you for subscribing with ${email}!`);
    setEmail(""); // Clear the input after submission
    setTimeout(() => setSubscribed(false), 2000);
  };

  return (
    <div className={containerClassName}>
      <input
        type="email"
        placeholder="Enter Your Email"
        className={inputClassName}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        disabled={subscribed}
      />
      <button
        className={buttonClassName}
        onClick={handleSubscribe}
        disabled={subscribed}
      >
        {subscribed ? "✔ Subscribed" : "Subscribe"}
      </button>
    </div>
  );
};

export default SubscriptionForm;
