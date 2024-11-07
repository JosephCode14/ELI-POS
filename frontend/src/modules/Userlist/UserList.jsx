import React, {useEffect, useState} from 'react';
import '../../assets/global/style.css';
import '../styles/react-style.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import swal from "sweetalert";
import axios from "axios";
import BASE_URL from "../../assets/global/url";

import $ from "jquery";
import "smartwizard/dist/css/smart_wizard_all.css";
import smartWizard from 'smartwizard';

import {
    Plus,
  } from "@phosphor-icons/react";

function UserList() {

  //-----------------Smart Wizard Form-----------------------//
    $(function() {
      $('#smartwizard').smartWizard({
        selected: 0, // Initial selected step, 0 = first step
        theme: 'basic', // theme for the wizard, related css need to include for other than basic theme
        justified: true, // Nav menu justification. true/false
        autoAdjustHeight: true, // Automatically adjust content height
        backButtonSupport: true, // Enable the back button support
        enableUrlHash: false, // Enable selection of the step based on url hash
        transition: {
            animation: 'fade', // Animation effect on navigation, none|fade|slideHorizontal|slideVertical|slideSwing|css(Animation CSS class also need to specify)
            speed: '400', // Animation speed. Not used if animation is 'css'
            easing: '', // Animation easing. Not supported without a jQuery easing plugin. Not used if animation is 'css'
            prefixCss: '', // Only used if animation is 'css'. Animation CSS prefix
            fwdShowCss: '', // Only used if animation is 'css'. Step show Animation CSS on forward direction
            fwdHideCss: '', // Only used if animation is 'css'. Step hide Animation CSS on forward direction
            bckShowCss: '', // Only used if animation is 'css'. Step show Animation CSS on backward direction
            bckHideCss: '', // Only used if animation is 'css'. Step hide Animation CSS on backward direction
        },
        toolbar: {
            position: 'bottom', // none|top|bottom|both
            showNextButton: true, // show/hide a Next button
            showPreviousButton: true, // show/hide a Previous button
            extraHtml: '', // Extra html to show on toolbar
        },
        anchor: {
            enableNavigation: true, // Enable/Disable anchor navigation 
            enableNavigationAlways: false, // Activates all anchors clickable always
            enableDoneState: true, // Add done state on visited steps
            markPreviousStepsAsDone: true, // When a step selected by url hash, all previous steps are marked done
            unDoneOnBackNavigation: false, // While navigate back, done state will be cleared
            enableDoneStateNavigation: true // Enable/Disable the done state navigation
        },
        keyboard: {
            keyNavigation: true, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
            keyLeft: [37], // Left key code
            keyRight: [39] // Right key code
        },
        lang: { // Language variables for button
            next: 'Next',
            previous: 'Previous'
        },
        disabledSteps: [], // Array Steps disabled
        errorSteps: [], // Array Steps error
        warningSteps: [], // Array Steps warning
        hiddenSteps: [], // Hidden steps
        getContent: null // Callback function for content loading
      });
    });
  //-----------------End Smart Wizard Form-----------------------//

    const [UserList, setUserList] = useState([]);
    const [show, setShow] = useState(false);
    
    const handleClose = () => setShow(false);
    const handleUpdateClose = () => setUpdateModalShow(false);
    const handleShow = () => setShow(true);
    const [updateModalShow, setUpdateModalShow] = useState(false);

    const [validated, setValidated] = useState(false);

    const [updateFormData, setUpdateFormData] = useState({
        membershipTypeId: "",
        name: "",
        description: "",
      });

      const [lastName, setLastName] = useState();
      const [firstName, setFirstName] = useState();
      const [middleName, setMiddleName] = useState();
      const [address, setAddress] = useState();
      const [municipality, setMunicipality] = useState();
      const [province, setProvince] = useState();
      const [zipCode, setZipcode] = useState();
      const [email, setEmail] = useState();
      const [contactNumber, setContactNumber] = useState();
      const [gender, setGender] = useState();
      const [birthDate, setBirthDate] = useState();
      const [rfidTag, setRfidTag] = useState();
      const [status, setStatus] = useState();
      const [natureOfWork, setNatureOfWork] = useState();
      const [companyName, setCompanyName] = useState();
      const [jobTitle, setJobTitle] = useState();
      const [companyAddress, setCompanyAddress] = useState();
      const [companyEmail, setCompanyEmail] = useState();
      const [companyNumber, setCompanyNumber] = useState();

//--------------------------------Membership type list fetch---------------------------------//
useEffect(() => {
    axios
      .get(BASE_URL + "/userList/getUserlists")
      .then((res) => setUserList(res.data))
      .catch((err) => console.log(err));
  }, []);

  const reload_table_membership_type = () =>  {
    axios.get(BASE_URL + "/userList/getUserlists")
      .then(res => {
        setUserList(res.data);
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
      setUserList((prev) => [
        ...prev,
        {
          membership_type_id: newId,
          name: res.data.name,
          description: res.data.description,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
        },
      ]);

      setLastName(""); // Clear the nameManu input field
    //   setDescription(""); // Clear the descManu input field

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

  // ----------------------------------Get Membership Type List------------------------------//
  const [memberShipTypeList, setMembershipTypeList] = useState([]);
  const [select_memberShipTypeList, setSelect_MembershipType] = useState([]);
  useEffect(() => {
    axios
      .get(BASE_URL + "/membershipType/getMembershipType")
      .then((response) => {
        setMembershipTypeList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching master list:", error);
      });
  }, []);

  const handleFormChangeMasterList = (event) => {
    setSelect_MembershipType(event.target.value);
  };

  // ----------------------------------End Membership Type List------------------------------//

//--------------------------------Add Membership type---------------------------------//
const addUserList = async (e) => {
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
        .post(`${BASE_URL}/userList/create`, {
          last_name: lastName,
          first_name: firstName,
          middle_name: middleName,
          address: address,
          municipality: municipality,
          province: province,
          zipcode: zipCode,
          email: email,
          contact_number: contactNumber,
          gender: gender,
          birth_date: birthDate,
          status: status,
          rfid_tag: rfidTag,
          membership_type_id: select_memberShipTypeList,
          status: 'Active',
          nature_of_work: natureOfWork,
          company_name: companyName,
          job_title: jobTitle,
          company_address: companyAddress,
          company_email: companyEmail,
          company_number: companyNumber, 
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
const updateUserList = async (e) => {
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
          setUserList((prev) =>
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
            setUserList((prev) => prev.filter((data) => data.id !== membershipTypeId));
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

                </div>
                <div className="Employeetext-button">
                    <div className="employee-and-button">
                        <div className="emp-text-side">
                            <p>User List</p>
                        </div>

                        <div className="button-create-side">
                        <div className="Buttonmodal-new">
                        <button onClick={handleShow}>
                            <span style={{}}>
                            <Plus size={15} />
                            </span>
                            Add New
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
                                    <th className='tableh'>RFID #</th>
                                    <th className='tableh'>Name</th>
                                    <th className='tableh'>Contact No.</th>
                                    <th className='tableh'>Registered Date</th>
                                    <th className='tableh'>Balance</th>
                                    <th className='tableh'>Credit Used</th>
                                    <th className='tableh'>Membership Type</th>
                                    <th className='tableh'>Earned Points</th>
                                    <th className='tableh'>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {UserList.map((data, i) => (
                                    <tr key={i}>
                                    <td onClick={() => handleModalToggle(data)}>{data.rfid_tag}</td>
                                    <td onClick={() => handleModalToggle(data)}>{data.first_name} {data.middle_name} {data.last_name}</td>
                                    <td onClick={() => handleModalToggle(data)}>{data.contact_number}</td>
                                    <td onClick={() => handleModalToggle(data)}>{formatDate(data.createdAt)}</td>
                                    <td onClick={() => handleModalToggle(data)}>₱ 0.00</td>
                                    <td onClick={() => handleModalToggle(data)}>₱ 0.00</td>
                                    <td onClick={() => handleModalToggle(data)}>{data.membership_type.name}</td>
                                    <td onClick={() => handleModalToggle(data)}>0</td>
                                    <td onClick={() => handleModalToggle(data)}>Active</td>
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
          onSubmit={addUserList}>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: "24px" }}>
              Create Personal Information
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <div id="smartwizard">
            <ul class="nav">
                <li class="nav-item">
                  <a class="nav-link" href="#step-1" style={{ fontSize: "200%" }}>
                    <div class="num">1</div>
                    Personal Information
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#step-2" style={{ fontSize: "200%" }}>
                    <span class="num">2</span>
                    Employment Details
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#step-3" style={{ fontSize: "200%" }}>
                    <span class="num">3</span>
                    RFID
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#step-4" style={{ fontSize: "200%" }}>
                    <span class="num">4</span>
                    Membership Type
                  </a>
                </li>
            </ul>
        
            <div class="tab-content">
                <div id="step-1" class="tab-pane" role="tabpanel" aria-labelledby="step-1">

                <div className="row mt-3">
                  <div className="col-4">
                      <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1">
                      <Form.Label style={{ fontSize: "18px" }}>Last name: </Form.Label>
                      <Form.Control
                      type="text"
                      placeholder=""
                      required
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ height: "40px", fontSize: "15px" }}
                      />
                      </Form.Group>
                  </div>
                  <div className="col-4">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>First name: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setFirstName(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                  <div className="col-4">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Middle name: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setMiddleName(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-6">
                      <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1">
                      <Form.Label style={{ fontSize: "18px" }}>Email: </Form.Label>
                      <Form.Control
                      type="text"
                      placeholder=""
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ height: "40px", fontSize: "15px" }}
                      />
                      </Form.Group>
                  </div>
                  <div className="col-6">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Contact Number: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setContactNumber(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-8">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Address: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setAddress(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                  <div className="col-4">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Municipality: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setMunicipality(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-3">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Province: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setProvince(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                  <div className="col-3">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Zip Code: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setZipcode(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                  <div className="col-3">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Gender: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setGender(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>
                  </div>
                  <div className="col-3">
                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Birth Date: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setBirthDate(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group> 
                  </div>
                </div>
                </div>

                <div id="step-2" class="tab-pane" role="tabpanel" aria-labelledby="step-2">
                <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Nature of Work: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setNatureOfWork(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group>  

                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Company Name: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setCompanyName(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group> 

                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Job Title: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setJobTitle(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group> 

                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Business / Employer's Address: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group> 

                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Email: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group> 

                      <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1">
                          <Form.Label style={{ fontSize: "18px" }}>Company Contact No.: </Form.Label>
                          <Form.Control
                          type="text"
                          placeholder=""
                          required
                          onChange={(e) => setCompanyNumber(e.target.value)}
                          style={{ height: "40px", fontSize: "15px" }}
                          />
                      </Form.Group> 
                </div>

                <div id="step-3" class="tab-pane" role="tabpanel" aria-labelledby="step-3">
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1">
                      <Form.Label style={{ fontSize: "18px" }}>RFID TAG: </Form.Label>
                      <Form.Control
                      type="text"
                      placeholder=""
                      required
                      onChange={(e) => setRfidTag(e.target.value)}
                      style={{ height: "40px", fontSize: "15px" }}
                      />
                    </Form.Group> 

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1">
                      <Form.Label style={{ fontSize: "18px" }}>TOP UP: </Form.Label>
                      <Form.Control
                      type="text"
                      // placeholder=""
                      // required
                      // onChange={(e) => setRfidTag(e.target.value)}
                      style={{ height: "40px", fontSize: "15px" }}
                      />
                    </Form.Group> 
                </div>
            <div id="step-4" class="tab-pane" role="tabpanel" aria-labelledby="step-4">
                <Form.Group controlId="exampleForm.ControlInput2">
                  <Form.Label style={{ fontSize: "20px" }}>
                    Membership Type:{" "}
                  </Form.Label>
                  <Form.Select
                    aria-label=""
                    onChange={handleFormChangeMasterList}
                    style={{ height: "40px", fontSize: "15px" }}
                    defaultValue="">
                    <option disabled value="">
                      Select Membership Type
                    </option>
                    {memberShipTypeList.map((memberShipTypeList) => (
                      <option key={memberShipTypeList.membership_type_id} value={memberShipTypeList.membership_type_id}>
                        {memberShipTypeList.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>  
            </div>
            </div>
        
            {/* <!-- Include optional progressbar HTML --> */}
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        </div>
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
      {/* <Modal
        show={updateModalShow}
        onHide={() => handleModalToggle()}
        backdrop="static"
        keyboard={false}
        size="lg">
        <Form
          noValidate
          validated={validated}
          onSubmit={updateUserList}>
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
      </Modal> */}
      {/* ---------------------------------- END MODAL FOR UPDATE---------------------------------------------------- */}
    </div>
    
  )
}

export default UserList
