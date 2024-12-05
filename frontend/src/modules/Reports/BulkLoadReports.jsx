import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import DataTable from "react-data-table-component";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
import { customStyles } from "../styles/table-style";
import swal from "sweetalert";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import noData from "../../assets/icon/no-data.png";

const BulkLoadReports = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bulkHistoryData, setBulkHistoryData] = useState([]);
  const [bulkTransaction, setBulkTransaction] = useState([]);
  const [bulkDetailModal, setBulkDetailModal] = useState(false);
  const [fetchTransac, setFetchTransac] = useState("");
  const [fetchBulkTime, setFetchBulkTime] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filteredTransactions, setFilteredTransactions] =
    useState(bulkHistoryData);
  const [showDropdown, setShowDropdown] = useState(false);
  const [operationDetail, setOperationDetail] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const dropdownRef = useRef(null);

  const handleFetchBulkHistory = async () => {
    const res = await axios.get(`${BASE_URL}/reports/getBulkHistory`);
    setBulkHistoryData(res.data);
    setIsLoading(false);
  };

  const handleFetchUsers = async () => {
    const res = await axios.get(`${BASE_URL}/masterList/masterTable`);
    const notKiosk = res.data.filter((d) => d.user_type != "Kiosk");
    setUsers(notKiosk);
    setIsLoading(false);
  };
  useEffect(() => {
    console.log(users);
  }, [users]);
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchBulkHistory();
      handleFetchUsers();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   const filteredData = bulkHistoryData.filter((transaction) => {
  //     const transactionDate = new Date(transaction.createdAt);
  //     const start = new Date(`${fromDate}T00:00:00Z`);
  //     const end = new Date(`${endDate}T23:59:59Z`);

  //     return (
  //       (!fromDate || transactionDate >= start) &&
  //       (!endDate || transactionDate <= end)
  //     );
  //   });
  //   setFilteredTransactions(filteredData);
  //   console.log(filteredData);
  // }, [fromDate, endDate, bulkHistoryData]);

  useEffect(() => {
    const filteredData = bulkHistoryData.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      const isDateInRange =
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end);
      const isUserMatch =
        !selectedUser ||
        selectedUser === "All" ||
        transaction.masterlist.col_name === selectedUser;

      const isOperationMatch =
        !selectedOperation ||
        selectedOperation === "All" ||
        transaction.operation === selectedOperation;

      return isDateInRange && isUserMatch && isOperationMatch;
    });

    setFilteredTransactions(filteredData);
  }, [fromDate, endDate, bulkHistoryData, selectedUser, selectedOperation]);

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
    setFromDate("");
    setEndDate("");
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

  const bulkHistoryDataColumn = [
    {
      name: "TRANSACTION NUMBER",
      selector: (row) => row.transaction_number_id,
    },
    {
      name: "OPERATION",
      selector: (row) => row.operation,
    },
    {
      name: "TIME",
      selector: (row) => formatDate(row.createdAt),
    },
    {
      name: "LOADED BY",
      selector: (row) => row.masterlist.col_name,
    },
  ];
  const bulkDetailColumn = [
    // {
    //   name: "ID",
    //   selector: (row) => row.load_transaction_id,
    // },
    {
      name: "TOP CARD NUMBER",
      selector: (row) => row.load_transaction.student_balance.student.rfid,
    },
    {
      name: "NAME",
      selector: (row) =>
        row.load_transaction.student_balance.student.first_name +
        " " +
        row.load_transaction.student_balance.student.last_name,
    },
    {
      name: "PREVIOUS BALANCE",
      selector: (row) => row.load_transaction.old_balance,
    },
    {
      name: `${operationDetail == "Load" ? "TOP UP" : "DEDUCT"}`,
      selector: (row) =>
        `${
          operationDetail == "Load"
            ? row.load_transaction.load_amount
            : row.load_transaction.deduct_amount
        }`,
    },
    {
      name: "NEW BALANCE",
      selector: (row) => row.load_transaction.new_balance,
    },
    {
      name: "CATEGORY",
      selector: (row) => row.load_transaction.student_balance.student.category,
    },

    // {
    //   name: "TRANSACTION DATE",
    //   selector: (row) => formatDate(row.load_transaction.createdAt),
    // },
  ];

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

  const handleBulkDetail = async (row) => {
    try {
      setOperationDetail(row.operation);
      const bulkId = row.bulk_load_id;
      console.log(row);
      const res = await axios.get(`${BASE_URL}/reports/getBulkTransaction`, {
        params: {
          bulkID: bulkId,
        },
      });

      setBulkTransaction(res.data);
      setFetchBulkTime(formatDate(res.data[0].bulk_load.createdAt));
      setFetchTransac(res.data[0].bulk_load.transaction_number_id);
      setBulkDetailModal(true);
      console.log(res.data);
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
        handleExport("Excel");
      } else if (value === "pdf") {
        handleExport("PDF");
      }
    });
  };

  const handleExport = async (type) => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/fetchBulkData`);

      let dataForExport = res.data;

      console.log(res.data);

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
        if (type == "Excel") {
          const headers = [
            "TRANSACTION NUMBER",
            "RFID NUMBER",
            "ACCOUNT NAME",
            "PREVIOUS BALANCE",
            "AMOUNT",
            "NEW BALANCE",
            "OPERATION",
            "TRANSACTION DATE",
            "LOADED BY",
          ];

          const dateGenerated = new Date().toISOString().split("T")[0];
          const dateRangeFrom = new Date().toISOString().split("T")[0];
          const dateRangeTo = new Date().toISOString().split("T")[0];
          const csvContent =
            "data:text/csv;charset=utf-8," +
            `REPORT:, BULK OPERATION REPORTS` +
            "\n" +
            `DATE GENERATED,${dateGenerated}` +
            "\n" +
            `DATE RANGE, ${dateRangeFrom}, ${dateRangeTo}` +
            "\n \n" +
            headers.join(",") +
            "\n" +
            dataForExport
              .map((data) => {
                const fullName = `${data.load_transaction.student_balance.student.first_name} ${data.load_transaction.student_balance.student.last_name}`;
                return `${data.bulk_load.transaction_number_id},${
                  data.load_transaction.student_balance.student.rfid
                },${fullName},${data.load_transaction.old_balance},${
                  data.bulk_load.operation == "Load"
                    ? data.load_transaction.load_amount
                    : data.load_transaction.deduct_amount
                },${data.load_transaction.new_balance},${
                  data.bulk_load.operation
                },${new Date(data.createdAt).toISOString().split("T")[0]}, ${
                  data.bulk_load.masterlist.col_name
                }`;
              })
              .join("\n");

          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "bulk_reports.csv");
          document.body.appendChild(link);
          link.click();
        } else if (type == "PDF") {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = dataForExport.map((data) => [
            data.bulk_load.transaction_number_id,
            data.load_transaction.student_balance.student.rfid,
            `${data.load_transaction.student_balance.student.first_name} ${data.load_transaction.student_balance.student.last_name}`,
            data.load_transaction.old_balance,
            `${
              data.bulk_load.operation == "Load"
                ? data.load_transaction.load_amount
                : data.load_transaction.deduct_amount
            }`,
            data.load_transaction.new_balance,
            data.bulk_load.operation,
            new Date(data.createdAt).toISOString().split("T")[0],
            data.bulk_load.masterlist.col_name,
          ]);
          const dateGenerated = new Date().toISOString().split("T")[0];
          const dateRangeFrom = new Date().toISOString().split("T")[0];
          const dateRangeTo = new Date().toISOString().split("T")[0];

          doc.setFontSize(10);
          // Add a title
          doc.text(`Report: Bulk operation reports`, 14, 10);
          doc.text(`Date Generated: ${dateGenerated}`, 70, 10);
          doc.text(`Date Range: ${dateRangeFrom} to ${dateRangeTo}`, 180, 10);

          doc.autoTable({
            head: [
              [
                "TRANSACTION NUMBER",
                "RFID NUMBER",
                "ACCOUNT NAME",
                "PREVIOUS BALANCE",
                "AMOUNT",
                "NEW BALANCE",
                "OPERATION",
                "TRANSACTION DATE",
                "LOADED BY",
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
          link.download = "bulk_reports.pdf";
          link.click();
          window.open(url);

          // Clean up
          URL.revokeObjectURL(url);
        }

        await axios.post(`${BASE_URL}/reports/bulkLog`, { userId, type });
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
      console.error(error);
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

  const handleSetUser = (e) => {
    setSelectedUser(e.target.value);
  };
  const handleSetOperation = (e) => {
    setSelectedOperation(e.target.value);
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
        ) : authrztn.includes("BulkLoadReport-View") ? (
          <div className="custom-card inv-card pb-0">
            <div className="pos-head-container ms-2 flex-column flex-sm-row">
              <div className="title-content-field ms-0 ms-lg-3">
                <h2>Bulk Operation Reports</h2>
                <h4 id="dateFilterIndicator" className="fs-4"></h4>
              </div>

              <div className="d-flex py-2 align-items-center">
                <Form.Select
                  aria-label="Default select example"
                  defaultValue=""
                  className="mb-0 w-50 me-1"
                  onChange={handleSetOperation}
                  style={{
                    height: "40px",
                    // marginTop: "15px",
                    // width: "140px",
                    fontSize: "12px",
                    float: "right",
                  }}
                >
                  <option value="" disabled>
                    Select Operation
                  </option>
                  <option value="All">All</option>
                  <option value="Load">Load</option>
                  <option value="Deduct">Deduct</option>
                </Form.Select>
                <Form.Select
                  aria-label="Default select example"
                  defaultValue=""
                  className="mb-0 w-50 d-block d-sm-inline"
                  onChange={handleSetUser}
                  style={{
                    height: "40px",
                    // marginTop: "15px",
                    // width: "200px",
                    fontSize: "12px",
                    float: "right",
                  }}
                >
                  <option value="" disabled>
                    Select User
                  </option>
                  {users.map((u) => (
                    <option key={u.col_id} value={u.col_name}>
                      {u.col_name}
                    </option>
                  ))}
                </Form.Select>
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
                {authrztn?.includes("BulkLoadReport-IE") && (
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

            <div className="table mt-2">
              {filteredTransactions.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>TRANSACTION NUMBER</th>
                        <th>OPERATION</th>
                        <th>TIME</th>
                        <th>LOADED BY</th>
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
                      columns={bulkHistoryDataColumn}
                      data={filteredTransactions}
                      pagination
                      customStyles={customStyles}
                      onRowClicked={handleBulkDetail}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="export-container d-none d-sm-inline-block">
              {authrztn?.includes("BulkLoadReport-IE") && (
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

      <Modal
        show={bulkDetailModal}
        size="xl"
        onHide={() => setBulkDetailModal(false)}
      >
        <Modal.Header>
          <div className="d-flex w-100 py-0 justify-content-between align-items-center">
            <div>
              <p className="h2 ms-4">Bulk Upload Details</p>
            </div>
            <div className="d-flex align-items-center justify-content-end w-50">
              <label htmlFor="stockingTime" className="fs-3 me-3 text-nowrap">
                {operationDetail == "Load" ? "Load Time" : "Deduct Time"}
              </label>
              <input
                type="text"
                className="form-control i-date mb-0"
                id="stockingTime"
                value={fetchBulkTime}
                style={{ width: "300px" }}
                readOnly
              />
            </div>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <div className="d-flex w-100" style={{ height: "100px" }}>
            <div className="d-flex w-50">
              {/* <Form.Label
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
                value={fetchRemarks}
                style={{ width: "380px" }}
              /> */}
            </div>

            <div className="d-flex w-50 justify-content-end">
              <Form.Label
                style={{
                  fontSize: "16px",
                  marginTop: "10px",
                  marginRight: "10px",
                }}
                className="text-nowrap"
              >
                Transaction ID:
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                defaultValue={fetchTransac}
                style={{ width: "300px" }}
              />
            </div>
          </div>
          <div className="modal-category ">
            <div className="table">
              <DataTable
                columns={bulkDetailColumn}
                data={bulkTransaction}
                customStyles={customStyles}
                pagination
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setBulkDetailModal(false)}>
            Cancel
          </Button>
          {/* <Button variant="primary" type="submit">
            Save
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BulkLoadReports;
