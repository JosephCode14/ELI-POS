import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import _Sidebar from "../Sidebar/_Sidebar";
import "../styles/usermanagement.css";
// import "../styles/pos_react.css";
import { customStyles } from "../styles/table-style";
import { Plus } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import noData from "../../assets/icon/no-data.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import { useNavigate } from "react-router-dom";
import { FourSquare } from "react-loading-indicators";
import { jwtDecode } from "jwt-decode";

function UserRole({ authrztn }) {
  const navigate = useNavigate();
  const [roles, setRole] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filteredRoles, setFilteredRoles] = useState(roles);
  const [userId, setuserId] = useState("");

  const fetch = () => {
    axios
      .get(BASE_URL + "/userRole/fetchuserrole")
      .then((res) => {
        setRole(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(true);
      });
  };

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const truncateText = (text, length) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  const handleDeleteUserRole = async (userRoleId) => {
    swal({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await axios.delete(
            `${BASE_URL}/userRole/delete/${userRoleId}?userId=${userId}`
          );
          if (response.status === 200) {
            swal({
              title: "User Role Deleted Successfully!",
              text: "The user role has been successfully deleted.",
              icon: "success",
              button: "OK",
            }).then(() => {
              fetch();
            });
          } else if (response.status === 202) {
            swal({
              icon: "error",
              title: "Deletion Prohibited",
              text: "You cannot delete a user role that is in use.",
            });
          } else {
            swal({
              icon: "error",
              title: "Something went wrong",
              text: "Please contact our support team for assistance.",
            });
          }
        } catch (err) {
          console.log(err);
          swal({
            icon: "error",
            title: "Error",
            text: "An error occurred while deleting the user role.",
          });
        }
      }
    });
  };

  const tableDataObject = [
    {
      name: "ROLE NAME",
      selector: (row) => row.col_rolename,
    },
    {
      name: "AUTHORIZATION",
      selector: (row) => truncateText(row.col_authorization, 100),
    },
    {
      name: "DESCRIPTION",
      selector: (row) => row.col_desc,
    },
    {
      name: "ACTION",
      selector: (row) =>
        authrztn.includes("UserRole-Delete") && (
          <i
            className="bx bxs-trash red"
            onClick={() => handleDeleteUserRole(row.col_id)}
          ></i>
        ),
    },
  ];

  const handleUpdateModal = async (data) => {
    if (authrztn.includes("UserRole-Edit")) {
      navigate(`/update-user-role/${data.col_id}`);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const filtered = roles.filter((data) => {
      const roleName = data.col_rolename ? data.col_rolename.toLowerCase() : "";
      const authorization = data.col_authorization
        ? data.col_authorization.toLowerCase()
        : "";
      const description = data.col_desc ? data.col_desc.toLowerCase() : "";

      return (
        roleName.includes(searchQuery.toLowerCase()) ||
        authorization.includes(searchQuery.toLowerCase()) ||
        description.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredRoles(filtered);
  }, [searchQuery, roles]);

  useEffect(() => {
    decodeToken();
  }, []);

  return (
    <>
      <div>
        {isLoading ? (
          <div
            className="loading-container"
            style={{ margin: "0", marginLeft: "240px", marginTop: "20%" }}
          >
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("UserRole-View") ? (
          <div className="users-container">
            <div className="title-container pt-5 stud-man-container">
              <h2>User Access</h2>
              <div className="download-container"></div>
            </div>
            <div className="btn-manage-container d-flex justify-content-between">
              <div class="input-group w-25" style={{ marginLeft: "2px" }}>
                <input
                  type="text"
                  className="form-control m-0"
                  style={{ fontSize: "1.3rem" }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search"
                />
              </div>
              <div
                className="user-filter d-flex p-0"
                style={{ width: "150px" }}
              >
                {authrztn.includes("UserRole-Add") && (
                  <Link to="/create-user-role" className="rbacCreate">
                    <span>
                      <Plus size={32} color="#f2f2f2" />
                      Create New
                    </span>
                  </Link>
                )}

                {/* <button>
       <Plus size={32} color="#f2f2f2" /> Add Access
     </button> */}
              </div>
            </div>

            <div className="mt-4">
              {roles.length == 0 ? (
                <>
                  <div className="no-data-table ">
                    <table>
                      <thead>
                        <th>ROLE NAME</th>
                        <th>AUTHORIZATION</th>
                        <th>DESCRIPTION</th>
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
                <></>
              )}
              <DataTable
                columns={tableDataObject}
                data={filteredRoles}
                pagination
                paginationRowsPerPageOptions={[5, 10, 25]}
                highlightOnHover
                onRowClicked={handleUpdateModal}
                customStyles={customStyles}
              />
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
              marginTop: "14%",
              marginLeft: "12%",
            }}
          >
            <img src={NoAccess} alt="NoAccess" className="no-access-img" />
            <h3>You don't have access to this function.</h3>
          </div>
        )}
      </div>
    </>
  );
}

export default UserRole;
