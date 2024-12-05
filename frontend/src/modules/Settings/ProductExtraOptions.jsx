import { Modal, Button, Form } from "react-bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import BASE_URL from "../../assets/global/url";
import swal from "sweetalert";
import axios from "axios";
import UpdateSpecification from "./update/updateSpecification";
import UpdateExtraNeeding from "./update/updateExtraNeeding";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import productUnits from "../../assets/global/unit";
import { jwtDecode } from "jwt-decode";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
const ProductExtraOptions = ({ authrztn }) => {
  const [validated, setValidated] = useState(false);
  const [Category, setCategory] = useState([]);
  const [product, setProduct] = useState([]);
  const [specsData, setSpecsData] = useState([]);
  const [optionsData, setOptionsData] = useState([]);
  const [extraNeedingData, setExtraNeedingData] = useState([]);
  const [userId, setuserId] = useState("");
  const [rawInventoryData, setRawInventoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [linkModal, setLinkModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Specification");
  const [selectedTabLabel, setSelectedTabLabel] = useState("SPECIFICATION");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [updateIDSpecs, setUpdateIDSpecs] = useState("");
  const [updateIDExtraNeeds, setUpdateIDExtraNeeds] = useState("");
  const [editSpecTab, setEditSpecTab] = useState(false);
  const [toggleAddBtn, setToggleAddBtn] = useState(false);
  const [extraToggleAdd, setExtraToggleAdd] = useState(false);
  const [isUpdateSpecification, setIsUpdateSpecification] = useState(false);
  const [updateExtraNeeding, setUpdateExtraNeeding] = useState(false);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());

  const [extraSpecs, setExtraSpecs] = useState({
    extraName: "",
    extraType: selectedTab,
    extraSubOptions: [
      { extraSubName: "", extraUnitType: "", extraVolume: "", extraPrice: "" },
    ],
  });
  const [currentSpec, setCurrentSpec] = useState({
    name: "",
    type: selectedTab,
    subOptions: [{ subName: "", price: "" }],
  });
  const handleChangeTab = (selected) => {
    if (
      (selectedTab == "Specification" && selected == "Specification") ||
      (selectedTab == "Options" && selected == "Options") ||
      (selectedTab == "Needing" && selected == "Needing")
    ) {
      return;
    }
    setIsLoading(true);
    setSelectedTab(selected);
    setToggleAddBtn(false);
    setExtraToggleAdd(false);
    setIsUpdateSpecification(false);
    setUpdateExtraNeeding(false);
    // setEditSpecTab(false);
    // setInputs([]);
    setCurrentSpec({
      name: "",
      type: selected,
      subOptions: [{ subName: "", price: "" }],
    });
    setExtraSpecs({
      extraName: "",
      extraType: selected,
      extraSubOptions: [
        {
          extraSubName: "",
          extraUnitType: "",
          extraVolume: "",
          extraPrice: "",
        },
      ],
    });
    setSelectedProducts([]);
  };

  const handleToggleAddBtn = () => {
    setEditSpecTab(false);
    if (windowWidth < 1201) {
      setShowSpecificationModal(true);
    } else {
      setToggleAddBtn(true);
    }
    setExtraToggleAdd(false);
    setIsUpdateSpecification(false);
    setCurrentSpec({
      name: "",
      type: selectedTab,
      subOptions: [{ subName: "", price: "" }],
    });
    setSelectedProducts([]);
  };

  const handleExtraToggle = () => {
    setExtraSpecs({
      extraName: "",
      extraType: selectedTab,
      extraSubOptions: [
        {
          extraSubName: "",
          extraUnitType: "",
          extraVolume: "",
          extraPrice: "",
        },
      ],
    });
    if (windowWidth < 1201) {
      setShowExtraNeedingModal(true);
    }
    setExtraToggleAdd(true);
    setUpdateExtraNeeding(false);
    setSelectedProducts([]);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    const Idcategory = categoryId;
    // localStorage.setItem("selectedCategory", categoryId);
    axios
      .get(BASE_URL + "/variant/fetchSpecificProdCategory_settings", {
        params: {
          Idcategory,
        },
      })
      .then((res) => {
        setProduct(res.data);
        // console.log(res.data);
      })
      .catch((err) => console.log(err));
  };

  const handleCheckboxChange = (prod_id, prod_name, prod_sku) => {
    setSelectedProducts((prevSelected) => {
      const productData = {
        prod_id: prod_id,
        prod_name: prod_name,
        prod_sku: prod_sku,
      };

      let newSelected;
      if (prevSelected.some((item) => item.prod_id === prod_id)) {
        newSelected = prevSelected.filter((item) => item.prod_id !== prod_id);
      } else {
        newSelected = [...prevSelected, productData];
      }

      return newSelected;
    });
  };

  const handleEdit = (data) => {
    if (authrztn?.includes("ProductExtra-Edit")) {
      if(windowWidth < 1201) {
        setShowUpdateSpecificationModal(true);
      }
      setIsUpdateSpecification(true);
      setCurrentSpec(data);
      setUpdateIDSpecs(data.specification_main_id);
    }
  };

  const handleEditExtraNeeding = (data) => {
    if (authrztn?.includes("ProductExtra-Edit")) {
      if(windowWidth < 1201) {
        setShowUpdateSpecificationModal(true);
      }
      setUpdateExtraNeeding(true);
      setExtraSpecs(data);
      setUpdateIDExtraNeeds(data.extra_main_id);
    }
  };

  const handleExtraAddSubOption = () => {
    setExtraSpecs((prevSpec) => {
      const newExtraSpec = {
        ...prevSpec,
        extraSubOptions: [
          ...prevSpec.extraSubOptions,
          {
            extraSubName: "",
            extraUnitType: "",
            extraVolume: "",
            extraPrice: "",
          },
        ],
      };
      return newExtraSpec;
    });
  };

  const handleExtraSubOptionChange = (index, field, value) => {
    const newExtraSubOptions = [...extraSpecs.extraSubOptions];
    const currentOption = newExtraSubOptions[index];

    if (field === "extraSubName") {
      // Remove the previously selected material for this row
      if (currentOption.extraSubName) {
        setSelectedMaterials((prev) => {
          const updated = new Set(prev);
          updated.delete(currentOption.extraSubName);
          return updated;
        });
      }

      // Add the newly selected material
      setSelectedMaterials((prev) => new Set(prev).add(value));
    }

    // Update the specific field
    currentOption[field] = value;

    // Find the selected material and its unit type and price
    const selectedMaterial = rawInventoryData.find(
      (material) =>
        material.raw_material_id === parseInt(currentOption.extraSubName)
    );
    const priceDatabase = selectedMaterial ? selectedMaterial.unit_price : "";
    const priceUnitType = selectedMaterial ? selectedMaterial.unit_type : "";

    // Update filtered units based on new unit type
    if (field === "extraSubName" || field === "extraUnitType") {
      const newUnitType = selectedMaterial ? selectedMaterial.unit_type : "";
      // Pass the new unit type directly to the row to filter units
      const newFilteredUnits = filterUnits(newUnitType);
      currentOption.filteredUnits = newFilteredUnits; // Add filtered units to the current option
    }

    // Calculate price if unit type and volume are provided
    if (
      currentOption.extraUnitType &&
      currentOption.extraVolume &&
      priceDatabase
    ) {
      const volume = parseFloat(currentOption.extraVolume);
      const unitType = currentOption.extraUnitType;

      // Check if unit types match
      if (unitType === priceUnitType) {
        // If unit types match, use priceDatabase directly for calculation
        currentOption.extraPrice = (priceDatabase * volume).toFixed(2);
      } else {
        // Convert volume to the unit type used in priceDatabase
        const volumeInPriceUnitType = convertToCommonUnit(volume, unitType);
        currentOption.extraPrice = (
          priceDatabase * volumeInPriceUnitType
        ).toFixed(2);
      }
    } else {
      // If not all required fields are filled, clear the price
      currentOption.extraPrice = "";
    }

    setExtraSpecs({ ...extraSpecs, extraSubOptions: newExtraSubOptions });
  };

  const convertToCommonUnit = (volume, fromUnitType) => {
    switch (fromUnitType) {
      case "L":
        return volume; // Assuming volume is in liters
      case "mL":
        return volume / 1000; // Convert milliliters to liters
      case "Kg":
        return volume; // Assuming volume is in kilograms
      case "lbs":
        return volume * 0.453592; // Convert pounds to kilograms
      case "oz":
        return volume * 0.0283495; // Convert ounces to kilograms
      case "g":
        return volume / 1000;
      case "pcs":
        return volume;
      default:
        return volume; // Handle other unit types or return volume as-is
    }
  };

  const filterUnits = (unitType) => {
    if (unitType === "L") {
      return productUnits.filter(
        (unit) => unit.value === "L" || unit.value === "mL"
      );
    } else if (unitType === "pcs") {
      return productUnits.filter((unit) => unit.value === "pcs");
    } else if (unitType === "mL") {
      return productUnits.filter((unit) => unit.value === "mL");
    } else if (unitType === "Kg") {
      return productUnits.filter(
        (unit) =>
          unit.value === "Kg" ||
          unit.value === "lbs" ||
          unit.value === "oz" ||
          unit.value === "g"
      );
    } else if (unitType === "lbs") {
      return productUnits.filter(
        (unit) =>
          unit.value === "lbs" || unit.value === "oz" || unit.value === "g"
      );
    } else if (unitType === "oz") {
      return productUnits.filter(
        (unit) => unit.value === "oz" || unit.value === "g"
      );
    } else if (unitType === "g") {
      return productUnits.filter((unit) => unit.value === "g");
    } else {
      return productUnits.filter(
        (unit) => unit.value !== "L" && unit.value !== "mL"
      );
    }
  };

  const handleRemoveExtraSubOption = (index) => {
    if (extraSpecs.extraSubOptions.length > 1) {
      const newExtraSubOptions = extraSpecs.extraSubOptions.filter(
        (_, i) => i !== index
      );
      setExtraSpecs({ ...extraSpecs, extraSubOptions: newExtraSubOptions });
    } else {
      swal({
        title: "Oopps!",
        text: "You can't remove the last sub-option.",
        icon: "error",
        buttons: false,
        timer: 2000,
        dangerMode: true,
      });
    }
  };

  const handleExtraClose = () => {
    setLinkModal(false);
    setValidated(false);
    setExtraSpecs({
      extraName: "",
      extraType: selectedTab,
      extraSubOptions: [
        {
          extraSubName: "",
          extraUnitType: "",
          extraVolume: "",
          extraPrice: "",
        },
      ],
    });
    setSelectedProducts([]);
  };

  const getAvailableMaterials = (currentRowMaterial) => {
    return rawInventoryData.filter(
      (material) =>
        !selectedMaterials.has(material.raw_material_id.toString()) ||
        material.raw_material_id.toString() === currentRowMaterial
    );
  };

  const handleAddSubOption = () => {
    setCurrentSpec((prevSpec) => {
      const newSpec = {
        ...prevSpec,
        subOptions: [...prevSpec.subOptions, { subName: "", price: "" }],
      };
      return newSpec;
    });
  };

  const handleSubOptionChange = (index, field, value) => {
    const newSubOptions = [...currentSpec.subOptions];
    newSubOptions[index][field] = value;
    setCurrentSpec({ ...currentSpec, subOptions: newSubOptions });
  };

  const handleRemoveSubOption = (index) => {
    if (currentSpec.subOptions.length > 1) {
      const newSubOptions = currentSpec.subOptions.filter(
        (_, i) => i !== index
      );
      setCurrentSpec({ ...currentSpec, subOptions: newSubOptions });
    } else {
      swal({
        title: "Oopps!",
        text: "You can't remove the last sub-option.",
        icon: "error",
        buttons: false,
        timer: 2000,
        dangerMode: true,
      });
    }
  };

  const handleClose = () => {
    setLinkModal(false);
    setValidated(false);
    setCurrentSpec({
      name: "",
      type: selectedTab,
      subOptions: [{ subName: "", price: "" }],
    });
    setSelectedProducts([]);
  };

  const fetchRawInventory = () => {
    axios
      .get(BASE_URL + "/variant/getRawInventory")
      .then((res) => {
        setRawInventoryData(res.data);
      })
      .catch((err) => console.log(err));
  };

  const reloadTableCategory = () => {
    axios
      .get(BASE_URL + "/category/getCategory")
      .then((res) => {
        setCategory(res.data);
      })
      .catch((err) => console.log(err));
  };

  const reloadTableSpecification = () => {
    const delay = setTimeout(() => {
      axios
        .get(BASE_URL + "/variant/getSpecification")
        .then((res) => {
          setIsUpdateSpecification(false);
          setSpecsData(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(true);
        });
    }, 1000);

    return () => clearTimeout(delay);
  };

  const reloadTableExtraOption = () => {
    const delay = setTimeout(() => {
      axios
        .get(BASE_URL + "/variant/getExtraOption")
        .then((res) => {
          setIsUpdateSpecification(false);
          setOptionsData(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(true);
        });
    }, 1000);

    return () => clearTimeout(delay);
  };

  const reloadTableExtraNeeding = () => {
    const delay = setTimeout(() => {
      axios
        .get(BASE_URL + "/variant/getExtraNeeding")
        .then((res) => {
          setUpdateExtraNeeding(false);
          setExtraNeedingData(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(true);
        });
    }, 1000);

    return () => clearTimeout(delay);
  };

  useEffect(() => {
    console.log("Load", isLoading);
  }, [isLoading]);

  const add_specification = async (e) => {
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
    } else {
      swal({
        title: "Create this new variant?",
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          axios
            .post(`${BASE_URL}/variant/createVariant`, {
              currentSpec,
              selectedProducts,
              userId,
            })
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "Variant created successfully",
                  icon: "success",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {
                  handleClose();
                  if (windowWidth < 1201) {
                    switch (selectedTabLabel) {
                      case "SPECIFICATION":
                        reloadTableSpecification();
                        break;
                      case "EXTRA OPTIONS":
                        reloadTableExtraOption();
                        break;
                      case "EXTRA NEEDING":
                        reloadTableExtraNeeding();
                        break;
                      default:
                        break;
                    }
                  } else {
                    switch (selectedTab) {
                      case "Specification":
                        reloadTableSpecification();
                        break;
                      case "Options":
                        reloadTableExtraOption();
                        break;
                      case "Needing":
                        reloadTableExtraNeeding();
                        break;
                      default:
                        break;
                    }
                  }
                });
              } else if (res.status === 201) {
                swal({
                  title: "Variant already exist",
                  text: "Please input another Variant Name",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                });
              } else {
                swal({
                  title: "Something Went Wrong",
                  text: "Please contact your support immediately",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {
                  handleClose();
                  if (windowWidth < 1201) {
                    switch (selectedTabLabel) {
                      case "SPECIFICATION":
                        reloadTableSpecification();
                        break;
                      case "EXTRA OPTIONS":
                        reloadTableExtraOption();
                        break;
                      case "EXTRA NEEDING":
                        reloadTableExtraNeeding();
                        break;
                      default:
                        break;
                    }
                  } else {
                    switch (selectedTab) {
                      case "Specification":
                        reloadTableSpecification();
                        break;
                      case "Options":
                        reloadTableExtraOption();
                        break;
                      case "Needing":
                        reloadTableExtraNeeding();
                        break;
                      default:
                        break;
                    }
                  }
                });
              }
            });
        }
      });
    }
    setValidated(true);
  };

  const add_extraNeed = async (e) => {
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
    } else {
      swal({
        title: "Create this new variant?",
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          axios
            .post(`${BASE_URL}/variant/createExtraNeed`, {
              extraSpecs,
              selectedProducts,
              userId,
            })
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "Variant created successfully",
                  icon: "success",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {
                  handleExtraClose();
                  switch (selectedTab) {
                    case "Specification":
                      reloadTableSpecification();
                      break;
                    case "Options":
                      reloadTableExtraOption();
                      break;
                    case "Needing":
                      reloadTableExtraNeeding();
                      break;
                    default:
                      break;
                  }
                });
              } else if (res.status === 201) {
                swal({
                  title: "Variant already exist",
                  text: "Please input another Variant Name",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                });
              } else {
                swal({
                  title: "Something Went Wrong",
                  text: "Please contact your support immediately",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {
                  handleExtraClose();
                  switch (selectedTab) {
                    case "Specification":
                      reloadTableSpecification();
                      break;
                    case "Options":
                      reloadTableExtraOption();
                      break;
                    case "Needing":
                      reloadTableExtraNeeding();
                      break;
                    default:
                      break;
                  }
                });
              }
            });
        }
      });
    }
    setValidated(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedTab === "Specification") {
        reloadTableSpecification();
      } else if (selectedTab === "Options") {
        reloadTableExtraOption();
      } else if (selectedTab === "Needing") {
        reloadTableExtraNeeding();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [selectedTab]);

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    reloadTableCategory();
    reloadTableExtraOption();
    reloadTableExtraNeeding();
    decodeToken();
    fetchRawInventory();
  }, []);

  // For Tabs
  const [value, setValue] = useState(0);
  const handlePageChange = (event, newValue) => {
    setValue(newValue);
    setSelectedTabLabel(event.target.innerText);
    const tabData = event.target.closest("button").getAttribute("data-custom"); // Access the custom data
    setSelectedTab(tabData);
  };

  const CustomTabPanel = useCallback((props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }, []);

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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to update the window width state
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  // Set up event listener for window resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [showSpecificationModal, setShowSpecificationModal] = useState(false);
  const [showExtraNeedingModal, setShowExtraNeedingModal] = useState(false);
  const [showUpdateSpecificationModal, setShowUpdateSpecificationModal] = useState(false);

  return (
    <>
      {isLoading ? (
        <div
          className="d-flex justify-content-center flex-column vh-100 ms-5 ps-5 align-items-center"
          // style={{ margin: "0", marginLeft: "250px", marginTop: "20%" }}
        >
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("ProductExtra-View") ? (
        <div className="extra-options-container">
          {windowWidth < 1201 ? (
            <>
              <div className="w-100">
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handlePageChange}
                    aria-label="basic tabs"
                  >
                    <Tab label="Specification" data-custom="Specification" />
                    <Tab label="Extra Options" data-custom="Options" />
                    <Tab label="Extra Needing" data-custom="Needing" />
                  </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                  <>
                    {/* Specification Fetching */}
                    <div className="specification-card">
                      <div className="extra-title-container ">
                        <div className="d-flex p-0">
                          <i class="bx bx-chevron-right"></i>
                          <h2>Specification</h2>
                        </div>
                        <div className="extra-add-container">
                          {authrztn?.includes("ProductExtra-Add") && (
                            <button onClick={handleToggleAddBtn}>Add</button>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="extra-lists-container">
                      {specsData.map((data) => (
                        <div className="extra-lists">
                          <div className="extra-name">
                            <h3>{data.specification_name}</h3>
                            <i className="bx bxs-chevron-right"></i>
                          </div>
                          <div
                            className="extra-sub-options"
                            onClick={() => {
                              handleEdit(data);
                            }}
                          >
                            {data.specification_variants.map((variant) => (
                              <div className="extra-sub-container">
                                <h3>
                                  {variant.variant_name} - ₱
                                  {variant.variant_price}
                                </h3>
                              </div>
                            ))}
                          </div>
                          <div className="num-prod-link"></div>
                        </div>
                      ))}
                    </div>
                  </>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  <>
                    {/* Extra Options Fetching */}
                    <div className="extra-options-card">
                      <div className="extra-title-container ">
                        <div className="d-flex p-0">
                          <i class="bx bx-chevron-right"></i>
                          <h2>Extra Options</h2>
                        </div>
                        <div className="extra-add-container">
                          {authrztn?.includes("ProductExtra-Add") && (
                            <button onClick={handleToggleAddBtn}>Add</button>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="extra-lists-container">
                      {optionsData.map((data) => (
                        <div className="extra-lists">
                          <div className="extra-name">
                            <h3>{data.specification_name}</h3>
                            <i className="bx bxs-chevron-right"></i>
                          </div>
                          <div
                            className="extra-sub-options"
                            onClick={() => {
                              handleEdit(data);
                            }}
                          >
                            {data.specification_variants.map((variant) => (
                              <div className="extra-sub-container">
                                <h3>
                                  {variant.variant_name} - ₱
                                  {variant.variant_price}
                                </h3>
                              </div>
                            ))}
                          </div>
                          <div className="num-prod-link">
                            {/* <p htmlFor="">{spec.linked.length} Product Link</p> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                  <>
                    {/* Extra Needing Fetching*/}
                    <div className="extra-options-card">
                      <div className="extra-title-container ">
                        <div className="d-flex p-0">
                          <i class="bx bx-chevron-right"></i>
                          <h2>Extra Needing</h2>
                        </div>
                        <div className="extra-add-container">
                          {authrztn?.includes("ProductExtra-Add") && (
                            <button onClick={handleExtraToggle}>Add</button>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="extra-lists-container">
                      {extraNeedingData.map((data) => (
                        <div className="extra-lists">
                          <div className="extra-name">
                            <h3>{data.extra_name}</h3>
                            <i className="bx bxs-chevron-right"></i>
                          </div>
                          <div
                            className="extra-sub-options"
                            onClick={() => {
                              handleEditExtraNeeding(data);
                            }}
                          >
                            {data.extra_variants.map((datas) => (
                              <div className="extra-sub-container">
                                <h3>
                                  {datas.raw_material.material_name} - ₱
                                  {datas.price}
                                </h3>
                              </div>
                            ))}
                          </div>
                          <div className="num-prod-link"></div>
                        </div>
                      ))}
                    </div>
                  </>
                </CustomTabPanel>
              </div>
              <Modal show={showSpecificationModal}>
                <Modal.Body className="px-0">
                  {selectedTabLabel === "SPECIFICATION" && (
                    <>
                      {isUpdateSpecification === false && (
                        <div className="specification-add">
                          <div className="">
                            <div className="extra-title-container mb-5">
                              <h2>Add Specification</h2>
                            </div>
                            <hr />
                            <Form
                              noValidate
                              validated={validated}
                              onSubmit={add_specification}
                            >
                              <div className="spec-body-container">
                                <div className="prod-extra-input-container">
                                  <h3>Name:</h3>
                                  <Form.Control
                                    type="text"
                                    class="form-control mt-2"
                                    value={currentSpec.name}
                                    onChange={(e) =>
                                      setCurrentSpec({
                                        ...currentSpec,
                                        name: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="prod-sub-container">
                                  <h3>Sub Options:</h3>
                                  {currentSpec?.subOptions?.map(
                                    (subOption, index) => (
                                      <div className="sub-input" key={index}>
                                        <Form.Control
                                          type="text"
                                          className="mt-2 mb-0"
                                          placeholder="sub name"
                                          required
                                          value={subOption.subName}
                                          onChange={(e) =>
                                            handleSubOptionChange(
                                              index,
                                              "subName",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <Form.Control
                                          type="text"
                                          className="mt-2 mb-0"
                                          placeholder="price"
                                          value={subOption.price}
                                          onInput={(e) =>
                                            (e.target.value =
                                              e.target.value.replace(
                                                /[^0-9.]/g,
                                                ""
                                              ))
                                          }
                                          onChange={(e) =>
                                            handleSubOptionChange(
                                              index,
                                              "price",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <i
                                          className="bx bx-trash"
                                          onClick={() =>
                                            handleRemoveSubOption(index)
                                          }
                                          style={{
                                            cursor:
                                              currentSpec.subOptions.length > 1
                                                ? "pointer"
                                                : "not-allowed",
                                            opacity:
                                              currentSpec.subOptions.length > 1
                                                ? 1
                                                : 0.5,
                                          }}
                                        ></i>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="prod-add-sub">
                                  <button
                                    type="button"
                                    onClick={handleAddSubOption}
                                  >
                                    <i className="bx bx-plus"></i>Add New
                                  </button>
                                </div>
                                <div className="link-prod-container">
                                  <h3>Link Products</h3>
                                  <i
                                    class="bx bx-link"
                                    onClick={() => setLinkModal(true)}
                                  ></i>
                                </div>
                                <div className="link-selected-list d-flex">
                                  <div
                                    className="d-flex w-100 p-0"
                                    style={{ overflowY: "auto" }}
                                  >
                                    <ul className="custom-list">
                                      {selectedProducts.map((data) => (
                                        <li>
                                          {" "}
                                          <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="prod-extra-btn-container position-relative">
                                <button
                                  className="prod-c-btn"
                                  type="button"
                                  onClick={() => {
                                    setToggleAddBtn(false);
                                    setShowSpecificationModal(false);
                                  }}
                                >
                                  Cancel
                                </button>
                                <button className="prod-s-btn" type="submit">
                                  Save
                                </button>
                              </div>
                            </Form>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {selectedTabLabel === "EXTRA OPTIONS" && (
                    <>
                      {/* Extra Options */}
                      {isUpdateSpecification === false && (
                        <div className="specification-add h-100">
                          <div className="">
                            <div className="extra-title-container mb-5">
                              <h2>Add Extra Option</h2>
                            </div>
                            <hr />
                            <Form
                              noValidate
                              validated={validated}
                              onSubmit={add_specification}
                            >
                              <div className="spec-body-container">
                                <div className="prod-extra-input-container">
                                  <h3>Name:</h3>
                                  <Form.Control
                                    type="text"
                                    class="form-control mt-2"
                                    value={currentSpec.name}
                                    onChange={(e) =>
                                      setCurrentSpec({
                                        ...currentSpec,
                                        name: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div className="prod-sub-container">
                                  <h3>Sub Options:</h3>
                                  {currentSpec?.subOptions?.map(
                                    (subOption, index) => (
                                      <div className="sub-input" key={index}>
                                        <Form.Control
                                          type="text"
                                          className="mt-2 mb-0"
                                          placeholder="sub name"
                                          required
                                          value={subOption.subName}
                                          onChange={(e) =>
                                            handleSubOptionChange(
                                              index,
                                              "subName",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <Form.Control
                                          type="text"
                                          className="mt-2 mb-0"
                                          placeholder="price"
                                          value={subOption.price}
                                          onInput={(e) =>
                                            (e.target.value =
                                              e.target.value.replace(
                                                /[^0-9.]/g,
                                                ""
                                              ))
                                          }
                                          onChange={(e) =>
                                            handleSubOptionChange(
                                              index,
                                              "price",
                                              e.target.value
                                            )
                                          }
                                        />
                                        <i
                                          className="bx bx-trash"
                                          onClick={() =>
                                            handleRemoveSubOption(index)
                                          }
                                          style={{
                                            cursor:
                                              currentSpec.subOptions.length > 1
                                                ? "pointer"
                                                : "not-allowed",
                                            opacity:
                                              currentSpec.subOptions.length > 1
                                                ? 1
                                                : 0.5,
                                          }}
                                        ></i>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="prod-add-sub">
                                  <button
                                    type="button"
                                    onClick={handleAddSubOption}
                                  >
                                    <i className="bx bx-plus"></i>Add New
                                  </button>
                                </div>
                                <div className="link-prod-container">
                                  <h3>Link Products</h3>
                                  <i
                                    class="bx bx-link"
                                    onClick={() => setLinkModal(true)}
                                  ></i>
                                </div>
                                <div className="link-selected-list d-flex">
                                  <div
                                    className="d-flex w-100 p-0"
                                    style={{ overflowY: "auto" }}
                                  >
                                    <ul className="custom-list">
                                      {selectedProducts.map((data) => (
                                        <li>
                                          {" "}
                                          <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="prod-extra-btn-container position-relative">
                                <button
                                  className="prod-c-btn"
                                  type="button"
                                  onClick={() => {
                                    setToggleAddBtn(false);
                                    setShowSpecificationModal(false);
                                  }}
                                >
                                  Cancel
                                </button>
                                <button className="prod-s-btn" type="submit">
                                  Save
                                </button>
                              </div>
                            </Form>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </Modal.Body>
              </Modal>

              {/* Extra Needing Modal */}
              <Modal show={showExtraNeedingModal}>
                <Modal.Body className="px-0">
                  <>
                    {updateExtraNeeding === false && (
                      <div className="specification-add">
                        <div className="">
                          <div className="extra-title-container mb-5">
                            <h2>Add Extra Needing</h2>
                          </div>
                          <hr />
                          <Form
                            noValidate
                            validated={validated}
                            onSubmit={add_extraNeed}
                          >
                            <div className="spec-body-container">
                              <div className="prod-extra-input-container">
                                <h3>Name:</h3>
                                <Form.Control
                                  type="text"
                                  class="form-control mt-2"
                                  required
                                  value={extraSpecs.extraName}
                                  onChange={(e) =>
                                    setExtraSpecs({
                                      ...extraSpecs,
                                      extraName: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="prod-sub-container">
                                <h3>Sub Options:</h3>
                                {extraSpecs?.extraSubOptions?.map(
                                  (extraSubOptions, index) => (
                                    <div className="sub-input" key={index}>
                                      <Form.Select
                                        className="mt-2 mb-0"
                                        style={{
                                          height: "40px",
                                          fontSize: "12px",
                                        }}
                                        required
                                        value={extraSubOptions.extraSubName}
                                        onChange={(e) =>
                                          handleExtraSubOptionChange(
                                            index,
                                            "extraSubName",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="" disabled selected>
                                          Sub Name
                                        </option>
                                        {getAvailableMaterials(
                                          extraSubOptions.extraSubName
                                        ).map((data) => (
                                          <option
                                            key={data.raw_material_id}
                                            value={data.raw_material_id}
                                          >
                                            {data.material_name}
                                          </option>
                                        ))}
                                      </Form.Select>
                                      <Form.Select
                                        className="mt-2 mb-0"
                                        style={{
                                          height: "40px",
                                          fontSize: "12px",
                                        }}
                                        required
                                        value={extraSubOptions.extraUnitType}
                                        onChange={(e) =>
                                          handleExtraSubOptionChange(
                                            index,
                                            "extraUnitType",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="" disabled selected>
                                          Unit Type
                                        </option>
                                        {extraSubOptions.filteredUnits?.map(
                                          (unit) => (
                                            <option
                                              key={unit.value}
                                              value={unit.value}
                                            >
                                              {unit.value}
                                            </option>
                                          )
                                        )}
                                      </Form.Select>
                                      <Form.Control
                                        type="text"
                                        className="mt-2 mb-0"
                                        placeholder="Volume"
                                        value={extraSubOptions.extraVolume}
                                        onInput={(e) =>
                                          (e.target.value =
                                            e.target.value.replace(
                                              /[^0-9.]/g,
                                              ""
                                            ))
                                        }
                                        onChange={(e) =>
                                          handleExtraSubOptionChange(
                                            index,
                                            "extraVolume",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                      <Form.Control
                                        type="number"
                                        className="mt-2 mb-0"
                                        placeholder="Price"
                                        readOnly
                                        value={extraSubOptions.extraPrice}
                                        onChange={(e) =>
                                          handleExtraSubOptionChange(
                                            index,
                                            "extraPrice",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <i
                                        className="bx bx-trash"
                                        onClick={() =>
                                          handleRemoveExtraSubOption(index)
                                        }
                                      ></i>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="prod-add-sub">
                                <button
                                  type="button"
                                  onClick={handleExtraAddSubOption}
                                >
                                  <i className="bx bx-plus"></i>Add New
                                </button>
                              </div>
                              <div className="link-prod-container">
                                <h3>Link Products</h3>
                                <i
                                  class="bx bx-link"
                                  onClick={() => setLinkModal(true)}
                                ></i>
                              </div>
                              <div className="link-selected-list d-flex">
                                <div
                                  className="d-flex w-100 p-0"
                                  style={{ overflowY: "auto" }}
                                >
                                  <ul className="custom-list">
                                    {selectedProducts.map((data) => (
                                      <li>
                                        {" "}
                                        <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="prod-extra-btn-container position-relative">
                              <button
                                className="prod-c-btn"
                                type="button"
                                onClick={() => {
                                  setExtraToggleAdd(false);
                                  setShowExtraNeedingModal(false);
                                }}
                              >
                                Cancel
                              </button>
                              <button className="prod-s-btn" type="submit">
                                Save
                              </button>
                            </div>
                          </Form>
                        </div>
                      </div>
                    )}
                  </>
                </Modal.Body>
              </Modal>

              {/* Update Specification Modal */}
              <Modal show={showUpdateSpecificationModal} onHide={() => {
                setShowUpdateSpecificationModal(false);
              }}>
                <Modal.Body className="px-0">
                  {isUpdateSpecification ? (
                    <UpdateSpecification
                      currentSpec={currentSpec}
                      setCurrentSpec={setCurrentSpec}
                      updateIDSpecs={updateIDSpecs}
                      reloadTableSpecification={reloadTableSpecification}
                      reloadTableExtraOption={reloadTableExtraOption}
                      userId={userId}
                    />
                  ) : (
                    updateExtraNeeding && (
                      <UpdateExtraNeeding
                        currentExtra={extraSpecs}
                        setCurrentSpec={setExtraSpecs}
                        updateIDExtraNeeds={updateIDExtraNeeds}
                        reloadTableExtraNeeding={reloadTableExtraNeeding}
                        userId={userId}
                      />
                    )
                  )}
                </Modal.Body>
              </Modal>
            </>
          ) : (
            <>
              <div className="product-extra-nav">
                <div className="custom-card">
                  <div className="extra-title-container mb-5">
                    <h2>Product Extra Options</h2>
                  </div>
                  <hr />
                  <div
                    className="product-extra-tab"
                    onClick={() => handleChangeTab("Specification")}
                  >
                    <h2
                      className={`${
                        selectedTab == "Specification" ? "specify" : ""
                      }`}
                    >
                      Specification
                    </h2>
                  </div>
                  <div
                    className="product-extra-tab"
                    onClick={() => handleChangeTab("Options")}
                  >
                    <h2
                      className={`${selectedTab == "Options" ? "specify" : ""}`}
                    >
                      Extra Options
                    </h2>
                  </div>
                  <div
                    className="product-extra-tab"
                    onClick={() => handleChangeTab("Needing")}
                  >
                    <h2
                      className={`${selectedTab == "Needing" ? "specify" : ""}`}
                    >
                      Extra Needing
                    </h2>
                  </div>
                </div>
              </div>
              <div className="product-extra-specification">
                <div className="custom-card">
                  {/* Specification */}
                  {selectedTab == "Specification" ? (
                    <>
                      {/* Specification Fetching */}
                      <div className="specification-card">
                        <div className="extra-title-container ">
                          <div className="d-flex p-0">
                            <i class="bx bx-chevron-right"></i>
                            <h2>Specification</h2>
                          </div>
                          <div className="extra-add-container">
                            {authrztn?.includes("ProductExtra-Add") && (
                              <button onClick={handleToggleAddBtn}>Add</button>
                            )}
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="extra-lists-container">
                        {specsData.map((data) => (
                          <div className="extra-lists">
                            <div className="extra-name">
                              <h3>{data.specification_name}</h3>
                              <i className="bx bxs-chevron-right"></i>
                            </div>
                            <div
                              className="extra-sub-options"
                              onClick={() => {
                                handleEdit(data);
                              }}
                            >
                              {data.specification_variants.map((variant) => (
                                <div className="extra-sub-container">
                                  <h3>
                                    {variant.variant_name} - ₱
                                    {variant.variant_price}
                                  </h3>
                                </div>
                              ))}
                            </div>
                            <div className="num-prod-link"></div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : selectedTab == "Options" ? (
                    <>
                      {/* Extra Options Fetching */}
                      <div className="extra-options-card">
                        <div className="extra-title-container ">
                          <div className="d-flex p-0">
                            <i class="bx bx-chevron-right"></i>
                            <h2>Extra Options</h2>
                          </div>
                          <div className="extra-add-container">
                            {authrztn?.includes("ProductExtra-Add") && (
                              <button onClick={handleToggleAddBtn}>Add</button>
                            )}
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="extra-lists-container">
                        {optionsData.map((data) => (
                          <div className="extra-lists">
                            <div className="extra-name">
                              <h3>{data.specification_name}</h3>
                              <i className="bx bxs-chevron-right"></i>
                            </div>
                            <div
                              className="extra-sub-options"
                              onClick={() => {
                                handleEdit(data);
                              }}
                            >
                              {data.specification_variants.map((variant) => (
                                <div className="extra-sub-container">
                                  <h3>
                                    {variant.variant_name} - ₱
                                    {variant.variant_price}
                                  </h3>
                                </div>
                              ))}
                            </div>
                            <div className="num-prod-link">
                              {/* <p htmlFor="">{spec.linked.length} Product Link</p> */}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Extra Needing Fetching*/}
                      <div className="extra-options-card">
                        <div className="extra-title-container ">
                          <div className="d-flex p-0">
                            <i class="bx bx-chevron-right"></i>
                            <h2>Extra Needing</h2>
                          </div>
                          <div className="extra-add-container">
                            {authrztn?.includes("ProductExtra-Add") && (
                              <button onClick={handleExtraToggle}>Add</button>
                            )}
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="extra-lists-container">
                        {extraNeedingData.map((data) => (
                          <div className="extra-lists">
                            <div className="extra-name">
                              <h3>{data.extra_name}</h3>
                              <i className="bx bxs-chevron-right"></i>
                            </div>
                            <div
                              className="extra-sub-options"
                              onClick={() => {
                                handleEditExtraNeeding(data);
                              }}
                            >
                              {data.extra_variants.map((datas) => (
                                <div className="extra-sub-container">
                                  <h3>
                                    {datas.raw_material.material_name} - ₱
                                    {datas.price}
                                  </h3>
                                </div>
                              ))}
                            </div>
                            <div className="num-prod-link"></div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          <>
            {/* add specification */}
            <div
              className={`product-extra-add ${windowWidth < 1201 && "d-none"}`}
            >
              {isUpdateSpecification === true ? (
                <UpdateSpecification
                  currentSpec={currentSpec}
                  setCurrentSpec={setCurrentSpec}
                  updateIDSpecs={updateIDSpecs}
                  reloadTableSpecification={reloadTableSpecification}
                  reloadTableExtraOption={reloadTableExtraOption}
                  userId={userId}
                />
              ) : (
                updateExtraNeeding === true && (
                  <UpdateExtraNeeding
                    currentExtra={extraSpecs}
                    setCurrentSpec={setExtraSpecs}
                    updateIDExtraNeeds={updateIDExtraNeeds}
                    reloadTableExtraNeeding={reloadTableExtraNeeding}
                    userId={userId}
                  />
                )
              )}

              {toggleAddBtn && selectedTab == "Specification" ? (
                <>
                  {isUpdateSpecification === false && (
                    <div className="specification-add">
                      <div className="custom-card ">
                        <div className="extra-title-container mb-5">
                          <h2>Add Specification</h2>
                        </div>
                        <hr />
                        <Form
                          noValidate
                          validated={validated}
                          onSubmit={add_specification}
                        >
                          <div className="spec-body-container">
                            <div className="prod-extra-input-container">
                              <h3>Name:</h3>
                              <Form.Control
                                type="text"
                                class="form-control mt-2"
                                value={currentSpec.name}
                                onChange={(e) =>
                                  setCurrentSpec({
                                    ...currentSpec,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="prod-sub-container">
                              <h3>Sub Options:</h3>
                              {currentSpec.subOptions.map(
                                (subOption, index) => (
                                  <div className="sub-input" key={index}>
                                    <Form.Control
                                      type="text"
                                      className="mt-2 mb-0"
                                      placeholder="sub name"
                                      required
                                      value={subOption.subName}
                                      onChange={(e) =>
                                        handleSubOptionChange(
                                          index,
                                          "subName",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <Form.Control
                                      type="text"
                                      className="mt-2 mb-0"
                                      placeholder="price"
                                      value={subOption.price}
                                      onInput={(e) =>
                                        (e.target.value =
                                          e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                          ))
                                      }
                                      onChange={(e) =>
                                        handleSubOptionChange(
                                          index,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <i
                                      className="bx bx-trash"
                                      onClick={() =>
                                        handleRemoveSubOption(index)
                                      }
                                      style={{
                                        cursor:
                                          currentSpec.subOptions.length > 1
                                            ? "pointer"
                                            : "not-allowed",
                                        opacity:
                                          currentSpec.subOptions.length > 1
                                            ? 1
                                            : 0.5,
                                      }}
                                    ></i>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="prod-add-sub">
                              <button
                                type="button"
                                onClick={handleAddSubOption}
                              >
                                <i className="bx bx-plus"></i>Add New
                              </button>
                            </div>
                            <div className="link-prod-container">
                              <h3>Link Products</h3>
                              <i
                                class="bx bx-link"
                                onClick={() => setLinkModal(true)}
                              ></i>
                            </div>
                            <div className="link-selected-list d-flex">
                              <div
                                className="d-flex w-100 p-0"
                                style={{ overflowY: "auto" }}
                              >
                                <ul className="custom-list">
                                  {selectedProducts.map((data) => (
                                    <li>
                                      {" "}
                                      <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="prod-extra-btn-container">
                            <button
                              className="prod-c-btn"
                              type="button"
                              onClick={() => setToggleAddBtn(false)}
                            >
                              Cancel
                            </button>
                            <button className="prod-s-btn" type="submit">
                              Save
                            </button>
                          </div>
                        </Form>
                      </div>
                    </div>
                  )}
                </>
              ) : toggleAddBtn && selectedTab == "Options" ? (
                <>
                  {/* Extra Options */}
                  {isUpdateSpecification === false && (
                    <div className="specification-add">
                      <div className="custom-card ">
                        <div className="extra-title-container mb-5">
                          <h2>Add Extra Option</h2>
                        </div>
                        <hr />
                        <Form
                          noValidate
                          validated={validated}
                          onSubmit={add_specification}
                        >
                          <div className="spec-body-container">
                            <div className="prod-extra-input-container">
                              <h3>Name:</h3>
                              <Form.Control
                                type="text"
                                class="form-control mt-2"
                                value={currentSpec.name}
                                onChange={(e) =>
                                  setCurrentSpec({
                                    ...currentSpec,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="prod-sub-container">
                              <h3>Sub Options:</h3>
                              {currentSpec.subOptions.map(
                                (subOption, index) => (
                                  <div className="sub-input" key={index}>
                                    <Form.Control
                                      type="text"
                                      className="mt-2 mb-0"
                                      placeholder="sub name"
                                      required
                                      value={subOption.subName}
                                      onChange={(e) =>
                                        handleSubOptionChange(
                                          index,
                                          "subName",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <Form.Control
                                      type="text"
                                      className="mt-2 mb-0"
                                      placeholder="price"
                                      value={subOption.price}
                                      onInput={(e) =>
                                        (e.target.value =
                                          e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                          ))
                                      }
                                      onChange={(e) =>
                                        handleSubOptionChange(
                                          index,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <i
                                      className="bx bx-trash"
                                      onClick={() =>
                                        handleRemoveSubOption(index)
                                      }
                                      style={{
                                        cursor:
                                          currentSpec.subOptions.length > 1
                                            ? "pointer"
                                            : "not-allowed",
                                        opacity:
                                          currentSpec.subOptions.length > 1
                                            ? 1
                                            : 0.5,
                                      }}
                                    ></i>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="prod-add-sub">
                              <button
                                type="button"
                                onClick={handleAddSubOption}
                              >
                                <i className="bx bx-plus"></i>Add New
                              </button>
                            </div>
                            <div className="link-prod-container">
                              <h3>Link Products</h3>
                              <i
                                class="bx bx-link"
                                onClick={() => setLinkModal(true)}
                              ></i>
                            </div>
                            <div className="link-selected-list d-flex">
                              <div
                                className="d-flex w-100 p-0"
                                style={{ overflowY: "auto" }}
                              >
                                <ul className="custom-list">
                                  {selectedProducts.map((data) => (
                                    <li>
                                      {" "}
                                      <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="prod-extra-btn-container">
                            <button
                              className="prod-c-btn"
                              type="button"
                              onClick={() => setToggleAddBtn(false)}
                            >
                              Cancel
                            </button>
                            <button className="prod-s-btn" type="submit">
                              Save
                            </button>
                          </div>
                        </Form>
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              {extraToggleAdd && selectedTab == "Needing" ? (
                <>
                  {updateExtraNeeding === false && (
                    <div className="specification-add">
                      <div className="custom-card ">
                        <div className="extra-title-container mb-5">
                          <h2>Add Extra Needing</h2>
                        </div>
                        <hr />
                        <Form
                          noValidate
                          validated={validated}
                          onSubmit={add_extraNeed}
                        >
                          <div className="spec-body-container">
                            <div className="prod-extra-input-container">
                              <h3>Name:</h3>
                              <Form.Control
                                type="text"
                                class="form-control mt-2"
                                required
                                value={extraSpecs.extraName}
                                onChange={(e) =>
                                  setExtraSpecs({
                                    ...extraSpecs,
                                    extraName: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="prod-sub-container">
                              <h3>Sub Options:</h3>
                              {extraSpecs?.extraSubOptions?.map(
                                (extraSubOptions, index) => (
                                  <div className="sub-input" key={index}>
                                    <Form.Select
                                      className="mt-2 mb-0"
                                      style={{
                                        height: "40px",
                                        fontSize: "12px",
                                      }}
                                      required
                                      value={extraSubOptions.extraSubName}
                                      onChange={(e) =>
                                        handleExtraSubOptionChange(
                                          index,
                                          "extraSubName",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="" disabled selected>
                                        Sub Name
                                      </option>
                                      {getAvailableMaterials(
                                        extraSubOptions.extraSubName
                                      ).map((data) => (
                                        <option
                                          key={data.raw_material_id}
                                          value={data.raw_material_id}
                                        >
                                          {data.material_name}
                                        </option>
                                      ))}
                                    </Form.Select>
                                    <Form.Select
                                      className="mt-2 mb-0"
                                      style={{
                                        height: "40px",
                                        fontSize: "12px",
                                      }}
                                      required
                                      value={extraSubOptions.extraUnitType}
                                      onChange={(e) =>
                                        handleExtraSubOptionChange(
                                          index,
                                          "extraUnitType",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="" disabled selected>
                                        Unit Type
                                      </option>
                                      {extraSubOptions.filteredUnits?.map(
                                        (unit) => (
                                          <option
                                            key={unit.value}
                                            value={unit.value}
                                          >
                                            {unit.value}
                                          </option>
                                        )
                                      )}
                                    </Form.Select>
                                    <Form.Control
                                      type="text"
                                      className="mt-2 mb-0"
                                      placeholder="Volume"
                                      value={extraSubOptions.extraVolume}
                                      onInput={(e) =>
                                        (e.target.value =
                                          e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                          ))
                                      }
                                      onChange={(e) =>
                                        handleExtraSubOptionChange(
                                          index,
                                          "extraVolume",
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                    <Form.Control
                                      type="number"
                                      className="mt-2 mb-0"
                                      placeholder="Price"
                                      readOnly
                                      value={extraSubOptions.extraPrice}
                                      onChange={(e) =>
                                        handleExtraSubOptionChange(
                                          index,
                                          "extraPrice",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <i
                                      className="bx bx-trash"
                                      onClick={() =>
                                        handleRemoveExtraSubOption(index)
                                      }
                                    ></i>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="prod-add-sub">
                              <button
                                type="button"
                                onClick={handleExtraAddSubOption}
                              >
                                <i className="bx bx-plus"></i>Add New
                              </button>
                            </div>
                            <div className="link-prod-container">
                              <h3>Link Products</h3>
                              <i
                                class="bx bx-link"
                                onClick={() => setLinkModal(true)}
                              ></i>
                            </div>
                            <div className="link-selected-list d-flex">
                              <div
                                className="d-flex w-100 p-0"
                                style={{ overflowY: "auto" }}
                              >
                                <ul className="custom-list">
                                  {selectedProducts.map((data) => (
                                    <li>
                                      {" "}
                                      <span className="h3">{`(${data.prod_sku}) ${data.prod_name}`}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="prod-extra-btn-container">
                            <button
                              className="prod-c-btn"
                              type="button"
                              onClick={() => setExtraToggleAdd(false)}
                            >
                              Cancel
                            </button>
                            <button className="prod-s-btn" type="submit">
                              Save
                            </button>
                          </div>
                        </Form>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
            marginTop: "10%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}

      <Modal show={linkModal} size="xl" onHide={() => setLinkModal(false)}>
        <div className="modal-category p-1">
          <h2>Link Product</h2>
          <div className="link-list-container">
            <div className="cat-list-container">
              {Category.map((category, index) => (
                <div
                  className={`form-cat-container ${
                    selectedCategory === category.category_id ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    handleCategoryClick(category.category_id);
                  }}
                >
                  <div className="d-flex">
                    <h3>{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="form-prod-container">
              <input
                type="checkbox"
                id="checkbox-all"
                checked={selectedProducts.length === product.length}
                onChange={handleAllCheckboxChange}
              />
              <label htmlFor="checkbox-all">All</label>
            </div> */}
            <div className="prod-list-container">
              <div className="form-check-container">
                {product.map((p, index) => (
                  <div className="form-prod-container" key={index}>
                    <input
                      type="checkbox"
                      id={`checkbox-${p.product.product_id}`}
                      checked={selectedProducts.some(
                        (item) => item.prod_id === p.product.product_id
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          p.product.product_id,
                          p.product.name,
                          p.product.sku
                        )
                      }
                    />
                    <label htmlFor={`checkbox-${p.product.product_id}`}>
                      {p.product.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="lower-link-container">
                <label htmlFor="">{selectedProducts.length} selected</label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductExtraOptions;
