import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/nfc.css";
// import "../styles/pos_react.css";
import DataTable from "react-data-table-component";
import { customStyles } from "../styles/table-style";
import rfidLogo from "../../assets/icon/rfid_logo.png";
import axios from "axios";
import BASE_URL from "../../assets/global/url";
import Form from "react-bootstrap/Form";
import IconExel from "../../assets/icon/excel-icon.png";
import swal from "sweetalert";
import studentLogo from "../../assets/icon/student.png";
import empLogo from "../../assets/icon/employee.png";
import departmentLogo from "../../assets/icon/department.png";
import visitorLogo from "../../assets/icon/visitor.png";
import allLogo from "../../assets/icon/all-agree.png";
import { jwtDecode } from "jwt-decode";
import { Modal, Button } from "react-bootstrap";
import nfc from "../../assets/icon/nfc-load.jpeg";
import noData from "../../assets/icon/no-data.png";
import NoAccess from "../../assets/image/NoAccess.png";
import {
  ArrowsLeftRight,
  Download,
  DownloadSimple,
} from "@phosphor-icons/react";
import { FourSquare } from "react-loading-indicators";
import useStoreIP from "../../stores/useStoreIP";
import useStoreDetectedDevice from "../../stores/useStoreDetectedDevice";
import ReactLoading from "react-loading";

