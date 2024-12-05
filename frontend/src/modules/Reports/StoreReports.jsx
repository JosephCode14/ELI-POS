import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { Button, Dropdown, Modal, Form } from "react-bootstrap";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import { customStyles } from "../styles/table-style";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import noData from "../../assets/icon/no-data.png";
import swal from "sweetalert";
import jsPDF from "jspdf";
import { jwtDecode } from "jwt-decode";
import "jspdf-autotable";
import { fontSize } from "@mui/system";

const StoreReports = ({ authrztn }) => {
  const [operationData, setOperationData] = useState([]);
  const [userId, setuserId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(true);

  const [filteredTransactions, setFilteredTransactions] =
    useState(operationData);

  const [showDropdown, setShowDropdown] = useState(false);
  const [specificData, setSpecificData] = useState([]);
  const [specificDataModal, setSpecificDataModal] = useState(false);

  const dropdownRef = useRef(null);

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
    const filteredData = operationData.filter((transaction) => {
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
  }, [fromDate, endDate, operationData]);

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

  const operateColumn = [
    {
      name: "OPEN DATE",
      selector: (row) => formatDate(row.store_open),
    },
    {
      name: "CLOSE DATE",
      selector: (row) => formatDate(row.store_close),
    },
    {
      name: "TOTAL SALES",
      selector: (row) => row.total_sales,
    },
    {
      name: "TOTAL PURCHASED",
      selector: (row) => row.total_purchased,
    },
    {
      name: "TOTAL SOLD",
      selector: (row) => row.total_sold,
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
    // {
    //   name: "TOTAL DIFFERENCE",
    //   selector: (row) => row.total_difference,
    //   sortable: true,
    // },
    // {
    //   name: "TOTAL REMITTANCE",
    //   selector: (row) => row.total_remittance,
    //   sortable: true,
    // },
    {
      name: "TOTAL REFUND",
      selector: (row) => row.total_refund,
      sortable: true,
    },
  ];

  const handleRowClicked = (row) => {
    setSpecificData(row);
    setSpecificDataModal(true);
  };

  const handleCloseDataModal = () => {
    setSpecificDataModal(false);
  };

  const handleFetchOperateData = async () => {
    const res = await axios(`${BASE_URL}/reports/store-report`);

    setOperationData(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchOperateData();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
        handleExport("excel");
      } else if (value === "pdf") {
        handleExport("pdf");
      }
    });
  };
  function formatDateExport(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(datetime)
      .toLocaleString("en-US", options)
      .replace(/,/g, "");
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
    axios.post(`${BASE_URL}/reports/storeReportLog`, {
      userId,
      format,
    });
    if (format == "excel") {
      const exportedData = filteredTransactions.map((item) => ({
        "OPEN DATE": formatDateExport(item.store_open),
        "CLOSE DATE": formatDateExport(item.store_close),
        "TOTAL SALES": `${item.total_sales}`,
        "TOTAL PURCHASED": item.total_purchased,
        "TOTAL SOLD": item.total_sold,
        "TOTAL CASH": item.total_cash,
        "TOTAL CARD": item.total_card,
        "TOTAL LOAD": item.total_load,
        // "TOTAL DIFFERENCE": item.total_difference,
        // "TOTAL REMITTANCE": item.total_remittance,
        "TOTAL REFUND": item.total_refund,
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
      link.download = "store_reports.csv";
      link.click();
    } else {
      const doc = new jsPDF({ orientation: "landscape" });

      const tableData = filteredTransactions.map((item) => [
        formatDate(item.store_open),
        formatDate(item.store_close),
        `${item.total_sales}`,
        item.total_purchased,
        item.total_sold,
        item.total_cash,
        item.total_card,
        item.total_load,
        // item.total_difference,
        // item.total_remittance,
        item.total_refund,
      ]);

      doc.autoTable({
        head: [
          [
            "OPEN DATE",
            "CLOSE DATE",
            "TOTAL SALES",
            "TOTAL PURCHASED",
            "TOTAL SOLD",
            "TOTAL CASH",
            "TOTAL CARD",
            "TOTAL LOAD",
            // "TOTAL DIFFERENCE",
            // "TOTAL REMITTANCE",
            "TOTAL REFUND",
          ],
        ],
        body: tableData,
        styles: {
          cellWidth: 'auto',
          fontSize: 8
        }
      
      });
      const link = document.createElement("a");
      const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      link.href = window.URL.createObjectURL(pdfBlob);
      link.download = "store_reports.pdf";
      link.click();
      window.open(url);
    }
  };
  return (
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
      ) : authrztn.includes("StoreReport-View") ? (
        <div className="custom-card inv-card pb-0">
          <div className="pos-head-container mb-2 flex-column flex-sm-row">
            <div className="title-content-field ms-0 ms-lg-3">
              <h2>Store Reports</h2>
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
            <div className="export-container d-inline-block d-sm-none">
            {authrztn?.includes("StoreReport-IE") && (
              <button className="e-data export-button w-100" onClick={handleSelectExport}>
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
                      <th>OPEN DATE</th>
                      <th>CLOSE DATE</th>
                      <th>TOTAL SALES</th>
                      <th>TOTAL PURCHASED</th>
                      <th>TOTAL SOLD</th>
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
                    columns={operateColumn}
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
          </div>

          <div className="export-container d-none d-sm-inline-block">
            {authrztn?.includes("StoreReport-IE") && (
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
              <p className="h2">Report Details</p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "0" }}>
          <div className="d-flex w-100">
            <div className="d-flex flex-column w-100 justify-content-start">
              <div className="d-flex w-100 p-0">
                <Form.Label
                  style={{
                    fontSize: "16px",
                    marginTop: "10px",
                    marginRight: "10px",
                    width: "120px",
                  }}
                >
                  Store Open:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0"
                  defaultValue={formatDate(specificData?.store_open || "")}
                  style={{ width: "300px", fontSize: "12px" }}
                />
              </div>

              <div className="d-flex w-100 pb-1">
                <Form.Label
                  style={{
                    fontSize: "16px",
                    marginTop: "10px",
                    marginRight: "10px",
                    width: "120px",
                  }}
                >
                  Store Close:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0"
                  defaultValue={formatDate(specificData?.store_close || "")}
                  style={{ width: "300px", fontSize: "12px" }}
                />
              </div>
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

export default StoreReports;
