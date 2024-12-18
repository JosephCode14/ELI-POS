import React, { useEffect, useState, useRef } from "react";
import BASE_URL from "../../../assets/global/url";
import axios from "axios";
import swal from "sweetalert";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { customStyles } from "../../styles/table-style";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import ReactLoading from "react-loading";
import noData from "../../../assets/icon/no-data.png";

const Requests = ({
  requestModal,
  setRequestModal,
  fetchCurrentWeekStudents,
  studentRequestCredits,
  setStudentRequestCredits,
  fetchRequestCredits,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // const [studentRequestCredits, setStudentRequestCredits] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [weekDates, setWeekDates] = useState([]);
  const [userId, setUserId] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCredit, setSelectedCredit] = useState("");

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setUserId(decoded.id);
    }
  };

  // const fetchRequestCredits = () => {
  //   axios
  //     .get(BASE_URL + "/credits/getRequestsforCredits")
  //     .then((res) => {
  //       if (res.status === 204) {
  //         setStudentRequestCredits([]);
  //         setWeekDates([]);
  //       } else {
  //         const requestData = res.data;
  //         setStudentRequestCredits(requestData);
  //         const uniqueDates = [
  //           ...new Set(requestData.map((item) => item.date_valid)),
  //         ];
  //         setWeekDates(uniqueDates);
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // };

  useEffect(() => {
    if (studentRequestCredits.length > 0) {
      const uniqueDates = [
        ...new Set(studentRequestCredits.map((item) => item.date_valid)),
      ];
      setWeekDates(uniqueDates);
    } else {
      setWeekDates([]);
    }
  }, [studentRequestCredits]);

  const handleCheckboxChange = (id, meal) => {
    setStudentRequestCredits((prevCredits) =>
      prevCredits.map((credit) =>
        credit.id === id ? { ...credit, [meal]: !credit[meal] } : credit
      )
    );
  };

  const columns = [
    {
      name: "STUDENT NUMBER",
      selector: (row) => row.student.student_number,
    },
    {
      name: "NAME",
      selector: (row) =>
        `${row.student.first_name} ${
          row.student.middle_name != null ? row.student.middle_name : ""
        }${row.student.last_name}`,
    },
    {
      name: "BREAKFAST",
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.breakfast}
          onChange={() => handleCheckboxChange(row.id, "breakfast")}
          className="form-check"
        />
      ),
    },
    {
      name: "LUNCH",
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.lunch}
          onChange={() => handleCheckboxChange(row.id, "lunch")}
          className="form-check"
        />
      ),
    },
    {
      name: "DINNER",
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.dinner}
          onChange={() => handleCheckboxChange(row.id, "dinner")}
          className="form-check"
        />
      ),
    },
    {
      name: "TOTAL CREDIT",
      selector: (row) =>
        (row.breakfast ? 1 : 0) + (row.lunch ? 1 : 0) + (row.dinner ? 1 : 0),
    },
  ];

  const filteredStudents = studentRequestCredits.filter((row) => {
    const fullName = `${row.student.first_name}  ${row.student.last_name}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    const matchesQuery =
      row.student.student_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      row.student.first_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      row.student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase());

    const totalCredit =
      (row.breakfast ? 1 : 0) + (row.lunch ? 1 : 0) + (row.dinner ? 1 : 0);

    const matchesCredit =
      selectedCredit === "" || totalCredit === parseInt(selectedCredit, 10);

    return matchesQuery && matchesCredit;
  });

  const handlePageChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  function CustomTabPanel(props) {
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
  }

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

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const approve_request = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill in the red text fields.",
      });
    } else {
      swal({
        title: "Approve this request?",
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          setIsLoading(true);
          const updatedCredits = studentRequestCredits.map((credit) => ({
            ...credit,
            total_credit:
              (credit.breakfast ? 1 : 0) +
              (credit.lunch ? 1 : 0) +
              (credit.dinner ? 1 : 0),
          }));

          const approvalData = {
            userId,
            credits: updatedCredits, // Use the updated credits
          };

          console.log("Approval Data with Total Credit:", approvalData);
          console.log(approvalData);
          axios
            .put(`${BASE_URL}/credits/approveRequests`, approvalData)
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "Request approved!",
                  icon: "success",
                  buttons: false,
                  timer: 2000,
                }).then(() => {
                  setRequestModal(false);
                  fetchCurrentWeekStudents();
                  fetchRequestCredits();
                  setIsLoading(false);
                });
              } else if (res.status === 201) {
                swal({
                  title: "Error",
                  text: "Something went wrong. Please try again.",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                });
              }
            })
            .catch((error) => {
              console.error("Error approving requests:", error);
              swal({
                title: "Error",
                text: "An error occurred while approving requests. Please try again.",
                icon: "error",
                buttons: false,
                timer: 2000,
              });
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      });
    }
  };

  useEffect(() => {
    // fetchRequestCredits();
    decodeToken();
    fetchCurrentWeekStudents();
  }, []);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchQuery]);

  useEffect(() => {
    setSelectedCredit("");
    setSearchQuery("");
  }, [requestModal]);
  return (
    <>
      <Modal
        show={requestModal}
        onHide={() => setRequestModal(false)}
        size="xl"
      >
        <Form onSubmit={approve_request}>
          <Modal.Header>
            <Modal.Title>
              <div className="d-flex flex-direction-row align-items-center p-0">
                <h2>List of Requests</h2>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            {filteredStudents.length > 0 ? (
              <div className="modal-category mt-3">
                <Box sx={{ width: "100%", marginTop: "10px" }}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      value={activeTab}
                      onChange={handlePageChange}
                      aria-label="basic tabs example"
                    >
                      {weekDates.map((date, index) => (
                        <Tab
                          key={date}
                          label={getFormattedDate(date)}
                          {...a11yProps(index)}
                        />
                      ))}
                    </Tabs>
                  </Box>
                  {weekDates.map((date, index) => (
                    <CustomTabPanel key={date} value={activeTab} index={index}>
                      <div className="d-flex gap-2 p-0">
                        <input
                          type="text"
                          ref={searchInputRef}
                          className="form-control m-0"
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                          type="select"
                          className="form-select w-25 m-0"
                          value={selectedCredit}
                          onChange={(e) => setSelectedCredit(e.target.value)}
                        >
                          <option value="" disabled selected>
                            Select Total Credit
                          </option>
                          <option value="3">3</option>
                          <option value="2">2</option>
                          <option value="1">1</option>
                        </select>
                      </div>

                      {studentRequestCredits.length > 0 ? (
                        <div className="table">
                          <DataTable
                            columns={columns}
                            customStyles={customStyles}
                            pagination
                            data={filteredStudents.filter(
                              (credit) => credit.date_valid === date
                            )}
                            paginationRowsPerPageOptions={[5, 10, 15, 20]}
                          />
                        </div>
                      ) : (
                        <div className="d-flex flex-column justify-content-center align-items-center">
                          <img
                            src={noData}
                            alt="No Data"
                            className="r-data-icon"
                          />
                          <h2 className="no-data-label">No Data Found</h2>
                        </div>
                      )}
                    </CustomTabPanel>
                  ))}
                </Box>
              </div>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <img src={noData} alt="No Data" className="r-data-icon" />
                <h2 className="no-data-label">No Data Found</h2>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            {!isLoading ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setRequestModal(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={studentRequestCredits.length == 0}
                >
                  Approve
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-50 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"10%"}
                    width={"10%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    Approving . . .
                  </span>
                </div>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Requests;
