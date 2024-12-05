import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";
import React, { useState, useEffect } from "react";
const LoyaltyPoints = ({ authrztn }) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {isLoading ? (
        <div
          className="loading-container"
          style={{ margin: "0", marginLeft: "250px", marginTop: "20%" }}
        >
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("Loyalty-View") ? (
        <div className="loyal-points-container">
          <div className="custom-card loyal-card">
            <div className="loyal-title-container">
              <h2>Loyalty Points Bracket</h2>
              <hr />
              <div className="point-container">
                <div className="first-loyal-container">
                  <div>
                    <h2>Purchase Amount</h2>
                    <input
                      type="text"
                      class="form-control m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div>
                    <h2>Points Redeem</h2>
                    <select
                      className="form-select select-loyalty m-0"
                      aria-label="Default select example"
                    >
                      <option value="Redeem">Redeem Points</option>
                      <option value="Redeem">Discounts</option>
                      <option value="Redeem">Exclusive Products</option>
                    </select>
                  </div>
                </div>
                <h3 className="equivalent-to">Equivalent to =</h3>
                <div className="first-loyal-container">
                  <div>
                    <h2>Points Earned</h2>
                    <input
                      type="text"
                      class="form-control m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div>
                    <h2>Points Expiration</h2>
                    <select
                      className="form-select select-loyalty m-0"
                      aria-label="Default select example"
                    >
                      <option value="Redeem">Expiration</option>
                      <option value="Redeem">No Expiration</option>
                      <option value="Redeem">After 5 Months</option>
                    </select>
                  </div>
                </div>
                <div className="loyal-btn-container">
                  <button>Save</button>
                </div>
              </div>
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

export default LoyaltyPoints;
