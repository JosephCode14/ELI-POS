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
const MainScreen = () => {
  const navigate = useNavigate();
  const [kioskCurrentImages, setKioskCurrentImages] = useState([]);
  const [currentInterval, setCurrentInterval] = useState(3000);

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

  const handleVideoEnded = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const handleEnterKiosk = () => {
    navigate("/kiosk-check");
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
  }, []);

  return (
    <>
      <div className="main-screen-kiosk" onClick={handleEnterKiosk}>
        <div className="kiosk-welcome-container">
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
