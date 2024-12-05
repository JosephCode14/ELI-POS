import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { Modal, Button, Row, Col, Form, Dropdown } from "react-bootstrap";
import noData from "../../assets/icon/no-data.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import "../styles/usermanagement.css";
import swal from "sweetalert";
// import "../styles/pos_react.css";
import { customStyles } from "../styles/table-style";
import { FourSquare } from "react-loading-indicators";
import { height } from "@mui/system";
import jsPDF from "jspdf";
import "jspdf-autotable";

function GeneralCustomerReports({ authrztn }) {
  const [showDetails, setShowDetails] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleShowDetailsModal = () => setShowDetails(true);

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);
  const [userData, setUserData] = useState([]);
  const [specificStudent, setSpecificStudent] = useState([]);
  const [studBalance, setStudBalance] = useState(0);

  const [studentTotal, setStudentTotal] = useState({
    totalTopUp: 0,
    totalCredits: 0,
    totalBalance: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const totalCredits = filteredTransactions.reduce((acc, transac) => {
      return (
        acc +
        (transac.order_transaction_id ? parseFloat(transac.received_amount) : 0)
      );
    }, 0);

    const totalTopUp = filteredTransactions.reduce((acc, transac) => {
      return acc + (transac.order_transaction_id ? 0 : transac.load_amount);
    }, 0);

    const totalBalance = totalTopUp - totalCredits;

    setStudentTotal({
      totalTopUp,
      totalCredits,
      totalBalance: totalBalance,
    });
  }, [filteredTransactions]);

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

  const handleCloseDetailsModal = () => {
    setTransactions([]);
    setExpandedRow(null);
    setShowDetails(false);
    setFromDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
  };

  const calculateCreditUsed = (transactions) => {
    return transactions.reduce((total, transaction) => {
      return total + parseFloat(transaction.received_amount);
    }, 0);
  };

  const userColumns = [
    {
      name: "RFID",
      selector: (row) => row.student.rfid,
    },
    {
      name: "NAME",
      selector: (row) => `${row.student.first_name} ${row.student.last_name}`,
    },
    {
      name: "REGISTRATION DATE",
      selector: (row) => formatDate(row.student.createdAt),
    },
    {
      name: "SAVINGS USED",
      selector: (row) =>
        row.student && row.student.order_transactions
          ? calculateCreditUsed(row.student.order_transactions)
          : 0,
    },
    {
      name: "BALANCE",
      selector: (row) => row.balance,
    },
    {
      name: "STATUS",
      selector: (row) => row.student.status,
      cell: (row) => (
        <div
          style={{
            background:
              row.student.status === "Active"
                ? "green"
                : row.student.status === "Inactive"
                ? "red"
                : row.student.status === "Archive"
                ? "gray"
                : "inherit",
            padding: "5px",
            width: "6em",
            color: "white",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          {row.student.status}
        </div>
      ),
    },
  ];

  const handleRowClicked = async (row) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user_transaction/getSpecificStudent/${row.student_id}`
      );
      handleShowDetailsModal();
      const orderTransactions = res.data[0]?.student.order_transactions || [];
      const loadTransactions = res.data[0].load_transactions;

      const combineTransaction = [...orderTransactions, ...loadTransactions];

      setTransactions(combineTransaction.reverse());
      console.log("Combine", combineTransaction);
      setStudBalance(row.balance);
      setSpecificStudent(res.data[0].student);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFetchUser = async () => {
    const res = await axios.get(`${BASE_URL}/user_transaction/getStudent`);
    setUserData(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchUser();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (search) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user_transaction/getSearchUser`,
        {
          params: {
            search,
          },
        }
      );
      setUserData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() == "") {
      handleFetchUser();
    } else {
      handleSearch(value);
    }
  };

  // const handleFilter = (e) => {
  //   let value = e.target.value;

  //   console.log(value)
  //   axios
  //     .get(`${BASE_URL}/user_transaction/filterStudent/${value}`)
  //     .then((res) => {
  //       setUserData(res.data);
  //       console.log("Data", res.data)
  //     })
  //     .catch((err) => console.log(err));
  // };
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [filteredUser, setFilteredUser] = useState([]);
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // const filteredData = userData.filter(
  //   (student) => student.student.status === statusFilter
  // );

  const [showDropdown, setShowDropdown] = useState(false);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const filteredData = userData.filter((student) => {
      const transactionDate = new Date(student.createdAt);
      const start = fromDate ? new Date(`${fromDate}T00:00:00Z`) : null;
      const end = endDate ? new Date(`${endDate}T23:59:59Z`) : null;

      const isWithinDateRange =
        (!start || transactionDate >= start) &&
        (!end || transactionDate <= end);

      const isStatusMatch =
        statusFilter === "All Status" ||
        student.student.status === statusFilter;

      return isStatusMatch;
    });

    setFilteredUser(filteredData);
  }, [fromDate, endDate, statusFilter, userData]);

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

  const dropdownRef = useRef(null);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const filteredData = transactions.filter((inv) => {
      const transactionDate = new Date(inv.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredTransactions(filteredData);
  }, [fromDate, endDate, transactions]);

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
    setFromDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
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

    if (format === "excel") {
      const studentName = specificStudent
        ? `${specificStudent.first_name} ${specificStudent.last_name}`
        : "";
      const dateGenerated = new Date().toISOString().split("T")[0];
      const dateRangeFrom =
        fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
      const dateRangeTo =
        endDate == "" ? new Date().toISOString().split("T")[0] : endDate;

      const exportedData = filteredTransactions.flatMap((transac) => {
        // Basic transaction data
        const transactionData = {
          "TRANSACTION DATE": new Date(transac.createdAt)
            .toISOString()
            .split("T")[0],
          "OLD BALANCE": transac.order_transaction_id
            ? transac.balance_histories[0]?.old_balance || "0"
            : transac.old_balance || "0",
          "SAVINGS USED": transac.order_transaction_id
            ? transac.received_amount
            : "0",
          "TOP UP": transac.order_transaction_id
            ? "0"
            : transac.load_amount || "0",
          BALANCE: transac.order_transaction_id
            ? transac.balance_histories[0]?.new_balance || "0"
            : transac.new_balance || "0",
        };

        // Check if the transaction has cart items and map over them if available
        const cartRows =
          transac.carts?.length > 0
            ? transac.carts.map((cart) => ({
                "TRANSACTION DATE": "", // Keep empty for cart rows
                "OLD BALANCE": "", // Keep empty for cart rows
                "SAVINGS USED": "", // Keep empty for cart rows
                "TOP UP": "",
                BALANCE: "",
                "PAYMENT METHOD": transac.payment_method,
                "ITEM NAME": `${cart.product_inventory.product.name}${
                  cart.cart_specification_variants.length > 0
                    ? ` (${cart.cart_specification_variants
                        .map(
                          (variant) =>
                            variant.specification_variant.variant_name
                        )
                        .join(", ")})`
                    : ""
                }`,
                "UNIT PRICE": `${cart.product_inventory.product.price}${
                  cart.cart_specification_variants.length > 0
                    ? ` + ${cart.cart_specification_variants
                        .map(
                          (variant) =>
                            variant.specification_variant.variant_price
                        )
                        .join(", ")}`
                    : ""
                }`,
                QUANTITY: cart.quantity,
                "TOTAL PRICE": cart.subtotal,
              }))
            : []; // If no carts, return an empty array

        // Return the transaction data, followed by any cart data (if any)
        return [transactionData, ...cartRows];
      });

      const headers = [
        "TRANSACTION DATE",
        "OLD BALANCE",
        "SAVINGS USED",
        "TOP UP",
        "BALANCE",
        "PAYMENT METHOD",
        "ITEM NAME",
        "UNIT PRICE",
        "QUANTITY",
        "TOTAL PRICE",
      ];

      // Convert exported data to CSV format
      const csv = [
        `NAME,${studentName}`, // Row for student's name
        `DATE GENERATED,${dateGenerated}`, // Row for date generated
        `DATE RANGE,${dateRangeFrom},${dateRangeTo}`, // Row for date range
        "", // Empty row for spacing
        headers.join(","), // Header row for transaction data
        ...exportedData.map((item) =>
          headers.map((header) => item[header] || "").join(",")
        ),
        "",
        `TOTAL TOP UP,${studentTotal.totalTopUp}`,
        `TOTAL SAVINGS USED,${studentTotal.totalCredits}`,
        `TOTAL BALANCE,${studentTotal.totalTopUp}`,
      ].join("\n");

      // Create a Blob containing the CSV data
      const blob = new Blob([csv], { type: "text/csv" });
      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "general_reports.csv";
      link.click();
    } else {
      const studentName = specificStudent
        ? `${specificStudent.first_name} ${specificStudent.last_name}`
        : "";
      const dateGenerated = new Date().toISOString().split("T")[0];
      const dateRangeFrom =
        fromDate === "" ? new Date().toISOString().split("T")[0] : fromDate;
      const dateRangeTo =
        endDate === "" ? new Date().toISOString().split("T")[0] : endDate;

      const exportedData = filteredTransactions.flatMap((transac) => {
        console.log("amoount", transac.received_amount, transac);
        // Basic transaction data
        const transactionData = {
          "TRANSACTION DATE": new Date(transac.createdAt)
            .toISOString()
            .split("T")[0],
          "OLD BALANCE": transac.order_transaction_id
            ? transac.balance_histories[0]?.old_balance || 0
            : transac.old_balance || 0,
          "SAVINGS USED": transac.order_transaction_id
            ? transac.received_amount
            : "0",
          "TOP UP": transac.order_transaction_id
            ? "0"
            : transac.load_amount || "0",
          BALANCE: transac.order_transaction_id
            ? transac.balance_histories[0]?.new_balance || "0"
            : transac.new_balance || "0",
        };

        // Check if the transaction has cart items and map over them if available
        const cartRows =
          transac.carts?.length > 0
            ? transac.carts.map((cart) => ({
                "TRANSACTION DATE": "", // Keep empty for cart rows
                "OLD BALANCE": "",
                "SAVINGS USED": "",
                "TOP UP": "",
                BALANCE: "",
                "PAYMENT METHOD": transac.payment_method || "N/A",
                "ITEM NAME": `${cart.product_inventory.product.name || "N/A"}${
                  cart.cart_specification_variants.length > 0
                    ? ` (${cart.cart_specification_variants
                        .map(
                          (variant) =>
                            variant.specification_variant.variant_name || "N/A"
                        )
                        .join(", ")})`
                    : ""
                }`,
                "UNIT PRICE": `${cart.product_inventory.product.price || 0}${
                  cart.cart_specification_variants.length > 0
                    ? ` + ${cart.cart_specification_variants
                        .map(
                          (variant) =>
                            variant.specification_variant.variant_price || 0
                        )
                        .join(", ")}`
                    : ""
                }`,
                QUANTITY: cart.quantity || 0,
                "TOTAL PRICE": cart.subtotal || 0,
              }))
            : []; // If no carts, return an empty array

        // Return the transaction data, followed by any cart data (if any)
        return [transactionData, ...cartRows];
      });

      const headers = [
        "TRANSACTION DATE",
        "OLD BALANCE",
        "SAVINGS USED",
        "TOP UP",
        "BALANCE",
        "PAYMENT METHOD",
        "ITEM NAME",
        "UNIT PRICE",
        "QUANTITY",
        "TOTAL PRICE",
      ];

      exportedData.push({
        "TRANSACTION DATE": "TOTAL SAVINGS USED",
        "OLD BALANCE": studentTotal.totalCredits.toFixed(2),
        "SAVINGS USED": "",
        "TOP UP": "",
        BALANCE: "",
        "PAYMENT METHOD": "",
        "ITEM NAME": "",
        "UNIT PRICE": "",
        QUANITY: "",
        "TOTAL PRICE": "",
      });
      exportedData.push({
        "TRANSACTION DATE": "TOTAL TOP UP",
        "OLD BALANCE": studentTotal.totalTopUp.toFixed(2),
        "SAVINGS USED": "",
        "TOP UP": "",
        BALANCE: "",
        "PAYMENT METHOD": "",
        "ITEM NAME": "",
        "UNIT PRICE": "",
        QUANITY: "",
        "TOTAL PRICE": "",
      });
      exportedData.push({
        "TRANSACTION DATE": "TOTAL BALANCE",
        "OLD BALANCE": studentTotal.totalTopUp.toFixed(2),
        "SAVINGS USED": "",
        "TOP UP": "",
        BALANCE: "",
        "PAYMENT METHOD": "",
        "ITEM NAME": "",
        "UNIT PRICE": "",
        QUANITY: "",
        "TOTAL PRICE": "",
      });
      // Create a new jsPDF instance
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(10);
      // Add a title
      doc.text(`Student Name: ${studentName}`, 14, 10);
      doc.text(`Date Generated: ${dateGenerated}`, 14, 15);
      doc.text(`Date Range: ${dateRangeFrom} to ${dateRangeTo}`, 14, 20);

      doc.autoTable({
        head: [headers],
        body: exportedData.map((item) =>
          headers.map((header) => item[header] || "")
        ),

        startY: 28,
      });

      // Save the PDF
      const pdfBlob = new Blob([doc.output("blob")], {
        type: "application/pdf",
      });

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = "general_reports.pdf";
      link.download = fileName;
      link.click();
      window.open(url);
    }
  };

  useEffect(() => {
    console.log("Spec", specificStudent);
  }, [specificStudent]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to update the window width state
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  // Set up event listener for window resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div className="inventory-container">
        {isLoading ? (
          <div className="loading-container" style={{ margin: "0" }}>
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("GeneralReport-View") ? (
          <div className="custom-card inv-card pb-0">
            <div className="pos-head-container ms-0 ms-sm-2 flex-column flex-sm-row pe-0 pe-sm-2">
              <div className="title-content-field ms-0 ms-lg-3">
                <h2>General Customer Reports</h2>
                {/* <h4 id="dateFilterIndicator"></h4> */}
              </div>

              <div className="d-flex gap-3 mt-2 py-1 px-0">
                <div class="input-group w-100" style={{ marginLeft: "2px" }}>
                  <input
                    type="text"
                    class="form-control search m-0"
                    placeholder="Search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ fontSize: "1.5rem" }}
                  />
                </div>
                <div
                  className="user-filter d-flex p-0 w-50 justify-content-end"
                  style={{ marginRight: "2px" }}
                >
                  <select
                    class="form-select m-0 select-transac"
                    onChange={handleStatusFilterChange}
                    style={{ fontSize: "1.3rem" }}
                  >
                    <option disabled>Status</option>
                    <option value="All Status">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* <div className="filter-button-container">
              <div className="filter-button-container-container">
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

                {showDropdown && (
                  <Dropdown.Menu
                    ref={dropdownRef}
                    show
                    className="dropdown-menu"
                  >
                    <div className="filter-menu-container">
                      <div className="filter-menu-title-container d-flex p-0 justify-content-between">
                        <div>Filter by date</div>
                        <div>
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
                      </div>
                      <Dropdown.Divider />

                      <div className="filter-menu-body-container">
                        <div className="days-modal-container">
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
            </div>   */}
            </div>

            <div className="mt-4">
              {filteredUser.length == 0 ? (
                <>
                  <div className="no-data-table ">
                    <table>
                      <thead>
                        <th>RFID</th>
                        <th>NAME</th>
                        <th>REGISTRATION DATE</th>
                        <th>SAVINGS USED</th>
                        <th>BALANCE</th>
                        <th>STATUS</th>
                      </thead>
                      <tbody className="r-no-data">
                        <div>
                          <img
                            src={noData}
                            alt="No Data"
                            className="no-data-icon"
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
                      columns={userColumns}
                      data={filteredUser}
                      pagination
                      customStyles={customStyles}
                      onRowClicked={handleRowClicked}
                    />
                  </div>
                </>
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
              marginTop: "14%",
              marginLeft: "11.9%",
            }}
          >
            <img src={NoAccess} alt="NoAccess" className="no-access-img" />
            <h3>You don't have access to this function.</h3>
          </div>
        )}
      </div>

      <Modal show={showDetails} onHide={handleCloseDetailsModal} size="xl">
        <Modal.Header>
          <div className="d-flex flex-column w-100 px-5 px-sm-0 flex-sm-row justify-content-between align-items-center">
            <div className="col-sm-4">
              <h2>
                RFID # {specificStudent ? specificStudent.rfid : ""} -{" "}
                {specificStudent
                  ? `${specificStudent.first_name} ${specificStudent.last_name}`
                  : ""}
              </h2>
            </div>
            <h4 id="dateFilterIndicator" className="fs-4 text-center col-sm-3"></h4>
            <div className="d-flex flex-column flex-sm-row p-0" style={{ width: windowWidth < 576 && "100%"}}>
              <div className="filter-button-container justify-content-center">
                <Button
                  className="responsive nowrap general-customer-reports-filter"
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
              <div className="export-container align-self-center w-100">
                {authrztn?.includes("GeneralReport-IE") && (
                  <button
                    onClick={handleSelectExport}
                    style={{ height: "40px", flex: "40%"}}
                    className="w-100"
                  >
                    Export Data
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="filtering-category-container d-flex justify-content-between">
              <div className="d-flex receivingID p-0"></div>

              {/* <div
                className="d-flex p-0 align-items-center"
                style={{ gap: "20px" }}
              >
                <div className="w-100">
                  <p>Filter Date: </p>
                </div>
                <input
                  type="date"
                  class="form-control i-date mb-0"
                  id="exampleFormControlInput1"
                />
              </div> */}
            </div>
            <div className="mt-4">
              <div className="table-container">
                <table className="custom-user-table user-transac-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>TRANSACTION DATE</th>
                      <th>PREV BALANCE</th>
                      <th>SAVINGS USED</th>
                      <th>TOP UP</th>
                      <th>BALANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transac, index) => (
                      <>
                        <tr>
                          <td>
                            {transac.order_transaction_id && (
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
                            )}
                          </td>
                          <td className="arrow">
                            {formatDate(transac.createdAt)}
                          </td>
                          <td>
                            {transac.order_transaction_id ? (
                              <>{transac.balance_histories[0].old_balance}</>
                            ) : (
                              <>{transac.old_balance}</>
                            )}
                          </td>
                          <td>
                            {transac.order_transaction_id ? (
                              <>{transac.received_amount}</>
                            ) : (
                              <>0</>
                            )}
                          </td>

                          <td>
                            {transac.order_transaction_id ? (
                              <>0</>
                            ) : (
                              <>{transac.load_amount}</>
                            )}
                          </td>
                          <td>
                            {transac.order_transaction_id ? (
                              <>{transac.balance_histories[0].new_balance}</>
                            ) : (
                              <>{transac.new_balance}</>
                            )}
                          </td>
                        </tr>

                        {expandedRow === index && (
                          <tr>
                            <td colSpan="6" className="pop-table">
                              <table>
                                <thead>
                                  <tr>
                                    <th>ITEM NAME</th>
                                    <th>UNIT PRICE</th>
                                    <th>QUANTITY</th>
                                    <th>TOTAL PRICE</th>
                                    <th>PAYMENT</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transac.carts.map((cart, cartIndex) => (
                                    <tr key={`cart-${cartIndex}`}>
                                      <td>
                                        {cart.product_inventory.product.name}
                                        <br />

                                        {cart.cart_specification_variants
                                          .length > 0
                                          ? `(${cart.cart_specification_variants
                                              .map(
                                                (variant) =>
                                                  variant.specification_variant
                                                    .variant_name
                                              )
                                              .join(", ")})`
                                          : null}
                                      </td>
                                      <td>
                                        {cart.product_inventory.product.price}
                                        {cart.cart_specification_variants
                                          .length > 0
                                          ? `+ ${cart.cart_specification_variants
                                              .map(
                                                (variant) =>
                                                  variant.specification_variant
                                                    .variant_price
                                              )
                                              .join(", ")}`
                                          : null}
                                      </td>
                                      <td>{cart.quantity}</td>
                                      <td>{cart.subtotal}</td>
                                      <td>{transac.payment_method}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="points">
              {/* <div className="total-pts d-flex">
                <h2>TOTAL EARNED POINTS</h2>
                <h3>5 points</h3>
              </div> */}
              <div className="total-pts d-flex">
                <h2>TOTAL TOP UP</h2>
                <h3>{studentTotal.totalTopUp}</h3>
              </div>
              <div className="total-pts d-flex">
                <h2>TOTAL SAVINGS USED</h2>
                <h3>{studentTotal.totalCredits}</h3>
              </div>
              <div className="total-pts d-flex">
                <h2>TOTAL BALANCE</h2>
                <h3>{studBalance}</h3>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default GeneralCustomerReports;
