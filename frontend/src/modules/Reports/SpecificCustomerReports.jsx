import React, { useEffect, useState, useRef } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { customStyles } from "../styles/table-style";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
// import DateRange from "../../components/DateRange";
import BASE_URL from "../../assets/global/url";
import noData from "../../assets/icon/no-data.png";
// import "../styles/pos_react.css"
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

const StudentReports = ({ authrztn }) => {
  const navigate = useNavigate();
  const [userId, setuserId] = useState("");
  const [studentReports, setStudentReports] = useState([]);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filteredTransactions, setFilteredTransactions] =
    useState(studentReports);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");

  const handleChangeStudent = (event) => {
    const selectedType = event.target.value;
    setSelectedStudent(selectedType);

    let filtered;

    if (selectedType == "Regular") {
      filtered = studentReports.filter(
        (report) => !report.student.credit_enable
      );
    } else if (selectedType == "Scholar") {
      filtered = studentReports.filter(
        (report) => report.student.credit_enable
      );
    } else {
      filtered = studentReports.filter(
        (report) => report.student.category == selectedType
      );
    }

    setFilteredTransactions(filtered);
  };

  const dropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const filteredData = studentReports.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredTransactions(filteredData);
    console.log(filteredData);
  }, [fromDate, endDate, studentReports]);

  const columns = [
    {
      name: "TRANSACTION DATE",
      selector: (row) => row.createdAt,
      cell: (row) => formatDate(row.createdAt),
    },
    {
      name: "RFID NUMBER",
      selector: (row) => row.student.rfid,
    },
    {
      name: "ACCOUNT NAME",
      selector: (row) => `${row.student.first_name} ${row.student.last_name}`,
    },
    {
      name: "CATEGORY",
      selector: (row) => row.student.category,
    },
    {
      name: "PAYMENT METHOD",
      selector: (row) => row.payment_method,
    },
  ];

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

  const handleFetchTransaction = async () => {
    const res = await axios.get(`${BASE_URL}/reports/fetchStudentReports`);
    setStudentReports(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchTransaction();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const handleRowClicked = (row) => {
    navigate(
      `/customer-report-details/${row.student.first_name} ${row.student.last_name}/${row.order_transaction_id}`
    );
  };

  const handleExport = () => {
    if (filteredTransactions.length <= 0) {
      alert("No Data");
      return;
    }
    // Extract specific fields for export
    const exportedData = filteredTransactions.map((item) => ({
      "TRANSACTION DATE": item.createdAt,
      "RFID NUMBER": item.student.rfid,
      "ACCOUNT NAME": `${item.student.first_name} ${item.student.last_name}`,
      CATEGORY: item.student.category,
      "PAYMENT METHOD": item.payment_method,
    }));
    // Convert exported data to CSV format
    const csv = [
      Object.keys(exportedData[0]).join(","), // Header row
      ...exportedData.map((item) => Object.values(item).join(",")),
    ].join("\n");
    // Create a Blob containing the CSV data
    const blob = new Blob([csv], { type: "text/csv" });
    // Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "customer_reports.csv";
    link.click();
  };

  const handleExportCSV = async () => {
    try {
      let dataForExport = [];

      // Fetch all data for export
      const res = await axios.get(BASE_URL + "/reports/fetchDataForExport");
      dataForExport = res.data;

      if (searchQuery.trim()) {
        dataForExport = dataForExport.filter((data) => {
          const fullName = `${data.order_transaction.student.first_name} ${data.order_transaction.student.last_name}`;
          return fullName
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase());
        });
      }

      // Filter data based on date range
      if (fromDate || endDate) {
        dataForExport = dataForExport.filter((data) => {
          const createdAt = new Date(data.createdAt);
          const start = fromDate ? new Date(`${fromDate}T00:00:00Z`) : null;
          const end = endDate ? new Date(`${endDate}T23:59:59Z`) : null;

          return (
            (!fromDate || createdAt >= start) && (!endDate || createdAt <= end)
          );
        });
      }

      // Proceed with CSV export if there are results
      if (dataForExport.length > 0) {
        const headers = [
          "NAME",
          "PRODUCT SKU",
          "PRODUCT NAME",
          "PRODUCT PRICE",
          "ORDERED QUANTITY",
          "TRANSACTION DATE",
        ];

        const csvContent =
          "data:text/csv;charset=utf-8," +
          headers.join(",") +
          "\n" +
          dataForExport
            .map((data) => {
              const fullName = `${data.order_transaction.student.first_name} ${data.order_transaction.student.last_name}`;
              return `${fullName},${data.product_inventory.product.sku},${
                data.cart_specification_variants.length > 0
                  ? `${
                      data.product_inventory.product.name
                    } (${data.cart_specification_variants
                      .map(
                        (variant) => variant.specification_variant.variant_name
                      )
                      .join(", ")})`
                  : data.product_inventory.product.name
              },${data.product_inventory.product.price},${
                data.quantity
              },${formatDate(data.createdAt)}`;
            })
            .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customer_report.csv");
        document.body.appendChild(link);
        link.click();

        // Log the export action
        axios.post(`${BASE_URL}/reports/customerExcelReportsLog`, {
          userId,
        });
      } else {
        swal({
          title: "There are no data to export!",
          icon: "error",
          button: "OK",
        }).then(() => {
          swal.close();
        });
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await axios.get(BASE_URL + "/reports/fetchDataForExport");
      let dataForExport = res.data;

      console.log(res.data);

      if (searchQuery.trim()) {
        dataForExport = dataForExport.filter((data) => {
          const fullName = `${data.order_transaction.student.first_name} ${data.order_transaction.student.last_name}`;
          return fullName
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase());
        });
      }

      if (fromDate || endDate) {
        dataForExport = dataForExport.filter((data) => {
          const createdAt = new Date(data.createdAt);
          const start = fromDate ? new Date(`${fromDate}T00:00:00Z`) : null;
          const end = endDate ? new Date(`${endDate}T23:59:59Z`) : null;

          return (
            (!fromDate || createdAt >= start) && (!endDate || createdAt <= end)
          );
        });
      }

      if (dataForExport.length > 0) {
        const doc = new jsPDF({ orientation: "landscape" });

        const tableData = dataForExport.map((data) => [
          `${data.order_transaction.student.first_name} ${data.order_transaction.student.last_name}`,
          data.product_inventory.product.sku,
          data.cart_specification_variants.length > 0
            ? `${
                data.product_inventory.product.name
              } (${data.cart_specification_variants
                .map((variant) => variant.specification_variant.variant_name)
                .join(", ")})`
            : data.product_inventory.product.name,
          data.purchased_amount,
          data.quantity,
          new Date(data.createdAt).toISOString().split("T")[0],
        ]);

        doc.autoTable({
          head: [
            [
              "NAME",
              "PRODUCT SKU",
              "PRODUCT NAME",
              "PRODUCT PRICE",
              "ORDERED QUANTITY",
              "TRANSACTION DATE",
            ],
          ],
          body: tableData,
        });

        const pdfBlob = new Blob([doc.output("blob")], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "customer_report.pdf"; // Set the desired filename here
        link.click();
        window.open(url);

        // Clean up
        URL.revokeObjectURL(url);

        axios.post(`${BASE_URL}/reports/customerPDFReportsLog`, {
          userId,
        });
      } else {
        swal({
          title: "There are no data to export!",
          icon: "error",
          button: "OK",
        }).then(() => {
          swal.close();
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
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
        handleExportCSV();
      } else if (value === "pdf") {
        handleExportPDF();
      }
    });
  };

  // Search

  const handleSearch = async (search) => {
    try {
      console.log("Search", search);
      const res = await axios.get(`${BASE_URL}/reports/searchStudent`, {
        params: {
          search,
        },
      });
      setStudentReports(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === "") {
      handleFetchTransaction();
    } else {
      handleSearch(value);
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
        ) : authrztn.includes("CustomerReport-View") ? (
          <div className="custom-card inv-card pb-0">
            <div className="pos-head-container ms-2 flex-column flex-sm-row">
              <div className="title-content-field ms-0 ms-lg-3">
                <h2>Specific Customer Reports</h2>
                <h4 id="dateFilterIndicator" className="fs-4"></h4>
              </div>

              {/* <select
                  className="form-select mb-0 me-3"
                  style={{ height: "40px", width: "15rem", fontSize: "1.2rem" }}
                  onChange={handleChangeStudent}
                >
                  <option value="" disabled selected>
                    Select Type
                  </option>
                  <option value="Regular">Regular</option>
                  <option value="Scholar">Scholar</option>
                  <option value="Department">Department</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Employee">Employee</option>
                </select> */}
              <div class="input-group align-items-center py-2 py-0">
                <input
                  type="text"
                  class="form-control search m-0"
                  placeholder="Search Customer Name"
                  aria-describedby="addon-wrapping"
                  onChange={handleSearchChange}
                />
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
              <div className="export-container d-inline-block d-sm-none mb-1">
                {authrztn?.includes("CustomerReport-IE") && (
                  <button
                    onClick={handleSelectExport}
                    // className={`${
                    //   filteredTransactions.length == 0 ? "e-data" : "e-data"
                    // }`}
                    className="e-data export-button w-100"
                  >
                    Export Data
                  </button>
                )}
              </div>
            </div>

            <div className="table">
              {filteredTransactions.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>TRANSACTION DATE</th>
                        <th>RFID NUMBER</th>
                        <th>ACCOUNT NAME</th>
                        <th>CATEGORY</th>
                        <th>PAYMENT METHOD</th>
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
                      customStyles={customStyles}
                      pagination
                      onRowClicked={handleRowClicked}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="export-container d-none d-sm-inline-block">
              {authrztn?.includes("CustomerReport-IE") && (
                <button onClick={handleSelectExport} className="e-data">
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

export default StudentReports;
