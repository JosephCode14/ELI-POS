import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import { Button, Modal, Form } from "react-bootstrap";
import utensil from "../../assets/icon/utensil.png";
const WeeklyCreditReportDetails = ({
  specificWeekModal,
  setSpecificWeekModal,
  specificWeekData,
}) => {
  const {
    data,
    date_from,
    date_to,
    approver,
    requestor,
    date_approved,
    credit_price,
  } = specificWeekData;

  const [totalCredits, setTotalCredits] = useState("");

  const handleCountMeal = (data) => {
    const breakfast = data.filter(
      (item) => item.static_breakfast == true
    ).length;
    const lunch = data.filter((item) => item.static_lunch == true).length;
    const dinner = data.filter((item) => item.static_dinner == true).length;

    const total = breakfast + lunch + dinner;

    console.log("Total Cred", total);
    setTotalCredits(total);
  };
  useEffect(() => {
    handleCountMeal(data);
  }, [specificWeekModal]);

  const weekCreditColumn = [
    {
      name: "STUDENT ID",
      selector: (row) => row.student.student_number,
    },
    {
      name: "NAME",
      selector: (row) => `${row.student.first_name} ${row.student.last_name}`,
    },
    {
      name: "DATE",
      selector: (row) => row.date_valid,
    },
    {
      name: "BREAKFAST",
      selector: (row) => (row.static_breakfast ? 1 : 0),
    },
    {
      name: "LUNCH",
      selector: (row) => (row.static_lunch ? 1 : 0),
    },
    {
      name: "DINNER",
      selector: (row) => (row.static_dinner ? 1 : 0),
    },
  ];

  return (
    <>
      <Modal
        show={specificWeekModal}
        onHide={() => setSpecificWeekModal(false)}
        size="xl"
      >
        <Modal.Header>
          <div className="w-100 d-flex flex-direction-row align-items-center justify-content-between p-0">
            <h2>
              From: {date_from} - To: {date_to}
            </h2>
            <h2>Date Approved: {date_approved}</h2>
          </div>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="w-100 d-flex">
            <div className="w-50">
              <div className="d-flex pt-0 pb-3 align-items-center gap-5">
                <label style={{ width: "50px" }}>Requestor:</label>
                <input
                  className="form-control mb-0"
                  disabled
                  value={requestor}
                  style={{ fontSize: "15px" }}
                />
              </div>
              <div className="d-flex align-items-center gap-5 p-0">
                <label style={{ width: "50px" }}>Approver:</label>
                <input
                  className="form-control mb-0"
                  disabled
                  value={approver}
                  style={{ fontSize: "15px" }}
                />
              </div>
            </div>
            <div className="w-50 d-flex ms-4 p-0 align-items-center justify-content-center">
              <div className="box-food d-flex p-0 mb-0">
                <div className="utensil-container">
                  <img src={utensil} />
                </div>
                <div className="total-food-report px-4 pt-1">
                  <h5>Total Credits x Credit Price</h5>
                  <h1>
                    {totalCredits} x 50 ={" "}
                    {totalCredits * parseFloat(credit_price)}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="table mt-3">
            <DataTable
              columns={weekCreditColumn}
              data={data}
              pagination
              paginationRowsPerPageOptions={[5, 10, 25]}
              highlightOnHover
              customStyles={customStyles}
            />
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>
  );
};

export default WeeklyCreditReportDetails;
