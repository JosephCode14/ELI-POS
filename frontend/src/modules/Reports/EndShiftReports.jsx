import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Dropdown, Form } from "react-bootstrap";
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

const EndShiftReports = ({ authrztn }) => {
  const dropdownRef = useRef(null);
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [endShiftReports, setEndShiftReports] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [specificDataModal, setSpecificDataModal] = useState(false);
  const [specificData, setSpecificData] = useState([]);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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

  const columns = [
    {
      name: "CASHIER NAME",
      selector: (row) => row.employee_name,
    },
    {
      name: "START SHIFT",
      selector: (row) => formatDate(row.start_shift),
      sortable: true,
    },
    {
      name: "END SHIFT",
      selector: (row) => formatDate(row.end_shift),
      sortable: true,
    },
    {
      name: "SHIFT DURATION",
      selector: (row) => row.shift_duration,
      sortable: true,
    },
    {
      name: "REMARKS",
      selector: (row) => row.remarks,
      sortable: true,
    },
  ];

  const specificDataCol = [
    {
      name: "TOTAL CASH",
      selector: (row) => row.total_cash,
    },
    {
      name: "TOTAL CARD",
      selector: (row) => row.total_card,
      sortable: true,
    },
    {
      name: "TOTAL LOAD",
      selector: (row) => row.total_load,
      sortable: true,
    },
    {
      name: "CASH DRAWER",
      selector: (row) => row.cash_drawer,
      sortable: true,
    },
    {
      name: "DIFFERENCE",
      selector: (row) => row.difference,
      sortable: true,
    },
    {
      name: "REMITTANCE",
      selector: (row) => row.remittance,
      sortable: true,
    },
    {
      name: "TOTAL CHECKOUT",
      selector: (row) => row.total_checkout,
      sortable: true,
    },
    {
      name: "TOTAL INCOME",
      selector: (row) => row.total_income,
      sortable: true,
    },
    {
      name: "TOTAL REFUND",
      selector: (row) => row.total_refund,
      sortable: true,
    },
  ];

  useEffect(() => {
    const filteredData = endShiftReports.filter((transaction) => {
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
  }, [fromDate, endDate, endShiftReports]);

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

  const handleFetchEndShiftReports = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/endShiftReports`);
      setEndShiftReports(res.data.reverse());
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  const handleRowClicked = (row) => {
    setSpecificData(row);
    setSpecificDataModal(true);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchEndShiftReports();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [showDropdown, setShowDropdown] = useState(false);

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

  const handleCloseDataModal = () => {
    setSpecificDataModal(false);
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

  // To make numbers have comma
  const formatNumber = (num) => {
    const formatNum = `"  ${num.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}"`;

    return formatNum;
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
    axios.post(`${BASE_URL}/reports/endLog`, {
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
      const posReportsRow = [
        "REPORT:",
        " END SHIFT REPORTS",
        "",
        "",
        "",
        "",
        "",
      ];
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
        "CASHIER NAME",
        "START SHIFT",
        "END SHIFT",
        "SHIFT DURATION",
        "REMARKS",
        "TOTAL CASH",
        "TOTAL CARD",
        "TOTAL LOAD",
        "CASH DRAWER",
        "DIFFERENCE",
        "REMITTANCE",
        "TOTAL CHECKOUT",
        "TOTAL INCOME",
        "TOTAL REFUND",
        "STARTING MONEY",
      ];

      // Add table headers to exportedData
      exportedData.push(tableHeaders);

      // Map dataToExport to exportedData format
      exportedData = exportedData.concat(
        dataToExport.map((item) => [
          item.employee_name,
          new Date(item.start_shift).toISOString().split("T")[0],
          new Date(item.end_shift).toISOString().split("T")[0],
          item.shift_duration,
          item.remarks,
          formatNumber(item.total_cash),
          formatNumber(item.total_card),
          formatNumber(item.total_load),
          formatNumber(item.cash_drawer),
          formatNumber(item.difference),
          formatNumber(item.remittance),
          item.total_checkout,
          formatNumber(item.total_income),
          formatNumber(item.total_refund),
          formatNumber(item.starting_money),
        ])
      );

      // Convert exported data to CSV format
      const csv = exportedData.map((row) => row.join(",")).join("\n");

      // Create a Blob containing the CSV data
      const blob = new Blob([csv], { type: "text/csv" });

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      const fileName = "end_shift_reports.csv";
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

      dataToExport.forEach((item) => {
        tableData.push([
          item.employee_name,
          new Date(item.start_shift).toISOString().split("T")[0],
          new Date(item.end_shift).toISOString().split("T")[0],
          item.shift_duration,
          item.remarks,
          item.total_cash,
          item.total_card,
          item.total_load,
          item.cash_drawer,
          item.difference,
          item.remittance,
          item.total_checkout,
          item.total_income,
          item.total_refund,
          item.starting_money,
        ]);
      });

      // Generate the PDF table with jsPDF and autoTable

      doc.setFontSize(10);
      doc.text("END SHIFT REPORTS", 10, 10);

      doc.text(`Date Coverage: ${fromRange} to ${toRange}`, 70, 10);
      doc.text(`Date Generated: ${new Date().toLocaleString()}`, 180, 10);
      const headerStyle = {
        fillColor: [0, 0, 255],
        textColor: [255, 255, 255],
      };

      doc.autoTable({
        head: [
          [
            { content: "CASHIER NAME", styles: headerStyle },
            { content: "START SHIFT", styles: headerStyle },
            { content: "END SHIFT", styles: headerStyle },
            { content: "SHIFT DURATION", styles: headerStyle },
            { content: "REMARKS", styles: headerStyle },
            { content: "TOTAL CASH", styles: headerStyle },
            { content: "TOTAL CARD", styles: headerStyle },
            { content: "TOTAL LOAD", styles: headerStyle },
            { content: "CASH DRAWER", styles: headerStyle },
            { content: "DIFFERENCE", styles: headerStyle },
            { content: "REMITTANCE", styles: headerStyle },
            { content: "TOTAL CHECKOUT", styles: headerStyle },
            { content: "TOTAL INCOME", styles: headerStyle },
            { content: "TOTAL REFUND", styles: headerStyle },
            { content: "STARTING MONEY", styles: headerStyle },
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
      const fileName = "end_shift_reports.pdf";
      link.download = fileName;
      link.click();
      window.open(url);
    }
  };

  return (
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
      ) : authrztn.includes("EndShiftReport-View") ? (
        <div className="custom-card inv-card pb-0">
          <div className="pos-head-container ms-2 mb-2 flex-column flex-sm-row">
            <div className="title-content-field ms-0 ms-lg-3">
              <h2>End Shift Reports</h2>
              <h4 id="dateFilterIndicator"></h4>
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
            <div className="export-container mb-2 d-inline-block d-sm-none">
                {authrztn?.includes("EndShiftReport-IE") && (
                  <button
                    onClick={handleSelectExport}
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
                      <th>CASHIER NAME</th>
                      <th>START SHIFT</th>
                      <th>END SHIFT</th>
                      <th>SHIFT DURATION</th>
                      <th>REMARKS</th>
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
            {authrztn?.includes("EndShiftReport-IE") && (
              <button className="e-data" onClick={handleSelectExport}>
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

      <Modal show={specificDataModal} onHide={handleCloseDataModal} size="xl">
        <Modal.Header>
          <div className="d-flex w-100 p-3 justify-content-between align-items-center">
            <div>
              <p className="h2">{specificData?.employee_name}</p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "0" }}>
          <div className="d-flex flex-column flex-xl-row w-100">
            <div className="d-flex flex-column w-100 justify-content-start">
              <div className="d-flex p-0 me-xl-5">
                <Form.Label
                  style={{
                    fontSize: "16px",
                    marginTop: "10px",
                    marginRight: "10px",
                    width: "120px",
                  }}
                >
                  Start Shift:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0 w-75"
                  defaultValue={formatDate(specificData?.start_shift || "")}
                  // style={{ width: "300px" }}
                />
              </div>

              <div className="d-flex pb-1 me-xl-5">
                <Form.Label
                  style={{
                    fontSize: "16px",
                    marginTop: "10px",
                    marginRight: "10px",
                    width: "120px",
                  }}
                >
                  End Shift:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0 w-75"
                  defaultValue={formatDate(specificData?.end_shift || "")}
                  // style={{ width: "300px" }}
                />
              </div>
            </div>

            <div className="d-flex w-100">
              <Form.Label
                style={{
                  fontSize: "16px",
                  marginTop: "10px",
                  marginRight: "10px",
                }}
              >
                Notes / Remarks:
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                as="textarea"
                className="mb-0 w-75"
                value={specificData?.remarks || ""}
                style={{ height: "100px", paddingTop: "10px" }}
              />
            </div>
          </div>
          <DataTable
            columns={specificDataCol}
            customStyles={customStyles}
            data={specificData ? [specificData] : []}
            pagination
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EndShiftReports;
