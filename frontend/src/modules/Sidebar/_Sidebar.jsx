import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "../styles/sidebar.css";
import useStoreRole from "../../stores/useStoreRole";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { blue } from "@mui/material/colors";
const _Sidebar = ({ links }) => {
  const [selected, setSelected] = useState(links[1]?.label || "");
  const { auth } = useStoreRole();

  const handleSelected = (selected) => {
    setSelected(selected);
  };
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to update the window width state
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  // Set up event listener for window resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <nav className="nav justify-content-center" style={{ overflow: "auto" }}>
        <div className="nav-container">
          {/* {links.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              style={{ textDecoration: "none", color: "#000" }}
            >
              {auth.includes(link.auth) ? (
                <>
                  <div
                    className={`link-container ${
                      auth.includes(link.auth) ? "" : "not-include"
                    }`}
                    onClick={() => handleSelected(link.label)}
                  >
                    <i className={`bx ${link.icon}`}></i>
                    <h6>{link.label}</h6>
                  </div>{" "}
                </>
              ) : null}
            </Link>
          ))} */}
          {links.map((link, index) => {
            const isIncluded = link.auth ? auth.includes(link.auth) : true;
            const tooltipStyle = {
              backgroundColor: 'blue', // Change to your desired background color
              color: '#ffffff', // Change to your desired text color
              borderRadius: '4px',
              padding: '20px',
            };
            const tooltip = (
              <Tooltip id="tooltip">
                <strong>{link.label}</strong>
              </Tooltip>
            );
            const linkContent = (
              <Link
                key={index}
                to={link.to}
                style={{ textDecoration: 'none', color: '#000' }}
              >
                <div
                  className={`link-container ${
                    selected === link.label ? 'selected-nav' : ''
                  }${isIncluded ? '' : 'not-include'}`}
                  onClick={() => handleSelected(link.label)}
                >
                  <i className={`bx ${link.icon}`}></i>
                  <h6>{link.label}</h6>
                </div>
              </Link>
            );
            return windowWidth < 1200 ? (
              <OverlayTrigger key={index} placement="right" overlay={tooltip} style={tooltipStyle}>
                {linkContent}
              </OverlayTrigger>
            ) : (
              linkContent
            );
          })}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default _Sidebar;
