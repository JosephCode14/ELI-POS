import React, { useEffect, useState, useRef } from "react";
import BASE_URL from "../../../assets/global/url";
import axios from "axios";
import swal from "sweetalert";
import { FourSquare } from "react-loading-indicators";
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

const MultipleEdit = ({
  editMultipleCreditModal,
  setEditMultiplCreditModal,
  fetchCurrentWeekStudents,
  fetchRequestCredits,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [studentWithCredit, setStudentWithCredit] = useState([]);
  const [checkedState, setCheckedState] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [weekDates, setWeekDates] = useState([]);
  const [userId, setuserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCredit, setSelectedCredit] = useState("");

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  const fetchNextWeekDates = () => {
    axios
      .get(BASE_URL + "/credits/getPerWeekDate")
      .then((res) => {
        setWeekDates(res.data);
      })
      .catch((err) => console.log(err));
  };

  const fetchStudentCredit = () => {
    axios
      .get(BASE_URL + "/credits/getStudentWithCredit")
      .then((res) => {
        const students = res.data;
        const initialCheckedState = {};
        for (let i = 0; i < 7; i++) {
          initialCheckedState[i] = {};
          students.forEach((student) => {
            initialCheckedState[i][student.student_id] = {
              breakfast: true,
              lunch: true,
              dinner: true,
            };
          });
        }

        setCheckedState(initialCheckedState);
        setStudentWithCredit(students);
      })
      .catch((err) => console.log(err));
  };

  const handleCheckboxChange = (day, studentId, mealType) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [day]: {
        ...prevState[day],
        [studentId]: {
          ...prevState[day][studentId],
          [mealType]: !prevState[day][studentId][mealType],
        },
      },
    }));
  };

  const calculateTotalCredit = (day, studentId) => {
    const studentState = checkedState[day]?.[studentId];
    if (!studentState) return 3;

    let totalCredit = 0;
    if (studentState.breakfast) totalCredit += 1;
    if (studentState.lunch) totalCredit += 1;
    if (studentState.dinner) totalCredit += 1;

    return totalCredit;
  };

  const filteredStudents = studentWithCredit.filter((row) => {
    const fullName = `${row.first_name}  ${row.last_name}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const matchesQuery =
      row.student_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase());

    const totalCredit = calculateTotalCredit(activeTab, row.student_id);
    const matchesCredit =
      selectedCredit === "" || totalCredit === Number(selectedCredit);

    return matchesQuery && matchesCredit;
  });

  const columns = [
    {
      name: "STUDENT NUMBER",
      selector: (row) => row.student_number,
    },
    {
      name: "NAME",
      selector: (row) =>
        `${row.first_name} ${row.middle_name != null ? row.middle_name : ""}${
          row.last_name
        }`,
    },
    {
      name: "BREAKFAST",
      cell: (row) => (
        <input
          type="checkbox"
          className="form-check"
          checked={checkedState[activeTab]?.[row.student_id]?.breakfast ?? true}
          onChange={() =>
            handleCheckboxChange(activeTab, row.student_id, "breakfast")
          }
        />
      ),
    },
    {
      name: "LUNCH",
      cell: (row) => (
        <input
          type="checkbox"
          className="form-check"
          checked={checkedState[activeTab]?.[row.student_id]?.lunch ?? true}
          onChange={() =>
            handleCheckboxChange(activeTab, row.student_id, "lunch")
          }
        />
      ),
    },
    {
      name: "DINNER",
      cell: (row) => (
        <input
          type="checkbox"
          className="form-check"
          checked={checkedState[activeTab]?.[row.student_id]?.dinner ?? true}
          onChange={() =>
            handleCheckboxChange(activeTab, row.student_id, "dinner")
          }
        />
      ),
    },
    {
      name: "TOTAL CREDIT",
      selector: (row) => calculateTotalCredit(activeTab, row.student_id),
    },
    {
      name: "DATE",
      cell: () => (
        <input
          type="date"
          value={weekDates[activeTab]}
          readOnly
          style={{ display: "none" }}
        />
      ),
      omit: true,
    },
  ];

  useEffect(() => {
    setSearchQuery("");
    setSelectedCredit("");
  }, [editMultipleCreditModal]);
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

  const create_request = async (e) => {
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
        title: "Create this request?",
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((confirmed) => {
        if (confirmed) {
          setIsLoading(true);
          const requests = [];
          for (let day = 0; day < 7; day++) {
            studentWithCredit.forEach((student) => {
              const totalCredit = calculateTotalCredit(day, student.student_id);
              requests.push({
                student_id: student.student_id,
                date: weekDates[day],
                total_credit: totalCredit,
                breakfast: checkedState[day][student.student_id].breakfast,
                lunch: checkedState[day][student.student_id].lunch,
                dinner: checkedState[day][student.student_id].dinner,
              });
            });
          }

          axios
            .post(`${BASE_URL}/credits/createRequests`, {
              userId,
              requests,
            })
            .then((res) => {
              if (res.status === 200) {
                swal({
                  title: "Success",
                  text: "Request created!",
                  icon: "success",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {
                  setIsLoading(false);
                  setEditMultiplCreditModal(false);
                  fetchNextWeekDates();
                  fetchStudentCredit();
                  fetchCurrentWeekStudents();
                  fetchRequestCredits();
                });
              } else if (res.status === 201) {
                swal({
                  title: "Error on creating request",
                  text: "",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                });
              } else {
                swal({
                  title: "Something Went Wrong",
                  text: "Please contact your support immediately",
                  icon: "error",
                  buttons: false,
                  timer: 2000,
                  dangerMode: true,
                }).then(() => {});
              }
            });
        }
      });
    }
  };

  useEffect(() => {
    fetchStudentCredit();
    fetchNextWeekDates();
    decodeToken();
    fetchCurrentWeekStudents();
    fetchRequestCredits();
  }, []);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Ensures that focus stays on the input
    }
  }, [searchQuery]);

  return (
    <>
      <Modal
        show={editMultipleCreditModal}
        onHide={() => setEditMultiplCreditModal(false)}
        size="xl"
      >
        <Form onSubmit={create_request}>
          <Modal.Header>
            <Modal.Title>
              <div className="d-flex flex-direction-row align-items-center p-0">
                <h2>Create Bulk Requests</h2>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div className="modal-category mt-3">
              <Box sx={{ width: "100%", marginTop: "10px" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={activeTab}
                    onChange={handlePageChange}
                    aria-label="basic tabs example"
                  >
                    {days.map((day, index) => (
                      <Tab
                        key={day}
                        label={`${day} (${weekDates[index]})`}
                        {...a11yProps(index)}
                      />
                    ))}
                  </Tabs>
                </Box>
                {days.map((day, index) => (
                  <CustomTabPanel key={day} value={activeTab} index={index}>
                    <div className=" d-flex gap-2 p-0 ">
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

                    {filteredStudents.length > 0 ? (
                      <div className={`table ${day.toLowerCase()}`}>
                        <DataTable
                          columns={columns}
                          customStyles={customStyles}
                          pagination
                          data={filteredStudents}
                          paginationRowsPerPageOptions={[5, 10, 15, 20]}
                          paginationDefaultPage={currentPage}
                          onChangePage={(page) => setCurrentPage(page)}
                          paginationPerPage={rowsPerPage} // Set the rows per page based on the state
                          onChangeRowsPerPage={(newRowsPerPage) =>
                            setRowsPerPage(newRowsPerPage)
                          }
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
          </Modal.Body>
          <Modal.Footer>
            {!isLoading ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setEditMultiplCreditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={studentWithCredit.length == 0}
                >
                  Submit
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
                    Sending Request . . .
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
export default MultipleEdit;
