import React, { useEffect, useState, useRef } from "react";
import rfid from "../../assets/icon/rfid_logo.png";
import "../styles/checkout.css";
import "../styles/kiosk-main.css";
// import "../styles/pos_react.css";
import { Button, Modal, Form } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import swal from "sweetalert";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useStoreCashier from "../../stores/useStoreCashier";
import useStoreIP from "../../stores/useStoreIP";

const CashierCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const [rfidNum, setRfidNum] = useState(null);
  const [cartData, setCartData] = useState(location.state?.cartData || []);
  const [userId, setuserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [showManualDiscountModal, setShowManualDiscountModal] = useState(false);
  const [showModalCheckout, setModalCheckout] = useState(false);
  const [amount, setAmount] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("CASH");
  const [showPaymentContainer, setShowPaymentContainer] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [received, setReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [isCheckoutButton, setIsCheckoutButton] = useState(true);
  const [showModalCard, setShowModalCard] = useState(false);
  const [showCalc, setShowCalc] = useState(true);
  const [IdStudent, setStudentId] = useState(null);
  const [studentNumber, setStudentNumber] = useState("");
  const [manualInputModal, setManualInputModal] = useState(false);
  const [checkoutRemarks, setCheckoutRemarks] = useState("");
  const studentNumberRef = useRef(null);
  const checkOutRemarks = useRef(null);
  const {
    orderNumber,
    orderType,
    orderTransacID,
    columnTransacId,
    columnOrdernumber,
    selectedPage
  } = location.state;
  // const { setOrderNumber, setTransacNum, setBack } = useStoreCashier();

  useEffect(() => {
    if (location.state?.cartData) {
      setCartData(location.state.cartData);
    }
  }, [location.state]);

  useEffect(() => {
    const total = cartData.reduce((acc, item) => acc + item.subtotal, 0);
    setSubtotal(total);
  }, [cartData]);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
      setUserName(decoded.Fname);
      setUserType(decoded.typeUser);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  function formatDate(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

  //kailangan ma-store para mawala yung error sa pagclick ng back button
  const handleToOrdering = () => {
    navigate("/ordering", {
      state: {
        selectedPage
      }
    });
    // setBack(true);
    // setOrderNumber(orderNumber);
    // setTransacNum(orderTransacID);
  };
  //kailangan ma-store para mawala yung error sa pagclick ng back button

  const handleCalculator = (value) => {
    if (value === ".") {
      if (amount.includes(".")) {
        return;
      }
      if (amount === "0") {
        setAmount("0.");
      } else {
        setAmount(amount + ".");
      }
      return;
    }

    // Limit input to 7 digits
    if (amount.length >= 7) {
      return;
    }

    const newAmountStr = amount === "0" ? value : amount + value;
    const newAmount = parseFloat(newAmountStr);
    if (newAmount < 10000000) {
      setAmount(newAmountStr);
      setReceived(newAmount);
      const changeAmount = newAmount - subtotal;
      setChange(changeAmount);
      setIsCheckoutButton(newAmount < subtotal);
    }
  };

  const handleSelectedPayment = (selected) => {
    setSelectedPayment(selected);
    if (selected === "CARD") {
      setShowModalCard(true);
    } else {
      setShowCalc(true);
      setShowModalCard(false);
      setShowPaymentContainer(false);
    }
  };

  const handleManualInput = () => {
    setManualInputModal(true);
  };

  const handleDel = () => {
    if (amount.length === 0) {
      return; // Do nothing if amount is already empty
    }

    const newAmountStr = amount.slice(0, -1);

    // Handle case when newAmountStr becomes empty
    const newAmount = newAmountStr === "" ? 0 : parseFloat(newAmountStr);

    const limitedAmount = Math.min(newAmount, 1000000);
    const changeAmount = limitedAmount - subtotal;

    setAmount(newAmountStr);
    setReceived(limitedAmount);
    setChange(changeAmount);
    setIsCheckoutButton(limitedAmount < subtotal);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (
        selectedPayment !== "CARD" &&
        (!isNaN(key) || key === "." || key === "Backspace")
      ) {
        if (
          document.activeElement === studentNumberRef.current ||
          document.activeElement === checkOutRemarks.current
        )
          return;
        event.preventDefault();
        if (key === "Backspace") {
          handleDel();
        } else {
          handleCalculator(key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCalculator, handleDel, selectedPayment]);

  const handleClear = () => {
    setAmount("");
    setReceived(0);
    setChange(0);
    setIsCheckoutButton(true);
  };

  //function sa pagprint comment ko muna
  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);

  const { ip } = useStoreIP();

  const ensurePrinterConnection = async () => {
    if (!printerInstance || !isPrinterReady) {
      console.log("Printer not ready, attempting to reconnect...");
      await initPrinter();
    }
  };

  function formatDateOnly(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip); //palitan ng ip address based sa ip ng printer
        console.log("Attempting to connect to printer...");
        await printer.connect();
        console.log("Successfully connected to printer");
        setPrinterInstance(printer);
        setIsPrinterReady(true);
      } catch (error) {
        console.error("Failed to connect to printer:", error);
        setIsPrinterReady(false);
      }
    } else {
      console.error("IminPrinter library not loaded");
    }
  };

  useEffect(()=> {
console.log("CartData", cartData)
console.log("Amount", amount)
console.log("Remarks", checkoutRemarks)
  }, [cartData, amount, checkoutRemarks])

  const handleReceiptsClick = async (id) => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }
      let stud;
      let transac;
      console.log("ID", id)

      const transacRes = await axios.get(BASE_URL + "/order/get-transac", {
        params: {
          transacID: id,
        },
      });
      transac = transacRes.data;
      console.log("tRANSASC", transac);

      if (IdStudent != null) {
       
        const res = await axios.get(
          BASE_URL + "/orderRecords/fetchStudent-Ereceipt",
          {
            params: {
              id: IdStudent,
            },
          }
        );
        stud = res.data;
      }
      await printerInstance.initPrinter();
      await printerInstance.setAlignment(1);
      await printerInstance.setTextSize(40);
      await printerInstance.setTextStyle(1);
      await printerInstance.printText("DUALTECH");
      await printerInstance.setTextStyle(0);
      // await printerInstance.setTextSize(28);
      // await printerInstance.printText("sample@elogicinnovations.com");
      // Print order details
      await printerInstance.setAlignment(1);
      // Spacing
      await printerInstance.printText(
        "                                                                     "
      );
      // await printerInstance.printText("BILLING");
      // Order NUmber
      await printerInstance.printColumnsText(
        ["Transaction Number:", `${transac.order_number}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Terminal:", `${userType}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Cashier:", `${userName}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Payment Method:", `${selectedPayment}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });
      await printerInstance.printColumnsText(
        ["Transaction Date:", `${formatDate(new Date(currentDate))}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      if (stud) {
        await printerInstance.printColumnsText(
          ["ID No.:", `${stud.student.student_number}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Name:", `${stud.student.first_name} ${stud.student.last_name}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Initial Balance:", `${transac.purchased_balance}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Remaining Balance:", `${transac.purchased_balance - subtotal}`],
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
      await printerInstance.printText(`${orderType}`);
      // Print product details
      for (const product of cartData) {
        let variants = "";
        if (
          product.cart_specification_variants &&
          product.cart_specification_variants.length > 0
        ) {
          variants = `(${product.cart_specification_variants
            .map((variant) =>
              variant.specification_variant.variant_name === "Default_Regular"
                ? "Regular"
                : variant.specification_variant.variant_name
            )
            .join(", ")})`;
        }

        const productNameWithVariants = `${product.product_inventory.product.name} ${variants}`;

        await printerInstance.printColumnsText(
          [
            `${product.quantity}`,
            productNameWithVariants,
            `${product.product_inventory.product.price}`,
            `${product.subtotal}`,
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
        ["Total:", `${subtotal}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      if (stud) {
        await printerInstance.printColumnsText(
          ["Tap Card:", `${subtotal}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }
      await printerInstance.printColumnsText(
        ["Amount Tendered:", `${stud ? subtotal : transac.received_amount}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Change", `${change}`],
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

      if(transac.remarks !== "") {
        await printerInstance.setAlignment(0);
        await printerInstance.printText(`Remarks: ${transac.remarks}`);
      }
     
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
 
      await printerInstance.printAndFeedPaper(100);
      await printerInstance.partialCut();


      // Start of Styling Food STAB

      
      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
       await printerInstance.printText(
        "                                                                     "
      );
 
      await printerInstance.printColumnsText(
        ["Order #", `${formatDateOnly(new Date(currentDate))}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.setTextStyle(1);
      await printerInstance.setTextSize(70);
      await printerInstance.printText(`${transac.order_number}`);
      await printerInstance.setAlignment(1);

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(25);
      await printerInstance.setAlignment(1);
      // await printerInstance.printText(formatDateOnly(new Date(currentDate)));

      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
      await printerInstance.setAlignment(1);

      await printerInstance.printText(
        "                                                                     "
      );
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

  //discount modal
  const handleShowManualDiscModal = () => setShowManualDiscountModal(true);
  const handleCloseManualDiscModal = () => setShowManualDiscountModal(false);

  //checkout modal
  const handleModalCheckout = () => setModalCheckout(true);
  const handleCloseModalCheckout = () => setModalCheckout(false);

  const handleCloseTopCard = () => {
    setShowModalCard(false);
    setSelectedPayment("CASH");
  };

  useEffect(() => {
    if (showModalCard) {
      inputRef.current.focus();
    }
  }, [showModalCard]);

  const handleCalcToggle = () => {
    setShowCalc(!showCalc);
  };

  // const handleCheckout = () => {
  //   alert("WORKING");
  // };

  const handleCheckout = () => {
    axios
      .post(BASE_URL + "/order/checkoutOrderRecord", {
        columnTransacId,
        selectedPayment,
        subtotal,
        received,
        change,
        userId,
        IdStudent,
        checkoutRemarks,
      })
      .then((res) => {
        if (res.status === 200) {
          handleReceiptsClick(res.data.id);
          swal({
            title: "Checkout Transaction Successful!",
            text: "Checked out have been processed successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            navigate("/ordering", {
              state: {
                selectedPage
              }
            });
          });
        }
      });
  };

  const handleCloseManualInput = () => setManualInputModal(false);

  const handleManualCheckInput = () => {
    axios
      .post(BASE_URL + "/order/checkStudentNumber", {
        studentNumber,
        subtotal,
      })
      .then((res) => {
        if (res.status === 200) {
          setReceived(subtotal);
          setSelectedPayment("CARD");
          setShowPaymentContainer(true);
          handleCloseManualInput();
          setStudentId(res.data.studentId);
        } else if (res.status === 201) {
          swal({
            title: "Insufficient Balance!",
            text: "Your balance is not enough.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            handleCloseManualInput();
          });
        } else if (res.status === 204) {
          swal({
            title: "No customer found!",
            text: "Your student number is not registered on the system.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            handleCloseManualInput();
          });
        }
      });
  };

  const handleGetRFID = async (event) => {
    try {
      const value = event.target.value;

      setRfidNum(value);
      const res = await axios.get(BASE_URL + "/student/checkBalance", {
        params: {
          rfidNum: value,
          subtotal,
        },
      });

      if (res.status === 200) {
        // setStudentInfo(res.data);
        swal({
          title: `Proceed to order?`,
          buttons: {
            excel: {
              text: "YES",
              value: "YES",
              className: "--excel",
            },
            pdf: {
              text: "NO",
              value: "NO",
              className: "--pdf",
            },
          },
        }).then((value) => {
          if (value === "YES") {
            const balance = res.data.balance;
            setStudentId(res.data.student_id);
            setShowModalCard(false);
            setReceived(subtotal);
            setShowPaymentContainer(true);
          } else {
            handleCloseTopCard();
          }
        });
      } else if (res.status === 201) {
        swal({
          title: "Insufficient Balance!",
          text: "Your balance is not enough.",
          icon: "error",
          button: "OK",
        }).then(() => {
          setRfidNum("");
          handleCloseTopCard();
        });
      } else if (res.status === 204) {
        swal({
          title: "No user account found!",
          text: "Your card is not registered on the system.",
          icon: "error",
          button: "OK",
        }).then(() => {
          setRfidNum("");
          setShowModalCard(false);
          handleCloseTopCard();
        });
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };
  return (
    <>
      <div className="checkout-container">
        <div className="head-checkout">
          <div className="check-title d-flex p-4 align-items-center">
            {/* <Link to={"/void-transac"}> */}
            <i className="bx bx-chevron-left" onClick={handleToOrdering}></i>
            {/* </Link> */}
            <h2>Check Out</h2>
            <div className="icon-container">
              <i class="bx bxs-cog"></i>
            </div>
          </div>
        </div>
        <div className="check-card d-flex m-3">
          {/* Order Details */}
          <div className="card checkout-order-details-container py-5 px-5">
            <div className="checkout-card-header">
              <h2>Order Details</h2>
              <h2>{columnOrdernumber}</h2>
            </div>
            <br></br>
            <div className="orders-container">
              <table>
                <thead>
                  <tr>
                    <th>QTY</th>
                    <th>ITEM NAME</th>
                    <th>SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {cartData.map((c, index) => (
                    <>
                      <tr key={index}>
                        <td>{c.quantity}</td>
                        <td>
                          <div className="d-flex flex-column p-0">
                            <span>
                              {
                                c.product_inventory.product
                                  .name
                              }
                            </span>

                            {c.cart_specification_variants &&
                            c.cart_specification_variants.length > 0 ? (
                              <span style={{ fontSize: "10px" }}>
                                (
                                {c.cart_specification_variants
                                  .map((variant) =>
                                    variant.specification_variant
                                      .variant_name === "Default_Regular"
                                      ? "Regular"
                                      : variant.specification_variant
                                          .variant_name
                                  )
                                  .join(", ")}
                                )
                              </span>
                            ) : (
                              <span></span>
                            )}
                          </div>
                        </td>
                        <td>
                          {c.subtotal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discount */}
          <div className="card discount-container w-25 px-5 py-5">
            <div className="checkout-card-header">
              {/* <h2>Discount</h2> */}
            </div>

            {/* Special Disc */}
            <div className="special-disc">
              {/* <div className="special-disc-header">
                <h3>Special Discount</h3>
                <button className="btn btn-outline-primary rounded-1">
                  Add charge
                </button>
              </div>
              <div className="special-disc-selection">
                <div>
                  <h4>Promo Sales</h4>
                  <p>- ₱50.00</p>
                </div>
                <div>
                  <h4>PWD</h4>
                  <p>- 10%</p>
                </div>
                <div onClick={handleShowManualDiscModal}>
                  <h4>Manual</h4>
                  <p>Select Product</p>
                </div>
              </div> */}
            </div>
            {/* Method */}
            <div className="method">
              <div className="method-header">
                <h3>Payment Method</h3>
                {/* <button className="btn btn-outline-primary rounded-1">
                  {" "}
                  Open Cash Drawer{" "}
                </button> */}
              </div>
              <div className="special-disc-selection">
                <div
                  className={`sales  ${
                    selectedPayment == "CASH" ? "active" : ""
                  } `}
                  onClick={() => handleSelectedPayment("CASH")}
                >
                  <h4>CASH</h4>
                </div>

                {/* <div
                  className={`sales  ${
                    selectedPayment == "GCASH" ? "active" : ""
                  } `}
                  onClick={() => handleSelectedPayment("GCASH")}
                >
                  <h4>GCASH</h4>
                </div> */}

                <div
                  className={`sales  ${
                    selectedPayment == "CARD" ? "active" : ""
                  } `}
                  onClick={() => handleSelectedPayment("CARD")}
                >
                  <h4>CARD</h4>
                </div>
              </div>
              <div className="sales mb-5" onClick={handleManualInput}>
                <h4>MANUAL INPUT</h4>
              </div>
            </div>
            {/* Details */}
            <div className="payment-details p-2">
              <h3>Payment Details</h3>

              <div className="total-containers py-4">
                <div className="subtotal-container cont">
                  <h4>Subtotal</h4>
                  <div className="subtotal">
                    {subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="discount-container cont">
                  <h4>Discount</h4>
                  <div className="discount">-</div>
                </div>
                <div className="payable-container cont">
                  <h4>Payable</h4>
                  <div className="payable">
                    {subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="received-container cont">
                  <h4>Received</h4>
                  <div className="received">
                    {received.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="Change-container cont">
                  <h4>{change < 0 ? "To Pay" : "Change"}</h4>
                  <div className="change">
                    {Math.abs(change).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment if CASH */}
          {selectedPayment === "CASH" && (
            <div className="card payment-container px-5 py-5">
              <div className="payment-head">
                <h2>Payment</h2>
                <div className="payable-container">
                  <h4>-</h4>
                </div>
              </div>

              <div className="payment-discount">
                <div className="selected-payment">{selectedPayment}</div>
                <div className="amount-container">
                  {amount === "" ? 0 : parseFloat(amount).toLocaleString()}
                </div>
              </div>

              {showCalc && (
                <div className="calc-container">
                  <table>
                    <tr>
                      <th onClick={() => handleCalculator("1")}>1</th>
                      <th onClick={() => handleCalculator("2")}> 2</th>
                      <th onClick={() => handleCalculator("3")}>3</th>
                      <th className="calc-gray-btn" onClick={handleCalcToggle}>
                        <img
                          width="32"
                          height="32"
                          src="https://img.icons8.com/ios-filled/50/expand-arrow--v1.png"
                          alt="expand-arrow--v1"
                        />
                      </th>
                    </tr>
                    <tr>
                      <th onClick={() => handleCalculator("4")}>4</th>
                      <th onClick={() => handleCalculator("5")}>5</th>
                      <th onClick={() => handleCalculator("6")}>6</th>
                      <th className="calc-gray-btn" onClick={handleDel}>
                        <img
                          width="32"
                          height="32"
                          src="https://img.icons8.com/windows/32/clear-symbol.png"
                          alt="clear-symbol"
                        />
                      </th>
                    </tr>
                    <tr>
                      <th onClick={() => handleCalculator("7")}>7</th>
                      <th onClick={() => handleCalculator("8")}>8</th>
                      <th onClick={() => handleCalculator("9")}>9</th>
                      <th
                        className="calc-gray-btn"
                        rowSpan={2}
                        onClick={handleClear}
                      >
                        Clear
                      </th>
                    </tr>
                    <tr>
                      <th onClick={() => handleCalculator("0")}>0</th>
                      <th onClick={() => handleCalculator("00")}>00</th>
                      <th onClick={() => handleCalculator(".")}>.</th>
                    </tr>
                  </table>
                </div>
              )}

              <div className="order-checkout-btn">
                <button
                  className="btn-checkout"
                  disabled={isCheckoutButton}
                  style={{
                    cursor: isCheckoutButton ? "not-allowed" : "pointer",
                  }}
                  onClick={handleModalCheckout}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}

          {/* Payment if PIN is correct */}
          {showPaymentContainer && (
            <div className="payment-container px-3">
              <div className="payment-head">
                {/* <h2>Balance</h2> */}
                <div className="payable-container">
                  {/* <h4>{studentBalance}</h4> */}
                </div>
              </div>

              <div className="payment-discount">
                <div className="selected-payment">{selectedPayment}</div>
                <div className="amount-container">{received}</div>
              </div>
              <div
                id="message-container"
                style={{ color: "red", fontSize: "12px" }}
              ></div>
              <div className="calc-container">
                <table>
                  <tr>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>^</th>
                  </tr>
                  <tr>
                    <th>4</th>
                    <th>5</th>
                    <th>6</th>
                    <th>Del</th>
                  </tr>
                  <tr>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th rowSpan={2}>Clear</th>
                  </tr>
                  <tr>
                    <th>0</th>
                    <th>00</th>
                    <th>.</th>
                  </tr>
                </table>
              </div>

              <div className="order-checkout-btn">
                <button
                  className="btn-checkout"
                  // disabled={isCheckoutButton}
                  // style={{ cursor: isCheckoutButton ? "not-allowed" : "pointer" }}
                  onClick={handleModalCheckout}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top card modal */}
      <Modal show={showModalCard} onHide={handleCloseTopCard}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Please Tap the card</h2>
            <div className="modal-top-card-student">
              <img src={rfid} />
            </div>
            <div>
              <input
                type="text"
                className="mx-5 input-rfid"
                ref={inputRef}
                value={rfidNum}
                onChange={handleGetRFID}
              />
            </div>
            <div className="button-top-card"></div>
          </div>
        </Modal.Body>
      </Modal>

      {/* confirmation checkout modal */}
      <Modal show={showModalCheckout} onHide={handleCloseModalCheckout}>
        <Modal.Body>
          <div className="modal-checkout-containers">
            <h2>Checkout Confirmation</h2>
            <div className="paymentmethod-payable">
              <span>{selectedPayment}</span>
              <span>
                ₱
                {received.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="total-checkouts">
              <span>Total</span>
              <span>
                ₱
                {subtotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="mt-2">
              <Form.Label
                style={{
                  fontSize: "20px",
                }}
              >
                Remarks
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                style={{
                  fontSize: "16px",
                  height: "100px",
                  maxHeight: "100px",
                  resize: "none",
                  overflowY: "auto",
                }}
                ref={checkOutRemarks}
                name="description"
                onChange={(e) => setCheckoutRemarks(e.target.value)}
                value={checkoutRemarks}
              />
            </div>
            <div className="checkout-button-confirm">
              <button onClick={handleCheckout}>Confirm</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* manual input modal */}
      <Modal show={manualInputModal} onHide={handleCloseManualInput}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Please Input Student Number</h2>
            <div>
              <Form.Control
                type="text"
                className="fs-3 mb-2"
                ref={studentNumberRef}
                onChange={(e) => setStudentNumber(e.target.value)}
                value={studentNumber}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button variant="primary" onClick={handleManualCheckInput}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      {/* discount modal */}
      {/* <Modal show={showManualDiscountModal} onHide={handleCloseManualDiscModal}>
        <Modal.Header>
          <Modal.Title>
            <h2>Select Product To Apply Discount</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseManualDiscModal}>
            Cancel
          </Button>
          <Button variant="primary">Save</Button>
        </Modal.Footer>
      </Modal> */}
    </>
  );
};

export default CashierCheckout;