const Nfc = ({ authrztn }) => {
  const navigate = useNavigate();
  const [userId, setuserId] = useState("");
  const [loadTransaction, setLoadTransaction] = useState([]);
  const [userListModal, setShowUserListModal] = useState(false);
  const [overAllModal, setOverAllModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(true);
  const [customerList, setCustomerList] = useState([]);
  const [studentLists, setStudentLists] = useState([]);
  const [file, setFile] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [importModal, setImportModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const fileRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const [bulkDeductModal, setBulkDeductModal] = useState(false);
  const [askTemplate, setAskTemplate] = useState("");
  const [askImport, setAskImport] = useState("");
  const [deduct, setDeduct] = useState(false);

  const { detectedDevice } = useStoreDetectedDevice();

  const [loadingBtn, setLoadingBtn] = useState(false);

  //------------------------------------ StudentBalance Render ----------------------------//

  const decodeToken = () => {
    var token = localStorage.getItem("accessToken");
    if (typeof token === "string") {
      var decoded = jwtDecode(token);
      setuserId(decoded.id);
    }
  };

  const userListColumn = [
    { name: "RFID NUMBER", selector: (row) => row.rfid },
    {
      name: "NAME",
      selector: (row) => row.name,
    },
    {
      name: "BALANCE",
      selector: (row) => row.balance,
    },
  ];

  const userData = customerList.map((data, i) => ({
    key: i,
    rfid: data.student.rfid,
    name: data.student.first_name + " " + data.student.last_name,
    balance: data.balance,
  }));

  const handleLoadStudents = () => {
    swal({
      icon: "success",
      title: "Successfully Loaded",
      text: "Regin Legaspi card has been loaded 1000 successfully!.",
    }).then(() => {
      setOverAllModal(false);
    });
  };
  // useEffect(() => {
  // axios
  // .get(BASE_URL + "/load_transaction/getLoadTransaction")
  // .then((res) => setLoadTransaction(res.data))
  // .catch((err) => console.log(err));
  // }, []);

  useEffect(() => {
    axios
      .get(BASE_URL + "/load_transaction/getLoadTransaction")
      .then((res) => {
        const sortedLoadTransaction = res.data.sort(
          (a, b) => b.load_transaction_id - a.load_transaction_id
        );
        setLoadTransaction(sortedLoadTransaction);
        console.log("Data", sortedLoadTransaction);
      })
      .catch((err) => console.log(err));
  }, []);
  //------------------------------------ End of StudentBalance Render ------------------------//
  //------------------------------------- Fetch Customer List ----------------------------------//
  const fetchCustomerList = async () => {
    try {
      const res = await axios.get(
        BASE_URL + "/load_transaction/getCustomerList"
      );
      const sortedCustomerList = res.data.sort(
        (a, b) => b.student_id - a.student_id
      );
      setCustomerList(sortedCustomerList);
    } catch (error) {
      setIsLoading(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerList();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  // useEffect(() => {
  //   axios
  //     .get(BASE_URL + "/load_transaction/getCustomerList")
  //     .then((res) => {
  //       const sortedCustomerList = res.data.sort(
  //         (a, b) => b.student_id - a.student_id
  //       );
  //       setCustomerList(sortedCustomerList);
  //     })
  //     .catch((err) => console.log(err));
  // }, []);
  //------------------------------------- End Fetch Customer List ----------------------------------//
  //----------------------------- Date Format -------------------------------------------//
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Handle undefined or null dates
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Handle invalid dates

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}-${day}-${year}`;
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const year = dateTime.getFullYear();
    const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
    const day = dateTime.getDate().toString().padStart(2, "0");
    const hours = dateTime.getHours().toString().padStart(2, "0");
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");
    const seconds = dateTime.getSeconds().toString().padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  function formatDayTime(datetime) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  }
  //----------------------------- End Date Format ------------------------------------------//

  //---------------------------------- Table -------------------------------------------//

  const columns = [
    {
      name: "STUDENT NUMBER / DEPARTMENT NAME",
      selector: (row) => row.student_balance.student.student_number,
    },
    {
      name: "TAP CARD NUMBER",
      selector: (row) => row.student_balance.student.rfid,
    },
    {
      name: "NAME",
      selector: (row) =>
        row.student_balance.student.first_name +
        " " +
        row.student_balance.student.last_name,
    },
    {
      name: "PREVIOUS BALANCE",
      selector: (row) => row.old_balance,
    },

    {
      name: "TOP UP ",
      selector: (row) => row.load_amount,
    },
    {
      name: "DEDUCT AMOUNT ",
      selector: (row) => row.deduct_amount,
    },
    {
      name: "NEW BALANCE",
      selector: (row) => row.new_balance,
    },
    // {
    //   name: "EARNED POINTS",
    //   selector: (row) => row.earnedPoints,
    // },
    {
      name: "TRANSACTION DATE",
      selector: (row) => formatDateTime(row.createdAt),
    },
  ];

  //--------------------------------------- End Table ----------------------------------------//
  //-------------------------------- Search Student details using RFID ----------------------------///
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [idNumber, setIDNumber] = useState("");
  const [validity, setValidity] = useState("");
  const [rfid, setRfid] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [studentBalanceId, setStudentBalanceId] = useState("");
  const [topUpCardNumber, setTopUpCardNumber] = useState(null);

  const handleTopUpCardChange = (val, card, type = "") => {
    const value = type == "" ? val : card;
    // const value = event.target.value;

    const valCard = card;

    setTopUpCardNumber(value);
    axios
      .get(`${BASE_URL}/load_transaction/getStudentByTopUpCard`, {
        params: {
          topUpCardNumber: value,
        },
        validateStatus: () => true,
      })
      .then((response) => {
        // const studentData = response.data;
        // setName(
        //   `${studentData.student.first_name} ${studentData.student.last_name}`
        // );
        // setBalance(studentData.balance);
        // setValidity(studentData.student.validity);
        // setStudentBalanceId(studentData.student_balance_id);

        if (response.status === 200) {
          // Response is successful, process the student data
          const studentData = response.data;
          setName(
            `${studentData.student.first_name} ${studentData.student.last_name}`
          );
          setBalance(studentData.balance);
          setValidity(studentData.student.validity);
          setStudentBalanceId(studentData.student_balance_id);
        } else if (response.status == 405) {
          swal({
            icon: "error",
            title: "This card is no longer valid!",
            text: "Please try another RFID card.",
          }).then(() => {
            setName("");
            setTopUpCardNumber("");
            setBalance("");
            setValidity("");
            setStudentBalanceId(null);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching student data:", error);
        setName("");
        setBalance("");
        setValidity("");
      });
  };

  const handleFetchStudent = () => {
    const studID = studentIDs[0];

    axios
      .get(`${BASE_URL}/load_transaction/getStudentByID`, {
        params: {
          id: studID,
        },
      })
      .then((response) => {
        const studentData = response.data;
        setTopUpCardNumber(studentData.student.rfid);
        setName(
          `${studentData.student.first_name} ${studentData.student.last_name}`
        );
        setBalance(studentData.balance);
        setValidity(studentData.student.validity);
        setStudentBalanceId(studentData.student_balance_id);
      })
      .catch((error) => {
        console.error("Error fetching student data:", error);
        setName("");
        setBalance("");
        setValidity("");
      });
  };
  //-------------------------------- End of Search Student details using RFID -----------------------------//
  //------------------------------- Top Up card --------------------------------------------//

  const [loadMultiple, setLoadMultiple] = useState(false);

  const [studentIDs, setStudentIDS] = useState([]);
  const [checkAll, setCheckAll] = useState(false);

  // Receipt

  const [isPrinterReady, setIsPrinterReady] = useState(false);
  const [printerInstance, setPrinterInstance] = useState(null);

  const ensurePrinterConnection = async () => {
    if (!printerInstance || !isPrinterReady) {
      console.log("Printer not ready, attempting to reconnect...");
      await initPrinter();
    }
  };

  const { setIP, ip } = useStoreIP(); // Ip for printer

  useEffect(() => {
    const handleFetchProfile = async () => {
      const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
      setIP(res.data.store_ip);
    };

    handleFetchProfile();
  }, []);

  const initPrinter = async () => {
    if (window.IminPrinter) {
      try {
        const printer = new window.IminPrinter(ip); //palitan ng ip address based sa ip ng printer
        console.log("Attempting to connect to printer...");
        await printer.connect();
        console.log("Successfully connected to printer");
        setPrinterInstance(printer);
        setIsPrinterReady(true);
      } catch (error) {
        console.error("Failed to connect to printer:", error);
        setIsPrinterReady(false);
      }
    } else {
      console.error("IminPrinter library not loaded");
    }
  };

  const handleGenerateReceipt = async (data, id, type, bulkData = {}) => {
    try {
      await ensurePrinterConnection();
      if (!isPrinterReady || !printerInstance) {
        console.error("Printer not ready");
        return;
      }

      const res = await axios.get(BASE_URL + `/masterList/getUser/${id}`);
      const currentDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      });

      await printerInstance.initPrinter();

      await printerInstance.setAlignment(1);
      await printerInstance.setTextSize(40);
      await printerInstance.setTextStyle(1);
      await printerInstance.printText("BUON TAVOLO");
      await printerInstance.setTextStyle(0);

      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "                                                                     "
      );

      if (type == "Multiple") {
        await printerInstance.printColumnsText(
          ["Card Number:", `${studentIDs.length} cards`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Student ID:", `${studentIDs.length} student ID`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Loaded By:", res.data.col_name],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.printColumnsText(
          ["Date & Time:", `${formatDayTime(new Date(currentDate))}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.setTextStyle(0);
        await printerInstance.setTextSize(28);
        await printerInstance.setAlignment(1);
        await printerInstance.printText(
          "----------------------------------------------------------------------"
        );

        await printerInstance.printColumnsText(
          ["Customer Name", `Subtotal`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.printColumnsText(
          [`${studentIDs.length} customer loaded`, `${topUpAmount}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.setTextStyle(0);
        await printerInstance.setTextSize(28);
        await printerInstance.setAlignment(1);
        await printerInstance.printText(
          "----------------------------------------------------------------------"
        );

        await printerInstance.printColumnsText(
          [`Total Load`, `${topUpAmount * studentIDs.length} `],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      } else if (type == "Individual") {
        await printerInstance.printColumnsText(
          ["Card Number:", `${data.student.rfid}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Student ID:", `${data.student.student_number}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Loaded By:", res.data.col_name],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.printColumnsText(
          ["Date & Time:", `${formatDayTime(new Date(currentDate))}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.setTextStyle(0);
        await printerInstance.setTextSize(28);
        await printerInstance.setAlignment(1);
        await printerInstance.printText(
          "----------------------------------------------------------------------"
        );

        await printerInstance.printColumnsText(
          ["Customer Name", `Subtotal`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.printColumnsText(
          [
            `${data.student.first_name} ${data.student.last_name}`,
            `${topUpAmount}`,
          ],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.setTextStyle(0);
        await printerInstance.setTextSize(28);
        await printerInstance.setAlignment(1);
        await printerInstance.printText(
          "----------------------------------------------------------------------"
        );

        await printerInstance.printColumnsText(
          [`Initial Balance`, `${data.balance - topUpAmount}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.printColumnsText(
          [`Load Amount`, `${topUpAmount}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );

        await printerInstance.printColumnsText(
          [`Total Balance`, `${data.balance}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      } else if (type == "Bulk") {
        await printerInstance.printColumnsText(
          ["Card Number:", `${bulkData.studentNum} cards`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Student ID:", `${bulkData.studentNum} student ID`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Loaded By:", res.data.col_name],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          ["Date & Time:", `${formatDayTime(new Date(currentDate))}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.setTextStyle(0);
        await printerInstance.setTextSize(28);
        await printerInstance.setAlignment(1);
        await printerInstance.printText(
          "----------------------------------------------------------------------"
        );
        await printerInstance.printColumnsText(
          ["Customer Name", `Total Load`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
        await printerInstance.printColumnsText(
          [`${bulkData.studentNum} customer loaded`, `${bulkData.total}`],
          [1, 1],
          [0, 2],
          [26, 26],
          576
        );
      }

      await printerInstance.setTextStyle(0);
      await printerInstance.setTextSize(28);
      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "----------------------------------------------------------------------"
      );

      await printerInstance.setAlignment(1);
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText("This document is not valid");
      await printerInstance.printText("For claim of input tax");
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText(
        "                                                                     "
      );
      await printerInstance.printText("ELI IT Solutions 2024");

      await printerInstance.printText(
        "                                                                     "
      );

      await printerInstance.printAndFeedPaper(100);
      await printerInstance.partialCut();

      console.log("Printing completed successfully");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initPrinter();

    return () => {
      if (printerInstance) {
        printerInstance.close().catch((error) => {
          console.error("Error closing printer connection:", error);
        });
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!deduct) {
      if (topUpAmount < 20) {
        swal({
          icon: "error",
          title: "Oops...",
          text: "The minimum Top-Up amount is 20 pesos",
        });
      } else {
        setLoadingBtn(true);
        if (loadMultiple) {
          axios
            .post(`${BASE_URL}/load_transaction/multiple-load`, {
              studentIDs,
              topUpAmount: topUpAmount,
              userId,
            })
            .then((res) => {
              if (detectedDevice == "Android") {
                handleGenerateReceipt([], userId, "Multiple");
              }

              // handleGenerateMultipleReceipt(userId);
              swal({
                title: "New Transaction Added",
                text: "All Cards Successfully Loaded",
                icon: "success",
                button: "OK",
              }).then(() => {
                reloadTable();
                reloadTableCustomerList();
                setLoadMultiple(false);
                setStudentIDS([]);
                setTopUpAmount("");
                setName("");
                setValidity("");
                setLoadingBtn(false);
                setTopUpCardNumber("");
              });
            });
        } else {
          axios
            .post(`${BASE_URL}/load_transaction/addTopUp`, {
              student_balance_id: studentBalanceId,
              topUpAmount: topUpAmount,
              userId,
            })
            .then((response) => {
              // handleGenerateIndividual(response.data.student, userId);
              console.log(
                "Top-up saved successfully Individual:",
                response.data
              );

              if (detectedDevice == "Android") {
                handleGenerateReceipt(
                  response.data.student,
                  userId,
                  "Individual"
                );
              }

              swal({
                title: "New Transaction Added",
                text: "The Transaction has been success",
                icon: "success",
                button: "OK",
              }).then(() => {
                reloadTable();
                reloadTableCustomerList();
                setName("");
                setBalance("");
                setValidity("");
                setTopUpAmount("");
                setLoadingBtn(false);
                setTopUpCardNumber("");
              });
            })
            .catch((error) => {
              console.error("Error saving top-up:", error);
            });
        }
      }
    } else {
      if (topUpAmount <= 0) {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Please input a value",
        });
      } else {
        if (loadMultiple) {
          axios
            .post(`${BASE_URL}/load_transaction/multiple-deduct`, {
              studentIDs,
              topUpAmount: topUpAmount,
              userId,
            })
            .then((res) => {
              if (res.status == 200) {
                swal({
                  title: "New Transaction Added",
                  text: "All Cards Successfully Deducted",
                  icon: "success",
                  button: "OK",
                }).then(() => {
                  reloadTable();
                  reloadTableCustomerList();
                  setLoadMultiple(false);
                  setStudentIDS([]);
                  setTopUpAmount("");
                  setName("");
                  setValidity("");
                  setTopUpCardNumber("");
                });
              } else if (res.status == 201) {
                swal({
                  title: "Deducted Successfully",
                  text: "Some students did not deducted",
                  icon: "success",
                  button: "OK",
                }).then(() => {
                  reloadTable();
                  reloadTableCustomerList();
                  setLoadMultiple(false);
                  setStudentIDS([]);
                  setTopUpAmount("");
                  setName("");
                  setValidity("");
                  setTopUpCardNumber("");
                });
              }
            });
        } else {
          axios
            .post(`${BASE_URL}/load_transaction/deductTopUp`, {
              student_balance_id: studentBalanceId,
              topUpAmount: topUpAmount,
              userId,
            })
            .then((response) => {
              console.log("Top-up saved successfully:", response.data);

              if (response.status == 200) {
                swal({
                  title: "New Transaction Deducted",
                  text: "The Transaction has been success",
                  icon: "success",
                  button: "OK",
                }).then(() => {
                  reloadTable();
                  reloadTableCustomerList();
                  setName("");
                  setBalance("");
                  setValidity("");
                  setTopUpAmount("");
                  setTopUpCardNumber("");
                });
              } else if (response.status == 202) {
                swal({
                  title: "Deduction is not allowed",
                  text: "More than 1 hour has passed since the last load",
                  icon: "error",
                  button: "OK",
                });
              } else if (response.status == 203) {
                swal({
                  title: "Deduction is not allowed",
                  text: "The deducted amount should not exceed the student's available balance.",
                  icon: "error",
                  button: "OK",
                });
              }
            })
            .catch((error) => {
              console.error("Error saving top-up:", error);
            });
        }
      }
    }
  };

  useEffect(() => {
    console.log("Card Number", topUpCardNumber);
  }, [topUpCardNumber]);

  //------------------------------- End Top Up card -------------------------------------------//
  //--------------------------------Reload Table---------------------------------//
  const reloadTable = () => {
    axios
      .get(BASE_URL + "/load_transaction/getLoadTransaction")
      .then((res) => {
        const sortedLoadTransaction = res.data.sort(
          (a, b) => b.load_transaction_id - a.load_transaction_id
        );
        setLoadTransaction(sortedLoadTransaction);
        console.log("Load", sortedLoadTransaction);
      })
      .catch((err) => console.log(err));
  };

  const reloadTableCustomerList = () => {
    axios
      .get(BASE_URL + "/load_transaction/getCustomerList")
      .then((res) => {
        const sortedCustomerList = res.data.sort(
          (a, b) => b.student_id - a.student_id
        );
        setCustomerList(sortedCustomerList);
      })
      .catch((err) => console.log(err));
  };
  //--------------------------------End Reload Table---------------------------------//

  const handleShowCustomerListsModal = () => {
    setShowUserListModal(true);
  };

  const handleCancelLoad = () => {
    if (studentIDs.length == 0) {
      setTopUpCardNumber("");
      setName("");
      setIDNumber("");
      setShowUserListModal(false);
      setLoadMultiple(false);
    }
    setShowUserListModal(false);
    setStudentIDS([]);
  };

  const handleConfirmLoad = async () => {
    try {
      if (studentIDs.length == 0) {
        setTopUpCardNumber("");
        setName("");
        setIDNumber("");
        setShowUserListModal(false);
        setLoadMultiple(false);
      } else if (studentIDs.length == 1) {
        handleFetchStudent();
        setShowUserListModal(false);
        setLoadMultiple(false);
      } else {
        setTopUpCardNumber(`${studentIDs.length} cards`);
        setName(`${studentIDs.length} Customers`);
        setIDNumber(`${studentIDs.length} ID Number`);
        setShowUserListModal(false);
        setLoadMultiple(true);
      }

      // setStudentIDS([]);
      // setCheckAll(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelTopUp = () => {
    setName("");
    setBalance("");
    setValidity("");
    setTopUpAmount("");
    setTopUpCardNumber("");
    setStudentIDS([]);
    setIDNumber("");
    navigate("/menu");
  };

  const handleSearcStudent = async (searchValue) => {
    try {
      const response = await axios.get(
        BASE_URL + "/load_transaction/searchStudent",
        {
          params: {
            search: searchValue,
          },
        }
      );
      setCustomerList(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChangeStudent = (e) => {
    const value = e.target.value;

    if (value.trim() == "") {
      reloadTableCustomerList();
    } else {
      handleSearcStudent(value);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() == "") {
      reloadTable();
    } else {
      handleSearch(value);
    }
  };

  const handleSearch = async (search) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/load_transaction/getSearchLoadTransac`,
        {
          params: {
            search,
          },
        }
      );
      setLoadTransaction(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const generateRandomCode = async () => {
    try {
      const randomLetters = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      const res = await axios.get(
        `${BASE_URL}/product_inventory_accumulate/get-transaction-number`
      );
      console.log(res.data);

      const referenceCode = `${year}${month}${day}${randomLetters}${res.data.transactionNum}`;
      setTransactionNumber(referenceCode);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    generateRandomCode();
    decodeToken();
  }, []);

  const handleDownloadTemplate = async () => {
    const res = await axios.get(`${BASE_URL}/load_transaction/template`, {
      params: {
        category: selectedTemplate,
      },
    });

    let exportData;
    const arrData = res.data;

    let bulkOperation =
      askTemplate == "Bulk Load" ? "TOP UP AMOUNT" : "DEDUCT AMOUNT";

    if (selectedTemplate == "all") {
      exportData = arrData.map((student) => ({
        "STUDENT NUMBER/DEPARTMENT NAME": student.student_number,
        "FIRST NAME": student.first_name,
        "LAST NAME": student.last_name,
        "RFID NUMBER": student.rfid,
        [bulkOperation]: 0,
        CATEGORY: student.category,
      }));
    } else if (selectedTemplate == "Student") {
      exportData = arrData.map((student) => ({
        "STUDENT NUMBER": student.student_number,
        "FIRST NAME": student.first_name,
        "LAST NAME": student.last_name,
        "RFID NUMBER": student.rfid,
        [bulkOperation]: 0,
        CATEGORY: student.category,
      }));
    } else if (
      selectedTemplate == "Visitor" ||
      selectedTemplate == "Department" ||
      selectedTemplate == "Employee"
    ) {
      exportData = arrData.map((student) => ({
        "DEPARTMENT NAME": student.student_number,
        "FIRST NAME": student.first_name,
        "LAST NAME": student.last_name,
        "RFID NUMBER": student.rfid,
        [bulkOperation]: 0,
        CATEGORY: student.category,
      }));
    }

    if (!exportData || exportData.length === 0) {
      swal({
        title: `No Data Found for ${selectedTemplate}`,
        text: `There is no available data to export for ${selectedTemplate}`,
        icon: "error",
        button: "OK",
      });
      return;
    }

    setTemplateModal(false);
    setSelectedTemplate("");

    const csv = [
      Object.keys(exportData[0]).join(","), // Header row
      ...exportData.map((item) => Object.values(item).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${selectedTemplate}_${bulkOperation}.csv`;
    link.click();
    //for getting logs ng user na nagclick ng download template
    axios.post(`${BASE_URL}/load_transaction/downloadTemplate`, {
      userId,
    });
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

  const handleUploadBulk = async () => {
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
      formData.append("transactionNumber", transactionNumber);
      formData.append("userId", userId);

      setLoadingBtn(true);
      const res = await axios.post(
        `${BASE_URL}/load_transaction/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status == 200) {
        console.log(res.data);
        if (detectedDevice == "Android") {
          handleGenerateReceipt([], userId, "Bulk", res.data);
        }

        swal({
          title: "Bulk Load Successfully!",
          text: "All data in the file was successfully loaded",
          icon: "success",
          button: "OK",
        }).then(() => {
          handleCloseImportModal();
          reloadTable();
          setLoadingBtn(false);
        });
      }
      if (res.status == 202) {
        swal({
          title: "Invalid Format",
          text: "Please use the given template",
          icon: "error",
          button: "OK",
        }).then(() => {
          setImportModal(false);
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadImport = () => {
    if (askImport == "Load") {
      handleUploadBulk();
    } else {
      handleUploadBulkDeduct();
    }
  };

  const handleUploadBulkDeduct = async () => {
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
      formData.append("transactionNumber", transactionNumber);
      formData.append("userId", userId);
      setLoadingBtn(true);
      const res = await axios.post(
        `${BASE_URL}/load_transaction/deduct`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status == 200) {
        swal({
          title: "Bulk Deduct Successfully!",
          text: "All data in the file was successfully deducted",
          icon: "success",
          button: "OK",
        }).then(() => {
          handleCloseBulkModal();
          handleCloseImportModal();
          reloadTable();
          setLoadingBtn(false);
        });
      }
      if (res.status == 201) {
        swal({
          title: "You can only deduct in the first one hour!",
          icon: "error",
          button: "OK",
        }).then(() => {
          handleCloseBulkModal();
          handleCloseImportModal();
          reloadTable();
          setLoadingBtn(false);
        });
      }
      if (res.status == 202) {
        swal({
          title: "Invalid Format",
          text: "Please use the given template",
          icon: "error",
          button: "OK",
        }).then(() => {
          setImportModal(false);
          handleCloseBulkModal();
          handleCloseImportModal();
          setLoadingBtn(false);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxChange = (student_id) => {
    setStudentIDS((prevSelectedID) => {
      if (prevSelectedID.includes(student_id)) {
        return prevSelectedID.filter((ID) => ID !== student_id);
      } else {
        return [...prevSelectedID, student_id];
      }
    });
  };

  const handleCheckAllChange = () => {
    if (checkAll) {
      setStudentIDS([]);
    } else {
      const allStudentIDs = customerList.map((c) => c.student.student_id);
      setStudentIDS(allStudentIDs);
    }
    setCheckAll(!checkAll);
  };

  const allChecked = customerList.every((c) =>
    studentIDs.includes(c.student.student_id)
  );

  const studentColumns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleCheckAllChange}
          checked={allChecked}
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange(row.student_id)}
          checked={studentIDs.includes(row.student_id)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "RFID",
      selector: (row) => row.student.rfid,
    },
    {
      name: "STUDENT ID",
      selector: (row) => row.student.student_number,
    },
    {
      name: "NAME",
      selector: (row) => row.student.first_name + " " + row.student.last_name,
    },
    {
      name: "BALANCE",
      selector: (row) => row.balance,
    },
  ];

  function selectspecificFiles() {
    fileRef.current.click();
  }

  const handleCloseImportModal = () => {
    setImportModal(false);
    setFile("");
  };

  const handleCloseBulkModal = () => {
    setBulkDeductModal(false);
    setFile("");
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAskTemplate = () => {
    swal({
      title: `Select Bulk Operation Template`,
      buttons: {
        excel: {
          text: "Bulk Load Template",
          value: "Bulk Load",
          className: "--excel",
        },
        pdf: {
          text: "Bulk Deduct Template",
          value: "Bulk Deduct",
          className: "--pdf",
        },
      },
    }).then((value) => {
      if (value === "Bulk Deduct") {
        setAskTemplate("Deduct");
        setTemplateModal(true);
      } else if (value == "Bulk Load") {
        setAskTemplate("Bulk Load");
        setTemplateModal(true);
      }
    });
  };

  const handleAskImport = () => {
    swal({
      title: `Select Bulk Operation `,
      buttons: {
        excel: {
          text: "Bulk Load",
          value: "Bulk Load",
          className: "--excel",
        },
        pdf: {
          text: "Bulk Deduct",
          value: "Bulk Deduct",
          className: "--pdf",
        },
      },
    }).then((value) => {
      if (value === "Bulk Deduct") {
        setAskImport("Deduct");
        setImportModal(true);
      } else if (value == "Bulk Load") {
        setAskImport("Load");
        setImportModal(true);
      }
    });
  };

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

      const handleReadingError = () => {
        log("Argh! Cannot read data from the NFC tag. Try another one?");
      };

      const handleReading = ({ message, serialNumber }) => {
        log(`> Serial Number: ${serialNumber}`);
        log(`> Records: (${message.records.length})`);

        setSerial(serialNumber);

        const cleanedSerial = serialNumber.replace(/:/g, "");
        const decimalValue = parseInt(cleanedSerial, 16);

        console.log(decimalValue.toString());

        setTopUpCardNumber(decimalValue);
        handleTopUpCardChange("", decimalValue, "scan");
      };

      ndef.addEventListener("readingerror", handleReadingError);
      ndef.addEventListener("reading", handleReading);

      return () => {
        ndef.removeEventListener("readingerror", handleReadingError);
        ndef.removeEventListener("reading", handleReading);
      };
    } catch (error) {
      log("Argh! " + error);
      console.log(error);
    }
  };

  useEffect(() => {
    let cleanupScan;

    // Start NFC scan asynchronously
    const startScan = async () => {
      cleanupScan = await handleScan();
    };

    startScan();

    return () => {
      if (cleanupScan) {
        cleanupScan();
      }
    };
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center flex-column vh-100 align-items-center">
          <FourSquare
            color="#6290FE"
            size="large"
            text="Loading Data..."
            textColor=""
          />
        </div>
      ) : authrztn.includes("RFID-View") ? (
        <div className="nfc-container">
          <div
            className="nfc-lists-container"
            style={{
              width:
                authrztn.includes("RFID-View") && !authrztn.includes("RFID-Add")
                  ? "100%"
                  : "60%",
            }}
          >
            <div className="nfc-title-container">
              <div className="nfc-title">
                <Link to={"/menu"}>
                  <i className="bx bx-chevron-left pt-1"></i>
                </Link>

                <h2>Top up Transaction</h2>
              </div>
              <div className="nfc-search-contain">
                <div className="nfc-search-container">
                  <input
                    type="text"
                    className="form-control search m-0"
                    placeholder="Search Student Name"
                    aria-describedby="addon-wrapping"
                    onChange={handleSearchChange}
                    value={searchQuery}
                  />
                  <button onClick={handleShowCustomerListsModal}>
                    Customers
                  </button>
                </div>

                <div className="download-container ms-3">
                  {authrztn?.includes("RFID-IE") && (
                    <button
                      type="button"
                      // onClick={() => setTemplateModal(true)}
                      className="text-nowrap"
                      onClick={handleAskTemplate}
                    >
                      <DownloadSimple
                        size={16}
                        className="mb-1 d-inline-block d-xxl-none"
                      />{" "}
                      <span className="d-none d-xxl-inline-block">
                        Download
                      </span>{" "}
                      Template
                    </button>
                  )}
                  {/* <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                /> */}
                  {authrztn?.includes("RFID-IE") && (
                    <>
                      <button type="button" onClick={handleAskImport}>
                        Import
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="table">
              {loadTransaction.length == 0 ? (
                <>
                  <div className="no-data-table">
                    <table>
                      <thead>
                        <th>ID</th>
                        <th>TAP CARD NUMBER</th>
                        <th>NAME</th>
                        <th>PREVIOUS BALANCE</th>
                        <th>TOP UP</th>
                        <th>NEW BALANCE</th>
                        <th>TRANSACTION DATE</th>
                      </thead>
                      <tbody className="inr-no-data">
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
                  <div className="w-data-table">
                    <DataTable
                      columns={columns}
                      data={loadTransaction}
                      customStyles={customStyles}
                      pagination
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          {authrztn?.includes("RFID-Add") && (
            <div className="nfc-load-container">
              <div className="rfid-logo-container">
                <h3>Please Tap the card</h3>
                <img src={rfidLogo} className="rfid-logo" />
                <h2 className="my-rfid">My RFID</h2>
              </div>
              <Form onSubmit={handleSubmit}>
                <div className="load-input-container px-4">
                  <div className="nfc-sort-container top-input">
                    {/* <div className="nfc-f-sort">
                  <h3>Custom Category</h3>
                  <select
                    className="form-select m-0"
                    aria-label="Default select example"
                  >
                    <option disabled>All Category</option>
                    <option value="Student">Student</option>
                    <option value="Employee">Employee</option>
                    <option value="Visitor">Visitor</option>
                    <option value="Department">Department</option>
                  </select>
                </div> */}

                    {/* <div className="nfc-f-sort">
                  <h3>ID Number</h3>
                  <input
                    type="text"
                    className="form-control m-0"
                    value={idNumber}
                  />
                </div> */}
                  </div>
                  <div className="top-input">
                    <h3>Top Up Card #</h3>
                    <input
                      type="text"
                      value={topUpCardNumber}
                      onChange={(e) =>
                        handleTopUpCardChange(e.target.value, "", "")
                      }
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div className="top-input">
                    <h3>Name</h3>
                    <input
                      type="text"
                      value={name}
                      readOnly
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div className="top-input">
                    <div className="nfc-valid d-flex p-0 align-items-center justify-content-between">
                      <h3>Valid Until</h3>
                      <label className="switch">
                        <input
                          type="checkbox"
                          onChange={handleToggle}
                          disabled={loadMultiple}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={isOpen ? formatDate(validity) : ""}
                      readOnly
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                    />
                  </div>
                  <div className="top-input">
                    {/* <h3>Balance</h3>
                <input
                  type="number"
                  value={balance}
                  readOnly
                  className="form-control search m-0"
                  aria-describedby="addon-wrapping"
                /> */}
                  </div>
                  <div className="top-input">
                    <div className="nfc-valid d-flex p-0 align-items-center">
                      <h3>{!deduct ? "Top Up" : "Deduct"}</h3>

                      <ArrowsLeftRight
                        size={25}
                        className="mb-3 ms-3"
                        onClick={() => setDeduct(!deduct)}
                      />
                    </div>
                    <input
                      type="number"
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      value={topUpAmount}
                      className="form-control search m-0"
                      aria-describedby="addon-wrapping"
                      onKeyDown={(e) => {
                        ["e", "E", "-", "+", "."].includes(e.key) &&
                          e.preventDefault();
                      }}
                    />
                    {/* <label htmlFor="" className="text-danger">
                  Minimum top up is 50
                </label> */}
                  </div>
                  <div className="nfc-button-container d-flex p-0">
                    {!loadingBtn ? (
                      <>
                        <button
                          type="button"
                          className="load-c-button load-btn"
                          onClick={handleCancelTopUp}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="load-l-button load-btn nfc-load"
                          disabled={name.length == 0}
                        >
                          {!deduct ? "Load" : "Deduct"}
                        </button>
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
                            Loading. . .
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Form>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
            marginTop: "10%",
          }}
        >
          <img src={NoAccess} alt="NoAccess" className="no-access-img" />
          <h3>You don't have access to this function.</h3>
        </div>
      )}

      <Modal show={userListModal} onHide={handleCancelLoad} size="xl">
        <Modal.Header>
          <Modal.Title>
            <h2>CUSTOMER LISTS</h2>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3">
          <div className="modal-category upload align-items-center pb-1 m-2">
            <input
              type="text"
              className="form-control search mb-4"
              placeholder="Search Student Name"
              aria-describedby="addon-wrapping"
              onChange={handleSearchChangeStudent}
            />

            <div className="table">
              <DataTable
                columns={studentColumns}
                data={customerList}
                customStyles={customStyles}
                pagination
                onRowClicked={(row) => handleCheckboxChange(row.student_id)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            // onClick={() => setShowUserListModal(false)}
            onClick={handleCancelLoad}
          >
            Cancel
          </Button>

          {authrztn?.includes("RFID-Add") && (
            <>
              <Button
                variant="primary"
                type="submit"
                onClick={handleConfirmLoad}
              >
                Confirm
              </Button>
            </>
          )}
        </Modal.Footer>
        {/* <Form noValidate onSubmit={handleConfirmLoad}></Form> */}
      </Modal>

      <Modal show={overAllModal} onHide={() => setOverAllModal(false)}>
        <Modal.Body className="p-2">
          <div className="modal-nfc">
            <div className="nfc-head-container d-flex">
              <img src={nfc} />

              <div className="nfc-details">
                <h3>RFID #: 130 Cards</h3>
                <h3>Name: 130 Students</h3>
                <h3>
                  Reload: <span className="nfc-reload">₱2000</span>
                </h3>
              </div>
            </div>
            <hr />
            <h2>Reload this card?</h2>
            <h3 className="mt-3">Are you sure you want to load this card?</h3>
          </div>
          <div className="nfc-btn-container">
            <button
              className="nfc-cc-btn nfc-btn"
              onClick={() => setOverAllModal(false)}
            >
              Cancel
            </button>
            <button className="nfc-cf-btn nfc-btn" onClick={handleLoadStudents}>
              Confirm
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Download Template */}
      <Modal
        show={templateModal}
        onHide={() => setTemplateModal(false)}
        size="xl"
      >
        <Modal.Header>
          <h2>Select Template File for {askTemplate}</h2>
        </Modal.Header>
        <Modal.Body className="p-2">
          <div className="card-template-cont justify-content-evenly flex-wrap my-5">
            <div
              className={`card card-template ${
                selectedTemplate == "Student" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Student")}
            >
              <div className={`card-body card-temp-body`}>
                <img src={studentLogo} />
                <h2 className="">Student </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate === "Department" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Department")}
            >
              <div className="card-body card-temp-body">
                <img src={departmentLogo} />
                <h2 className="">Department </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate == "Visitor" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Visitor")}
            >
              <div className="card-body card-temp-body">
                <img src={visitorLogo} />
                <h2 className="">Visitor </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate == "Employee" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("Employee")}
            >
              <div className={`card-body card-temp-body`}>
                <img src={empLogo} />
                <h2 className="">Employee </h2>
              </div>
            </div>
            <div
              className={`card card-template ${
                selectedTemplate == "all" ? "selected-temp" : ""
              }`}
              onClick={() => setSelectedTemplate("all")}
            >
              <div className="card-body card-temp-body">
                <img src={allLogo} />
                <h2 className="">All </h2>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setTemplateModal(false);
              setSelectedTemplate("");
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDownloadTemplate}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Modal */}

      <Modal show={importModal} onHide={handleCloseImportModal}>
        <Modal.Header>
          <h2>Upload Excel File: Bulk Load</h2>
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
          <Button variant="secondary" onClick={handleCloseImportModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUploadBulk}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={importModal} onHide={handleCloseImportModal}>
        <Modal.Header>
          <h2>
            Upload Excel File:
            {askImport == "Load" ? "Bulk Load" : "Bulk Deduct"}
          </h2>
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
              <Button variant="primary" onClick={handleUploadImport}>
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
                    marginTop: "10px",
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
};

export default Nfc;
