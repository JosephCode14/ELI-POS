import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KioskPrinterStatus from "./PrinterStatusComponent/KioskPrinterStatus";
import PrinterStatusModal from "./PrinterStatusComponent/PrinterStatusModal";
const OrderNumber = () => {
  const location = useLocation();
  const orderNumber = location.state.orderNumber;
  const mop = location.state.mop;
  const { idleTime } = location.state;

  const [connectionModal, setConnectionModal] = useState(false);
  const navigate = useNavigate();

  const handleToMainScreen = () => {
    navigate("/kiosk-main");
  };

  const idleTimeLimit = 1 * parseFloat(idleTime) * 1000;
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
          <div className="order-ty-container">
            <h1>Thank You!</h1>
          </div>
          <div className="your-num-container">
            <h1>YOUR ORDER NUMBER IS</h1>
            <h1 className="kiosk-order-num">{orderNumber}</h1>
          </div>
          <div className="px-5">
            <hr />
          </div>
          <div className="kiosk-proceed-container">
            {mop == "counter" ? (
              <>
                <h1>
                  Please proceed to cashier <br />
                  for payment
                </h1>
              </>
            ) : null}
          </div>
          <div className="kiosk-start-new">
            <button onClick={handleToMainScreen}>Start New Order</button>
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

export default OrderNumber;
