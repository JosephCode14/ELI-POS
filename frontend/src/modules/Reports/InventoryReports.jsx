import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Dropdown, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import DateRange from "../../components/DateRange";
import axios from "axios";
import "jspdf-autotable";
import jsPDF from "jspdf";
import swal from "sweetalert";
import BASE_URL from "../../assets/global/url";
// import "../styles/pos_react.css"
import { customStyles } from "../styles/table-style";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import noData from "../../assets/icon/no-data.png";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

const InventoryReports = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [selectedPage, setSelectedPage] = useState("inventory");
  const [inventoryReportsData, setInventoryReportsData] = useState([]);
  const [receivedReportsData, setReceivedReportsData] = useState([]);
  const [outboundReportsData, setOutBoundReportsData] = useState([]);
  const [countingReportsData, setCountingReportsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState(false);
  const [categories, setCategories] = useState([]);

  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [filteredInventoryData, setFilteredInventoryData] =
    useState(inventoryReportsData);
  const [filteredReceivedData, setFilteredReceivedData] =
    useState(inventoryReportsData);

  const [filteredOutboundData, setFilteredOutboundData] =
    useState(outboundReportsData);

  const [filteredCountingData, setFilteredCountingData] =
    useState(countingReportsData);

  const handleSelectedPage = (selected) => {
    setIsLoading(true);
    setSelectedPage(selected);
    setFromDate("");
    setEndDate("");
  };

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

  function formatDate(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(datetime);
    if (isNaN(date)) {
      console.error("Invalid Date:", datetime);
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", options);
  }

  // Columns
  const inventoryColumns = [
    {
      name: "SKU #",
      selector: (row) => row.product_inventory.product.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) => row.product_inventory.product.name,
    },
    {
      name: "CATEGORY",
      selector: (row) => row.product_inventory.category,
    },
    {
      name: "PREVIOUS QUANTITY",
      selector: (row) => row.product_inventory.quantity + row.total_quantity,
    },
    {
      name: "CURRENT QUANTITY",
      selector: (row) => row.product_inventory.quantity,
    },
    {
      name: "TOTAL SOLD",
      selector: (row) => row.total_quantity,
    },
    // {
    //   name: "QUANTITY",
    //   selector: (row) =>
    //     !filter
    //       ? row.quantity
    //       : row.product.product_inventories.length > 0
    //       ? row.product.product_inventories[0].quantity
    //       : 0,
    // },
  ];

  const receivedColumns = [
    {
      name: "RECEIVED ID",
      selector: (row) => row.receiving_stock_inventory.transaction_number_id,
    },
    {
      name: "SKU #",
      selector: (row) =>
        row.product_inventory_accumulate.product_inventory.product.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.product_inventory_accumulate.product_inventory.product.name,
    },
    {
      name: "QUANTITY RECEIVED",
      selector: (row) => row.product_inventory_accumulate.quantity_received,
    },
    {
      name: "PRICE",
      selector: (row) => row.product_inventory_accumulate.stocked_price,
    },
    {
      name: "TOTAL PRICE",
      selector: (row) => row.product_inventory_accumulate.total_price,
    },
    {
      name: "STOCKING TIME",
      selector: (row) => formatDate(row.receiving_stock_inventory.createdAt),
    },
  ];

  const outboundColumns = [
    {
      name: "OUTBOUND ID",
      selector: (row) => row.outbound_stock_inventory.transaction_number_id,
    },
    {
      name: "SKU #",
      selector: (row) =>
        row.product_inventory_outbound.product_inventory.product.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.product_inventory_outbound.product_inventory.product.name,
    },
    {
      name: "OUTBOUND QUANTITY",
      selector: (row) => row.product_inventory_outbound.outbound_quantity,
    },
    {
      name: "STATUS",
      selector: (row) => row.product_inventory_outbound.type,
    },
    {
      name: "OUTBOUND TIME",
      selector: (row) => formatDate(row.outbound_stock_inventory.createdAt),
    },
  ];
  const stockColumns = [
    {
      name: "STOCK COUNTING ID",
      selector: (row) => row.stock_counting_inventory.transaction_number_id,
    },
    {
      name: "SKU #",
      selector: (row) =>
        row.product_inventory_counting.product_inventory.product.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.product_inventory_counting.product_inventory.product.name,
    },
    {
      name: "SYSTEM QTY",
      selector: (row) => row.product_inventory_counting.system_count,
    },
    {
      name: "ACTUAL QTY",
      selector: (row) => row.product_inventory_counting.actual_count,
    },
    {
      name: "DIFFERENCE",
      selector: (row) => row.product_inventory_counting.stock_loss,
    },

    {
      name: "COUNTING TIME",
      selector: (row) => formatDate(row.stock_counting_inventory.createdAt),
    },
  ];

  useEffect(() => {
    const filteredData = receivedReportsData.filter((transaction) => {
      const transactionDate = new Date(
        transaction.receiving_stock_inventory.createdAt
      );
      const start = new Date(fromDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredReceivedData(filteredData);
  }, [fromDate, endDate, receivedReportsData]);

  useEffect(() => {
    const filteredData = outboundReportsData.filter((transaction) => {
      const transactionDate = new Date(
        transaction.outbound_stock_inventory.createdAt
      );
      const start = new Date(fromDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredOutboundData(filteredData);
  }, [fromDate, endDate, outboundReportsData]);

  useEffect(() => {
    const filteredData = countingReportsData.filter((transaction) => {
      const transactionDate = new Date(
        transaction.stock_counting_inventory.createdAt
      );
      const start = new Date(fromDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredCountingData(filteredData);
  }, [fromDate, endDate, countingReportsData]);
  // Filtering
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

  useEffect(() => {
    console.log("All", inventoryReportsData);
  }, [inventoryReportsData]);
  const handleFetchInventoryReports = async () => {
    try {
      // const res = await axios.get(
      //   `${BASE_URL}/product_inventory/getInventoryStock`
      // );
      const res = await axios.get(`${BASE_URL}/reports/inventoryReport`);
      // const dataWithStatus = res.data.map((item) => {
      //   let status;
      //   if (item.quantity === 0) {
      //     status = "No Stock";
      //   } else if (item.quantity < item.product.threshold) {
      //     status = "Low Stock";
      //   } else {
      //     status = "In Stock";
      //   }
      //   return {
      //     ...item,
      //     status: status,
      //   };
      // });
      setInventoryReportsData(res.data);
      setFilteredInventoryData(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(true);
    }
  };

  // const [total, setTotal] = useState([]);
  // useEffect(() => {
  //   console.log("All", total);
  // }, [total]);
  const handleFetchReceivedReports = async () => {
    try {
      setFilter(false);
      setInventoryReportsData([]);
      const res = await axios.get(`${BASE_URL}/reports/getReceiveData`);
      setReceivedReportsData(res.data);
      // setTotal(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  const handleFetchOutboundReports = async () => {
    try {
      setFilter(false);
      setInventoryReportsData([]);
      const res = await axios.get(`${BASE_URL}/reports/getOutboundData`);
      setOutBoundReportsData(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  const handleFetchCountingReports = async () => {
    try {
      setFilter(false);
      setInventoryReportsData([]);
      const res = await axios.get(`${BASE_URL}/reports/getCountingData`);
      setCountingReportsData(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (selectedPage === "inventory") {
  //       handleFetchInventoryReports();
  //     } else if (selectedPage === "received") {
  //       handleFetchReceivedReports();
  //     } else if (selectedPage === "outbound") {
  //       handleFetchOutboundReports();
  //     } else if (selectedPage === "stock counting") {
  //       handleFetchCountingReports();
  //     }
  //   }, 1500);
  //   return () => clearTimeout(timer);
  // }, [selectedPage]);

  const handleExport = async (format) => {
    let dataToExport = null;
    let exportDataFunc = null;

    if (value === 0) {
      setSelectedPage("inventory");
      if (filteredInventoryData.length === 0) {
        swal({
          title: "There are no data to export!",
          icon: "error",
          button: "OK",
        }).then(() => {
          swal.close();
        });
        return;
      }
      dataToExport = filteredInventoryData;
      exportDataFunc = () => {
        if (format === "excel") {
          const dateGenerated = new Date().toISOString().split("T")[0];
          const dateRangeFrom = new Date().toISOString().split("T")[0];
          const dateRangeTo = new Date().toISOString().split("T")[0];
          const exportedData = dataToExport.map((item) => ({
            "SKU #": item.product_inventory.product.sku,
            "STOCK NAME": item.product_inventory.product.name,
            CATEGORY: item.product_inventory.category,
            "PREVIOUS QUANTITY":
              item.product_inventory.quantity + item.total_quantity,
            "CURRENT QUANTITY": item.product_inventory.quantity,
            "TOTAL SOLD": item.total_quantity,
          }));
          // Convert exported data to CSV format
          const csv = [
            `REPORT, INVENTORY REPORTS`,
            `DATE GENERATED,${dateGenerated}`,
            `DATE RANGE,${dateRangeFrom},${dateRangeTo}`,
            "", // Empty row for spacing
            Object.keys(exportedData[0]).join(","), // Header row
            ...exportedData.map((item) => Object.values(item).join(",")),
          ].join("\n");
          // Create a Blob containing the CSV data
          const blob = new Blob([csv], { type: "text/csv" });
          // Create a download link and trigger the download
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "inventory_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = dataToExport.map((item) => {
            return [
              item.product_inventory.product.sku,
              item.product_inventory.product.name,
              item.product_inventory.category,
              item.product_inventory.quantity + item.total_quantity,
              item.product_inventory.quantity,
              item.total_quantity,
            ];
          });
          const dateGenerated = new Date().toISOString().split("T")[0];
          const dateRangeFrom = new Date().toISOString().split("T")[0];
          const dateRangeTo = new Date().toISOString().split("T")[0];

          doc.setFontSize(10);
          // Add a title
          doc.text(`Reports: Inventory Reports`, 14, 10);
          doc.text(`Date Generated: ${dateGenerated}`, 70, 10);
          doc.text(`Date Range: ${dateRangeFrom} to ${dateRangeTo}`, 180, 10);

          doc.autoTable({
            head: [
              [
                "SKU #",
                "STOCK NAME",
                "CATEGORY",
                "PREVIOUS QUANTITY",
                "CURRENT QUANTITY",
                "TOTAL SOLD",
              ],
            ],
            body: tableData,
          });

          const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
          const url = URL.createObjectURL(pdfBlob);
          window.open(url);

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(pdfBlob);
          link.download = "inventory_reports.pdf";
          link.click();
        }
      };
    } else if (value === 1) {
      setSelectedPage("received");
      if (filteredReceivedData.length === 0) {
        swal({
          title: "There are no data to export!",
          icon: "error",
          button: "OK",
        }).then(() => {
          swal.close();
        });
        return;
      }
      dataToExport = filteredReceivedData;
      exportDataFunc = () => {
        if (format === "excel") {
          const fromRange =
            fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
          const toRange =
            endDate == "" ? new Date().toISOString().split("T")[0] : endDate;
          const dateGenerated = new Date().toISOString().split("T")[0];
          const exportedData = filteredReceivedData.map((item) => ({
            "RECEIVED ID": item.receiving_stock_inventory.transaction_number_id,
            "SKU #":
              item.product_inventory_accumulate.product_inventory.product.sku,
            "STOCK NAME":
              item.product_inventory_accumulate.product_inventory.product.name,
            QUANTITY: item.product_inventory_accumulate.quantity_received,
            PRICE: item.product_inventory_accumulate.stocked_price,
            "TOTAL PRICE": item.product_inventory_accumulate.total_price,
            "STOCKING TIME": item.receiving_stock_inventory.createdAt,
          }));
          // Convert exported data to CSV format
          const csv = [
            `REPORT, RECEIVED REPORTS`,
            `DATE GENERATED,${dateGenerated}`,
            `DATE RANGE,${fromRange},${toRange}`,
            "",
            Object.keys(exportedData[0]).join(","), // Header row
            ...exportedData.map((item) => Object.values(item).join(",")),
          ].join("\n");
          // Create a Blob containing the CSV data
          const blob = new Blob([csv], { type: "text/csv" });
          // Create a download link and trigger the download
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "received_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = filteredReceivedData.map((item) => [
            item.receiving_stock_inventory.transaction_number_id,
            item.product_inventory_accumulate.product_inventory.product.sku,
            item.product_inventory_accumulate.product_inventory.product.name,
            item.product_inventory_accumulate.quantity_received,
            item.product_inventory_accumulate.stocked_price,
            item.product_inventory_accumulate.total_price,
            new Date(item.receiving_stock_inventory.createdAt)
              .toISOString()
              .split("T")[0],
          ]);

          const dateGenerated = new Date().toISOString().split("T")[0];
          const dateRangeFrom =
            fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
          const dateRangeTo =
            endDate == "" ? new Date().toISOString().split("T")[0] : endDate;
          doc.setFontSize(10);
          // Add a title
          doc.text(`Reports: Received Reports`, 14, 10);
          doc.text(`Date Generated: ${dateGenerated}`, 70, 10);
          doc.text(`Date Range: ${dateRangeFrom} to ${dateRangeTo}`, 180, 10);
          doc.autoTable({
            head: [
              [
                "RECEIVED ID",
                "SKU #",
                "STOCK NAME",
                "QUANTITY RECEIVED",
                "PRICE",
                "TOTAL PRICE",
                "STOCKING TIME",
              ],
            ],
            body: tableData,
          });

          const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
          const url = URL.createObjectURL(pdfBlob);

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(pdfBlob);
          link.download = "received_reports.pdf";
          link.click();
          window.open(url);
        }
      };
    } else if (value === 2) {
      setSelectedPage("outbound");
      if (filteredOutboundData.length === 0) {
        swal({
          title: "There are no data to export!",
          icon: "error",
          button: "OK",
        }).then(() => {
          swal.close();
        });
        return;
      }
      dataToExport = filteredOutboundData;
      exportDataFunc = () => {
        if (format === "excel") {
          const fromRange =
            fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
          const toRange =
            endDate == "" ? new Date().toISOString().split("T")[0] : endDate;
          const dateGenerated = new Date().toISOString().split("T")[0];
          const exportedData = filteredOutboundData.map((item) => ({
            "OUTBOUND ID": item.outbound_stock_inventory.transaction_number_id,
            "SKU #":
              item.product_inventory_outbound.product_inventory.product.sku,
            "STOCK NAME":
              item.product_inventory_outbound.product_inventory.product.name,
            "OUTBOUND QUANTITY":
              item.product_inventory_outbound.outbound_quantity,
            STATUS: item.product_inventory_outbound.type,
            "OUTBOUND TIME": item.outbound_stock_inventory.createdAt,
          }));
          // Convert exported data to CSV format
          const csv = [
            `REPORT, OUTBOUND REPORTS`,
            `DATE GENERATED,${dateGenerated}`,
            `DATE RANGE,${fromRange},${toRange}`,
            "",
            Object.keys(exportedData[0]).join(","), // Header row
            ...exportedData.map((item) => Object.values(item).join(",")),
          ].join("\n");
          // Create a Blob containing the CSV data
          const blob = new Blob([csv], { type: "text/csv" });
          // Create a download link and trigger the download
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "outbound_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = filteredOutboundData.map((item) => [
            item.outbound_stock_inventory.transaction_number_id,
            item.product_inventory_outbound.product_inventory.product.sku,
            item.product_inventory_outbound.product_inventory.product.name,
            item.product_inventory_outbound.outbound_quantity,
            item.product_inventory_outbound.type,
            new Date(item.outbound_stock_inventory.createdAt)
              .toISOString()
              .split("T")[0],
          ]);

          const dateGenerated = new Date().toISOString().split("T")[0];
          const dateRangeFrom =
            fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
          const dateRangeTo =
            endDate == "" ? new Date().toISOString().split("T")[0] : endDate;
          doc.setFontSize(10);
          // Add a title
          doc.text(`Reports: Outbound Reports`, 14, 10);
          doc.text(`Date Generated: ${dateGenerated}`, 70, 10);
          doc.text(`Date Range: ${dateRangeFrom} to ${dateRangeTo}`, 180, 10);
          doc.autoTable({
            head: [
              [
                "OUTBOUND ID",
                "SKU #",
                "STOCK NAME",
                "QUANTITY",
                "STATUS",
                "OUTBOUND TIME",
              ],
            ],
            body: tableData,
          });
          const link = document.createElement("a");
          const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
          const url = window.URL.createObjectURL(pdfBlob);
          link.href = window.URL.createObjectURL(pdfBlob);
          link.download = "outbound_reports.pdf";
          link.click();
          window.open(url);
        }
      };
    } else if (value === 3) {
      setSelectedPage("stock-counting");
      if (filteredCountingData.length === 0) {
        swal({
          title: "There are no data to export!",
          icon: "error",
          button: "OK",
        }).then(() => {
          swal.close();
        });
        return;
      }
      dataToExport = filteredCountingData;
      exportDataFunc = () => {
        if (format === "excel") {
          const fromRange =
            fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
          const toRange =
            endDate == "" ? new Date().toISOString().split("T")[0] : endDate;
          const dateGenerated = new Date().toISOString().split("T")[0];
          const exportedData = filteredCountingData.map((item) => ({
            "STOCK COUNTING ID":
              item.stock_counting_inventory.transaction_number_id,
            "SKU #":
              item.product_inventory_counting.product_inventory.product.sku,
            "STOCK NAME":
              item.product_inventory_counting.product_inventory.product.name,
            "SYSTEM QTY": item.product_inventory_counting.system_count,
            "ACTUAL QTY": item.product_inventory_counting.actual_count,
            DIFFERENCE: item.product_inventory_counting.stock_loss,
            "COUNTING TIME": item.stock_counting_inventory.createdAt,
          }));
          // Convert exported data to CSV format
          const csv = [
            `REPORT, STOCK COUNTING REPORTS`,
            `DATE GENERATED,${dateGenerated}`,
            `DATE RANGE,${fromRange},${toRange}`,
            "",
            Object.keys(exportedData[0]).join(","), // Header row
            ...exportedData.map((item) => Object.values(item).join(",")),
          ].join("\n");
          // Create a Blob containing the CSV data
          const blob = new Blob([csv], { type: "text/csv" });
          // Create a download link and trigger the download
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "counting_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = filteredCountingData.map((item) => [
            item.stock_counting_inventory.transaction_number_id,
            item.product_inventory_counting.product_inventory.product.sku,
            item.product_inventory_counting.product_inventory.product.name,
            item.product_inventory_counting.system_count,
            item.product_inventory_counting.actual_count,
            item.product_inventory_counting.stock_loss,
            new Date(item.stock_counting_inventory.createdAt)
              .toISOString()
              .split("T")[0],
          ]);

          const dateGenerated = new Date().toISOString().split("T")[0];
          const dateRangeFrom =
            fromDate == "" ? new Date().toISOString().split("T")[0] : fromDate;
          const dateRangeTo =
            endDate == "" ? new Date().toISOString().split("T")[0] : endDate;
          doc.setFontSize(10);
          // Add a title
          doc.text(`Reports: Stock Counting Reports`, 14, 10);
          doc.text(`Date Generated: ${dateGenerated}`, 70, 10);
          doc.text(`Date Range: ${dateRangeFrom} to ${dateRangeTo}`, 180, 10);
          doc.autoTable({
            head: [
              [
                "STOCK COUNTING ID",
                "SKU #",
                "STOCK NAME",
                "SYSTEM QTY",
                "ACTUAL QTY",
                "DIFFERENCE",
                "COUNTING TIME",
              ],
            ],
            body: tableData,
          });
          const link = document.createElement("a");
          const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
          const url = window.URL.createObjectURL(pdfBlob);
          link.href = window.URL.createObjectURL(pdfBlob);
          link.download = "counting_reports.pdf";
          link.click();
          window.open(url);
        }
      };
    }

    if (dataToExport && exportDataFunc) {
      // Now make the axios.post call
      axios
        .post(`${BASE_URL}/reports/exportReports`, {
          userId,
          selectedPage,
          format,
        })
        .then(() => {
          // Call the export data function after the axios post is successful
          exportDataFunc();
        })
        .catch((error) => {
          console.error("Error exporting reports:", error);
          swal({
            title: "Failed to export reports",
            icon: "error",
            button: "OK",
          });
        });
    }
  };

  // const handleExport = async (format) => {
  //   if (selectedPage == "inventory") {
  //     if (inventoryReportsData.length == 0) {
  //       swal({
  //         title: "There are no data to export!",
  //         icon: "error",
  //         button: "OK",
  //       }).then(() => {
  //         swal.close();
  //       });
  //       return;
  //     }
  //     if (format == "excel") {
  //       const exportedData = inventoryReportsData.map((item) => ({
  //         "SKU #": item.category_product.product.sku,
  //         "STOCK NAME": item.category_product.product.name,
  //         QUANTITY: item.quantity,
  //         STATUS: item.status,
  //       }));
  //       // Convert exported data to CSV format
  //       const csv = [
  //         Object.keys(exportedData[0]).join(","), // Header row
  //         ...exportedData.map((item) => Object.values(item).join(",")),
  //       ].join("\n");
  //       // Create a Blob containing the CSV data
  //       const blob = new Blob([csv], { type: "text/csv" });
  //       // Create a download link and trigger the download
  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = "inventory_reports.csv";
  //       link.click();
  //     } else {
  //       const doc = new jsPDF({ orientation: "landscape" });

  //       const tableData = inventoryReportsData.map((item) => {
  //         let status;
  //         if (item.quantity === 0) {
  //           status = "No Stock";
  //         } else if (item.quantity < item.category_product.product.threshold) {
  //           status = "Low Stock";
  //         } else {
  //           status = "In Stock";
  //         }

  //         return [
  //           item.category_product.product.sku,
  //           item.category_product.product.name,
  //           item.quantity,
  //           status,
  //         ];
  //       });

  //       doc.autoTable({
  //         head: [["SKU #", "STOCK NAME", "QUANTITY", "STATUS"]],
  //         body: tableData,
  //       });

  //       const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
  //       const url = URL.createObjectURL(pdfBlob);
  //       window.open(url);

  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(pdfBlob);
  //       link.download = "inventory_reports.pdf";
  //       link.click();
  //     }
  //   } else if (selectedPage == "received") {
  //     if (filteredReceivedData.length == 0) {
  //       swal({
  //         title: "There are no data to export!",
  //         icon: "error",
  //         button: "OK",
  //       }).then(() => {
  //         swal.close();
  //       });

  //       return;
  //     }

  //     if (format == "excel") {
  //       const exportedData = filteredReceivedData.map((item) => ({
  //         "RECEIVED ID": item.receiving_stock_inventory.transaction_number_id,
  //         "SKU #":
  //           item.product_inventory_accumulate.product_inventory.category_product
  //             .product.sku,
  //         "STOCK NAME":
  //           item.product_inventory_accumulate.product_inventory.category_product
  //             .product.name,
  //         QUANTITY:
  //           item.product_inventory_accumulate.product_inventory.quantity,
  //         PRICE: item.product_inventory_accumulate.product_inventory.price,
  //         "TOTAL PRICE": item.product_inventory_accumulate.total_price,
  //         "STOCKING TIME": item.receiving_stock_inventory.createdAt,
  //       }));
  //       // Convert exported data to CSV format
  //       const csv = [
  //         Object.keys(exportedData[0]).join(","), // Header row
  //         ...exportedData.map((item) => Object.values(item).join(",")),
  //       ].join("\n");
  //       // Create a Blob containing the CSV data
  //       const blob = new Blob([csv], { type: "text/csv" });
  //       // Create a download link and trigger the download
  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = "received_reports.csv";
  //       link.click();
  //     } else {
  //       const doc = new jsPDF({ orientation: "landscape" });

  //       const tableData = filteredReceivedData.map((item) => [
  //         item.receiving_stock_inventory.transaction_number_id,
  //         item.product_inventory_accumulate.product_inventory.category_product
  //           .product.sku,
  //         item.product_inventory_accumulate.product_inventory.category_product
  //           .product.name,
  //         item.product_inventory_accumulate.product_inventory.quantity,
  //         item.product_inventory_accumulate.product_inventory.price,
  //         item.product_inventory_accumulate.total_price,
  //         new Date(item.receiving_stock_inventory.createdAt)
  //           .toISOString()
  //           .split("T")[0],
  //       ]);

  //       doc.autoTable({
  //         head: [
  //           [
  //             "RECEIVED ID",
  //             "SKU #",
  //             "STOCK NAME",
  //             "QUANTITY",
  //             "PRICE",
  //             "TOTAL PRICE",
  //             "STOCKING TIME",
  //           ],
  //         ],
  //         body: tableData,
  //       });

  //       const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
  //       const url = URL.createObjectURL(pdfBlob);

  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(pdfBlob);
  //       link.download = "received_reports.pdf";
  //       link.click();
  //       window.open(url);
  //     }
  //   } else if (selectedPage == "outbound") {
  //     if (filteredOutboundData.length == 0) {
  //       swal({
  //         title: "There are no data to export!",
  //         icon: "error",
  //         button: "OK",
  //       }).then(() => {
  //         swal.close();
  //       });

  //       return;
  //     }

  //     if (format == "excel") {
  //       const exportedData = filteredOutboundData.map((item) => ({
  //         "OUTBOUND ID": item.outbound_stock_inventory.transaction_number_id,
  //         "SKU #":
  //           item.product_inventory_outbound.product_inventory.category_product
  //             .product.sku,
  //         "STOCK NAME":
  //           item.product_inventory_outbound.product_inventory.category_product
  //             .product.name,
  //         QUANTITY: item.product_inventory_outbound.product_inventory.quantity,
  //         STATUS: item.product_inventory_outbound.type,
  //         "OUTBOUND TIME": item.outbound_stock_inventory.createdAt,
  //       }));
  //       // Convert exported data to CSV format
  //       const csv = [
  //         Object.keys(exportedData[0]).join(","), // Header row
  //         ...exportedData.map((item) => Object.values(item).join(",")),
  //       ].join("\n");
  //       // Create a Blob containing the CSV data
  //       const blob = new Blob([csv], { type: "text/csv" });
  //       // Create a download link and trigger the download
  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = "outbound_reports.csv";
  //       link.click();
  //     } else {
  //       const doc = new jsPDF({ orientation: "landscape" });

  //       const tableData = filteredOutboundData.map((item) => [
  //         item.outbound_stock_inventory.transaction_number_id,
  //         item.product_inventory_outbound.product_inventory.category_product
  //           .product.sku,
  //         item.product_inventory_outbound.product_inventory.category_product
  //           .product.name,
  //         item.product_inventory_outbound.product_inventory.quantity,
  //         item.product_inventory_outbound.type,
  //         new Date(item.outbound_stock_inventory.createdAt)
  //           .toISOString()
  //           .split("T")[0],
  //       ]);

  //       doc.autoTable({
  //         head: [
  //           [
  //             "OUTBOUND ID",
  //             "SKU #",
  //             "STOCK NAME",
  //             "QUANTITY",
  //             "STATUS",
  //             "OUTBOUND TIME",
  //           ],
  //         ],
  //         body: tableData,
  //       });
  //       const link = document.createElement("a");
  //       const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
  //       const url = window.URL.createObjectURL(pdfBlob);
  //       link.href = window.URL.createObjectURL(pdfBlob);
  //       link.download = "outbound_reports.pdf";
  //       link.click();
  //       window.open(url);
  //     }
  //   } else if (selectedPage == "stock") {
  //     if (filteredCountingData.length == 0) {
  //       swal({
  //         title: "There are no data to export!",
  //         icon: "error",
  //         button: "OK",
  //       }).then(() => {
  //         swal.close();
  //       });

  //       return;
  //     }

  //     if (format == "excel") {
  //       const exportedData = filteredCountingData.map((item) => ({
  //         "STOCK COUNTING ID":
  //           item.stock_counting_inventory.transaction_number_id,
  //         "SKU #":
  //           item.product_inventory_counting.product_inventory.category_product
  //             .product.sku,
  //         "STOCK NAME":
  //           item.product_inventory_counting.product_inventory.category_product
  //             .product.name,
  //         "SYSTEM QTY": item.product_inventory_counting.system_count,
  //         "ACTUAL QTY": item.product_inventory_counting.actual_count,
  //         DIFFERENCE: item.product_inventory_counting.stock_loss,
  //         "COUNTING TIME": item.stock_counting_inventory.createdAt,
  //       }));
  //       // Convert exported data to CSV format
  //       const csv = [
  //         Object.keys(exportedData[0]).join(","), // Header row
  //         ...exportedData.map((item) => Object.values(item).join(",")),
  //       ].join("\n");
  //       // Create a Blob containing the CSV data
  //       const blob = new Blob([csv], { type: "text/csv" });
  //       // Create a download link and trigger the download
  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = "counting_reports.csv";
  //       link.click();
  //     } else {
  //       const doc = new jsPDF({ orientation: "landscape" });

  //       const tableData = filteredCountingData.map((item) => [
  //         item.stock_counting_inventory.transaction_number_id,
  //         item.product_inventory_counting.product_inventory.category_product
  //           .product.sku,
  //         item.product_inventory_counting.product_inventory.category_product
  //           .product.name,
  //         item.product_inventory_counting.system_count,
  //         item.product_inventory_counting.actual_count,
  //         item.product_inventory_counting.stock_loss,
  //         new Date(item.stock_counting_inventory.createdAt)
  //           .toISOString()
  //           .split("T")[0],
  //       ]);

  //       doc.autoTable({
  //         head: [
  //           [
  //             "STOCK COUNTING ID",
  //             "SKU #",
  //             "STOCK NAME",
  //             "SYSTEM QTY",
  //             "ACTUAL QTY",
  //             "DIFFERENCE",
  //             "COUNTING TIME",
  //           ],
  //         ],
  //         body: tableData,
  //       });
  //       const link = document.createElement("a");
  //       const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
  //       const url = window.URL.createObjectURL(pdfBlob);
  //       link.href = window.URL.createObjectURL(pdfBlob);
  //       link.download = "counting_reports.pdf";
  //       link.click();
  //       window.open(url);
  //     }
  //   }
  // };

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
  const handleChange = (event, newValue) => {
    setIsLoading(true);
    setValue(newValue);
  };

  useEffect(() => {
    console.log("Filter", filter);
    console.log(inventoryReportsData);
  }, [value, inventoryReportsData]);

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
        {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
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
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value === 0) {
        handleFetchInventoryReports();
      } else if (value === 1) {
        handleFetchReceivedReports();
      } else if (value === 2) {
        handleFetchOutboundReports();
      } else if (value === 3) {
        handleFetchCountingReports();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [value]);

  // Fetch Category

  const handleFetchCategory = async () => {
    const res = await axios.get(`${BASE_URL}/category/getCategory`);

    setCategories(res.data);
  };

  useEffect(() => {
    handleFetchCategory();
  }, []);

  // const handleSetCategory = async (e) => {
  //   const res = await axios.get(
  //     `${BASE_URL}/category_product/fetchInventoryCategory`,
  //     {
  //       params: {
  //         Idcategory: e.target.value,
  //       },
  //     }
  //   );
  //   const dataWithStatus = res.data.map((item) => {
  //     let status;
  //     if (item.quantity === 0) {
  //       status = "No Stock";
  //     } else if (item.quantity < item.product.threshold) {
  //       status = "Low Stock";
  //     } else {
  //       status = "In Stock";
  //     }
  //     return {
  //       ...item,
  //       status: status,
  //     };
  //   });
  //   setFilter(true);
  //   setInventoryReportsData(dataWithStatus);
  // };
  const handleSetCategory = (e) => {
    const selectedCategoryId = e.target.value;
    console.log(selectedCategoryId);

    if (selectedCategoryId === "All Category") {
      // Show all inventory data
      setFilteredInventoryData(inventoryReportsData);
    } else if (selectedCategoryId) {
      // Filter by selected category
      const filteredData = inventoryReportsData.filter(
        (item) => item.product_inventory.category === selectedCategoryId
      );
      setFilteredInventoryData(filteredData);
    }

    setFilter(true);
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
        ) : authrztn.includes("InventoryReport-View") ? (
          <div className="custom-card inv-card pb-0">
            <div className="pos-head-container ms-2 flex-column flex-sm-row">
              <div className="title-content-field ms-0 ms-lg-3">
                <h2>Inventory Reports</h2>
                <h2 id="dateFilterIndicator" className="fs-4"></h2>
              </div>
              {value != 0 ? (
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
              ) : (
                <div className="w-100 mb-3">
                  <Form.Select
                    aria-label="Default select example"
                    defaultValue=""
                    className="mb-0 w-100"
                    // value={selectedStatus}
                    onChange={handleSetCategory}
                    style={{
                      height: "40px",
                      // marginTop: "15px",
                      // width: "250px",
                      fontSize: "12px",
                      float: "right",
                    }}
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    <option value="All Category">All Category</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              )}
              <div className="export-container d-inline-block d-sm-none">
                {authrztn?.includes("InventoryReport-IE") && (
                  <button
                    onClick={handleSelectExport}
                    className={`${
                      value == 3 ? "inr-c-e-data export-button" : "inr-e-data"
                    } w-100`}
                    // className="inr-e-data"
                  >
                    Export Data
                  </button>
                )}
              </div>
            </div>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Inventory Reports" {...a11yProps(0)} />
                  <Tab label="Received Reports" {...a11yProps(1)} />
                  <Tab label="Outbound Reports" {...a11yProps(2)} />
                  <Tab label="Stock Counting Reports" {...a11yProps(3)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <div className="table">
                  {filteredInventoryData.length == 0 ? (
                    <>
                      <div className="no-data-table ">
                        <table>
                          <thead>
                            <th>SKU #</th>
                            <th>STOCK NAME</th>
                            <th>CATEGORY</th>
                            <th>PREVIOUS QUANTITY</th>
                            <th>CURRENT QUANTITY</th>
                            <th>TOTAL SOLD</th>
                          </thead>
                          <tbody className="inr-no-data">
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
                      <div className="inr-data-table">
                        <DataTable
                          columns={inventoryColumns}
                          data={filteredInventoryData}
                          customStyles={customStyles}
                          pagination
                        />
                      </div>
                    </>
                  )}
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <div className="table">
                  {filteredReceivedData.length == 0 ? (
                    <>
                      <div className="no-data-table ">
                        <table>
                          <thead>
                            <th>RECEIVED ID</th>
                            <th>SKU #</th>
                            <th>STOCK NAME</th>
                            <th>QUANTITY RECEIVED</th>
                            <th>PRICE</th>
                            <th>TOTAL PRICE</th>
                            <th>STOCKING TIME</th>
                          </thead>
                          <tbody className="inr-no-data">
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
                      <div className="inr-data-table">
                        <DataTable
                          columns={receivedColumns}
                          data={filteredReceivedData}
                          customStyles={customStyles}
                          pagination
                        />
                      </div>
                    </>
                  )}
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <div className="table">
                  {filteredOutboundData.length == 0 ? (
                    <>
                      <div className="no-data-table ">
                        <table>
                          <thead>
                            <th>OUTBOUND ID</th>
                            <th>SKU #</th>
                            <th>STOCK NAME</th>
                            <th>OUTBOUND QUANTITY</th>
                            <th>STATUS</th>
                            <th>OUTBOUND TIME</th>
                          </thead>
                          <tbody className="inr-no-data">
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
                      <div className="inr-data-table">
                        <DataTable
                          columns={outboundColumns}
                          data={filteredOutboundData}
                          customStyles={customStyles}
                          pagination
                        />
                      </div>
                    </>
                  )}
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={3}>
                {filteredCountingData.length == 0 ? (
                  <>
                    <div className="no-data-table ">
                      <table>
                        <thead>
                          <th>STOCK COUNTING ID</th>
                          <th>SKU #</th>
                          <th>STOCK NAME</th>
                          <th>QUANTITY RECEIVED</th>
                          <th>PRICE</th>
                          <th>TOTAL PRICE</th>
                          <th>COUNTING TIME</th>
                        </thead>
                        <tbody className="inr-no-data">
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
                    <div className="inr-data-table">
                      <DataTable
                        columns={stockColumns}
                        data={filteredCountingData}
                        customStyles={customStyles}
                        pagination
                      />
                    </div>
                  </>
                )}
              </CustomTabPanel>
            </Box>

            {/* <div className="head-container d-flex nav-inven-reports justify-content-around">
              <h2
                onClick={() => handleSelectedPage("inventory")}
                className={selectedPage == "inventory" ? "active" : ""}
              >
                Inventory Reports
              </h2>
              <h2
                onClick={() => handleSelectedPage("received")}
                className={selectedPage == "received" ? "active" : ""}
              >
                Received Reports
              </h2>
              <h2
                onClick={() => handleSelectedPage("outbound")}
                className={selectedPage == "outbound" ? "active" : ""}
              >
                Outbound Reports
              </h2>
              <h2
                onClick={() => handleSelectedPage("stock counting")}
                className={selectedPage == "stock counting" ? "active" : ""}
              >
                Stock Counting Reports
              </h2>
            </div> */}

            {/* <div className="table mt-4">
              {selectedPage == "inventory" ? (
                <>
                  <DataTable
                    columns={inventoryColumns}
                    data={inventoryReportsData}
                    customStyles={customStyles}
                    pagination
                  />
                </>
              ) : (
                <></>
              )}
              {selectedPage == "received" ? (
                <>
                  <DataTable
                    columns={receivedColumns}
                    data={filteredReceivedData}
                    customStyles={customStyles}
                    pagination
                  />
                </>
              ) : (
                <></>
              )}
              {selectedPage == "outbound" ? (
                <>
                  <DataTable
                    columns={outboundColumns}
                    data={filteredOutboundData}
                    customStyles={customStyles}
                    pagination
                  />
                </>
              ) : (
                <></>
              )}
              {selectedPage == "stock counting" ? (
                <>
                  <DataTable
                    columns={stockColumns}
                    data={filteredCountingData}
                    customStyles={customStyles}
                    pagination
                  />
                </>
              ) : (
                <></>
              )}
            </div> */}

            <div className="export-container d-none d-sm-inline-block">
              {authrztn?.includes("InventoryReport-IE") && (
                <button
                  onClick={handleSelectExport}
                  className={`${value == 3 ? "inr-c-e-data" : "inr-e-data"}`}
                  // className="inr-e-data"
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
    </>
  );
};

export default InventoryReports;
