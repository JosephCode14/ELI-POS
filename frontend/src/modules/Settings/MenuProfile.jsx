import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/settings.css";
// import "../styles/pos_react.css";
import storeLogo from "../../assets/icon/store-logo.jpg";
import qrCode from "../../assets/icon/qr-code.jpg";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import axios from "axios";
import QRCode from "qrcode";
import swal from "sweetalert";
import { jwtDecode } from "jwt-decode";
import { FourSquare } from "react-loading-indicators";
import useStoreIP from "../../stores/useStoreIP";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

function MenuProfile({ authrztn }) {
  const [userId, setuserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { setIP, ip } = useStoreIP();

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

  const [storeCode, setStoreCode] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeCountry, setStoreCountry] = useState("");
  const [storeImage, setStoreImage] = useState("");
  const [ipPrinter, setIPPrinter] = useState("");
  const [url, setUrl] = useState("");
  const [qrData, setQrData] = useState("");
  const [mealPrice, setMealPrice] = useState();
  const [idleTime, setIdleTime] = useState();

  const fileInputRefs = useRef(null);

  const handleSelectImage = () => {
    fileInputRefs.current.click();
  };
  function isValidIPAddress(ip) {
    const ipPattern =
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
    return ipPattern.test(ip);
  }

  function validateStudentPrice(input) {
    const regex = /^\d{1,3}$/;
    return regex.test(input);
  }

  const handleoOnFileSelect = (event) => {
    const selectedFile = event.target.files[0]; // Assuming only one file is selected
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB LIMIT

    if (
      selectedFile &&
      allowedTypes.includes(selectedFile.type) &&
      selectedFile.size <= maxSize
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        setStoreImage(base64String);
      };
    } else {
      swal({
        icon: "error",
        title: "File Selection Error",
        text: "Please select a valid image file (PNG, JPEG, JPG, or WEBP) with a maximum size of 5MB.",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (mealPrice <= 0) {
      swal({
        icon: "error",
        title: "Invalid Price",
        text: "Please input a valid value for meal price",
      });
      return;
    }

    // if (ipPrinter != "" && !isValidIPAddress(ipPrinter)) {
    //   swal({
    //     icon: "warning",
    //     title: "Invalid IP Address",
    //     text: "Please input valid IP address",
    //   });
    //   return;
    // }

    if (!validateStudentPrice(mealPrice)) {
      swal({
        icon: "warning",
        title: "Invalid Student Meal Price",
        text: "The price should be a whole number not exceeding three digits",
      });
      return;
    }

    const regexZero = /^0/g;
    if (idleTime && regexZero.test(idleTime)) {
      swal({
        icon: "warning",
        title: "Invalid Idle Time",
        text: "Idle time should be greater than 0",
      });
      return;
    }

    const res = await axios.put(`${BASE_URL}/store_profile/save_profile`, {
      userId,
      storeCode,
      storeName,
      storeCountry,
      storeImage,
      ipPrinter,
      mealPrice,
      idleTime,
    });

    if (res.status == 200) {
      swal({
        icon: "success",
        title: "Profile successfully saved!",
      }).then(() => {
        setIP(ipPrinter);
        console.log("Meal Price", mealPrice);
      });
    }
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreCode(res.data.store_code);
    setStoreName(res.data.store_name);
    setStoreCountry(res.data.store_country);
    setStoreImage(res.data.image);
    setIsLoading(false);
    setIPPrinter(res.data.store_ip);
    setMealPrice(res.data.store_student_meal_price);
    setIP(res.data.store_ip);
    setIdleTime(res.data.idle_time);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFetchProfile();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateQR = () => {
    if (url == "") {
      swal({
        icon: "error",
        title: "No input text to convert",
        text: "Please input a text",
      }).then(() => {
        setQrData("");
      });
    }
    QRCode.toDataURL(
      url,
      {
        width: 280,
        margin: 2,
      },
      (err, url) => {
        if (err) return console.error(err);

        setQrData(url);
      }
    );
  };

  // For Tabs
  const [value, setValue] = useState(0);
  const handlePageChange = (event, newValue) => {
    setValue(newValue);
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
      ) : authrztn.includes("MenuProfile-View") ? (
        <>
          {windowWidth < 769 ? (
            <>
              <div className="menu-profile-container w-100">
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handlePageChange}
                    aria-label="basic tabs"
                  >
                    <Tab label="Menu Profile" {...a11yProps(0)} />
                    <Tab label="Generate QR Code" {...a11yProps(1)} />
                  </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                  <>
                    <div className="first-menu-profile w-100">
                      <div className="menu-details pt-0">
                        <div className="menu-inputs ps-0 pt-0">
                          <div className="menu-input-container">
                            <h3>Store Code</h3>
                            <input
                              type="text"
                              class="form-control m-0"
                              aria-describedby="addon-wrapping"
                              value={storeCode}
                              onChange={(e) => setStoreCode(e.target.value)}
                            />
                          </div>
                          <div className="menu-input-container">
                            <h3>Store Name</h3>
                            <input
                              type="text"
                              class="form-control m-0"
                              aria-describedby="addon-wrapping"
                              value={storeName}
                              maxLength={10}
                              onChange={(e) => {
                                if (e.target.value.length <= 10) {
                                  setStoreName(e.target.value);
                                }
                              }}
                              key={"store-name"}
                            />
                            <label htmlFor="">
                              Store name may appear within the system. You can
                              remove it anytime
                            </label>
                          </div>

                          <div className="menu-input-container">
                            <h3>Country</h3>

                            <input
                              type="text"
                              class="form-control m-0"
                              aria-describedby="addon-wrapping"
                              value={storeCountry}
                              onChange={(e) => setStoreCountry(e.target.value)}
                            />
                          </div>

                          <div className="menu-input-container">
                            <h3>IP for Printer</h3>
                            <input
                              type="text"
                              class="form-control m-0"
                              aria-describedby="addon-wrapping"
                              value={ipPrinter}
                              onChange={(e) => setIPPrinter(e.target.value)}
                            />
                          </div>

                          <div className="menu-input-container">
                            <h3>Student Meal Price</h3>

                            <input
                              type="number"
                              class="form-control m-0"
                              aria-describedby="addon-wrapping"
                              value={mealPrice}
                              onChange={(e) => setMealPrice(e.target.value)}
                            />
                          </div>

                          <div className="menu-input-container">
                            <h3>Kiosk Idle Time &#40;In Seconds&#41;</h3>

                            <input
                              type="number"
                              class="form-control m-0"
                              aria-describedby="addon-wrapping"
                              value={idleTime}
                              onChange={(e) => setIdleTime(e.target.value)}
                              onKeyDown={(e) => {
                                ["e", "E", "-", "+", "."].includes(e.key) &&
                                  e.preventDefault();
                              }}
                            />
                          </div>

                          <div className="menu-save-container">
                            {authrztn?.includes("MenuProfile-Add") && (
                              <button onClick={handleSaveProfile}>Save</button>
                            )}
                          </div>
                        </div>
                        <div className="menu-logo">
                          <h3>Store Logo</h3>

                          <img
                            src={
                              storeImage
                                ? `data:image/png;base64,${storeImage}`
                                : storeLogo
                            }
                            alt="Store"
                          />

                          <button onClick={handleSelectImage}>
                            Edit Image
                          </button>

                          <input
                            type="file"
                            className="file"
                            style={{ display: "none" }}
                            name="file"
                            ref={fileInputRefs}
                            onChange={handleoOnFileSelect}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                  <div className="second-menu-profile">
                    <div className="qr-title-container"></div>
                    <div className="qr-container pt-0 px-0">
                      <div className="qr-generate">
                        <h4>Input your website link here</h4>
                        <input
                          type="text"
                          class="form-control m-0"
                          placeholder="https://website-example.com/"
                          aria-describedby="addon-wrapping"
                          onChange={(e) => setUrl(e.target.value)}
                          value={url}
                        />
                        <div className="qr-btn-container">
                          <button onClick={handleGenerateQR}>
                            Generate QR Code
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="qr-code-container">
                      <h4>Website QR Code</h4>

                      {qrData ? (
                        <>
                          <img src={qrData} />
                        </>
                      ) : (
                        <img src={qrCode} />
                      )}

                      {qrData !== "" ? (
                        <a href={qrData} download="qr-code.png">
                          <h4 className="save-qr">Save this QR Code</h4>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </CustomTabPanel>
              </div>
            </>
          ) : (
            <>
              <div className="menu-profile-container">
                <div className="first-menu-profile">
                  <div className="menu-title-container">
                    <h2>Menu Profile</h2>
                  </div>
                  <div className="menu-details">
                    <div className="menu-inputs">
                      <div className="menu-input-container">
                        <h3>Store Code</h3>
                        <input
                          type="text"
                          class="form-control m-0"
                          aria-describedby="addon-wrapping"
                          value={storeCode}
                          onChange={(e) => setStoreCode(e.target.value)}
                        />
                      </div>
                      <div className="menu-input-container">
                        <h3>Store Name</h3>
                        <input
                          type="text"
                          class="form-control m-0"
                          aria-describedby="addon-wrapping"
                          value={storeName}
                          maxLength={10}
                          onChange={(e) => {
                            if (e.target.value.length <= 10) {
                              setStoreName(e.target.value);
                            }
                          }}
                        />
                        <label htmlFor="">
                          Store name may appear within the system. You can
                          remove it anytime
                        </label>
                      </div>

                      <div className="menu-input-container">
                        <h3>Country</h3>

                        <input
                          type="text"
                          class="form-control m-0"
                          aria-describedby="addon-wrapping"
                          value={storeCountry}
                          onChange={(e) => setStoreCountry(e.target.value)}
                        />
                      </div>

                      {/* <div className="menu-input-container">
                        <h3>IP for Printer</h3>
                        <input
                          type="text"
                          class="form-control m-0"
                          aria-describedby="addon-wrapping"
                          value={ipPrinter}
                          onChange={(e) => setIPPrinter(e.target.value)}
                        />
                      </div> */}

                      <div className="menu-input-container">
                        <h3>Student Meal Price</h3>

                        <input
                          type="number"
                          class="form-control m-0"
                          aria-describedby="addon-wrapping"
                          value={mealPrice}
                          onChange={(e) => setMealPrice(e.target.value)}
                        />
                      </div>

                      <div className="menu-input-container">
                        <h3>Kiosk Idle Time &#40;In Seconds&#41;</h3>

                        <input
                          type="number"
                          class="form-control m-0"
                          aria-describedby="addon-wrapping"
                          value={idleTime}
                          onChange={(e) => setIdleTime(e.target.value)}
                          onKeyDown={(e) => {
                            ["e", "E", "-", "+", "."].includes(e.key) &&
                              e.preventDefault();
                          }}
                        />
                      </div>

                      <div className="menu-save-container">
                        {authrztn?.includes("MenuProfile-Add") && (
                          <button onClick={handleSaveProfile}>Save</button>
                        )}
                      </div>
                    </div>
                    <div className="menu-logo">
                      <h3>Store Logo</h3>

                      <img
                        src={
                          storeImage
                            ? `data:image/png;base64,${storeImage}`
                            : storeLogo
                        }
                        alt="Store"
                      />

                      <button onClick={handleSelectImage}>Edit Image</button>

                      <input
                        type="file"
                        className="file"
                        style={{ display: "none" }}
                        name="file"
                        ref={fileInputRefs}
                        onChange={handleoOnFileSelect}
                      />
                    </div>
                  </div>
                </div>
                <div className="second-menu-profile">
                  <div className="qr-title-container"></div>
                  <div className="qr-container">
                    <div className="qr-generate">
                      <h3>Generate QR Code</h3>
                      <h4>Input your website link here</h4>
                      <input
                        type="text"
                        class="form-control m-0"
                        placeholder="https://website-example.com/"
                        aria-describedby="addon-wrapping"
                        onChange={(e) => setUrl(e.target.value)}
                        value={url}
                      />
                      <div className="qr-btn-container">
                        <button onClick={handleGenerateQR}>
                          Generate QR Code
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="qr-code-container">
                    <h4>Website QR Code</h4>

                    {qrData ? (
                      <>
                        <img src={qrData} />
                      </>
                    ) : (
                      <img src={qrCode} />
                    )}

                    {qrData !== "" ? (
                      <a href={qrData} download="qr-code.png">
                        <h4 className="save-qr">Save this QR Code</h4>
                      </a>
                    ) : null}
                  </div>
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
}

export default MenuProfile;
