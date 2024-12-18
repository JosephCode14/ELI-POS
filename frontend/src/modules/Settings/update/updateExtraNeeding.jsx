import { React, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import swal from "sweetalert";
import BASE_URL from "../../../assets/global/url";
import axios from "axios";
import { Trash } from "@phosphor-icons/react";
import productUnits from "../../../assets/global/unit";
const UpdateExtraNeeding = ({
  currentExtra,
  updateIDExtraNeeds,
  reloadTableExtraNeeding,
  userId,
}) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [linkModal, setLinkModal] = useState(false);
  const [Category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [product, setProduct] = useState([]);
  const [validated, setValidated] = useState(false);
  const [rawInventoryData, setRawInventoryData] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [extraSpecsEdit, setExtraSpecsEdit] = useState({
    extraName: "",
    extraSubOptions: [
      { extraSubName: "", extraUnitType: "", extraVolume: "", extraPrice: "" },
    ],
  });
  const reloadTableCategory = () => {
    axios
      .get(BASE_URL + "/category/getCategory")
      .then((res) => {
        setCategory(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    reloadTableCategory();
  }, []);

  useEffect(() => {
    if (currentExtra && currentExtra.category_product_extras) {
      const newSelectedProducts = currentExtra.category_product_extras.map(
        (item) => ({
          name: item.product?.name,
          sku: item.product?.sku,
          product_id: item.product?.product_id,
          category_product_id:
            item.category_product?.id || item.category_product_id,
        })
      );

      setSelectedProducts(newSelectedProducts);

      const initialSelectedMaterials = new Set(
        currentExtra.extra_variants.map((extra) =>
          extra.raw_material.raw_material_id.toString()
        )
      );
      setSelectedMaterials(initialSelectedMaterials);

      setExtraSpecsEdit({
        extraName: currentExtra.extra_name,
        extraSubOptions: currentExtra.extra_variants
          ? currentExtra.extra_variants.map((extra) => ({
              extraSubName: extra.raw_material.raw_material_id.toString(),
              extraPrice: extra.price.toString(),
              extraUnitType: extra.unit_type,
              extraVolume: extra.volume.toString(),
              filteredUnits: filterUnits(extra.unit_type),
            }))
          : [],
      });
    }
  }, [currentExtra]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    const Idcategory = categoryId;
    axios
      .get(BASE_URL + "/variant/fetchSpecificProdCategory_settings", {
        params: {
          Idcategory,
        },
      })
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => console.log(err));
  };

  const handleCheckboxChange = (prod_id, prod_name, prod_sku) => {
    setSelectedProducts((prevSelected) => {
      const productData = {
        name: prod_name,
        sku: prod_sku,
        product_id: prod_id,
      };

      let newSelected;
      if (prevSelected.some((item) => item.product_id === prod_id)) {
        newSelected = prevSelected.filter(
          (item) => item.product_id !== prod_id
        );
      } else {
        newSelected = [...prevSelected, productData];
      }
      console.log("Updated selected products:", newSelected);

      return newSelected;
    });
  };

  const handleExtraAddSubOption = () => {
    setExtraSpecsEdit((prevSpec) => {
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
    setExtraSpecsEdit((prevState) => {
      const newExtraSubOptions = [...prevState.extraSubOptions];
      const currentOption = newExtraSubOptions[index];
      const oldValue = currentOption[field];

      if (field === "extraSubName") {
        setSelectedMaterials((prev) => {
          const updated = new Set(prev);
          if (oldValue) updated.delete(oldValue);
          updated.add(value);
          return updated;
        });
      }

      currentOption[field] = value;
      const selectedMaterial = rawInventoryData.find(
        (material) =>
          material.raw_material_id === parseInt(currentOption.extraSubName)
      );
      const priceDatabase = selectedMaterial ? selectedMaterial.unit_price : "";
      const priceUnitType = selectedMaterial ? selectedMaterial.unit_type : "";

      if (field === "extraSubName" || field === "extraUnitType") {
        const newUnitType = selectedMaterial ? selectedMaterial.unit_type : "";
        const newFilteredUnits = filterUnits(newUnitType);
        currentOption.filteredUnits = newFilteredUnits;
      }

      if (
        currentOption.extraUnitType &&
        currentOption.extraVolume &&
        priceDatabase
      ) {
        const volume = parseFloat(currentOption.extraVolume);
        const unitType = currentOption.extraUnitType;

        if (unitType === priceUnitType) {
          currentOption.extraPrice = (priceDatabase * volume).toFixed(2);
        } else {
          const volumeInPriceUnitType = convertToCommonUnit(volume, unitType);
          currentOption.extraPrice = (
            priceDatabase * volumeInPriceUnitType
          ).toFixed(2);
        }
      } else {
        currentOption.extraPrice = "";
      }

      return {
        ...prevState,
        extraSubOptions: newExtraSubOptions,
      };
    });
  };

  const convertToCommonUnit = (volume, fromUnitType) => {
    switch (fromUnitType) {
      case "L":
        return volume;
      case "mL":
        return volume / 1000;
      case "Kg":
        return volume;
      case "lbs":
        return volume * 0.453592;
      case "oz":
        return volume * 0.0283495;
      case "g":
        return volume / 1000;
      case "pcs":
        return volume;
      default:
        return volume;
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
    if (extraSpecsEdit.extraSubOptions.length > 1) {
      const newExtraSubOptions = extraSpecsEdit.extraSubOptions.filter(
        (_, i) => i !== index
      );
      setExtraSpecsEdit({
        ...extraSpecsEdit,
        extraSubOptions: newExtraSubOptions,
      });
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
    setExtraSpecsEdit({
      extraName: "",
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

  const handleDelete = (index) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
  };

  const fetchRawInventory = () => {
    axios
      .get(BASE_URL + "/variant/getRawInventory")
      .then((res) => {
        setRawInventoryData(res.data);
      })
      .catch((err) => console.log(err));
  };

  const update = async (e) => {
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
        title: "Are you sure you want to update this variant?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          axios
            .post(BASE_URL + "/variant/updateExtraNeeding", null, {
              params: {
                updateIDExtraNeeds,
                extraSpecsEdit,
                userId,
                selectedProducts,
              },
            })
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "Extra needing updated successfully",
                  icon: "success",
                  buttons: false,

                  dangerMode: true,
                }).then(() => {
                  reloadTableExtraNeeding();
                });
              } else {
                swal({
                  title: "Something went wrong",
                  text: "Please contact your support immediately",
                  icon: "error",
                  buttons: false,
                  dangerMode: true,
                });
              }
            })
            .catch((err) => {
              swal({
                title: "Something went wrong",
                text: "Please contact your support immediately",
                icon: "error",
                buttons: false,
                dangerMode: true,
              });
              console.log(err);
            });
        }
      });
    }
    setValidated(true);
  };

  useEffect(() => {
    fetchRawInventory();
  }, []);

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

  return (
    <div>
      <div className="specification-add">
        <div className={`${windowWidth > 1200 && "custom-card"}`}>
          <div className="extra-title-container mb-5">
            <h2>Update Extra Needing</h2>
          </div>
          <hr />
          <Form noValidate validated={validated} onSubmit={update}>
            <div className="spec-body-container">
              <div className="prod-extra-input-container">
                <h3>Name:</h3>
                <Form.Control
                  type="text"
                  class="form-control mt-2"
                  required
                  value={extraSpecsEdit.extraName}
                  onChange={(e) =>
                    setExtraSpecsEdit({
                      ...extraSpecsEdit,
                      extraName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="prod-sub-container">
                <h3>Sub Options:</h3>
                {extraSpecsEdit.extraSubOptions.map(
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
                        value={extraSubOptions.extraUnitType || ""}
                        onChange={(e) =>
                          handleExtraSubOptionChange(
                            index,
                            "extraUnitType",
                            e.target.value
                          )
                        }
                      >
                        <option value="" disabled>
                          Unit Type
                        </option>
                        {(extraSubOptions.filteredUnits || productUnits).map(
                          (unit) => (
                            <option key={unit.value} value={unit.value}>
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
                          (e.target.value = e.target.value.replace(
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
                        onClick={() => handleRemoveExtraSubOption(index)}
                      ></i>
                    </div>
                  )
                )}
              </div>
              <div className="prod-add-sub">
                <button type="button" onClick={handleExtraAddSubOption}>
                  <i className="bx bx-plus"></i>Add New
                </button>
              </div>
              <div className="link-prod-container">
                <h3>Link Products</h3>
                <i class="bx bx-link" onClick={() => setLinkModal(true)}></i>
              </div>
              <div className="link-selected-list d-flex">
                <div className="d-flex w-100 p-0" style={{ overflowY: "auto" }}>
                  <ul className="custom-list w-100">
                    {selectedProducts.map((data, index) => (
                      <li key={data.product_id}>
                        <div className="w-100 d-flex flex-row align-items-center justify-content-between">
                          <span className="h3">{`(${data.sku}) ${data.name}`}</span>

                          <Button
                            variant={"light"}
                            className="text-danger"
                            onClick={() => handleDelete(index)}
                            // style={{
                            //   cursor:
                            //     selectedProducts.length > 1
                            //       ? "pointer"
                            //       : "not-allowed",
                            //   opacity: selectedProducts.length > 1 ? 1 : 0.5,
                            // }}
                          >
                            <Trash size={22} color="#c80e0e" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div
              className={`prod-extra-btn-container ${
                windowWidth < 1201 && "position-relative"
              }`}
            >
              {/* <button
                className="prod-c-btn"
                type="button"
                onClick={() => setExtraToggleAdd(false)}
              >
                Cancel
              </button> */}
              <button className="prod-s-btn" type="submit">
                Save
              </button>
            </div>
          </Form>

          <Modal show={linkModal} size="xl" onHide={() => setLinkModal(false)}>
            <div className="modal-category p-1">
              <h2>Link Product</h2>
              <div className="link-list-container">
                <div className="cat-list-container">
                  {Category.map((category, index) => (
                    <div
                      className={`form-cat-container ${
                        selectedCategory === category.category_id
                          ? "selected"
                          : ""
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
                            (item) => item.product_id === p.product.product_id
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
        </div>
      </div>
    </div>
  );
};

export default UpdateExtraNeeding;
