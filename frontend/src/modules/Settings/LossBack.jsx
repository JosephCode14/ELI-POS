import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import NoAccess from "../../assets/image/NoAccess.png";
import { FourSquare } from "react-loading-indicators";

const LossBack = ({ authrztn }) => {
  const [newMsgTab, setNewMsgTab] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      name: "USER NAME",
      selector: (row) => row.username,
    },
    {
      name: "EMAIL ADDRESS",
      selector: (row) => row.email,
    },
    {
      name: "SUBJECT / MESSAGE",
      selector: (row) => row.message,
    },
    {
      name: "DATE AND TIME",
      selector: (row) => row.date,
    },
  ];
  const data = [
    {
      username: "ELI IT Solutions",
      email: "elogicinnovations@gmail.com",
      message: "New Promo Sales",
      date: "2021-06-09",
    },
  ];

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
      ) : authrztn.includes("LossBack-View") ? (
        <div className="loss-back-container">
          <div
            className="loss-main-tab"
            style={newMsgTab ? { width: "65%" } : { width: "100%" }}
          >
            <div className="loss-title-container">
              <h2>Loss Back Customer</h2>
              <button
                className="new-msg-btn"
                onClick={() => setNewMsgTab(!newMsgTab)}
              >
                New Message
              </button>
            </div>
            <hr />
            <div className="table">
              <DataTable
                columns={columns}
                data={data}
                customStyles={customStyles}
                pagination
              />
            </div>
          </div>
          {newMsgTab ? (
            <>
              <div className="new-msg-container">
                <h2>New Message: </h2>
                <div className="msg-input-container">
                  <div>
                    <h3>Subject</h3>
                    <input
                      type="text"
                      class="form-control m-0"
                      placeholder="Enter Subject"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div>
                    <h3>Recepient</h3>
                    <input
                      type="text"
                      class="form-control m-0"
                      placeholder="Enter Recepient"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div>
                    <h3>Message</h3>
                    <div class="form-floating">
                      <textarea
                        class="form-control mb-0"
                        placeholder="Leave a comment here"
                        id="floatingTextarea"
                        style={{ height: "100px" }}
                      ></textarea>
                      <label for="floatingTextarea">Comments</label>
                    </div>
                  </div>
                  <div className="msg-btn-container">
                    <button
                      className="msg-c-btn"
                      onClick={() => setNewMsgTab(false)}
                    >
                      Cancel
                    </button>
                    <button className="msg-se-btn">Send Email</button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
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

export default LossBack;
