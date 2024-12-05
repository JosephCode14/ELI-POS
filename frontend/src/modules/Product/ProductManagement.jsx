import React, {useEffect, useState} from 'react';
import '../../assets/global/style.css';
import '../styles/react-style.css';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import swal from "sweetalert";
import axios from "axios";
import BASE_URL from "../../assets/global/url";

import {
    MagnifyingGlass,
    Gear, 
    Bell,
    UserCircle,
    Plus,
    Trash,
    NotePencil,
    DotsThreeCircle
  } from "@phosphor-icons/react";

function ProductManagement() {
    const [MembershipType, setMembershipType] = useState([]);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleUpdateClose = () => setUpdateModalShow(false);
    const handleShow = () => setShow(true);
    const [updateModalShow, setUpdateModalShow] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [rotatedIcons, setRotatedIcons] = useState(
        Array(MembershipType.length).fill(false)
      );
    const [validated, setValidated] = useState(false);

    const [updateFormData, setUpdateFormData] = useState({
        membershipTypeId: "",
        name: "",
        description: "",
      });

    const toggleDropdown = (event, index) => {
        // Check if the clicked icon is already open, close it
        if (index === openDropdownIndex) {
          setRotatedIcons((prevRotatedIcons) => {
            const newRotatedIcons = [...prevRotatedIcons];
            newRotatedIcons[index] = !newRotatedIcons[index];
            return newRotatedIcons;
          });
          setShowDropdown(false);
          setOpenDropdownIndex(null);
        } else {
          // If a different icon is clicked, close the currently open dropdown and open the new one
        //   setRotatedIcons(Array(Manufacturer.length).fill(false));
          const iconPosition = event.currentTarget.getBoundingClientRect();
          setDropdownPosition({
            top: iconPosition.bottom + window.scrollY,
            left: iconPosition.left + window.scrollX,
          });
          setRotatedIcons((prevRotatedIcons) => {
            const newRotatedIcons = [...prevRotatedIcons];
            newRotatedIcons[index] = true;
            return newRotatedIcons;
          });
          setShowDropdown(true);
          setOpenDropdownIndex(index);
        }
      };

      const [name, setName] = useState();
      const [description, setDescription] = useState();

//--------------------------------Membership type list fetch---------------------------------//
useEffect(() => {
    axios
      .get(BASE_URL + "/membershipType/getMembershipType")
      .then((res) => setMembershipType(res.data))
      .catch((err) => console.log(err));
  }, []);

  const reload_table_membership_type = () =>  {
    axios.get(BASE_URL + "/membershipType/getMembershipType")
      .then(res => {
        setMembershipType(res.data);
      })
      .catch(err => console.log(err));
  }
//--------------------------------EndMembership type list fetch---------------------------------//

//--------------------------------Valdidations---------------------------------//
const SuccessInserted = (res) => {
    swal({
      title: "Membership Type Created",
      text: "The membership type has been added successfully",
      icon: "success",
      button: "OK",
    }).then(() => {
      const newId = res.data.id;
      // console.log(newId)
      setMembershipType((prev) => [
        ...prev,
        {
          membership_type_id: newId,
          name: res.data.name,
          description: res.data.description,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
        },
      ]);

      setName(""); // Clear the nameManu input field
      setDescription(""); // Clear the descManu input field

      setShow(false);
    });
  };
  const Duplicate_Message = () => {
    swal({
      title: "Membership Type Name Already Exist",
      text: "The input other membership type name",
      icon: "error",
      button: "OK",
    });
  };

  const ErrorInserted = () => {
    swal({
      title: "Something went wrong",
      text: "Please Contact our Support",
      icon: "error",
      button: "OK",
    });
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
//--------------------------------End of Validations---------------------------------//

//--------------------------------Show Modal Update---------------------------------//
const handleModalToggle = (updateData = null) => {
    setUpdateModalShow(!updateModalShow);
    if (updateData) {
      setUpdateFormData({
        membershipTypeId: updateData.membership_type_id,
        name: updateData.name,
        description: updateData.description,
      });
    } else {
      setUpdateFormData({
        name: "",
        description: "",
      });
    }
  };
//--------------------------------End Show Modal Update---------------------------------//

//--------------------------------Add Membership type---------------------------------//
const addMembershipType = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Fields are required",
        text: "Please fill the red text fields",
      });
    } else {
      axios
        .post(`${BASE_URL}/membershipType/create`, {
          name: name,
          description: description,
        })
        .then((res) => {
          window.location.reload();
          console.log(res);
          if (res.status === 200) {
            SuccessInserted(res);
          } else if (res.status === 201) {
            Duplicate_Message();
          } else {
            ErrorInserted();
          }
        });
    }
    setValidated(true); //for validations
  };
