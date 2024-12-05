import React, { useEffect, useState } from "react";
import _Sidebar from "../Sidebar/_Sidebar";
// import "../styles/pos_react.css";
import { Button, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import noData from "../../assets/icon/no-data.png";
import { customStyles } from "../styles/table-style";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { jwtDecode } from "jwt-decode";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

const ArchiveProduct = ({ authrztn }) => {
  const [selectedPage, setSelectedPage] = useState("archive-product");
  const [archiveRaw, setArchiveRaw] = useState([]);
  const [archiveData, setArchiveData] = useState([]);
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSelectedPage = (selected) => {
    setIsLoading(true);
    setSelectedPage(selected);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const archiveRawColumn = [
    {
      name: "ARCHIVE TIME",
      selector: (row) => row.archive_raw_time,
      format: (row) => {
        const date = new Date(row.createdAt);
        return date.toLocaleString();
      },
    },
    {
      name: "RAW MATERIAL NAME",
      selector: (row) => row.raw_material.material_name,
    },
    {
      name: "UNIT PRICE",
      selector: (row) => row.raw_material.unit_price,
    },
    {
      name: "REMARKS",
      selector: (row) => row.remarks,
    },
  ];

  const columns = [
    {
      name: "ARCHIVE TIME",
      selector: (row) => row.archive_time,
      format: (row) => {
        const date = new Date(row.createdAt);
        return date.toLocaleString();
      },
    },
    {
      name: "PRODUCT / ITEM",
      selector: (row) => row.product.name,
    },
    {
      name: "UNIT PRICE",
      selector: (row) => row.product.price,
    },
    {
      name: "REMARKS",
      selector: (row) => row.remarks,
    },
  ];

  const fetchArchiveRawData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/rawmaterial/get-archiveraw`);
      setArchiveRaw(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  const fetchArchiveData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/product/get-archive`);
      setArchiveData(res.data);
      setIsLoading(false);
    } catch (error) {
      // console.error(error);
      setIsLoading(true);
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (selectedPage === "archive-product") {
  //       fetchArchiveData();
  //     } else if (selectedPage === "archive-raw") {
  //       fetchArchiveRawData();
  //     }
  //   }, 1500);
  //   return () => clearTimeout(timer);
  // }, [selectedPage]);

  const handleRetrieveRawMaterial = async (row) => {
    if (authrztn.includes("Archive-Delete")) {
      try {
        swal({
          text: "Do you want to retrieve this raw material?",
          icon: "warning",
          buttons: {
            cancel: "No",
            confirm: "Yes",
          },
        }).then(async (confirmed) => {
          if (confirmed) {
            const res = await axios.put(
              `${BASE_URL}/rawmaterial/un-archive/${row.raw_material_id}?userId=${userId}`
            );
            fetchArchiveRawData();
            swal({
              title: "Retrieved",
              text: "The raw material successfully retrieved",
              icon: "success",
            });
          } else {
            swal.close();
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRetrieveProduct = async (row) => {
    if (authrztn.includes("Archive-Delete")) {
      try {
        swal({
          text: "Do you want to retrieve this product?",
          icon: "warning",
          buttons: {
            cancel: "No",
            confirm: "Yes",
          },
        }).then(async (confirmed) => {
          if (confirmed) {
            const res = await axios.put(
              `${BASE_URL}/product/un-archive/${row.product_id}?userId=${userId}`
            );
            console.log(res.data);
            fetchArchiveData();
            swal({
              title: "Retrieved",
              text: "The product successfully retrieved",
              icon: "success",
            });
          } else {
            swal.close();
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredProduct = archiveData.filter(
    (item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.price.toString().includes(searchQuery) ||
      item.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRaw = archiveRaw.filter(
    (item) =>
      item.raw_material.material_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.raw_material.unit_price.toString().includes(searchQuery) ||
      item.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For Tabs
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setIsLoading(true);
    setValue(newValue);

    // setSelectedPage(newValue == 0 ? "archive-product" : "archive-raw");
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
      if (value === 0) {
        fetchArchiveData();
      } else if (value === 1) {
        fetchArchiveRawData();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [value]);

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
      ) : authrztn.includes("Archive-View") ? (
        <div className="archive-product-container">
          <div className="inventory-stock-container d-flex">
            <h2 className="w-50">Archive Table</h2>
            <div className="m-0 w-50">
              <input
                type="text"
                className="form-control m-0 search d-block d-sm-none"
                placeholder="Search sku / Item Name"
                aria-describedby="addon-wrapping"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="table">
            <div className="">
              {/* <div className="head-container d-flex nav-inven-reports justify-content-around">
                <h2
                  onClick={() => handleSelectedPage("archive-product")}
                  className={selectedPage == "archive-product" ? "active" : ""}
                >
                  Archive Product
                </h2>
                <h2
                  onClick={() => handleSelectedPage("archive-raw")}
                  className={selectedPage == "archive-raw" ? "active" : ""}
                >
                  Archive Raw Materials
                </h2>
              </div> */}

              <Box sx={{ width: "100%" }}>
                <Box
                  className="d-flex justify-content-between"
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                  >
                    <Tab label="Archive Product" {...a11yProps(0)} />
                    <Tab label="Archive Raw Materials" {...a11yProps(1)} />
                  </Tabs>
                  <div className="m-0 w-25 d-none d-sm-block">
                    <input
                      type="text"
                      className="form-control m-0 search"
                      placeholder="Search sku / Item Name"
                      aria-describedby="addon-wrapping"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </Box>
                <CustomTabPanel value={value} index={0}>
                  <div className="table">
                    {filteredProduct.length == 0 ? (
                      <>
                        <div className="no-data-table ">
                          <table>
                            <thead>
                              <th>ARCHIVE TIME</th>
                              <th>PRODUCT/ITEM</th>
                              <th>UNIT PRICE</th>
                              <th>REMARKS</th>
                            </thead>
                            <tbody>
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
                        <div className="arc-data-table">
                          <DataTable
                            columns={columns}
                            data={filteredProduct}
                            customStyles={customStyles}
                            pagination
                            onRowClicked={handleRetrieveProduct}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  {filteredRaw.length == 0 ? (
                    <>
                      <div className="no-data-table ">
                        <table>
                          <thead>
                            <th>ARCHIVE TIME</th>
                            <th>PRODUCT/ITEM</th>
                            <th>UNIT PRICE</th>
                            <th>REMARKS</th>
                          </thead>
                          <tbody>
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
                      <div className="arc-data-table">
                        <DataTable
                          columns={archiveRawColumn}
                          data={filteredRaw}
                          customStyles={customStyles}
                          pagination
                          onRowClicked={handleRetrieveRawMaterial}
                        />
                      </div>
                    </>
                  )}
                </CustomTabPanel>
              </Box>

              {/* <div className="table mt-4">
                {selectedPage == "archive-product" ? (
                  <>
                    <DataTable
                      columns={columns}
                      data={filteredProduct}
                      customStyles={customStyles}
                      pagination
                      onRowClicked={handleRetrieveProduct}
                    />
                  </>
                ) : (
                  <></>
                )}

                {selectedPage == "archive-raw" ? (
                  <>
                    <DataTable
                      columns={archiveRawColumn}
                      data={filteredRaw}
                      customStyles={customStyles}
                      pagination
                      onRowClicked={handleRetrieveRawMaterial}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div> */}
            </div>
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
    </>
  );
};

export default ArchiveProduct;
