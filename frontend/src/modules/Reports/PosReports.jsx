import React, { useEffect, useState, useRef } from "react";
import { Button, Dropdown } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import swal from "sweetalert";
import { InputText } from "primereact/inputtext";
import noData from "../../assets/icon/no-data.png";
// import "../styles/reports.css"
// import "../styles/pos_react.css";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
// import Form from "react-bootstrap/Form";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";

const PosReports = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [posTransaction, setPOStransaction] = useState([]);
  const [kioskTransaction, setKioskTransaction] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(true);

  const [filteredTransactions, setFilteredTransactions] =
    useState(posTransaction);

  const [filteredKiosk, setFilteredKiosk] = useState(kioskTransaction);

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

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
    const filteredData = posTransaction.filter((transaction) => {
      const transactionDate = new Date(transaction.order_transaction.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredTransactions(filteredData);
  }, [fromDate, endDate, posTransaction]);

  const dt = useRef(null);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  const reloadPOSTransactionhistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/fetchPOStransactions`);

      console.log(res.data);

      setPOStransaction(res.data);

      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     reloadPOSTransactionhistory();
  //   }, 1500);
  //   return () => clearTimeout(timer);
  // }, [fromDate, endDate]);

  useEffect(() => {
    console.log("POOOS", filteredTransactions);
  }, [filteredTransactions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadPOSTransactionhistory();
    }, 1500);
    return () => clearTimeout(timer);
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

  const handleSelectExport = () => {
    swal({
      title: `Select Export format`,
      text: `Please select export format you desired`,
      buttons: {
        excel: {
          text: "Excel",
          value: "excel",
          className: "--excel",
        },
        pdf: {
          text: "PDF",
          value: "pdf",
          className: "--pdf",
        },
      },
    }).then((value) => {
      if (value === "excel") {
        handleExport("excel");
      } else if (value === "pdf") {
        handleExport("pdf");
      }
    });
  };

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

  const columns = [
    {
      name: "TRANSACTION DATE",
      selector: (row) => formatDate(row.order_transaction.createdAt),
      sortable: true,
    },
    {
      name: "TRANSACTION ID",
      selector: (row) => row.order_transaction.order_number,
      sortable: true,
    },
    {
      name: "PRODUCT NAME",
      selector: (row) =>
        row.cart_specification_variants.length > 0
          ? `${
              row.product_inventory.product.name
            } (${row.cart_specification_variants
              .map((variant) => variant.specification_variant.variant_name)
              .join(", ")})`
          : row.product_inventory.product.name,
    },

    {
      name: "QTY",
      selector: (row) => row.quantity,
      sortable: true,
    },
    {
      name: "UNIT PRICE",
      selector: (row) => row.purchased_amount,
      sortable: true,
    },
    {
      name: "AMOUNT",
      selector: (row) => row.subtotal,
      sortable: true,
    },
    {
      name: "PAYMENT METHOD",
      selector: (row) => row.order_transaction.payment_method,
      sortable: true,
    },
    {
      name: "STATUS",
      selector: (row) =>
        row.order_transaction.status === "Ordered"
          ? "Success"
          : row.order_transaction.status,
      cell: (row) => (
        <div
          style={{
            backgroundColor:
              row.order_transaction.status === "Ordered"
                ? "green"
                : row.order_transaction.status === "Void"
                ? "red"
                : row.order_transaction.status === "Cancelled"
                ? "gray"
                : "orange",
            padding: "5px",
            width: "6em",
            color: "white",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          {row.order_transaction.status === "Ordered"
            ? "Success"
            : row.order_transaction.status}
        </div>
      ),
      sortable: true,
    },
  ];

  const handleClearFilter = () => {
    setFromDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
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

  const handleExport = (format) => {
    if (filteredTransactions.length <= 0) {
      swal({
        title: "There are no data to export!",
        icon: "error",
        button: "OK",
      }).then(() => {
        swal.close();
      });

      return;
    }
    // Extract specific fields for export
    axios.post(`${BASE_URL}/reports/posReportsLog`, {
      userId,
      format,
    });

    const dataToExport = filteredTransactions;
    if (format == "excel") {
      let exportedData = [];

      // Add the "POS" and "REPORTS" row

      const fromRange =
        fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
      const toRange =
        endDate == "" ? new Date().toISOString().split("T")[0] : endDate;
      const posReportsRow = ["REPORT:", " POS REPORTS", "", "", "", "", ""];
      const dateCoverage = [
        "DATE COVERAGE:",
        `FROM: ${fromRange}`,
        `TO: ${toRange}`,
        "",
        "",
        "",
        "",
      ];
      const dateGenerated = [
        "DATE GENERATED:",
        `${new Date().toLocaleString()}`,
        ``,
        "",
        "",
        "",
        "",
      ];

      // Add the POS/REPORTS row to exportedData
      exportedData.push(posReportsRow);
      exportedData.push(dateCoverage);
      exportedData.push(dateGenerated);

      // Add a blank row after POS/REPORTS
      const blankRow = ["", "", "", "", "", "", ""];

      exportedData.push(blankRow);

      // Manually define the table headers
      const tableHeaders = [
        "TRANSACTION DATE",
        "TRANSACTION ID",
        "PRODUCT NAME",
        "QUANTITY",
        "UNIT PRICE",
        "AMOUNT",
        "PAYMENT METHOD",
        "STATUS",
      ];

      // Add table headers to exportedData
      exportedData.push(tableHeaders);

      // Map dataToExport to exportedData format
      exportedData = exportedData.concat(
        dataToExport.map((item) => [
          new Date(item.order_transaction.createdAt)
            .toISOString()
            .split("T")[0],
          item.order_transaction.order_number,
          item.cart_specification_variants.length > 0
            ? `${
                item.product_inventory.product.name
              } (${item.cart_specification_variants
                .map((variant) => variant.specification_variant.variant_name)
                .join(", ")})`
            : item.product_inventory.product.name,
          item.quantity,
          item.product_inventory.product.price,
          item.subtotal,
          item.order_transaction.payment_method,
          item.order_transaction.status === "Ordered"
            ? "Success"
            : item.order_transaction.status,
        ])
      );

      // Calculate the total of the unit prices
      const totalSubtotal = dataToExport
        .filter((item) => item.order_transaction.status === "Ordered")
        .reduce((total, item) => total + item.subtotal, 0);

      const totalCash = dataToExport
        .filter((item) => item.order_transaction.payment_method === "CASH")
        .reduce((total, item) => total + item.subtotal, 0);

      const totalCashier = dataToExport
        .filter(
          (item) => item.order_transaction.masterlist.user_type != "Kiosk"
        )
        .reduce((total, item) => total + item.subtotal, 0);

      const totalKiosk = dataToExport
        .filter(
          (item) => item.order_transaction.masterlist.user_type == "Kiosk"
        )
        .reduce((total, item) => total + item.subtotal, 0);

      const totalCard = dataToExport
        .filter((item) => item.order_transaction.payment_method === "CARD")
        .reduce((total, item) => total + item.subtotal, 0);

      const totalCredit = dataToExport
        .filter((item) =>
          item.product_inventory.product.category_products.some(
            (categoryProduct) =>
              categoryProduct.category.name === "Student Meal - Breakfast" ||
              categoryProduct.category.name === "Student Meal - Lunch" ||
              categoryProduct.category.name === "Student Meal - Dinner"
          )
        )
        .reduce((total, item) => total + item.subtotal, 0);
      const formatNumber = (num) => {
        const formatNum = `"${num.toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}"`;

        return formatNum;
      };

      const totalRow = [
        "",
        "",
        "Total Sales",
        `${formatNumber(totalSubtotal)}`,
        ``,
        "",
        "",
      ];

      const totalCashnCashier = [
        "Cash",
        `${formatNumber(totalCash)}`,
        ``,
        "",
        `Cashier`,
        `${formatNumber(totalCashier)}`,
        "",
      ];

      const totalKiosknCard = [
        "Card",
        `${formatNumber(totalCard)}`,
        ``,
        "",
        `Kiosk`,
        `${formatNumber(totalKiosk)}`,
        "",
      ];

      const totalCreditRow = [
        "Credit",
        `${formatNumber(totalCredit)}`,
        ``,
        "",
        ``,
        ``,
        "",
      ];

      // Add a blank row and the total row to exportedData
      exportedData.push(blankRow);
      exportedData.push(totalRow);
      exportedData.push(blankRow);
      exportedData.push(totalCashnCashier);
      exportedData.push(totalKiosknCard);
      exportedData.push(totalCreditRow);
      // Convert exported data to CSV format
      const csv = exportedData.map((row) => row.join(",")).join("\n");

      // Create a Blob containing the CSV data
      const blob = new Blob([csv], { type: "text/csv" });

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      const fileName = "pos_reports.csv";
      link.download = fileName;
      link.click();
    } else {
      const doc = new jsPDF({ orientation: "landscape" });

      const tableData = [];

      // Add the "POS" and "REPORTS" row
      const fromRange =
        fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
      const toRange =
        endDate == "" ? new Date().toISOString().split("T")[0] : endDate;

      const posReportsRow = ["REPORT:", " POS REPORTS", "", "", "", "", ""];
      const dateCoverage = [
        "DATE COVERAGE:",
        `FROM: ${fromRange}`,
        `TO: ${toRange}`,
        "",
        "",
        "",
        "",
      ];
      const dateGenerated = [
        "DATE GENERATED:",
        `${new Date().toLocaleString()}`,
        ``,
        "",
        "",
        "",
        "",
      ];

      // Add rows to tableData
      // tableData.push(posReportsRow);
      // tableData.push(dateCoverage);
      // tableData.push(dateGenerated);
      // tableData.push(["", "", "", "", "", "", ""]); // Blank row

      // Add the table headers
      // tableData.push([
      //   "TRANSACTION DATE",
      //   "TRANSACTION ID",
      //   "PRODUCT NAME",
      //   "QUANTITY",
      //   "UNIT PRICE",
      //   "AMOUNT",
      //   "STATUS",
      // ]);

      // Map dataToExport to tableData format
      dataToExport.forEach((item) => {
        const status =
          item.order_transaction.status === "Ordered"
            ? "Success"
            : item.order_transaction.status;

        const prodName =
          item.cart_specification_variants.length > 0
            ? `${
                item.product_inventory.product.name
              } (${item.cart_specification_variants
                .map((variant) => variant.specification_variant.variant_name)
                .join(", ")})`
            : item.product_inventory.product.name;

        tableData.push([
          new Date(item.order_transaction.createdAt)
            .toISOString()
            .split("T")[0],
          item.order_transaction.order_number,
          prodName,
          item.quantity,
          item.product_inventory.product.price,
          item.subtotal,
          item.order_transaction.payment_method,
          status,
        ]);
      });

      const formatNumber = (num) => {
        const formatNum = num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        return formatNum;
      };

      // Calculate totals
      const totalSubtotal = dataToExport
        .filter((item) => item.order_transaction.status === "Ordered")
        .reduce((total, item) => total + item.subtotal, 0);
      const totalCash = dataToExport
        .filter(
          (item) =>
            item.order_transaction.payment_method === "CASH" &&
            item.order_transaction.status == "Ordered"
        )
        .reduce((total, item) => total + item.subtotal, 0);
      const totalCard = dataToExport
        .filter(
          (item) =>
            item.order_transaction.payment_method === "CARD" &&
            item.order_transaction.status == "Ordered"
        )
        .reduce((total, item) => total + item.subtotal, 0);
      const totalCredit = dataToExport
        .filter((item) =>
          item.product_inventory.product.category_products.some(
            (categoryProduct) =>
              [
                "Student Meal - Breakfast",
                "Student Meal - Lunch",
                "Student Meal - Dinner",
              ].includes(categoryProduct.category.name)
          )
        )
        .reduce((total, item) => total + item.subtotal, 0);
      tableData.push(["", "", "", "", "", "", ""]);

      tableData.push([
        "Cash",
        "",
        totalCash.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        ,
        "",
        "",
        "",
        "",
      ]);
      tableData.push([
        "Card",
        "",
        totalCard.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        ,
        "",
        "",
        "",
        "",
      ]);
      tableData.push([
        "Credit",
        "",
        totalCredit.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        ,
        "",
        "",
        "",
        "",
      ]);
      tableData.push([
        "Total Sales",
        "",
        totalSubtotal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        "",
        "",
        "",
        "",
      ]);

      // Generate the PDF table with jsPDF and autoTable

      doc.setFontSize(10);
      doc.text("POS REPORTS", 10, 10);

      doc.text(`Date Coverage: ${fromRange} to ${toRange}`, 70, 10);
      doc.text(`Date Generated: ${new Date().toLocaleString()}`, 180, 10);
      const headerStyle = {
        fillColor: [0, 0, 255],
        textColor: [255, 255, 255],
      };

      doc.autoTable({
        head: [
          [
            { content: "TRANSACTION DATE", styles: headerStyle },
            { content: "TRANSACTION ID", styles: headerStyle },
            { content: "PRODUCT NAME", styles: headerStyle },
            { content: "QUANTITY", styles: headerStyle },
            { content: "UNIT PRICE", styles: headerStyle },
            { content: "AMOUNT", styles: headerStyle },
            { content: "PAYMENT METHOD", styles: headerStyle },
            { content: "STATUS", styles: headerStyle },
          ],
        ],
        body: tableData,
        didDrawCell: (data) => {
          // Bold the total rows if needed
          if (data.row.index >= tableData.length - 4) {
            doc.setFont("helvetica", "bold");

            doc.setTextColor(0, 0, 0);
          }
        },
      });

      // Create the PDF file
      const pdfBlob = new Blob([doc.output("blob")], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = "pos_reports.pdf";
      link.download = fileName;
      link.click();
      window.open(url);
    }
  };

  return (
    <>
      <div className="inventory-container">
        {/* Card */}
        {isLoading ? (
          <div className="loading-container" style={{ margin: "0" }}>
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("POSReport-View") ? (
          <div className="custom-card inv-card pb-0">
            <div className="pos-head-container ms-2 mb-2 flex-column flex-sm-row">
              <div className="title-content-field ms-0 ms-lg-3">
                <h2>POS Transaction Report</h2>
                <h4 id="dateFilterIndicator" className="fs-4"></h4>
              </div>
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
              <div className="export-container d-inline-block d-sm-none">
                {authrztn?.includes("POSReport-IE") && (
                  <button
                    onClick={handleSelectExport}
                    className={`${value == 3 ? "inr-c-e-data export-button" : "inr-e-data"} w-100`}
                    // className="inr-e-data"
                  >
                    Export Data
                  </button>
                )}
              </div>
            </div>

            <div className="table custom-datatable pos-rep">
              {filteredTransactions.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>TRANSACTION DATE</th>
                        <th>TRANSACTION ID</th>
                        <th>PRODUCT NAME</th>
                        <th>QTY</th>
                        <th>UNIT PRICE</th>
                        <th>AMOUNT</th>
                        <th>PAYMENT METHOD</th>
                        <th>STATUS</th>
                      </thead>
                      <tbody className="r-no-data">
                        <div>
                          <img
                            src={noData}
                            alt="No Data"
                            className="r-data-icon"
                          />
                          <h2 className="no-data-label">No Data Found</h2>
                        </div>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-data-table">
                    <DataTable
                      columns={columns}
                      data={filteredTransactions}
                      pagination
                      paginationRowsPerPageOptions={[5, 10, 25]}
                      highlightOnHover
                      customStyles={customStyles}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="export-container d-none d-sm-inline-block">
              {authrztn?.includes("POSReport-IE") && (
                <button onClick={handleSelectExport} className={`e-data`}>
                  Export Data
                </button>
              )}
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
      </div>
    </>
  );
};

export default PosReports;
