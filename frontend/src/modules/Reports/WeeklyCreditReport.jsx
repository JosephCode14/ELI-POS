import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import { customStyles } from "../styles/table-style";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import { Button, Modal, Form, Dropdown } from "react-bootstrap";
import noData from "../../assets/icon/no-data.png";
import swal from "sweetalert";
import "jspdf-autotable";
import jsPDF from "jspdf";
import WeeklyCreditReportDetails from "./WeeklyCreditReportDetails";
import { jwtDecode } from "jwt-decode";
const WeeklyCreditReport = ({ authrztn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [weekCreditReport, setWeekCreditReport] = useState([]);
  const [filteredTransactions, setFilteredTransactions] =
    useState(weekCreditReport);
  const [specificWeekModal, setSpecificWeekModal] = useState(false);

  const [userId, setuserId] = useState("");

  const [specificWeekData, setSpecificWeekData] = useState({
    data: [],
    approver: "",
    requestor: "",
    date_from: "",
    date_to: "",
    date_approved: "",
    credit_price: "",
  });

  const [fromDate, setFromDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // For Filter
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
    const filteredData = weekCreditReport.filter((transaction) => {
      const transactionDateFrom = new Date(transaction.date_from);
      const transactionDateTo = new Date(transaction.date_to);

      const start = fromDate ? new Date(fromDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      return (
        (!start || transactionDateFrom >= start) &&
        (!end || transactionDateTo <= end)
      );
    });

    setFilteredTransactions(filteredData);
  }, [fromDate, endDate, weekCreditReport]);

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

  const handleClearFilter = () => {
    // setFromDate("");
    // setEndDate("");
    const currentDate = new Date().toISOString().split("T")[0];
    setFromDate(`${currentDate}`);
    setEndDate(`${currentDate}`);
  };

  const formatDate = (date) => {
    return date.split("T")[0];
  };

  const weekCreditColumn = [
    {
      name: "Date From",
      selector: (row) => formatDate(row.date_from),
    },
    {
      name: "Date To",
      selector: (row) => formatDate(row.date_to),
    },
    {
      name: "Approver",
      selector: (row) => row.approver,
    },
    {
      name: "Requestor",
      selector: (row) => row.requestor,
    },
    {
      name: "Date Approved",
      selector: (row) => row.date_approved,
    },
  ];

  const handleFetchWeekReport = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/weekCreditReport`);
      setWeekCreditReport(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchWeekReport();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    console.log("Credit", weekCreditReport);
  }, [weekCreditReport]);

  const handleRowClicked = async (row) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/reports/weekCreditReportSpecific`,
        {
          params: {
            fromDate: formatDate(row.date_from),
            endDate: formatDate(row.date_to),
          },
        }
      );

      console.log("Fetch", res.data);
      setSpecificWeekModal(true);
      setSpecificWeekData({
        data: res.data,
        approver: row.approver,
        requestor: row.requestor,
        date_from: formatDate(row.date_from),
        date_to: formatDate(row.date_to),
        date_approved: row.date_approved,
        credit_price: row.credit_price,
      });
    } catch (error) {
      console.error(error);
    }
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

  const handleExport = async (format) => {
    try {
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
      console.log(filteredTransactions);
      const res = await axios.get(`${BASE_URL}/reports/weekCreditToExport`, {
        params: {
          filteredTransactions,
          userId,
          format,
        },
      });

      console.log("Fetchh", res.data);

      if (format == "excel") {
        const exportedData = res.data.map((item) => ({
          "STUDENT ID": item.student.student_number,
          NAME: `${item.student.first_name} ${item.student.last_name}`,
          DATE: item.date_valid,
          BREAKFAST: item.static_breakfast ? 1 : 0,
          LUNCH: item.static_lunch ? 1 : 0,
          DINNER: item.static_dinner ? 1 : 0,
          APPROVER: item.ApprovedBy.col_name,
          REQUESTOR: item.RequestBy.col_name,
          "DATE APPROVED": item.date_approved,
        }));

        const dateGenerated = new Date().toISOString().split("T")[0];
        const dateRangeFrom = new Date().toISOString().split("T")[0];
        const dateRangeTo = new Date().toISOString().split("T")[0];

        // Convert exported data to CSV format
        const csv = [
          `REPORT:, WEEKLY CREDIT REPORTS`,
          `DATE GENERATED, ${dateGenerated}`,
          `DATE RANGE, ${dateRangeFrom}, ${dateRangeTo}`,
          Object.keys(exportedData[0]).join(","), // Header row
          ...exportedData.map((item) => Object.values(item).join(",")),
        ].join("\n");
        // Create a Blob containing the CSV data
        const blob = new Blob([csv], { type: "text/csv" });
        // Create a download link and trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);

        link.download = "weekly_credit_report.csv";
        link.click();
      } else {
        const doc = new jsPDF({ orientation: "landscape" });

        const tableData = res.data.map((item) => {
          let breakfast = item.static_breakfast ? 1 : 0;

          let lunch = item.static_lunch ? 1 : 0;

          let dinner = item.static_dinner ? 1 : 0;

          return [
            item.student.student_number,
            `${item.student.first_name} ${item.student.last_name}`,
            item.date_valid,
            breakfast,
            lunch,
            dinner,
            item.ApprovedBy.col_name,
            item.RequestBy.col_name,
            item.date_approved,
          ];
        });

        const dateGenerated = new Date().toISOString().split("T")[0];
        const dateRangeFrom = new Date().toISOString().split("T")[0];
        const dateRangeTo = new Date().toISOString().split("T")[0];

        doc.setFontSize(10);
        // Add a title
        doc.text(`Report: Weekly credit reports`, 14, 10);
        doc.text(`Date Generated: ${dateGenerated}`, 70, 10);
        doc.text(`Date Range: ${dateRangeFrom} to ${dateRangeTo}`, 180, 10);

        doc.autoTable({
          head: [
            [
              "STUDENT ID",
              "NAME",
              "DATE",
              "BREAKFAST",
              "LUNCH",
              "DINNER",
              "APPROVER",
              "REQUESTOR",
              "DATE APPROVED",
            ],
          ],
          body: tableData,
        });
        const link = document.createElement("a");
        const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);
        link.href = window.URL.createObjectURL(pdfBlob);

        link.download = "weekly_credit_reports.pdf";
        link.click();
        window.open(url);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        ) : authrztn.includes("WeekCreditReport-View") ? (
          <div className="custom-card inv-card pb-0">
            <div className="pos-head-container ms-2 flex-column flex-sm-row">
              <div className="title-content-field ms-0 ms-lg-3">
                <h2>Weekly Credit Reports</h2>
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
                {authrztn?.includes("WeekCreditReport-IE") && (
                  <button
                    style={{ position: "relative" }}
                    onClick={handleSelectExport}
                    className="export-button w-100"
                  >
                    Export Data
                  </button>
                )}
              </div>
            </div>

            {filteredTransactions.length == 0 ? (
              <>
                <div className="no-data-table mt-2 ">
                  <table>
                    <thead>
                      <th>DATE FROM</th>
                      <th>DATE TO</th>
                      <th>APPROVER</th>
                      <th>REQUESTOR</th>
                      <th>DATE APPROVED</th>
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
                <div className="w-data-table mt-3">
                  <DataTable
                    columns={weekCreditColumn}
                    data={filteredTransactions}
                    pagination
                    paginationRowsPerPageOptions={[5, 10, 25]}
                    highlightOnHover
                    customStyles={customStyles}
                    onRowClicked={handleRowClicked}
                  />
                </div>
              </>
            )}

            <div className="export-container d-none d-sm-inline-block">
              {authrztn?.includes("WeekCreditReport-IE") && (
                <button
                  style={{ position: "relative", top: "-30px", left: "10px" }}
                  onClick={handleSelectExport}
                >
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

      <WeeklyCreditReportDetails
        specificWeekData={specificWeekData}
        specificWeekModal={specificWeekModal}
        setSpecificWeekModal={setSpecificWeekModal}
      />
    </>
  );
};

export default WeeklyCreditReport;
