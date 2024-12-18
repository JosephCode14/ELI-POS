import React, { useEffect, useState, useRef } from "react";
// import "../styles/ordering.css";
import "../styles/pos_react.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../../assets/global/url";
import Noimg from "../../assets/image/noimg.png";
import swal from "sweetalert";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
// import useStoreCashier from "../../stores/useStoreCashier";
// import NoAccess from "../../assets/image/NoAccess.png";
import noData from "../../assets/icon/no-data.png";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import useStoreIP from "../../stores/useStoreIP";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";
import NoAccess from "../../assets/image/NoAccess.png";
import useStoreDetectedDevice from "../../stores/useStoreDetectedDevice";
const CustomHeader = ({ column }) => (
  <div style={{ textAlign: "center" }}>{column.name}</div>
);

const Ordering = ({ authrztn }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  //for selecting tab sa menu or order records
  const [selectedPage, setSelectedPage] = useState("Menu");
  const handleSelectedPage = (selected) => {
    setSelectedPage(selected);
  };
  const getTabItemStyle = (page) => {
    return {
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow:
        selectedPage === page ? "0px 4px 8px rgba(0, 0, 0, 0.2)" : "none",
      padding: "15px",
      cursor: "pointer",
    };
  };
  //for selecting tab sa menu or order records

  //Use State for End Shift
  const [endShiftCalcModal, setEndShiftCalcModal] = useState(false);
  const [amount, setAmount] = useState("0");
  const [remittanceCash, setRemittanceCash] = useState("0");
  const [totalCashierSales, setTotalCashierSales] = useState(0);
  const [endShiftModal, setEndShiftModal] = useState(false);
  const [totalCheckout, setTotalCheckout] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalItemSold, setTotalItemSold] = useState(0);
  const [totalRefund, setTotalRefund] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [totalCard, setTotalCard] = useState(0);
  const [employeeName, setEmployeeName] = useState("");
  const [shiftDuration, setShiftDuration] = useState("");
  const [startshiftDate, setStartShiftDate] = useState("");
  const [startingMoney, setStartingMoney] = useState(0);
  const [totalLoad, setTotalLoad] = useState(0);
  const [focusedInput, setFocusedInput] = useState("amount");
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [endRemarkModal, setEndRemarkModal] = useState(false);
  const [endShiftRemarks, setEndShiftRemarks] = useState("");
  //Use State for End Shift

  //use state for fetching section
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryIdSelected, setCategoryIdSelected] = useState("");
  const [CategoryMenu, setCategoryMenu] = useState([]);
  const [ProductMenu, setProductMenu] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [specificationData, setSpecificationData] = useState([]);
  const [extraNeedingData, setExtraNeedingData] = useState([]);
  const [cart, setCart] = useState(location.state?.cart || []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [localQuantities, setLocalQuantities] = useState({});

  const [highlightedSpecificationIndex, setHighlightedSpecificationIndex] =
    useState(null);
  const [selectedSpecificationVariantId, setSelectedSpecificationVariantId] =
    useState(null);
  const [selectedExtraOptionVariantId, setSelectedExtraOptionVariantId] =
    useState({});
  const [selectedExtraNeedingVariantId, setSelectedExtraNeedingVariantId] =
    useState({});

  const [orderType, setOrderType] = useState(true);
  const [showOrder, setShowOrder] = useState(true);

  const [productNameWithSpecification, setProductNameWithSpecification] =
    useState("");
  const { detectedDevice } = useStoreDetectedDevice();
  const [cashierName, setCashierName] = useState("");
  const [userType, setUserType] = useState("");
  const [userId, setuserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userReference, setUserReference] = useState("");
  //use state for fetching section
  const [storeStatus, setStoreStatus] = useState(true);
  //section para sa specification function
  const [specificationModal, setSpecificationModal] = useState(false);
  const handleCloseSpecificationModal = () => {
    setSpecificationModal(false);
    setHighlightedSpecificationIndex(null);
    setSelectedSpecificationVariantId(null);
    setSelectedExtraOptionVariantId({});
    setSelectedExtraNeedingVariantId({});
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = currentTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const checkStoreStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/store_profile/fetchStatus`);
      const currentStatus = res.data.status;
      setStoreStatus(currentStatus);

      if (!currentStatus) {
        swal({
          title: "Store Closed",
          text: "The store has been closed. You will be redirected to the menu.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/menu");
        });
      }
    } catch (error) {
      console.error("Error fetching store status:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkStoreStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectSpecification = (specName, index, variantId) => {
    setHighlightedSpecificationIndex(`${specName}-${index}`);
    setSelectedSpecificationVariantId(variantId);
  };

  const handleSelectExtraOption = (groupIndex, variantId) => {
    setSelectedExtraOptionVariantId((prev) => {
      const selectedVariants = prev[groupIndex] || [];
      const isSelected = selectedVariants.includes(variantId);

      if (isSelected) {
        // Remove variantId if already selected
        return {
          ...prev,
          [groupIndex]: selectedVariants.filter((id) => id !== variantId),
        };
      } else {
        // Add variantId if not selected
        return {
          ...prev,
          [groupIndex]: [...selectedVariants, variantId],
        };
      }
    });
  };

  const handleSelectExtraNeeding = (groupIndex, extraMainId) => {
    setSelectedExtraNeedingVariantId((prev) => {
      const selectedVariantsNeeding = prev[groupIndex] || [];
      const isSelectedNeeding = selectedVariantsNeeding.includes(extraMainId);

      if (isSelectedNeeding) {
        // Remove extraMainId if already selected
        return {
          ...prev,
          [groupIndex]: selectedVariantsNeeding.filter(
            (id) => id !== extraMainId
          ),
        };
      } else {
        // Add extraMainId if not selected
        return {
          ...prev,
          [groupIndex]: [...selectedVariantsNeeding, extraMainId],
        };
      }
    });
  };

  //section para sa specification function

  //getting of user data
  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setCashierName(decoded.Fname);
      setUserType(decoded.typeUser);
      setuserId(decoded.id);
    }
  };
  //getting of user data

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() * 100 + now.getMinutes(); // Returns time in HHMM format
  };

  const filterCategoriesByTime = (categories) => {
    const currentTime = getCurrentTime();

    const mealCategories = [
      "Student Meal - Breakfast",
      "Student Meal - Lunch",
      "Student Meal - Dinner",
    ];

    const filtered = categories.filter((c) => {
      if (mealCategories.includes(c.name)) {
        const [startHour, startMinute] = c.time_from.split(":").map(Number);
        const [endHour, endMinute] = c.time_to.split(":").map(Number);

        const startTime = startHour * 100 + startMinute;
        const endTime = endHour * 100 + endMinute;

        return currentTime >= startTime;
      }

      return true;
    });

    return filtered;
  };
  // const filterCategoriesByTime = (categories) => {
  //   const currentTime = getCurrentTime();

  //   const mealCategories = [
  //     "Student Meal - Breakfast",
  //     "Student Meal - Lunch",
  //     "Student Meal - Dinner",
  //   ];

  //   return categories.filter((category) => {
  //     if (!mealCategories.includes(category.name)) {
  //       return true;
  //     }

  //     const timeFrom = parseInt(category.time_from.replace(":", ""), 10);
  //     const timeTo = parseInt(category.time_to.replace(":", ""), 10);

  //     if (timeFrom > timeTo) {
  //       return currentTime >= timeFrom || currentTime <= timeTo;
  //     } else {
  //       return currentTime >= timeFrom && currentTime <= timeTo;
  //     }
  //   });
  // };

  //fetching ng mga category
  const reloadTableCategory = () => {
    axios
      .get(BASE_URL + "/order/category-product")
      .then((res) => {
        const filteredCategories = filterCategoriesByTime(res.data);
        setCategoryMenu(filteredCategories);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  };
  //fetching ng mga category

  //when user click the category
  const handleSelectCategory = (categoryId) => {
    setIsProductLoading(true);
    setSelectedCategory(categoryId);
    setCategoryIdSelected(categoryId);
    const Idcategory = categoryId;
    axios
      .get(BASE_URL + "/order/getProductInventory", {
        params: {
          Idcategory,
        },
      })
      .then((res) => {
        const products = res.data;
        const initialQuantities = {};

        // Retrieve current quantities from the response
        products.forEach((p) => {
          initialQuantities[p.product_inventory_id] = p.quantity;
        });

        // Adjust quantities based on the cart data
        const adjustedQuantities = { ...initialQuantities };

        cart.forEach((item) => {
          if (initialQuantities.hasOwnProperty(item.product_inventory_id)) {
            adjustedQuantities[item.product_inventory_id] -= item.quantity;
          }
        });

        // Update localQuantities with adjusted values
        setLocalQuantities(adjustedQuantities);
        setProductMenu(products);
        const timer = setTimeout(() => {
          setIsProductLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
      })
      .catch((err) => console.log(err));
  };
  //when user click the category

  //function ng search sa product menu
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const filtered = ProductMenu.filter((data) =>
      data.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, ProductMenu]);
  //function ng search sa product menu

  //function sa pagselect ng product at maadd to cart
  const handleSpecificationModal = (specMainIds) => {
    axios
      .get(BASE_URL + "/specifications/fetchSpecificSpecification", {
        params: {
          specMainIds: specMainIds,
        },
      })
      .then((res) => {
        setSpecificationData(res.data);
        setSpecificationModal(true);
      });
  };

  const handleExtraNeedModal = (extraMainIds) => {
    console.log("Mainn", extraMainIds);
    axios
      .get(BASE_URL + "/extraneed/fetchExtraNeeding", {
        params: {
          extraMainIds: extraMainIds,
        },
      })
      .then((res) => {
        setExtraNeedingData(res.data);
        setSpecificationModal(true);
      });
  };

  const handleClick = (product) => {
    if (!specificationModal) {
      const specifications = product.product.category_product_specifications;
      const extras = product.product.category_product_extras;

      const specMainIds = specifications
        .filter((spec) => spec.specification_main)
        .map((spec) => spec.specification_main.specification_main_id);

      const extraMainIds = extras
        .filter((extra) => extra.extra_main)
        .map((extra) => extra.extra_main.extra_main_id);
      if (
        specifications &&
        specifications.length > 0 &&
        specMainIds.length > 0
      ) {
        setProductNameWithSpecification(product.product.name);
        setSelectedProduct(product);
        handleSpecificationModal(specMainIds);

        if (extraMainIds.length > 0) {
          handleExtraNeedModal(extraMainIds);
        }
      } else {
        addToCart(product);
      }
    }
  };

  const addToCart = (product, variants = [], extraNeedings = []) => {
    const currentQuantity = localQuantities[product.product_inventory_id];

    if (currentQuantity > 0) {
      setLocalQuantities((prev) => ({
        ...prev,
        [product.product_inventory_id]: Math.max(0, currentQuantity - 1),
      }));

      setCart((prevCart) => {
        const variantKey = variants
          .map((v) => v.specification_variant_id)
          .sort()
          .join("-");

        const extraNeedingsKey = extraNeedings
          .map((e) => e.id)
          .sort()
          .join("-");

        const existingProduct = prevCart.find(
          (item) =>
            item.product_inventory_id === product.product_inventory_id &&
            item.variantKey === variantKey &&
            item.extraNeedingsKey === extraNeedingsKey
        );

        // Calculate the total price for extra needing items
        const extraNeedingPrice = extraNeedings.reduce(
          (sum, e) => sum + e.price,
          0
        );

        const extraNeedingNames = extraNeedings
          .map((e) => e.raw_material.material_name)
          .join(", ");

        if (existingProduct) {
          return prevCart.map((item) =>
            item.product_inventory_id === product.product_inventory_id &&
            item.variantKey === variantKey &&
            item.extraNeedingsKey === extraNeedingsKey
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal:
                    (item.quantity + 1) *
                    (item.price + item.variantPrice + extraNeedingPrice),
                  eachExtraNeedingPrice: item.eachExtraNeedingPrice.map(
                    (e) => ({
                      ...e,
                      volume: e.volume + e.volume,
                    })
                  ),
                }
              : item
          );
        } else {
          const variantPrice = variants.reduce(
            (sum, v) => sum + v.variant_price,
            0
          );

          const variantNames = variants.map((v) => v.variant_name).join(", ");

          const eachVariantPrice = variants.map((v) => ({
            variant_name: v.variant_name,
            variant_price: v.variant_price,
          }));

          const eachExtraNeedingPrice = extraNeedings.map((e) => ({
            name: e.raw_material.material_name,
            price: e.price,
            unitType: e.unit_type,
            volume: e.volume,
            rawId: e.raw_material_id,
          }));

          return [
            ...prevCart,
            {
              product_inventory_id: product.product_inventory_id,
              categoryId: categoryIdSelected,
              name: product.product.name,
              quantity: 1,
              price: product.product.price,
              category: product.product.category_products[0].category.name,
              printable: product.product.printable,
              variantPrice: variantPrice,
              variantNames: variantNames,
              eachVariantPrice: eachVariantPrice,
              variantKey: variantKey,
              extraNeedingPrice: extraNeedingPrice,
              extraNeedingNames: extraNeedingNames,
              extraNeedingsKey: extraNeedingsKey,
              eachExtraNeedingPrice: eachExtraNeedingPrice,
              subtotal:
                product.product.price + variantPrice + extraNeedingPrice,
            },
          ];
        }
      });
    } else {
      swal({
        icon: "error",
        title: "Quantity Exceeded",
        text: "The quantity is not enough.",
      });
    }
  };

  const handleConfirmSpecification = () => {
    if (!selectedSpecificationVariantId) {
      swal({
        icon: "warning",
        title: "Please select at least one specification",
        confirmButtonText: "OK",
      });
      return;
    }
    if (selectedProduct) {
      const selectedVariants = [
        ...Object.values(selectedExtraOptionVariantId).flat(),
      ];

      const selectExraNeeding = [
        ...Object.values(selectedExtraNeedingVariantId).flat(),
      ];

      if (selectedSpecificationVariantId) {
        selectedVariants.push(selectedSpecificationVariantId);
      }

      const variants = specificationData
        .flatMap((spec) => spec.specification_variants)
        .filter((variant) =>
          selectedVariants.includes(variant.specification_variant_id)
        );

      const extraNeedings = extraNeedingData
        .flatMap((extra) => extra.extra_variants)
        .filter((needing) => selectExraNeeding.includes(needing.id));

      addToCart(selectedProduct, variants, extraNeedings);
      handleCloseSpecificationModal();
    }
  };

  // const calculateTotal = () => {
  //   return cart.reduce((total, item) => total + item.subtotal, 0);
  // };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Check if the item's category is not a Student Meal
      if (
        item.category !== "Student Meal - Breakfast" &&
        item.category !== "Student Meal - Lunch" &&
        item.category !== "Student Meal - Dinner"
      ) {
        return total + item.subtotal;
      }
      // If it's a Student Meal, don't add the subtotal
      return total;
    }, 0);
  };

  const handleIncreaseQuantity = (productId, variantKey, extraNeedingsKey) => {
    const availableQuantity = localQuantities[productId] || 0;
    if (availableQuantity > 0) {
      setLocalQuantities((prev) => ({
        ...prev,
        [productId]: Math.max(0, availableQuantity - 1),
      }));
      setCart((prevCart) => {
        return prevCart.map((item) => {
          if (
            item.product_inventory_id === productId &&
            item.variantKey === variantKey &&
            item.extraNeedingsKey === extraNeedingsKey
          ) {
            const updatedEachExtraNeedingPrice = item.eachExtraNeedingPrice.map(
              (e) => ({
                ...e,
                volume: e.volume + e.volume, // Increment volume based on the extra needing
              })
            );
            return {
              ...item,
              quantity: item.quantity + 1,
              subtotal:
                (item.quantity + 1) *
                (item.price + item.variantPrice + item.extraNeedingPrice),
              eachExtraNeedingPrice: updatedEachExtraNeedingPrice,
            };
          }
          return item;
        });
      });
    } else {
      swal({
        icon: "error",
        title: "Quantity Exceeded",
        text: "The quantity is not enough.",
      });
    }
  };

  const handleDecreaseQuantity = (productId, variantKey, extraNeedingsKey) => {
    setLocalQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    setCart((prevCart) => {
      return prevCart.reduce((acc, item) => {
        if (
          item.product_inventory_id === productId &&
          item.variantKey === variantKey &&
          item.extraNeedingsKey === extraNeedingsKey
        ) {
          if (item.quantity > 1) {
            const updatedEachExtraNeedingPrice = item.eachExtraNeedingPrice.map(
              (e) => ({
                ...e,
                volume: e.volume - 1, // Decrease the volume based on the extra needing
              })
            );

            acc.push({
              ...item,
              quantity: item.quantity - 1,
              subtotal:
                (item.quantity - 1) *
                (item.price + item.variantPrice + item.extraNeedingPrice),
              eachExtraNeedingPrice: updatedEachExtraNeedingPrice,
            });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    });
  };

  const handleRemoveItem = (
    productId,
    variantKey,
    quantity,
    extraNeedingsKey
  ) => {
    setLocalQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity,
    }));

    // Remove the item from the cart
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.product_inventory_id === productId &&
            item.variantKey === variantKey &&
            item.extraNeedingsKey === extraNeedingsKey
          )
      )
    );
  };

  const handleToCheckout = () => {
    setOrderType(false);
    setShowOrder(true);
  };

  const handleToCancelOrder = () => {
    setShowOrder(false);
    setOrderType(true);
  };

  const handleNewTransaction = () => {
    const restoredQuantities = { ...localQuantities };
    cart.forEach((item) => {
      restoredQuantities[item.product_inventory_id] += item.quantity;
    });

    setCart([]);
    setLocalQuantities(restoredQuantities);
    setShowOrder(true);
    setOrderType(true);
  };

  const handleViewCart = () => {
    setShowOrder(true);
    setOrderType(true);
  };

  //for order_transaction_id use state 'to, hindi pwedeng ilipat ng pwesto
  const [transactionOrderId, setOrderTransactionId] = useState(
    location.state?.transactionOrderId || ""
  );
  //for order_transaction_id use state 'to, hindi pwedeng ilipat ng pwesto
  const handleCheckingOut = (type) => {
    navigate("/order-checkout", {
      state: {
        cart,
        subtotal: calculateTotal(),
        orderType: type,
        transactionOrderId,
      },
    });
  };

  useEffect(() => {
    // Update localQuantities based on cart if cart changes
    const initialQuantities = {};
    ProductMenu.forEach((p) => {
      initialQuantities[p.product_inventory_id] = p.quantity;
    });

    const adjustedQuantities = { ...initialQuantities };
    cart.forEach((item) => {
      if (initialQuantities.hasOwnProperty(item.product_inventory_id)) {
        adjustedQuantities[item.product_inventory_id] -= item.quantity;
      }
    });

    setLocalQuantities(adjustedQuantities);
  }, [cart, ProductMenu]);

  useEffect(() => {
    decodeToken();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadTableCategory();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);
  const { setIP, ip } = useStoreIP();

  //function sa pag-end shift ni cashier
  const handleEndShiftModal = () => {
    axios
      .get(BASE_URL + "/endshift/getShift", {
        params: {
          userId,
        },
      })
      .then((res) => {
        const reference = res.data.reference;
        setUserReference(reference);
        axios
          .post(`${BASE_URL}/endshift/endShiftData`, null, {
            params: {
              userId,
              reference,
            },
          })
          .then((res) => {
            if (res.status === 200) {
              setEndShiftModal(true);
              setEmployeeName(res.data.employeeName);
              setShiftDuration(res.data.duration);
              setStartShiftDate(res.data.minCreatedAt);
              setTotalCheckout(res.data.orderCount);
              setTotalIncome(res.data.payableAmountSum);
              setTotalItemSold(res.data.quantitySum);
              setTotalRefund(res.data.voidCount);
              setTotalCash(res.data.cashTotal);
              setTotalCard(res.data.cardTotal);
              setStartingMoney(res.data.startMoney);
              setTotalLoad(res.data.loadSum);
            } else if (res.status === 202) {
              setEmployeeName("");
              setShiftDuration("");
              setStartShiftDate("");
              setTotalCheckout(0);
              setTotalIncome(0);
              setTotalItemSold(0);
              setTotalRefund(0);
              setTotalCash(0);
              setTotalCard(0);
              setStartingMoney(0);
              setTotalLoad(0);
            }
          })
          .catch((error) => {
            console.error("Error end shift:", error);
            swal({
              title: "Error!",
              text: "There was an error on end shift.",
              icon: "error",
              buttons: false,
              timer: 2000,
            });
          });
      });
  };

  const handleOpenCalculator = () => {
    swal({
      title: "End Shift",
      text: "Would you like to end your shift?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((result) => {
      if (result) {
        setEndShiftCalcModal(true);
        setEndShiftModal(false);
        openCashDrawer();
      }
    });
  };

  const handleEndShift = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    setLoadingBtn(true);

    axios
      .post(BASE_URL + "/endshift/insertEndShift", null, {
        params: {
          userId,
          userReference,
          startshiftDate,
          endshiftDate: formattedDate,
          totalCheckout,
          totalIncome,
          totalItemSold,
          totalRefund,
          totalCash,
          totalCard,
          remittanceCash,
          employeeName,
          shiftDuration,
          amount,
          totalCashierSales,
          endShiftRemarks,
          totalLoad,
          startingMoney,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          if (detectedDevice == "Android") {
            handleReceiptsClick();
          }
          setLoadingBtn(false);
          swal({
            title: "Shift Ended!",
            // text: "Your shift is already ended!",
            icon: "success",
          }).then(() => {
            localStorage.removeItem("accessToken");
            navigate("/");
          });
        } else {
          swal.fire({
            title: "Something Went Wrong!",
            text: "Please contact your supervisor!",
            icon: "error",
          });
        }
      });
  };

  const handleEndShiftRemarks = () => {
    setEndRemarkModal(true);
    setEndShiftCalcModal(false);
  };

  const handleCloseEndShiftRemarks = () => {
    setEndRemarkModal(false);
    setEndShiftCalcModal(true);
  };
  //function sa pag-end shift ni cashier

  useEffect(() => {
    console.log(ip);
  }, [ip]);
  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip);
        console.log("Attempting to connect to printer...");
        await printer.connect();
        console.log("Successfully connected to printer");
        setPrinterInstance(printer);
        setIsPrinterReady(true);
      } catch (error) {
        console.error("Failed to connect to printer:", error);
        setIsPrinterReady(false);
      }
    } else {
      console.error("IminPrinter library not loaded");
    }
  };

  const ensurePrinterConnection = async () => {
    if (!isPrinterReady || !printerInstance) {
      await initPrinter();
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

  const formatNumber = (num) => {
    const formatNum = `${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    return formatNum;
  };

  const handleReceiptsClick = async () => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });

      await printerInstance.initPrinter();
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
      await printerInstance.printText("End Shift Slip");

      await printerInstance.setAlignment(1);
      // Spacing
      await printerInstance.printText(
        "                                                                     "
      );
      // await printerInstance.printText("BILLING");
      // Order NUmber

      await printerInstance.printColumnsText(
        ["Start Shift", "End Shift"],
        [1, 1],
        [1, 1],
        [28, 28],
        576
      );

      await printerInstance.printColumnsText(
        [`${startshiftDate}`, `${formatDate(new Date(currentDate))}`],
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

      await printerInstance.printColumnsText(
        ["Cashier Name:", `${employeeName}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );

      await printerInstance.printColumnsText(
        ["Shift Duration:", `${shiftDuration}`],
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

      await printerInstance.printColumnsText(
        ["Starting Money:", `${formatNumber(startingMoney)}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Cash Drawer:", `${formatNumber(parseFloat(amount))}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Difference:", `${formatNumber(totalCashierSales)}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Remittance:", `${formatNumber(parseFloat(remittanceCash))}`],
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

      await printerInstance.printColumnsText(
        ["Total Cash:", `${formatNumber(totalCash)}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Total Card:", `${formatNumber(totalCard)}`],
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
      await printerInstance.printColumnsText(
        ["Total Load:", `${formatNumber(totalLoad)}`],
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
      await printerInstance.printColumnsText(
        ["Total Income:", `${formatNumber(totalIncome)}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Total Checkout:", `${totalCheckout}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Total Item Sold:", `${totalItemSold}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );
      await printerInstance.printColumnsText(
        ["Total Refund:", `${totalRefund}`],
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
      await printerInstance.printColumnsText(
        ["Remarks:", `${endShiftRemarks}`],
        [1, 1],
        [0, 2],
        [26, 26],
        576
      );

      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "                                                                     "
      );

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

      await printerInstance.printAndFeedPaper(100);
      await printerInstance.partialCut();

      console.log("Printing completed successfully");
    } catch (error) {
      console.error("Failed to print receipt:", error);
    }
  };

  const openCashDrawer = async () => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      await printerInstance.openCashBox();
      console.log("Cash drawer opened!");
    } catch (error) {
      console.error("Failed to open cash drawer:", error);
    }
  };

  const handleCloseCashierCalc = () => {
    setEndShiftCalcModal(false);
    setEndShiftModal(true);
    setTotalCashierSales(0);
    setAmount("0");
    setRemittanceCash("0");
  };

  const handleCalculator = (value) => {
    const currentAmountLength = amount.replace(".", "").length;
    const currentRemittanceLength = remittanceCash.replace(".", "").length;

    let newAmount = amount;
    let newRemittanceCash = remittanceCash;

    if (value === ".") {
      if (focusedInput === "amount") {
        if (amount.includes(".")) return;
        newAmount = amount === "0" ? "0." : amount + ".";
        setAmount(newAmount);
      } else if (focusedInput === "remittanceCash") {
        if (remittanceCash.includes(".")) return;
        newRemittanceCash =
          remittanceCash === "0" ? "0." : remittanceCash + ".";
        setRemittanceCash(newRemittanceCash);
      }
    } else {
      if (focusedInput === "amount") {
        if (currentAmountLength >= 10) return;
        newAmount = amount === "0" ? value : amount + value;
        setAmount(newAmount);
      } else if (focusedInput === "remittanceCash") {
        if (currentRemittanceLength >= 10) return;
        newRemittanceCash =
          remittanceCash === "0" ? value : remittanceCash + value;
        setRemittanceCash(newRemittanceCash);
      }
    }

    const totalInput = parseFloat(newAmount);
    const updatedTotalCashierSales = totalInput - (totalCash + startingMoney);
    setTotalCashierSales(updatedTotalCashierSales);
  };

  const handleDel = () => {
    let newAmount = amount;
    let newRemittanceCash = remittanceCash;

    if (focusedInput === "amount") {
      newAmount = amount.slice(0, -1) || "0";
      setAmount(newAmount);
    } else if (focusedInput === "remittanceCash") {
      newRemittanceCash = remittanceCash.slice(0, -1) || "0";
      setRemittanceCash(newRemittanceCash);
    }

    // Calculate totalCashierSales after deleting a digit
    const totalInput = parseFloat(newAmount);
    const updatedTotalCashierSales = totalInput - (totalCash + startingMoney);
    setTotalCashierSales(updatedTotalCashierSales);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;

      if (key === "Backspace") {
        event.preventDefault();
        handleDel();
      } else if (!isNaN(key) || key === ".") {
        event.preventDefault();
        handleCalculator(key);
      }
    };

    if (endShiftCalcModal) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (endShiftCalcModal) {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [endShiftCalcModal, handleCalculator, handleDel]);

  const handleClear = () => {
    setAmount("0");
    setTotalCashierSales(0);
    setRemittanceCash("0");
  };

  // ************************** VOID TRANSACTION SECTION *************************************** \\
  const [posTransaction, setPOStransaction] = useState([]);
  const [productDetailsCheckout, setProductDetailsCheckout] = useState([]);

  const [typeOfOrder, setTypeOfOrder] = useState("");
  const [studentId, setStudentId] = useState("");
  const [checkoutId, setCheckoutId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [inputtedRFID, setInputtedRFID] = useState("");
  const [userPin, setUserPIN] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const [selectedOption, setSelectedOption] = useState(null);
  const [validated, setValidated] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [outOfStockChecked, setOutOfStockChecked] = useState(false);
  const [othersChecked, setOthersChecked] = useState(false);
  const [showProductCheckoutModal, setProductCheckoutModal] = useState(false);
  const [reasonModal, setReasonModal] = useState(false);
  const [chooseModal, setChooseModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [tapCardModal, setTapCardModal] = useState(false);

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const dt = useRef(null);

  const handleShow = () => setProductCheckoutModal(true);
  const handleProductCheckoutClose = () => setProductCheckoutModal(false);

  const reloadCheckoutTransaction = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/orderRecords/fetchCheckoutTransaction`
      );
      const currentDate = new Date().toISOString().split("T")[0];
      const filteredData = res.data.filter(
        (transaction) =>
          new Date(transaction.createdAt).toISOString().split("T")[0] ===
          currentDate
      );
      setPOStransaction(filteredData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleFetchProfile = async () => {
      const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
      setIP(res.data.store_ip);
    };

    handleFetchProfile();
  }, []);

  const handleShowProductCheckout = async (row) => {
    const orderTransactionId = row.order_transaction_id;
    axios
      .get(BASE_URL + "/orderRecords/fetchProductCheckout", {
        params: {
          Idcheckout: orderTransactionId,
        },
      })
      .then((res) => {
        if (row.status === "Pending-Customer") {
          setOrderTransactionId(row.order_transaction_id);
          setTypeOfOrder(row.order_type);
          const cartItems = res.data.map((item) => ({
            product_inventory_id: item.product_inventory_id,
            name: item.product_inventory.product.name,
            quantity: item.quantity,
            price: item.product_inventory.product.price,
            variantPrice: item.cart_specification_variants.reduce(
              (sum, variant) =>
                sum + variant.specification_variant.variant_price,
              0
            ),
            variantNames: item.cart_specification_variants
              .map((variant) => variant.specification_variant.variant_name)
              .join(", "),
            variantKey: item.cart_specification_variants
              .map((variant) => variant.specification_variant_id)
              .sort()
              .join("-"),
            eachVariantPrice: item.cart_specification_variants.map(
              (variant) => ({
                variant_name: variant.specification_variant.variant_name,
                variant_price: variant.specification_variant.variant_price,
              })
            ),
            subtotal: item.subtotal,
          }));

          // Update the cart state
          setCart(cartItems);

          // Navigate to the Menu page
          handleSelectedPage("Menu");
        } else {
          setProductDetailsCheckout(res.data);
          handleShow();
        }
      })
      .catch((err) => console.log(err));
  };

  const [searchOrderNum, setSearchOrderNum] = useState("");

  const handleSearchOrderNum = (event) => {
    setSearchOrderNum(event.target.value);
  };

  const filteredTransac = posTransaction.filter((data) =>
    data.order_number.toLowerCase().includes(searchOrderNum.toLowerCase())
  );

  const handleCancel = async (id) => {
    swal({
      title: `Are you sure you want to cancel this order?`,
      text: `Cancel the order?`,
      icon: "error",
      buttons: {
        excel: {
          text: "YES",
          value: "YES",
          className: "--excel",
        },
        pdf: {
          text: "NO",
          value: "NO",
          className: "--pdf",
        },
      },
    }).then(async (value) => {
      if (value === "YES") {
        handleCancelOrder(id);
      } else {
        swal.close();
      }
    });
  };

  const handleCancelOrder = async (id) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/order/cancel-transac-order/${id}`
      );

      if (res.status == 200) {
        swal({
          icon: "success",
          title: "Order Cancelled",
          text: "This order has been canceled",
        }).then(() => {
          reloadCheckoutTransaction();
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoid = (row) => {
    setReasonModal(true);
    setCheckoutId(row.order_transaction_id);
    setPaymentMethod(row.payment_method);
    setStudentId(row.student_id);
    setReceivedAmount(row.received_amount);
  };

  const handleCloseChoose = () => {
    setChooseModal(false);
    setSelectedOption(null);
    setSelectedReason("");
    setCheckoutId("");
    setPaymentMethod("");
    setStudentId("");
    setReceivedAmount(0);
    setIsDisabled(true);
  };

  const handleClosePinModal = () => {
    setPinModal(false);
  };

  const handleCloseReasonModal = () => {
    setReasonModal(false);
    setSelectedReason("");
    setCheckoutId("");
    setPaymentMethod("");
    setStudentId("");
    setReceivedAmount(0);
    setIsDisabled(true);
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
    setIsDisabled(false);
    setOutOfStockChecked(false);
    setOthersChecked(false);
  };

  const handleCheckboxChange = (checkboxName) => {
    if (checkboxName === "OutofStock") {
      setOutOfStockChecked(!outOfStockChecked);
      setOthersChecked(false);
    } else {
      setOutOfStockChecked(false);
      setOthersChecked(!othersChecked);
    }

    // Update selectedReason based on checkbox selection
    if (checkboxName === "OutofStock") {
      setSelectedReason(outOfStockChecked ? "" : "Refund-OutofStock");
    } else {
      setSelectedReason(othersChecked ? "" : "Refund-Others");
    }
  };

  const handleConfirm = () => {
    if (selectedReason === "Refund" && !outOfStockChecked && !othersChecked) {
      swal({
        icon: "warning",
        title: "Oops...",
        text: "You need to choose at least one checkbox!",
      }).then(() => {
        setReasonModal(true);
      });
    } else {
      setReasonModal(false);
      setChooseModal(true);
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setChooseModal(false);
    if (option === "pin") {
      setPinModal(true);
    } else {
      setTapCardModal(true);
    }
  };

  const handleChange = (e, index) => {
    const newValue = e.target.value;
    if (!isNaN(newValue)) {
      setUserPIN((prevPin) => {
        const updatedPin = prevPin.split("");
        updatedPin[index] = newValue;
        return updatedPin.join("");
      });
      // sa pagmove ng focus kada mag-iinput sa field
      if (index < inputRefs.length - 1 && newValue !== "") {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleCheckout = (transactionOrderId, columnOrdernumber, typeOrder) => {
    axios
      .get(BASE_URL + "/orderRecords/fetchTocheckoutTransaction", {
        params: {
          transactionOrderId,
        },
      })
      .then((res) => {
        navigate("/cashier-checkout", {
          state: {
            cartData: res.data,
            orderTransacID: transactionOrderId,
            orderType: typeOrder,
            columnTransacId: transactionOrderId,
            columnOrdernumber: columnOrdernumber,
            selectedPage: selectedPage,
          },
        });
      })
      .catch((err) => console.log(err));
  };

  const CheckPIN = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill in the red text fields.",
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/masterList/checkpin`, {
        checkoutId,
        selectedReason,
        paymentMethod,
        studentId,
        receivedAmount,
        userId,
        userPin,
      });

      if (res.status === 200) {
        swal({
          icon: "success",
          title: "Void Transaction Success",
          text: "Void transaction has been successfully.",
        }).then(() => {
          setPinModal(false);
          setValidated(false);
          reloadCheckoutTransaction();
          setUserPIN("");
          setSelectedReason("");
          setCheckoutId("");
          setPaymentMethod("");
          setStudentId("");
          setReceivedAmount(0);
          setIsDisabled(true);
        });
      } else if (res.status === 201) {
        swal({
          icon: "error",
          title: "No user found",
          text: "Your PIN number not found",
        }).then(() => {
          setPinModal(true);
          setValidated(false);
          setUserPIN("");
        });
      } else if (res.status === 202) {
        swal({
          icon: "error",
          title: "Not supervisor or admin",
          text: "Please input the supervisor or admin PIN",
        }).then(() => {
          setPinModal(true);
          setValidated(false);
          setUserPIN("");
        });
      } else if (res.status === 203) {
        swal({
          icon: "error",
          title: "Invalid user type",
          text: "Please ensure the inputted PIN is supervisor or admin",
        }).then(() => {
          setPinModal(true);
          setValidated(false);
          setUserPIN("");
        });
      }
    } catch (error) {
      console.error("Error checking PIN:", error);
      swal({
        icon: "error",
        title: "Error",
        text: "An error occurred while checking the PIN.",
      });
    }

    setValidated(true);
  };

  const columns = [
    {
      name: "ORDER TRANSACTION ID",
      selector: (row) => row.order_transaction_id,
    },
    {
      name: "ORDER NUMBER",
      selector: (row) => row.order_number,
    },
    {
      name: "PAYABLE AMOUNT",
      selector: (row) =>
        Number(row.payable_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "RECEIVED AMOUNT",
      selector: (row) =>
        Number(row.received_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "CHANGE AMOUNT",
      selector: (row) =>
        Number(row.change_amount).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "PAYMENT METHOD",
      selector: (row) => row.payment_method,
    },
    {
      name: "TYPE",
      selector: (row) => row.order_type,
    },
    {
      name: "ACTION",
      cell: (row) => {
        if (row.status === "Pending-Customer") {
          return (
            <>
              <button
                className="btn btn-success"
                onClick={() =>
                  handleCheckout(
                    row.order_transaction_id,
                    row.order_number,
                    row.order_type
                  )
                }
              >
                Checkout
              </button>
              <button
                className="btn btn-danger mx-3"
                onClick={() => handleCancel(row.order_transaction_id)}
              >
                Cancel
              </button>
            </>
          );
        } else if (row.status === "Ordered") {
          return (
            <button className="btn btn-warning" onClick={() => handleVoid(row)}>
              Void
            </button>
          );
        } else if (row.status === "Void") {
          return <span>Voided</span>;
        } else if (row.status === "Cancelled") {
          return <span style={{ color: "red" }}>Cancelled</span>;
        }
      },
    },
  ];

  const productDetailsColumns = [
    {
      name: "SKU #",
      selector: (row) => row.product_inventory.product.sku,
    },
    {
      name: "PRODUCT NAME",
      selector: (row) => row.product_inventory.product.name,
      cell: (row) => (
        <div className="d-flex flex-column p-0">
          <span className="text-center">
            {row.product_inventory.product.name}
          </span>

          {row.cart_specification_variants &&
          row.cart_specification_variants.length > 0 ? (
            <span className="text-center" style={{ fontSize: "10px" }}>
              (
              {row.cart_specification_variants
                .map((variant) => variant?.specification_variant?.variant_name)
                .join(", ")}
              )
            </span>
          ) : (
            <span></span>
          )}
        </div>
      ),
    },
    {
      name: "SUBTOTAL",
      selector: (row) =>
        Number(row.subtotal).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      name: "QUANTITY",
      selector: (row) => row.quantity,
    },
  ];

  useEffect(() => {
    reloadCheckoutTransaction();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center flex-column vh-100 align-items-center">
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("Ordering-View") ? (
        <div className="cashier-display-container">
          {/* Header */}
          <div className="header-orders">
            <div className="tab-manual-custom ms-0 flex-column flex-lg-row">
              <div className="col-12 col-lg-5 d-flex py-0">
                <div
                  className="tab-item w-50"
                  style={getTabItemStyle("Menu")}
                  onClick={() => handleSelectedPage("Menu")}
                >
                  <div className="tab-icon">
                    <i className="fas fa-list"></i>
                  </div>
                  <div className="tab-text">
                    <h2
                      style={{
                        color: selectedPage === "Menu" ? "#3498db" : "#9D9D9D",
                      }}
                    >
                      Menu
                    </h2>
                  </div>
                </div>
                <div
                  className="tab-item text-nowrap w-50"
                  style={getTabItemStyle("Order-Records")}
                  onClick={() => {
                    handleSelectedPage("Order-Records");
                    reloadCheckoutTransaction();
                  }}
                >
                  <div className="tab-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="tab-text">
                    <h2
                      style={{
                        color:
                          selectedPage === "Order-Records"
                            ? "#3498db"
                            : "#9D9D9D",
                      }}
                    >
                      Order Records
                    </h2>
                  </div>
                </div>
              </div>

              <div className="current-date-header mt-2 mt-lg-0 justify-content-center justify-content-lg-end">
                <div className="calendar-date ms-4 ms-sm-2">
                  <i class="bx bx-calendar-alt"></i>
                  <h3 className="fs-2 text-nowrap">{formattedDate}</h3>
                  &nbsp;
                  <h3 className="fs-2 text-nowrap">{formattedTime}</h3>
                </div>
                <div className="end-shifter-btn">
                  <button className="text-nowrap" type="button" onClick={handleEndShiftModal}>
                    <i className="bx bx-time-five"></i>
                    End Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
          {selectedPage === "Menu" ? (
            <div className="cashier-body">
              {/* Menus */}
              <div className="menu-nav">
                <div className="menu-nav-header">
                  <h2>MENU</h2>
                </div>
                <div className="menu-categories-list">
                  {CategoryMenu.map((c, index) => (
                    <>
                      <div
                        key={index}
                        className={`category ${
                          selectedCategory === c.category_id ? "selected" : ""
                        }`}
                        onClick={() => {
                          handleSelectCategory(c.category_id);
                        }}
                      >
                        {c.category_image ? (
                          <img
                            src={`data:image/png;base64,${c.category_image}`}
                            alt="Category"
                          />
                        ) : (
                          <img src={Noimg} alt="No image" />
                        )}
                        <h3>{c.name}</h3>
                      </div>
                    </>
                  ))}
                </div>
              </div>

              <div className="products-list-container pb-2 pb-sm-0">
                <div className="products-head">
                  <h2>Products</h2>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control search"
                      placeholder="Search by Product Name"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                {isProductLoading ? (
                  <div className="loading-container mt-5 pt-5" style={{ margin: "0" }}>
                    <FourSquare
                      color="#6290FE"
                      size="large"
                      text="Loading Product..."
                      textColor=""
                    />
                  </div>
                ) : (
                  <div className="products-lists">
                    {filteredProducts.map((p) => (
                      <div
                        class="card-product d-flex py-0 flex-column justify-content-between"
                        onClick={() => handleClick(p)}
                        key={p.product_inventory_id}
                      >
                        {p.product.image ? (
                          <img
                            src={`data:image/png;base64,${p.product.image}`}
                            alt="Category"
                          />
                        ) : (
                          <img src={Noimg} alt="No image" />
                        )}
                        <div class="card-body">
                          <h3
                            className={`card-title mx-2 text-center order-title-name ${
                              p.product.name.length > 20 ? "fs-4" : "fs-3"
                            }`}
                          >
                            {p.product.name}
                          </h3>
                        </div>
                        <div className="card-footer">
                          <h4 class="text-center mx-4 order-title-price ">
                            ₱
                            {p.product.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </h4>
                          <h5 className="ms-2 mb-4">{`QTY: ${
                            localQuantities[p.product_inventory_id] !==
                            undefined
                              ? localQuantities[p.product_inventory_id]
                              : p.quantity || 0
                          }`}</h5>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ordering-container">
                <div className="order-table-container">
                  {!showOrder ? (
                    <div className="btn-order-table-container">
                      <button
                        className="btn p-3 p-sm-3 btn-lg btn-outline-primary"
                        onClick={() => navigate("/menu")}
                      >
                        <span> Back Home</span>
                      </button>
                      <button
                        className="btn p-3 p-sm-3 btn-lg btn-primary"
                        onClick={handleViewCart}
                      >
                        <span> View Cart</span>
                      </button>
                      <button
                        className="btn p-3 p-sm-3 btn-lg btn-outline-primary"
                        onClick={handleNewTransaction}
                      >
                        <span> New Transaction</span>
                      </button>
                    </div>
                  ) : !orderType ? (
                    <div className="btn-order-table-container">
                      <button
                        className="btn p-3 p-sm-3 btn-lg btn-outline-primary"
                        onClick={() => handleCheckingOut("Dine-in")}
                      >
                        <span>Dine-in</span>
                      </button>
                      <button
                        className="btn p-3 p-sm-3 btn-lg btn-primary"
                        onClick={() => handleCheckingOut("Takeout")}
                      >
                        <span>Takeout</span>
                      </button>
                    </div>
                  ) : null}
                  {showOrder && orderType ? (
                    <div className="table-orders-container h-100">
                      <div className="order-num-container">
                        <h2>{`${userType} - ${cashierName}`}</h2>
                        <div className="number-container fs-1 fw-bold">
                          {typeOfOrder}
                        </div>
                      </div>
                      <table className="overflow-x-auto">
                        <thead>
                          <tr>
                            <th>QTY</th>
                            <th>ITEM NAME</th>
                            <th>SUBTOTAL</th>
                            <th>ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, index) => (
                            <tr
                              key={`${item.product_inventory_id}-${item.variantKey}`}
                            >
                              <td className="text-nowrap">
                                <i
                                  className="bx bxs-minus-square blue"
                                  onClick={() =>
                                    handleDecreaseQuantity(
                                      item.product_inventory_id,
                                      item.variantKey,
                                      item.extraNeedingsKey
                                    )
                                  }
                                ></i>
                                {item.quantity}
                                <i
                                  className="bx bxs-plus-square blue"
                                  onClick={() =>
                                    handleIncreaseQuantity(
                                      item.product_inventory_id,
                                      item.variantKey,
                                      item.extraNeedingsKey
                                    )
                                  }
                                ></i>
                              </td>
                              <td>
                                <div className="d-flex flex-column p-0">
                                  <span>{item.name}</span>
                                  {item.variantNames ||
                                  item.extraNeedingNames ? (
                                    <span
                                      className="text-muted"
                                      style={{ fontSize: "11px" }}
                                    >
                                      {item.variantNames &&
                                      item.extraNeedingNames
                                        ? `(${item.variantNames}, ${item.extraNeedingNames})`
                                        : item.variantNames
                                        ? `(${item.variantNames})`
                                        : item.extraNeedingNames}
                                    </span>
                                  ) : (
                                    <span></span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {item.subtotal.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td>
                                <i
                                  className="bx bxs-trash red"
                                  onClick={() =>
                                    handleRemoveItem(
                                      item.product_inventory_id,
                                      item.variantKey,
                                      item.quantity,
                                      item.extraNeedingsKey
                                    )
                                  }
                                ></i>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
                <div className="order-checkout-container">
                  <div className="total-container d-flex">
                    <h3 className="total-price">Total</h3>
                    <h3>
                      ₱
                      {calculateTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div className="total-btn-container">
                    <button
                      className="btn p-3 btn-lg btn-outline-primary"
                      onClick={handleToCancelOrder}
                    >
                      <span>Cancel Order</span>
                    </button>

                    <button
                      className="btn p-3 btn-lg btn-primary"
                      disabled={cart.length <= 0}
                      onClick={handleToCheckout}
                    >
                      <span>Checkout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            selectedPage === "Order-Records" && (
              <>
                <div class="input-group group-in">
                  <input
                    type="text"
                    class="form-control search w-100 mx-5 mb-2 mt-4"
                    placeholder="Search by Order Number"
                    aria-describedby="addon-wrapping"
                    onChange={handleSearchOrderNum}
                  />
                </div>
                <div className="table">
                  {filteredTransac.length == 0 ? (
                    <>
                      <div className="no-data-table ">
                        <table>
                          <thead>
                            <th>ORDER TRANSACTION</th>
                            <th>ORDER NUMBER</th>
                            <th>PAYABLE AMOUNT</th>
                            <th>RECEIVED AMOUNT</th>
                            <th>CHANGE AMOUNT</th>
                            <th>PAYMENT METHOD</th>
                            <th>TYPE</th>
                            <th>ACTION</th>
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
                      <div className="void-data-table">
                        <DataTable
                          columns={columns}
                          data={filteredTransac}
                          customStyles={customStyles}
                          pagination
                          onRowClicked={handleShowProductCheckout}
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )
          )}
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
      {/* for ordering specification */}
      <Modal
        show={specificationModal}
        onHide={handleCloseSpecificationModal}
        size="xl"
      >
        <Modal.Header>
          <h1>{productNameWithSpecification}</h1>
        </Modal.Header>
        <Modal.Body>
          <>
            <h1>Specification</h1>
            <div className="d-flex p-5 flex-column border-bottom">
              <div className="d-flex flex-column p-0 specification-row">
                {specificationData
                  .filter((v) => v.specification_type === "Specification")
                  .map((v, i) => (
                    <React.Fragment key={i}>
                      <div className="h2">{v.specification_name}</div>
                      <div className="d-flex flex-row p-0">
                        {v.specification_variants.map((data, index) => (
                          <div
                            className={`specific-border ${
                              highlightedSpecificationIndex ===
                              `${v.specification_name}-${index}`
                                ? "highlighted"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectSpecification(
                                v.specification_name,
                                index,
                                data.specification_variant_id
                              )
                            }
                            key={index}
                          >
                            <span className="h3">
                              {`${data.variant_name} = ₱ ${data.variant_price}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </>

          <>
            <h1 className="mt-2">Extra Options</h1>
            <div className="d-flex p-5 flex-column border-bottom">
              <div className="d-flex flex-column p-0 specification-row">
                {specificationData
                  .filter((v) => v.specification_type === "Options")
                  .map((v, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                      <div className="h2">{v.specification_name}</div>
                      <div className="d-flex flex-row p-0">
                        {v.specification_variants.map((data, variantIndex) => (
                          <div
                            className={`specific-border ${
                              (
                                selectedExtraOptionVariantId[groupIndex] || []
                              ).includes(data.specification_variant_id)
                                ? "highlighted"
                                : ""
                            }`}
                            key={variantIndex}
                            onClick={() =>
                              handleSelectExtraOption(
                                groupIndex,
                                data.specification_variant_id
                              )
                            }
                          >
                            <span className="h3">
                              {`${data.variant_name} = ₱ ${data.variant_price}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </>

          <>
            <h1 className="mt-2">Extra Needing</h1>
            <div className="d-flex p-5 flex-column ">
              <div className="d-flex flex-column p-0 specification-row">
                {extraNeedingData.map((v, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <div className="h2">{v.extra_name}</div>
                    <div className="d-flex flex-row p-0">
                      {v.extra_variants.map((data, extraIndex) => (
                        <div
                          className={`specific-border ${
                            (
                              selectedExtraNeedingVariantId[groupIndex] || []
                            ).includes(data.id)
                              ? "highlighted"
                              : ""
                          }`}
                          key={extraIndex}
                          onClick={() =>
                            handleSelectExtraNeeding(groupIndex, data.id)
                          }
                        >
                          <span className="h3">
                            {`${data.raw_material.material_name} = ₱ ${data.price}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="warning"
            type="button"
            onClick={handleConfirmSpecification}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* for product details in order records */}
      <Modal
        show={showProductCheckoutModal}
        onHide={handleProductCheckoutClose}
        size="xl"
      >
        <Modal.Header>
          <h2>PRODUCT INFORMATION</h2>
        </Modal.Header>
        <Modal.Body>
          <div className="table-containss">
            <div className="main-of-all-tables">
              <DataTable
                columns={productDetailsColumns}
                data={productDetailsCheckout}
                customStyles={customStyles}
                pagination
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* for selecting a reason upon void in order records */}
      <Modal show={reasonModal} onHide={handleCloseReasonModal}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Void Reason</h2>
            <div className="modal-top-card-student">
              <Form.Select
                size="lg"
                required
                onChange={handleReasonChange}
                defaultValue=""
              >
                <option disabled value="">
                  Select Reason
                </option>
                <option value="Refund">Refund</option>
                <option value="WrongItem">Wrong Product</option>
              </Form.Select>
            </div>
            {(selectedReason === "Refund" ||
              selectedReason === "Refund-OutofStock" ||
              selectedReason === "Refund-Others") && (
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={outOfStockChecked}
                    onChange={() => handleCheckboxChange("OutofStock")}
                  />
                  Out of Stock
                </label>
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="checkbox"
                    checked={othersChecked}
                    onChange={() => handleCheckboxChange("Others")}
                  />
                  Others
                </label>
              </div>
            )}
            <div className="button-top-card">
              <button disabled={isDisabled} onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* for selecting if manual input or tap card */}
      <Modal show={chooseModal} onHide={handleCloseChoose}>
        <Modal.Body>
          <div className="modal-top-card">
            <h2>Void Process</h2>
            <div className="d-flex p-5 flex-row w-100 justify-content-between chooseVoid">
              <div
                className={`h2 ${selectedOption === "pin" ? "selected" : ""}`}
                onClick={() => handleOptionClick("pin")}
                style={{ cursor: "pointer" }}
              >
                Enter PIN
              </div>
              <div
                className={`h2 ${selectedOption === "tap" ? "selected" : ""}`}
                onClick={() => handleOptionClick("tap")}
                style={{ cursor: "pointer" }}
              >
                Tap Card
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* USER PIN SECTION */}
      <Modal show={pinModal}>
        <Form noValidate validated={validated} onSubmit={CheckPIN}>
          <Modal.Body>
            <div className="student-pin-modal-container">
              <h2>Please Enter Your PIN</h2>
              <div className="pin-box-section">
                {inputRefs.map((ref, index) => (
                  <div className="first-form-control" key={index}>
                    <Form.Control
                      type="password"
                      value={userPin[index] || ""}
                      onChange={(e) => handleChange(e, index)}
                      required
                      ref={ref}
                      style={{
                        height: "70px",
                        fontSize: "22px",
                        textAlign: "center",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="buttonYes-cancel-section">
                <button type="submit">Enter</button>
                <button type="button" onClick={handleClosePinModal}>
                  Cancel
                </button>
              </div>
            </div>
          </Modal.Body>
        </Form>
      </Modal>

      {/* for end shift */}
      <Modal
        show={endShiftModal}
        onHide={() => setEndShiftModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Form>
          <div className="end-modal-category P">
            <div className="end-modal-head">
              <div className="end-acc-nam">
                <h2>{employeeName}</h2>
                <p>
                  <span className="end-gray">Shift duration: </span>
                  {shiftDuration}
                </p>
              </div>
              <div className="start-time">
                <p>
                  <span className="end-gray">Start Time</span>
                </p>
                <p>{startshiftDate}</p>
              </div>
            </div>
            <hr />
            <div className="end-modal-details">
              <h2 className="mb-3">Transaction</h2>
              <div className="end-details">
                <p>Checkout</p>
                <p>{totalCheckout}</p>
              </div>
              <div className="end-details">
                <p>Average Income Value</p>
                <p>
                  {totalIncome.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="end-details">
                <p>Sold Products</p>
                <p>{totalItemSold}</p>
              </div>
              <div className="end-details">
                <p>Refunded</p>
                <p>
                  {totalRefund.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <hr />
            <div className="end-modal-details">
              <h2 className="mb-3">Payment Report</h2>
              <div className="end-details">
                <p>Cash</p>
                <p>
                  {totalCash.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="end-details">
                <p>Card</p>
                <p>
                  {totalCard.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="end-details">
                <p>Total Load</p>
                <p>
                  {totalLoad.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <hr />
            <div className="end-modal-btn-container">
              <button
                type="button"
                className="end-btn end-cc-btn"
                onClick={() => setEndShiftModal(false)}
                style={{ width: "120px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="end-btn end-es-btn"
                onClick={handleOpenCalculator}
              >
                End Shift
              </button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* for cashier calculator */}
      <Modal
        show={endShiftCalcModal}
        onHide={handleCloseCashierCalc}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-category p-1 end-shift-cal">
          <h2>END SHIFT</h2>
          <h4 className="shitft-p">Check the cash in the cash drawer</h4>
          <hr />
          <div className="shift-cal-container">
            <div className="shift-expected-cash">
              <h3>Starting Money</h3>
              <h3>
                ₱{" "}
                {startingMoney.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>

            <div className="shift-expected-cash">
              <h3>Expected Money</h3>
              <h3>
                ₱{" "}
                {(totalCash + startingMoney).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div
              className="shift-actual-cash w-100 d-flex flex-row"
              style={{ height: "20px" }}
            >
              <div className="w-50">
                <h3>Actual Ending Money</h3>
              </div>
              <div className="w-50 d-flex flex-row justify-content-end p-0">
                <span className="h3">₱</span>{" "}
                <Form.Control
                  type="text"
                  value={amount === "" ? 0 : parseFloat(amount)}
                  style={{ width: "120px", height: "24px", fontSize: "16px" }}
                  onFocus={() => setFocusedInput("amount")}
                />
              </div>
            </div>

            <div className="w-100 d-flex flex-row p-0">
              <div className="w-50">
                <h3>Remittance</h3>
              </div>
              <div className="w-50 d-flex flex-row justify-content-end p-0">
                <span className="h3">₱</span>{" "}
                <Form.Control
                  type="text"
                  value={remittanceCash === "" ? 0 : parseFloat(remittanceCash)}
                  style={{ width: "120px", height: "24px", fontSize: "16px" }}
                  onFocus={() => setFocusedInput("remittanceCash")}
                />
              </div>
            </div>

            <div className="shift-actual-cash border-top mt-5 p-1">
              <h3>Difference</h3>
              <h3>
                ₱{" "}
                {totalCashierSales.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>

            <div className="calc-container">
              <table>
                <tr>
                  <th onClick={() => handleCalculator("1")}>1</th>
                  <th onClick={() => handleCalculator("2")}> 2</th>
                  <th onClick={() => handleCalculator("3")}>3</th>
                  <th onClick={handleDel}>Del</th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("4")}>4</th>
                  <th onClick={() => handleCalculator("5")}>5</th>
                  <th onClick={() => handleCalculator("6")}>6</th>
                  <th onClick={handleClear}>Clear</th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("7")}>7</th>
                  <th onClick={() => handleCalculator("8")}>8</th>
                  <th onClick={() => handleCalculator("9")}>9</th>
                  <th rowSpan={2} onClick={handleEndShiftRemarks}>
                    Enter
                  </th>
                </tr>
                <tr>
                  <th onClick={() => handleCalculator("0")}>0</th>
                  <th onClick={() => handleCalculator("00")}>00</th>
                  <th onClick={() => handleCalculator(".")}>.</th>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div className="end-modal-btn-container">
          <button
            type="button"
            className="end-btn end-es-btn"
            onClick={handleCloseCashierCalc}
            style={{ marginTop: "10px" }}
          >
            Back
          </button>
        </div>
      </Modal>

      <Modal show={endRemarkModal} onHide={handleCloseEndShiftRemarks}>
        <Modal.Body>
          <div className="modal-checkout-containers">
            <h2>End Shift Confirmation</h2>
            <div className="paymentmethod-payable">
              <span>Starting Money</span>
              <span>
                ₱{" "}
                {startingMoney.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* <div className="paymentmethod-payable">
              <span>POS Money</span>
              <span>
                ₱{" "}
                {(totalCash + totalLoad).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div> */}
            <div className="paymentmethod-payable">
              <span>Expected Money</span>
              <span>
                ₱{" "}
                {(totalCash + startingMoney).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="paymentmethod-payable">
              <span>Actual Ending Money</span>
              <span>
                ₱{" "}
                {amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="paymentmethod-payable">
              <span>Remittance</span>
              <span>
                ₱{" "}
                {remittanceCash.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="paymentmethod-payable">
              <span>Difference</span>
              <span>
                ₱{" "}
                {totalCashierSales.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="mt-2">
              <Form.Label
                style={{
                  fontSize: "20px",
                }}
              >
                Remarks
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                style={{
                  fontSize: "16px",
                  height: "100px",
                  maxHeight: "100px",
                  resize: "none",
                  overflowY: "auto",
                }}
                name="description"
                placeholder="Notes for the end shift"
                value={endShiftRemarks}
                onChange={(e) => setEndShiftRemarks(e.target.value)}
              />
            </div>

            <div className="checkout-button-confirm">
              {!loadingBtn ? (
                <>
                  <button onClick={handleEndShift}>Confirm</button>
                </>
              ) : (
                <>
                  <div className="d-flex w-100 justify-content-end p-0">
                    <ReactLoading
                      color="blue"
                      type={"spinningBubbles"}
                      height={"10%"}
                      width={"10%"}
                    />
                    <span
                      style={{
                        fontSize: "2rem",
                        // marginTop: "10px",
                        marginLeft: "5px",
                      }}
                    >
                      Please wait. . .
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Ordering;
