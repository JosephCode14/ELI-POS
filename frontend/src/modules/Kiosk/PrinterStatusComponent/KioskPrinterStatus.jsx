import React, { useState } from "react";
import printerLogo from "../../../assets/icon/printer.png";

const KioskPrinterStatus = ({ setConnectionModal }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 815, y: 10 });

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
  return (
    <>
      {" "}
      <div
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "50px",
          height: "50px",
          background: "#d1ecff",
          borderRadius: "50%",
          color: "white",
          display: "flex",
          alignItems: "center",
          zIndex: 999,
          justifyContent: "center",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
        // onTouchStart={handleTouchStart}
        // onTouchMove={handleTouchMove}
        // onTouchEnd={handleTouchEnd}
        onClick={() => setConnectionModal(true)}
      >
        <img
          src={printerLogo}
          alt="logo"
          style={{
            height: "25px",
            width: "25px",
            // filter: "brightness(0) invert(1)",
          }}
        />

        {/* Drag */}
      </div>
    </>
  );
};

export default KioskPrinterStatus;
