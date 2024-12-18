import React, { useEffect, useState, useRef } from "react";
import { FourSquare } from "react-loading-indicators";
import axios from "axios";
import BASE_URL from "../../../assets/global/url";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { customStyles } from "../../styles/table-style";
import NoAccess from "../../../assets/image/NoAccess.png";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import BulkRequest from "./BulkRequest";
import ViewAll from "./ViewAll";
import Requests from "./Requests";
import AddCredits from "./AddCredits";
import noData from "../../../assets/icon/no-data.png";
const WeeklyCredit = ({ authrztn }) => {
  const [studentCurrentWeek, setStudentCurrentWeek] = useState([]);
  const [studentPreviousWeek, setStudentPreviousWeek] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCreditModal, setEditCreditModal] = useState(false);
  const [editMultipleCreditModal, setEditMultiplCreditModal] = useState(false);
  const [bulkEditModal, setBulkEditModal] = useState(false);
  const [viewAllModal, setViewAllModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [value, setValue] = useState(0);
  const [studentRequestCredits, setStudentRequestCredits] = useState([]);

  const [currentDateWeek, setCurrentDateWeek] = useState({
    startWeek: "",
    endWeek: "",
  });

  const [previousDateWeek, setPreviousDateWeek] = useState({
    startWeek: "",
    endWeek: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchPrevious, setSearchPrevious] = useState("");

  const handleRowClicked = async () => {
    try {
      setEditCreditModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseEditCredit = () => {
    setEditCreditModal(false);
  };

  const fetchRequestCredits = () => {
    axios
      .get(BASE_URL + "/credits/getRequestsforCredits")
      .then((res) => {
        if (res.status === 204) {
          setStudentRequestCredits([]);
        } else {
          setStudentRequestCredits(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchCurrentWeekStudents = () => {
    axios
      .get(BASE_URL + "/credits/getStudentCurrentWeekCreditsMeal")
      .then((res) => {
        if (res.status == 200) {
          setStudentCurrentWeek(res.data.result);
          setCurrentDateWeek({
            startWeek: res.data.startOfWeek,
            endWeek: res.data.endOfWeek,
          });
          setIsLoading(false);
        } else {
          setStudentCurrentWeek([]);
          setCurrentDateWeek({
            startWeek: res.data.startOfWeek,
            endWeek: res.data.endOfWeek,
          });
          setIsLoading(false);
        }
        setCurrentDateWeek({
          startWeek: res.data.startOfWeek,
          endWeek: res.data.endOfWeek,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchPreviousWeekStudents = () => {
    axios
      .get(BASE_URL + "/credits/getStudentPreviousWeekCreditsMeal")
      .then((res) => {
        if (res.status == 200) {
          setStudentPreviousWeek(res.data.result);
          setPreviousDateWeek({
            startWeek: res.data.startOfPreviousWeek,
            endWeek: res.data.endOfPreviousWeek,
          });
          setIsLoading(false);
        } else {
          setStudentPreviousWeek([]);
          setPreviousDateWeek({
            startWeek: res.data.startOfPreviousWeek,
            endWeek: res.data.endOfPreviousWeek,
          });
          setIsLoading(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const Currentcolumns = [
    { name: "STUD NO.", selector: (row) => row.student.student_number },
    {
      name: "NAME",
      selector: (row) =>
        `${row.student.first_name} ${
          row.student.middle_name != null ? row.student.middle_name : ""
        }${row.student.last_name}`,
    },
    { name: "MONDAY", selector: (row) => row.credits.Monday },
    { name: "TUESDAY", selector: (row) => row.credits.Tuesday },
    { name: "WEDNESDAY", selector: (row) => row.credits.Wednesday },
    { name: "THURSDAY", selector: (row) => row.credits.Thursday },
    { name: "FRIDAY", selector: (row) => row.credits.Friday },
    { name: "SATURDAY", selector: (row) => row.credits.Saturday },
    { name: "SUNDAY", selector: (row) => row.credits.Sunday },
    {
      name: "STATUS",
      selector: (row) => row.status,
      cell: (row) => (
        <span
          style={{ fontSize: "1.3rem" }}
          className={`badge ${
            row.status === "For Approval"
              ? "bg-primary"
              : row.status === "N/A"
              ? "bg-secondary"
              : "bg-success"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const PreviousColumns = [
    {
      name: "STUDENT NO.",
      selector: (row) => row.student.student_number,
    },
    {
      name: "NAME",
      selector: (row) =>
        `${row.student.first_name} ${
          row.student.middle_name != null ? row.student.middle_name : ""
        } ${row.student.last_name}`,
    },
    {
      name: "MONDAY",
      selector: (row) => row.credits.Monday,
    },
    {
      name: "TUESDAY",
      selector: (row) => row.credits.Tuesday,
    },
    {
      name: "WEDNESDAY",
      selector: (row) => row.credits.Wednesday,
    },
    {
      name: "THURSDAY",
      selector: (row) => row.credits.Thursday,
    },
    {
      name: "FRIDAY",
      selector: (row) => row.credits.Friday,
    },
    {
      name: "SATURDAY",
      selector: (row) => row.credits.Saturday,
    },
    {
      name: "SUNDAY",
      selector: (row) => row.credits.Sunday,
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
      cell: (row) => (
        <span
          style={{ fontSize: "1.3rem" }}
          className={`badge ${
            row.status === "For Approval"
              ? "bg-primary"
              : row.status === "N/A"
              ? "bg-secondary"
              : "bg-success"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const editCreditColumn = [
    {
      name: "DAY",
      selector: (row) => row.day,
    },
    {
      name: "BREAKFAST",
      cell: (row) => <input type="checkbox" className="form-check" />,
    },
    {
      name: "LUNCH",
      cell: (row) => <input type="checkbox" className="form-check" />,
    },
    {
      name: "DINNER",
      cell: (row) => <input type="checkbox" className="form-check" />,
    },
  ];

  const editCreditData = [
    {
      day: "Monday",
    },
    {
      day: "Tuesday",
    },
    {
      day: "Wednesday",
    },
    {
      day: "Thursday",
    },
    {
      day: "Friday",
    },
    {
      day: "Saturday",
    },
    {
      day: "Sunday",
    },
  ];

  //   For Tabs

  const handlePageChange = (event, newValue) => {
    setValue(newValue);
    setIsLoading(true);
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

  const filteredStudents = studentCurrentWeek.filter((row) => {
    const fullName = `${row.student.first_name} ${
      row.student.middle_name || ""
    } ${row.student.last_name}`
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
    return matchesQuery;
  });

  const filteredStudentsPrevious = studentPreviousWeek.filter((row) => {
    const fullName = `${row.student.first_name} ${
      row.student.middle_name || ""
    } ${row.student.last_name}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const matchesQuery =
      row.student.student_number
        .toLowerCase()
        .includes(searchPrevious.toLowerCase()) ||
      row.student.first_name
        .toLowerCase()
        .includes(searchPrevious.toLowerCase()) ||
      row.student.last_name
        .toLowerCase()
        .includes(searchPrevious.toLowerCase()) ||
      fullName.includes(searchPrevious.toLowerCase());

    return matchesQuery;
  });

  useEffect(() => {
    if (value === 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        fetchCurrentWeekStudents();
      }, 1500);
      return () => clearTimeout(timer);
    } else if (value === 1) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        fetchPreviousWeekStudents();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const searchInputRef = useRef(null);
  const searchInputPrevious = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchInputPrevious.current) {
      searchInputPrevious.current.focus();
    }
  }, [searchPrevious]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to update the window width state
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  // Set up event listener for window resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      <div>
        {isLoading ? (
          <div
            className="d-flex justify-content-center flex-column vh-100 ms-5 ps-5 align-items-center"
            // style={{ margin: "0", marginLeft: "240px", marginTop: "20%" }}
          >
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("WeeklyCredit-View") ? (
          <div className="users-container">
            <div className="title-container pt-5 stud-man-container align-items-center">
              <h2>Weekly Credit</h2>
              <div className="download-container w-50 justify-content-end ">
                <span
                  style={{
                    // width: "18rem",
                    fontSize: "1.5rem",
                    display: "inline-block",
                    padding:
                      windowWidth <= 576 ? ".375rem  0px" : ".375rem 2.5rem",
                    cursor: "text",
                    fontWeight: "bold",
                  }}
                  className="text-nowrap"
                >
                  {value === 0
                    ? `${currentDateWeek.startWeek} to ${currentDateWeek.endWeek}`
                    : `${previousDateWeek.startWeek} to ${previousDateWeek.endWeek}`}
                </span>
              </div>
            </div>

            <Box sx={{ width: "100%", marginTop: "10px" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handlePageChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Current Week" {...a11yProps(0)} />
                  <Tab label=" Previous Week" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <div className="d-flex flex-column flex-lg-row gap-2 p-0 ">
                  <div className="d-flex p-0 col col-lg-6 gap-3">
                    <input
                      type="text"
                      ref={searchInputRef}
                      className="form-control m-0"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ fontSize: "1.6rem" }}
                    />
                  </div>
                  <div className="d-flex flex-wrap flex-sm-nowrap p-0 col col-lg-6 justify-content-center justify-content-lg-end gap-3">
                    {authrztn.includes("WeeklyCredit-Approve") && (
                      <button
                        type="button"
                        className="crdt-btn col-6"
                        onClick={() => setRequestModal(true)}
                      >
                        Requests List
                      </button>
                    )}

                    {authrztn.includes("WeeklyCredit-Add") && (
                      <button
                        type="button"
                        className="crdt-btn"
                        onClick={() => setBulkEditModal(true)}
                      >
                        Add Credits
                      </button>
                    )}

                    {authrztn.includes("WeeklyCredit-Request") && (
                      <button
                        type="button"
                        className="crdt-btn"
                        onClick={() => setEditMultiplCreditModal(true)}
                      >
                        Bulk Requests
                      </button>
                    )}

                    {authrztn.includes("WeeklyCredit-View") && (
                      <button
                        type="button"
                        className="crdt-btn"
                        onClick={() => setViewAllModal(true)}
                      >
                        View All
                      </button>
                    )}
                  </div>
                </div>

                {filteredStudents.length == 0 ? (
                  <>
                    <div className="no-data-table mt-2 ">
                      <table>
                        <thead>
                          <th>STUD NO.</th>
                          <th>NAME</th>
                          <th>MONDAY</th>
                          <th>TUESDAY</th>
                          <th>WEDNESDAY</th>
                          <th>THURSDAY</th>
                          <th>FRIDAY</th>
                          <th>SATURDAY</th>
                          <th>SUNDAY</th>
                        </thead>
                        <tbody className="r-no-data">
                          <div>
                            <img
                              src={noData}
                              alt="No Data"
                              className="r-data-icon"
                            />
                            <h2 className="no-data-label">No Data Found</h2>
                          </div>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-data-cred-week mt-3">
                      <DataTable
                        columns={Currentcolumns}
                        customStyles={customStyles}
                        pagination
                        // onRowClicked={handleRowClicked}
                        data={filteredStudents}
                      />
                    </div>
                  </>
                )}
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <div className="head-prev-week d-flex gap-2 p-0 ">
                  <input
                    type="text"
                    className="form-control m-0"
                    placeholder="Search"
                    ref={searchInputPrevious}
                    value={searchPrevious}
                    onChange={(e) => setSearchPrevious(e.target.value)}
                    style={{ fontSize: "1.6rem" }}
                  />
                </div>

                {filteredStudentsPrevious.length == 0 ? (
                  <>
                    <div className="no-data-table mt-2 ">
                      <table>
                        <thead>
                          <th>STUD NO.</th>
                          <th>NAME</th>
                          <th>MONDAY</th>
                          <th>TUESDAY</th>
                          <th>WEDNESDAY</th>
                          <th>THURSDAY</th>
                          <th>FRIDAY</th>
                          <th>SATURDAY</th>
                          <th>SUNDAY</th>
                        </thead>
                        <tbody className="r-no-data">
                          <div>
                            <img
                              src={noData}
                              alt="No Data"
                              className="r-data-icon"
                            />
                            <h2 className="no-data-label">No Data Found</h2>
                          </div>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-data-table mt-3">
                      <DataTable
                        columns={PreviousColumns}
                        customStyles={customStyles}
                        pagination
                        data={filteredStudentsPrevious}
                      />
                    </div>
                  </>
                )}
              </CustomTabPanel>
            </Box>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: "100%",
              marginTop: "14%",
              marginLeft: "12%",
            }}
          >
            <img src={NoAccess} alt="NoAccess" className="no-access-img" />
            <h3>You don't have access to this function.</h3>
          </div>
        )}
      </div>

      <Modal show={editCreditModal} onHide={handleCloseEditCredit}>
        <Form>
          <Modal.Header>
            <Modal.Title>
              <div className="d-flex flex-direction-row align-items-center p-0">
                <h2>Update Weekly Credit</h2>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div className="modal-category mt-3">
              <div className="credit-student d-flex p-0 align-items-center">
                <p>Student No.:</p>
                <input type="text" className="form-control mb-4" disabled />
              </div>
              <div className="credit-student d-flex p-0 align-items-center">
                <p>Name:</p>
                <input type="text" className="form-control mb-4" disabled />
              </div>
              <div className="credit-student d-flex p-0 align-items-center">
                <p>Date:</p>
                <input type="text" className="form-control mb-4" disabled />
              </div>
              <div className="credit-student d-flex p-0 align-items-center">
                <p>Status:</p>
                <input type="text" className="form-control mb-4" disabled />
              </div>

              <hr />

              <DataTable
                columns={editCreditColumn}
                data={editCreditData}
                customStyles={customStyles}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditCredit}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <BulkRequest
        editMultipleCreditModal={editMultipleCreditModal}
        setEditMultiplCreditModal={setEditMultiplCreditModal}
        fetchCurrentWeekStudents={fetchCurrentWeekStudents}
        fetchRequestCredits={fetchRequestCredits}
      />

      <AddCredits
        bulkEditModal={bulkEditModal}
        setBulkEditModal={setBulkEditModal}
        fetchCurrentWeekStudents={fetchCurrentWeekStudents}
      />

      <ViewAll viewAllModal={viewAllModal} setViewAllModal={setViewAllModal} />

      <Requests
        requestModal={requestModal}
        setRequestModal={setRequestModal}
        fetchCurrentWeekStudents={fetchCurrentWeekStudents}
        studentRequestCredits={studentRequestCredits}
        setStudentRequestCredits={setStudentRequestCredits}
        fetchRequestCredits={fetchRequestCredits}
      />
    </>
  );
};

export default WeeklyCredit;
