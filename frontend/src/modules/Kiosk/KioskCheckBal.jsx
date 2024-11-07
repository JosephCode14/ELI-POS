import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const KioskCheckBal = () => {
  const navigate = useNavigate();

  const idleTimeLimit = 1 * 60 * 1000;
  const timeoutRef = useRef(null);

  const startIdleTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      navigate("/kiosk-main");
    }, idleTimeLimit);
  };

  useEffect(() => {
    const events = ["mousemove", "keypress", "scroll", "click"];

    events.forEach((event) => window.addEventListener(event, startIdleTimer));

    startIdleTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, startIdleTimer)
      );
    };
  }, [navigate]);

  const handleOrder = () => {
    navigate("/kiosk-order-type");
  };
  const handleCheckBal = () => {
    navigate("/kiosk-tap");
  };
  return (
    <>
      <div className="order-type-container">
        <div className="selection-container">
          <div className="kiosk-logo-container"></div>
          <div className="choose-type-container">
            <h1>CHOOSE ONE</h1>
            <div className="kiosk-dine-in" onClick={handleCheckBal}>
              <h1 className="kiosk-type-p">Check Balance</h1>
            </div>
            <h1>OR</h1>
            <div className="kiosk-take-out" onClick={handleOrder}>
              <h1 className="kiosk-type-p">Order</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KioskCheckBal;
