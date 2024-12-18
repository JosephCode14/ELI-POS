import React, { useEffect, useState } from "react";
import axios from "axios";
import { customStyles } from "../../styles/table-style";
import DataTable from "react-data-table-component";
import { Button, Modal, Form } from "react-bootstrap";
import utensil from "../../../assets/icon/utensil.png";
import BASE_URL from "../../../assets/global/url";
import check from "../../../assets/icon/check.png";
import x from "../../../assets/icon/remove.png";
import forbid from "../../../assets/icon/forbidden.png";
import noData from "../../../assets/icon/no-data.png";

const ViewAll = ({ viewAllModal, setViewAllModal }) => {
  const [studentCredits, setStudentCredits] = useState([]);
  const [totalMeal, setTotalMeal] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCredit, setSelectedCredit] = useState("");

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  const columns = [
    {
      name: "STUDENT ID.",
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
      name: "BREAKFAST",
      cell: (row) =>
        !row.breakfast && row.static_breakfast ? (
          <>
            {" "}
            <img src={check} style={{ height: "25px" }} />
          </>
        ) : row.breakfast && row.static_breakfast ? (
          <>
            <img src={x} style={{ height: "25px" }} />
          </>
        ) : (
          <>
            <img src={forbid} style={{ height: "25px" }} />
          </>
        ),
    },
    {
      name: "LUNCH",
      cell: (row) =>
        !row.lunch && row.static_lunch ? (
          <>
            <img src={check} style={{ height: "25px" }} />
          </>
        ) : row.lunch && row.static_lunch ? (
          <>
            <img src={x} style={{ height: "25px" }} />
          </>
        ) : (
          <>
            <img src={forbid} style={{ height: "25px" }} />
          </>
        ),
    },
    {
      name: "DINNER",
      cell: (row) =>
        !row.dinner && row.static_dinner ? (
          <>
            <img src={check} style={{ height: "25px" }} />
          </>
        ) : row.dinner && row.static_dinner ? (
          <>
            <img src={x} style={{ height: "25px" }} />
          </>
        ) : (
          <>
            <img src={forbid} style={{ height: "25px" }} />
          </>
        ),
    },
    {
      name: "TOTAL CREDIT",
      selector: (row) => {
        const mealCount = [row.breakfast, row.lunch, row.dinner].filter(
          Boolean
        ).length;
        return mealCount;
      },
    },
  ];

  const handleCountMeal = (data) => {
    const breakfast = data.filter(
      (item) => item.static_breakfast == true
    ).length;
    const lunch = data.filter((item) => item.static_lunch == true).length;
    const dinner = data.filter((item) => item.static_dinner == true).length;

    setTotalMeal({
      breakfast: breakfast,
      lunch: lunch,
      dinner: dinner,
    });
  };
  const handleFetchTotalCreditToday = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/credits/getCreditToday`);
      setStudentCredits(res.data);
      handleCountMeal(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleFetchTotalCreditToday();
  }, []);

  const filteredStudents = studentCredits.filter((item) => {
    const mealCount = [item.breakfast, item.lunch, item.dinner].filter(
      Boolean
    ).length;

    const fullName = `${item.student.first_name} ${
      item.student.middle_name || null
    } ${item.student.last_name}`
      .trim()
      .toLowerCase();

    const matchesQuery =
      item.student.student_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.student.first_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.student.last_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.student.middle_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase());

    const matchesCredit = selectedCredit
      ? mealCount === parseInt(selectedCredit)
      : true;

    return matchesQuery && matchesCredit;
  });

  useEffect(() => {
    setSelectedCredit("");
    setSearchQuery("");
  }, [viewAllModal]);

  return (
    <>
      <Modal
        show={viewAllModal}
        onHide={() => setViewAllModal(false)}
        size="xl"
      >
        <Modal.Header>
          <div className="w-100 d-flex flex-direction-row align-items-center p-0 justify-content-between ">
            <h2>Credit Freeze</h2>
            <h2>Date: {formattedDate}</h2>
          </div>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="modal-category mt-3">
            <div className="d-flex px-5 gap-4 gap-xl-5 flex-wrap justify-content-center">
              <div className="box-food d-flex p-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food px-4 pt-1">
                  <h5>Total Breakfast</h5>
                  <h1>{totalMeal?.breakfast}</h1>
                </div>
              </div>
              <div className="box-food d-flex p-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food px-4 pt-1">
                  <h5>Total Lunch</h5>
                  <h1>{totalMeal?.lunch}</h1>
                </div>
              </div>
              <div className="box-food d-flex p-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food px-4 pt-1">
                  <h5>Total Dinner</h5>
                  <h1>{totalMeal?.dinner}</h1>
                </div>
              </div>
            </div>

            <div className=" d-flex gap-2 p-0 ">
              <input
                type="text"
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
              <div className="table">
                <DataTable
                  columns={columns}
                  data={filteredStudents}
                  customStyles={customStyles}
                  pagination
                />
              </div>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <img src={noData} alt="No Data" className="r-data-icon" />
                <h2 className="no-data-label">No Data Found</h2>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewAllModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewAll;
