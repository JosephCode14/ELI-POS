import React, { useState, useRef, useEffect } from "react";
import uploadVid from "../../assets/icon/upload-vid.png";
import swal from "sweetalert";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import TestPrintReceipt from "./TestPrintReceipt";
import KioskImage from "./KioskImage";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

const HardwareSettings = ({ authrztn }) => {
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("TestPrint");

  const fileInputRef = useRef(null);

  const selectFile = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleChangeTab = (selected) => {
    setSelectedTab(selected);
  };

  // For Tabs
  const [value, setValue] = useState(0);
  const handlePageChange = (event, newValue) => {
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
        className="px-4 overflow-auto"
        style={{ height: "80vh" }}
      >
        {value === index && <Box>{children}</Box>}
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
    <>
      {isLoading ? (
          <div
            className="d-flex justify-content-center flex-column vh-100 ms-5 ps-5 align-items-center"
            // style={{ margin: "0" }}
          >
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("Hardware-View") ? (
          <>
            {windowWidth < 769 ? (
              <>
                <div className="hardware-settings-container d-block">
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      value={value}
                      onChange={handlePageChange}
                      aria-label="basic tabs"
                    >
                      <Tab label="Test Print" {...a11yProps(0)} />
                      <Tab label="Kiosk Image Settings" {...a11yProps(1)} />
                    </Tabs>
                  </Box>
                  <CustomTabPanel value={value} index={0}>
                    <>
                      <TestPrintReceipt />
                    </>
                  </CustomTabPanel>
                  <CustomTabPanel value={value} index={1}>
                    <>
                      <KioskImage />
                    </>
                  </CustomTabPanel>
                </div>
              </>
            ) : (
              <>
                <div className="hardware-settings-container">
                  <div className="hardware-settings-nav custom-card">
                    <div className="hardware-title-container">
                      <h2>Hardware Settings</h2>
                      <hr />
                    </div>
                    <div className="hardware-nav-container">
                      {/* <div
                className="hardware-nav"
                onClick={() => handleChangeTab("DualMonitor")}
              >
                <h3>Dual Monitoring Setting</h3>
              </div> */}
                      <div
                        className="hardware-nav"
                        onClick={() => handleChangeTab("TestPrint")}
                      >
                        <h3>Test Print</h3>
                      </div>
                      <div
                        className="hardware-nav"
                        onClick={() => handleChangeTab("KioskImg")}
                      >
                        <h3>Kiosk Image Settings</h3>
                      </div>
                      {/* <div className="hardware-nav">
                <h3>Local Printing Settings</h3>
              </div>
              <div className="hardware-nav">
                <h3>Cash Drawing Setting</h3>
              </div> */}
                    </div>
                  </div>
                  <div className="hardware-content custom-card">
                    {/* {selectedTab == "DualMonitor" && (
              <>
                <div className="hardware-main">
                  <div className="hardware-content-title-container">
                    <div className="hardware-title">
                      <i class="bx bx-chevron-right"></i>
                      <h2 className="">Dual Monitor Setting</h2>
                    </div>

                    <div className="switch-capstone">
                      <label class="switch">
                        <input type="checkbox" />
                        <span class="slider round"></span>
                      </label>
                    </div>
                  </div>
                  <hr />
                  <div className="dual-monitor-container">
                    <div className="dual-content">
                      <ul>
                        <li>
                          <h3>Select Screen Orientation</h3>
                        </li>
                      </ul>

                      <select
                        className="form-select select-loyalty m-0"
                        aria-label="Default select example"
                      >
                        <option value="orientation">Orientation</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Landscape">Landscape</option>
                      </select>
                    </div>
                    <div className="dual-content">
                      <ul>
                        <li>
                          <h3>Dual Monitor Display</h3>
                        </li>
                      </ul>
                      <select
                        className="form-select select-loyalty m-0"
                        aria-label="Default select example"
                      >
                        <option value="Customer Display">
                          Customer Display
                        </option>
                        <option value="Enable">Enable</option>
                        <option value="Disable">Disable</option>
                      </select>
                    </div>
                    <div className="dual-content">
                      <ul>
                        <li>
                          <h3>Upload Video / Image</h3>
                        </li>
                      </ul>
                      <div className="hardware-upload">
                        <div className="hardware-upload-container">
                          <img src={uploadVid} />
                          <button onClick={selectFile}> Upload</button>
                          <input
                            name="file"
                            type="file"
                            className="file"
                            ref={fileInputRef}
                            // onChange={(e) => onFileSelect(e)}
                          />
                        </div>
                        <div className="preview-display">
                          <h3>Preview Display</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hardware-content-title-container">
                    <div className="hardware-title">
                      <i class="bx bx-chevron-right"></i>
                      <h2 className="">Kiosk Display Setting</h2>
                    </div>
                  </div>
                  <hr />
                  <div className="kiosk-display-container">
                    <div className="kiosk-display-content">
                      <ul>
                        <li>
                          <h3>Continuous Display Image or Advertising Ads</h3>
                        </li>
                      </ul>
                      <div className="switch-capstone">
                        <label class="switch">
                          <input type="checkbox" />
                          <span class="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )} */}
                    {selectedTab == "TestPrint" && (
                      <>
                        <TestPrintReceipt />
                      </>
                    )}
                    {selectedTab == "KioskImg" && (
                      <>
                        <KioskImage />
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
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

export default HardwareSettings;
