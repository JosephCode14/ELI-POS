import React, { useEffect, useState, useRef } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
import "../styles/inventory.css";
import noData from "../../assets/icon/no-data.png";
// import "../styles/pos_react.css";
import { Button, Modal, Dropdown } from "react-bootstrap";
import axios from "axios";
import swal from "sweetalert";
import BASE_URL from "../../assets/global/url";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import { ArrowsLeftRight } from "@phosphor-icons/react";
// import Noimg from "../../assets/image/noimg.png";
// import DateRange from "../../components/DateRange";
import Form from "react-bootstrap/Form";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";
const CustomHeader = ({ column }) => (
  <div style={{ textAlign: "center" }}>{column.name}</div>
);

const AddStocks = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [validated, setValidated] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [Category, setCategory] = useState([]);
  const [product, setProduct] = useState([]);
  const [rawMaterial, setRawMaterial] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receivingInventory, setReceivingInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] =
    useState(receivingInventory);

  const [ReceiveStockInventoryDetails, setReceiveStockInventoryDetails] =
    useState([]);
  const [FetchtransacNumber, setFetchTransacNumber] = useState("");
  const [fetchRemarks, setFetchRemarks] = useState("");
  const [fetchStockingTime, setFetchStockingTime] = useState("");
  const [showAddStockDetailModal, setShowAddStockDetailModal] = useState(false);
  const handleCloseStockDetailModal = () => setShowAddStockDetailModal(false);
  const [showAddStockModal_rawMaterial, setShowAddStockModal_rawMaterial] =
    useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const handleShowAddStockModal = () => setShowAddStockModal(true);
  const handleCloseAddStockModal = () => {
    setShowAddStockModal(false);
    setShowAddStockModal_rawMaterial(false);
    setValidated(false);
    setRemarks("");
    ReceivingStockTable();
    generateRandomCode();
    setProduct([]);
  };

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [loadingBtn, setLoadingBtn] = useState(false);

  const dropdownRef = useRef(null);

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
    decodeToken();
  }, []);

  //category data for dropdown
  const reloadTable = () => {
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

  useEffect(() => {
    reloadTable();
  }, []);

  //data ng receiving inventory table
  const ReceivingStockTable = () => {
    axios
      .get(BASE_URL + "/receiving_stock_inventory/getReceivingStockInventory")
      .then((res) => {
        setReceivingInventory(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(true);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      ReceivingStockTable();
      reloadRawMaterial();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const reloadRawMaterial = () => {
    axios
      .get(BASE_URL + "/rawmaterial/getRawInventory")
      .then((res) => {
        setRawMaterial(res.data);
      })
      .catch((err) => console.log(err));
  };

  //fetching ng product based sa category na under ang products
  const handleFormChangeCategory = (event) => {
    const categoryId = event.target.value;
    axios
      .get(BASE_URL + "/category_product/fetchInventoryCategory", {
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

  // raw material start
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

  const handleSelectAllChange_rawMat = () => {
    if (isAllSelected) {
      setSelectedRawMaterial([]);
    } else {
      setSelectedRawMaterial(rawMaterial);
    }
    setIsAllSelected(!isAllSelected);
  };

  const isRawSelected = (raw_inv_id) => {
    return selectedRawMaterial.some((p) => p.id === raw_inv_id);
  };

  //function sa pag-add ng stocks
  const handleAddStock_rawMaterial = async (e) => {
    e.preventDefault();

    if (selectedRawMaterial.length == 0) {
      swal({
        icon: "error",
        title: "Please select raw material first",
        text: "No raw material found",
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
        const productDetails = selectedRawMaterial.map((data) => ({
          raw_inventory_id: data.id,
          // quantity: data.quantity,
          quantity: data.newQty,
          totalPrice: data.totalPrice,
        }));

        setLoadingBtn(true);
        const response = await axios.post(`${BASE_URL}/rawmaterial/addStocks`, {
          transactionNumber,
          remarks,
          productDetails,
          userId,
        });
        // console.log(response.data);
        swal({
          title: "Success",
          text: "The Stocks has been added successfully",
          icon: "success",
          buttons: false,
          timer: 2000,
          dangerMode: true,
        }).then(() => {
          setSelectedProducts([]);
          handleCloseAddStockModal();
          setLoadingBtn(false);
          generateRandomCode();
        });
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

  const handleQuantityChange_raw = (rawID, event) => {
    let newQuantity =
      event.target.value === "" ? 0 : parseFloat(event.target.value, 10);

    if (newQuantity < 0) {
      newQuantity = 0;
      event.target.value = newQuantity;
    }
    const raw = selectedRawMaterial.find((p) => p.id === rawID);

    if (raw) {
      const totalPrice = newQuantity * raw.raw_material.unit_price;
      const formattedTotalPrice = totalPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setSelectedRawMaterial((prevSelectedRaw) =>
        prevSelectedRaw.map((p) =>
          p.id === rawID
            ? {
                ...p,
                newQty: newQuantity,
                totalPrice,
                total_rawprice_display: formattedTotalPrice,
              }
            : p
        )
      );
    }
  };

  const modalColumn_rawMaterial = [
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

  const modalColumn2_raw = [
    {
      name: "SKU",
      selector: (row) => row.raw_material.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) => row.raw_material.material_name,
    },
    {
      name: "PRICE",
      selector: (row) =>
        row.raw_material.unit_price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "QTY TO RECEIVE",
      selector: (row) => row.id,
      cell: (row, i) => (
        <div>
          <Form.Control
            style={{ margin: "auto", height: "35px", width: "135px" }}
            type="text"
            step="0.01"
            placeholder="Input Stocks"
            value={
              selectedRawMaterial.find((p) => p.id === row.id)?.newQty || ""
            }
            // onChange={(event) => handleQuantityChange_raw(i, event)}
            onChange={(event) => handleQuantityChange_raw(row.id, event)}
            required
            onKeyDown={(e) => {
              ["e", "E", "-", "+", "."].includes(e.key) && e.preventDefault();
            }}
          />
        </div>
      ),
    },
    {
      name: "TOTAL PRICE",
      selector: (row) => row.total_rawprice_display,
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

  // raw material end

  const [isRawFetch, setIsRawFetch] = useState(false);
  //modal stock details
  const handleShowStockDetailModal = async (data) => {
    const receivedId = data.receiving_stock_inventory_id;
    console.log(data.type);
    console.log("Data", data);
    try {
      if (data.type === null || data.type === "product") {
        setIsRawFetch(false);
        const res = await axios.get(
          BASE_URL + "/product_inventory_accumulate/modalProductReceivedStock",
          {
            params: {
              receivedInventoryId: receivedId,
            },
          }
        );
        setReceiveStockInventoryDetails(res.data);
        console.log("DETAILLLS", res.data);
        const formattedDate = formatDate(
          res.data[0].receiving_stock_inventory.createdAt
        );
        setFetchStockingTime(formattedDate);
        setFetchRemarks(res.data[0].receiving_stock_inventory.remarks);
        setFetchTransacNumber(
          res.data[0].receiving_stock_inventory.transaction_number_id
        );
      } else {
        setIsRawFetch(true);
        const res = await axios.get(
          BASE_URL + "/rawmaterial/modalProductReceivedStock",
          {
            params: {
              receivedInventoryId: receivedId,
            },
          }
        );
        setReceiveStockInventoryDetails(res.data);
        console.log(res.data);
        const formattedDate = formatDate(
          res.data[0].receiving_stock_inventory.createdAt
        );
        setFetchStockingTime(formattedDate);
        setFetchRemarks(res.data[0].receiving_stock_inventory.remarks);
        setFetchTransacNumber(
          res.data[0].receiving_stock_inventory.transaction_number_id
        );
      }

      setShowAddStockDetailModal(true);
    } catch (error) {
      console.log(error);
    }
  };

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

  // start checkbox for finish product
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

  // const handleQuantityChange = (index, event) => {
  //   const newQuantity =
  //     event.target.value === "" ? 0 : parseInt(event.target.value);
  //   const totalPrice =
  //     isNaN(newQuantity) || newQuantity < 1
  //       ? 0
  //       : newQuantity * selectedProducts[index].category_product.product.price;

  //   const formattedTotalPrice = totalPrice.toLocaleString("en-US", {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   });
  //   setSelectedProducts((prevSelectedProducts) => {
  //     const updatedSelectedProducts = [...prevSelectedProducts];
  //     updatedSelectedProducts[index] = {
  //       ...updatedSelectedProducts[index],
  //       quantity: newQuantity,
  //       totalPrice: totalPrice,
  //       total_price_display: formattedTotalPrice,
  //       newQty: newQuantity,
  //     };
  //     return updatedSelectedProducts;
  //   });
  // };

  const handleQuantityChange = (productInventoryId, event) => {
    let newQuantity =
      event.target.value.trim() === "" ? 0 : parseInt(event.target.value, 10);

    if (newQuantity < 0) {
      newQuantity = 0;
      event.target.value = newQuantity;
    }

    const product = selectedProducts.find(
      (p) => p.product_id === productInventoryId
    );

    if (product) {
      const totalPrice = newQuantity * product.product.price;
      const formattedTotalPrice = totalPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setSelectedProducts((prevSelectedProducts) =>
        prevSelectedProducts.map((p) =>
          p.product_id === productInventoryId
            ? {
                ...p,
                newQty: newQuantity,
                totalPrice,
                total_price_display: formattedTotalPrice,
              }
            : p
        )
      );
    }
  };

  //end checkbox for finish product

  //function sa pag-add ng stocks sa receiving
  const handleAddStock = async (e) => {
    e.preventDefault();

    if (selectedProducts.length == 0) {
      swal({
        icon: "error",
        title: "Please select product first",
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
        const productDetails = selectedProducts.map((product) => ({
          productId: product.product_id,
          // quantity: product.quantity || 0,
          quantity: product.newQty || 0,
          totalPrice: product.totalPrice || 0,
        }));

        setLoadingBtn(true);

        const response = await axios.post(
          `${BASE_URL}/product_inventory_accumulate/addStocks`,
          {
            transactionNumber,
            remarks,
            productDetails,
            userId,
          }
        );
        if (response.status == 200) {
          swal({
            title: "New Inventory Stocks added",
            text: "The Stocks has been added successfully",
            icon: "success",
            button: "OK",
          }).then(() => {
            ReceivingStockTable();
            setRemarks("");
            setTransactionNumber("");
            setSelectedProducts([]);
            setLoadingBtn(false);
            setShowAddStockModal(false);
            setValidated(false);
            generateRandomCode();
            setProduct([]);
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

  //Start Receiving Raw Product
  const receivedColumn = [
    {
      name: "TRANSACTION NUMBER",
      selector: (row) => row.transaction_number_id,
    },
    {
      name: "REMARKS",
      selector: (row) => row.remarks,
    },
    {
      name: "TIME RECEIVED",
      selector: (row) => formatDate(row.createdAt),
    },
  ];

  const row_receivedColumnModalStockDetails = [
    {
      name: "SKU",
      selector: (row) =>
        row.raw_inventory_accumulate.raw_inventory.raw_material.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.raw_inventory_accumulate.raw_inventory.raw_material.material_name,
    },
    {
      name: "UNIT TYPE",
      selector: (row) =>
        row.raw_inventory_accumulate.raw_inventory.raw_material.unit_type,
    },
    {
      name: "OLD QUANTITY",
      selector: (row) => row.raw_inventory_accumulate.old_quantity,
    },
    {
      name: "NEW QUANTITY",
      selector: (row) => row.raw_inventory_accumulate.new_quantity,
    },
    {
      name: "UNIT PRICE",
      selector: (row) =>
        row.raw_inventory_accumulate.raw_inventory.raw_material.unit_price.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ),
    },
    {
      name: "TOTAL PRICE",
      selector: (row) =>
        row.raw_inventory_accumulate.total_price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ];
  //End Receiving Raw Product

  // Start Receiving Finish Product
  const receivedColumnModalStockDetails = [
    {
      name: "SKU",
      selector: (row) =>
        row.product_inventory_accumulate.product_inventory.product.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) =>
        row.product_inventory_accumulate.product_inventory.product.name,
    },
    {
      name: "OLD QUANTITY",
      selector: (row) => row.product_inventory_accumulate.old_quantity,
    },
    {
      name: "NEW QUANTITY",
      selector: (row) => row.product_inventory_accumulate.new_quantity,
    },
    {
      name: "UNIT PRICE",
      selector: (row) =>
        row.product_inventory_accumulate.product_inventory.product.price.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ),
    },
    // {
    //   name: "UNIT PRICE",
    //   selector: (row) =>
    //     row.product_inventory_accumulate.stocked_price.toLocaleString("en-US", {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2,
    //     }),
    // },
    {
      name: "TOTAL PRICE",
      selector: (row) =>
        row.product_inventory_accumulate.total_price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "IMAGE",
      selector: (row) => (
        <img
          src={`data:image/png;base64,${row.product_inventory_accumulate.product_inventory.product.image}`}
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
            src={`data:image/png;base64,${row.product_inventory_accumulate.product_inventory.product.image}`}
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
      name: "CURRENT STOCK",
      selector: (row) =>
        row.product.product_inventories.length > 0
          ? row.product.product_inventories[0].quantity
          : 0,
    },
    {
      name: "PRICE",
      selector: (row) =>
        row.product.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
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

  const modalColumn2 = [
    {
      name: "SKU",
      selector: (row) => row.product.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) => row.product.name,
    },
    {
      name: "PRICE",
      selector: (row) =>
        row.product.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "QTY TO RECEIVE",
      selector: (row) => row.product_id,
      cell: (row, i) => (
        <div>
          <Form.Control
            style={{ margin: "auto", height: "35px", width: "135px" }}
            type="number"
            placeholder="Input Quantity"
            value={
              selectedProducts.find((p) => p.product_id === row.product_id)
                ?.newQty || ""
            }
            onChange={(event) => handleQuantityChange(row.product_id, event)}
            required
            onKeyDown={(e) => {
              ["e", "E", "-", "+", "."].includes(e.key) && e.preventDefault();
            }}
          />
        </div>
      ),
    },
    {
      name: "TOTAL PRICE",
      selector: (row) => row.total_price_display,
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
  //End Receiving finish product

  //filter and Search Section
  useEffect(() => {
    const filteredData = receivingInventory.filter((inv) => {
      const transactionDate = new Date(inv.createdAt);
      const start = new Date(`${fromDate}T00:00:00Z`);
      const end = new Date(`${endDate}T23:59:59Z`);

      return (
        (!fromDate || transactionDate >= start) &&
        (!endDate || transactionDate <= end)
      );
    });
    setFilteredInventory(filteredData);
  }, [fromDate, endDate, receivingInventory]);

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

  const processSearch = (search) => {
    search = encodeURIComponent(search);
    axios
      .get(`${BASE_URL}/receiving_stock_inventory/getSearchResults/${search}`)
      .then((res) => {
        setReceivingInventory(res.data);
      })
      .catch((err) => console.log(err));
  };

  //function for passing value from search field
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim() === "") {
      ReceivingStockTable();
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
  //filter and Search Section

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
        ) : authrztn.includes("ReceivingStock-View") ? (
          <div className="custom-card inv-card">
            <div className="head-container d-flex ms-2 flex-column flex-sm-row">
              <div className="title-container ps-0 ps-lg-5">
                <h2>Add Stocks</h2>
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
                {authrztn?.includes("ReceivingStock-Add") && (
                  <Button onClick={handleShowAddStockModal}>New Stock</Button>
                )}
              </div>

              <div className="filter-button-container">
                <Button
                  className="filter-button"
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
            </div>

            <div className="table">
              {filteredInventory.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>TRANSACTION NUMBER</th>
                        <th>REMARKS</th>
                        <th>TIME RECEIVEED</th>
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
                      columns={receivedColumn}
                      customStyles={customStyles}
                      data={filteredInventory}
                      pagination
                      onRowClicked={handleShowStockDetailModal}
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
        show={showAddStockModal}
        // onHide={handleCloseAddStockModal}
        size="xl"
        centered
      >
        <Form noValidate validated={validated} onSubmit={handleAddStock}>
          <Modal.Header>
            <Modal.Title>
              <div className="d-flex flex-direction-row align-items-center">
                <h2>New Stock (Product)</h2>
                <Button
                  onClick={() => {
                    setShowAddStockModal(false);
                    setShowAddStockModal_rawMaterial(true);
                    generateRandomCode();
                    reloadRawMaterial();
                    setSelectedRawMaterial([]);
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
                      customStyles={customStyles}
                      data={product}
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
                          <th>ITEM NAME</th>
                          <th>PRICE</th>
                          <th>QTY TO RECEIVE</th>
                          <th>TOTAL PRICE</th>
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
                      data={selectedProducts}
                      customStyles={customStyles}
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
                <Button variant="secondary" onClick={handleCloseAddStockModal}>
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

      <Modal
        show={showAddStockModal_rawMaterial}
        // onHide={handleCloseAddStockModal}
        size="xl"
      >
        <Form
          noValidate
          validated={validated}
          onSubmit={handleAddStock_rawMaterial}
        >
          <Modal.Header>
            <Modal.Title>
              <div className="d-flex flex-direction-row align-items-center">
                <h2>New Stock (Raw Material)</h2>
                <Button
                  onClick={() => {
                    setShowAddStockModal(true);
                    setShowAddStockModal_rawMaterial(false);
                    generateRandomCode();
                    setSelectedProducts([]);
                    setProduct([]);
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
                  {/* <TextField
                    label="Search"
                    variant="outlined"
                    style={{ marginBottom: "10px" }}
                    InputLabelProps={{
                      style: { fontSize: "12px" },
                    }}
                    InputProps={{
                      style: {
                        fontSize: "12px",
                        width: "250px",
                        height: "50px",
                      },
                    }}
                  /> */}
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
                  </div>
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
                          <th> PRICE</th>
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
                      columns={modalColumn_rawMaterial}
                      customStyles={customStyles}
                      data={rawMaterial}
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
                <input
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
                          <th>ITEM NAME</th>
                          <th>PRICE</th>
                          <th>QTY TO RECEIVE</th>
                          <th>TOTAL PRICE</th>
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
                      columns={modalColumn2_raw}
                      data={selectedRawMaterial}
                      customStyles={customStyles}
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
                <Button variant="secondary" onClick={handleCloseAddStockModal}>
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

      {/* Stock Details */}
      <Modal
        show={showAddStockDetailModal}
        onHide={handleCloseStockDetailModal}
        size="xl"
      >
        <Modal.Header>
          <div className="d-flex w-100 p-3 justify-content-between align-items-center">
            <div>
              <p className="h2">Received Stock Details</p>
            </div>
            {/* <div className="d-flex align-items-center w-50">
              <label htmlFor="stockingTime" className="w-50 fs-3 ml-5">
                Time Received:
              </label>
              <input
                type="text"
                className="form-control i-date mb-0"
                id="stockingTime"
                value={fetchStockingTime}
                readOnly
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
                    fontSize: "16px",
                    marginRight: "40px",
                    width: "120px",
                  }}
                >
                  Received ID:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0 w-100"
                  defaultValue={FetchtransacNumber}
                  style={{ width: "300px" }}
                />
              </div>

              <div className="d-flex pb-1 w-100">
                <Form.Label
                  style={{
                    fontSize: "16px",
                    marginRight: "10px",
                    width: "120px",
                  }}
                >
                  Time Received:
                </Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  className="mb-0 w-75"
                  defaultValue={fetchStockingTime}
                  style={{ width: "300px" }}
                />
              </div>
            </div>

            <div className="d-flex ps-lg-5 w-100">
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
                value={fetchRemarks}
                style={{ width: "380px", height: "100px", paddingTop: "10px" }}
              />
            </div>
          </div>
          <DataTable
            columns={
              isRawFetch === true
                ? row_receivedColumnModalStockDetails
                : receivedColumnModalStockDetails
            }
            customStyles={customStyles}
            data={ReceiveStockInventoryDetails}
            pagination
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddStocks;
