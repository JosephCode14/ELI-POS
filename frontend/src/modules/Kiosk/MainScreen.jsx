import React, { useState, useEffect, useRef } from "react";
import mainScreen from "../../assets/icon/pizza.jpg";
import "../styles/kiosk-main.css";
import touch from "../../assets/icon/touch.jpg";
import Carousel from "react-bootstrap/Carousel";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import useStoreUserType from "../../stores/useStoreUserType";
import { jwtDecode } from "jwt-decode";
import useStoreKioskImages from "../../stores/useStoreKioskImages";
import { useWebSocket } from "../../contexts/WebSocketProvider";

import swal from "sweetalert";
import { Button, Modal, Form } from "react-bootstrap";
import PrinterStatusModal from "./PrinterStatusComponent/PrinterStatusModal";
import KioskPrinterStatus from "./PrinterStatusComponent/KioskPrinterStatus";
import testJSON from "../../assets/global/testprint";
const MainScreen = () => {
  const navigate = useNavigate();
  const [kioskCurrentImages, setKioskCurrentImages] = useState([]);
  const [currentInterval, setCurrentInterval] = useState(3000);
  const [idleTime, setIdleTime] = useState();
  const [activeIndex, setActiveIndex] = useState(0);

  const clickCountRef = useRef(0);

  const { kioskImages, setKioskImages } = useStoreKioskImages();

  const [connectionModal, setConnectionModal] = useState(false);

  // const handleEnterKiosk = () => {
  //   navigate("/kiosk-order-type");
  // };

  const videoRefs = useRef([]);
  const carouselRef = useRef(null);

  const handleVideoLoaded = (e, index) => {
    const videoDuration = e.target.duration * 1000;
    setCurrentInterval(videoDuration);
    videoRefs.current[index] = e.target;

    if (index === activeIndex) {
      setCurrentInterval(videoDuration - 500);
    }
  };
  const handleSlideChange = (selectedIndex) => {
    setActiveIndex(selectedIndex);
    // Set the interval based on the media type
    const media = kioskImages[selectedIndex];
    if (media && media.type.startsWith("video")) {
      // Reset the interval if video is active
      const video = videoRefs.current[selectedIndex];
      if (video) {
        video.currentTime = 0;
        video.play();
        const videoDuration = video.duration * 1000;
        setCurrentInterval(videoDuration - 500);
      }
    } else {
      // Set a default interval for images
      setCurrentInterval(3000);
    }
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    const fetchedIdleTime = parseFloat(res.data.idle_time);
    setIdleTime(fetchedIdleTime);
  };

  const handleVideoEnded = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const { printerStatusWeb, socket, online } = useWebSocket();

  const handleEnterKiosk = () => {
    navigate("/kiosk-check", {
      state: {
        idleTime,
      },
    });
  };

  const handleFetchImages = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/kiosk_settings/fetchKioskImgs`
      );

      // setKioskCurrentImages(response.data);
      setKioskImages(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    handleFetchImages();
    handleFetchProfile();
  }, []);

  const handleTestPrint = (e) => {
    swal({
      icon: "warning",
      title: `Perform test print for both kiosk and kitchen printer?`,
      timer: 10 * 1000,
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
        if (socket && socket.readyState === WebSocket.OPEN) {
          const jsonData = JSON.stringify(testJSON);

          socket.send(jsonData);

          clickCountRef.current = 0;

          if (window.testPrinterAndPrint) {
            const result = await window.testPrinterAndPrint();
            // alert(result);
          } else {
            // alert("Printing functionality not available in this environment");
          }
        } else {
          console.log("WebSocket not connected");
          clickCountRef.current = 0;
        }
      } else if (value === "NO") {
        swal.close();
        clickCountRef.current = 0;
      } else {
        swal.close();
      }
    });
  };

  const handleTripleClick = (e) => {
    e.stopPropagation();

    // Increment the click count in the ref
    clickCountRef.current += 1;

    console.log("Click", clickCountRef.current);

    // Check for triple click
    if (clickCountRef.current === 3) {
      handleTestPrint();
    }

    setTimeout(() => {
      clickCountRef.current = 0;
    }, 500);
  };

  const handleLogoutKiosk = (e) => {
    e.stopPropagation();
    navigate("/");
    localStorage.removeItem("accessToken");
  };
  return (
    <>
      <div className="main-screen-kiosk" onClick={handleEnterKiosk}>
        <div
          className="kiosk-welcome-container"
          style={{
            background: online
              ? "linear-gradient(180deg, rgba(143,247,50,1) 0%, rgba(175,241,141,1) 4%, rgba(255,255,255,1) 13%)"
              : "linear-gradient(180deg, rgba(252,107,107,1) 0%, rgba(250,224,224,1) 8%, rgba(255,255,255,1) 13%)",
          }}
        >
          <h1>
            <span onClick={handleTripleClick}>W</span>
            elcome t
          </h1>
          {/* <div className="float-end bg-primary w-100">
            <div className="version">
              <p>v.1.0</p>
            </div>
           
          </div> */}
          {/* <Link to="/" style={{ color: "black", textDecoration: "none" }}> */}

          {/* <i class="bx bx-log-out-circle bx-rotate-90 logout-i"></i> */}
          <h1 className="text-dark" style={{ cursor: "text" }}>
            <span
              onDoubleClick={handleLogoutKiosk}
              onClick={(e) => e.stopPropagation()}
            >
              o{" "}
            </span>
          </h1>
          {/* <p>Logout</p> */}

          {/* </Link> */}

          <h1 className="mx-3"> BUON TAVOLO</h1>
        </div>

        <Carousel
          fade
          interval={currentInterval}
          onSelect={handleSlideChange}
          ref={carouselRef}
        >
          {kioskImages && kioskImages.length > 0 ? (
            kioskImages.map((media, index) => (
              <Carousel.Item key={index}>
                {media.type.startsWith("image") ? (
                  <img
                    src={`data:image/png;base64,${media.kiosk_img}`}
                    alt={`Kiosk Media ${index}`}
                    onLoad={() => setCurrentInterval(3000)}
                  />
                ) : media.type.startsWith("video") ? (
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={`data:video/mp4;base64,${media.kiosk_img}`}
                    autoPlay
                    muted
                    loop
                    onLoadedMetadata={(e) => handleVideoLoaded(e, index)}
                    onEnded={handleVideoEnded}
                  />
                ) : null}
              </Carousel.Item>
            ))
          ) : (
            <Carousel.Item>
              <img src={mainScreen} alt="Default Image" />
            </Carousel.Item>
          )}
        </Carousel>

        <div className="kiosk-foot-container">
          <h1>TAP ANYWHERE TO ORDER</h1>
          <div className="d-grid align-items-center">
            <img src={touch} />
          </div>
        </div>
      </div>

      <KioskPrinterStatus setConnectionModal={setConnectionModal} />

      <PrinterStatusModal
        connectionModal={connectionModal}
        setConnectionModal={setConnectionModal}
      />
    </>
  );
};

export default MainScreen;
