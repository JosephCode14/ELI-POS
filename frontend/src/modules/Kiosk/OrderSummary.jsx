import React, { useEffect, useRef, useState } from "react";
import rfid from "../../assets/icon/rfid_logo.png";
import axios from "axios";
import { Modal, Form } from "react-bootstrap";
import swal from "sweetalert";
import BASE_URL from "../../assets/global/url";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CircularProgress from "@mui/material/CircularProgress";
import ReactLoading from "react-loading";
import { useWebSocket } from "../../contexts/WebSocketProvider";
import KioskPrinterStatus from "./PrinterStatusComponent/KioskPrinterStatus";
import PrinterStatusModal from "./PrinterStatusComponent/PrinterStatusModal";

const OrderSummary = () => {
  const inputRef = useRef(null);
  const [subtotal, setSubtotal] = useState(0);
  const [rfidNum, setRfidNum] = useState(null);
  const [modalPin, setModalPin] = useState(false);
  const [userId, setuserId] = useState("");

  const [pin, setPin] = useState(["", "", "", ""]);
  // const [pin, setPin] = useState("");
  const [validated, setValidated] = useState(false);
  const [studentID, setStudentID] = useState("");
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const [loading, setLoading] = useState(false);
  const [loadingPIN, setLoadingPIN] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { cart, orderType, totalOrder, ProductMenu, idleTime } = location.state;

  const [connectionModal, setConnectionModal] = useState(false);
  // rfid, directKiosk

  useEffect(() => {
    console.log("PIN", pin);
    console.log("PIN Length", pin.length);
  }, [pin]);

  const handleChange = (e, index) => {
    const newValue = e.target.value;

    if (!isNaN(newValue) && newValue.length <= 1) {
      setPin((prevPin) => {
        const updatedPin = [...prevPin];
        updatedPin[index] = newValue;
        return updatedPin;
      });

      // Move focus to the next field
      if (newValue !== "" && index < 3) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      setPin((prevPin) => {
        const updatedPin = [...prevPin];
        // Clear the current field only
        updatedPin[index] = "";
        return updatedPin;
      });

      // Move focus backward only if the current field is empty and not the first field
      if (index > 0 && pin[index] === "") {
        inputRefs[index - 1].current.focus();
      }
    }
  };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  const handleBack = () => {
    navigate("/kiosk", {
      state: {
        cart,
        idleTime,
        orderType: orderType.orderType,
      },
    });
  };

  const handleCancelOrder = async () => {
    swal({
      title: `Are you sure you want to cancel this order?`,
      icon: "warning",
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
    }).then(async (value) => {
      if (value === "YES") {
        navigate("/kiosk-main");
      } else {
        swal.close();
      }
    });
  };

  let rfidBuffer = "";

  useEffect(() => {
    decodeToken();
    console.log("Cart", cart);
  }, []);

  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [modalPin]);

  const handleGetRFID2 = async (value) => {
    try {
      setLoading(true);

      const res = await axios.post(BASE_URL + "/order/checkBalanceKiosk", {
        rfidNum: value,
        subtotal: totalOrder,
        cart,
      });

      if (res.status === 200) {
        setLoading(false);
        setModalPin(true);
        setStudentID(res.data.student_id);
        setRfidNum(value);
      } else if (res.status === 201) {
        setLoading(false);
        swal({
          title: "No customer found!",
          text: "Your card is not registered on the system.",
          icon: "error",
          button: "OK",
        }).then(() => {
          setRfidNum("");
        });
      } else if (res.status === 202) {
        setLoading(false);
        swal({
          title: "No credits",
          text: "Your card has no credit for this day.",
          icon: "error",
          button: "OK",
        }).then(() => {
          setRfidNum("");
        });
      } else if (res.status === 203) {
        setLoading(false);
        const mealType = res.data.mealType;
        if (mealType === "All Meals") {
          swal({
            title: "No credits",
            text: "Your card has no credit for any meal today.",
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
          });
        } else {
          swal({
            title: "No credits",
            text: `Your card has no credit for ${mealType.join(", ")}.`,
            icon: "error",
            button: "OK",
          }).then(() => {
            setRfidNum("");
          });
        }
      } else if (res.status === 204) {
        setLoading(false);
        swal({
          title: "Insufficient Balance!",
          text: "Your balance is not enough, change the order?",
          icon: "error",
          timer: parseFloat(idleTime) * 1000,
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
            navigate("/kiosk", {
              state: {
                totalOrder,
                orderType: orderType.orderType.orderType,
                cart,
                idleTime,
              },
            });
          } else {
            setRfidNum("");
            // inputRef.current.focus();
          }
        });
      } else if (res.status === 205) {
        setLoading(false);
        swal({
          title: "Non-scholar customer",
          text: "You're not a scholar.",
          icon: "error",
          button: "OK",
          timer: parseFloat(idleTime) * 1000,
        }).then(() => {
          setRfidNum("");
        });
      } else if (res.status === 206) {
        setLoading(false);
        swal({
          title: "Insufficient credits and balance",
          text: `No credits for all student meals and insufficient balance for non-student meals.`,
          icon: "error",
          button: "OK",
          timer: parseFloat(idleTime) * 1000,
        }).then(() => {
          setRfidNum("");
        });
      } else if (res.status === 207) {
        setLoading(false);
        swal({
          title: "Insufficient credits and balance",
          text: `No credits for ${res.data.insufficientMeals.join(
            ", "
          )} and insufficient balance for non-student meals. Your balance is ${
            res.data.studentBalance
          }.`,
          icon: "error",
          button: "OK",
          timer: parseFloat(idleTime) * 1000,
        }).then(() => {
          setRfidNum("");
        });
      } else if (res.status == 208) {
        setLoading(false);
        swal({
          icon: "error",
          title: "This card is no longer valid!",
          text: "Please try another RFID card.",
        }).then(() => {
          setRfidNum("");
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModalPin = () => {
    setModalPin(false);
    setRfidNum("");
    setPin("");
    // setStudentID("");
    // inputRef.current.focus();
  };

  const checkPin = async (e) => {
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
      const formatPin = pin.join("");
      setLoadingPIN(true);
      axios
        .post(`${BASE_URL}/student/checkpinKiosk`, {
          rfidNum,
          pin: formatPin,
        })
        .then((res) => {
          if (res.status === 200) {
            const studData = res.data.checkPIN;
            handleCheckout(studData);
            setLoadingPIN(false);
            swal({
              icon: "success",
              title: "Thank you!",
              timer: 3000,
              text: "Your order has been successfully processed.",
            }).then(() => {
              setValidated(false);
              setPin("");
              setModalPin(false);
            });
          } else if (res.status === 201) {
            setLoadingPIN(false);
            swal({
              icon: "error",
              title: "Incorrect PIN",
              timer: 3000,
              text: "The PIN you entered is incorrect",
            }).then(() => {
              setModalPin(true);
              setValidated(false);
              setPin("");
            });
          }
        });
    }
    setValidated(true);
  };

  const { printerStatusWeb, socket } = useWebSocket();

  // WebSocket
  // const [socket, setSocket] = useState(null);
  // const [printerStatus, setPrinterStatus] = useState("Unknown");
  // const [UserName, setUserName] = useState("");

  // useEffect(() => {
  //   console.log("Socket", socket);
  // }, [socket]);

  // useEffect(() => {
  //   const newSocket = new WebSocket("wss://dualtechpos.com:3443");

  //   newSocket.onopen = () => {
  //     console.log("Connected to WebSocket server");
  //     setSocket(newSocket);
  //   };

  //   newSocket.onmessage = (event) => {
  //     console.log("Received message from WebSocket:", event.data);
  //     if (event.data.startsWith("Printer status:")) {
  //       setPrinterStatus(event.data);
  //     }
  //     // alert("Response received: " + event.data);
  //   };

  //   newSocket.onclose = () => {
  //     console.log("WebSocket connection closed");
  //     // Implement reconnection logic here
  //   };

  //   newSocket.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //     setTimeout(() => {
  //       console.log("Attempting to reconnect...");
  //       setSocket(new WebSocket("wss://dualtechpos.com:3443"));
  //     }, 5000);
  //   };

  //   return () => {
  //     newSocket.close();
  //   };
  // }, []);

  // End of Web socket

  const handleCheckout = async (studentData) => {
    const transactionIds = cart.map((item) => item.transaction_id);

    console.log("Data", studentData);
    axios
      .post(BASE_URL + "/order/checkoutProcessKioskCardTEST", {
        // transactionIds: transactionIds,
        // orderTransacID,
        cart,
        totalOrder,
        // orderNumber,
        orderType,
        rfidNum,
        userId,
      })
      .then(async (res) => {
        if (res.status === 200) {
          navigate("/kiosk-order-number", {
            state: { orderNumber: res.data.num, idleTime },
          });

          console.log(res.data.num);

          if (socket && socket.readyState === WebSocket.OPEN) {
            // socket.send("TEST: Hello from the React app!");
            const cartWithoutImages = cart.map(
              ({ productImage, ...rest }) => rest
            );

            // Convert cart data to JSON string

            const combinedData = {
              cartWithoutImages,
              studentData,
              orderNumber: res.data.num,
              totalOrder: totalOrder,
              orderType: orderType,
              type: "kiosk",
            };
            const jsonData = JSON.stringify(combinedData);

            console.log("ORDER ", res.data.num);
            socket.send(jsonData);
            // alert("Message sent to the server. Waiting for response...");

            // Use the browser's printing capabilities
            if (window.testPrinterAndPrint) {
              const result = await window.testPrinterAndPrint();
              alert(result);
            } else {
              // alert("Printing functionality not available in this environment");
            }
          } else {
            console.log("WebSocket not connected");
            // alert("WebSocket not connected. Please try again later.");
          }
        } else if (res.status === 203) {
          swal({
            title: "Checkout Transaction Failed!",
            text: `1 Student Meal is allowed per order`,
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
  };

  // useEffect(() => {
  //   const handleClick = () => {
  //     console.log(rfidNum);
  //     if (inputRef.current) {
  //       inputRef.current.focus();
  //     }
  //   };

  //   document.addEventListener("click", handleClick);

  //   return () => {
  //     document.removeEventListener("click", handleClick);
  //   };
  // }, [rfidNum]);

  // Scan
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

        handleGetRFID2(decimalValue);
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
          <div className="d-flex align-items-center justify-content-between">
            <div className="">
              <i
                type="button"
                class="bx bx-arrow-back kiosk-back top-0"
                onClick={handleBack}
              ></i>
            </div>
            <button
              className="kiosk-payment-cancel text-bg-danger rounded-4 mx-4"
              onClick={handleCancelOrder}
            >
              <h1>Cancel Order</h1>
            </button>
          </div>
          <div className="kiosk-summary-title">
            <h1>Order Summary</h1>
          </div>
          <div className="kiosk-sum-table mb-5">
            <table
              className="kiosk-table shadow-sm rounded-4"
              style={{ height: "50vh" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e1f0ff" }}>
                  <th>QTY</th>
                  <th>ITEM NAME</th>
                  <th>PRICE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.product_inventory_id}-${item.variantKey}`}>
                    <td className="fw-normal">
                      <div className="order-qty">{item.quantity}</div>
                    </td>
                    <td className="fw-normal">
                      <div className="d-flex py-0 flex-column align-items-center justify-content-center">
                        <div className="">
                          <img
                            src={`data:image/png;base64,${item.productImage}`}
                            alt="product-image"
                            className="kiosk-cart-img"
                          />
                        </div>
                        <div className="">
                          <div className="order-qty">
                            <span>{item.name}</span>
                            {item.variantNames && (
                              <span
                                className="text-muted"
                                style={{ fontSize: "11px" }}
                              >
                                ({item.variantNames})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-normal">
                      &#8369;
                      {item.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="fw-normal text-danger">
                      {" "}
                      &#8369;
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
          <div className="px-5">
            <hr />
          </div>

          <div className="kiosk-sum-total">
            <h1>Total Payment</h1>
            <h1 className="sum-total">
              ₱
              {totalOrder
                ? totalOrder.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : ""}
            </h1>
          </div>
          <div className="kiosk-tap-card">
            {!loading ? (
              <>
                <h1>Please Tap the card</h1>
              </>
            ) : (
              <>
                <br></br>
                <h1>Please wait...</h1>
              </>
            )}

            {/* <img src={rfid} /> */}

            {!loading ? (
              <>
                <h1 className="ellipsis">...</h1>
              </>
            ) : (
              <>
                <i className="input-rfid mb-5">i</i>
                <br />

                {/* <CircularProgress size={60} className="mb-2" /> */}
                <ReactLoading
                  color="blue"
                  type={"spinningBubbles"}
                  height={"5%"}
                  width={"5%"}
                />
                <h1>Processing...</h1>
              </>
            )}
          </div>

          <div>
            <input
              type="text"
              className="mx-5 input-rfid"
              // style={{ fontSize: "10rem" }}
              ref={inputRef}
              value={rfidNum}
              // onChange={(e) => handleGetRFID2("12345")}
            />
          </div>
        </div>
        {/* <div className="kiosk-w-btn">
          <button type="button">PAY YOUR ORDER</button>
        </div> */}
      </div>

      <Modal show={modalPin} backdrop="static" centered>
        <Form noValidate validated={validated} onSubmit={checkPin}>
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
                      onKeyDown={(e) => {
                        handleKeyDown(e, index);
                      }}
                      required
                      ref={ref}
                      inputMode="numeric"
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

              {!loadingPIN ? (
                <>
                  <div className="buttonYes-cancel-section">
                    <button type="submit">Enter</button>

                    <button type="button" onClick={handleCloseModalPin}>
                      Cancel
                    </button>
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
                        // marginTop: "10px",
                        marginLeft: "5px",
                      }}
                    >
                      Loading. . .
                    </span>
                  </div>
                </>
              )}
            </div>
          </Modal.Body>
        </Form>
      </Modal>

      <KioskPrinterStatus setConnectionModal={setConnectionModal} />

      <PrinterStatusModal
        connectionModal={connectionModal}
        setConnectionModal={setConnectionModal}
      />
    </>
  );
};

export default OrderSummary;
