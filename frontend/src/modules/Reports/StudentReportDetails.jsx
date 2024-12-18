import React, { useState, useEffect } from "react";
import DateRange from "../../components/DateRange";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import { Link, useLocation, useParams } from "react-router-dom";
// import "../styles/reports.css";
// import "../styles/pos_react.css";

const StudentReportDetails = () => {
  const { name, id } = useParams();
  const location = useLocation();

  const [reportDetails, setReportDetails] = useState([]);

  function formatDate(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }

  const columns = [
    {
      name: "TRANSACTION DATE",
      selector: (row) => row.createdAt,
      cell: (row) => formatDate(row.createdAt),
    },
    {
      name: "ITEM NAME",
      selector: (row) => 
        row.cart_specification_variants.length > 0 
          ? `${row.product_inventory.product.name} (${row.cart_specification_variants.map(variant => variant.specification_variant.variant_name).join(", ")})`
          : row.product_inventory.product.name,
    },
    {
      name: "QUANTITY",
      selector: (row) => row.quantity,
    },
    {
      name: "UNIT PRICE",
      selector: (row) => row.product_inventory.product.price,
    },
    {
      name: "TOTAL PRICE",
      selector: (row) => row.subtotal,
    },
  ];

  useEffect(() => {
    const handleFetchTransaction = async () => {
      const res = await axios.get(
        `${BASE_URL}/reports/fetchSpecificStudentReport/${id}`
      );
      setReportDetails(res.data[0].carts);
    };

    handleFetchTransaction();
  }, []);

  useEffect(()=> {
    console.log(reportDetails)
  }, [reportDetails])

  return (
    <>
      <div className="inventory-container">
        {/* Card */}
        <div className="custom-card">
          <div className="head-container d-flex">
            <div className="title-container report-title-container ps-0">
              <Link to={"/customer-reports"}>
                <i class="bx bx-chevron-left pt-1"></i>
              </Link>
              <h2>Student Transaction Preview - {name}</h2>
            </div>
          </div>

          <div className="table">
            <DataTable
              columns={columns}
              data={reportDetails}
              customStyles={customStyles}
              pagination
            />
          </div>

          <div className="export-container">
            {/* <button>Export Data</button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentReportDetails;
