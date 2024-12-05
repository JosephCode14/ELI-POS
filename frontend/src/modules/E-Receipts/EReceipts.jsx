/* eslint-disable no-console */
import React, { useState, useEffect, useRef } from "react";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import { Button, Modal, Dropdown } from "react-bootstrap";
import noData from "../../assets/icon/no-data.png";
import "../styles/e-receipts.css";
import swal from "sweetalert";
// import "../styles/pos_react.css";
// import DateRange from "../../components/DateRange";
import { FourSquare } from "react-loading-indicators";
import NoAccess from "../../assets/image/NoAccess.png";
import useStoreIP from "../../stores/useStoreIP";

const EReceipts = ({ authrztn }) => {
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [orderTransaction, setOrderTransaction] = useState([]);
  const [productDetailsCheckout, setProductDetailsCheckout] = useState([]);
  const [filteredTransactions, setFilteredTransactions] =
    useState(orderTransaction);
  const [fromDate, setFromDate] = useState();
  const [endDate, setEndDate] = useState();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const [previewReceiptModal, setPreviewReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState([]);
  const [receiptProductData, setReceiptProductData] = useState([]);
  const [studData, setStudData] = useState([]);

  useEffect(() => {
    const filteredData = orderTransaction.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredTransactions(filteredData);
  }, [fromDate, endDate, orderTransaction]);

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

  const fetchOrderTransaction = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/orderRecords/fetchOrderTransaction`
      );
      setOrderTransaction(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrderTransaction();
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

  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);

  const { setIP, ip } = useStoreIP();

  // For Ordering

  useEffect(() => {
    const handleFetchProfile = async () => {
      const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
      setIP(res.data.store_ip);
    };

    handleFetchProfile();
  }, []);

  const ensurePrinterConnection = async () => {
    if (!printerInstance || !isPrinterReady) {
      console.log("Printer not ready, attempting to reconnect...");
      await initPrinter();
    }
  };

  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip); //palitan ng ip address based sa ip ng printer
        console.log("Attempting to connect to printer...");
        await printer.connect();
        console.log("Successfully connected to printer");
        setPrinterInstance(printer);
        setIsPrinterReady(true);
      } catch (error) {
        /* eslint-enable no-console */
        console.error("Failed to connect to printer:", error);
        /* eslint-enable no-console */
        setIsPrinterReady(false);
      }
    } else {
      /* eslint-enable no-console */
      console.error("IminPrinter library not loaded");
      /* eslint-enable no-console */
    }
  };

  useEffect(() => {
    console.log("Order Transac", orderTransaction);
  }, [orderTransaction]);

  const handleReceiptsClick = async (row) => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      await printerInstance.initPrinter();
      setLoadingBtn(true);
      // Fetch product details
      const res = await axios.get(
        BASE_URL + "/orderRecords/fetchProduct-Ereceipt",
        {
          params: {
            Idcheckout: row.order_transaction_id,
          },
        }
      );
      const productDetails = res.data;

      let stud;

      console.log("Details", row.createdAt, productDetails);

      if (row.student_id != null) {
        const res = await axios.get(
          BASE_URL + "/orderRecords/fetchStudent-Ereceipt",
          {
            params: {
              id: row.student_id,
            },
          }
        );
        stud = res.data;
      }

      // Print header

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
      await printerInstance.printText("Transaction Slip");

      // Print order details

      await printerInstance.setAlignment(1);
      // Spacing
      await printerInstance.printText(
        "                                                                     "
      );

      // Order NUmber
      await printerInstance.printColumnsText(
        ["Transaction Number:", `${row.order_number}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Terminal:", `${row.masterlist.user_type}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );

      if (row.masterlist.col_name != null) {
        await printerInstance.printColumnsText(
          ["Cashier:", `${row.masterlist.col_name}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }

      await printerInstance.printColumnsText(
        ["Payment Method:", `${row.payment_method}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Trans. Date:", formatDate(receiptData?.createdAt)],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );

      if (stud) {
        await printerInstance.printColumnsText(
          ["ID No.:", `${stud.student.student_number}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Name:", `${stud.student.first_name} ${stud.student.last_name}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Initial Balance:", `${row.purchased_balance}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          [
            "Remaining Balance:",
            `${row.purchased_balance - row.payable_amount}`,
          ],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );
      await printerInstance.printColumnsText(
        ["Qty", "Description", "Price", "Subtotal"],
        [1, 2, 1, 1],
        [0, 0, 0, 1],
        [28, 28, 28, 28],
        576
      );

      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );

      await printerInstance.printText(`${row.order_type}`);

      // Print product details
      for (const product of productDetails) {
        const name =
          product.cart_specification_variants.length > 0
            ? `${
                product.product_inventory.product.name
              } (${product.cart_specification_variants
                .map((variant) => variant.specification_variant.variant_name)
                .join(", ")})`
            : product.product_inventory.product.name;
        await printerInstance.printColumnsText(
          [
            `${product.quantity}`,
            `${name}`,
            `${product.product_inventory.product.price}`,
            `${product.subtotal}`,
          ],
          [1, 2, 1, 1],
          [0, 0, 0, 1],
          [26, 26, 26, 26],
          576
        );
      }

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );

      await printerInstance.printColumnsText(
        ["Total:", `${row.payable_amount}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      if (stud) {
        await printerInstance.printColumnsText(
          ["Tap Card:", `${row.received_amount}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }
      await printerInstance.printColumnsText(
        ["Amount Tendered:", `${row.received_amount}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Change", `${row.change_amount}`],
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

      if (row.remarks !== "") {
        await printerInstance.setAlignment(0);
        await printerInstance.printText(`Remarks: ${row.remarks}`);
      }

      await printerInstance.setAlignment(1);
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

      await printerInstance.printText(
        "                                                                     "
      );

      await printerInstance.printAndFeedPaper(100);
      await printerInstance.partialCut();

      console.log("Printing completed successfully");

      handleClosePreviewModal();
      setLoadingBtn(false);
    } catch (error) {
      console.error("Failed to print receipt:", error);
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

  const handlePreviewReceipt = async (row) => {
    try {
      setPreviewReceiptModal(true);
      setReceiptData(row);

      console.log("Receipt", row);

      const res = await axios.get(
        BASE_URL + "/orderRecords/fetchProduct-Ereceipt",
        {
          params: {
            Idcheckout: row.order_transaction_id,
          },
        }
      );
      setReceiptProductData(res.data);

      if (row.student_id != null) {
        const res = await axios.get(
          BASE_URL + "/orderRecords/fetchStudent-Ereceipt",
          {
            params: {
              id: row.student_id,
            },
          }
        );
        setStudData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClosePreviewModal = () => {
    setPreviewReceiptModal(false);
    setStudData([]);
    setReceiptData([]);
    setReceiptProductData([]);
  };
  const columns = [
    {
      name: "DATE / TIME OF PURCHASED",
      selector: (row) => formatDate(row.createdAt),
    },
    {
      name: "INVOICE NUMBER",
      selector: (row) => row.order_number,
    },
    {
      name: "CASHIER NAME/ TERMINAL NUMBER",
      selector: (row) => row.masterlist.col_name,
    },
    {
      name: "PAYMENT METHOD",
      selector: (row) => row.payment_method,
    },
    {
      name: "TOTAL SALES",
      selector: (row) => {
        if (row.payable_amount == null) {
          return "-";
        }
        const amount = Number(row.payable_amount);
        return amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          className="btn btn-primary"
          // onClick={() => handleReceiptsClick(row)}
          onClick={() => handlePreviewReceipt(row)}
        >
          Print
        </button>
      ),
    },
  ];

  const handleRowClicked = (row) => {
    const orderNumber = row.order_number;
    const totalToPay = row.payable_amount;
    const totalToReceived = row.received_amount;
    const Change = row.change_amount;
    const orderTransactionId = row.order_transaction_id;
    axios
      .get(BASE_URL + "/orderRecords/fetchProduct-Ereceipt", {
        params: {
          Idcheckout: orderTransactionId,
        },
      })
      .then((res) => {
        console.log("Ddd", res.data);
        setProductDetailsCheckout(res.data);
        setShowInvoiceModal(true);
        setInvoice(orderNumber);
        setTotalAmount(totalToPay);
        setTotalReceived(totalToReceived);
        setTotalChange(Change);
      })
      .catch((err) => console.log(err));
  };

  //search bar function
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const filtered = orderTransaction.filter(
      (data) =>
        formatDate(data.createdAt)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        data.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.masterlist?.col_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        data.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.payable_amount.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchQuery, orderTransaction]);
  //search bar function

  return (
    <>
      <div className="inventory-container">
        <div className="pos-head-container">
          <div className="title-content-field">
            <h2 className="text-nowrap">POS Transaction Report</h2>
            <h4 className="text-nowrap" id="dateFilterIndicator"></h4>
          </div>
        </div>
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
        ) : authrztn.includes("EReceipt-View") ? (
          <div className="custom-card er-card">
            <div className="inventory-stock-container d-flex flex-column flex-sm-row">
              <h2 className="mb-0 ms-0 ms-lg-3 text-nowrap">Sales Invoice Report</h2>
              <div className="s-container d-flex flex-column flex-sm-row pt-4 pb-0 py-sm-4">
                <div class="input-group">
                  <input
                    type="text"
                    className="form-control search m-0 mb-4 mb-sm-0"
                    placeholder="Search"
                    aria-describedby="addon-wrapping"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="filter-button-container col-12 col-sm-4">
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
                  <div className="filter-button-container-container  pt-3 mt-5">
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

            <div className="table">
              {filteredTransactions.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>DATE / TIME OF PURCHASED</th>
                        <th>VOICE NUMBER</th>
                        <th>CASHIER NAME</th>
                        <th>PAYMENT METHOD</th>
                        <th>TOTAL SALES</th>
                        <th>ACTION</th>
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
                  <div className="er-data-table">
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
        show={showInvoiceModal}
        onHide={() => setShowInvoiceModal(false)}
        size="xl"
      >
        <Modal.Header>
          <Modal.Title>
            <h2>Preview: Invoice # {invoice ? invoice : ""} </h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="filtering-category-container d-flex justify-content-between">
              <div className="d-flex receivingID p-0"></div>

              <div className="d-flex p-0 align-items-center">
                {/* <input
                  type="text"
                  class="form-control i-date mb-0"
                  placeholder="Search Item Name"
                  id="exampleFormControlInput1"
                /> */}
              </div>
            </div>
            <div className="my-5">
              <div className="table-container">
                <table className="custom-user-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>ITEM NAME</th>
                      <th>UNIT PRICE</th>
                      <th>QUANTITY</th>
                      <th>TOTAL PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productDetailsCheckout.map((prod, i) => (
                      <tr key={i}>
                        <td>{prod.product_inventory.product.sku}</td>
                        <td>
                          <div className="d-flex flex-column p-0">
                            <span>
                              {prod.product_inventory.product.name}
                              <br />

                              {prod.cart_specification_variants.length > 0
                                ? `(${prod.cart_specification_variants
                                    .map(
                                      (variant) =>
                                        variant.specification_variant
                                          .variant_name
                                    )
                                    .join(", ")})`
                                : null}
                            </span>
                          </div>
                        </td>
                        <td>
                          {prod.product_inventory.product.price.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}

                          {prod.cart_specification_variants.length > 0
                            ? `+ ${prod.cart_specification_variants
                                .map(
                                  (variant) =>
                                    variant.specification_variant.variant_price
                                )
                                .join(", ")}`
                            : null}
                        </td>
                        <td>{prod.quantity}</td>
                        <td>
                          {prod.subtotal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="points">
              <div className="total d-flex">
                <h2>TOTAL (PHP): </h2>
                <h3>
                  {Number(totalAmount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="total d-flex">
                <h2>CASH: </h2>
                <h3>
                  {Number(totalReceived).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="total d-flex">
                <h2>CHANGE DUE: </h2>
                <h3>
                  {Number(totalChange).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Preview Receipt */}

      <Modal show={previewReceiptModal} onHide={handleClosePreviewModal}>
        {/* <div className="modal-nfc">
          <div className="nfc-receipt-title">
            <h1>PRINT RECEIPT</h1>
          </div>
          <hr />
          <div className="nfc-receipt">
            <div className="title-receipt">
              <h2>ELI IT SOLUTIONS</h2>
              <p>eli@elogicinnovations.com</p>
            </div>
            <div className="nfc-dashed-receipt"></div>
            <div className="nfc-card-details nfc-card-num">
              <p>Order Number: </p>
              <p>{receiptData ? receiptData.order_number : ""}</p>
            </div>
            <div className="nfc-card-details nfc-card-num">
              <p>Date: </p>
              <p>{receiptData ? formatDate(receiptData.createdAt) : ""}</p>
            </div>
            <div className="nfc-dashed-receipt"></div>
            <div className="title-order d-flex p-0 justify-content-between">
              <p>Qty</p>
              <p>Description</p>
              <p>Subtotal</p>
            </div>
            {receiptProductData.map((order) => (
              <>
                <div className="receipt-orders">
                  <p>{order.quantity}</p>
                  <p>{order.product_inventory.category_product.product.name}</p>
                  <p>{order.subtotal}</p>
                </div>
              </>
            ))}
          </div>

          <div className="end-modal-btn-container mt-4">
            <button type="button" className=" end-cc-btn nfc-c-btn">
              Cancel
            </button>
            <button
              type="button"
              className=" end-es-btn nfc-c-btn"
              // onClick={handleReceiptsClick(receiptData)}
              // onClick={handleReceiptsClick(receiptData)}
            >
              Print
            </button>
          </div>
        </div> */}
        <Modal.Header>
          <Modal.Title>
            <h2>Receipt Preview</h2>
          </Modal.Title>
        </Modal.Header>
        <div className="paper-container my-3 pt-0">
          <div className="receipt receipt-eighty">
            <div className={`receipt-title-name  cust-bold`}>
              <p className="cust-text text-dark mb-1">BUON TAVOLO</p>
            </div>
            <div className={`receipt-transac-title`}>
              <p className="text-dark mb-1">Transaction Slip</p>
            </div>
            {/* 
            <div className={`receipt-title-email pb-2`}>
              <p className="cust-text text-dark">eli@elogicinnovations.com</p>
            </div> */}
            {/* <div className={`title-billing`}>
              <p className="cust-text"> BILLING</p>
            </div> */}
            <div className={`bill-details-container `}>
              <div className="summary-container">
                <p className="mb-0">Transaction No.</p>
                <p className="mb-0">{receiptData?.order_number}</p>
              </div>
              <div className="summary-container">
                <p className="mb-0">Terminal:</p>
                <p className="mb-0">{receiptData.masterlist?.user_type}</p>
              </div>
              <div className="summary-container">
                <p className="mb-0">Cashier:</p>
                <p className="mb-0">{receiptData.masterlist?.col_name}</p>
              </div>
              <div className="summary-container">
                <p className="mb-0">Trans. Date:</p>
                <p className="mb-0">{formatDate(receiptData.createdAt)}</p>
              </div>

              {studData.length != 0 ? (
                <>
                  <div className="summary-container">
                    <p className="mb-0">ID No.:</p>
                    <p className="mb-0">{studData?.student.student_number}</p>
                  </div>
                  <div className="summary-container">
                    <p className="mb-0">Name:</p>
                    <p className="mb-0">{`${studData.student.first_name} ${studData?.student.last_name}`}</p>
                  </div>
                  <div className="summary-container">
                    <p className="mb-0">Initial Balance:</p>
                    <p className="mb-0">{receiptData?.purchased_balance}</p>
                  </div>
                  <div className="summary-container">
                    <p className="mb-0">Remaining Balance:</p>
                    <p className="mb-0">
                      {parseFloat(
                        receiptData?.purchased_balance -
                          receiptData?.payable_amount
                      )}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
            <div className="dashed-receipt"></div>
            <div className={`receipt-order-header`}>
              <p className="cust-text">Qty</p>
              <p className="cust-text">Description</p>
              <p className="cust-text">Price</p>
              <p className="cust-text">Amount</p>
            </div>
            <div className="dashed-receipt"></div>
            <div className={`type-order-container`}>
              <p>{receiptData.order_type}</p>
            </div>
            <div className={`receipt-order-body`}>
              {receiptProductData.map((order) => (
                <>
                  <div className="receipt-orders">
                    <p className="mb-0">{order.quantity}</p>
                    <p className="mb-0">
                      {order.product_inventory.product.name}
                      <br />

                      {order.cart_specification_variants.length > 0
                        ? `(${order.cart_specification_variants
                            .map(
                              (variant) =>
                                variant.specification_variant.variant_name
                            )
                            .join(", ")})`
                        : null}
                    </p>
                    <p className="mb-0">{order.purchased_amount}</p>
                    <p className="mb-0">{order.subtotal}</p>
                  </div>
                </>
              ))}
            </div>
            <div className="dashed-receipt"></div>
            <div className={`total-summary-container`}>
              <div className="summary-container">
                <p className="mb-0">TOTAL </p>
                <p className="mb-0">{receiptData.payable_amount}</p>
              </div>

              {studData.length != 0 ? (
                <>
                  <div className="summary-container">
                    <p className="mb-0">TAP CARD</p>
                    <p className="mb-0">{receiptData?.received_amount}</p>
                  </div>
                </>
              ) : null}

              <div className="summary-container">
                <p className="mb-0"> Amount Tendered</p>
                <p className="mb-0">{receiptData?.received_amount}</p>
              </div>
              <div className="summary-container">
                <p>CHANGE</p>
                <p>{receiptData?.change_amount}</p>
              </div>
            </div>
            <div className="dashed-receipt"></div>

            {receiptData?.remarks ? (
              <>
                <div className="summary-container">
                  <p className="mb-0">Remarks: </p>
                  <p className="mb-0">{receiptData?.remarks}</p>
                </div>
              </>
            ) : null}

            <div className="no-tax-container">
              <p className="mb-0"> This document is not valid</p>
              <p>For claim of input tax</p>
            </div>
          </div>
        </div>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button
                type="submit"
                variant="primary"
                onClick={() => handleReceiptsClick(receiptData)}
              >
                Print
              </Button>
            </>
          ) : (
            <>
              <div className="d-flex w-50 justify-content-end p-0">
                <span
                  style={{
                    fontSize: "2rem",
                    marginTop: "10px",
                    marginLeft: "5px",
                  }}
                >
                  Printing. . .
                </span>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EReceipts;
