import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/menu.css";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import {
  inventoryNav,
  productNav,
  reportsNav,
  settingsNav,
  userNav,
} from "../Sidebar/navs";
import { jwtDecode } from "jwt-decode";
import swal from "sweetalert2";
import swal1 from "sweetalert";
import useStoreUserType from "../../stores/useStoreUserType";
import { Modal, Button, Form } from "react-bootstrap";
import useStoreDetectedDevice from "../../stores/useStoreDetectedDevice";
import useStoreIP from "../../stores/useStoreIP";
import { useWebSocket } from "../../contexts/WebSocketProvider";
// import "../styles/pos_react.css";
const Menu = ({ authrztn }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [storeName, setStoreName] = useState("");
  const [storeStatus, setStoreStatus] = useState(null);
  const [userId, setuserId] = useState("");
  const [userName, setUserName] = useState("");
  const [endShiftCalcModal, setEndShiftCalcModal] = useState(false);
  const [startingAmount, setStartingAmount] = useState("0");
  const [focusedInput, setFocusedInput] = useState("amount");

  const isDashboardViewAuthorized = authrztn.includes("Dashboard-View");
  const isEReceiptViewAuthorized = authrztn.includes("EReceipt-View");
  const isOrderingViewAuthorized = authrztn.includes("Ordering-View");
  const isOrderingEnabled = isOrderingViewAuthorized && storeStatus;

  const { setDetectedDevice } = useStoreDetectedDevice();

  const typeSetter = useStoreUserType((state) => state.setTypeUser);
  const type = useStoreUserType((state) => state.typeUser);

  const isInventoryViewAuthorized = [
    "InventoryStock-View",
    "ReceivingStock-View",
    "OutboundingStock-View",
    "StockCounting-View",
  ].some((permission) => authrztn.includes(permission));
  const isProductCategoryViewAuthorized = [
    "Product-View",
    "Archive-View",
    "RawMaterial-View",
    "CookBook-View",
  ].some((permission) => authrztn.includes(permission));
  const isRFIDViewAuthorized = authrztn.includes("RFID-View");
  const isReportsViewAuthorized = [
    "InventoryReport-View",
    "RawInventoryReport-View",
    "POSReport-View",
    "RFIDReport-View",
    "BulkLoadReport-View",
    "StoreReport-View",
    "CustomerReport-View",
    "StudentCreditReport-View",
    "EndShiftReport-View",
    "StoreCloseReport-View",
    "GeneralReport-View",
    "WeekCreditReport-View",
  ].some((permission) => authrztn.includes(permission));
  const isUserViewAuthorized = [
    "CustomerList-View",
    "User-View",
    "UserRole-View",
    "UserTransaction-View",
    "UserTransaction-View",
    "WeeklyCredit-View",
  ].some((permission) => authrztn.includes(permission));
  const isSettingsViewAuthorized = [
    "MenuProfile-View",
    // "CustomizationReceipt-View",
    "Hardware-View",
    // "LossBack-View",
    // "Loyalty-View",
    "ProductExtra-View",
  ].some((permission) => authrztn.includes(permission));
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = currentTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreName(res.data.store_name || "ELI");
  };

  const handleFetchStatus = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchStatus`);
    setStoreStatus(res.data.status);
  };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
      typeSetter(decoded.typeUser);
      setUserName(decoded.Fname);
    }
  };

  useEffect(() => {
    console.log("Ttttyp", type);
  }, [type]);

  const { printerStatusWeb, socket } = useWebSocket();

  useEffect(() => {
    console.log("Socket", socket);
  }, [socket]);

  const handleCheckShift = () => {
    axios
      .post(BASE_URL + "/endshift/checkShift", null, {
        params: {
          userId,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          swal1({
            icon: "info",
            title: "Start Shift",
            text: "Would you like to start your shift?",
            buttons: {
              Yes: {
                text: "Yes",
                value: "Yes",
                className: "ordering-swal-yes-button",
              },
              No: {
                text: "No",
                value: "No",
                className: "ordering-swal-no-button",
              },
            },
          }).then((result) => {
            if (result === "Yes") {
              setEndShiftCalcModal(true);
            }
          });
        } else if (res.status === 201) {
          navigate("/ordering");
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    handleFetchProfile();
    handleFetchStatus();
    decodeToken();
    handleDetect();
  }, []);

  const getFirstAuthorizedPath = (authrztn, navItems) => {
    for (let item of navItems) {
      if (authrztn.includes(item.auth)) {
        return item.to;
      }
    }
    return "#";
  };

  const firstInventoryPath = getFirstAuthorizedPath(authrztn, inventoryNav);
  const firstReportPath = getFirstAuthorizedPath(authrztn, reportsNav);
  const firstUserPath = getFirstAuthorizedPath(authrztn, userNav);
  const firstproductPath = getFirstAuthorizedPath(authrztn, productNav);
  const firstSettingsPath = getFirstAuthorizedPath(authrztn, settingsNav);

  //auto insert category
  const initialize = useRef(false);

  useEffect(() => {
    if (!initialize.current) {
      initialize.current = true;

      const createCategoryAndStoreProfile = async () => {
        try {
          const response = await axios.post(
            `${BASE_URL}/category/categoryAutoAdd`
          );

          const res = await axios.post(
            `${BASE_URL}/store_profile/storeProfileAutoAdd`
          );

          if (response && response.status === 203) {
            console.error("Category already exists");
          } else if (response && response.status === 201) {
            console.log("Category created");
          } else {
            console.error("Error creating category:", response);
          }
        } catch (error) {
          console.error("Error creating category:", error);
        }
      };
      createCategoryAndStoreProfile();
    }
  }, []);

  const handleDetect = (e) => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
      // swal.fire({
      //   title: "Android",
      // });
      setDetectedDevice("Android");
      console.log("Android");
      console.log("user agent", userAgent);
    } else if (/windows|macintosh|linux/i.test(userAgent)) {
      // swal.fire({
      //   title: "Desktop",
      // });
      setDetectedDevice("Desktop");
      console.log("Desktop");
      console.log("user agent", userAgent);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("accessToken");
      typeSetter("");
      await axios.post(`${BASE_URL}/masterList/logout`, { userId, userName });
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userId && userName) {
        handleLogout();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId, userName]);

  const handleCalculator = (value) => {
    const currentAmountLength = startingAmount.replace(".", "").length;

    let newAmount = startingAmount;

    if (value === ".") {
      if (focusedInput === "amount") {
        if (startingAmount.includes(".")) return;
        newAmount = startingAmount === "0" ? "0." : startingAmount + ".";
        setStartingAmount(newAmount);
      }
    } else {
      if (focusedInput === "amount") {
        if (currentAmountLength >= 10) return;
        newAmount = startingAmount === "0" ? value : startingAmount + value;
        setStartingAmount(newAmount);
      }
    }
  };

  const handleDel = () => {
    let newAmount = startingAmount;

    if (focusedInput === "amount") {
      newAmount = startingAmount.slice(0, -1) || "0";
      setStartingAmount(newAmount);
    }
  };

  const handleClear = () => {
    setStartingAmount("0");
  };

  const handleCloseCashierCalc = () => {
    setEndShiftCalcModal(false);
    setStartingAmount("0");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;

      if (key === "Backspace") {
        event.preventDefault();
        handleDel();
      } else if (!isNaN(key) || key === ".") {
        event.preventDefault();
        handleCalculator(key);
      }
    };

    if (endShiftCalcModal) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (endShiftCalcModal) {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [endShiftCalcModal, handleCalculator, handleDel]);

  const handleStartShift = () => {
    const startAmount =
      startingAmount != "" || startingAmount != 0 ? startingAmount : 0;
    axios
      .post(BASE_URL + "/endshift/insertStartShift", null, {
        params: {
          userId,
          startAmount,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          swal1({
            icon: "success",
            title: "Shift Started",
            buttons: {
              Yes: {
                text: "Yes",
                value: "Yes",
                className: "ordering-swal-yes-button",
              },
            },
          }).then(() => {
            navigate("/ordering");
          });
        } else {
          swal.fire({
            title: "Something Went Wrong!",
            text: "Please contact your supervisor!",
            icon: "error",
          });
        }
      });
  };

  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);

  const { setIP, ip } = useStoreIP();

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

        await printer.connect();
        console.log("Successfully connected to printer");

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
  return (
    <>
      <div className="menu-container">
        <div className="time-container">
          <div className="time">
            <div>{formattedDate}</div>
            &nbsp;
            {formattedTime}
          </div>
        </div>

        <div className="title-menu">
          <span className="blue">{storeName || "ELI"}</span>
          <span className="of">POINT OF SALE</span>
        </div>
        {/* <div className="sentence">
          Point of sale application intended to be used within the Coppel chain
          stores
        </div> */}

        <div className="buttons-container mt-2">
          <div className="menus">
            <Link
              to={isDashboardViewAuthorized ? "/Dashboard" : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isDashboardViewAuthorized}>
                <i class="bx bx-home icon-btn"></i>
                <div className="btn-details">
                  <h2>DASHBOARD</h2>
                  <p className="desc">Analytic Dashboard</p>
                </div>
              </button>
            </Link>
            <Link to={firstInventoryPath} style={{ textDecoration: "none" }}>
              <button disabled={!isInventoryViewAuthorized}>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>INVENTORY</h2>
                  <p className="desc">Manage and tracking of stocks</p>
                </div>
              </button>
            </Link>
            <Link
              to={isEReceiptViewAuthorized ? "/E-Receipts" : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isEReceiptViewAuthorized}>
                <i class="bx bx-coin-stack icon-btn"></i>
                <div className="btn-details">
                  <h2>E-RECEIPTS</h2>
                  <p className="desc">Receipt generation and print</p>
                </div>
              </button>
            </Link>
          </div>
          <div className="menus">
            <Link
              to={isProductCategoryViewAuthorized ? firstproductPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isProductCategoryViewAuthorized}>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>PRODUCTS</h2>
                  <p className="desc">Catalog and Manage Product</p>
                </div>
              </button>
            </Link>
            <Link
              to={isRFIDViewAuthorized ? "/nfc-load" : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isRFIDViewAuthorized}>
                <i class="bx bx-rfid  "></i>
                <div className="btn-details">
                  <h2>RFID</h2>
                  <p className="desc">RFID Load</p>
                </div>
              </button>
            </Link>
            <Link
              to={isReportsViewAuthorized ? firstReportPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isReportsViewAuthorized}>
                <i class="bx bxs-bar-chart-alt-2 icon-btn"></i>
                <div className="btn-details">
                  <h2>REPORTS</h2>
                  <p className="desc">Generate and analyze reports</p>
                </div>
              </button>
            </Link>
          </div>
          <div className="menus">
            <Link
              to={isUserViewAuthorized ? firstUserPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isUserViewAuthorized}>
                <i class="bx bx-user icon-btn"></i>
                <div className="btn-details">
                  <h2>USERS</h2>
                  <p className="desc">User profiles and Access Controls</p>
                </div>
              </button>
            </Link>
            {/* <Link
              to={isOrderingEnabled ? "/ordering" : "#"}
              style={{ textDecoration: "none" }}
            > */}
            <button disabled={!isOrderingEnabled} onClick={handleCheckShift}>
              <i class="bx bx-border-all icon-btn"></i>
              <div className="btn-details">
                <h2>ORDERING</h2>
                <p className="desc">Process and Track Orders</p>
              </div>
            </button>
            {/* </Link> */}
            <Link
              to={isSettingsViewAuthorized ? firstSettingsPath : "#"}
              style={{ textDecoration: "none" }}
            >
              <button disabled={!isSettingsViewAuthorized}>
                <i class="bx bx-cog icon-btn"></i>
                <div className="btn-details">
                  <h2>SETTINGS</h2>
                  <p className="desc">Configure System and Options</p>
                </div>
              </button>
            </Link>
          </div>
          {/* <div className="menus">
            <Link to={"/kiosk-main"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-cog icon-btn"></i>
                <div>
                  <h2>Kiosk</h2>
                  <p className="desc">Create, track</p>
                </div>
              </button>
            </Link>
          </div> */}
        </div>

        {/* <div className="buttons-container mt-4">
          <div className="menus">
            <Link to={"/Dashboard"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-home icon-btn"></i>
                <div className="btn-details">
                  <h2>DASHBOARD</h2>
                  <p className="desc">Analytic Dashboard</p>
                </div>
              </button>
            </Link>
            <Link to={"/inventory-stocks"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>INVENTORY</h2>
                  <p className="desc">Products</p>
                </div>
              </button>
            </Link>
            <Link to={"/E-Receipts"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-coin-stack icon-btn"></i>
                <div className="btn-details">
                  <h2>E-RECEIPTS</h2>
                  <p className="desc">Products</p>
                </div>
              </button>
            </Link>

            <Link to={"/product-category"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-package icon-btn"></i>
                <div className="btn-details">
                  <h2>PRODUCTS</h2>
                  <p className="desc">Manage and track</p>
                </div>
              </button>
            </Link>
            <Link to={"/Product"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-rfid  "></i>
                <div className="btn-details">
                  <h2>RFID</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
            <Link to={"/Product"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bxs-bar-chart-alt-2 icon-btn"></i>
                <div className="btn-details">
                  <h2>REPORTS</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>

            <Link to={"/user-management"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-user icon-btn"></i>
                <div className="btn-details">
                  <h2>USERS</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
            <Link to={"/ordering"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-border-all icon-btn"></i>
                <div className="btn-details">
                  <h2>ORDERING</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
            <Link to={"/Product"} style={{ textDecoration: "none" }}>
              <button>
                <i class="bx bx-cog icon-btn"></i>
                <div className="btn-details">
                  <h2>SETTINGS</h2>
                  <p className="desc">Creaate, track</p>
                </div>
              </button>
            </Link>
          </div>
        </div> */}

        <div className="footer">
          <div className="version">
            <p>v.1.0</p>
          </div>
          <Link to="/" style={{ color: "black", textDecoration: "none" }}>
            <div className="logout" onClick={handleLogout}>
              <i class="bx bx-log-out-circle bx-rotate-90 logout-i"></i>
              <p>Logout</p>
            </div>
          </Link>
        </div>
      </div>

      <Modal
        show={endShiftCalcModal}
        onHide={handleCloseCashierCalc}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-category p-1 end-shift-cal">
          <h2>START SHIFT</h2>
          <h4 className="shitft-p">Enter the starting cash amount</h4>
          <hr />
          <div className="shift-cal-container">
            <div
              className="shift-actual-cash w-100 d-flex flex-row"
              style={{ height: "20px" }}
            >
              <div className="w-50">
                <h3>Starting Cash</h3>
              </div>
              <div className="w-50 d-flex flex-row justify-content-end p-0">
                <span className="h3">₱</span>{" "}
                <Form.Control
                  type="text"
                  value={startingAmount}
                  style={{ width: "120px", height: "24px", fontSize: "16px" }}
                  onFocus={() => setFocusedInput("amount")}
                />
              </div>
            </div>

            <div className="calc-container">
              <table>
                <tr>
                  <th onClick={() => handleCalculator("1")}>1</th>
                  <th onClick={() => handleCalculator("2")}> 2</th>
                  <th onClick={() => handleCalculator("3")}>3</th>
                  <th onClick={handleDel}>Del</th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("4")}>4</th>
                  <th onClick={() => handleCalculator("5")}>5</th>
                  <th onClick={() => handleCalculator("6")}>6</th>
                  <th onClick={handleClear}>Clear</th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("7")}>7</th>
                  <th onClick={() => handleCalculator("8")}>8</th>
                  <th onClick={() => handleCalculator("9")}>9</th>
                  <th rowSpan={2} onClick={handleStartShift}>
                    Enter
                  </th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("0")}>0</th>
                  <th onClick={() => handleCalculator("00")}>00</th>
                  <th onClick={() => handleCalculator(".")}>.</th>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div className="end-modal-btn-container">
          <button
            type="button"
            className="end-btn end-es-btn"
            onClick={handleCloseCashierCalc}
            style={{ marginTop: "10px" }}
          >
            Back
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Menu;
