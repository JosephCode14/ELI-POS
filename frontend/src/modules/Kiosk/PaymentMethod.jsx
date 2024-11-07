import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import eli_logo from "../../assets/image/eli-logo.png";

const PaymentMethod = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const {
    orderNumber,
    orderType,
    totalOrder,
    orderTransacID,
    // exceed,
    // rfid,
    // directKiosk,
  } = location.state;

  const handlePaymentMethod = async (payment) => {
    try {
      if (payment == "pay-at-counter") {
        navigate(`/kiosk-order-number`, {
          state: { orderNumber: orderNumber, mop: "counter" },
        });

        const resOrder = await axios.post(`${BASE_URL}/order/orderProcess`, {
          orderNumber,
          payment: "Pay at Counter",
          orderType,
          totalOrder,
        });

        console.log(resOrder.data);
      } else {
        navigate(`/kiosk-order-summary`, {
          state: {
            orderNumber: orderNumber,
            orderType: orderType,
            orderTransacID: orderTransacID,
            totalOrder: totalOrder,
            // rfid: rfid,
            // directKiosk: directKiosk,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <>
      <div className="order-type-container">
        <div className="selection-container">
          <div className="kiosk-logo-container  w-eli-logo">
            <div className="kiosk-img-logo  cont-eli-logo">
              <img src={eli_logo} className="eli-logo" />
            </div>
          </div>
          <div className="choose-type-container">
            <h1>PAYMENT METHOD</h1>
            {/* <div
              className="kiosk-dine-in"
              onClick={() => handlePaymentMethod("pay-at-counter")}
            >
              <h1 className="kiosk-payment-p">PAY AT COUNTER</h1>
            </div> */}

            <div
              className={`kiosk-take-out`}
              onClick={() => handlePaymentMethod("e-wallet")}
            >
              <h1 className="kiosk-payment-p">E-WALLET</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;
