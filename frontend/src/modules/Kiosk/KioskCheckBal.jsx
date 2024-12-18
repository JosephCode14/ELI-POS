import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KioskPrinterStatus from "./PrinterStatusComponent/KioskPrinterStatus";
import PrinterStatusModal from "./PrinterStatusComponent/PrinterStatusModal";

const KioskCheckBal = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const location = useLocation();
  const { idleTime } = location.state;
  const idleTimeLimit = 1 * idleTime * 1000;

  const [connectionModal, setConnectionModal] = useState(false);

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
    navigate("/kiosk-order-type", {
      state: {
        idleTime,
      },
    });
  };
  const handleCheckBal = () => {
    navigate("/kiosk-tap", {
      state: {
        idleTime,
      },
    });
  };

  const handleBack = () => {
    navigate("/kiosk-main");
  };
  return (
    <>
      <div className="order-type-container">
        <div className="selection-container">
          <div className="">
            <i class="bx bx-arrow-back kiosk-back" onClick={handleBack}></i>
          </div>
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

      <KioskPrinterStatus setConnectionModal={setConnectionModal} />

      <PrinterStatusModal
        connectionModal={connectionModal}
        setConnectionModal={setConnectionModal}
      />
    </>
  );
};

export default KioskCheckBal;
