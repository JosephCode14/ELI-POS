import React, { useState, useEffect, useRef } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
// import "../styles/pos_react.css";
import "../styles/dashboard.css";
import netSale from "../../assets/icon/net-sales.png";
import cart from "../../assets/icon/cart.png";
import printer from "../../assets/icon/printer.png";
import {
  Button,
  Dropdown,
  Modal,
  Form,
  ModalFooter,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FourSquare } from "react-loading-indicators";
import noData from "../../assets/icon/no-data.png";
import NoAccess from "../../assets/image/NoAccess.png";
import swal from "sweetalert";
import item_sold_image from "../../assets/image/item-sold.png";
import transaction_number_image from "../../assets/image/transaction-number.png";
import net_sales_image from "../../assets/image/net-sales.png";
import dashboard_date from "../../assets/image/date.png";
import useStoreIP from "../../stores/useStoreIP";
import useStoreDetectedDevice from "../../stores/useStoreDetectedDevice";
import { useWebSocket } from "../../contexts/WebSocketProvider";

const DashBoard = ({ authrztn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [arrow, setArrow] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [storeName, setStoreName] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [storeStatus, setStoreStatus] = useState(false);
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);
  const [totalInventoryAccumulate, setTotalInventoryAccumulate] = useState(0);
  const [totalRawInventoryAccumulate, setTotalRawInventoryAccumulate] =
    useState(0);
  const [totalOrdered, setTotalOrdered] = useState(0);
  const [totalItemSold, setTotalItemSold] = useState(0);
  const [userId, setuserId] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState(activityLogs);
  const [dropdownLogs, setDropdownLogs] = useState([]);

  const [filterDropLogs, setFilterDropLogs] = useState(dropdownLogs);
  const [selectedId, setSelectedId] = useState(null);

  // Modal
  const [showDetails, setShowDetails] = useState(false);
  const [masterName, setMasterName] = useState("");

  const [expandedRow, setExpandedRow] = useState(null);

  const { kioskPrinter, kitchenPrinter, printerCount } = useWebSocket();

  const { online, offline } = printerCount;

  const [reference, setReference] = useState("");

  const [connectionModal, setConnectionModal] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const printers = [
    { name: "Kiosk Printer", status: kioskPrinter ? "Active" : "Inactive" },
    { name: "Kitchen Printer", status: kitchenPrinter ? "Active" : "Inactive" },
  ];

  const filteredData =
    selectedStatus === "All Status"
      ? printers
      : printers.filter((printer) => printer.status === selectedStatus);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };
  // const todayDate = new Date().toISOString().split("T")[0];
  const handleRowClick = (id, i, masterListName) => {
    setSelectedId(id);
    setExpandedRow(expandedRow == i ? null : i);
    setMasterName(masterListName);
    handleFilterToday();

    setShowDetails(true);

    // setArrow(!arrow);
    axios
      .get(`${BASE_URL}/activityLog/fetchDropdownActivityLog`, {
        params: { id },
      })
      .then((res) => {
        setDropdownLogs(res.data);
      })
      .catch((err) => console.log(err));
  };

  //update for close and open of store
  const handleUpdateStatus = async () => {
    try {
      const newStatus = !storeStatus;
      const statusLabel = newStatus ? "open" : "close";
      swal({
        icon: "warning",
        title: `Are you sure you want to ${statusLabel} the store?`,
        text: `This will ${statusLabel} the store`,
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
          if (newStatus) {
            const res = await axios.put(
              `${BASE_URL}/store_profile/open_store`,
              {
                storeStatus: newStatus,
                userId,
              }
            );

            if (res.status == 200) {
              handleGetReference();
              handleDashboardData();
            }
          } else {
            const res = await axios.put(
              `${BASE_URL}/store_profile/close_store`,
              {
                storeStatus: newStatus,
                userId,
                reference: reference,
              }
            );

            if (res.status == 201) {
              swal({
                icon: "warning",
                title: `Failed to close the store`,
                text: `There are still ongoing shifts`,
              });
            } else if ((res.status = 200)) {
              if (!newStatus) {
                const res = await axios.post(
                  `${BASE_URL}/store_profile/storeClose`,
                  {
                    totalSales: totalPayableAmount,
                    totalPurchased: totalOrdered,
                    totalSold: totalItemSold,
                  }
                );

                if (res.status == 200) {
                  console.log("Dashboard Receipt", res.data);
                  handleReceiptsClick(res.data.data);
                }
              }
            }
          }
          // const res = await axios.put(
          //   `${BASE_URL}/store_profile/update_status`,
          //   {
          //     storeStatus: newStatus,
          //     userId,
          //   }
          // );

          handleFetchStatus();
        } else {
          swal.close();
        }
      });

      handleFetchStatus();
    } catch (err) {
      console.error("Error updating store status:", err);
    }
  };
  //update for close and open of store

  //Get reference
  const handleGetReference = async () => {
    try {
      if (storeStatus) {
        const res = await axios.get(`${BASE_URL}/store_profile/getReference`);

        if (res.status == 200) {
          setReference(res.data.reference);
        } else {
          console.log("Store closed");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  //displaying ng date and time sa dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function formatDateTime(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

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
  //displaying ng date and time sa dashboard

  //condition sa pagfetch ng user activity kada araw
  // const filterLogsByDate = () => {
  //   const today = new Date().toISOString().split("T")[0];
  //   const filtered = activityLogs.filter((log) => {
  //     const logDate = new Date(log.maxCreatedAt).toISOString().split("T")[0];
  //     return logDate === today;
  //   });
  //   setFilteredLogs(filtered);
  // };

  // useEffect(() => {
  //   if (activityLogs.length) {
  //     filterLogsByDate();
  //   }
  // }, [activityLogs]);
  //condition sa pagfetch ng user activity kada araw

  const handleFetchActivityLog = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/activityLog/getActivityLog`);
      setActivityLogs(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreCode(res.data.store_code);
    setStoreName(res.data.store_name || "ELI");
    setIsLoading(false);
  };

  const handleFetchStatus = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchStatus`);
    setStoreStatus(res.data.status);
    setIsLoading(false);
  };

  const handleDashboardData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/store_profile/DashboardData`);
      setTotalPayableAmount(res.data.totalPayableAmount || 0);
      setTotalInventoryAccumulate(res.data.totalInventoryPrice || 0);
      setTotalRawInventoryAccumulate(res.data.totalRawInventoryPrice || 0);
      setTotalOrdered(res.data.totalOrder || 0);
      setTotalItemSold(res.data.totalProductSold || 0);
    } catch (error) {
      // Handle the error appropriately
      console.error("Error fetching dashboard data:", error);
      // Set defaults or handle error state
      setTotalPayableAmount(0);
      setTotalInventoryAccumulate(0);
      setTotalRawInventoryAccumulate(0);
      setTotalOrdered(0);
      setTotalItemSold(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    decodeToken();
  }, []);

  useEffect(() => {
    handleGetReference();
  }, [storeStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchStatus();
      handleFetchProfile();
      handleDashboardData();
      handleFetchActivityLog();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  //value ng netsales subtract ang raw, product sa nabentang product
  const netSales = totalPayableAmount;
  // - (totalInventoryAccumulate + totalRawInventoryAccumulate);

  const [showDropdown, setShowDropdown] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dropdownRef = useRef(null);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const filteredData = dropdownLogs.filter((inv) => {
      const transactionDate = new Date(inv.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilterDropLogs(filteredData);
  }, [fromDate, endDate, dropdownLogs]);

  useEffect(() => {
    console.log("FilteDrop", filterDropLogs);
    console.log("Drop", filterDropLogs);
  }, [filterDropLogs, dropdownLogs]);

  const handleFilterToday = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    setFromDate(`${currentDate}`);
    setEndDate(`${currentDate}`);
    console.log(currentDate);
  };

  const handleFilterYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];
    setFromDate(yesterdayDate);
    setEndDate(yesterdayDate);
  };

  const handleFilterLast7Days = () => {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);
    const todayDate = today.toISOString().split("T")[0];
    const last7DaysDate = last7Days.toISOString().split("T")[0];
    setFromDate(last7DaysDate);
    setEndDate(todayDate);
  };

  const handleFilterLast30Days = () => {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    const todayDate = today.toISOString().split("T")[0];
    const last30DaysDate = last30Days.toISOString().split("T")[0];

    setFromDate(last30DaysDate);
    setEndDate(todayDate);
  };

  const handleClearFilter = () => {
    setFromDate("");
    setEndDate("");
  };

  const handleFilterIndicator = (filterApplied) => {
    let filterText = document.getElementById("dateFilterIndicator");
    let baseText = "Date Filter Applied: ";
    filterText.innerHTML =
      baseText +
      `<span style="color: #3a74a9; font-weight: bold;">${filterApplied}</span>`;
  };

  const handleFilterIndicatorRange = (from, end) => {
    let filterText = document.getElementById("dateFilterIndicator");
    let baseText = "Date Filter Applied: ";
    let rangeText = from + " to " + end;
    filterText.innerHTML =
      baseText +
      `<span style="color: #3a74a9; font-weight: bold;">${rangeText}</span>`;
  };

  const clearFilterIndicatorText = () => {
    let filterText = document.getElementById("dateFilterIndicator");
    filterText.textContent = "";
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
        const printer = new window.IminPrinter(ip);
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

  const handleReceiptsClick = async (data) => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });

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
      await printerInstance.printText("Store Close Slip");

      await printerInstance.setAlignment(1);
      // Spacing
      await printerInstance.printText(
        "                                                                     "
      );
      // await printerInstance.printText("BILLING");
      // Order NUmber

      await printerInstance.printColumnsText(
        ["Store Open", "Store Close"],
        [1, 1],
        [1, 1],
        [28, 28],
        576
      );

      await printerInstance.printColumnsText(
        [`${formatDate(data.store_open)}`, `${formatDate(data.store_close)}`],
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

      // await printerInstance.printColumnsText(
      //   ["Total Difference:", `${data.total_difference}`],
      //   [1, 1],
      //   [0, 2],
      //   [26, 26],
      //   576
      // );
      // await printerInstance.printColumnsText(
      //   ["Total Remittance:", `${data.total_remittance}`],
      //   [1, 1],
      //   [0, 2],
      //   [26, 26],
      //   576
      // );
      await printerInstance.printColumnsText(
        [
          "Total Refund:",
          `${data.total_refund.toLocaleString("en-US", {
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

      await printerInstance.printColumnsText(
        [
          "Total Cash:",
          `${data.total_cash.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        [
          "Total Card:",
          `${data.total_card.toLocaleString("en-US", {
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
      await printerInstance.printColumnsText(
        [
          "Total Load:",
          `${data.total_load.toLocaleString("en-US", {
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
      await printerInstance.printColumnsText(
        [
          "Total Income:",
          `${data.total_sales.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Total Checkout:", `${data.total_purchased}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Total Item Sold:", `${data.total_sold}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );

      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "                                                                     "
      );

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

      console.log("Printing completed successfully");
    } catch (error) {
      console.error("Failed to print receipt:", error);
    }
  };

  const handleCloseConnectionModal = () => {
    setConnectionModal(false);
    setSelectedStatus("All Status");
  };
  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center flex-column vh-100 ms-5 ps-5 align-items-center">
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("Dashboard-View") ? (
        <div className="dashboard-container">
          {/* Dashboard Header */}
          <div className="d-flex flex-column flex-xl-row dashboard-heading work-sans-font px-5 justify-content-between border border-top-0 border-start-0 border-end-0 border-bottom-1">
            <h2>
              Store Name: &nbsp; {storeCode}-{storeName}
            </h2>
            <div className="d-flex align-items-center align-items-xl-start no-padding">
              <h2>Store Status:</h2> &nbsp;
              <label className="switch">
                <input
                  type="checkbox"
                  checked={storeStatus}
                  onClick={handleUpdateStatus}
                />
                <span className="slider round"></span>
              </label>
              {storeStatus ? (
                <h2 className="text-success">Open</h2>
              ) : (
                <h2 className="text-danger">Closed</h2>
              )}
            </div>
            <h2>
              <img src={dashboard_date} alt="date" /> {formattedDate}{" "}
              {formattedTime}
            </h2>
          </div>

          {/* Summary */}
          <div className="px-5 pt-5 border border-1 border-top border-start-0 border-end-0 border-bottom-0">
            <div className="dashboard-heading">
              <h2 className="work-sans-font">Summary</h2>
            </div>
            <div className="d-flex flex-wrap flex-xl-nowrap pt-3 gap-3 gap-xxl-5 h-100 w-100">
              <div className="d-flex w-100 no-padding border boxshadow">
                <div className="d-flex flex-column p-0 py-xxl-4 gray-text widget-bg work-sans-font justify-content-center align-items-center w-50">
                  <p className="gray-text text-center">Total Item Sold</p>
                  <img src={item_sold_image} alt="item-sold" className="h-50" />
                </div>
                <div className="d-flex justify-content-center align-items-center w-50">
                  <p className="inter-font overflow-auto text-center widget-digits">
                    {totalItemSold}
                  </p>
                </div>
              </div>
              <div className="d-flex w-100 no-padding border boxshadow">
                <div className="d-flex flex-column py-0 py-xxl-4 widget-bg work-sans-font justify-content-center align-items-center w-50">
                  <p className="gray-text text-center">
                    Total Transaction Number
                  </p>
                  <img
                    src={transaction_number_image}
                    alt="transaction-number"
                    className="h-50"
                  />
                </div>
                <div className="d-flex justify-content-center align-items-center w-50">
                  <p className="inter-font overflow-auto text-center widget-digits">
                    {totalOrdered}
                  </p>
                </div>
              </div>
              <div className="d-flex w-100 no-padding border boxshadow">
                <div className="d-flex flex-column py-0 py-xxl-4 widget-bg work-sans-font justify-content-center align-items-center w-50">
                  <p className="gray-text text-center">Net Sales</p>
                  <img src={net_sales_image} alt="net-sales" className="h-50" />
                </div>
                <div className="d-flex justify-content-center align-items-center w-50">
                  <p className="inter-font overflow-auto text-center netsales-digits">
                    &#8369;
                    {netSales.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Hardware Status */}

          <div className="mx-5 pt-4 work-sans-font border border-3 border-top border-start-0 border-end-0 border-bottom-0 pb-3">
            <div className="dashboard-heading pb-3">
              <h2>Hardware Status</h2>
            </div>

            <div
              className="bg-light w-100 h-50 d-flex justify-content-evenly hardware-stats boxshadow mb-2"
              onClick={() => setConnectionModal(true)}
            >
              {online == 0 && offline == 0 ? (
                <>
                  <div className="text-center p-2">
                    <h1>Server Offline</h1>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <h2 className="text-success">{online}</h2>
                    <div className="d-flex p-0">
                      <div
                        className="rounded-circle me-1"
                        style={{
                          marginTop: "6px",
                          width: "10px",
                          height: "10px",
                          background: "#9ACD32",
                        }}
                      ></div>
                      <h2 className="me-3">Online</h2>
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-danger">{offline}</h2>
                    <div className="d-flex p-0">
                      <div
                        className="rounded-circle me-1"
                        style={{
                          marginTop: "6px",
                          width: "10px",
                          height: "10px",
                          background: "red",
                        }}
                      ></div>
                      <h2 className="me-2">Offline</h2>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* System Logs */}
          <div className="mx-5 pt-4 h-50 work-sans-font border border-3 border-top border-start-0 border-end-0 border-bottom-0">
            <div className="dashboard-heading pb-3">
              <h2>System Logs</h2>
            </div>
            <div className="overflow-auto h-100 boxshadow">
              <table className="custom-table dash-table">
                <thead>
                  <tr className="table-header-bg">
                    <th className="text-center">Staff name</th>
                    <th className="text-center">User role</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((data, index) => (
                    <>
                      <tr>
                        <td
                          className="text-center"
                          onClick={() =>
                            handleRowClick(data.col_id, index, data.col_name)
                          }
                        >
                          {data.col_name}
                        </td>
                        <td
                          className="text-center"
                          onClick={() =>
                            handleRowClick(data.col_id, index, data.col_name)
                          }
                        >
                          {data.user_type}
                        </td>
                        <td
                          className="text-center"
                          onClick={() =>
                            handleRowClick(data.col_id, index, data.col_name)
                          }
                        >
                          {data.col_status}
                        </td>
                        {/* <td
                          className="text-center"
                          onClick={() =>
                            handleRowClick(data.col_id, index, data.col_name)
                          }
                        >
                          <div>
                            <i
                              className={`bx ${
                                expandedRow === index
                                  ? "bx-chevron-up"
                                  : "bx-chevron-down"
                              }`}
                              onClick={() =>
                                expandedRow === index
                                  ? setExpandedRow(null)
                                  : setExpandedRow(index)
                              }
                            ></i>
                          </div>
                        </td> */}
                      </tr>

                      {/* {expandedRow === index && (
                        <tr>
                          <td colSpan="4">
                            <table>
                              <thead>
                                <tr>
                                  <th>Activity Logs</th>
                                  <th>Date / Time</th>
                                  <th>
                                    <div className="filter-button-container">
                                      <div className="filter-button-container-container">
                                        <Button
                                          className="responsive nowrap"
                                          style={{ padding: "1px" }}
                                          onClick={handleDropdownToggle}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            className="bi bi-filter"
                                            viewBox="0 0 16 16"
                                          >
                                            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
                                          </svg>
                                          Filter
                                        </Button>

                                        {showDropdown && (
                                          <Dropdown.Menu
                                            ref={dropdownRef}
                                            show
                                            className="dropdown-menu"
                                          >
                                            <div className="filter-menu-container">
                                              <div className="filter-menu-title-container">
                                                Filter by date
                                                <Dropdown.Divider />
                                              </div>

                                              <div className="filter-menu-body-container">
                                                <div className="days-modal-container">
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterToday();
                                                      handleFilterIndicator(
                                                        "Today"
                                                      );
                                                    }}
                                                  >
                                                    Today
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterYesterday();
                                                      handleFilterIndicator(
                                                        "Yesterday"
                                                      );
                                                    }}
                                                  >
                                                    Yesterday
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterLast7Days();
                                                      handleFilterIndicator(
                                                        "Last 7 Days"
                                                      );
                                                    }}
                                                  >
                                                    Last 7 days
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    onClick={() => {
                                                      handleFilterLast30Days();
                                                      handleFilterIndicator(
                                                        "Last 30 Days"
                                                      );
                                                    }}
                                                  >
                                                    Last 30 days
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                    className="clear-filt"
                                                    onClick={() => {
                                                      handleClearFilter();
                                                      clearFilterIndicatorText();
                                                    }}
                                                  >
                                                    Clear Filter
                                                  </Dropdown.Item>
                                                </div>

                                                <div className="date-range">
                                                  <p>From:</p>
                                                  <input
                                                    type="date"
                                                    className="form-control i-date"
                                                    id="exampleFormControlInput1"
                                                    value={fromDate}
                                                    onChange={(e) => {
                                                      setFromDate(
                                                        e.target.value
                                                      );
                                                      handleFilterIndicatorRange(
                                                        e.target.value,
                                                        endDate
                                                      );
                                                    }}
                                                  />

                                                  <p>To:</p>
                                                  <input
                                                    type="date"
                                                    className="form-control i-date"
                                                    id="exampleFormControlInput1"
                                                    value={endDate}
                                                    onChange={(e) => {
                                                      setEndDate(
                                                        e.target.value
                                                      );
                                                      handleFilterIndicatorRange(
                                                        fromDate,
                                                        e.target.value
                                                      );
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </Dropdown.Menu>
                                        )}
                                      </div>
                                    </div>
                                  </th>
                                </tr>
                              </thead>

                              <tbody style={{ height: "400px" }}>
                                {filterDropLogs.map((data, i) => (
                                  <tr key={i}>
                                    <td>{data.action_taken}</td>
                                    <td>{formatDateTime(data.createdAt)}</td>
                                    <td></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )} */}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="xl">
        <Modal.Header>
          <div className="d-flex flex-wrap flex-sm-nowrap w-100 gap-3 p-0 justify-content-between align-items-center">
            <div>
              <p className="h2">{masterName}</p>
            </div>
            <h4 id="dateFilterIndicator"></h4>
            <div className="col-12 col-sm-2 col-md-2 col-lg-2 col-xl-1 col-xxl-1">
              <div className="filter-button-container">
                <Button
                  className="responsive nowrap"
                  onClick={handleDropdownToggle}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-filter"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
                  </svg>
                  Filter
                </Button>

                <div className="filter-button-container-container pt-3 mt-5">
                  {showDropdown && (
                    <Dropdown.Menu
                      ref={dropdownRef}
                      show
                      className="dropdown-menu"
                    >
                      <div className="filter-menu-container">
                        <div className="filter-menu-title-container">
                          Filter by date
                          <Dropdown.Divider />
                        </div>

                        <div className="filter-menu-body-container">
                          <div className="days-modal-container">
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterToday();
                                handleFilterIndicator("Today");
                              }}
                            >
                              Today
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterYesterday();
                                handleFilterIndicator("Yesterday");
                              }}
                            >
                              Yesterday
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterLast7Days();
                                handleFilterIndicator("Last 7 Days");
                              }}
                            >
                              Last 7 days
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                handleFilterLast30Days();
                                handleFilterIndicator("Last 30 Days");
                              }}
                            >
                              Last 30 days
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="clear-filt"
                              onClick={() => {
                                handleClearFilter();
                                clearFilterIndicatorText();
                              }}
                            >
                              Clear Filter
                            </Dropdown.Item>
                          </div>

                          <div className="date-range">
                            <p>From:</p>
                            <input
                              type="date"
                              className="form-control i-date"
                              id="exampleFormControlInput1"
                              value={fromDate}
                              onChange={(e) => {
                                setFromDate(e.target.value);
                                handleFilterIndicatorRange(
                                  e.target.value,
                                  endDate
                                );
                              }}
                            />

                            <p>To:</p>
                            <input
                              type="date"
                              className="form-control i-date"
                              id="exampleFormControlInput1"
                              value={endDate}
                              onChange={(e) => {
                                setEndDate(e.target.value);
                                handleFilterIndicatorRange(
                                  fromDate,
                                  e.target.value
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Dropdown.Menu>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="filtering-category-container d-flex justify-content-between">
              <div className="d-flex receivingID p-0"></div>
            </div>
            <div className="mt-4">
              <div className="table-container">
                {filterDropLogs.length == 0 ? (
                  <>
                    <div className="dash-tb">
                      <table className="custom-user-table user-transac-table">
                        <thead>
                          <th>Activity Logs</th>
                          <th>Date / Time</th>
                        </thead>
                        <tbody style={{ height: "300px" }}>
                          <div>
                            <img
                              src={noData}
                              alt="No Data"
                              className="no-data-icon mt-0"
                            />
                            <h2 className="no-data-label">No Data Found</h2>
                          </div>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <table className="custom-user-table user-transac-table">
                      <thead>
                        <tr>
                          <th className="col-8">Activity Logs</th>
                          <th className="col-2">Date / Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterDropLogs.map((data, i) => (
                          <tr key={i}>
                            <td>{data.action_taken}</td>
                            <td>{formatDateTime(data.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={connectionModal} onHide={handleCloseConnectionModal}>
        <Modal.Header>
          <h2> Printers Connection Status</h2>
        </Modal.Header>
        <Modal.Body className="py-3 px-0">
          <Form.Group>
            <Form.Select
              style={{
                height: "40px",
                fontSize: "14px",
                marginBottom: "8px",
              }}
              className="category-dropdown-select"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>

          <div className="overflow-auto h-100 boxshadow">
            <table className="custom-table dash-table">
              <thead>
                <tr className="table-header-bg">
                  <th>Status</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((printer, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex p-0">
                        <div
                          className="rounded-circle me-1"
                          style={{
                            marginTop: "6px",
                            width: "10px",
                            height: "10px",
                            background:
                              printer.status === "Active" ? "#9ACD32" : "red",
                          }}
                        ></div>
                        {printer.status}
                      </div>
                    </td>
                    <td>{printer.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConnectionModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashBoard;
