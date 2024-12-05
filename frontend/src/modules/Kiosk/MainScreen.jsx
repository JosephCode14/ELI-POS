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
import printerLogo from "../../assets/icon/printer.png";
const MainScreen = () => {
  const navigate = useNavigate();
  const [kioskCurrentImages, setKioskCurrentImages] = useState([]);
  const [currentInterval, setCurrentInterval] = useState(3000);
  const [idleTime, setIdleTime] = useState();
  const [activeIndex, setActiveIndex] = useState(0);

  const { kioskImages, setKioskImages } = useStoreKioskImages();

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

  useEffect(() => {
    console.log("Socket", socket);
  }, [socket]);

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

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - 50, // Adjust for center of the box
      y: e.clientY - 50,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - 50,
      y: touch.clientY - 50,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    console.log("Online or Off", online);
  }, [online]);
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
          <h1>Welcome t</h1>
          {/* <div className="float-end bg-primary w-100">
            <div className="version">
              <p>v.1.0</p>
            </div>
           
          </div> */}
          <Link to="/" style={{ color: "black", textDecoration: "none" }}>
            <div
              className="logout mt-5 "
              onClick={() => {
                localStorage.removeItem("accessToken");
              }}
            >
              {/* <i class="bx bx-log-out-circle bx-rotate-90 logout-i"></i> */}
              <h1 className="text-dark" style={{ cursor: "text" }}>
                o{" "}
              </h1>
              {/* <p>Logout</p> */}
            </div>
          </Link>

          <h1 className="mx-3"> BUON TAVOLO</h1>

          <div
            style={{
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: "50px",
              height: "50px",
              background: "#b0fc38",
              borderRadius: "50%",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={printerLogo}
              alt="logo"
              style={{
                height: "25px",
                width: "25px",
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
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
    </>
  );
};

export default MainScreen;