//--------------------------------End Membership type---------------------------------//

//--------------------------------Update Membership type---------------------------------//
const updateMembershipType = async (e) => {
    e.preventDefault();

    if (!updateFormData.name) {
      swal({
        icon: "error",
        title: "Name is required",
        text: "Please enter a name before updating.",
      });
      return; // Prevent submission if the name is empty
    }

    try {
      const membershipTypeId = updateFormData.membershipTypeId;
      const response = await axios.put(
        BASE_URL + `/membershipType/update/${membershipTypeId}`,
        {
            name: updateFormData.name,
            description: updateFormData.description,
        }
      );

      if (response.status === 200) {
        swal({
          title: "Update successful!",
          text: "The Membership type has been updated successfully.",
          icon: "success",
          button: "OK",
        }).then(() => {
          handleModalToggle();
          setMembershipType((prev) =>
            prev.map((data) =>
              data.membership_type_id === updateFormData.membership_type_id
                ? {
                    ...data,
                    name: updateFormData.name,
                    description: updateFormData.description,
                  }
                : data
            )
          );

          setUpdateFormData({
            name: "",
            description: "",
          });

          reload_table_membership_type();
        });
      } else if (response.status === 202) {
        swal({
          icon: "error",
          title: "Membership Type has been already exists",
          text: "Please input another Membership Type Name",
        });
      } else {
        swal({
          icon: "error",
          title: "Something went wrong",
          text: "Please contact our support",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
//--------------------------------End Update Membership type---------------------------------//

//--------------------------------Delete Membership Type---------------------------------//
const handleDelete = async (membershipTypeId) => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this record file!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then(async (willDelete) => {
    if (willDelete) {
      try {
        const response = await axios.delete(
          BASE_URL + `/membershipType/delete/${membershipTypeId}`
        );

        if (response.status === 200) {
          swal({
            title: "Deleted Successful!",
            text: "The Membership Type has been Deleted Successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            setMembershipType((prev) => prev.filter((data) => data.id !== membershipTypeId));
            setUpdateModalShow(false);
            reload_table_membership_type();
          });
        } else if (response.status === 202) {
          swal({
            icon: "error",
            title: "Delete Prohibited",
            text: "You cannot delete Membership Type that is used",
          });
        } else {
          swal({
            icon: "error",
            title: "Something went wrong",
            text: "Please contact our support",
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      swal({
        title: "Cancelled",
        text: "Membership Type not Deleted!",
        icon: "warning",
      });
    }
  });
};
//--------------------------------End Delete Membership Type---------------------------------//


//--------------------------------Date Format---------------------------------//
    function formatDate(isoDate) {
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(
        date.getDate()
    )} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(
        date.getSeconds()
    )}`;
    }

    function padZero(num) {
    return num.toString().padStart(2, "0");
    }
//--------------------------------End Date Format---------------------------------//
  return (
    <div className="main-of-containers">
        <div className="right-of-main-containers">
            <div className="right-body-contents">
                <div className="settings-search-master">

                <div className="dropdown-and-iconics">
                    <div className="dropdown-side">

                    </div>
                    <div className="iconic-side">
                        <div className="gearsides">
                            <Gear size={35}/>
                        </div>
                        <div className="bellsides">
                            <Bell size={35}/>
                        </div>
                        <div className="usersides">
                            <UserCircle size={35}/>
                        </div>
                        <div className="username">
                          <h3>User Name</h3>
                        </div>
                    </div>
                </div>

                </div>
                <div className="Employeetext-button">
                    <div className="employee-and-button">
                        <div className="emp-text-side">
                            <p>Membership Type</p>
                        </div>

                        <div className="button-create-side">
                        <div className="Buttonmodal-new">
                        <button onClick={handleShow}>
                            <span style={{}}>
                            <Plus size={15} />
                            </span>
                            Create New
                        </button>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="table-containss">
                    <div className="main-of-all-tables">
                        <table className='table-hover' id='order-listing'>
                                <thead>
                                <tr>
                                    <th className='tableh'>ID</th>
                                    <th className='tableh'>Membership Type Name</th>
                                    <th className='tableh'>Date Created</th>
                                </tr>
                                </thead>
                                <tbody>
                                {MembershipType.map((data, i) => (
                                    <tr key={i}>
                                    <td onClick={() => handleModalToggle(data)}>{data.membership_type_id}</td>
                                    <td onClick={() => handleModalToggle(data)}>{data.name}</td>
                                    <td onClick={() => handleModalToggle(data)}>{formatDate(data.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

{/* ----------------------------------MODAL FOR CREATE---------------------------------------------------- */}
        <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg">
        <Form
          noValidate
          validated={validated}
          onSubmit={addMembershipType}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "24px" }}>
              Create New Membership Type
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1">
                  <Form.Label style={{ fontSize: "18px" }}>Membership Type Name: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    required
                    onChange={(e) => setName(e.target.value)}
                    style={{ height: "40px", fontSize: "15px" }}
                  />
                </Form.Group>
              

            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1">
              <Form.Label style={{ fontSize: "18px" }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                style={{
                  fontSize: "16px",
                  height: "200px",
                  maxHeight: "200px",
                  resize: "none",
                  overflowY: "auto",
                }}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              variant="warning"
              size="md"
              style={{ fontSize: "20px" }}>
              Save
            </Button>
            <Button
              variant="secondary"
              size="md"
              style={{ fontSize: "20px" }}
              onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* ---------------------------------- END MODAL FOR CREATE---------------------------------------------------- */}

      {/* ---------------------------------- END MODAL FOR UPDATE---------------------------------------------------- */}
      <Modal
        show={updateModalShow}
        onHide={() => handleModalToggle()}
        backdrop="static"
        keyboard={false}
        size="lg">
        <Form
          noValidate
          validated={validated}
          onSubmit={updateMembershipType}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "24px" }}>
              Update Membership Types 
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1">
                  <Form.Label style={{ fontSize: "18px" }}>Membership Type Name: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder=""
                    name="name"
                    required
                    value={updateFormData.name}
                    onChange={handleUpdateFormChange}
                    style={{ height: "40px", fontSize: "15px" }}
                  />
                </Form.Group>
              

            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1">
              <Form.Label style={{ fontSize: "18px" }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                style={{
                  fontSize: "16px",
                  height: "200px",
                  maxHeight: "200px",
                  resize: "none",
                  overflowY: "auto",
                }}
                name="description"
                value={updateFormData.description}
                onChange={handleUpdateFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              variant="warning"
              size="md"
              style={{ fontSize: "20px" }}>
              Save
            </Button>
            <Button
              variant="secondary"
              size="md"
              style={{ fontSize: "20px" }}
              onClick={handleUpdateClose}>
              Close
            </Button>
            <Button
              variant="secondary"
              size="md"
              style={{ fontSize: "20px" }}
              onClick={() => handleDelete(updateFormData.membershipTypeId)}>
              Delete
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* ---------------------------------- END MODAL FOR UPDATE---------------------------------------------------- */}
    </div>
    
  )
}

export default ProductManagement
