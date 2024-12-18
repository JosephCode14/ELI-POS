import React, { useEffect, useState, useRef } from "react";
import rfid from "../../assets/icon/rfid_logo.png";
import "../styles/checkout.css";
import "../styles/kiosk-main.css";
// import "../styles/pos_react.css";
import { Button, Modal, Form } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import swal from "sweetalert";
import useStoreIP from "../../stores/useStoreIP";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import useStoreCashier from "../../stores/useStoreCashier";
import { CashRegister, House, ArrowClockwise } from "@phosphor-icons/react";
import useStoreDetectedDevice from "../../stores/useStoreDetectedDevice";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";
import { useWebSocket } from "../../contexts/WebSocketProvider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

// import NoImage from "../../assets/image/eli-logo.png";
const OrderCheckOut = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const location = useLocation();
  const { cart, subtotal, orderType, transactionOrderId } =
    location.state || {};
  const [amount, setAmount] = useState("");
  const [received, setReceived] = useState(0);
  const [change, setChange] = useState(0);
  const [rfidNum, setRfidNum] = useState("");
  const [IdStudent, setStudentId] = useState("");
  const [userId, setuserId] = useState("");
  const [userType, setUserType] = useState("");
  const [userName, setUserName] = useState("");
  const [checkoutRemarks, setCheckoutRemarks] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [productInvName, setProductInvName] = useState("");
  const studentNumberRef = useRef(null);
  const checkOutRemarks = useRef(null);
  const inputRef = useRef(null);

  const [cashierPIN, setCashierPIN] = useState(0);
  const [isDrawerDisabled, setIsDrawerDisabled] = useState(false);
  const [pin, setPin] = useState("");
  const [validated, setValidated] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const [selectedPayment, setSelectedPayment] = useState("CASH");
  const [showPaymentContainer, setShowPaymentContainer] = useState(false);
  const [manualInputModal, setManualInputModal] = useState(false);
  const [showModalCard, setShowModalCard] = useState(false);
  const [showCalc, setShowCalc] = useState(true);
  const [isCheckoutButton, setIsCheckoutButton] = useState(true);
  const [showModalCheckout, setModalCheckout] = useState(false);

  const handleModalCheckout = () => setModalCheckout(true);
  //top up card modal
  const handleCloseModalCheckout = () => setModalCheckout(false);
  const handleCloseTopCard = () => {
    setShowModalCard(false);
    setRfidNum("");
    setStudentId("");
    setSelectedPayment("CASH");
    setIsDrawerDisabled(false);
  };
  //Manual input modal
  const handleCloseManualInput = () => {
    setManualInputModal(false);
    setStudentNumber("");
  };

  //function sa pagprint
  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const [printerStatus, setPrinterStatus] = useState({
    message: "No Printer Found",
    color: "orange",
  });

  const { setIP, ip } = useStoreIP(); // Ip for printer
  const { detectedDevice } = useStoreDetectedDevice();

  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip); //palitan ng ip address based sa ip ng printer
        setShowButtons(true);
        console.log("Attempting to connect to printer...");

        setPrinterStatus({
          message: "Connection Failed",
          color: "red",
        });
        await printer.connect();
        console.log("Successfully connected to printer");
        setPrinterInstance(printer);
        setIsPrinterReady(true);
        setShowButtons(false);
        setPrinterStatus({
          message: "Connected",
          color: "green",
        });
      } catch (error) {
        console.error("Failed to connect to printer:", error);
        setIsPrinterReady(false);
        setShowButtons(true);

        setPrinterStatus({
          message: "Connection Failed",
          color: "red",
        });
      }
    } else {
      console.error("IminPrinter library not loaded");
    }
  };

  const ensurePrinterConnection = async () => {
    if (!printerInstance || !isPrinterReady) {
      console.log("Printer not ready, attempting to reconnect...");
      setPrinterStatus({
        message: "No Printer Found",
        color: "orange",
      });

      setShowButtons(true);
      await initPrinter();
    }
  };

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

  function formatDateOnly(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

  const handleReceiptsClick = async (id) => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }
      let stud;
      let transac;
      if (IdStudent != null) {
        const transacRes = await axios.get(BASE_URL + "/order/get-transac", {
          params: {
            transacID: id,
          },
        });
        transac = transacRes.data;
        console.log(transac);
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
      await printerInstance.printText("BUON TAVOLO");
      await printerInstance.setTextStyle(0);

      await printerInstance.setTextSize(10);
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.setTextSize(28);
      await printerInstance.printText("Transaction Slip");

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
      for (const product of cart) {
        // const productName =
        //   product.variantNames !== ""
        //     ? `${product.name} (${product.variantNames})`
        //     : product.name;

        const productName = `${product.name}${
          product.variantNames && product.extraNeedingNames
            ? ` (${product.variantNames}, ${product.extraNeedingNames})`
            : product.variantNames
            ? ` (${product.variantNames})`
            : product.extraNeedingNames
            ? ` (${product.extraNeedingNames})`
            : ""
        }`;

        const price =
          product.price + product.variantPrice + product.extraNeedingPrice;

        await printerInstance.printColumnsText(
          [
            `${product.quantity}`,
            `${productName}`,
            `${price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            `${product.subtotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
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
        [
          "Total:",
          `${subtotal.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      if (stud) {
        await printerInstance.printColumnsText(
          [
            "Tap Card:",
            `${subtotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          ],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }

      const formattedAmount = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(stud ? subtotal : amount);

      await printerInstance.printColumnsText(
        ["Amount Tendered:", `${stud ? subtotal : amount}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        [
          "Change",
          `${change.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ],
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

      if (transac.remarks !== "") {
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

      const allStudentMeals = cart.every(
        (item) =>
          item.category.includes("Student Meal - Breakfast") ||
          item.category.includes("Student Meal - Lunch") ||
          item.category.includes("Student Meal - Dinner")
      );

      const printableOrderNotStudentMeal = cart.filter(
        (item) =>
          item.printable === true &&
          !(
            item.category.includes("Student Meal - Breakfast") ||
            item.category.includes("Student Meal - Lunch") ||
            item.category.includes("Student Meal - Dinner")
          )
      );

      const printableOrder = cart.filter((item) => item.printable == true);

      const studentMeal = printableOrder.filter(
        (item) =>
          item.category.includes("Student Meal - Breakfast") ||
          item.category.includes("Student Meal - Lunch") ||
          item.category.includes("Student Meal - Dinner")
      );

      let mealType = [];

      studentMeal.forEach((meal) => {
        if (
          meal.category.includes("Breakfast") &&
          !mealType.includes("Breakfast")
        ) {
          mealType.push("Breakfast");
        }
        if (meal.category.includes("Lunch") && !mealType.includes("Lunch")) {
          mealType.push("Lunch");
        }
        if (meal.category.includes("Dinner") && !mealType.includes("Dinner")) {
          mealType.push("Dinner");
        }
      });

      if (!allStudentMeals && printableOrderNotStudentMeal.length >= 1) {
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

        // Star of Food Stub

        if (studentMeal) {
          for (const meal of mealType) {
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
              [
                `Food Stub # ${transac.order_number}`,
                `${formatDateOnly(new Date(currentDate))}`,
              ],
              [1, 1],
              [0, 2],
              [22, 26],
              576
            );

            await printerInstance.setTextStyle(1);
            await printerInstance.setTextSize(70);
            await printerInstance.setAlignment(0);
            console.log("MEAL", meal);
            await printerInstance.printText(`${meal} - Meal`);
            await printerInstance.setAlignment(1);

            await printerInstance.setTextStyle(0);
            await printerInstance.setTextSize(25);
            await printerInstance.setAlignment(1);
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

            await printerInstance.printAndFeedPaper(20);
          }
        }
      } else {
        if (studentMeal) {
          for (const meal of mealType) {
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
              [
                `Food Stub # ${transac.order_number}`,
                `${formatDateOnly(new Date(currentDate))}`,
              ],
              [1, 1],
              [0, 2],
              [22, 26],
              576
            );

            await printerInstance.setTextStyle(1);
            await printerInstance.setTextSize(70);
            console.log("MEAL", meal);
            await printerInstance.printText(`${meal} - Meal`);
            await printerInstance.setAlignment(1);

            await printerInstance.setTextStyle(0);
            await printerInstance.setTextSize(25);
            await printerInstance.setAlignment(1);
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

            await printerInstance.printAndFeedPaper(20);
          }
        }
      }

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

  //WebSocket

  const { printerStatusWeb, socket } = useWebSocket();
  // const [socket, setSocket] = useState(null);
  // const [printerStatusWeb, setPrinterStatusWeb] = useState("Unknown");

  // useEffect(() => {
  //   const newSocket = new WebSocket("ws://localhost:8083");

  //   newSocket.onopen = () => {
  //     console.log("Connected to WebSocket server");
  //     setSocket(newSocket);
  //   };

  //   newSocket.onmessage = (event) => {
  //     console.log("Received message from WebSocket:", event.data);
  //     if (event.data.startsWith("Printer status:")) {
  //       setPrinterStatusWeb(event.data);
  //     }
  //     // alert("Response received: " + event.data);
  //   };

  //   newSocket.onclose = () => {
  //     console.log("WebSocket connection closed");
  //     // Implement reconnection logic here
  //     setTimeout(() => {
  //       console.log("Attempting to reconnect...");
  //       setSocket(new WebSocket("ws://localhost:8083"));
  //     }, 5000);
  //   };

  //   newSocket.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //   };

  //   return () => {
  //     newSocket.close();
  //   };
  // }, []);

  // End of Web socket

  const openCashDrawer = async () => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      await printerInstance.openCashBox();
      console.log("Cash drawer opened!");
    } catch (error) {
      console.error("Failed to open cash drawer:", error);
    }
  };
  //function sa pagprint

  //function sa pagback to ordering
  const handleBackClick = () => {
    navigate("/ordering", {
      state: {
        cart,
        subtotal,
        orderType,
        transactionOrderId,
      },
    });
  };

  const handleSelectedPayment = (selected) => {
    setSelectedPayment(selected);
    if (selected === "CARD") {
      setIsDrawerDisabled(true);
      setShowModalCard(true);
    } else {
      setShowCalc(true);
      setShowModalCard(false);
      setShowPaymentContainer(false);
      setIsDrawerDisabled(false);
    }
  };

  const handleManualInput = () => {
    setManualInputModal(true);
  };

  const handleCashierPIN = () => {
    setCashierPIN(true);
  };

  const handleCalcToggle = () => {
    setShowCalc(!showCalc);
  };

  const handleCalculator = (value) => {
    if (value === ".") {
      if (amount.includes(".")) {
        return;
      }
      if (amount === "" || amount === "0") {
        setAmount("0.");
      } else {
        setAmount(amount + ".");
      }
      return;
    }

    const newAmountStr = amount === "0" ? value : amount + value;
    const newAmount = parseFloat(newAmountStr);

    const limitedAmount = Math.min(newAmount, 10000000);
    const changeAmount = limitedAmount - subtotal;

    setAmount(limitedAmount.toString());
    setReceived(limitedAmount);
    setChange(changeAmount);

    setIsCheckoutButton(limitedAmount === 0 || limitedAmount < subtotal);
  };

  const handleDel = () => {
    const newAmountStr = amount.slice(0, -1);

    const newAmount = parseFloat(newAmountStr);

    setAmount(newAmountStr);
    setReceived(isNaN(newAmount) ? 0 : newAmount);
    const changeAmount = newAmount - subtotal;
    setChange(isNaN(changeAmount) ? 0 : changeAmount);

    setIsCheckoutButton(
      isNaN(newAmount) || newAmount === 0 || newAmount < subtotal
    );
  };

  //For function ng keyboard sa calculator
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (
        document.activeElement &&
        document.activeElement.type === "password"
      ) {
        return;
      }
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

  const handleCloseModalPin = () => {
    setCashierPIN(false);
  };

  const handleChange = (e, index) => {
    const newValue = e.target.value;
    if (!isNaN(newValue)) {
      setPin((prevPin) => {
        const updatedPin = prevPin.split("");
        updatedPin[index] = newValue;
        return updatedPin.join("");
      });

      if (index < 3 && newValue !== "") {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const checkPinCashier = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill in the red text fields.",
      });
    } else {
      axios
        .post(`${BASE_URL}/masterList/checkCashierPin`, {
          userId,
          pin,
        })
        .then((res) => {
          if (res.status === 200) {
            swal({
              icon: "success",
              title: "Correct PIN",
              text: "Your inputted PIN is correct.",
            }).then(() => {
              // handleCheckout();
              setValidated(false);
              setPin("");
              openCashDrawer();
              setCashierPIN(false);
            });
          } else if (res.status === 201) {
            swal({
              icon: "error",
              title: "Incorrect PIN",
              text: "Your inputted PIN is incorrect.",
            }).then(() => {
              setCashierPIN(true);
              setValidated(false);
              setPin("");
            });
          } else if (res.status === 202) {
            swal({
              icon: "error",
              title: "No User Found",
              text: "Your inputted PIN is not recognized.",
            }).then(() => {
              setCashierPIN(true);
              setValidated(false);
              setPin("");
            });
          }
        });
    }
    setValidated(true);
  };

  //for manual input checker
  const handleManualCheckInput = () => {
    axios
      .post(BASE_URL + "/order/checkStudentNumber", {
        studentNumber,
        subtotal,
        cart,
      })
      .then((res) => {
        if (res.status === 200) {
          setReceived(subtotal);
          setSelectedPayment("CARD");
          setShowPaymentContainer(true);
          handleCloseManualInput();
          setStudentId(res.data.studentId);
          setIsCheckoutButton(false);
          setIsDrawerDisabled(true);
          setChange(0);
          setAmount("");
          if (windowWidth < 1100) {
            setShowPaymentModal(true);
          }
        } else if (res.status === 201) {
          swal({
            title: "No customer found!",
            text: "This student number is not registered on the system.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            // handleCloseManualInput();
          });
        } else if (res.status === 202) {
          swal({
            title: "No credits",
            text: "This student has no credit for this day.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            // handleCloseManualInput();
          });
        } else if (res.status === 203) {
          const mealType = res.data.mealType;
          if (mealType === "All Meals") {
            swal({
              title: "No credits",
              text: "This student has no credit for any meal today.",
              icon: "error",
              button: "OK",
            }).then(() => {
              setStudentNumber("");
              // handleCloseManualInput();
            });
          } else {
            swal({
              title: "No credits",
              text: `This student has no credit for ${mealType.join(", ")}.`,
              icon: "error",
              button: "OK",
            }).then(() => {
              setStudentNumber("");
              // handleCloseManualInput();
            });
          }
        } else if (res.status === 204) {
          swal({
            title: "Insufficient Balance!",
            text: "The balance is not enough.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            // handleCloseManualInput();
          });
        } else if (res.status === 205) {
          swal({
            title: "Non-scholar customer",
            text: "The student number is non-scholar.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            // handleCloseManualInput();
          });
        } else if (res.status === 206) {
          swal({
            title: "Insufficient credits and balance",
            text: `No credits for all student meals and insufficient balance for non-student meals.`,
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            // handleCloseManualInput();
          });
        } else if (res.status === 207) {
          swal({
            title: "Insufficient credits and balance",
            text: `No credits for ${res.data.insufficientMeals.join(
              ", "
            )} and insufficient balance for non-student meals. Your balance is ${
              res.data.studentBalance
            }.`,
            icon: "error",
            button: "OK",
          }).then(() => {
            setStudentNumber("");
            // handleCloseManualInput();
          });
        }
      });
  };

  useEffect(() => {
    console.log("Socket", socket);
  }, [socket]);

  const handleCheckout = () => {
    if (selectedPayment === "CASH") {
      openCashDrawer();
    }

    if (transactionOrderId === "" || transactionOrderId === undefined) {
      // If transactionOrderId is null or undefined, use checkoutProcess
      setLoadingBtn(true);
      axios
        .post(BASE_URL + "/order/checkoutProcess", {
          cart,
          subtotal,
          orderType,
          received,
          change,
          rfidNum,
          IdStudent,
          userId,
          checkoutRemarks,
          studentNumber,
          selectedPayment,
        })
        .then(async (res) => {
          if (res.status === 200) {
            if (detectedDevice == "Android") {
              handleReceiptsClick(res.data.id);
            }

            if (socket && socket.readyState === WebSocket.OPEN) {
              // socket.send("TEST: Hello from the React app!");
              const cartWithoutImages = cart.map(
                ({ productImage, ...rest }) => rest
              );

              // Convert cart data to JSON string

              const combinedData = {
                cartWithoutImages,
                // studentData,
                orderNumber: res.data.orderNum,
                totalOrder: subtotal,
                orderType: orderType,
                type: "cashier",
              };
              const jsonData = JSON.stringify(combinedData);

              socket.send(jsonData);
              console.log("WEBSOCKET WORKING");
              // alert("Message sent to the server. Waiting for response...");

              // Use the browser's printing capabilities
              if (window.testPrinterAndPrint) {
                const result = await window.testPrinterAndPrint();
                alert(result);
              } else {
                // alert("Printing functionality not available in this environment");
              }
            } else {
              console.log("Websocket", socket);
              console.log("WebSocket not connected");
              // alert("WebSocket not connected. Please try again later.");
            }

            swal({
              title: `Checkout Transaction Successful!`,
              text: "The checkout has been successful.",
              icon: "success",
              button: "OK",
            }).then(() => {
              setLoadingBtn(false);
              navigate("/ordering", {
                state: {
                  cart: [],
                  subtotal: 0,
                  orderType: "",
                  transactionOrderId: "",
                },
              });
            });
          } else if (res.status === 201) {
            setLoadingBtn(false);
            swal({
              title: `Checkout Transaction Failed!`,
              text: "The checkout has been successful.",
              icon: "error",
              button: "OK",
            });
          } else if (res.status === 202) {
            setLoadingBtn(false);
            swal({
              title: `Checkout Transaction Failed`,
              text: "Payment method must be CARD when student meals are selected",
              icon: "error",
              button: "OK",
            });
          } else if (res.status === 203) {
            setLoadingBtn(false);
            swal({
              title: "Checkout Transaction Failed!",
              text: res.data.message,
              icon: "error",
              button: "OK",
            });
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            // Display swal for insufficient quantity
            swal({
              title: "Not enough quantity!",
              text: `The product ${error.response.data.productName} does not have enough quantity.`,
              icon: "error",
              button: "OK",
            });
          }
        });
    } else {
      setLoadingBtn(true);
      axios
        .post(BASE_URL + "/order/addOrderRecordCheckout", {
          transactionOrderId,
          cart,
          subtotal,
          orderType,
          received,
          change,
          rfidNum,
          IdStudent,
          userId,
          checkoutRemarks,
          studentNumber,
          selectedPayment,
        })
        .then((res) => {
          if (res.status === 200) {
            if (detectedDevice == "Android") {
              handleReceiptsClick(res.data.id);
            }
            swal({
              title: "Checkout Transaction Successful!",
              text: "The checkout has been successful.",
              icon: "success",
              button: "OK",
            }).then(() => {
              setLoadingBtn(false);
              navigate("/ordering", {
                state: {
                  cart: [],
                  subtotal: 0,
                  orderType: "",
                  transactionOrderId: "",
                },
              });
            });
          }
        });
    }
  };

  // const handleCheckout = () => {
  //   axios
  //     .post(BASE_URL + "/order/checkoutProcess", {
  //       cart,
  //       subtotal,
  //       orderType,
  //       received,
  //       change,
  //       rfidNum,
  //       IdStudent,
  //       userId,
  //       checkoutRemarks,
  //       studentNumber,
  //       selectedPayment,
  //     })
  //     .then((res) => {
  //       if (res.status === 200) {
  //         handleReceiptsClick(res.data.id);
  //         swal({
  //           title: "Checkout Transaction Successful!",
  //           text: "The checked out have been successful.",
  //           icon: "success",
  //           button: "OK",
  //         }).then(() => {
  //           navigate("/ordering", {
  //             state: {
  //               cart: [],
  //               subtotal: 0,
  //               orderType: "",
  //             },
  //           });
  //         });
  //       }
  //     });
  // };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
      setUserType(decoded.typeUser);
      setUserName(decoded.Fname);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  // useEffect(() => {
  //   if (showModalCard) {
  //     inputRef.current.focus();
  //   }
  // }, [showModalCard]);

  const handleGetRFID = (value) => {
    setIsLoading(true);
    axios
      .post(BASE_URL + "/order/checkStudentNumberCashier", {
        rfid: value,
        subtotal,
        cart,
      })
      .then((res) => {
        if (res.status === 200) {
          setIsLoading(false);
          setReceived(subtotal);
          setSelectedPayment("CARD");
          setShowPaymentContainer(true);
          setShowModalCard(false);
          setStudentId(res.data.studentId);
          setIsCheckoutButton(false);
          setIsDrawerDisabled(true);
        } else if (res.status === 201) {
          swal({
            title: "No customer found!",
            text: "This student number is not registered on the system.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
            setStudentId("");
            setIsLoading(false);
          });
        } else if (res.status === 202) {
          swal({
            title: "No credits",
            text: "This student has no credit for this day.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
            setStudentId("");
            setIsLoading(false);
          });
        } else if (res.status === 203) {
          const mealType = res.data.mealType;
          if (mealType === "All Meals") {
            swal({
              title: "No credits",
              text: "This student has no credit for any meal today.",
              icon: "error",
              button: "OK",
            }).then(() => {
              setRfidNum("");
              setStudentId("");
              setIsLoading(false);
            });
          } else {
            swal({
              title: "No credits",
              text: `This student has no credit for ${mealType.join(", ")}.`,
              icon: "error",
              button: "OK",
            }).then(() => {
              setRfidNum("");
              setStudentId("");
              setIsLoading(false);
            });
          }
        } else if (res.status === 204) {
          swal({
            title: "Insufficient Balance!",
            text: "The balance is not enough.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
            setStudentId("");
            setIsLoading(false);
          });
        } else if (res.status === 205) {
          swal({
            title: "Non-scholar customer",
            text: "The student number is non-scholar.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
            setStudentId("");
            setIsLoading(false);
          });
        } else if (res.status === 206) {
          swal({
            title: "Insufficient credits and balance",
            text: `No credits for all student meals and insufficient balance for non-student meals.`,
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
            setStudentId("");
            setIsLoading(false);
          });
        } else if (res.status === 207) {
          swal({
            title: "Insufficient credits and balance",
            text: `No credits for ${res.data.insufficientMeals.join(
              ", "
            )} and insufficient balance for non-student meals. Your balance is ${
              res.data.studentBalance
            }.`,
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
            setStudentId("");
            setIsLoading(false);
          });
        } else if (res.status == 208) {
          swal({
            icon: "error",
            title: "This card is no longer valid!",
            text: "Please try another RFID card.",
          }).then(() => {
            setRfidNum("");
            setStudentId("");
            setIsLoading(false);
          });
        }
      });
  };

  // Scaan
  const [serial, setSerial] = useState("");
  const [logs, setLogs] = useState([]);
  const log = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };
  /* global NDEFReader */
  const handleScan = async () => {
    log("User clicked scan button");

    if (!("NDEFReader" in window)) {
      log("NFC not supported on this device or browser.");
      return;
    }

    try {
      // eslint-disable-next-line no-undef
      const ndef = new NDEFReader();
      await ndef.scan();
      log("> Scan started");

      const handleReadingError = () => {
        log("Argh! Cannot read data from the NFC tag. Try another one?");
      };

      const handleReading = ({ message, serialNumber }) => {
        log(`> Serial Number: ${serialNumber}`);
        log(`> Records: (${message.records.length})`);

        setSerial(serialNumber);

        const cleanedSerial = serialNumber.replace(/:/g, "");
        const decimalValue = parseInt(cleanedSerial, 16);

        console.log(decimalValue.toString());

        setRfidNum(decimalValue);
        setReceived(0);
        setChange(0);

        handleGetRFID(decimalValue);
      };

      ndef.addEventListener("readingerror", handleReadingError);
      ndef.addEventListener("reading", handleReading);

      return () => {
        ndef.removeEventListener("readingerror", handleReadingError);
        ndef.removeEventListener("reading", handleReading);
      };
    } catch (error) {
      log("Argh! " + error);
      console.log(error);
    }
  };

  useEffect(() => {
    let cleanupScan;

    // Start NFC scan asynchronously
    const startScan = async () => {
      cleanupScan = await handleScan();
    };

    startScan();

    return () => {
      if (cleanupScan) {
        cleanupScan();
      }
    };
  }, []);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // For Tabs
  const [value, setValue] = useState(0);
  const handlePageChange = (event, newValue) => {
    setValue(newValue);
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

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
      <div className="checkout-container">
        <div className="head-checkout">
          <div className="check-title d-flex p-4 align-items-center justify-content-between flex-column flex-sm-row">
            <div className="d-flex align-items-center justify-content-center align-self-start align-self-sm-center me-3 py-0 mb-2 mb-sm-0">
              <i className="bx bx-chevron-left" onClick={handleBackClick}></i>
              <h2>Check Out</h2>
            </div>
            <div className="d-flex flex-row col-xl-5 col-xxl-6 p-0">
              {showButtons && (
                <div
                  className="d-flex p-0 justify-content-end loading-overlay-buttons"
                  style={{ width: "70%" }}
                >
                  <button onClick={() => window.location.reload()}>
                    <ArrowClockwise size={20} />
                    Refresh Page
                  </button>
                </div>
              )}
              <div className="d-flex p-0 align-items-center mx-3 fs-3 col-xl-6 col-xxl-4 justify-content-end text-nowrap">
                <span>
                  Printer Status:{" "}
                  <span
                    style={{
                      color: printerStatus.color,
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {printerStatus.message}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        {windowWidth < 1100 ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handlePageChange}
                aria-label="basic tabs"
              >
                <Tab label="Order Details" {...a11yProps(0)} />
                <Tab label="Payment Method" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <CustomTabPanel className="overflow-auto" value={value} index={0}>
              <div className="card w-100 checkout-order-details-container py-5 px-5">
                <div className="checkout-card-header">
                  <h2>Order Details</h2>
                  <h2>{orderType}</h2>
                </div>
                <br></br>
                <div className="orders-container">
                  <table>
                    <thead>
                      <tr>
                        <th>CATEGORY</th>
                        <th>QTY</th>
                        <th>ITEM NAME</th>
                        <th>SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr
                          key={`${item.product_inventory_id}-${item.variantKey}`}
                        >
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>
                            <div className="d-flex flex-column p-0">
                              <span>{item.name}</span>
                              {item.variantNames || item.extraNeedingNames ? (
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.variantNames && item.extraNeedingNames
                                    ? `(${item.variantNames}, ${item.extraNeedingNames})`
                                    : item.variantNames
                                    ? `(${item.variantNames})`
                                    : item.extraNeedingNames}
                                </span>
                              ) : (
                                <span></span>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.subtotal.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              {/* Discount */}
              <div className="card discount-container w-100 px-5 py-5">
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
                      onClick={() => {
                        handleSelectedPayment("CASH");
                        setReceived(0);
                        setIsCheckoutButton(true);
                        setIsDrawerDisabled(true);
                        setShowPaymentModal(true);
                      }}
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
                      onClick={() => {
                        if (selectedPayment == "CARD") {
                          return;
                        }
                        handleSelectedPayment("CARD");
                        setReceived(0);
                        setAmount("");
                        setChange(0);
                      }}
                    >
                      <h4>CARD</h4>
                    </div>
                  </div>
                  {/* <div className="sales mb-5" onClick={handleManualInput}>
                    <h4>MANUAL INPUT</h4>
                  </div> */}
                  <div className="d-flex justify-content-center p-0">
                    <div
                      className={`sales mb-5 ${
                        isDrawerDisabled ? "disabled" : ""
                      }`}
                      onClick={!isDrawerDisabled ? handleCashierPIN : null}
                      style={{
                        width: "50%",
                        borderRadius: "6px",
                        pointerEvents: isDrawerDisabled ? "none" : "auto",
                        opacity: isDrawerDisabled ? 0.5 : 1,
                        cursor: isDrawerDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <CashRegister size={32} />

                      <h4>OPEN CASH DRAWER</h4>
                    </div>
                  </div>
                </div>
                {/* Details */}
                <div className="payment-details p-2">
                  <h3>Payment Details</h3>

                  <div className="total-containers py-4">
                    {/* <div className="subtotal-container cont">
                  <h4>Subtotal</h4>
                  <div className="subtotal">

                  </div>
                </div> */}
                    <div className="discount-container cont">
                      <h4>Discount</h4>
                      <div className="discount">-</div>
                    </div>
                    <div className="payable-container cont">
                      <h4>Payable</h4>
                      <div className="payable">
                        ₱
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
            </CustomTabPanel>
          </>
        ) : (
          <>
            <div className="check-card d-flex m-3">
              {/* Order Details */}
              <div className="card checkout-order-details-container py-5 px-5">
                <div className="checkout-card-header">
                  <h2>Order Details</h2>
                  <h2>{orderType}</h2>
                </div>
                <br></br>
                <div className="orders-container">
                  <table>
                    <thead>
                      <tr>
                        <th>CATEGORY</th>
                        <th>QTY</th>
                        <th>ITEM NAME</th>
                        <th>SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr
                          key={`${item.product_inventory_id}-${item.variantKey}`}
                        >
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>
                            <div className="d-flex flex-column p-0">
                              <span>{item.name}</span>
                              {item.variantNames || item.extraNeedingNames ? (
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.variantNames && item.extraNeedingNames
                                    ? `(${item.variantNames}, ${item.extraNeedingNames})`
                                    : item.variantNames
                                    ? `(${item.variantNames})`
                                    : item.extraNeedingNames}
                                </span>
                              ) : (
                                <span></span>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.subtotal.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
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
                      onClick={() => {
                        handleSelectedPayment("CASH");
                        setReceived(0);
                        setIsCheckoutButton(true);
                        setIsDrawerDisabled(true);
                      }}
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
                      onClick={() => {
                        if (selectedPayment == "CARD") {
                          return;
                        }
                        handleSelectedPayment("CARD");
                        setReceived(0);
                        setAmount("");
                        setChange(0);
                      }}
                    >
                      <h4>CARD</h4>
                    </div>
                  </div>
                  {/* <div className="sales mb-5" onClick={handleManualInput}>
                    <h4>MANUAL INPUT</h4>
                  </div> */}
                  <div className="d-flex justify-content-center p-0">
                    <div
                      className={`sales mb-5 ${
                        isDrawerDisabled ? "disabled" : ""
                      }`}
                      onClick={!isDrawerDisabled ? handleCashierPIN : null}
                      style={{
                        width: "50%",
                        borderRadius: "6px",
                        pointerEvents: isDrawerDisabled ? "none" : "auto",
                        opacity: isDrawerDisabled ? 0.5 : 1,
                        cursor: isDrawerDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <CashRegister size={32} />

                      <h4>OPEN CASH DRAWER</h4>
                    </div>
                  </div>
                </div>
                {/* Details */}
                <div className="payment-details p-2">
                  <h3>Payment Details</h3>

                  <div className="total-containers py-4">
                    {/* <div className="subtotal-container cont">
                  <h4>Subtotal</h4>
                  <div className="subtotal">

                  </div>
                </div> */}
                    <div className="discount-container cont">
                      <h4>Discount</h4>
                      <div className="discount">-</div>
                    </div>
                    <div className="payable-container cont">
                      <h4>Payable</h4>
                      <div className="payable">
                        ₱
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
                          <td
                            style={{
                              borderTop: "0.1px solid rgb(228, 223, 223)",
                              borderBottom: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator("2")}
                          >
                            {" "}
                            2
                          </td>
                          <td
                            style={{
                              borderTop: "0.1px solid rgb(228, 223, 223)",
                              borderBottom: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator("3")}
                          >
                            3
                          </td>
                          <th
                            className="calc-gray-btn"
                            onClick={handleCalcToggle}
                          >
                            <img
                              width="32"
                              height="32"
                              src="https://img.icons8.com/ios-filled/50/expand-arrow--v1.png"
                              alt="expand-arrow--v1"
                            />
                          </th>
                        </tr>
                        <tr>
                          <td
                            style={{
                              borderLeft: "0.1px solid rgb(228, 223, 223)",
                              borderBottom: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator("4")}
                          >
                            4
                          </td>
                          <td
                            style={{
                              borderBottom: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator("5")}
                          >
                            5
                          </td>
                          <td
                            style={{
                              borderBottom: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator("6")}
                          >
                            6
                          </td>
                          <td className="calc-gray-btn" onClick={handleDel}>
                            <img
                              width="32"
                              height="32"
                              src="https://img.icons8.com/windows/32/clear-symbol.png"
                              alt="clear-symbol"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              borderLeft: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator("7")}
                          >
                            7
                          </td>
                          <td onClick={() => handleCalculator("8")}>8</td>
                          <td onClick={() => handleCalculator("9")}>9</td>
                          <td
                            className="calc-clear-btn"
                            rowSpan={2}
                            onClick={handleClear}
                          >
                            Clear
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="calc-left-last-button"
                            onClick={() => handleCalculator("0")}
                          >
                            0
                          </td>
                          <td
                            style={{
                              borderTop: "0.1px solid rgb(228, 223, 223)",
                              borderBottom: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator("00")}
                          >
                            00
                          </td>
                          <td
                            style={{
                              borderTop: "0.1px solid rgb(228, 223, 223)",
                              borderBottom: "0.1px solid rgb(228, 223, 223)",
                            }}
                            onClick={() => handleCalculator(".")}
                          >
                            .
                          </td>
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
            </div>
          </>
        )}
      </div>
      {/* Payment Modal */}
      <Modal show={showPaymentModal}>
        <Modal.Header>
          <Modal.Title className="w-100">
            <div className="payment-head py-0 pe-3 d-flex justify-content-between">
              <h2>Payment</h2>
              <div className="payable-container">
                <h4>-</h4>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-0">
          <div className="payment-discount">
            <div className="selected-payment">{selectedPayment}</div>
            <div className="amount-container">
              {(amount === "" ? 0 : parseFloat(amount).toLocaleString()) ||
                received}
            </div>
          </div>
          {/* Payment if CASH */}
          {selectedPayment === "CASH" && (
            <div className="card payment-container w-100 px-5 py-5">
              {showCalc && (
                <div className="calc-container w-100">
                  <table>
                    <tr>
                      <th onClick={() => handleCalculator("1")}>1</th>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("2")}
                      >
                        {" "}
                        2
                      </td>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("3")}
                      >
                        3
                      </td>
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
                      <td
                        style={{
                          borderLeft: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("4")}
                      >
                        4
                      </td>
                      <td
                        style={{
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("5")}
                      >
                        5
                      </td>
                      <td
                        style={{
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("6")}
                      >
                        6
                      </td>
                      <td className="calc-gray-btn" onClick={handleDel}>
                        <img
                          width="32"
                          height="32"
                          src="https://img.icons8.com/windows/32/clear-symbol.png"
                          alt="clear-symbol"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderLeft: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("7")}
                      >
                        7
                      </td>
                      <td onClick={() => handleCalculator("8")}>8</td>
                      <td onClick={() => handleCalculator("9")}>9</td>
                      <td
                        className="calc-clear-btn"
                        rowSpan={2}
                        onClick={handleClear}
                      >
                        Clear
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="calc-left-last-button"
                        onClick={() => handleCalculator("0")}
                      >
                        0
                      </td>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator("00")}
                      >
                        00
                      </td>
                      <td
                        style={{
                          borderTop: "0.1px solid rgb(228, 223, 223)",
                          borderBottom: "0.1px solid rgb(228, 223, 223)",
                        }}
                        onClick={() => handleCalculator(".")}
                      >
                        .
                      </td>
                    </tr>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payment if PIN is correct */}
          {showPaymentContainer && (
            <div className="payment-container w-100 px-3">
              <div className="payment-head">
                {/* <h2>Balance</h2> */}
                <div className="payable-container">
                  {/* <h4>{studentBalance}</h4> */}
                </div>
              </div>

              {/* <div className="payment-discount">
                <div className="selected-payment">{selectedPayment}</div>
                <div className="amount-container">{received}</div>
              </div> */}
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="mt-4">
          <button
            className="btn btn-danger fs-4 rounded-4"
            onClick={() => setShowPaymentModal(false)}
          >
            Cancel
          </button>
          <div className="order-checkout-btn">
            <button
              className="btn-checkout mt-0 fs-4 py-2 px-3"
              disabled={isCheckoutButton}
              style={{
                cursor: isCheckoutButton ? "not-allowed" : "pointer",
              }}
              onClick={handleModalCheckout}
            >
              Checkout
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Top card modal */}
      <Modal show={showModalCard} onHide={handleCloseTopCard}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Please Tap the card</h2>
            {!isLoading ? (
              <>
                <div className="modal-top-card-student">
                  <img src={rfid} />
                </div>
                <div>
                  <input
                    type="text"
                    className="mx-5 input-rfid"
                    // style={{ fontSize: "10rem" }}
                    ref={inputRef}
                    value={rfidNum}
                    // onChange={(e) => handleGetRFID("12345")}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="d-flex w-100 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"10%"}
                    width={"10%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      marginLeft: "5px",
                    }}
                  >
                    Please Wait. . .
                  </span>
                </div>
              </>
            )}
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
                placeholder="Description"
                onChange={(e) => setCheckoutRemarks(e.target.value)}
                value={checkoutRemarks}
              />
            </div>

            <div className="checkout-button-confirm">
              {!loadingBtn ? (
                <>
                  <button onClick={handleCheckout}>Confirm</button>
                </>
              ) : (
                <>
                  <div className="d-flex w-100 justify-content-end p-0">
                    <ReactLoading
                      color="blue"
                      type={"spinningBubbles"}
                      height={"10%"}
                      width={"10%"}
                    />
                    <span
                      style={{
                        fontSize: "2rem",
                        // marginTop: "10px",
                        marginLeft: "5px",
                      }}
                    >
                      Please wait. . .
                    </span>
                  </div>
                </>
              )}
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

      {/* Modal PIN */}
      <Modal show={cashierPIN}>
        <Form noValidate validated={validated} onSubmit={checkPinCashier}>
          <Modal.Body>
            <div className="student-pin-modal-container">
              <h2>Please Enter Your PIN</h2>
              <div className="pin-box-section">
                {inputRefs.map((ref, index) => (
                  <div className="first-form-control" key={index}>
                    <Form.Control
                      type="password"
                      value={pin[index] || ""}
                      onChange={(e) => handleChange(e, index)}
                      required
                      ref={ref}
                      className="no-eye"
                      style={{
                        height: "70px",
                        fontSize: "22px",
                        textAlign: "center",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="buttonYes-cancel-section">
                <button type="submit">Enter</button>
                <button type="button" onClick={handleCloseModalPin}>
                  Cancel
                </button>
              </div>
            </div>
          </Modal.Body>
        </Form>
      </Modal>
    </>
  );
};

export default OrderCheckOut;
