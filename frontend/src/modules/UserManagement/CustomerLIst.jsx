import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import swal from "sweetalert";
import { Modal, Button, Form } from "react-bootstrap";
import _Sidebar from "../Sidebar/_Sidebar";
import "../styles/usermanagement.css";
// import "../styles/pos_react.css";
import { customStyles } from "../styles/table-style";
import axios from "axios";
import noData from "../../assets/icon/no-data.png";
import IconExel from "../../assets/icon/excel-icon.png";
import BASE_URL from "../../assets/global/url";
import NoAccess from "../../assets/image/NoAccess.png";
import { Plus, ArrowsClockwise } from "@phosphor-icons/react";
import { jwtDecode } from "jwt-decode";
import { FourSquare } from "react-loading-indicators";
import ReactLoading from "react-loading";
function CustomerList({ authrztn }) {
  const [userId, setuserId] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setEditUserModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [validated, setValidated] = useState(false);
  const [Student, setStudent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  //--------------------------------Add Student---------------------------------//
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [rfid, setRfid] = useState("");

  const [status, setStatus] = useState(false);
  const [validity, setValidity] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [category, setCategory] = useState("Student");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [creditsEnable, setCreditsEnable] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const [showAddUser, setShowAddUser] = useState(false);
  const [containerClass, setContainerClass] = useState("users-container");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [showChangeStatusButton, setShowChangeStatusButton] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Active");

  const handleShowAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);
  const handleShowEditUserModal = () => setEditUserModal(true);
  const handleCloseEditUserModal = () => setEditUserModal(false);
  const handleCloseModal = () => setShowAddUserModal(false);

  const handleCloseStatusModal = () => setShowChangeStatusModal(false);
  const handleShowChangeStatusModal = () => setShowChangeStatusModal(true);
  const [importModal, setImportModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [file, setFile] = useState("");
  const fileRef = useRef();

  const [loadingBtn, setLoadingBtn] = useState(false);

  // Scan
  const [serial, setSerial] = useState("");
  const [logs, setLogs] = useState([]);
  const log = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };
  /* global NDEFReader */
  const handleScan = async () => {
    log("User clicked scan button");

    if (!("NDEFReader" in window)) {
      log("NFC not supported on this device or browser.");
      return;
    }

    try {
      // eslint-disable-next-line no-undef
      const ndef = new NDEFReader();
      await ndef.scan();
      log("> Scan started");

      ndef.addEventListener("readingerror", () => {
        log("Argh! Cannot read data from the NFC tag. Try another one?");
      });

      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        log(`> Serial Number: ${serialNumber}`);
        log(`> Records: (${message.records.length})`);

        setSerial(serialNumber);

        const cleanedSerial = serialNumber.replace(/:/g, "");
        const decimalValue = parseInt(cleanedSerial, 16);

        console.log(decimalValue.toString());

        setRfid(decimalValue);

        setUpdateFormData((prevData) => ({
          ...prevData,
          rfid: decimalValue,
        }));
      });
    } catch (error) {
      log("Argh! " + error);
      console.log(error);
    }
  };

  useEffect(() => {
    handleScan();
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
  };

  const [search, setSearch] = useState("");

  const processSearch = (search) => {
    search = encodeURIComponent(search);
    axios
      .get(`${BASE_URL}/student/searchCustomer/${search}`)
      .then((res) => {
        setStudent(res.data);
      })
      .catch((err) => console.log(err));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim() === "") {
      reloadTable();
    } else {
      processSearch(value);
    }
  };

  const filteredData = Student.filter(
    (student) =>
      (statusFilter === "" || student.status === statusFilter) &&
      (categoryFilter === "Select All" ||
        categoryFilter === "" ||
        student.category === categoryFilter)
  );

  const handleCheckboxChange = (studentIds) => {
    const updatedCheckboxes = [...selectedCheckboxes];

    if (updatedCheckboxes.includes(studentIds)) {
      updatedCheckboxes.splice(updatedCheckboxes.indexOf(studentIds), 1);
    } else {
      updatedCheckboxes.push(studentIds);
    }

    setSelectedCheckboxes(updatedCheckboxes);
    setShowChangeStatusButton(updatedCheckboxes.length > 0);
  };

  const handleSelectAllChange = () => {
    const studentIds = Student.map((data) => data.student_id);

    if (studentIds.length === 0) {
      return;
    }

    if (selectedCheckboxes.length === studentIds.length) {
      setSelectedCheckboxes([]);
      setShowChangeStatusButton(false);
      setSelectAllChecked(false);
    } else {
      setSelectedCheckboxes(studentIds);
      setShowChangeStatusButton(true);
      setSelectAllChecked(true);
    }
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  //update status
  const handleSave = () => {
    axios
      .put(BASE_URL + "/student/statusupdate", {
        studentIds: selectedCheckboxes,
        status: selectedStatus,
      })
      .then((res) => {
        if (res.status === 200) {
          swal({
            title: "Customer status Update!",
            text: "The customer status has been updated successfully.",
            icon: "success",
            button: "OK",
          }).then(() => {
            handleCloseStatusModal();
            reloadTable();
            setSelectAllChecked(false);
            setSelectedCheckboxes([]);
            setShowChangeStatusButton(false);
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAllChange}
          checked={selectAllChecked}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedCheckboxes.includes(row.student_id)}
          onChange={() => handleCheckboxChange(row.student_id)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "RFID",
      selector: (row) => row.rfid,
      sortable: true,
    },
    {
      name: "Student Number",
      selector: (row) => row.student_number,
      sortable: true,
    },
    {
      name: "Full Name",
      selector: (row) =>
        `${row.first_name} ${row.middle_name != null ? row.middle_name : ""} ${
          row.last_name
        }`,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Contact Number",
      selector: (row) => row.contact_number,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Balance",
      selector: (row) => row.student_balances.map((student) => student.balance),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            background:
              row.status === "Active"
                ? "green"
                : row.status === "Inactive"
                ? "red"
                : row.status === "Archive"
                ? "gray"
                : "inherit",
            padding: "5px",
            width: "6em",
            color: "white",
            textAlign: "center",
            borderRadius: "5px",
          }}
        >
          {row.status}
        </div>
      ),
    },
  ];

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const createStudent = async (e) => {
    e.preventDefault();

    // Check if email ay tama ang format
    if (email && !validateEmail(email)) {
      swal({
        icon: "error",
        title: "Invalid Email Format",
        text: "Please enter a valid email address",
      });
      return;
    }

    if (contactNumber !== "" && contactNumber.length !== 11) {
      swal({
        icon: "error",
        title: "Invalid Contact Number",
        text: "Please enter a valid contact number",
      });
      return;
    }

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
      setLoadingBtn(true);
      axios
        .post(`${BASE_URL}/student/create`, {
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          email: email,
          contactNumber: contactNumber,
          address: address,
          rfid: rfid,
          status: status,
          validity: validity,
          studentNumber: studentNumber,
          category: category,
          pin: pin.join(""),
          userId,
          creditsEnable,
        })
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            swal({
              title: "New Customer Created",
              text: "New customer has been added successfully",
              icon: "success",
              button: "OK",
            }).then(() => {
              setValidated(false);
              reloadTable();
              setCategory("Student");
              setStudentNumber("");
              setRfid("");
              setValidity("");
              setFirstName("");
              setLastName("");
              setContactNumber("");
              setEmail("");
              setMiddleName("");
              setAddress("");
              setPin(["", "", "", ""]);
              setLoadingBtn(false);
            });
            // reloadTable();
          } else if (res.status === 201) {
            swal({
              title: "Student RFID Code Already Exist",
              text: "Use other RFID Card",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
              setLoadingBtn(false);
            });
          } else if (res.status === 202) {
            swal({
              title: "Student Number Already Exist",
              text: "Input another Student Number",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
              setLoadingBtn(false);
            });
          } else if (res.status === 203) {
            swal({
              title: "Email Already Exist",
              text: "Input another email",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
              setLoadingBtn(false);
            });
          } else {
            swal({
              title: "Something went wrong",
              text: "Please Contact our Support",
              icon: "error",
              button: "OK",
            }).then(() => {
              reloadTable();
              setLoadingBtn(false);
            });
          }
        });
    }
    setValidated(true); //for validations
  };
  //--------------------------------End Add Student---------------------------------//

  const handleChange = (e, index) => {
    const newValue = e.target.value;

    // Handle digit input or deletion
    if (!isNaN(newValue) && newValue.length <= 1) {
      setPin((prevPin) => {
        const updatedPin = [...prevPin];
        updatedPin[index] = newValue;
        return updatedPin;
      });
      if (newValue !== "" && index < 3) {
        inputRefs[index + 1].current.focus();
      }

      if (newValue === "" && index > 0) {
        inputRefs[index - 1].current.focus();
      }
    }
  };
  //--------------------------------Reload Table---------------------------------//
  const reloadTable = () => {
    axios
      .get(BASE_URL + "/student/getStudents")
      .then((res) => {
        setStudent(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(true);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadTable();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  //--------------------------------End Reload Table---------------------------------//
  //--------------------------------Student Fetch---------------------------------//
  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  useEffect(() => {
    decodeToken();
  }, []);

  //--------------------------------End Student Fetch---------------------------------//

  //--------------------------------Date Format---------------------------------//
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 as getMonth() is zero-based
    const day = date.getDate().toString().padStart(2, "0");
    // return `${year}-${month}-${day}`;
    return `${day}-${month}-${year}`;
  };
  //--------------------------------End Date Format---------------------------------//

  //--------------------------------Show Modal Update---------------------------------//
  const handleModalToggle = (updateData = null) => {
    if (authrztn.includes("CustomerList-Edit")) {
      handleShowEditUserModal(!showEditUserModal);
      if (updateData) {
        setUpdateFormData({
          studentId: updateData.student_id,
          firstName: updateData.first_name,
          middleName: updateData.middle_name,
          rfid: updateData.rfid,
          lastName: updateData.last_name,
          email: updateData.email,
          contactNumber: updateData.contact_number,
          address: updateData.address,
          validity: updateData.validity,
          studentNumber: updateData.student_number,
          category: updateData.category,
          student_pin: updateData.student_pin,
          credit: updateData.credit_enable,
        });
      } else {
        setSelectedRow({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          contactNumber: "",
          address: "",
          validity: "",
          studentNumber: "",
          category: "",
        });
      }
    }
  };
  //--------------------------------End Show Modal Update---------------------------------//
  //--------------------------------Update Student---------------------------------//

  const firstPinRef = useRef(null);
  const secondPinRef = useRef(null);
  const thirdPinRef = useRef(null);
  const fourthPinRef = useRef(null);

  // const handleUpdateFormChange = (e) => {
  //   const { name, value } = e.target;
  //   if (name === "student_pin") {
  //     // If ang student_pin ay being updated, update yung specific digit
  //     const pinDigits = updateFormData.student_pin.split(""); // convertion ng string sa array
  //     const index = parseInt(e.target.getAttribute("data-index"), 10);
  //     pinDigits[index] = value;
  //     setUpdateFormData((prevData) => ({
  //       ...prevData,
  //       student_pin: pinDigits.join(""),
  //     }));

  //     // sa pag move ng focus to next input field
  //     switch (index) {
  //       case 0:
  //         secondPinRef.current.focus();
  //         break;
  //       case 1:
  //         thirdPinRef.current.focus();
  //         break;
  //       case 2:
  //         fourthPinRef.current.focus();
  //         break;
  //       default:
  //         break;
  //     }
  //   } else {
  //     setUpdateFormData((prevData) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleUpdateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "student_pin") {
      if (!isNaN(value) && value.length <= 1) {
        const pinDigits = updateFormData.student_pin.split("");
        const index = parseInt(e.target.getAttribute("data-index"), 10);
        pinDigits[index] = value;
        setUpdateFormData((prevData) => ({
          ...prevData,
          student_pin: pinDigits.join(""),
        }));
        if (value !== "") {
          switch (index) {
            case 0:
              secondPinRef.current.focus();
              break;
            case 1:
              thirdPinRef.current.focus();
              break;
            case 2:
              fourthPinRef.current.focus();
              break;
            default:
              break;
          }
        }
      }
    } else if (name == "credit") {
      setUpdateFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setUpdateFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const updatevalidateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const [updateFormData, setUpdateFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    address: "",
    validity: "",
    studentNumber: "",
    rfid: "",
    category: "",
    student_pin: "",
  });

  const updateStudent = async (e) => {
    e.preventDefault();

    if (updateFormData.email && !updatevalidateEmail(updateFormData.email)) {
      swal({
        icon: "error",
        title: "Invalid Email Format",
        text: "Please enter a valid email address",
      });
      return; // Stop further execution if email is invalid
    }

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      swal({
        icon: "error",
        title: "Invalid Input",
        text: "Please fill out all required fields correctly.",
      });
    } else {
      const studentId = updateFormData.studentId;
      setShowAddUser(false);
      setLoadingBtn(true);

      const response = await axios.put(
        BASE_URL + `/student/update/${studentId}`,
        {
          firstName: updateFormData.firstName,
          middleName: updateFormData.middleName,
          lastName: updateFormData.lastName,
          contactNumber: updateFormData.contactNumber,
          email: updateFormData.email,
          address: updateFormData.address,
          validity: updateFormData.validity,
          student_pin: updateFormData.student_pin,
          studentNumber: updateFormData.studentNumber,
          category: updateFormData.category,
          rfid: updateFormData.rfid,
          credit: updateFormData.credit,
          userId,
        }
      );

      if (response.status === 200) {
        swal({
          title: "Update successful!",
          text: "The Student has been updated successfully.",
          icon: "success",
          button: "OK",
        }).then(() => {
          reloadTable();
          handleCloseEditUserModal();
          setValidated(false);
          setLoadingBtn(false);
        });
      } else if (response.status === 202) {
        swal({
          title: "Email Already Exist",
          text: "Input another email",
          icon: "error",
          button: "OK",
        });
        setLoadingBtn(false);
      } else if (response.status === 203) {
        swal({
          title: "Student Number Already Exist",
          text: "Input another student number",
          icon: "error",
          button: "OK",
        }).then(() => {
          reloadTable();
          setLoadingBtn(false);
        });
      } else if (response.status === 204) {
        swal({
          title: "RFID already exists",
          text: "Please try agains",
          icon: "error",
          button: "OK",
        }).then(() => {
          reloadTable();
          setLoadingBtn(false);
        });
      } else {
        swal({
          icon: "error",
          title: "Something went wrong" + response.status,
          text: "Please contact our support",
        });
        setLoadingBtn(false);
      }
    }
    setValidated(true);
  };

  //--------------------------------End Update Student---------------------------------//

  const handleAddUserToggle = () => {
    if (windowWidth < 1200) {
      setShowAddUserModal(!showAddUserModal);
    } else {
      setShowAddUser(!showAddUser);
    }
    setValidated(false);
    setCategory("Student");
    setStudentNumber("");
    setRfid("");
    setValidity("");
    setFirstName("");
    setLastName("");
    setContactNumber("");
    setEmail("");
    setMiddleName("");
    setAddress("");
    setPin(["", "", "", ""]);
  };

  useEffect(() => {
    if (showAddUser) {
      setContainerClass("users-div d-flex flex-row");
    } else {
      setContainerClass("users-div");
    }
  }, [showAddUser]);

  // const handleDownloadTemplate = () => {
  //   const headers = [
  //     "CATEGORY",
  //     "STUDENT #",
  //     "RFID #",
  //     "VALIDITY",
  //     "FIRST NAME",
  //     "LAST NAME",
  //     "CONTACT",
  //     "EMAIL ADDRESS",
  //     "HOME ADDRESS",
  //     "STUDENT PIN",
  //   ];

  //   const sampleData = [
  //     "Sample Category",
  //     "1234567890",
  //     "987654321",
  //     "2024/06/08",
  //     "John",
  //     "Doe",
  //     "09123456789",
  //     "studentemail@example.com",
  //     "123 Ohio Street",
  //     "7890",
  //   ];

  //   const rows = [headers, sampleData];
  //   const csvContent = rows.map((row) => row.join(",")).join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const link = document.createElement("a");
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = "template_user.csv";
  //   link.click();
  // };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/student/generate-template`,
        null,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "template_user.xlsx";
      link.click();
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  function selectspecificFiles() {
    fileRef.current.click();
  }

  const handleCloseImportModal = () => {
    setImportModal(false);
    setFile("");
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validType = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
      "application/csv", // .csv
    ];

    if (selectedFile && validType.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      swal({
        title: "Please upload a valid excel file!",
        icon: "error",
        button: "OK",
      });
    }
  };

  const handleBulkUser = async () => {
    try {
      if (file == "") {
        swal({
          title: "Choose a file",
          text: "Please input a file",
          icon: "error",
          button: "OK",
        });
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      setLoadingBtn(true);
      const res = await axios.post(`${BASE_URL}/student/bulk-user`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status == 200) {
        const existingDetailsTable = document.createElement("table");
        existingDetailsTable.style.width = "100%";
        existingDetailsTable.style.borderCollapse = "collapse";
        existingDetailsTable.style.maxHeight = "250px";
        existingDetailsTable.style.overflowY = "scroll";
        existingDetailsTable.style.display = "block";

        // Add a header row
        existingDetailsTable.innerHTML = `
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Student #</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Duplicate Type</th>
          </tr>
        `;

        res.data.existingData.forEach((item) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px;">${item.studentNumber}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.fullName}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.duplicateType}</td>
          `;
          existingDetailsTable.appendChild(row);
        });

        swal({
          title: "Bulk Upload Successfully!",
          text: `${res.data.existing} data not inserted`,
          content: existingDetailsTable,
          icon: "success",
          button: "OK",
        }).then(() => {
          reloadTable();
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      }
      if (res.status == 201) {
        swal({
          title: "Invalid Format",
          text: "Please use the given template",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      } else if (res.status == 202) {
        swal({
          title: "STUDENT PIN",
          text: "Student PIN is required",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      } else if (res.status == 203) {
        swal({
          title: "STUDENT NUMBER",
          text: "Student Number is required",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      } else if (res.status == 204) {
        swal({
          title: "FIRST NAME",
          text: "First Name is required",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      } else if (res.status == 205) {
        swal({
          title: "LAST NAME",
          text: "Last Name is required",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      } else if (res.status == 206) {
        swal({
          title: "STUDENT PIN",
          text: "Student Pin is required",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

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
      <div className={containerClass}>
        {isLoading ? (
          <div
            className="d-flex justify-content-center flex-column vh-100 ms-5 ps-5 align-items-center"
            // style={{
            //   margin: "0",
            //   marginLeft: windowWidth < 768 ? "100px" : "250px",
            // }}
          >
            <FourSquare
              color="#6290FE"
              size="large"
              text="Loading Data..."
              textColor=""
            />
          </div>
        ) : authrztn.includes("CustomerList-View") ? (
          <div className="users-container">
            <div className="title-container pt-5 stud-man-container mx-1 flex-column flex-md-row">
              <h2>Customer List Management</h2>
              {authrztn.includes("CustomerList-IE") && (
                <div
                  className="download-container"
                  style={{ flex: windowWidth >= 768 && "none" }}
                >
                  <button
                    type="button"
                    className="text-nowrap"
                    onClick={handleDownloadTemplate}
                  >
                    Download Template
                  </button>
                  <button
                    type="button"
                    className="stud-import"
                    onClick={() => setImportModal(true)}
                  >
                    <i class="bx bx-download"></i>Import
                  </button>
                </div>
              )}
            </div>
            <div className="btn-manage-container gap-2 d-flex flex-column flex-md-row justify-content-between mt-2 p-1">
              <div
                class="input-group"
                style={{
                  width: windowWidth < 768 ? "100%" : "25%",
                }}
              >
                <input
                  type="text"
                  className="form-control m-0"
                  style={{ fontSize: "13px" }}
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search"
                />
              </div>

              <div className="user-filter gap-2 d-flex p-0">
                <select
                  class="form-select m-0"
                  onChange={handleCategoryFilter}
                  style={{ width: "40%", fontSize: "1.3rem" }}
                >
                  <option disabled selected>
                    Select Category
                  </option>
                  <option value="Select All">Select All</option>
                  <option value="Student">Student</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Department">Department</option>
                  <option value="Employee">Employee</option>
                </select>

                <select
                  class="form-select m-0"
                  onChange={handleStatusFilterChange}
                  style={{ width: "40%", fontSize: "1.3rem" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {showChangeStatusButton
                  ? authrztn.includes("CustomerList-Edit") && (
                      <button
                        className="btn btn-secondary"
                        onClick={handleShowChangeStatusModal}
                      >
                        <ArrowsClockwise size={32} color="#f2f2f2" /> Change
                        Status
                      </button>
                    )
                  : authrztn.includes("CustomerList-Add") && (
                      <button onClick={handleAddUserToggle}>
                        <Plus size={32} color="#f2f2f2" /> Add Customer
                      </button>
                    )}
              </div>
            </div>

            <div className="table">
              {filteredData.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>RFID</th>
                        <th>STUDENT NUMBER</th>
                        <th>FULL NAME</th>
                        <th>CATEGORY</th>
                        <th>CONTACT NUMBER</th>
                        <th>EMAIL</th>
                        <th>BALANCE</th>
                        <th>STATUS</th>
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
                  <div className="c-data-table">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      pagination
                      paginationRowsPerPageOptions={[5, 10, 25]}
                      highlightOnHover
                      onRowClicked={handleModalToggle}
                      customStyles={customStyles}
                    />
                  </div>
                </>
              )}
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
              marginLeft: "12%",
              marginTop: "1.9%",
            }}
          >
            <img src={NoAccess} alt="NoAccess" className="no-access-img" />
            <h3>You don't have access to this function.</h3>
          </div>
        )}
        {showAddUser && (
          <div className="add-account-container pt-5 d-none d-xl-block">
            <Form noValidate validated={validated} onSubmit={createStudent}>
              <div className="add-account-content">
                <div className="add-account-title">
                  <h1>Add User</h1>
                  <hr />
                </div>
                <div className="add-account-body">
                  <div className="row">
                    <div className="col-sm">
                      <label htmlFor="category">
                        Category <span style={{ color: "red" }}>*</span>
                      </label>
                      <Form.Select
                        className="form-control search "
                        aria-label="Default select example"
                        required
                        onChange={handleCategoryChange}
                        value={category}
                        style={{ color: "black", height: "40px" }}
                      >
                        <option value="Student">Student</option>
                        <option value="Visitor">Visitor</option>
                        <option value="Department">Department</option>
                        <option value="Employee">Employee</option>
                      </Form.Select>
                    </div>
                    <div className="col-sm">
                      <label htmlFor="">
                        {category === "Student" ? (
                          <>
                            Student # <span style={{ color: "red" }}>*</span>
                          </>
                        ) : (
                          <>
                            Department Name{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        )}
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          required
                          class="form-control search mb-0"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {category === "Student" && (
                    <div className="row">
                      <div className="form-check d-flex p-0 mb-4">
                        <input
                          type="checkbox"
                          className="ms-3"
                          id="scholarCheckbox"
                          checked={creditsEnable}
                          onChange={(e) => setCreditsEnable(e.target.checked)}
                        />
                        <label
                          className="form-check-label ms-3"
                          style={{ fontSize: "15px" }}
                          htmlFor="scholarCheckbox"
                        >
                          Credits
                        </label>
                      </div>
                    </div>
                  )}

                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">RFID #</label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={rfid}
                          onChange={(e) => setRfid(e.target.value)}
                        />
                      </div>
                    </div>
                    <div class="col-sm">
                      <label htmlFor="">Validity</label>
                      <div class="input-group mb-3">
                        <input
                          type="date"
                          class="form-control date"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={validity}
                          onChange={(e) => setValidity(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">
                        {category === "Student" ? (
                          <>
                            First Name <span style={{ color: "red" }}>*</span>
                          </>
                        ) : (
                          <>
                            Assigned User First Name{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        )}
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          required
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div class="col-sm">
                      <label htmlFor="">
                        {category === "Student" ? (
                          <>Middle Name</>
                        ) : (
                          <>Assigned User Middle Name </>
                        )}
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">
                        {category === "Student" ? (
                          <>
                            Last Name <span style={{ color: "red" }}>*</span>
                          </>
                        ) : (
                          <>
                            Assigned User Last Name{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        )}
                      </label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          required
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div class="col-sm">
                      <label htmlFor="">Contact</label>
                      <div class="input-group  mb-3">
                        <input
                          type="tel"
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={contactNumber}
                          onInput={(e) =>
                            (e.target.value = e.target.value.replace(/\D/, ""))
                          }
                          maxLength={11}
                          onChange={(e) => setContactNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">Email Address</label>
                      <div class="input-group  mb-3">
                        <input
                          type="text"
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-sm">
                      <label htmlFor="">Home Address</label>
                      <div class="input-group  mb-3">
                        <input
                          type="text"
                          class="form-control search"
                          aria-label="Username"
                          aria-describedby="basic-addon1"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm">
                      <div className="label-section">
                        <label htmlFor="">User PIN</label>
                      </div>

                      <div className="pin-sec">
                        <div className="firstbox-pin">
                          <Form.Control
                            type="number"
                            value={pin[0] || ""}
                            maxLength="1"
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 0)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            ref={inputRefs[0]}
                            pattern="\d*"
                            required
                          />
                        </div>
                        <div className="secondbox-pin">
                          <Form.Control
                            type="number"
                            value={pin[1] || ""}
                            maxLength="1"
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 1)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            required
                            ref={inputRefs[1]}
                          />
                        </div>
                        <div className="thirdbox-pin">
                          <Form.Control
                            type="number"
                            maxLength="1"
                            value={pin[2] || ""}
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 2)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            required
                            ref={inputRefs[2]}
                          />
                        </div>
                        <div className="fourthbox-pin">
                          <Form.Control
                            type="number"
                            maxLength="1"
                            value={pin[3] || ""}
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /\D/,
                                ""
                              ))
                            }
                            onChange={(e) => handleChange(e, 3)}
                            style={{ fontSize: "16px", textAlign: "center" }}
                            required
                            ref={inputRefs[3]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="add-account-footer d-flex flex-row">
                {!loadingBtn ? (
                  <>
                    <Button
                      variant="outline-primary"
                      onClick={handleAddUserToggle}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="d-flex w-100 justify-content-end p-0">
                      <ReactLoading
                        color="blue"
                        type={"spinningBubbles"}
                        height={"5%"}
                        width={"5%"}
                      />
                      <span
                        style={{
                          fontSize: "2rem",
                          marginLeft: "5px",
                        }}
                      >
                        Saving. . .
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Form>
          </div>
        )}
      </div>

      {/* Modal for Adding user */}
      <Modal show={showAddUserModal}>
        <Modal.Header>
          <Modal.Title>
            <div className="add-account-title">
              <h1>Add User</h1>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={createStudent}>
          <Modal.Body>
            <div className="row pe-0">
              <div className="col-sm">
                <label htmlFor="category">
                  Category <span style={{ color: "red" }}>*</span>
                </label>
                <Form.Select
                  className="form-control search"
                  aria-label="Default select example"
                  required
                  onChange={handleCategoryChange}
                  value={category}
                  style={{ color: "black", height: "40px" }}
                >
                  <option value="Student">Student</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Department">Department</option>
                  <option value="Employee">Employee</option>
                </Form.Select>
              </div>
              <div className="col-sm">
                <label htmlFor="">
                  {category === "Student" ? (
                    <>
                      Student # <span style={{ color: "red" }}>*</span>
                    </>
                  ) : (
                    <>
                      Department Name <span style={{ color: "red" }}>*</span>
                    </>
                  )}
                </label>
                <div class="input-group mb-3">
                  <input
                    type="text"
                    required
                    class="form-control search mb-0"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {category === "Student" && (
              <div className="row pe-0">
                <div className="form-check d-flex p-0 mb-4">
                  <input
                    type="checkbox"
                    className="ms-3"
                    id="scholarCheckbox"
                    checked={creditsEnable}
                    onChange={(e) => setCreditsEnable(e.target.checked)}
                  />
                  <label
                    className="form-check-label ms-3"
                    style={{ fontSize: "15px" }}
                    htmlFor="scholarCheckbox"
                  >
                    Credits
                  </label>
                </div>
              </div>
            )}

            <div class="row pe-0">
              <div class="col-sm">
                <label htmlFor="">RFID #</label>
                <div class="input-group mb-3">
                  <input
                    type="text"
                    class="form-control search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={rfid}
                    onChange={(e) => setRfid(e.target.value)}
                  />
                </div>
              </div>
              <div class="col-sm">
                <label htmlFor="">Validity</label>
                <div class="input-group mb-3">
                  <input
                    type="date"
                    class="form-control date"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={validity}
                    onChange={(e) => setValidity(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div class="row pe-0">
              <div class="col-sm">
                <label htmlFor="">
                  {category === "Student" ? (
                    <>
                      First Name <span style={{ color: "red" }}>*</span>
                    </>
                  ) : (
                    <>
                      Assigned User First Name{" "}
                      <span style={{ color: "red" }}>*</span>
                    </>
                  )}
                </label>
                <div class="input-group mb-3">
                  <input
                    type="text"
                    required
                    class="form-control search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div class="col-sm">
                <label htmlFor="">
                  {category === "Student" ? (
                    <>Middle Name</>
                  ) : (
                    <>Assigned User Middle Name </>
                  )}
                </label>
                <div class="input-group mb-3">
                  <input
                    type="text"
                    class="form-control search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div class="row pe-0">
              <div class="col-sm">
                <label htmlFor="">
                  {category === "Student" ? (
                    <>
                      Last Name <span style={{ color: "red" }}>*</span>
                    </>
                  ) : (
                    <>
                      Assigned User Last Name{" "}
                      <span style={{ color: "red" }}>*</span>
                    </>
                  )}
                </label>
                <div class="input-group mb-3">
                  <input
                    type="text"
                    required
                    class="form-control search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div class="col-sm">
                <label htmlFor="">Contact</label>
                <div class="input-group  mb-3">
                  <input
                    type="tel"
                    class="form-control search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={contactNumber}
                    onInput={(e) =>
                      (e.target.value = e.target.value.replace(/\D/, ""))
                    }
                    maxLength={11}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div class="row pe-0">
              <div class="col-sm">
                <label htmlFor="">Email Address</label>
                <div class="input-group  mb-3">
                  <input
                    type="text"
                    class="form-control search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div class="row pe-0">
              <div class="col-sm">
                <label htmlFor="">Home Address</label>
                <div class="input-group  mb-3">
                  <input
                    type="text"
                    class="form-control search"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div class="row pe-0">
              <div class="col-sm">
                <div className="label-section">
                  <label htmlFor="">User PIN</label>
                </div>

                <div className="pin-sec">
                  <div className="firstbox-pin">
                    <Form.Control
                      type="number"
                      value={pin[0] || ""}
                      maxLength="1"
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                      onChange={(e) => handleChange(e, 0)}
                      style={{ fontSize: "16px", textAlign: "center" }}
                      ref={inputRefs[0]}
                      pattern="\d*"
                    />
                  </div>
                  <div className="secondbox-pin">
                    <Form.Control
                      type="number"
                      value={pin[1] || ""}
                      maxLength="1"
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                      onChange={(e) => handleChange(e, 1)}
                      style={{ fontSize: "16px", textAlign: "center" }}
                      required
                      ref={inputRefs[1]}
                    />
                  </div>
                  <div className="thirdbox-pin">
                    <Form.Control
                      type="number"
                      maxLength="1"
                      value={pin[2] || ""}
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                      onChange={(e) => handleChange(e, 2)}
                      style={{ fontSize: "16px", textAlign: "center" }}
                      required
                      ref={inputRefs[2]}
                    />
                  </div>
                  <div className="fourthbox-pin">
                    <Form.Control
                      type="number"
                      maxLength="1"
                      value={pin[3] || ""}
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                      onChange={(e) => handleChange(e, 3)}
                      style={{ fontSize: "16px", textAlign: "center" }}
                      required
                      ref={inputRefs[3]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {!loadingBtn ? (
              <>
                <Button variant="outline-primary" onClick={handleAddUserToggle}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-100 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"5%"}
                    width={"5%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      marginLeft: "5px",
                    }}
                  >
                    Saving. . .
                  </span>
                </div>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal for Editing the user */}
      <Modal show={showEditUserModal} onHide={handleCloseEditUserModal}>
        <Form noValidate validated={validated} onSubmit={updateStudent}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-user-container">
              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Student #</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.studentNumber}
                      required
                      name="studentNumber"
                      class="form-control search mb-0"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="category">Category</label>
                  <div className="input-group mb-3">
                    <select
                      className="form-control search"
                      aria-label="Default select example"
                      required
                      name="category"
                      onChange={handleUpdateFormChange}
                      style={{ color: "black" }}
                      value={updateFormData.category}
                    >
                      <option value="Student">Student</option>
                      <option value="Employee">Employee</option>
                      <option value="Visitor">Visitor</option>
                      <option value="Department">Department</option>
                    </select>
                  </div>
                </div>

                {updateFormData.category === "Student" && (
                  <div className="row">
                    <div className="form-check d-flex p-0 mb-4">
                      <input
                        type="checkbox"
                        className="ms-3"
                        id="scholarCheckbox"
                        checked={updateFormData.credit}
                        name="credit"
                        onChange={handleUpdateFormChange}
                      />
                      <label
                        className="form-check-label ms-3"
                        style={{ fontSize: "15px" }}
                        htmlFor="scholarCheckbox"
                      >
                        Credits
                      </label>
                    </div>
                  </div>
                )}
                <div className="col-6">
                  <label htmlFor="">RFID #</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.rfid}
                      class="form-control search"
                      aria-label="Username"
                      name="rfid"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Validity</label>
                  <div class="input-group mb-3">
                    <input
                      type="date"
                      value={updateFormData.validity}
                      name="validity"
                      class="form-control date"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">First Name</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.firstName}
                      class="form-control search"
                      name="firstName"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Middle Name</label>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      value={updateFormData.middleName}
                      class="form-control search"
                      name="middleName"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row p-0">
                <div className="col-6">
                  <label htmlFor="">Last Name</label>
                  <div class="input-group  mb-3">
                    <input
                      type="text"
                      value={updateFormData.lastName}
                      class="form-control search"
                      name="lastName"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label htmlFor="">Contact</label>
                  <div class="input-group  mb-3">
                    <input
                      type="number"
                      value={updateFormData.contactNumber}
                      class="form-control search"
                      name="contactNumber"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                      onChange={handleUpdateFormChange}
                    />
                  </div>
                </div>
              </div>
              <div className="contact-container">
                <label htmlFor="">Email Address</label>
                <div class="input-group  mb-3">
                  <input
                    type="email"
                    value={updateFormData.email}
                    class="form-control search"
                    name="email"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    onChange={handleUpdateFormChange}
                  />
                </div>
              </div>
              <div className="contact-container">
                <label htmlFor="">Home Address</label>
                <div class="input-group  mb-3">
                  <input
                    type="text"
                    value={updateFormData.address}
                    class="form-control search"
                    name="address"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    onChange={handleUpdateFormChange}
                  />
                </div>
              </div>
              <div className="pinsection-modal">
                <div className="label-section">
                  <label htmlFor="">Customer PIN</label>
                </div>

                <div className="pin-sec">
                  <div className="firstbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[0] || ""}
                      onChange={handleUpdateFormChange}
                      data-index={0}
                      name="student_pin"
                      ref={firstPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                  <div className="secondbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[1] || ""}
                      onChange={handleUpdateFormChange}
                      name="student_pin"
                      data-index={1}
                      ref={secondPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                  <div className="thirdbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[2] || ""}
                      onChange={handleUpdateFormChange}
                      name="student_pin"
                      data-index={2}
                      ref={thirdPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                  <div className="fourthbox-pin">
                    <Form.Control
                      type="number"
                      style={{ fontSize: "16px", textAlign: "center" }}
                      value={updateFormData.student_pin[3] || ""}
                      onChange={handleUpdateFormChange}
                      name="student_pin"
                      data-index={3}
                      ref={fourthPinRef}
                      required
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/\D/, ""))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {!loadingBtn ? (
              <>
                <Button
                  variant="outline-primary"
                  onClick={handleCloseEditUserModal}
                >
                  Cancel
                </Button>

                <Button variant="primary" type="submit">
                  Save
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-100 justify-content-end p-0">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"5%"}
                    width={"5%"}
                  />
                  <span
                    style={{
                      fontSize: "2rem",
                      // marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    Updating. . .
                  </span>
                </div>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* change status modal */}
      <Modal
        size="md"
        show={showChangeStatusModal}
        onHide={handleCloseStatusModal}
        backdrop="static"
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "24px" }}>Change Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="exampleForm.ControlInput2">
            <Form.Label style={{ fontSize: "20px" }}>Status</Form.Label>
            <Form.Select
              style={{ height: "40px", fontSize: "15px" }}
              onChange={handleStatusChange}
              value={selectedStatus}
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-warning"
            onClick={handleSave}
            style={{ fontSize: "20px" }}
          >
            Save
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleCloseStatusModal}
            style={{ fontSize: "20px" }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={importModal} onHide={handleCloseImportModal}>
        <Modal.Header>
          <h2>Upload Excel File</h2>
        </Modal.Header>
        <Modal.Body className="p-2">
          {/* <input
            type="file"
            onChange={handleFileChange}
           
          /> */}

          <div className="product-upload-container">
            <div
              className="nfc-image-main-container"
              onClick={selectspecificFiles}
            >
              <div className="nfcFileinputs">
                <div className="uploading-nfc-section">
                  <img src={IconExel} style={{ height: "10rem" }} />
                  {!file ? (
                    <>
                      <span className="select h2 my-3" role="button">
                        Upload
                      </span>
                    </>
                  ) : null}

                  <input
                    name="file"
                    type="file"
                    className="file"
                    ref={fileRef}
                    onChange={handleFileChange}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  />
                  {file && (
                    <p className="file-name h2 my-3">
                      Selected file: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {!loadingBtn ? (
            <>
              <Button variant="secondary" onClick={handleCloseImportModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleBulkUser}>
                Save
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
                    // marginTop: "10px",
                    marginLeft: "5px",
                  }}
                >
                  Saving. . .
                </span>
              </div>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CustomerList;
