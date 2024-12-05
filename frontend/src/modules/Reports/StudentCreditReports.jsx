import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { Button, Dropdown } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import { customStyles } from "../styles/table-style";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import noData from "../../assets/icon/no-data.png";
import check from "../../assets/icon/check.png";
import swal from "sweetalert";
import x from "../../assets/icon/remove.png";
import forbid from "../../assets/icon/forbidden.png";
import "jspdf-autotable";
import jsPDF from "jspdf";

import utensil from "../../assets/icon/utensil.png";

const StudentCreditReports = ({ authrztn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [creditReports, setCreditReports] = useState([]);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [totalMeal, setTotalMeal] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    unclaimed: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

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

  function formatDate(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

  const creditColumn = [
    {
      name: "STUDENT ID.",
      selector: (row) => row.student.student_number,
    },
    {
      name: "NAME",
      selector: (row) => `${row.student.first_name} ${row.student.last_name}`,
    },
    {
      name: "DATE",
      selector: (row) => formatDate(row.date_valid),
    },
    {
      name: "BREAKFAST",
      cell: (row) =>
        !row.breakfast && row.static_breakfast ? (
          <>
            {" "}
            <img src={check} style={{ height: "25px" }} />
          </>
        ) : row.breakfast && row.static_breakfast ? (
          <>
            <img src={x} style={{ height: "25px" }} />
          </>
        ) : (
          <>
            <img src={forbid} style={{ height: "25px" }} />
          </>
        ),
    },
    {
      name: "LUNCH",
      cell: (row) =>
        !row.lunch && row.static_lunch ? (
          <>
            <img src={check} style={{ height: "25px" }} />
          </>
        ) : row.lunch && row.static_lunch ? (
          <>
            <img src={x} style={{ height: "25px" }} />
          </>
        ) : (
          <>
            <img src={forbid} style={{ height: "25px" }} />
          </>
        ),
    },
    {
      name: "DINNER",
      cell: (row) =>
        !row.dinner && row.static_dinner ? (
          <>
            <img src={check} style={{ height: "25px" }} />
          </>
        ) : row.dinner && row.static_dinner ? (
          <>
            <img src={x} style={{ height: "25px" }} />
          </>
        ) : (
          <>
            <img src={forbid} style={{ height: "25px" }} />
          </>
        ),
    },
  ];

  const filteredStudents = creditReports.filter((row) => {
    const matchesQuery =
      row.student.student_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      row.student.first_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      row.student.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesQuery;
  });

  const handleCountMeal = (data) => {
    const breakfast = data.filter(
      (item) => item.static_breakfast == true
    ).length;
    const lunch = data.filter((item) => item.static_lunch == true).length;
    const dinner = data.filter((item) => item.static_dinner == true).length;

    let unclaimedBreakfast = 0;
    let unclaimedLunch = 0;
    let unclaimedDinner = 0;

    data.forEach((entry) => {
      if (entry.static_breakfast && entry.breakfast) {
        unclaimedBreakfast += 1;
      }
      if (entry.static_lunch && entry.lunch) {
        unclaimedLunch += 1;
      }
      if (entry.static_dinner && entry.dinner) {
        unclaimedDinner += 1;
      }
    });

    const totalUnclaimed =
      unclaimedBreakfast + unclaimedLunch + unclaimedDinner;

    setTotalMeal({
      breakfast: breakfast,
      lunch: lunch,
      dinner: dinner,
      unclaimed: totalUnclaimed,
    });
  };

  const handleFetchCreditReport = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/creditReports`, {
        params: {
          fromDate,
          endDate,
        },
      });
      setCreditReports(res.data);
      handleCountMeal(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchCreditReport();
    }, 1500);
    return () => clearTimeout(timer);
  }, [fromDate, endDate]);

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
    if (creditReports.length <= 0) {
      swal({
        title: "There are no data to export!",
        icon: "error",
        button: "OK",
      }).then(() => {
        swal.close();
      });

      return;
    }

    if (format == "excel") {
      const exportedData = creditReports.map((item) => ({
        "STUDENT ID": item.student.student_number,
        NAME: `${item.student.first_name} ${item.student.last_name}`,
        DATE: item.date_valid,
        BREAKFAST:
          item.static_breakfast && !item.breakfast
            ? "CLAIMED"
            : item.static_breakfast && item.breakfast
            ? "UNCLAIMED"
            : "NO CREDITS",
        LUNCH:
          item.static_lunch && !item.lunch
            ? "CLAIMED"
            : item.static_lunch && item.lunch
            ? "UNCLAIMED"
            : "NO CREDITS",
        DINNER:
          item.static_dinner && !item.dinner
            ? "CLAIMED"
            : item.static_dinner && item.dinner
            ? "UNCLAIMED"
            : "NO CREDITS",
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

      link.download = "credits_report.csv";
      link.click();
    } else {
      const doc = new jsPDF({ orientation: "landscape" });

      const tableData = creditReports.map((item) => {
        let breakfast =
          item.static_breakfast && !item.breakfast
            ? "CLAIMED"
            : item.static_breakfast && item.breakfast
            ? "UNCLAIMED"
            : "NO CREDITS";

        let lunch =
          item.static_lunch && !item.lunch
            ? "CLAIMED"
            : item.static_lunch && item.lunch
            ? "UNCLAIMED"
            : "NO CREDITS";

        let dinner =
          item.static_dinner && !item.dinner
            ? "CLAIMED"
            : item.static_dinner && item.dinner
            ? "UNCLAIMED"
            : "NO CREDITS";
        return [
          item.student.student_number,
          `${item.student.first_name} ${item.student.last_name}`,
          item.date_valid,
          breakfast,
          lunch,
          dinner,
        ];
      });

      doc.autoTable({
        head: [
          ["STUDENT ID", "NAME", "DATE VALID", "BREAKFAST", "LUNCH", "DINNER"],
        ],
        body: tableData,
      });
      const link = document.createElement("a");
      const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      link.href = window.URL.createObjectURL(pdfBlob);

      link.download = "credit_reports.pdf";
      link.click();
      window.open(url);
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
        ) : authrztn.includes("StudentCreditReport-View") ? (
          <div className="custom-card inv-card">
            <div className="pos-head-container ms-2">
              <div className="title-content-field ms-0 ms-lg-3 mb-2">
                <h2 className="mb-0">Student Credit Reports</h2>
                <h4 id="dateFilterIndicator" className="mb-1 fs-5 fs-sm-4"></h4>
              </div>
            </div>

            <div className="d-flex p-0 gap-2 gap-lg-5 justify-content-center flex-wrap mb-2 mb-sm-5">
              <div className="box-food d-flex p-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food px-4 pt-1">
                  <h5>Total Breakfast</h5>
                  <h1>{totalMeal?.breakfast}</h1>
                </div>
              </div>
              <div className="box-food d-flex p-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food px-4 pt-1">
                  <h5>Total Lunch</h5>
                  <h1>{totalMeal?.lunch}</h1>
                </div>
              </div>
              <div className="box-food d-flex p-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food px-4 pt-1">
                  <h5>Total Dinner</h5>
                  <h1>{totalMeal?.dinner}</h1>
                </div>
              </div>
              <div className="box-food d-flex p-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food px-4 pt-1">
                  <h5>Total Unclaimed</h5>
                  <h1>{totalMeal?.unclaimed}</h1>
                </div>
              </div>
            </div>

            <div className=" d-flex gap-1 p-0 mb-0 flex-column flex-sm-row">
              <input
                type="text"
                className="form-control mb-0 ms-0 ms-sm-1"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="filter-button-container">
                <Button
                  className="responsive nowrap mb-0"
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
              {authrztn?.includes("StudentCreditReport-IE") && (
                <button className="e-data export-button w-100" onClick={handleSelectExport}>
                  Export Data
                </button>
              )}
            </div>
            </div>

            {filteredStudents.length == 0 ? (
              <>
                <div className="no-data-table mt-2 ">
                  <table>
                    <thead>
                      <th>STUDENT ID</th>
                      <th>NAME</th>
                      <th>DATE</th>
                      <th>BREAKFAST</th>
                      <th>LUNCH</th>
                      <th>DINNER</th>
                    </thead>
                    <tbody className="cred-no-data">
                      <div>
                        {/* <img
                          src={noData}
                          alt="No Data"
                          className="r-data-icon"
                        /> */}
                        <h2 className="no-data-label">No Data Found</h2>
                      </div>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="cred-data-table mt-2">
                  <DataTable
                    columns={creditColumn}
                    data={filteredStudents}
                    pagination
                    paginationRowsPerPageOptions={[5, 10, 25]}
                    highlightOnHover
                    customStyles={customStyles}
                  />
                </div>
              </>
            )}

            <div className="export-container d-none d-sm-inline-block">
              {authrztn?.includes("StudentCreditReport-IE") && (
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
      </div>
    </>
  );
};

export default StudentCreditReports;
