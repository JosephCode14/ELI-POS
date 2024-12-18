import React, { useEffect, useState } from "react";

const DateRange = () => {
  const [fromDate, setFromDate] = useState();
  const [endDate, setEndDate] = useState();

  useEffect(() => {
    console.log("Start", fromDate, "End", endDate);
  }, [fromDate, endDate]);
  return (
    <>
      <div className="date-range-container d-flex ms-3 ">
        <div className="from-container d-flex">
          <label htmlFor="">From: </label>
          <input
            type="date"
            class="form-control i-date"
            id="exampleFormControlInput1"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="to-container d-flex">
          <label htmlFor="">To: </label>
          <input
            type="date"
            class="form-control i-date"
            id="exampleFormControlInput1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="days-container d-flex">
          <div>
            <p>Today</p>
          </div>
          <div>
            <p>Yesterday</p>
          </div>
          <div>
            <p>Last 7 days</p>
          </div>
          <div>
            <p>Last 30 days</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DateRange;
