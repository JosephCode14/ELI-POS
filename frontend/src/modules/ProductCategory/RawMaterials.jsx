import React, { useState, useEffect } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
import { Button, Modal, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import { customStyles } from "../styles/table-style";
import noData from "../../assets/icon/no-data.png";
// import { MultiSelect } from "primereact/multiselect";
import productUnits from "../../assets/global/unit";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
// import "../styles/pos_react.css";
// import "../styles/raw-materials.css";
import { Plus, ArrowsClockwise } from "@phosphor-icons/react";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";
const RawMaterials = ({ authrztn }) => {
  const [validated, setValidated] = useState(false);
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [showChangeStatusButton, setShowChangeStatusButton] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const [rawMaterialId, setRawMaterialId] = useState("");
  const [sku, setSku] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [description, setDescription] = useState("");
  const [unitType, setUnitType] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [threshold, setThreshold] = useState("");
  const [rawMaterial, setRawMaterial] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [remarksArchive, setRemarksArchive] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showUpdatedModalMaterial, setShowModalUpdateMaterial] =
    useState(false);
  const handleCloseMaterialModal = () => setShowMaterialModal(false);
  const handleAddMaterial = () => setShowMaterialModal(true);

  const handleCloseArchiveModal = () => setShowArchiveModal(false);
  const handleRemarksArchive = () => setShowArchiveModal(true);

  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [containerClass, setContainerClass] = useState("users-container");

  const [loadingBtn, setLoadingBtn] = useState(false);

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

  const handleCloseUpdateModal = () => {
    setShowMaterialModal(false);
    setShowModalUpdateMaterial(false);
    setValidated(false);
    setRawMaterialId("");
    setSku("");
    setMaterialName("");
    setDescription("");
    setUnitType("");
    setUnitPrice("");
    setThreshold("");
  };

  const handleUpdateModal = async (data) => {
    if (authrztn?.includes("RawMaterial-Edit")) {
      setShowModalUpdateMaterial(true);
      setRawMaterialId(data.raw_material_id);
      setSku(data.sku);
      setMaterialName(data.material_name);
      setDescription(data.description);
      setUnitType(data.unit_type);
      setUnitPrice(data.unit_price);
      setThreshold(data.threshold);
    }
  };

  const handleSubmitMaterial = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Required Fields",
        text: "Please fill in all required fields.",
      });
    } else {
      setLoadingBtn(true);
      axios
        .post(BASE_URL + "/rawmaterial/create", {
          sku,
          materialName,
          description,
          threshold,
          unitType,
          unitPrice,
          userId,
        })
        .then((response) => {
          if (response.status === 200) {
            swal({
              title: "Raw Material Added Successfully!",
              text: "The new raw material has been added successfully.",
              icon: "success",
              button: "OK",
            }).then(() => {
              setShowMaterialModal(false);
              reloadRaw();
              setSku("");
              setMaterialName("");
              setDescription("");
              setUnitType("");
              setUnitPrice("");
              setThreshold("");
              setValidated(false);
              setLoadingBtn(false);
            });
          } else if (response.status === 201) {
            swal({
              title: "Raw Material Already Exists",
              text: "Please input a new expenses.",
              icon: "error",
            });
            setLoadingBtn(false);
          }
        });
    }
    setValidated(true);
  };

  const handleUpdateSubmit = async (e) => {
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
        title: "Update this Raw Material?",
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          setLoadingBtn(true);
          axios
            .post(`${BASE_URL}/rawmaterial/updateRawmaterial`, {
              rawMaterialId,
              sku,
              materialName,
              description,
              threshold,
              unitType,
              unitPrice,
              userId,
            })
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Raw Material Updated Successfully",
                  text: "Raw material has been updated successfully",
                  icon: "success",
                  successMode: true,
                }).then(() => {
                  handleCloseUpdateModal();
                  reloadRaw();
                  setLoadingBtn(false);
                });
              } else if (res.status === 201) {
                swal({
                  title: "Raw Material Name already exist",
                  text: "Please input another raw material name",
                  icon: "error",
                  dangerMode: true,
                });
                setLoadingBtn(false);
              } else {
                swal({
                  title: "Something Went Wrong",
                  text: "Please contact your support immediately",
                  icon: "error",
                  dangerMode: true,
                }).then(() => {
                  handleCloseUpdateModal();
                  reloadRaw();
                  setLoadingBtn(false);
                });
              }
            });
        }
      });
    }
    setValidated(true);
  };

  const handleSave = () => {
    setShowAddMaterial(false);
    setLoadingBtn(true);
    axios
      .put(BASE_URL + "/rawmaterial/archive", {
        rawIds: selectedCheckboxes,
        remarksArchive,
        userId,
      })
      .then((res) => {
        if (res.status === 200) {
          swal({
            title: "Raw Material Archive!",
            text: "The raw material has been archived.",
            icon: "success",
            button: "OK",
          }).then(() => {
            reloadRaw();
            setSelectAllChecked(false);
            setSelectedCheckboxes([]);
            setShowChangeStatusButton(false);
            handleCloseArchiveModal();
            setLoadingBtn(false);
            setRemarksArchive("");
          });
        }
      });
  };

  //fetching ng raw material data
  const reloadRaw = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/rawmaterial/rawMaterialData`);
      setRawMaterial(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadRaw();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  //end ng fetching sa raw material data

  const handleCheckboxChange = (raw) => {
    const updatedCheckboxes = [...selectedCheckboxes];

    if (updatedCheckboxes.includes(raw)) {
      updatedCheckboxes.splice(updatedCheckboxes.indexOf(raw), 1);
    } else {
      updatedCheckboxes.push(raw);
    }

    setSelectedCheckboxes(updatedCheckboxes);
    setShowChangeStatusButton(updatedCheckboxes.length > 0);
  };

  const handleSelectAllChange = () => {
    const rawMatId = rawMaterial.map((data) => data.raw_material_id);

    if (rawMatId.length === 0) {
      return;
    }

    if (selectedCheckboxes.length === rawMatId.length) {
      setSelectedCheckboxes([]);
      setShowChangeStatusButton(false);
      setSelectAllChecked(false);
    } else {
      setSelectedCheckboxes(rawMatId);
      setShowChangeStatusButton(true);
      setSelectAllChecked(true);
    }
  };

  const columns = [
    ...(authrztn?.includes("RawMaterial-Delete")
      ? [
          {
            name: (
              <input
                type="checkbox"
                onChange={handleSelectAllChange}
                checked={selectAllChecked}
              />
            ),
            cell: (row) => (
              <input
                type="checkbox"
                checked={selectedCheckboxes.includes(row.raw_material_id)}
                onChange={() => handleCheckboxChange(row.raw_material_id)}
              />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
          },
        ]
      : []),
    {
      name: "SKU #",
      selector: (row) => row.sku,
    },
    {
      name: "MATERIALS NAME",
      selector: (row) => row.material_name,
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.description,
    },
    {
      name: "UNIT TYPE",
      selector: (row) => row.unit_type,
    },
    {
      name: "UNIT PRICE",
      selector: (row) =>
        parseFloat(row.unit_price).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredRawMaterials = rawMaterial.filter(
    (item) =>
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit_price
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleAddMaterialToggle = () => {
    setShowAddMaterial(!showAddMaterial);
  };

  const handleCancelAdd = () => {
    setSku("");
    setMaterialName("");
    setUnitType("");
    setUnitPrice("");
    setThreshold("");
    setDescription("");
    setShowAddMaterial(!showAddMaterial);
  };

  // useEffect(() => {
  //   if (showAddMaterial) {
  //     setContainerClass("main-div d-flex flex-row");
  //   } else {
  //     setContainerClass("main-div");
  //   }
  // }, [showAddMaterial]);

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
      ) : authrztn.includes("RawMaterial-View") ? (
        <div className="archive-product-container raw-mats-cont">
          <div
            className="main-body"
            style={showAddMaterial ? { width: "65%" } : { width: "100%" }}
          >
            <div className="inventory-stock-container d-flex flex-md-row raw-material-container pe-3">
              <h2 className="text-nowrap">Raw Materials</h2>

              <div className="input-group first-col group-in mb-2 ms-2 ms-0">
                <input
                  type="text"
                  className="form-control search m-0"
                  placeholder="Search sku / Item Name"
                  aria-describedby="addon-wrapping"
                  onChange={handleSearchChange}
                />

                {showChangeStatusButton
                  ? authrztn?.includes("RawMaterial-Delete") && (
                      <button
                        className="btn btn-secondary"
                        style={{
                          borderRadius: "10px",
                          background: " #2880bf",
                          color: "#fff",
                          fontSize: "1.2em",
                          padding: "10px",
                          border: "none",
                        }}
                        onClick={handleRemarksArchive}
                      >
                        <ArrowsClockwise size={20} color="#f2f2f2" /> Archive
                      </button>
                    )
                  : authrztn?.includes("RawMaterial-Add") && (
                      <button
                        style={{
                          borderRadius: "10px",
                          background: " #2880bf",
                          color: "#fff",
                          fontSize: "1.2em",
                          padding: "10px",
                          border: "none",
                        }}
                        onClick={handleAddMaterialToggle}
                      >
                        <Plus size={20} color="#f2f2f2" /> Add Raw Material
                      </button>
                    )}
              </div>
            </div>

            <div className="table">
              {filteredRawMaterials.length == 0 ? (
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
                      data={filteredRawMaterials}
                      customStyles={customStyles}
                      pagination
                      onRowClicked={handleUpdateModal}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          {showAddMaterial && (
            <div
              className="add-material-container"
              style={{ paddingLeft: "1rem" }}
            >
              <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmitMaterial}
              >
                <div className="add-material-content">
                  <div className="add-material-title">
                    <h1>Add New Material</h1>
                    <hr />
                  </div>
                  <div className="add-material-body">
                    <div className="row p-0">
                      <div className="col-12 col-lg-5">
                        <label htmlFor="">SKU #</label>
                        <div class="input-group mb-3">
                          <Form.Control
                            type="text"
                            class="search"
                            placeholder="Sku Number"
                            onChange={(e) => setSku(e.target.value)}
                            value={sku}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg">
                        <label htmlFor="">Material Name</label>
                        <div class="input-group mb-3">
                          <Form.Control
                            type="text"
                            class="date"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            onChange={(e) => setMaterialName(e.target.value)}
                            value={materialName}
                            placeholder="Material Name"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row p-0">
                      <div className="col-lg">
                        <label htmlFor="">Unit Type</label>
                        <Form.Select
                          aria-label="Default select example"
                          required
                          onChange={(e) => setUnitType(e.target.value)}
                          value={unitType}
                          style={{ height: "40px" }}
                        >
                          <option disabled value="">
                            Select Unit
                          </option>
                          {productUnits.map((unit, index) => (
                            <option key={index} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-lg">
                        <label htmlFor="">Price</label>
                        <div class="input-group mb-3">
                          <Form.Control
                            type="number"
                            class="date"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            onChange={(e) => setUnitPrice(e.target.value)}
                            value={unitPrice}
                            placeholder="Product Price"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg">
                        <label htmlFor="">Threshold</label>
                        <div class="input-group mb-3">
                          <Form.Control
                            type="number"
                            class="date"
                            aria-label="threshold"
                            aria-describedby="basic-addon1"
                            onChange={(e) => setThreshold(e.target.value)}
                            value={threshold}
                            placeholder="Threshold"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row p-0">
                      <div className="col">
                        <label htmlFor="">Description</label>
                        <div class="form-floating">
                          <textarea
                            class="form-control"
                            placeholder="Leave a comment here"
                            id="floatingTextarea2"
                            style={{ height: "100px", fontSize: "1.2em" }}
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                          ></textarea>
                          <label for="floatingTextarea2">Remarks</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="add-material-footer d-flex flex-row justify-content-end">
                  {!loadingBtn ? (
                    <>
                      <Button
                        variant="danger"
                        className="me-3"
                        // onClick={handleAddMaterialToggle}
                        onClick={handleCancelAdd}
                        style={{ fontSize: "1.5em" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        style={{ fontSize: "1.5em" }}
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="d-flex w-100 justify-content-end p-0">
                        <ReactLoading
                          color="blue"
                          type={"spinningBubbles"}
                          height={"5%"}
                          width={"5%"}
                        />
                        <span
                          style={{
                            fontSize: "2rem",
                            // marginTop: "10px",
                            marginLeft: "5px",
                          }}
                        >
                          Saving. . .
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Form>
            </div>
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
      {/* {showAddMaterial && (
          <div className="add-material-container pt-5">
            <Form
              noValidate
              validated={validated}
              onSubmit={handleSubmitMaterial}
            >
              <div className="add-material-content">
                <div className="add-material-title">
                  <h1>Add New Material</h1>
                  <hr />
                </div>
                <div className="add-material-body">
                  <div className="row">
                    <div className="col-5">
                      <label htmlFor="">SKU #</label>
                      <div class="input-group mb-3">
                        <Form.Control
                          type="text"
                          class="search"
                          placeholder="Sku Number"
                          onChange={(e) => setSku(e.target.value)}
                          value={sku}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md">
                      <label htmlFor="">Material Name</label>
                      <div class="input-group mb-3">
                        <Form.Control
                          type="text"
                          class="date"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          onChange={(e) => setMaterialName(e.target.value)}
                          value={materialName}
                          placeholder="Material Name"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md">
                      <label htmlFor="">Unit Type</label>
                      <Form.Select
                        aria-label="Default select example"
                        required
                        onChange={(e) => setUnitType(e.target.value)}
                        value={unitType}
                        style={{ height: "40px" }}
                      >
                        <option disabled value="">
                          Select Unit
                        </option>
                        {productUnits.map((unit, index) => (
                          <option key={index} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-md">
                      <label htmlFor="">Price</label>
                      <div class="input-group mb-3">
                        <Form.Control
                          type="number"
                          class="date"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          onChange={(e) => setUnitPrice(e.target.value)}
                          value={unitPrice}
                          placeholder="Product Price"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md">
                      <label htmlFor="">Threshold</label>
                      <div class="input-group mb-3">
                        <Form.Control
                          type="number"
                          class="date"
                          aria-label="threshold"
                          aria-describedby="basic-addon1"
                          onChange={(e) => setThreshold(e.target.value)}
                          value={threshold}
                          placeholder="Threshold"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="">Description</label>
                      <div class="form-floating">
                        <textarea
                          class="form-control"
                          placeholder="Leave a comment here"
                          id="floatingTextarea2"
                          style={{ height: "100px", fontSize: "1.2em" }}
                          onChange={(e) => setDescription(e.target.value)}
                          value={description}
                        ></textarea>
                        <label for="floatingTextarea2">Remarks</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="add-material-footer d-flex flex-row">
                <Button variant="danger" onClick={handleAddMaterialToggle}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </div>
            </Form>
          </div>
        )} */}

      {/*<Modal
        show={showMaterialModal}
        onHide={handleCloseMaterialModal}
        centered
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitMaterial}>
          <Modal.Header closeButton>
            <Modal.Title>
              <h2>Add New Material</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-user-container">
              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">SKU #</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="text"
                      class="search"
                      placeholder="Sku Number"
                      onChange={(e) => setSku(e.target.value)}
                      value={sku}
                      required
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Material Name</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="text"
                      class="date"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={(e) => setMaterialName(e.target.value)}
                      value={materialName}
                      placeholder="Material Name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Unit Type</label>
                  <Form.Select
                    aria-label="Default select example"
                    required
                    onChange={(e) => setUnitType(e.target.value)}
                    value={unitType}
                    style={{ height: "40px" }}
                  >
                    <option disabled value="">
                      Select Unit
                    </option>
                    {productUnits.map((unit, index) => (
                      <option key={index} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-6">
                  <label htmlFor="">Price</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="number"
                      class="date"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={(e) => setUnitPrice(e.target.value)}
                      value={unitPrice}
                      placeholder="Product Price"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Description</label>
                  <div class="form-floating">
                    <textarea
                      class="form-control"
                      placeholder="Leave a comment here"
                      id="floatingTextarea2"
                      style={{ height: "100px", fontSize: "1.2em" }}
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                    ></textarea>
                    <label for="floatingTextarea2">Remarks</label>
                  </div>
                </div>

                <div className="col-6">
                  <label htmlFor="">Threshold</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="number"
                      class="date"
                      aria-label="threshold"
                      aria-describedby="basic-addon1"
                      onChange={(e) => setThreshold(e.target.value)}
                      value={threshold}
                      placeholder="Threshold"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleCloseMaterialModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>*/}

      <Modal show={showUpdatedModalMaterial} onHide={handleCloseUpdateModal}>
        <Form noValidate validated={validated} onSubmit={handleUpdateSubmit}>
          <Modal.Header>
            <Modal.Title>
              <h2>Update Raw Material</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-user-container">
              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">SKU #</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="text"
                      className="search mb-0"
                      placeholder="Sku Number"
                      onChange={(e) => setSku(e.target.value)}
                      value={sku}
                      required
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Material Name</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="text"
                      className="date mb-0"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={(e) => setMaterialName(e.target.value)}
                      value={materialName}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Unit Type</label>
                  <Form.Select
                    aria-label="Default select example"
                    required
                    onChange={(e) => setUnitType(e.target.value)}
                    value={unitType}
                    className="mb-0"
                    style={{ height: "40px" }}
                  >
                    <option disabled value="">
                      Select Unit
                    </option>
                    {productUnits.map((unit, index) => (
                      <option key={index} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-6">
                  <label htmlFor="">Price</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="number"
                      className="date mb-0"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={(e) => setUnitPrice(e.target.value)}
                      value={unitPrice}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Description</label>
                  <div class="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Leave a comment here"
                      id="floatingTextarea2"
                      style={{
                        height: "100px",
                        fontSize: "1.2em",
                        paddingTop: "25px",
                      }}
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                    ></textarea>
                    <label for="floatingTextarea2">Description</label>
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Threshold</label>
                  <div class="input-group mb-3">
                    <Form.Control
                      type="number"
                      class="date"
                      aria-label="threshold"
                      aria-describedby="basic-addon1"
                      onChange={(e) => setThreshold(e.target.value)}
                      value={threshold}
                      placeholder="Threshold"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {!loadingBtn ? (
              <>
                <Button type="submit" variant="primary">
                  Update
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
        </Form>
      </Modal>

      {/* Modal for Archive */}
      <Modal show={showArchiveModal} onHide={handleCloseArchiveModal} centered>
        <Modal.Header>
          <Modal.Title>
            <h2>Do you want to archive?</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-category justify-content-center">
            <label htmlFor="">Description</label>
            <div class="form-floating">
              <textarea
                class="form-control mb-0"
                placeholder="Leave a comment here "
                id="floatingTextarea2"
                style={{ height: "20rem", fontSize: "1.2em", height: "25px" }}
                onChange={(e) => setRemarksArchive(e.target.value)}
                value={remarksArchive}
                required
              ></textarea>
              <label for="floatingTextarea2">Remarks</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button variant="primary" onClick={handleSave}>
                Confirm
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
                  Archiving. . .
                </span>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RawMaterials;
