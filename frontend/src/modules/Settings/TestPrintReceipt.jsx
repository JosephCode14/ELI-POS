import React, { useState, useEffect } from "react";
import axios from "axios";
import useStoreIP from "../../stores/useStoreIP";
import BASE_URL from "../../assets/global/url";
import swal from "sweetalert";
import useStoreDetectedDevice from "../../stores/useStoreDetectedDevice";
const TestPrintReceipt = () => {
  const [orders, setOrders] = useState([
    {
      quantity: 1,
      desc: "Adobo",
      price: 120.25,
      amount: 120.25,
    },
    {
      quantity: 1,
      desc: "Pata",
      price: 80.75,
      amount: 80.75,
    },
    {
      quantity: 2,
      desc: "Spag",
      price: 120.25,
      amount: 240.5,
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);

  const { setIP, ip } = useStoreIP();

  const { detectedDevice } = useStoreDetectedDevice();

  // For Ordering

  useEffect(() => {
    setIP(ip);
    console.log("IP From Menu", ip);
  }, [ip]);

  useEffect(() => {
    const handleFetchProfile = async () => {
      const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
      setIP(res.data.store_ip);
    };

    handleFetchProfile();
    console.log("Default", ip);
  }, []);

  const ensurePrinterConnection = async () => {
    if (!printerInstance || !isPrinterReady) {
      console.log("Printer not ready, attempting to reconnect...");
      await initPrinter();
    }
  };

  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip); //palitan ng ip address based sa ip ng printer
        console.log("Attempting to connect to printer...");
        swal({
          title: "Connecting",
          text: "Attempting to connect to printer..",
          icon: "warning",
          confirmButtonText: "OK",
        });
        await printer.connect();
        console.log("Successfully connected to printer");
        swal({
          title: "Connected",
          text: "Successfully connected to printer",
          icon: "success",
          confirmButtonText: "OK",
        });
        setPrinterInstance(printer);
        setIsPrinterReady(true);
      } catch (error) {
        /* eslint-enable no-console */
        console.error("Failed to connect to printer:", error);
        /* eslint-enable no-console */
        setIsPrinterReady(false);
      }
    } else {
      /* eslint-enable no-console */
      console.error("IminPrinter library not loaded");
      /* eslint-enable no-console */
    }
  };

  useEffect(() => {
    initPrinter();

    return () => {
      if (printerInstance) {
        printerInstance.close().catch((error) => {
          console.error("Error closing printer connection:", error);
        });
      }
    };
  }, []);

  const handleReceiptsClick = async () => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      console.log("Ddd", orders);
      await printerInstance.initPrinter();

      // Print header

      await printerInstance.setAlignment(1);

      await printerInstance.setTextSize(40);
      await printerInstance.setTextStyle(1);
      await printerInstance.printText("BUON TAVOLO");

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(10);
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.setTextSize(28);
      await printerInstance.printText("Transaction Slip");

      // Print order details

      await printerInstance.setAlignment(1);
      await printerInstance.setTextSize(28);
      // Spacing
      await printerInstance.printText(
        "                                                                     "
      );

      // Order NUmber
      await printerInstance.printColumnsText(
        ["Transaction Number:", `20240804C0002`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Terminal:", `Cashier`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Cashier:", `Sample Cashier Name`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Payment Method:", `${paymentMethod}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Trans. Date:", `12/25/2024, 10:45 AM`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );

      if (paymentMethod == "CARD") {
        await printerInstance.printColumnsText(
          ["ID No.:", `C-120-214`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Name:", `Sample Student`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Initial Balance:", `2000`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Remaining Balance:", `1558`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
      await printerInstance.printColumnsText(
        ["Qty", "Description", "Price", "Subtotal"],
        [1, 2, 1, 1],
        [0, 0, 0, 1],
        [28, 28, 28, 28],
        576
      );

      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );

      await printerInstance.printText(`Dine-in`);

      // Print product details
      for (const product of orders) {
        await printerInstance.printColumnsText(
          [
            `${product.quantity}`,
            `${product.desc}`,
            `${product.price}`,
            `${product.amount}`,
          ],
          [1, 2, 1, 1],
          [0, 0, 0, 1],
          [26, 26, 26, 26],
          576
        );
      }

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );

      await printerInstance.printColumnsText(
        ["Total:", `441.5`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      if (paymentMethod == "CARD") {
        await printerInstance.printColumnsText(
          ["Tap Card:", `${paymentMethod == "CARD" ? "441.5" : ""}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }
      await printerInstance.printColumnsText(
        ["Amount Tendered:", `${paymentMethod == "CARD" ? "441.5" : "500"}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Change", `${paymentMethod == "CARD" ? "0" : "58.5"}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );

      await printerInstance.setAlignment(0);
      await printerInstance.printText(`Remarks: Sample Remarks`);

      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText("This document is not valid");
      await printerInstance.printText("For claim of input tax");
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText("ELI IT Solutions 2024");

      await printerInstance.printText(
        "                                                                     "
      );

      await printerInstance.printAndFeedPaper(100);
      await printerInstance.partialCut();

      console.log("Printing completed successfully");
    } catch (error) {
      console.error("Failed to print receipt:", error);
    }
  };

  const handleClickReceipt = () => {
    if (detectedDevice == "Android") {
      handleReceiptsClick();
    } else {
      swal({
        icon: "warning",
        text: "Please test print in IMIN Device",
      });
    }
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to update the window width state
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  // Set up event listener for window resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <>
      <div className="receipt-test-container">
        <div className="receipt-test-head-container flex-column flex-sm-row">
          <div className="receipt-type-container gap-4 gap-xl-5 ms-0">
            <h2 className="text-nowrap">Payment Type:</h2>
            <select
              className={`form-select select-loyalty ${windowWidth < 769 && 'flex-fill'} me-0 me-sm-3 m-0`}
              aria-label="Default select example"
              value={paymentMethod}
              onChange={handlePaymentChange}
            >
              <option value="Customer Display" disabled>
                Select Mode of Payment
              </option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
            </select>
          </div>
          <div className="text-center" style={{ paddingTop: "20px" }}>
            <button
              className="btn btn-lg btn-outline-primary col-12 pe-5"
              onClick={handleClickReceipt}
            >
              PRINT RECEIPT
            </button>
          </div>
        </div>
        <div className="paper-container" style={{ paddingTop: windowWidth < 577 ? "15rem":"8.5rem" }}>
          <div className="receipt receipt-eighty">
            <div className={`receipt-title-name  cust-bold`}>
              <p className="cust-text text-dark mb-1">BUON TAVOLO</p>
            </div>
            <div className={`receipt-transac-title`}>
              <p className="text-dark mb-1">Transaction Slip</p>
            </div>

            <div className="cust-blank-line"></div>
            <div className={`bill-details-container `}>
              <div className="summary-container">
                <p className="mb-0">Transaction No.</p>
                <p className="mb-0">20240804C0002</p>
              </div>
              <div className="summary-container">
                <p className="mb-0">Terminal:</p>
                <p className="mb-0">Cashier</p>
              </div>
              <div className="summary-container">
                <p className="mb-0">Cashier:</p>
                <p className="mb-0">Sample Cashier Name</p>
              </div>
              <div className="summary-container">
                <p className="mb-0">Payment Method:</p>
                <p className="mb-0">{paymentMethod}</p>
              </div>
              <div className="summary-container">
                <p className="mb-0">Trans. Date:</p>
                <p className="mb-0">12/25/2024, 10:45 AM</p>
              </div>

              {paymentMethod == "CARD" ? (
                <>
                  <div className="summary-container">
                    <p className="mb-0">ID No.:</p>
                    <p className="mb-0">C-120-214</p>
                  </div>
                  <div className="summary-container">
                    <p className="mb-0">Name:</p>
                    <p className="mb-0">Sample Student</p>
                  </div>
                  <div className="summary-container">
                    <p className="mb-0">Initial Balance:</p>
                    <p className="mb-0">2000</p>
                  </div>
                  <div className="summary-container">
                    <p className="mb-0">Remaining Balance:</p>
                    <p className="mb-0">1558</p>
                  </div>
                </>
              ) : null}
            </div>
            <div className="dashed-receipt"></div>
            <div className={`receipt-order-header`}>
              <p className="cust-text">Qty</p>
              <p className="cust-text">Description</p>
              <p className="cust-text">Price</p>
              <p className="cust-text">Amount</p>
            </div>
            <div className="dashed-receipt"></div>
            <div className={`type-order-container`}>
              <p>Dine-In</p>
            </div>
            <div className={`receipt-order-body`}>
              {orders.map((order) => (
                <>
                  <div className="receipt-orders">
                    <p className="m-0">{order.quantity}</p>
                    <p className="m-0">{order.desc}</p>
                    <p className="m-0">{order.price}</p>
                    <p className="m-0">{order.amount}</p>
                  </div>
                </>
              ))}
            </div>
            <div className="dashed-receipt"></div>
            <div className={`total-summary-container`}>
              <div className="summary-container">
                <p className="mb-0">TOTAL </p>
                <p className="mb-0">441.5</p>
              </div>

              {paymentMethod == "CARD" ? (
                <>
                  <div className="summary-container">
                    <p className="mb-0">TAP CARD</p>
                    <p className="mb-0">441.5</p>
                  </div>
                </>
              ) : null}

              <div className="summary-container">
                <p className="mb-0"> Amount Tendered</p>
                <p className="mb-0">
                  {paymentMethod == "CASH" ? "500" : "441.5"}
                </p>
              </div>
              <div className="summary-container">
                <p>CHANGE</p>
                <p>{paymentMethod == "CASH" ? "58.5" : "0"}</p>
              </div>
            </div>
            <div className="dashed-receipt"></div>

            <div className="summary-container">
              <p className="mb-0">Remarks: </p>
              <p className="mb-0">Sample Remarks</p>
            </div>

            <div className="no-tax-container">
              <p className="mb-0"> This document is not valid</p>
              <p>For claim of input tax</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestPrintReceipt;
