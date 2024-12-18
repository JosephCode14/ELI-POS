import React, { useState, useRef, useEffect } from "react";
import rfid from "../../assets/icon/rfid_logo.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import { Modal, Form } from "react-bootstrap";
import swal from "sweetalert";
import { useLocation, useNavigate } from "react-router-dom";
import KioskPrinterStatus from "./PrinterStatusComponent/KioskPrinterStatus";
import PrinterStatusModal from "./PrinterStatusComponent/PrinterStatusModal";
const KioskTapCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const [rfidNum, setRfidNum] = useState(null);
  const [modalPin, setModalPin] = useState(false);
  // const [modalInfo, setModalInfo] = useState(false);
  const [studInfo, setStudentInfo] = useState(null);
  const [pin, setPin] = useState("");
  const [validated, setValidated] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const { idleTime } = location.state;

  const [connectionModal, setConnectionModal] = useState(false);

  // useEffect(() => {
  //   inputRef.current.focus();
  // }, []);
  const handleChange = (e, index) => {
    const newValue = e.target.value;
    // Check if the input is a number para maprevent ang NaN
    if (!isNaN(newValue)) {
      setPin((prevPin) => {
        const updatedPin = prevPin.split("");
        updatedPin[index] = newValue;
        return updatedPin.join("");
      });

      // para magmove ang focus ng input sa kasunod na input
      if (index < 3 && newValue !== "") {
        inputRefs[index + 1].current.focus();
      }
    }
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
      axios
        .post(`${BASE_URL}/student/checkpinKiosk`, {
          rfidNum,
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
            });
          } else if (res.status === 201) {
            swal({
              icon: "error",
              title: "Incorrect PIN",
              text: "Your inputted PIN is incorrect.",
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

  const handleGetRFID = async (value) => {
    try {
      // const value = event.target.value;

      setRfidNum(value);
      const res = await axios.get(BASE_URL + "/student/checkStudBalance", {
        params: {
          rfidNum: value,
        },
      });

      if (res.status === 200) {
        setStudentInfo(res.data);
        swal({
          title: `Hello ${res.data.student.first_name} ${res.data.student.last_name} your current balance is ${res.data.balance}`,
          text: `Proceed to order?`,
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
            navigate("/kiosk-order-type", {
              state: {
                idleTime,
              },
              // state: {
              //   studentBalance: res.data.balance,
              //   rfid: event.target.value,
              //   directKiosk: false,
              // },
            });
          } else if (value === "NO") {
            navigate("/kiosk-main");
          } else {
            swal.close();
          }
        });
      } else if (res.status === 201) {
        swal({
          title: "You dont have any balance!",
          text: "You can top up your card at the cashier",
          icon: "error",
          button: "OK",
          timer: parseFloat(idleTime) * 1000,
        }).then(() => {
          setRfidNum("");
          // inputRef.current.focus();
        });
      } else if (res.status === 204) {
        swal({
          title: "No user account found!",
          text: "Your card is not registered on the system.",
          icon: "error",
          button: "OK",
          timer: parseFloat(idleTime) * 1000,
        }).then(() => {
          setRfidNum("");
          // inputRef.current.focus();
        });
      } else if (res.status == 208) {
        swal({
          icon: "error",
          title: "This card is no longer valid!",
          text: "Please try another RFID card.",
          timer: parseFloat(idleTime) * 1000,
        }).then(() => {
          setRfidNum("");
        });
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const handleCloseModalPin = () => {
    setModalPin(false);
    setRfidNum("");
    // setStudentID("");
    // inputRef.current.focus();
  };

  const handleBack = () => {
    navigate("/kiosk-check", {
      state: {
        idleTime,
      },
    });
  };

  // useEffect(() => {
  //   const handleClick = () => {
  //     if (inputRef.current) {
  //       inputRef.current.focus();
  //     }
  //   };

  //   document.addEventListener("click", handleClick);

  //   return () => {
  //     document.removeEventListener("click", handleClick);
  //   };
  // }, []);

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
        <div className="selection-container btn-below">
          <div className="">
            <i class="bx bx-arrow-back kiosk-back" onClick={handleBack}></i>
          </div>
          <div className="d-flex h-75 flex-column justify-content-center">
            <div className="kiosk-summary-title">
              <h1>Tap Card</h1>
            </div>

            <div className="kiosk-tap-card">
              <h1>Please tap the card on the NFC scanner</h1>
              <img src={rfid} />
              <h1 className="ellipsis">...</h1>
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
          </div>
        </div>
      </div>
      {/* Modal PIN */}
      <Modal show={modalPin}>
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

      {/* <Modal show={modalInfo}>
        <Modal.Body>
          <h1>Your Balance is : {studInfo ? studInfo.balance : ""}</h1>
        </Modal.Body>
      </Modal> */}

      <KioskPrinterStatus setConnectionModal={setConnectionModal} />

      <PrinterStatusModal
        connectionModal={connectionModal}
        setConnectionModal={setConnectionModal}
      />
    </>
  );
};

export default KioskTapCard;
