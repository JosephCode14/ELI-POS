import { React, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import swal from "sweetalert";
import BASE_URL from "../../../assets/global/url";
import axios from "axios";
import { Trash } from "@phosphor-icons/react";
const UpdateSpecification = ({
  currentSpec,
  updateIDSpecs,
  reloadTableSpecification,
  reloadTableExtraOption,
  userId,
}) => {
  // console.log(currentSpec);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [linkModal, setLinkModal] = useState(false);
  const [Category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [product, setProduct] = useState([]);
  const [validated, setValidated] = useState(false);
  const [currentSpecEdit, setCurrentSpecEdit] = useState({
    name: "",
    subOptions: [{ subName: "", price: "" }],
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
    console.log(currentSpec);
    if (currentSpec && currentSpec.category_product_specifications) {
      const newSelectedProducts =
        currentSpec.category_product_specifications.map((item) => ({
          name: item.product?.name,
          sku: item.product?.sku,
          product_id: item.product?.product_id,
          category_product_id:
            item.category_product?.id || item.category_product_id,
        }));

      setSelectedProducts(newSelectedProducts);

      setCurrentSpecEdit({
        name: currentSpec.specification_name,
        subOptions: currentSpec.specification_variants
          ? currentSpec.specification_variants
              .filter((variant) => variant.variant_name !== "Default_Regular")
              .map((variant) => ({
                subName: variant.variant_name,
                price: variant.variant_price.toString(),
              }))
          : [],
      });
    }
    console.log(currentSpecEdit);
  }, [currentSpec]);

  const handleSubOptionChange = (index, field, value) => {
    setCurrentSpecEdit((prevState) => {
      const newState = {
        ...prevState,
        subOptions: prevState.subOptions.map((subOption, i) =>
          i === index ? { ...subOption, [field]: value } : subOption
        ),
      };
      console.log(`Updated currentSpecEdit:`, newState);
      return newState;
    });
  };

  const handleAddSubOption = () => {
    setCurrentSpecEdit((prevSpec) => {
      const newSpec = {
        ...prevSpec,
        subOptions: [...prevSpec.subOptions, { subName: "", price: "" }],
      };
      return newSpec;
    });
  };

  const handleRemoveSubOption = (index) => {
    if (currentSpecEdit.subOptions.length > 1) {
      const newSubOptions = currentSpecEdit.subOptions.filter(
        (_, i) => i !== index
      );
      setCurrentSpecEdit({ ...currentSpecEdit, subOptions: newSubOptions });
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

  useEffect(() => {
    console.log("Selected", selectedProducts);
  }, [selectedProducts]);
  const handleDelete = (index) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
    // if (selectedProducts.length > 1) {
    //   setSelectedProducts((prevProducts) =>
    //     prevProducts.filter((_, i) => i !== index)
    //   );
    // } else {
    //   swal({
    //     title: "Oopps!",
    //     text: "You can't remove the last product.",
    //     icon: "error",
    //     buttons: false,
    //     timer: 2000,
    //     dangerMode: true,
    //   });
    // }
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
        title: "Are you sure?",
        text: "You want to update this variant?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          axios
            .post(BASE_URL + "/variant/updateSpecification", null, {
              params: {
                updateIDSpecs,
                currentSpecEdit,
                selectedProducts,
                userId,
              },
            })
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "You successfully updated the data",
                  icon: "success",
                  buttons: false,

                  dangerMode: true,
                }).then(() => {
                  reloadTableSpecification();
                  reloadTableExtraOption();
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
        <div className={`${windowWidth > 1200 && "custom-card" }`}>
          <div className="extra-title-container mb-5">
            <h2>Update Specification</h2>
          </div>
          <hr />
          <Form noValidate validated={validated} onSubmit={update}>
            <div className="spec-body-container">
              <div className="prod-extra-input-container">
                <h3>Name:</h3>
                <Form.Control
                  type="text"
                  class="form-control mt-2"
                  value={currentSpecEdit.name}
                  onChange={(e) =>
                    setCurrentSpecEdit({
                      ...currentSpecEdit,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="prod-sub-container">
                <h3>Sub Options:</h3>
                {currentSpecEdit.subOptions.map((subOption, index) => (
                  <div className="sub-input">
                    <Form.Control
                      type="text"
                      className="mt-2 mb-0"
                      placeholder="sub name"
                      required
                      value={subOption.subName}
                      onChange={(e) =>
                        handleSubOptionChange(index, "subName", e.target.value)
                      }
                    />
                    <Form.Control
                      type="number"
                      className="mt-2 mb-0"
                      placeholder="price"
                      value={subOption.price}
                      onChange={(e) =>
                        handleSubOptionChange(index, "price", e.target.value)
                      }
                    />
                    <i
                      className="bx bx-trash"
                      onClick={() => handleRemoveSubOption(index)}
                      style={{
                        cursor:
                          currentSpecEdit.subOptions.length > 1
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          currentSpecEdit.subOptions.length > 1 ? 1 : 0.5,
                      }}
                    ></i>
                  </div>
                ))}
              </div>
              <div className="prod-add-sub">
                <button type="button" onClick={handleAddSubOption}>
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
            <div className={`prod-extra-btn-container ${windowWidth < 1201 && "position-relative"}`}>
              {/* <button
                className="prod-c-btn"
                type="button"
                // onClick={() => reloadTableSpecification()}
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

export default UpdateSpecification;
