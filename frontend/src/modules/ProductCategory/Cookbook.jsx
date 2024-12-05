import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import { Button, Modal, Form } from "react-bootstrap";
import "../styles/cookbook.css";
import noData from "../../assets/icon/no-data.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import productUnits from "../../assets/global/unit";
import swal from "sweetalert";
// import "../styles/pos_react.css";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";

const Cookbook = ({ authrztn }) => {
  const [userId, setuserId] = useState("");
  const [showCookModal, setShowCookModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showEditCookModal, setShowEditCookModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [dishesData, setDishesData] = useState([]);
  const [rawMatsData, setRawMatsData] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedDish, setSelectedDish] = useState([]);
  const [selectedRawMaterials, setSelectedRawMaterials] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [editRawMaterials, setEditRawMaterials] = useState([]);
  const [originalRawMaterialIds, setOriginalRawMaterialIds] = useState([]);
  const [cookBookID, setCookBookID] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [searchRaw, setSearchRaw] = useState("");

  const [cookBookData, setCookBookData] = useState([]);
  const [cookNumber, setCookNumber] = useState("");

  const [loadingBtn, setLoadingBtn] = useState(false);

  const generateRandomCode = async () => {
    try {
      const randomLetters = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

      const referenceCode = `${randomLetters}`;
      setCookNumber(referenceCode);
    } catch (error) {
      console.error(error);
    }
  };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    generateRandomCode();
    decodeToken();
  }, []);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRawMaterials([]);
    } else {
      setSelectedRawMaterials(rawMatsData);
    }
    setAllSelected(!allSelected);
  };

  // const handleSelectRow = (row) => {
  //   if (selectedRawMaterials.includes(row)) {
  //     setSelectedRawMaterials(
  //       selectedRawMaterials.filter((item) => item !== row)
  //     );
  //   } else {
  //     setSelectedRawMaterials([...selectedRawMaterials, row]);
  //   }
  // };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchRawChange = (e) => {
    setSearchRaw(e.target.value);
  };

  const handleSelectRow = (row) => {
    if (
      selectedRawMaterials.some(
        (selectedRaw) =>
          selectedRaw.raw_material.raw_material_id ===
          row.raw_material.raw_material_id
      )
    ) {
      setSelectedRawMaterials(
        selectedRawMaterials.filter(
          (selectedRaw) =>
            selectedRaw.raw_material.raw_material_id !==
            row.raw_material.raw_material_id
        )
      );
    } else {
      setSelectedRawMaterials([...selectedRawMaterials, row]);
    }
  };

  const columns = [
    {
      name: "COOKBOOK ID",
      selector: (row) => row.cook_book_number_id,
    },
    {
      name: "DISHES NAME",
      selector: (row) => row.product.name,
    },
    {
      name: "SALE PRICE",
      selector: (row) => row.product.price,
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
    },
    {
      name: "ESTIMATED COST PRICE",
      selector: (row) => {
        const totalAverageCost = row.dish_raw_materials.reduce(
          (total, material) => total + material.average_cost,
          0
        );

        return totalAverageCost.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
    // {
    //   name: "OPERATE",
    //   selector: (row) => row.operate,
    //   cell: (row) => (
    //     <div
    //       style={{
    //         color: row.operate == false ? "red" : "blue",
    //       }}
    //       onClick={() => handleOperate(row.cook_book_id, row.operate)}
    //     >
    //       {row.operate == false ? "Close" : "Open"}
    //     </div>
    //   ),
    // },
  ];

  const dishDataColumn = [
    {
      name: "...",
      cell: (row) => (
        <div>
          <input
            type="radio"
            className="form-check-input radio-input"
            style={{ position: "relative", left: "7px" }}
            name="dishSelection"
            value={row.product}
            onChange={() => handleSelectDish(row.product)}
            checked={selectedDish.some(
              (selectedRaw) => selectedRaw.product_id === row.product.product_id
            )}
          />
        </div>
      ),
    },
    {
      name: "DISHES NAME",
      selector: (row) => row.product.name,
    },
    {
      name: "SALE PRICE",
      selector: (row) => row.product.price,
    },
  ];

  const rawMatsColumn = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={allSelected}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          onChange={() => handleSelectRow(row)}
          // checked={selectedRawMaterials.includes(row.raw_material)}
          checked={selectedRawMaterials.some(
            (selectedRaw) =>
              selectedRaw.raw_material.raw_material_id ===
              row.raw_material.raw_material_id
          )}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "STOCK ID",
      selector: (row) => row.raw_material.sku,
    },
    {
      name: "STOCK NAME",
      selector: (row) => row.raw_material.material_name,
    },
    {
      name: "STOCK TYPE",
      selector: (row) => row.raw_material.unit_type,
    },
  ];

  const selectedDishColumn = [
    {
      name: "SKU ID",
      selector: (row) => row.sku,
    },
    {
      name: "DISH NAME",
      selector: (row) => row.name,
    },
    {
      name: "SALE PRICE",
      selector: (row) => row.price,
    },
  ];

  const editSelectedRawMats = editRawMaterials.map((selectedRaw, index) => ({
    ...selectedRaw,
    index,
  }));

  const editRawMaterialsColumn = [
    {
      name: "",
      cell: (row) => (
        <input
          type="checkbox"
          onChange={() => handleEditCheckboxChange(row)}
          checked={editRawMaterials.some(
            (selectedRaw) =>
              selectedRaw.raw_material_id === row.raw_material.raw_material_id
          )}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "STOCK ID",
      selector: (row) => row.raw_material.sku,
      sortable: true,
    },
    {
      name: "STOCK NAME",
      selector: (row) => row.raw_material.material_name,
      sortable: true,
    },
    {
      name: "STOCK TYPE",
      selector: (row) => row.raw_material.unit_type,
      sortable: true,
    },
  ];

  useEffect(() => {
    console.log("Edit Raw maats", editSelectedRawMats);
    console.log("Selected Raw mats", selectedRawMaterials);
  }, [editSelectedRawMats, selectedRawMaterials]);

  const editSelectedRawMatsColumn = [
    {
      name: "STOCK ID",
      selector: (row) => row.raw_material.sku,
      sortable: true,
    },
    {
      name: "STOCK NAME",
      selector: (row) => row.raw_material.material_name,
      sortable: true,
    },
    {
      name: "UNIT TYPE",
      selector: (row) => row.raw_material.unit_type,
      sortable: true,
    },
    {
      name: "UNIT",
      cell: (row) => (
        <select
          className="form-control mb-0"
          required
          onChange={(e) => handleUnitChange(row.index, e.target.value)}
          value={row.unit}
          style={{ fontSize: "1.2rem", color: "#000", height: "40px" }}
          disabled={row.new ? false : true}
        >
          <option disabled value="" selected>
            Select Unit
          </option>
          {filterUnits(row.raw_material.unit_type).map((unit, index) => (
            <option key={index} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      name: "VOLUME",
      cell: (row) => (
        <input
          type="number"
          className="form-control mb-0"
          value={row.volume}
          onChange={(e) => handleVolumeChange(row.index, e.target.value)}
          disabled={row.new ? false : true}
        />
      ),
    },
    {
      name: "AVERAGE COST",
      selector: (row) => getCost(row).toFixed(2),
      sortable: true,
    },
    {
      name: "ACTION",
      cell: (row) => (
        <span
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => handleDeleteRawMats(row.raw_material.raw_material_id)}
        >
          Delete
        </span>
      ),
    },
  ];

  const handleOpenDish = () => {
    setShowDishModal(true);
    setShowCookModal(false);
  };

  const handleCloseDish = () => {
    setShowDishModal(false);
    setShowCookModal(true);
    setRawMatsData([]);
    setSelectedDish([]);
    setSelectedRawMaterials([]);
  };

  const handleCloseEditStockModal = () => {
    setShowEditStockModal(false);
    setShowEditCookModal(true);
  };
  const handleOpenStock = () => {
    setShowStockModal(true);
    setShowCookModal(false);
  };
  const handleCloseStock = () => {
    setShowStockModal(false);
    setShowCookModal(true);
  };

  const handleSaveDish = () => {
    setShowDishModal(false);
    setShowCookModal(true);
  };

  const handleSaveRawMats = () => {
    setShowStockModal(false);
    setShowCookModal(true);
  };

  const handleCloseEditCookModal = () => {
    setShowEditCookModal(false);
    setSelectedRawMaterials([]);
    setSelectedDish([]);
  };

  const handleOpenEditStock = () => {
    setShowEditStockModal(true);
    setShowCookModal(false);
  };

  const handleCloseCookModal = () => {
    setShowCookModal(false);
    setSelectedRawMaterials([]);
    setSelectedDish([]);
  };

  const handleEditSaveRawMats = () => {
    setShowEditStockModal(false);
    setShowEditCookModal(true);
  };

  // useEffect(() => {
  //   const handleFetchDishes = async () => {
  //     const res = await axios.get(
  //       `${BASE_URL}/fetchInventoryCategory`,
  //       {
  //         params: {
  //           Idcategory: selectedCategory,
  //         },
  //       }
  //     );
  //     // const res = await axios.get(`${BASE_URL}/cook_book/fetchProduct`);
  //     // setDishesData(res.data);
  //     console.log("Categ Prod", res.data);
  //   };

  //   handleFetchDishes();
  // }, [showCookModal, showEditCookModal]);

  const handleFetchRawMats = async () => {
    const res = await axios.get(`${BASE_URL}/rawmaterial/getRawmaterial`);
    setRawMatsData(res.data);
  };
  useEffect(() => {
    handleFetchRawMats();
  }, [showStockModal, showEditStockModal]);

  const handleFetchCookBook = async () => {
    const res = await axios.get(`${BASE_URL}/cook_book/fetchCookBook`);
    setCookBookData(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchCookBook();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredCookBook = cookBookData.filter(
    (item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cook_book_number_id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.product.price.toString().includes(searchQuery)
  );

  const filteredRawMaterials = rawMatsData.filter((item) =>
    item.raw_material.material_name
      .toLowerCase()
      .includes(searchRaw.toLowerCase())
  );

  const handleEditCheckboxChange = (raw) => {
    setEditRawMaterials((prevSelectedID) => {
      if (
        prevSelectedID.length === 1 &&
        prevSelectedID[0].raw_material_id === raw.raw_material_id
      ) {
        swal({
          title: "You need to put at least one ingredient to this dish!",
          icon: "error",
          button: "OK",
        });
        return prevSelectedID;
      } else {
        const isAlreadySelected = prevSelectedID.some(
          (selectedRaw) =>
            selectedRaw.raw_material_id === raw.raw_material.raw_material_id
        );

        if (isAlreadySelected) {
          return prevSelectedID.filter(
            (selectedRaw) =>
              selectedRaw.raw_material_id !== raw.raw_material.raw_material_id
          );
        } else {
          return [
            ...prevSelectedID,
            {
              average_cost: raw.average_cost,
              cook_book_id: cookBookID,
              createdAt: raw.createdAt,
              dish_raw_material_id: raw.dish_raw_material_id || null,
              raw_material: raw.raw_material,
              raw_material_id: raw.raw_material.raw_material_id,
              status: raw.status,
              unit: raw.unit,
              updatedAt: raw.updatedAt,
              volume: raw.volume,
              quantity: raw.quantity,
              new: "new",
            },
          ];
        }
      }
    });
  };
  const handleDeleteRawMats = (id) => {
    if (showEditCookModal) {
      if (editRawMaterials.length == 1) {
        swal({
          title: "You need to put atleast one ingredient to this dish!",
          icon: "error",
          button: "OK",
        });
        return;
      }
      const updatedMaterials = editRawMaterials.filter(
        (material) => material.raw_material_id !== id
      );
      setEditRawMaterials(updatedMaterials);
    } else {
      const updatedMaterials = selectedRawMaterials.filter(
        (material) => material.raw_material.raw_material_id !== id
      );
      setSelectedRawMaterials(updatedMaterials);
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
  const handleShowEditCookBook = async (cookbook) => {
    if (authrztn?.includes("CookBook-Edit")) {
      setShowEditCookModal(true);
      const res = await axios.get(
        `${BASE_URL}/cook_book/fetchSpecificCookBook/${cookbook.cook_book_id}`
      );

      setSelectedDish([res.data.product]);
      setEditRawMaterials(res.data.dish_raw_materials);
      // setSelectedRawMaterials(res.data.dish_raw_materials);

      setOriginalRawMaterialIds(
        res.data.dish_raw_materials.map((material) => material.raw_material_id)
      );
      setCookBookID(cookbook.cook_book_id);
    }
  };

  const handleUnitChange = (rowIndex, unit) => {
    if (showEditCookModal) {
      setEditRawMaterials((prevState) =>
        prevState.map((selectedRaw, index) =>
          index === rowIndex ? { ...selectedRaw, unit: unit } : selectedRaw
        )
      );
    } else {
      setSelectedRawMaterials((prevState) =>
        prevState.map((selectedRaw, index) =>
          index === rowIndex
            ? { ...selectedRaw, selectedUnit: unit }
            : selectedRaw
        )
      );
    }
  };

  useEffect(() => {
    console.log("Raw mats", rawMatsData);
    console.log("Slected Raw Mats", selectedRawMaterials);
  }, [rawMatsData, selectedRawMaterials]);

  const handleVolumeChange = (rowIndex, volume) => {
    // const selectedRaw = selectedRawMaterials[rowIndex];

    const selectedRaw = showEditCookModal
      ? editSelectedRawMats[rowIndex]
      : selectedRawMaterials[rowIndex];

    const inventoryStock = rawMatsData.find(
      (rawMat) =>
        rawMat.raw_material.raw_material_id ===
        selectedRaw.raw_material.raw_material_id
    );

    if (!inventoryStock) {
      return;
    }

    const stockQuantity = inventoryStock.quantity;
    const unitType = selectedRaw.raw_material.unit_type;

    const unit = showEditCookModal
      ? selectedRaw.unit
      : selectedRaw.selectedUnit;

    let convertedVolume = parseFloat(volume);

    if (unitType === "Kg") {
      if (unit === "g") {
        convertedVolume = volume * 0.001;
      } else if (unit === "lbs") {
        convertedVolume = volume * 0.453592;
      } else if (unit === "oz") {
        // Convert ounces to Kg (1 oz = 0.0283495 Kg)
        convertedVolume = volume * 0.0283495;
      }
    } else if (unitType === "L") {
      if (unit === "mL") {
        // Convert mL to L
        convertedVolume = volume * 0.001;
      }
    }

    if (convertedVolume > stockQuantity) {
      swal({
        icon: "error",
        title: "Exceeded Stock",
        text: `You have exceeded the available stock of ${stockQuantity} ${unitType}.`,
      }).then(() => {
        if (showEditCookModal) {
          setEditRawMaterials((prevState) =>
            prevState.map((selectedRaw, index) =>
              index === rowIndex ? { ...selectedRaw, volume: "" } : selectedRaw
            )
          );
        } else {
          setSelectedRawMaterials((prevState) =>
            prevState.map((selectedRaw, index) =>
              index === rowIndex ? { ...selectedRaw, volume: "" } : selectedRaw
            )
          );
        }
      });
    } else {
      if (showEditCookModal) {
        setEditRawMaterials((prevState) =>
          prevState.map((selectedRaw, index) =>
            index === rowIndex
              ? { ...selectedRaw, volume: parseFloat(volume) }
              : selectedRaw
          )
        );
      } else {
        setSelectedRawMaterials((prevState) =>
          prevState.map((selectedRaw, index) =>
            index === rowIndex
              ? { ...selectedRaw, volume: parseFloat(volume) }
              : selectedRaw
          )
        );
      }
    }
  };

  const conversionRates = {
    L: 1,
    mL: 0.001,
    Kg: 1,
    g: 0.001,
    oz: 0.0295735,
    lbs: 0.453592,
    pcs: 1,
  };

  const gramRates = {
    g: 1,
    oz: 0.035274,
    lbs: 0.00220462,
  };

  const milimeterRates = {
    mL: 1,
    oz: 0.033814,
  };
  const literRates = {
    L: 1,
    mL: 0.001,
    oz: 0.033814,
  };
  const getCost = (selectedRaw) => {
    if (
      !selectedRaw.volume ||
      (!showEditCookModal && !selectedRaw.selectedUnit) ||
      (showEditCookModal && !selectedRaw.unit) ||
      (!showEditCookModal && !selectedRaw.raw_material.unit_price) ||
      (showEditCookModal && !selectedRaw.raw_material.unit_price)
    ) {
      return 0;
    }

    const rawMatUnit = selectedRaw.raw_material.unit_type;
    const unit = showEditCookModal
      ? selectedRaw.unit
      : selectedRaw.selectedUnit;
    const unitPrice = showEditCookModal
      ? selectedRaw.raw_material.unit_price
      : selectedRaw.raw_material.unit_price;

    let conversionRate;
    if (rawMatUnit == "g") {
      conversionRate = gramRates[unit];
    } else if (rawMatUnit == "mL") {
      conversionRate = milimeterRates[unit];
    } else if (rawMatUnit == "L") {
      conversionRate = literRates[unit];
    } else {
      conversionRate = conversionRates[unit];
    }

    const volumeInBaseUnit = selectedRaw.volume * conversionRate;

    return volumeInBaseUnit * unitPrice;
  };

  // const getEditCost = (selectedRaw) => {
  //   if (
  //     !selectedRaw.volume ||
  //     !selectedRaw.unit ||
  //     !selectedRaw.raw_material.unit_price
  //   ) {
  //     return 0;
  //   }

  //   const volumeInLiters =
  //     selectedRaw.volume * conversionRates[selectedRaw.unit];
  //   return volumeInLiters * selectedRaw.raw_material.unit_price;
  // };

  const handleSelectDish = async (dish) => {
    const res = await axios.get(
      `${BASE_URL}/cook_book/checkDish/${dish.product_id}`
    );
    if (res.status == 200) {
      setSelectedDish([dish]);
    } else {
      swal({
        title: "Error",
        text: "This Dish is already at the cook book.",
        icon: "error",
        button: "OK",
      });
    }
  };

  const handleSaveCookBook = async () => {
    if (selectedDish == "") {
      swal({
        title: "Error",
        text: "Please select a Dish first.",
        icon: "error",
        button: "OK",
      });
      return;
    }

    if (selectedRawMaterials.length == 0) {
      swal({
        title: "Error",
        text: "Please select a raw materials for this dish ",
        icon: "error",
        button: "OK",
      });
      return;
    }

    try {
      const rawMaterialCosts = selectedRawMaterials.map((selectedRaw) => ({
        ...selectedRaw,
        cost: getCost(selectedRaw),
      }));

      const hasMissingData = rawMaterialCosts.some(
        (rawMaterial) => !rawMaterial.selectedUnit || !rawMaterial.cost
      );

      if (hasMissingData) {
        swal({
          title: "Error",
          text: "Some raw materials are missing unit or cost.",
          icon: "error",
          button: "OK",
        });
        return;
      }
      const selected = selectedDish[0];

      setLoadingBtn(true);

      const res = await axios.post(`${BASE_URL}/cook_book/create-cook`, {
        selectedRawMaterials: rawMaterialCosts,
        selectedDish: selected,
        cookNumber,
        userId,
      });
      if (res.status == 200) {
        swal({
          title: "Cook Book Added Successfully!",
          text: "The new cook book has been added successfully.",
          icon: "success",
          button: "OK",
        }).then(() => {
          setSelectedDish([]);
          setSelectedRawMaterials([]);
          setShowCookModal(false);
          setLoadingBtn(false);
          handleFetchCookBook();
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateCookBook = async () => {
    if (editRawMaterials.length === 0) {
      swal({
        title: "You need to put atleast one ingredient to this dish!",
        icon: "error",
        button: "OK",
      });
      return;
    }
    const hasMissingData = editRawMaterials.some(
      (rawMaterial) => !rawMaterial.unit || !rawMaterial.volume
    );

    if (hasMissingData) {
      swal({
        title: "Error",
        text: "Some raw materials are missing unit or cost.",
        icon: "error",
        button: "OK",
      });
      return;
    }
    const updatedRawMaterials = editRawMaterials.map((material) => ({
      cook_book_id: material.cook_book_id,
      dish_raw_material_id: material.dish_raw_material_id,
      raw_material_id: material.raw_material_id,
      unit: material.unit,
      volume: material.volume,
      average_cost: getCost(material),
      raw_material: material.raw_material,
    }));

    const currentRawMaterialIds = editRawMaterials.map(
      (material) => material.raw_material_id
    );

    const idsToMarkInactive = originalRawMaterialIds.filter(
      (id) => !currentRawMaterialIds.includes(id)
    );

    setLoadingBtn(true);
    const res = await axios.put(`${BASE_URL}/cook_book/updateCookBook`, {
      updatedRawMaterials,
      idsToMarkInactive,
      userId,
    });

    if (res.status == 200) {
      swal({
        title: "Cook Book Updated Successfully!",
        text: "The cook book has been updated successfully.",
        icon: "success",
        button: "OK",
      }).then(() => {
        setShowEditCookModal(false);
        setEditRawMaterials([]);
        setSelectedDish([]);
        setLoadingBtn(false);
        handleFetchCookBook();
      });
    }
  };

  const handleOperate = async (cookBookId, currentOperate) => {
    try {
      const newOperateStatus = !currentOperate;

      await axios.put(`${BASE_URL}/cook_book/updateOperateStatus`, {
        cook_book_id: cookBookId,
        operate: newOperateStatus,
      });

      handleFetchCookBook();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFetchCategory = async () => {
    const res = await axios.get(`${BASE_URL}/category/getCategory`);

    console.log("Categories", res.data);
    setCategories(res.data);
  };

  useEffect(() => {
    handleFetchCategory();
  }, []);

  const handleSetCategory = async (e) => {
    const res = await axios.get(
      `${BASE_URL}/category_product/fetchInventoryCategory`,
      {
        params: {
          Idcategory: e.target.value,
        },
      }
    );

    setDishesData(res.data);
  };

  const selectedRawMatsdata = selectedRawMaterials.map(
    (selectedRaw, index) => ({
      ...selectedRaw,
      index,
    })
  );

  const selectedRawMatsColumn = [
    {
      name: "STOCK ID",
      selector: (row) => row.raw_material.sku,
      sortable: true,
    },
    {
      name: "STOCK NAME",
      selector: (row) => row.raw_material.material_name,
      sortable: true,
    },
    {
      name: "UNIT TYPE",
      selector: (row) => row.raw_material.unit_type,
      sortable: true,
    },
    {
      name: "UNIT",
      cell: (row) => (
        <Form.Select
          className="mb-0"
          required
          onChange={(e) => handleUnitChange(row.index, e.target.value)}
          value={row.selectedUnit}
          style={{ fontSize: "1.2rem", height: "40px" }}
        >
          <option disabled value="" selected>
            Select Unit
          </option>
          {filterUnits(row.raw_material.unit_type).map((unit, index) => (
            <option key={index} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </Form.Select>
      ),
    },
    {
      name: "VOLUME",
      cell: (row) => (
        <input
          type="number"
          className="form-control mb-0"
          style={{ fontSize: "1.3rem" }}
          value={row.volume}
          onChange={(e) => handleVolumeChange(row.index, e.target.value)}
          onKeyDown={(e) => {
            ["e", "E", "-", "+"].includes(e.key) && e.preventDefault();
          }}
        />
      ),
    },
    {
      name: "AVERAGE COST",
      selector: (row) => getCost(row).toFixed(2),
      sortable: true,
    },
    {
      name: "ACTION",
      cell: (row) => (
        <span
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => handleDeleteRawMats(row.raw_material.raw_material_id)}
        >
          Delete
        </span>
      ),
    },
  ];

  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center flex-column vh-100 ms-5 ps-5 align-items-center">
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("CookBook-View") ? (
        <div className="archive-product-container">
          <div className="inventory-stock-container d-flex flex-md-row cookbook-container">
            <h2 className="text-nowrap ms-2">Cook Book</h2>

            <div class="input-group first-col group-in px-2 px-sm-0">
              <input
                type="text"
                class="form-control search m-0"
                placeholder="Search"
                aria-describedby="addon-wrapping"
                onChange={handleSearchChange}
              />
              {authrztn?.includes("CookBook-Add") && (
                <button
                  style={{
                    borderRadius: "10px",
                    background: " #2880bf",
                    color: "#fff",
                    fontSize: "1.2em",
                    padding: "10px",
                    border: "none",
                  }}
                  onClick={() => setShowCookModal(true)}
                >
                  Add Cookbook
                </button>
              )}
            </div>
          </div>

          <div className="table">
            {filteredCookBook.length == 0 ? (
              <>
                <div className="no-data-table mt-2">
                  <table>
                    <thead>
                      <th>COOKBOOK ID</th>
                      <th>DISH NAME</th>
                      <th>SALE PRICE</th>
                      <th>STATUS</th>
                      <th>ESTIMATED COST PRICE</th>
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
                <div className="products-table">
                  <DataTable
                    columns={columns}
                    data={filteredCookBook}
                    customStyles={customStyles}
                    pagination
                    onRowClicked={handleShowEditCookBook}
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
            marginTop: "10%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}
      {/* Cook Book Modal */}
      <Modal
        show={showCookModal}
        onHide={() => setShowCookModal(false)}
        size="xl"
      >
        <Modal.Header>
          <Modal.Title>
            <h2>Add New Cook Book</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="btn-dish-container d-flex p-0 justify-content-end my-3">
              <h2>Dishes</h2>
              <button
                className="btn btn-outline-primary"
                onClick={handleOpenDish}
              >
                Choose Dishes
              </button>
            </div>

            <div className="table">
              {selectedDish.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>SKU ID</th>
                        <th>DISH NAME</th>
                        <th>SALE PRICE</th>
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
                    columns={selectedDishColumn}
                    data={selectedDish}
                    customStyles={customStyles}
                  />
                </>
              )}
            </div>

            <div className="btn-dish-container d-flex p-0 justify-content-end  my-3">
              <h2>Materials</h2>
              <button
                className="btn btn-outline-primary"
                onClick={handleOpenStock}
                disabled={selectedDish == ""}
              >
                New Stock
              </button>
            </div>

            <div className="table">
              {selectedRawMatsdata.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>STOCK ID</th>
                        <th>STOCK NAME</th>
                        <th>UNIT TYPE</th>
                        <th>UNIT</th>
                        <th>VOLUME</th>
                        <th>AVERAGE COST</th>
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
                    columns={selectedRawMatsColumn}
                    data={selectedRawMatsdata}
                    pagination
                    customStyles={customStyles}
                  />
                </>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button variant="secondary" onClick={handleCloseCookModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveCookBook}>
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
      </Modal>

      {/* Edit Cook Book Modal */}
      <Modal
        show={showEditCookModal}
        onHide={handleCloseEditCookModal}
        size="xl"
      >
        <Modal.Header>
          <Modal.Title>
            <h2>Edit Cook Book</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="btn-dish-container d-flex p-0 justify-content-end">
              <h2>Dishes</h2>
            </div>

            <DataTable
              columns={selectedDishColumn}
              data={selectedDish}
              customStyles={customStyles}
            />

            <div className="btn-dish-container d-flex p-0 justify-content-end">
              <h2>Materials</h2>
              <button
                className="btn btn-outline-primary"
                onClick={handleOpenEditStock}
                disabled={selectedDish == ""}
              >
                New Stock
              </button>
            </div>

            <DataTable
              columns={editSelectedRawMatsColumn}
              pagination
              data={editSelectedRawMats}
              customStyles={customStyles}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button variant="secondary" onClick={handleCloseEditCookModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateCookBook}>
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
                  Updating. . .
                </span>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal for Choosing Dish */}
      <Modal show={showDishModal} onHide={handleCloseDish} size="lg">
        <Modal.Header>
          <Modal.Title>
            <h2>Choose SKU</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="sku-type-container">
              <div className="head-container d-flex justify-content-between">
                <div className="type-container  d-flex align-items-center">
                  <h2 className="type">Category:</h2>
                  <Form.Select className="m-0" onChange={handleSetCategory}>
                    <option value="" disabled selected>
                      Select Category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>

              <div className="table">
                {dishesData.length == 0 ? (
                  <>
                    <div className="no-data-table">
                      <table>
                        <thead>
                          <th>...</th>
                          <th>DISHES NAME</th>
                          <th>SALE PRICE</th>
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
                      columns={dishDataColumn}
                      pagination
                      data={dishesData}
                      customStyles={customStyles}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDish}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveDish}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal for Choosing New Stock */}
      <Modal show={showStockModal} onHide={handleCloseStock} size="lg">
        <Modal.Header>
          <Modal.Title>
            <h2>Choose Stock Item</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="sku-type-container">
              <div className="head-container d-flex justify-content-between">
                <div className="type-container d-flex align-items-center">
                  <h2 className="sku-name">Stock Name:</h2>
                  <input
                    className="form-control m-0"
                    value={searchRaw}
                    onChange={handleSearchRawChange}
                  />
                </div>
              </div>

              <div className="table">
                {rawMatsData.length == 0 ? (
                  <>
                    <div className="no-data-table">
                      <table>
                        <thead>
                          <th>STOCK ID</th>
                          <th>STOCK NAME</th>
                          <th>STOCK TYPE</th>
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
                      columns={rawMatsColumn}
                      pagination
                      data={filteredRawMaterials}
                      customStyles={customStyles}
                      onRowClicked={handleSelectRow}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={handleCloseStock}>
            Cancel
          </Button> */}
          <Button variant="primary" onClick={handleSaveRawMats}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Stock Modal */}
      <Modal
        show={showEditStockModal}
        onHide={handleCloseEditStockModal}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>
            <h2>Choose Edit Stock Item</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category ">
            <div className="sku-type-container">
              <div className="head-container d-flex justify-content-between">
                <div className="type-container d-flex align-items-center">
                  <h2 className="sku-name">Stock Name:</h2>
                  <input
                    className="form-control m-0"
                    value={searchRaw}
                    onChange={handleSearchRawChange}
                  />
                </div>
              </div>

              <DataTable
                columns={editRawMaterialsColumn}
                data={filteredRawMaterials}
                pagination
                customStyles={customStyles}
                onRowClicked={handleEditCheckboxChange}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={handleCloseEditStockModal}>
            Cancel
          </Button> */}
          <Button variant="primary" onClick={handleEditSaveRawMats}>
            Okay
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Cookbook;
