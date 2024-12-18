import React, { useEffect, useState, useRef } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
import "../styles/inventory.css";
// import "../styles/pos_react.css";
import { Button, Modal, Form, Dropdown } from "react-bootstrap";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import noData from "../../assets/icon/no-data.png";
import { customStyles } from "../styles/table-style";
import BASE_URL from "../../assets/global/url";
import axios from "axios";
// import DateRange from "../../components/DateRange";
// import exportFile from "./customHook/exportFile";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";

const CustomHeader = ({ column }) => (
  <div style={{ textAlign: "center" }}>{column.name}</div>
);

const StockCounting = ({ authrztn }) => {
  // const { handleExport } = exportFile();
  const [userId, setuserId] = useState("");
  const [fromDate, setFromDate] = useState();
  const [endDate, setEndDate] = useState();
  const [validated, setValidated] = useState(false);
  const [Category, setCategory] = useState([]);
  const [product, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stockCountingData, setStockCountingData] = useState([]);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const [filteredStockCountingData, setFilteredStockCountingData] =
    useState(stockCountingData);
  const [modalStockCountingData, setModalStockCountingData] = useState([]);
  const [fetchStockCountTime, setFetchStockCountTime] = useState("");
  const [fetchRemarks, setFetchRemarks] = useState("");
  const [fetchTransacNumber, setFetchTransacNumber] = useState("");

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [search, setSearch] = useState("");

  const [showStockCountModal, setShowStockCountModal] = useState(false); // For Button New Stock Count
  const handleShowStockCountModal = () => setShowStockCountModal(true);
  const handleCloseStockCountModal = () => {
    setValidated(false);
    setShowStockCountModal(false);
    setSelectedProducts([]);
    setProduct([]);
  };
  const [showStockDetailModal, setShowStockDetailModal] = useState(false); // For Stock Detail Modal
  const handleCloseStockDetailModal = () => setShowStockDetailModal(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [showStockCountRawModal, setShowStockCountRawModal] = useState(false);
  const handleShowStockCountRawModal = () => setShowStockCountRawModal(true);
  const handleCloseStockCountRawModal = () => {
    setValidated(false);
    setShowStockCountRawModal(false);
    setSelectedRawMaterial([]);
  };

  const dropdownRef = useRef(null);

  const [rawMaterial, setRawMaterial] = useState([]);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState([]);
  const [isRawFetch, setIsRawFetch] = useState(null);

  const [loadingBtn, setLoadingBtn] = useState(false);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
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

  // const handleShowStockDetailModal = async (data) => {
  //   const stockingId = data.stock_counting_inventory_id;
  //   try {
  //     const res = await axios.get(
  //       BASE_URL + "/stockCounting/modalStockCountingDetails",
  //       {
  //         params: {
  //           stockInventoryCountingId: stockingId,
  //         },
  //       }
  //     );
  //     setModalStockCountingData(res.data);
  //     const formattedDate = formatDate(
  //       res.data[0].stock_counting_inventory.createdAt
  //     );
  //     setFetchStockCountTime(formattedDate);
  //     setFetchRemarks(res.data[0].stock_counting_inventory.remarks);
  //     setFetchTransacNumber(
  //       res.data[0].stock_counting_inventory.transaction_number_id
  //     );
  //     setShowStockDetailModal(true);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleShowStockDetailModal = async (data) => {
    const stockingId = data.stock_counting_inventory_id;

    try {
      if (data.type === "Product") {
        setIsRawFetch(false);
        const res = await axios.get(
          BASE_URL + "/stockCounting/modalStockCountingDetails",
          {
            params: {
              stockInventoryCountingId: stockingId,
            },
          }
        );
        setModalStockCountingData(res.data);
        const formattedDate = formatDate(
          res.data[0].stock_counting_inventory.createdAt
        );
        setFetchStockCountTime(formattedDate);
        setFetchRemarks(res.data[0].stock_counting_inventory.remarks);
        setFetchTransacNumber(
          res.data[0].stock_counting_inventory.transaction_number_id
        );
        setShowStockDetailModal(true);
      } else {
        const res = await axios.get(
          BASE_URL + "/rawmaterial/modalRawCounting",
          {
            params: {
              stockInventoryCountingId: stockingId,
            },
          }
        );
        setIsRawFetch(true);
        setModalStockCountingData(res.data);
        const formattedDate = formatDate(
          res.data[0].stock_counting_inventory.createdAt
        );
        setFetchStockCountTime(formattedDate);
        setFetchRemarks(res.data[0].stock_counting_inventory.remarks);
        setFetchTransacNumber(
          res.data[0].stock_counting_inventory.transaction_number_id
        );
        setShowStockDetailModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //fetch for outbound data
  const reloadStockCounting = () => {
    axios
      .get(BASE_URL + "/stockCounting/getStockCountingData")
      .then((res) => {
        setStockCountingData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(true);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadStockCounting();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  //fetch for category dropdown
  const reloadCategoryTable = () => {
    axios
      .get(BASE_URL + "/category/inventoryCategoryDropdown")
      .then((res) => {
        const sortedData = res.data.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
        setCategory(sortedData);
      })
      .catch((err) => console.log(err));
  };

  //generating of transaction number
  const generateRandomCode = async () => {
    try {
      const randomLetters = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      const res = await axios.get(
        `${BASE_URL}/product_inventory_accumulate/get-transaction-number`
      );
      console.log(res.data);

      const referenceCode = `${year}${month}${day}${randomLetters}${res.data.transactionNum}`;
      setTransactionNumber(referenceCode);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    generateRandomCode();
    reloadCategoryTable();
    decodeToken();
  }, []);

  //onchange ng category para mafetch yung product na under ng category
  const handleFormChangeCategory = (event) => {
    const categoryId = event.target.value;
    axios
      .get(BASE_URL + "/category_product/fetchCategoryStockCounting", {
        params: {
          Idcategory: categoryId,
        },
      })
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => console.log(err));
  };

  const handleCheckboxChange = (prod) => {
    setSelectedProducts((prevSelectedProducts) => {
      const isSelected = prevSelectedProducts.some(
        (p) => p.product_id === prod.product_id
      );
      const updatedSelectedProducts = isSelected
        ? prevSelectedProducts.filter((p) => p.product_id !== prod.product_id)
        : [...prevSelectedProducts, prod];

      // Update the "Select All" checkbox state
      setIsAllSelected(updatedSelectedProducts.length === product.length);
      return updatedSelectedProducts;
    });
  };

  const handleRemoveProduct = (prod) => {
    setSelectedProducts((prevSelectedProducts) => {
      const updatedSelectedProducts = prevSelectedProducts.filter(
        (p) => p.product_id !== prod.product_id
      );
      setIsAllSelected(updatedSelectedProducts.length === product.length);
      return updatedSelectedProducts;
    });
  };

  const handleSelectAllChange = () => {
    if (isAllSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(product);
    }
    setIsAllSelected(!isAllSelected);
  };

  useEffect(() => {
    // If walang products na selected, uncheck "Select All"
    if (selectedProducts.length === 0) {
      setIsAllSelected(false);
    }
  }, [selectedProducts]);

  const isProductSelected = (productInventoryId) => {
    return selectedProducts.some((p) => p.product_id === productInventoryId);
  };

  const handleQuantityChange = (productInventoryId, event) => {
    let newQuantity = parseInt(event.target.value, 10) || 0;

    if (newQuantity < 0) {
      newQuantity = 0;
      event.target.value = newQuantity;
    }

    const product = selectedProducts.find(
      (p) => p.product_id === productInventoryId
    );

    console.log("Quantity Change", product);

    if (product) {
      const loss =
        product.product.product_inventories[0].quantity - newQuantity;

      setSelectedProducts((prevSelectedProducts) =>
        prevSelectedProducts.map((p) =>
          p.product_id === productInventoryId
            ? {
                ...p,
                actualQuantity: newQuantity,
                loss: loss,
              }
            : p
        )
      );
    }
  };

  const handleQuantityChange_raw = (rawID, event) => {
    const newQuantity = parseFloat(event.target.value, 10) || 0;
    const product = selectedRawMaterial.find((r) => r.raw_id === rawID);

    if (product) {
      const loss = product.quantity - newQuantity;

      setSelectedRawMaterial((prevSelectedRaw) =>
        prevSelectedRaw.map((r) =>
          r.raw_id === rawID
            ? {
                ...r,
                actualQuantity: newQuantity,
                loss: loss.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
              }
            : r
        )
      );
    }
  };

  const handleStockCountingForm = async (e) => {
    e.preventDefault();

    if (selectedProducts.length == 0) {
      swal({
        icon: "error",
        title: "Please select products first",
        text: "No product found",
      });
      return;
    }
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill the red text fields",
      });
    } else {
      try {
        const stockCountingData = selectedProducts.map((product) => ({
          product_id: product.product_id,
          quantity: product.actualQuantity,
          loss: product.loss,
        }));

        setLoadingBtn(true);

        const response = await axios.post(
          `${BASE_URL}/stockCounting/stockcountingProcess`,
          {
            transactionNumber,
            remarks,
            stockCountingData,
            userId,
          }
        );
        if (response.status === 200) {
          swal({
            title: "Stock Counting Process Added Successfully",
            text: "The stock counting has been processed successfully",
            icon: "success",
            button: "OK",
          }).then(() => {
            setRemarks("");
            setTransactionNumber("");
            setSelectedProducts([]);
            setShowStockCountModal(false);
            setLoadingBtn(false);
            setValidated(false);
            reloadStockCounting();
            generateRandomCode();
          });
        } else {
          swal({
            title: "Stock Counting Process Error",
            text: "Please contact the admin for the support",
            icon: "error",
            button: "OK",
          });
        }
      } catch (error) {
        console.error("Error saving data:", error);
        swal({
          title: "ERROR",
          text: "Please Contact your administrator.",
          icon: "error",
          button: "OK",
        });
      }
    }
    setValidated(true);
  };

  const handleStockCountingForm_raw = async (e) => {
    e.preventDefault();

    if (selectedRawMaterial.length == 0) {
      swal({
        icon: "error",
        title: "Please select raw materials first",
        text: "No raw materials found",
      });
      return;
    }

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill the red text fields",
      });
    } else {
      try {
        const stockCountingData = selectedRawMaterial.map((raw) => ({
          raw_id: raw.raw_id,
          systemCount: raw.quantity,
          actualQuantity: raw.actualQuantity,
          loss: raw.loss,
        }));

        setLoadingBtn(true);

        const response = await axios.post(
          `${BASE_URL}/rawMaterial/stockCounting`,
          {
            transactionNumber,
            remarks,
            stockCountingData,
            userId,
          }
        );
        if (response.status === 200) {
          swal({
            title: "Stock Counting Process Added Successfully",
            text: "The stock counting has been processed successfully",
            icon: "success",
            button: "OK",
          }).then(() => {
            setRemarks("");
            setTransactionNumber("");
            setSelectedRawMaterial([]);
            setShowStockCountRawModal(false);
            setValidated(false);
            setLoadingBtn(false);
            reloadStockCounting();
            generateRandomCode();
          });
        } else {
          swal({
            title: "Stock Counting Process Error",
            text: "Please contact the admin for the support",
            icon: "error",
            button: "OK",
          });
        }
      } catch (error) {
        console.error("Error saving data:", error);
        swal({
          title: "ERROR",
          text: "Please Contact your administrator.",
          icon: "error",
          button: "OK",
        });
      }
    }
    setValidated(true);
  };

  function formatDate(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Intl.DateTimeFormat("en-US", options).format(new Date(datetime));
  }

  //filtering section function
  useEffect(() => {
    const filteredData = stockCountingData.filter((stock) => {
      const transactionDate = new Date(stock.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredStockCountingData(filteredData);
  }, [fromDate, endDate, stockCountingData]);

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
  //end ng filter function

  const handleSelectAllChange_rawMat = () => {
    if (isAllSelected) {
      setSelectedRawMaterial([]);
    } else {
      setSelectedRawMaterial(rawMaterial);
    }
    setIsAllSelected(!isAllSelected);
  };

  // Column for stock counting table
  const stockCountingColumn = [
    {
      name: "TRANSACTION NUMBER",
      selector: (row) => row.transaction_number_id,
    },
    {
      name: "REMARKS",
      selector: (row) => row.remarks,
    },
    {
      name: "STOCK COUNTING TIME",
      selector: (row) => formatDate(row.createdAt),
    },
  ];

  // Column for first table in Modal

  const modalColumn = [
    {
      name: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAllChange}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={isProductSelected(row.product_id)}
          onChange={() => handleCheckboxChange(row)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "SKU",
      selector: (row) => row.product.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) => row.product.name,
    },
    {
      name: "SYSTEM STOCK",
      selector: (row) =>
        row.product.product_inventories.length > 0
          ? row.product.product_inventories[0].quantity
          : 0,
    },
    // {
    //   name: "PRICE",
    //   selector: (row) => row.category_product.product.price,
    // },
    {
      name: "IMAGE",
      selector: (row) => (
        <img
          src={`data:image/png;base64,${row.product.image}`}
          alt="Product"
          style={{
            width: "70px",
            height: "50px",
            objectFit: "cover",
            padding: "3px",
          }}
        />
      ),
      cell: (row) => (
        <div style={{ textAlign: "center" }}>
          <img
            src={`data:image/png;base64,${row.product.image}`}
            alt="Product"
            style={{
              width: "70px",
              height: "50px",
              objectFit: "cover",
              padding: "3px",
            }}
          />
        </div>
      ),
      sortable: false,
      header: CustomHeader,
      center: true,
    },
  ];

  // Column for raw
  const modalColumnRaw = [
    {
      name: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAllChange_rawMat}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={isRawSelected(row.id)}
          onChange={() => handleCheckboxChange_raw(row)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "SKU",
      selector: (row) => row.raw_material.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) => row.raw_material.material_name,
    },
    {
      name: "UNIT",
      selector: (row) => row.raw_material.unit_type,
    },
    {
      name: "CURRENT STOCK",
      selector: (row) => row.quantity,
    },
    {
      name: "PRICE",
      selector: (row) =>
        row.raw_material.unit_price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ];

  // Column for second table in Modal
  const modalColumn2 = [
    {
      name: "SKU",
      selector: (row) => row.product.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) => row.product.name,
    },
    {
      name: "SYSTEM COUNTS",
      selector: (row) =>
        row.product.product_inventories.length > 0
          ? row.product.product_inventories[0].quantity
          : 0,
    },
    {
      name: "ACTUAL COUNTS",
      selector: (row) => row.product_id,
      cell: (row, index) => (
        <Form.Control
          style={{ margin: "auto", height: "35px", width: "135px" }}
          type="text"
          placeholder="Input Quantity"
          value={
            selectedProducts.find((p) => p.product_id === row.product_id)
              ?.actualQuantity || ""
          }
          onChange={(event) => handleQuantityChange(row.product_id, event)}
          required
          onKeyDown={(e) => {
            ["e", "E", "-", "+", "."].includes(e.key) && e.preventDefault();
          }}
        />
      ),
    },
    {
      name: "DIFFERENCE",
      selector: (row) => row.loss,
    },
    {
      name: "ACTION",
      cell: (row) => (
        <p style={{ color: "red" }} onClick={() => handleRemoveProduct(row)}>
          Remove
        </p>
      ),
    },
  ];

  const modalColumn2Raw = [
    {
      name: "SKU",
      selector: (row) => row.raw_material.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) => row.raw_material.material_name,
    },
    {
      name: "SYSTEM COUNTS",
      selector: (row) => row.quantity,
    },
    {
      name: "ACTUAL COUNTS",
      selector: (row) => row.raw_id,
      cell: (row, index) => (
        <Form.Control
          style={{ margin: "auto", height: "35px", width: "135px" }}
          type="text"
          step="0.01"
          placeholder="Input Quantity"
          value={
            selectedRawMaterial.find((r) => r.raw_id === row.raw_id)
              ?.actualQuantity || ""
          }
          onChange={(event) => handleQuantityChange_raw(row.raw_id, event)}
          required
          onKeyDown={(e) => {
            ["e", "E", "-", "+", "."].includes(e.key) && e.preventDefault();
          }}
        />
      ),
    },
    {
      name: "DIFFERENCE",
      selector: (row) => row.loss,
    },
    {
      name: "ACTION",
      cell: (row) => (
        <p
          style={{ color: "red" }}
          onClick={() => handleRemoveProduct_raw(row)}
        >
          Remove
        </p>
      ),
    },
  ];

  const modalColumnStockCountingDetails = [
    {
      name: "SKU",
      selector: (row) =>
        row.product_inventory_counting.product_inventory.product.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) =>
        row.product_inventory_counting.product_inventory.product.name,
    },
    {
      name: "SYSTEM COUNTS",
      selector: (row) => row.product_inventory_counting.system_count,
    },
    {
      name: "ACTUAL COUNTS",
      selector: (row) => row.product_inventory_counting.actual_count,
    },
    {
      name: "LOSS",
      selector: (row) => row.product_inventory_counting.stock_loss,
    },
    {
      name: "IMAGE",
      selector: (row) => (
        <img
          src={`data:image/png;base64,${row.product_inventory_counting.product_inventory.product.image}`}
          alt="Product"
          style={{
            width: "70px",
            height: "50px",
            objectFit: "cover",
            padding: "3px",
          }}
        />
      ),
      cell: (row) => (
        <div style={{ textAlign: "center" }}>
          <img
            src={`data:image/png;base64,${row.product_inventory_counting.product_inventory.product.image}`}
            alt="Product"
            style={{
              width: "70px",
              height: "50px",
              objectFit: "cover",
              padding: "3px",
            }}
          />
        </div>
      ),
      sortable: false,
      header: CustomHeader,
      center: true,
    },
  ];

  // Raw Stock Counting Column
  const modalRawColumnStockCountingDetails = [
    {
      name: "SKU",
      selector: (row) =>
        row.raw_inventory_counting.raw_inventory.raw_material.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) =>
        row.raw_inventory_counting.raw_inventory.raw_material.material_name,
    },
    {
      name: "SYSTEM COUNTS",
      selector: (row) => row.raw_inventory_counting.system_count,
    },
    {
      name: "ACTUAL COUNTS",
      selector: (row) => row.raw_inventory_counting.actual_count,
    },
    {
      name: "LOSS",
      selector: (row) => row.raw_inventory_counting.stock_loss,
    },
  ];

  //function for returning search results
  const processSearch = (search) => {
    search = encodeURIComponent(search);
    axios
      .get(`${BASE_URL}/stockCounting/getSearchResults/${search}`)
      .then((res) => {
        setStockCountingData(res.data);
      })
      .catch((err) => console.log(err));
  };

  //function for passing value from search field
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value == "") {
      reloadStockCounting();
    } else {
      processSearch(value);
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

  // RAW MATERIALS

  const reloadRawMaterial = () => {
    axios
      .get(BASE_URL + "/rawmaterial/getRawInventory")
      .then((res) => {
        setRawMaterial(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    reloadRawMaterial();
  }, []);

  const handleCheckboxChange_raw = (prod) => {
    setSelectedRawMaterial((prevSelectedProducts) => {
      const isSelected = prevSelectedProducts.some((p) => p.id === prod.id);
      const updatedSelectedProducts = isSelected
        ? prevSelectedProducts.filter((p) => p.id !== prod.id)
        : [...prevSelectedProducts, prod];

      // Update the "Select All" checkbox state
      setIsAllSelected(updatedSelectedProducts.length === rawMaterial.length);
      console.log(updatedSelectedProducts);
      return updatedSelectedProducts;
    });
  };

  const handleRemoveProduct_raw = (prod) => {
    setSelectedRawMaterial((prevSelectedProducts) => {
      const updatedSelectedProducts = prevSelectedProducts.filter(
        (p) => p.id !== prod.id
      );
      setIsAllSelected(updatedSelectedProducts.length === product.length);
      return updatedSelectedProducts;
    });
  };

  const isRawSelected = (raw_inv_id) => {
    return selectedRawMaterial.some((p) => p.id === raw_inv_id);
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
        ) : authrztn.includes("StockCounting-View") ? (
          <div className="custom-card inv-card">
            <div className="head-container d-flex ms-2 flex-column flex-sm-row">
              <div className="title-container ps-0 ps-lg-5">
                <h2>Stock Counting</h2>
                <h4 id="dateFilterIndicator"></h4>
              </div>
              <div className="s-container d-flex">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control search m-0"
                    placeholder="Search"
                    aria-describedby="addon-wrapping"
                    value={search}
                    onChange={handleSearchChange}
                    style={{ fontSize: "1.3rem" }}
                  />
                </div>
              </div>
              <div className="add-new-stock-container">
                {authrztn?.includes("StockCounting-Add") && (
                  <Button
                    onClick={handleShowStockCountModal}
                    className="stock-count"
                  >
                    New Stock Counting
                  </Button>
                )}
              </div>

              <div className="filter-button-container">
              <Button onClick={handleDropdownToggle}>
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
            </div>

            <div className="table">
              {stockCountingData.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>TRANSACTION NUMBER</th>
                        <th>REMARKS</th>
                        <th>STOCKING TIME</th>
                      </thead>
                      <tbody>
                        <img
                          src={noData}
                          alt="No Data"
                          className="no-data-icon"
                        />
                        <h2 className="no-data-label">No Data Found</h2>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-data-table">
                    <DataTable
                      columns={stockCountingColumn}
                      customStyles={customStyles}
                      data={filteredStockCountingData}
                      onRowClicked={handleShowStockDetailModal}
                      pagination
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

      {/* Stock Counting */}
      <Modal
        show={showStockCountModal}
        onHide={handleCloseStockCountModal}
        size="xl"
      >
        <Form
          noValidate
          validated={validated}
          onSubmit={handleStockCountingForm}
        >
          <Modal.Header>
            <Modal.Title>
              <div className="d-flex flex-direction-row align-items-center">
                <h2>New Stock Counting (Product)</h2>
                <Button
                  onClick={() => {
                    setShowStockCountModal(false);
                    setShowStockCountRawModal(true);
                    generateRandomCode();
                  }}
                  variant=""
                  title="Switch to Raw Material"
                >
                  <ArrowsLeftRight size={25} />
                </Button>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-category ">
              <div className="filtering-category-container">
                <div className="search-and-filter">
                  <div className="transac-dropdown">
                    <div className="transaction-input">
                      <Form.Group controlId="exampleForm.ControlInput1">
                        <Form.Label style={{ fontSize: "20px" }}>
                          Transaction Number
                        </Form.Label>
                        <Form.Control
                          type="text"
                          class="form-control search"
                          required
                          value={transactionNumber}
                          readOnly
                        />
                      </Form.Group>
                    </div>

                    <div className="Category-dropdown">
                      <Form.Group>
                        <Form.Label style={{ fontSize: "20px" }}>
                          Category
                        </Form.Label>
                        <Form.Select
                          onChange={handleFormChangeCategory}
                          style={{
                            height: "40px",
                            fontSize: "14px",
                          }}
                          className="category-dropdown-select"
                        >
                          <option value="" disabled selected>
                            Select Category
                          </option>
                          {Category.map((category) => (
                            <option
                              key={category.category_id}
                              value={category.category_id}
                            >
                              {category.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table">
                {product.length == 0 ? (
                  <>
                    <div className="no-data-table">
                      <table>
                        <thead>
                          <th>SKU</th>
                          <th>ITEM NAME</th>
                          <th>SYSTEM STOCK</th>
                          <th>PRICE</th>
                          <th>IMAGE</th>
                        </thead>
                        <tbody>
                          <img
                            src={noData}
                            alt="No Data"
                            className="no-data-icon"
                          />
                          <h2 className="no-data-label">No Data Found</h2>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <DataTable
                      columns={modalColumn}
                      data={product}
                      customStyles={customStyles}
                      pagination
                      onRowClicked={handleCheckboxChange}
                    />
                  </>
                )}
              </div>
              <div className="remarks-container d-flex">
                <label for="exampleFormControlInput1" class="form-label">
                  Notes / Remarks
                </label>
                <Form.Control
                  type="text"
                  class="form-control"
                  id="exampleFormControlInput1"
                  placeholder="Comment"
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className="table">
                {selectedProducts.length == 0 ? (
                  <>
                    <div className="no-data-table">
                      <table>
                        <thead>
                          <th>SKU</th>
                          <th>STOCK NAME</th>
                          <th>SYSTEM COUNT</th>
                          <th>ACTUAL COUNT</th>
                          <th>LOSS</th>
                          <th>ACTION</th>
                        </thead>
                        <tbody>
                          <img
                            src={noData}
                            alt="No Data"
                            className="no-data-icon"
                          />
                          <h2 className="no-data-label">No Data Found</h2>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <DataTable
                      columns={modalColumn2}
                      customStyles={customStyles}
                      data={selectedProducts}
                      pagination
                    />
                  </>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {!loadingBtn ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseStockCountModal}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-50 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"10%"}
                    width={"10%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    Saving. . .
                  </span>
                </div>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Stock Counting Raw */}

      <Modal
        show={showStockCountRawModal}
        onHide={handleCloseStockCountRawModal}
        size="xl"
      >
        <Form
          noValidate
          validated={validated}
          onSubmit={handleStockCountingForm_raw}
        >
          <Modal.Header>
            <Modal.Title>
              <div className="d-flex flex-direction-row align-items-center">
                <h2>New Stock Counting (Raw)</h2>
                <Button
                  onClick={() => {
                    setShowStockCountRawModal(false);
                    setShowStockCountModal(true);
                    generateRandomCode();
                  }}
                  variant=""
                  title="Switch to Raw Material"
                >
                  <ArrowsLeftRight size={25} />
                </Button>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-category ">
              <div className="filtering-category-container d-flex ">
                <div className="w-25 mr-5 transaction-input">
                  <Form.Group controlId="exampleForm.ControlInput1">
                    <Form.Label style={{ fontSize: "20px" }}>
                      Transaction Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      class="form-control search"
                      required
                      value={transactionNumber}
                      readOnly
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="table">
                {rawMaterial.length == 0 ? (
                  <>
                    <div className="no-data-table">
                      <table>
                        <thead>
                          <th>SKU</th>
                          <th>ITEM NAME</th>
                          <th>UNIT</th>
                          <th>CURRENT STOCK</th>
                          <th>PRICE</th>
                        </thead>
                        <tbody>
                          <img
                            src={noData}
                            alt="No Data"
                            className="no-data-icon"
                          />
                          <h2 className="no-data-label">No Data Found</h2>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <DataTable
                      columns={modalColumnRaw}
                      data={rawMaterial}
                      customStyles={customStyles}
                      pagination
                      onRowClicked={handleCheckboxChange_raw}
                    />
                  </>
                )}
              </div>
              <div className="remarks-container d-flex">
                <label for="exampleFormControlInput1" class="form-label">
                  Notes / Remarks
                </label>
                <Form.Control
                  type="text"
                  class="form-control"
                  id="exampleFormControlInput1"
                  placeholder="Comment"
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className="table">
                {selectedRawMaterial.length == 0 ? (
                  <>
                    <div className="no-data-table">
                      <table>
                        <thead>
                          <th>SKU</th>
                          <th>STOCK NAME</th>
                          <th>SYSTEM COUNT</th>
                          <th>ACTUAL COUNT</th>
                          <th>LOSS</th>
                          <th>ACTION</th>
                        </thead>
                        <tbody>
                          <img
                            src={noData}
                            alt="No Data"
                            className="no-data-icon"
                          />
                          <h2 className="no-data-label">No Data Found</h2>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <DataTable
                      columns={modalColumn2Raw}
                      customStyles={customStyles}
                      data={selectedRawMaterial}
                      pagination
                    />
                  </>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {!loadingBtn ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseStockCountRawModal}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-50 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"10%"}
                    width={"10%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    Loading. . .
                  </span>
                </div>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal for Stock Detail */}
      <Modal
        show={showStockDetailModal}
        onHide={handleCloseStockDetailModal}
        size="xl"
      >
        <Modal.Header>
          <div className="d-flex w-100 p-3 justify-content-between align-items-center">
            <div>
              <p className="h2">Stock Counting Inventory Details</p>
            </div>
            {/* <div className="d-flex align-items-center w-50">
              <label htmlFor="stockingTime" className="w-50 fs-3 ml-5">
                Stock Counting Time:
              </label>
              <input
                type="text"
                className="form-control i-date mb-0"
                id="stockingTime"
                readOnly
                value={fetchStockCountTime}
              />
            </div> */}
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "0" }}>
          <div className="d-flex flex-column flex-lg-row w-100">
            <div className="d-flex flex-column w-100 justify-content-start">
              <div className="d-flex p-0">
                <Form.Label
                  style={{
                    fontSize: "15px",
                    marginRight: "10px",
                    width: "120px",
                  }}
                >
                  Stock Counting ID:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0 w-75"
                  style={{ width: "300px" }}
                  value={fetchTransacNumber}
                />
              </div>

              <div className="d-flex pb-1 w-100">
                <Form.Label
                  style={{
                    fontSize: "15px",
                    marginRight: "10px",
                    width: "120px",
                  }}
                >
                  Stock Counting Time:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0 w-75"
                  style={{ width: "300px" }}
                  value={fetchStockCountTime}
                />
              </div>
            </div>

            <div className="d-flex ps-lg-5 w-100">
              <Form.Label
                style={{
                  fontSize: "15px",
                  marginTop: "10px",
                  marginRight: "10px",
                }}
              >
                Notes / Remarks:
              </Form.Label>
              <Form.Control
                type="text"
                as="textarea"
                readOnly
                className="mb-0 w-75"
                style={{ width: "380px", height: "100px", paddingTop: "10px" }}
                value={fetchRemarks}
              />
            </div>
          </div>
          <div className="table">
            <DataTable
              columns={
                isRawFetch
                  ? modalRawColumnStockCountingDetails
                  : modalColumnStockCountingDetails
              }
              customStyles={customStyles}
              data={modalStockCountingData}
              pagination
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default StockCounting;
