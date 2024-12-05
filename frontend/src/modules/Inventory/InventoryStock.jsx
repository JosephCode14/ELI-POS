import React, { useEffect, useState } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
// import "../styles/pos_react.css";
import "../styles/inventory.css";
import { Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import noData from "../../assets/icon/no-data.png";
import { customStyles } from "../styles/table-style";
import NoAccess from "../../assets/image/NoAccess.png";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { FourSquare } from "react-loading-indicators";
// import exportFile from "./customHook/exportFile";
// import { TextField } from "@mui/material";
const InventoryStock = ({ authrztn }) => {
  const [selectedPage, setSelectedPage] = useState("products");
  // const [ProductInventory, setProductInventory] = useState([]);
  // const [RawInventory, setRawInventory] = useState([]);
  // const [search, setSearch] = useState("");
  // const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [filteredRawInventory, setFilteredRawInventory] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectedPage = (selected) => {
    setIsLoading(true);
    setSelectedPage(selected);
  };

  const handleChange = (e) => {
    setIsLoading(true);
    setSelectedStatus(e.target.value);
  };

  const fetchRawMaterialInventory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/rawmaterial/getRawInventory`);
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
      // setRawInventory(dataWithStatusRawMaterial);
      if (selectedStatus && selectedStatus !== "All Status") {
        const filteredData = dataWithStatusRawMaterial.filter(
          (rawitem) => rawitem.status === selectedStatus
        );
        setFilteredRawInventory(filteredData);
      } else {
        setFilteredRawInventory(dataWithStatusRawMaterial);
      }
    } catch (error) {
      setIsLoading(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/product_inventory/getInventoryStock`
      );
      const dataWithStatus = res.data.map((item) => {
        let status;
        if (item.quantity === 0) {
          status = "No Stock";
        } else if (item.quantity < item.product.threshold) {
          status = "Low Stock";
        } else {
          status = "In Stock";
        }
        return {
          ...item,
          status: status,
        };
      });
      // setProductInventory(dataWithStatus);
      if (selectedStatus && selectedStatus !== "All Status") {
        const filteredData = dataWithStatus.filter(
          (item) => item.status === selectedStatus
        );
        setFilteredInventory(filteredData);
      } else {
        setFilteredInventory(dataWithStatus);
      }
    } catch (error) {
      setIsLoading(true);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (selectedPage === "products") {
  //       fetchInventory();
  //     } else if (selectedPage === "raw-materials") {
  //       fetchRawMaterialInventory();
  //     }
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, [selectedStatus, selectedPage]);

  const columns = [
    {
      name: "SKU #",
      selector: (row) => row.product.sku,
    },
    {
      name: "ITEM NAME",
      selector: (row) => row.product.name,
    },
    {
      name: "AVAILABLE STOCKS",
      selector: (row) => row.quantity,
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
      cell: (row) => (
        <div
          style={{
            background:
              row.status === "In Stock"
                ? "green"
                : row.status === "Low Stock"
                ? "orange"
                : row.status === "No Stock"
                ? "red"
                : "inherit",
            padding: "5px",
            width: "6em",
            color: "white",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          {row.status}
        </div>
      ),
    },
  ];

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
      cell: (row) => (
        <div
          style={{
            background:
              row.status === "In Stock"
                ? "green"
                : row.status === "Low Stock"
                ? "orange"
                : row.status === "No Stock"
                ? "red"
                : "inherit",
            padding: "5px",
            width: "6em",
            color: "white",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          {row.status}
        </div>
      ),
    },
  ];

  // For Tabs
  const [value, setValue] = useState(0);
  const handlePageChange = (event, newValue) => {
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
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
      if (value == 0) {
        fetchInventory();
      } else if (value == 1) {
        fetchRawMaterialInventory();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedStatus, value]);

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
        ) : authrztn.includes("InventoryStock-View") ? (
          <div className="invent-stock-custom-card inv-card">
            <div className="inventory-stock-container d-flex justify-content-between flex-column flex-sm-row">
              <h2 className="text-nowrap ms-0 mb-3 mb-sm-0">Inventory Stock Lists</h2>
              <div className="d-flex w-100 p-0 justify-content-end">
                <div className="col-12 col-sm-4">
                  <Form.Select
                    aria-label="Default select example"
                    defaultValue=""
                    className="mb-0 col-12 col-sm-4"
                    value={selectedStatus}
                    onChange={handleChange}
                    style={{
                      // height: "50px",
                      // width: "250px",
                      fontSize: "1.3rem",
                      float: "right",
                    }}
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="All Status">All Status</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="In Stock">In Stock</option>
                    <option value="No Stock">No Stock</option>
                  </Form.Select>
                </div>
                {/* <div className="w-50">
              <TextField
                label="Search"
                variant="outlined"
                style={{float: 'right',
                marginTop: '15px'
                }}
                InputLabelProps={{
                  style: { fontSize: '14px'},
                }}
                InputProps={{
                  style: { fontSize: '14px', width: '300px', height: '50px' },
                }}/>
              </div> */}
              </div>
            </div>

            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handlePageChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Products" {...a11yProps(0)} />
                  <Tab label=" Raw Materials" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <div className="table">
                  {filteredInventory.length == 0 ? (
                    <>
                      <div className="no-data-table">
                        <table>
                          <thead>
                            <th>SKU #</th>
                            <th>ITEM NAME</th>
                            <th>AVAILABLE STOCKS</th>
                            <th>STATUS</th>
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
                      <div className="ins-data-table">
                        <DataTable
                          columns={columns}
                          data={filteredInventory}
                          customStyles={customStyles}
                          pagination
                        />
                      </div>
                    </>
                  )}
                </div>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <div className="table">
                  {filteredRawInventory.length == 0 ? (
                    <>
                      <div className="no-data-table">
                        <table>
                          <thead>
                            <th>SKU #</th>
                            <th>ITEM NAME</th>
                            <th>UNIT TYPE</th>
                            <th>AVAILABLE STOCKS</th>
                            <th>STATUS</th>
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
                      <div className="ins-data-table">
                        <DataTable
                          columns={rawColumns}
                          data={filteredRawInventory}
                          customStyles={customStyles}
                          pagination
                        />
                      </div>
                    </>
                  )}
                </div>
              </CustomTabPanel>
            </Box>

            <div className="table">
              {/* <div className="custom-cards"> */}
              {/* <div className="head-container d-flex nav-inven-reports justify-content-around">
                <h2
                  onClick={() => handleSelectedPage("products")}
                  className={selectedPage == "products" ? "active" : ""}
                >
                  Products
                </h2>
                <h2
                  onClick={() => handleSelectedPage("raw-materials")}
                  className={selectedPage == "raw-materials" ? "active" : ""}
                >
                  Raw Materials
                </h2>
              </div> */}
              {/* 
              <div className="table mt-4">
                {selectedPage == "products" ? (
                  <>
                    <div className="table">
                      {filteredInventory.length == 0 ? (
                        <>
                          <div className="no-data-table">
                            <table>
                              <thead>
                                <th>SKU #</th>
                                <th>ITEM NAME</th>
                                <th>AVAILABLE STOCKS</th>
                                <th>STATUS</th>
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
                          <div className="">
                            <DataTable
                              columns={columns}
                              data={filteredInventory}
                              customStyles={customStyles}
                              pagination
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}

                {selectedPage == "raw-materials" ? (
                  <>
                    {filteredRawInventory.length == 0 ? (
                      <>
                        <div className="no-data-table">
                          <table>
                            <thead>
                              <th>SKU #</th>
                              <th>ITEM NAME</th>
                              <th>UNIT TYPE</th>
                              <th>AVAILABLE STOCKS</th>
                              <th>STATUS</th>
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
                          columns={rawColumns}
                          data={filteredRawInventory}
                          customStyles={customStyles}
                          pagination
                        />
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </div> */}
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

export default InventoryStock;
