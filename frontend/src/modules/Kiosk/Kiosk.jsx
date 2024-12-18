import React, { useState, useEffect, useRef } from "react";
import food from "../../assets/icon/food-pic.jpg";
import "../styles/kiosk.css";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import swal from "sweetalert";
import sample from "../../assets/icon/sisig.jpg";
import { Modal, Button, ModalFooter } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Noimg from "../../assets/image/noimg.png";
import Carousel from "react-bootstrap/Carousel";
import eli_logo from "../../assets/image/eli-logo.png";
import { FourSquare } from "react-loading-indicators";
import { ArrowLeft } from "@phosphor-icons/react";
import useStoreKioskImages from "../../stores/useStoreKioskImages";
import KioskPrinterStatus from "./PrinterStatusComponent/KioskPrinterStatus";
import PrinterStatusModal from "./PrinterStatusComponent/PrinterStatusModal";
const Kiosk = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderType = location.state;
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState("kiosk");
  const [storeStatus, setStoreStatus] = useState();
  const { idleTime } = location.state;
  const handleSelectedPage = (selected) => {
    setSelectedPage(selected);
  };
  //use state for fetching section
  const [selectedCategory, setSelectedCategory] = useState();
  const [categoryIdSelected, setCategoryIdSelected] = useState("");
  const [CategoryMenu, setCategoryMenu] = useState([]);
  const [ProductMenu, setProductMenu] = useState([]);
  const [specificationData, setSpecificationData] = useState([]);
  const [extraNeedingData, setExtraNeedingData] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState(location.state?.cart || []);
  const [localQuantities, setLocalQuantities] = useState({});

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productNameWithSpecification, setProductNameWithSpecification] =
    useState("");

  const [connectionModal, setConnectionModal] = useState(false);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [kioskBannerImages, setKioskBannerImages] = useState([]);

  const { bannerImages, setBannerImages } = useStoreKioskImages();
  const handleCloseShowOrderModal = () => {
    setShowOrderModal(false);
    setSelectedPage("kiosk");
  };
  //section para sa specification function
  const [highlightedSpecificationIndex, setHighlightedSpecificationIndex] =
    useState(null);
  const [selectedSpecificationVariantId, setSelectedSpecificationVariantId] =
    useState(null);
  const [selectedExtraOptionVariantId, setSelectedExtraOptionVariantId] =
    useState({});
  const [selectedExtraNeedingVariantId, setSelectedExtraNeedingVariantId] =
    useState({});
  const [specificationModal, setSpecificationModal] = useState(false);
  const handleCloseSpecificationModal = () => {
    setSpecificationModal(false);
    setHighlightedSpecificationIndex(null);
    setSelectedSpecificationVariantId(null);
    setSelectedExtraOptionVariantId({});
    setSelectedExtraNeedingVariantId({});
  };

  const handleSelectSpecification = (specName, index, variantId) => {
    setHighlightedSpecificationIndex(`${specName}-${index}`);
    setSelectedSpecificationVariantId(variantId);
  };

  const handleSelectExtraOption = (groupIndex, variantId) => {
    setSelectedExtraOptionVariantId((prev) => {
      const selectedVariants = prev[groupIndex] || [];
      const isSelected = selectedVariants.includes(variantId);

      if (isSelected) {
        return {
          ...prev,
          [groupIndex]: selectedVariants.filter((id) => id !== variantId),
        };
      } else {
        return {
          ...prev,
          [groupIndex]: [...selectedVariants, variantId],
        };
      }
    });
  };

  useEffect(() => {
    console.log("Order Type here", orderType);
  }, [orderType]);

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

  //fetching ng mga category
  const reloadTableCategory = () => {
    axios
      .get(BASE_URL + "/order/category-product")
      .then((res) => {
        const filteredCategories = filterCategoriesByTime(res.data);
        setCategoryMenu(filteredCategories);
      })
      .catch((err) => console.log(err));
  };
  //fetching ng mga category

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
              productImage: product.product.image,
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

  // useEffect(() => {
  //   console.log("cart", cart);
  // }, [cart]);

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

  const handleCancelOrder = async () => {
    swal({
      title: `Are you sure you want to cancel this order?`,
      icon: "warning",
      timer: parseFloat(idleTime) * 1000,
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
        navigate("/kiosk-main");
      } else {
        swal.close();
      }
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

  const handlePlaceOrder = () => {
    setSelectedPage("payment-method");
    setShowOrderModal(false);
  };

  const handleBackButtonClick = () => {
    // Set the selected page as "Kiosk" when the button is clicked
    setSelectedPage("kiosk");
  };
  const handlePaymentMethod = async (payment) => {
    if (payment == "pay-at-counter") {
      const totalAmount = calculateTotal();
      axios
        .post(BASE_URL + "/order/orderProcess", {
          cart,
          orderType: orderType.orderType,
          totalAmount,
          selectedPayment: payment,
        })
        .then((res) => {
          if (res.status === 200) {
            const { orderNumber } = res.data;
            navigate(`/kiosk-order-number`, {
              state: {
                orderNumber,
                mop: "counter",
                idleTime,
              },
            });
          }
        });
    } else {
      const totalAmount = calculateTotal();
      navigate(`/kiosk-order-summary`, {
        state: {
          orderType,
          totalOrder: totalAmount,
          cart,
          ProductMenu,
          idleTime,
        },
      });
    }
  };

  const handleFetchBanner = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/kiosk_settings/fetchKioskImgsBanner`
      );

      setKioskBannerImages(response.data);
      setBannerImages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const checkStoreStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/store_profile/fetchStatus`);
      const currentStatus = res.data.status;
      setStoreStatus(currentStatus);
    } catch (error) {
      console.error("Error fetching store status:", error);
    }
  };

  useEffect(() => {
    reloadTableCategory();
    handleFetchBanner();
    checkStoreStatus();
  }, []);

  const idleTimeLimit = 1 * parseFloat(idleTime) * 1000;
  const timeoutRef = useRef(null);

  const startIdleTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      navigate("/kiosk-main");
    }, idleTimeLimit);
  };

  useEffect(() => {
    const events = ["mousemove", "keypress", "scroll", "click"];

    events.forEach((event) => window.addEventListener(event, startIdleTimer));

    startIdleTimer();

    const scrollableElement = document.getElementById("kiosk-lists");

    const handleScroll = () => {
      startIdleTimer();
    };
    scrollableElement.addEventListener("scroll", handleScroll);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, startIdleTimer)
      );
      scrollableElement.removeEventListener("scroll", handleScroll);
    };
  }, [navigate]);

  return (
    <>
      {selectedPage === "kiosk" ? (
        <div className="kiosk-container ">
          {/* Header */}
          <div className="food-pic-header">
            <Carousel fade>
              {bannerImages && bannerImages.length > 0 ? (
                bannerImages.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={`data:image/png;base64,${image.kiosk_img}`}
                      alt={`Kiosk Image ${index}`}
                    />
                  </Carousel.Item>
                ))
              ) : (
                <Carousel.Item>
                  <img src={food} alt="Default Image" />
                </Carousel.Item>
              )}
            </Carousel>
          </div>
          <div className="kiosk-body">
            {/* Kiosk Menu */}
            <div className="kiosk-nav">
              <div className="kiosk-nav-header">
                <h2>MENU</h2>
              </div>
              <div className="menu-categories-list kiosk-cat">
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
            {/* Kiosk Products */}
            <div className="kiosk-list-container">
              <div className="kiosk-head-m">
                <div className="kiosk-head">
                  <>
                    <img src={sample} className="kiosk-categ-pic" />
                    <h1 className="kiosk-categ">Products</h1>
                  </>
                </div>
              </div>

              <div className="kiosk-lists " id="kiosk-lists">
                {isProductLoading ? (
                  <div className="loading-container" style={{ margin: "0" }}>
                    <FourSquare
                      color="#6290FE"
                      size="large"
                      text="Loading Product..."
                      textColor=""
                    />
                  </div>
                ) : (
                  <div className="kiosk-product-container">
                    {filteredProducts.map((p) => {
                      // const cartItem = addCartQTY[p.product_inventory_id];

                      const quantity = cart
                        .filter(
                          (item) =>
                            item.product_inventory_id === p.product_inventory_id
                        )
                        .reduce((acc, item) => acc + item.quantity, 0);

                      return (
                        <div
                          className="kiosk-product d-flex flex-column justify-content-center align-items-center"
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

                          <div className="kiosk-product-name">
                            <h3 className="mx-2">{p.product.name}</h3>
                            <h4 className="mx-4 mb-0">
                              ₱
                              {p.product.price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </h4>
                          </div>

                          {quantity > 0 && (
                            <div className="qty-circle">{quantity}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="kiosk-order-summary">
            <table className="kiosk-table">
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>IMAGE</th>
                  <th>ITEM NAME</th>
                  <th>PRICE</th>
                  <th>SUBTOTAL</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.product_inventory_id}-${item.variantKey}`}>
                    <td>
                      <div className="order-qty">
                        <i
                          class="bx bxs-minus-square blue"
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
                          class="bx bxs-plus-square blue"
                          onClick={() =>
                            handleIncreaseQuantity(
                              item.product_inventory_id,
                              item.variantKey,
                              item.extraNeedingsKey
                            )
                          }
                        ></i>
                      </div>
                    </td>
                    <td>
                      {item.productImage ? (
                        <img
                          src={`data:image/png;base64,${item.productImage}`}
                          alt="Category"
                          className="kiosk-cart-img"
                        />
                      ) : (
                        <img
                          src={Noimg}
                          alt="No image"
                          className="kiosk-cart-img"
                        />
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-column p-0">
                        <span>{item.name}</span>
                        {item.variantNames || item.extraNeedingNames ? (
                          <span
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            {item.variantNames && item.extraNeedingNames
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
                      {item.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {" "}
                      {item.subtotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <i
                        class="bx bxs-trash red"
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
              <div className="total-order-container">
                <div className="kiosk-order-container">
                  <div className="total-order">
                    <h2>
                      Total Order: ₱
                      {calculateTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                  </div>
                </div>

                <div className="kiosk-payment-container">
                  <button
                    className="kiosk-payment"
                    onClick={() => {
                      storeStatus
                        ? setShowOrderModal(true)
                        : swal({
                            title: "Store Closed",
                            text: "We're closed now. Please come back during our opening hours.",
                            icon: "warning",
                            confirmButtonText: "OK",
                          }).then(() => {
                            navigate("/kiosk-main");
                          });
                    }}
                    disabled={cart.length <= 0}
                  >
                    <h1>Review + Payment</h1>
                  </button>

                  <button
                    className="kiosk-payment-cancel"
                    onClick={handleCancelOrder}
                  >
                    <h1>Cancel Order</h1>
                  </button>
                </div>
              </div>
            </table>
          </div>
        </div>
      ) : (
        selectedPage === "payment-method" && (
          <div className="order-type-container">
            <div className="selection-container">
              <div className="p-2">
                <i
                  class="bx bx-arrow-back kiosk-back"
                  onClick={handleBackButtonClick}
                ></i>
                {/* <button
                  style={{
                    padding: "10px",
                    width: "200px",
                    borderRadius: "7px",
                    fontSize: "2rem",
                  }}
                  onClick={handleBackButtonClick}
                >
                  BACK
                </button> */}
              </div>
              <div className="kiosk-logo-container  w-eli-logo">
                <div className="kiosk-img-logo  cont-eli-logo">
                  <img src={eli_logo} className="eli-logo" />
                </div>
              </div>
              <div className="choose-type-container">
                <h1>PAYMENT METHOD</h1>
                {/* <div
                  className="kiosk-dine-in"
                  onClick={() => handlePaymentMethod("pay-at-counter")}
                >
                  <h1 className="kiosk-payment-p">PAY AT COUNTER</h1>
                </div> */}

                <div
                  className={`kiosk-take-out`}
                  onClick={() => handlePaymentMethod("e-wallet")}
                >
                  <h1 className="kiosk-payment-p">E-WALLET</h1>
                </div>
              </div>
            </div>
          </div>
        )
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
            <div className="d-flex p-5 flex-column border-bottom overflow-auto">
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

      {/* for preview of orders  */}
      <Modal
        show={showOrderModal}
        onHide={handleCloseShowOrderModal}
        size="lg"
        centered
      >
        <div className="kiosk-modal-head">
          <h1>Order Preview</h1>
          <div className="d-flex p-0 align-items-center">
            <button type="button" onClick={handleCloseShowOrderModal}>
              Back to Menu
            </button>
          </div>
        </div>
        <Modal.Body>
          <div className="modal-category">
            <table className="kiosk-table">
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>IMAGE</th>
                  <th>ITEM NAME</th>
                  <th>PRICE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.product_inventory_id}-${item.variantKey}`}>
                    <td>
                      <div className="order-qty">{item.quantity}</div>
                    </td>
                    <td>
                      {item.productImage ? (
                        <img
                          src={`data:image/png;base64,${item.productImage}`}
                          alt="Category"
                          className="kiosk-cart-img"
                        />
                      ) : (
                        <img
                          src={Noimg}
                          alt="No image"
                          className="kiosk-cart-img"
                        />
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-column p-0">
                        <span>{item.name}</span>
                        {item.variantNames && (
                          <span
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            ({item.variantNames})
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {item.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {" "}
                      {item.subtotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>

        <div className="total-payment">
          <div className="d-flex p-0 kiosk-total-container">
            <h2 className="total-title">Total Payment:</h2>
            <h2 className="total">
              {calculateTotal().toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
          <div className="d-flex p-0 align-items-center">
            <button className="btn-place" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </div>
      </Modal>

      <KioskPrinterStatus setConnectionModal={setConnectionModal} />

      <PrinterStatusModal
        connectionModal={connectionModal}
        setConnectionModal={setConnectionModal}
      />
    </>
  );
};

export default Kiosk;
