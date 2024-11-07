import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "../styles/sidebar.css";
import useStoreRole from "../../stores/useStoreRole";
const _Sidebar = ({ links }) => {
  const [selected, setSelected] = useState(links[1]?.label || "");
  const { auth } = useStoreRole();

  const handleSelected = (selected) => {
    setSelected(selected);
  };

  return (
    <>
      <nav className="nav" style={{ overflow: "auto" }}>
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
            return (
              <Link
                key={index}
                to={link.to}
                style={{ textDecoration: "none", color: "#000" }}
              >
                {isIncluded ? (
                  <div
                    className={`link-container ${
                      selected == link.label ? "selected-nav" : ""
                    }${isIncluded ? "" : "not-include"}`}
                    onClick={() => handleSelected(link.label)}
                  >
                    <i className={`bx ${link.icon}`}></i>
                    <h6>{link.label}</h6>
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default _Sidebar;
