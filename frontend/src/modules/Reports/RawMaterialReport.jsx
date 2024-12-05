import React, { useEffect, useState, useRef } from "react";
import { customStyles } from "../styles/table-style";
import { Button, Modal, Dropdown } from "react-bootstrap";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import "jspdf-autotable";
import jsPDF from "jspdf";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import noData from "../../assets/icon/no-data.png";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

const RawMaterialReport = ({ authrztn }) => {
  const [rawInventory, setRawInventory] = useState([]);
  const [selectedPage, setSelectedPage] = useState("raw inventory");
  const [rawReceivedData, setRawReceivedData] = useState([]);
  const [rawOutboundData, setRawOutboundData] = useState([]);
  const [rawCountData, setRawCountData] = useState([]);
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [filteredReceivedData, setFilteredReceivedData] =
    useState(rawReceivedData);

  const [filteredOutboundData, setFilteredOutboundData] =
    useState(rawOutboundData);

  const [filteredCountingData, setFilteredCountingData] =
    useState(rawCountData);

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

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };
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

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    const filteredData = rawReceivedData.filter((transaction) => {
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
  }, [fromDate, endDate, rawReceivedData]);
  useEffect(() => {
    const filteredData = rawOutboundData.filter((transaction) => {
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
  }, [fromDate, endDate, rawOutboundData]);

  useEffect(() => {
    const filteredData = rawCountData.filter((transaction) => {
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
  }, [fromDate, endDate, rawCountData]);

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

  const rawColumns = [
    {
      name: "SKU #",
      selector: (row) => row.raw_material.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) => row.raw_material.material_name,
    },
    {
      name: "UNIT TYPE",
      selector: (row) => row.raw_material.unit_type,
    },
    {
      name: "AVAILABLE STOCKS",
      selector: (row) => row.quantity,
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
    },
  ];
  const receivedColumns = [
    {
      name: "RECEIVED ID",
      selector: (row) => row.receiving_stock_inventory.transaction_number_id,
    },
    {
      name: "SKU #",
      selector: (row) =>
        row.raw_inventory_accumulate.raw_inventory.raw_material.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.raw_inventory_accumulate.raw_inventory.raw_material.material_name,
    },
    {
      name: "QUANTITY RECEIVED",
      selector: (row) => row.raw_inventory_accumulate.quantity_received,
    },
    {
      name: "PRICE",
      selector: (row) =>
        row.raw_inventory_accumulate.raw_inventory.raw_material.unit_price,
    },
    {
      name: "TOTAL PRICE",
      selector: (row) => row.raw_inventory_accumulate.total_price,
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
        row.raw_inventory_outbound.raw_inventory.raw_material.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.raw_inventory_outbound.raw_inventory.raw_material.material_name,
    },
    {
      name: "OUTBOUND QUANTITY",
      selector: (row) => row.raw_inventory_outbound.outbound_quantity,
    },
    {
      name: "STATUS",
      selector: (row) => row.raw_inventory_outbound.type,
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
        row.raw_inventory_counting.raw_inventory.raw_material.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.raw_inventory_counting.raw_inventory.raw_material.material_name,
    },
    {
      name: "SYSTEM QTY",
      selector: (row) => row.raw_inventory_counting.system_count,
    },
    {
      name: "ACTUAL QTY",
      selector: (row) => row.raw_inventory_counting.actual_count,
    },
    {
      name: "DIFFERENCE",
      selector: (row) => row.raw_inventory_counting.stock_loss,
    },

    {
      name: "COUNTING TIME",
      selector: (row) => formatDate(row.stock_counting_inventory.createdAt),
    },
  ];

  const fetchRawInventory = async () => {
    const res = await axios.get(`${BASE_URL}/reports/raw-mats-report`);

    const dataWithStatusRawMaterial = res.data.map((rawitem) => {
      let status;
      if (rawitem.quantity === 0) {
        status = "No Stock";
      } else if (rawitem.quantity < rawitem.raw_material.threshold) {
        status = "Low Stock";
      } else {
        status = "In Stock";
      }
      return {
        ...rawitem,
        status: status,
      };
    });
    setRawInventory(dataWithStatusRawMaterial);
    setIsLoading(false);
  };
  const fetchReceivedRawInventory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/getReceiveRawData`);
      setRawReceivedData(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(true);
    }
  };
  const fetchOutboundRawInventory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/getOutboundRawData`);
      setRawOutboundData(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(true);
    }
  };
  const fetchCountingRawInventory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/reports/getCountRawData`);
      setRawCountData(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(true);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  // const handleExport = (format) => {
  //   if (value == 0) {
  //     if (rawInventory.length <= 0) {
  //       swal({
  //         title: "There are no data to export!",
  //         icon: "error",
  //         button: "OK",
  //       }).then(() => {
  //         swal.close();
  //       });

  //       return;
  //     }
  //     // Extract specific fields for export
  //     axios.post(`${BASE_URL}/reports/rawMatsReportLog`, {
  //       userId,
  //       format,
  //     });
  //     if (format == "excel") {
  //       const exportedData = rawInventory.map((item) => ({
  //         "SKU #": item.raw_material.sku,
  //         "ITEM NAME": item.raw_material.material_name,
  //         "UNIT TYPE": item.raw_material.unit_type,
  //         "AVAILABLE STOCKS": item.quantity,
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
  //       link.download = "raw_material_reports.csv";
  //       link.click();
  //     } else if (format == "pdf") {
  //       const doc = new jsPDF({ orientation: "landscape" });

  //       const tableData = rawInventory.map((item) => {
  //         let status;
  //         if (item.quantity === 0) {
  //           status = "No Stock";
  //         } else if (item.quantity < item.raw_material.threshold) {
  //           status = "Low Stock";
  //         } else {
  //           status = "In Stock";
  //         }

  //         return [
  //           item.raw_material.sku,
  //           item.raw_material.material_name,
  //           item.raw_material.unit_type,
  //           item.quantity,
  //           status,
  //         ];
  //       });

  //       doc.autoTable({
  //         head: [
  //           ["SKU #", "ITEM NAME", "UNIT TYPE", "AVAILABLE STOCKS", "STATUS"],
  //         ],
  //         body: tableData,
  //       });
  //       const link = document.createElement("a");
  //       const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
  //       const url = window.URL.createObjectURL(pdfBlob);
  //       link.href = window.URL.createObjectURL(pdfBlob);
  //       link.download = "raw_material_reports.pdf";
  //       link.click();
  //       window.open(url);
  //     }
  //   }else if(value == 1){

  //   }

  // };

  const handleExport = async (format) => {
    let dataToExport = null;
    let exportDataFunc = null;

    if (value === 0) {
      setSelectedPage("raw inventory");
      if (rawInventory.length === 0) {
        swal({
          title: "There are no data to export!",
          icon: "error",
          button: "OK",
        }).then(() => {
          swal.close();
        });
        return;
      }
      dataToExport = rawInventory;
      exportDataFunc = () => {
        if (format === "excel") {
          const exportedData = rawInventory.map((item) => ({
            "SKU #": item.raw_material.sku,
            "ITEM NAME": item.raw_material.material_name,
            "UNIT TYPE": item.raw_material.unit_type,
            "AVAILABLE STOCKS": item.quantity,
            STATUS: item.status,
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
          link.download = "raw_inventory_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = rawInventory.map((item) => {
            let status;
            if (item.quantity === 0) {
              status = "No Stock";
            } else if (item.quantity < item.raw_material.threshold) {
              status = "Low Stock";
            } else {
              status = "In Stock";
            }

            return [
              item.raw_material.sku,
              item.raw_material.material_name,
              item.raw_material.unit_type,
              item.quantity,
              status,
            ];
          });

          doc.autoTable({
            head: [
              ["SKU #", "ITEM NAME", "UNIT TYPE", "AVAILABLE STOCKS", "STATUS"],
            ],
            body: tableData,
          });

          const pdfBlob = new Blob([doc.output()], { type: "application/pdf" });
          const url = URL.createObjectURL(pdfBlob);
          window.open(url);

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(pdfBlob);
          link.download = "raw_inventory_reports.pdf";
          link.click();
        }
      };
    } else if (value === 1) {
      setSelectedPage("raw received");
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
          const exportedData = filteredReceivedData.map((item) => ({
            "RECEIVED ID": item.receiving_stock_inventory.transaction_number_id,
            "SKU #":
              item.raw_inventory_accumulate.raw_inventory.raw_material.sku,
            "STOCK NAME":
              item.raw_inventory_accumulate.raw_inventory.raw_material
                .material_name,
            "QUANTITY RECEIVED":
              item.raw_inventory_accumulate.quantity_received,
            PRICE:
              item.raw_inventory_accumulate.raw_inventory.raw_material
                .unit_price,
            "TOTAL PRICE": item.raw_inventory_accumulate.total_price,
            "STOCKING TIME": item.receiving_stock_inventory.createdAt,
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
          link.download = "received_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = filteredReceivedData.map((item) => [
            item.receiving_stock_inventory.transaction_number_id,
            item.raw_inventory_accumulate.raw_inventory.raw_material.sku,
            item.raw_inventory_accumulate.raw_inventory.raw_material
              .material_name,
            item.raw_inventory_accumulate.quantity_received,
            item.raw_inventory_accumulate.raw_inventory.raw_material.unit_price,
            item.raw_inventory_accumulate.total_price,
            new Date(item.receiving_stock_inventory.createdAt)
              .toISOString()
              .split("T")[0],
          ]);

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
      setSelectedPage("raw outbound");
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
          const exportedData = filteredOutboundData.map((item) => ({
            "OUTBOUND ID": item.outbound_stock_inventory.transaction_number_id,
            "SKU #": item.raw_inventory_outbound.raw_inventory.raw_material.sku,
            "STOCK NAME":
              item.raw_inventory_outbound.raw_inventory.raw_material
                .material_name,
            "OUTBOUND QUANTITY": item.raw_inventory_outbound.outbound_quantity,
            STATUS: item.raw_inventory_outbound.type,
            "OUTBOUND TIME": item.outbound_stock_inventory.createdAt,
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
          link.download = "raw_outbound_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = filteredOutboundData.map((item) => [
            item.outbound_stock_inventory.transaction_number_id,
            item.raw_inventory_outbound.raw_inventory.raw_material.sku,
            item.raw_inventory_outbound.raw_inventory.raw_material
              .material_name,
            item.raw_inventory_outbound.outbound_quantity,
            item.raw_inventory_outbound.type,
            new Date(item.outbound_stock_inventory.createdAt)
              .toISOString()
              .split("T")[0],
          ]);

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
          link.download = "raw_outbound_reports.pdf";
          link.click();
          window.open(url);
        }
      };
    } else if (value === 3) {
      setSelectedPage("raw stock-counting");
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
          const exportedData = filteredCountingData.map((item) => ({
            "STOCK COUNTING ID":
              item.stock_counting_inventory.transaction_number_id,
            "SKU #": item.raw_inventory_counting.raw_inventory.raw_material.sku,
            "STOCK NAME":
              item.raw_inventory_counting.raw_inventory.raw_material
                .material_name,
            "SYSTEM QTY": item.raw_inventory_counting.system_count,
            "ACTUAL QTY": item.raw_inventory_counting.actual_count,
            DIFFERENCE: item.raw_inventory_counting.stock_loss,
            "COUNTING TIME": item.stock_counting_inventory.createdAt,
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
          link.download = "raw_counting_reports.csv";
          link.click();
        } else {
          const doc = new jsPDF({ orientation: "landscape" });

          const tableData = filteredCountingData.map((item) => [
            item.stock_counting_inventory.transaction_number_id,
            item.raw_inventory_counting.raw_inventory.raw_material.sku,
            item.raw_inventory_counting.raw_inventory.raw_material
              .material_name,
            item.raw_inventory_counting.system_count,
            item.raw_inventory_counting.actual_count,
            item.raw_inventory_counting.stock_loss,
            new Date(item.stock_counting_inventory.createdAt)
              .toISOString()
              .split("T")[0],
          ]);

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
          link.download = "raw_counting_reports.pdf";
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

  // For Tabs
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setIsLoading(true);
    setValue(newValue);
  };

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
        fetchRawInventory();
      } else if (value === 1) {
        fetchReceivedRawInventory();
      } else if (value === 2) {
        fetchOutboundRawInventory();
      } else if (value === 3) {
        fetchCountingRawInventory();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [value]);
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
        ) : authrztn.includes("RawInventoryReport-View") ? (
          <div className="custom-card inv-card pb-0">
            <div className="pos-head-container ms-2 flex-column flex-sm-row">
              <div className="title-content-field ms-0 ms-lg-3">
                <h2>Raw Materials Report</h2>
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
              ) : null}
              <div className="export-container d-inline-block d-sm-none">
                {authrztn?.includes("RawInventoryReport-IE") && (
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
                  <Tab label="Raw Material Reports" {...a11yProps(0)} />
                  <Tab
                    label="Received Raw Materials Reports"
                    {...a11yProps(1)}
                  />
                  <Tab
                    label="Outbound Raw Materials Reports"
                    {...a11yProps(2)}
                  />
                  <Tab
                    label="Stock Counting Raw Materials Reports"
                    {...a11yProps(3)}
                  />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <div className="table">
                  {rawInventory.length == 0 ? (
                    <>
                      <div className="no-data-table">
                        <table>
                          <thead>
                            <th>SKU #</th>
                            <th>MATERIALS NAME</th>
                            <th>DESCRIPTION</th>
                            <th>UNIT TYPE</th>
                            <th>UNIT PRICE</th>
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
                          columns={rawColumns}
                          data={rawInventory}
                          pagination
                          paginationRowsPerPageOptions={[5, 10, 25]}
                          highlightOnHover
                          customStyles={customStyles}
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
                      <div className="no-data-table">
                        <table>
                          <thead>
                            <th>SKU #</th>
                            <th>MATERIALS NAME</th>
                            <th>DESCRIPTION</th>
                            <th>UNIT TYPE</th>
                            <th>UNIT PRICE</th>
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
                          pagination
                          paginationRowsPerPageOptions={[5, 10, 25]}
                          highlightOnHover
                          customStyles={customStyles}
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
                      <div className="no-data-table">
                        <table>
                          <thead>
                            <th>SKU #</th>
                            <th>MATERIALS NAME</th>
                            <th>DESCRIPTION</th>
                            <th>UNIT TYPE</th>
                            <th>UNIT PRICE</th>
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
                          pagination
                          paginationRowsPerPageOptions={[5, 10, 25]}
                          highlightOnHover
                          customStyles={customStyles}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={3}>
                <div className="table">
                  {filteredCountingData.length == 0 ? (
                    <>
                      <div className="no-data-table">
                        <table>
                          <thead>
                            <th>SKU #</th>
                            <th>MATERIALS NAME</th>
                            <th>DESCRIPTION</th>
                            <th>UNIT TYPE</th>
                            <th>UNIT PRICE</th>
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
                          pagination
                          paginationRowsPerPageOptions={[5, 10, 25]}
                          highlightOnHover
                          customStyles={customStyles}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CustomTabPanel>
            </Box>

            {/* <div className="table custom-datatable pos-rep">
              {rawInventory.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>SKU #</th>
                        <th>MATERIALS NAME</th>
                        <th>DESCRIPTION</th>
                        <th>UNIT TYPE</th>
                        <th>UNIT PRICE</th>
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
                      columns={rawColumns}
                      data={rawInventory}
                      pagination
                      paginationRowsPerPageOptions={[5, 10, 25]}
                      highlightOnHover
                      customStyles={customStyles}
                    />
                  </div>
                </>
              )}
            </div> */}

            <div className="export-container d-none d-sm-inline-block">
              {authrztn?.includes("RawInventoryReport-IE") && (
                <button
                  onClick={handleSelectExport}
                  className={`${value == 3 ? "inr-c-e-data" : "inr-e-data"}`}
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

export default RawMaterialReport;
