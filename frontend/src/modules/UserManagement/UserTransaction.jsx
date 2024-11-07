import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { Modal, Button, Row, Col, Form, Dropdown } from "react-bootstrap";
import noData from "../../assets/icon/no-data.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import "../styles/usermanagement.css";
// import "../styles/pos_react.css";
import { customStyles } from "../styles/table-style";
import { FourSquare } from "react-loading-indicators";

function UserTransaction({ authrztn }) {
  const [showDetails, setShowDetails] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleShowDetailsModal = () => setShowDetails(true);
  const handleCloseDetailsModal = () => {
    setTransactions([]);
    setExpandedRow(null);
    setShowDetails(false);
  };
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState([]);
  const [specificStudent, setSpecificStudent] = useState([]);

  const [studentTotal, setStudentTotal] = useState({
    totalTopUp: 0,
    totalCredits: 0,
    totalBalance: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const totalCredits = transactions.reduce((acc, transac) => {
      return (
        acc +
        (transac.order_transaction_id ? parseFloat(transac.received_amount) : 0)
      );
    }, 0);

    const totalTopUp = transactions.reduce((acc, transac) => {
      return acc + (transac.order_transaction_id ? 0 : transac.load_amount);
    }, 0);

    const totalBalance = transactions.reduce((acc, transac) => {
      return (
        acc +
        (transac.order_transaction_id
          ? transac.balance_histories[0].new_balance
          : transac.new_balance)
      );
    }, 0);

    setStudentTotal({
      totalTopUp,
      totalCredits,
      totalBalance,
    });
  }, [transactions]);

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
      name: "CREDIT USED",
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

      setTransactions(combineTransaction);
      console.log("Combine", combineTransaction);
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
  const [statusFilter, setStatusFilter] = useState("Active");

  const [filteredUser, setFilteredUser] = useState([]);
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // const filteredData = userData.filter(
  //   (student) => student.student.status === statusFilter
  // );

  const [showDropdown, setShowDropdown] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const filteredData = userData.filter((student) => {
      const transactionDate = new Date(student.createdAt);
      const start = fromDate ? new Date(`${fromDate}T00:00:00Z`) : null;
      const end = endDate ? new Date(`${endDate}T23:59:59Z`) : null;

      const isWithinDateRange =
        (!start || transactionDate >= start) &&
        (!end || transactionDate <= end);

      const isStatusMatch = student.student.status === statusFilter;

      return isWithinDateRange && isStatusMatch;
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
    const filteredData = userData.filter((inv) => {
      const transactionDate = new Date(inv.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredUser(filteredData);
  }, [fromDate, endDate, userData]);

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

  return (
    <>
      {isLoading ? (
        <div
          className="loading-container"
          style={{ margin: "0", marginLeft: "240px", marginTop: "20%" }}
        >
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("UserTransaction-View") ? (
        <div className="users-container">
          <div className="pos-head-container">
            <div className="title-content-field">
              <h2>User Transaction</h2>
              <h4 id="dateFilterIndicator"></h4>
            </div>

            <div className="filter-button-container">
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
                          {/* <Dropdown.Item
                              className="clear-filt"
                              onClick={() => {
                                handleClearFilter();
                                clearFilterIndicatorText();
                              }}
                            >
                              Clear Filter
                            </Dropdown.Item> */}
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
          <div className="btn-manage-container d-flex justify-content-between mt-2 p-1">
            <div class="input-group w-25" style={{ marginLeft: "2px" }}>
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            {filteredUser.length == 0 ? (
              <>
                <div className="no-data-table ">
                  <table>
                    <thead>
                      <th>NAME</th>
                      <th>CONTACT</th>
                      <th>USER TYPE</th>
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
                <div className="c-data-table">
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

      <Modal show={showDetails} onHide={handleCloseDetailsModal} size="xl">
        <Modal.Header>
          <Modal.Title>
            <h2>
              RFID # {specificStudent ? specificStudent.rfid : ""} -{" "}
              {specificStudent
                ? `${specificStudent.first_name} ${specificStudent.last_name}`
                : ""}
            </h2>
          </Modal.Title>
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
                      <th>CREDIT USED</th>
                      <th>TOP UP</th>
                      <th>BALANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transac, index) => (
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
                <h2>TOTAL CREDIT USED</h2>
                <h3>{studentTotal.totalCredits}</h3>
              </div>
              <div className="total-pts d-flex">
                <h2>TOTAL BALANCE</h2>
                <h3>{studentTotal.totalBalance}</h3>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default UserTransaction;
