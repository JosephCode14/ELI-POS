import React, { useState, useEffect, useRef } from "react";
import "../styles/header.css";
import user from "../../assets/image/user.jpg";
import { jwtDecode } from "jwt-decode";
const Header = () => {
  const [Fname, setFname] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setuserId] = useState("");

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setUsername(decoded.username);
      setFname(decoded.Fname);
      setuserId(decoded.id);
    }
  };
  useEffect(() => {
    decodeToken();
  }, []);
  return (
    <header>
      <div className="title-container">
        <h2>
          <span className="blue">POS</span> <span className="orange">WITH</span>{" "}
          <span className="green">RFID</span>
        </h2>
      </div>
      <div className="icons-container">
        {/* <i class="bx bxs-envelope"></i>
        <i class="bx bxs-bell"></i> */}
        <div className="acct-container">
          <div className="img-container">
            <img src={user} />
          </div>
          <div className="acc-details">
            <span className="user-name">
              {username.length > 10
                ? `${username.substring(0, 10)}...`
                : username}
            </span>
            <span className="user-type fw-bold">
              {Fname.length > 30 ? `${Fname.substring(0, 30)}...` : Fname}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
