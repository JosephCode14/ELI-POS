import React, { useState, useEffect, useRef } from "react";
import "../styles/login.css";
// import "../styles/pos_react.css";
import posImg from "../../assets/image/posImg.jpg";
import swal from "sweetalert";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../assets/global/url";
import { Button, Modal } from "react-bootstrap";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { jwtDecode } from "jwt-decode";
import ReactLoading from "react-loading";
import useStoreUserType from "../../stores/useStoreUserType";
import dashboard_date from "../../assets/image/date.png";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePhoto, setStorePhoto] = useState("");
  const [error, setError] = useState(false); // Show the error message below password input
  const navigate = useNavigate();
  const [sendCodeEmail, setSendCodeEmail] = useState(false);

  //For Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);

  //For input field of New password creation
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //for 15 mins timer for sign in error
  // const [errorCount, setErrorCount] = useState(0);

  // Show the Code Modal when the email is entered by the user
  const [OtpSent, setOtpSent] = useState("");
  const [OtpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  let inputRef = useRef([]);
  const [validation, setValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    isLongEnough: false,
    passwordsMatch: false,
  });

  const typeSetter = useStoreUserType((state) => state.setTypeUser);
  const type = useStoreUserType((state) => state.typeUser);

  const generateRandomNumber = () => {
    // Math.random() generates a number between 0 and 1.
    // Multiplying by 900000 gives a range of 0 to 899999.
    // Adding 100000 ensures that the smallest number generated is 100000.
    return Math.floor(100000 + Math.random() * 900000);
  };

  const handleChange = (value, index) => {
    if (value.length <= 1) {
      const newPin = [...OtpInput];
      newPin[index] = value;
      setOtpInput(newPin);
      // Move focus to the next input if the current input is filled
      if (value && index < OtpInput.length - 1) {
        inputRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus back to the previous input if backspace is pressed
    if (e.key === "Backspace" && !OtpInput[index] && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  useEffect(() => {
    setValidation({
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      isLongEnough: newPassword.length >= 8,
      passwordsMatch:
        newPassword && confirmNewPassword
          ? newPassword === confirmNewPassword
          : false,
    });
  }, [newPassword, confirmNewPassword]);

  const handleForgotPassword = () => {
    if (username.trim() == "") {
      swal({
        title: `Invalid Email`,
        text: "Please input an email",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      });
      return;
    }
    swal({
      title: `Email Verification`,
      text: "is your email correct?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (approve) => {
      if (approve) {
        setSendCodeEmail(true);
        axios
          .post(BASE_URL + "/masterList/checkEmail", { username })
          .then((response) => {
            if (response.status === 200) {
              const code = generateRandomNumber();
              setOtpSent(code);
              axios
                .post(BASE_URL + "/masterList/sentOtp", {
                  code,
                  toSendEmail: username,
                })
                .then((response) => {
                  if (response.status === 200) {
                    setShowCodeModal(true);
                    setShowForgotModal(false);
                    setSendCodeEmail(false);
                  } else {
                    swal({
                      title: "Something Went Wrong",
                      text: "Please contact our support team",
                      icon: "error",
                    });
                  }
                })
                .catch((error) => {
                  swal({
                    title: "Something Went Wrong",
                    text: "Please contact our support team",
                    icon: "error",
                  }).then(() => {
                    window.location.reload();
                  });
                });
            } else if (response.status === 202) {
              swal({
                title: "Oppss!",
                text: "Email not exist",
                icon: "error",
              });
            }
          })
          .catch((error) => {
            swal({
              title: "Something Went Wrong",
              text: "Please contact our support team",
              icon: "error",
            }).then(() => {
              window.location.reload();
            });
          });
      }
    });
  };

  // Show creation of password modal after the user enter the correct code
  const handleEnterCode = () => {
    if (parseInt(OtpSent) === parseInt(OtpInput.join(""))) {
      // console.log(`OtpSents`);
      // console.log(OtpSent);
      setShowCodeModal(false);
      setShowNewPasswordModal(true);
    } else {
      // console.log(`OtpSent`);
      // console.log(OtpSent);
      swal({
        title: "Invalid OTP",
        text: "Please check the OTP sent to your email",
        icon: "error",
      });
    }
  };

  const handleConfirmPassword = () => {
    if (newPassword === "" || confirmNewPassword === "") {
      swal({
        text: "Password is required",
        icon: "error",
        button: "OK",
      });
    } else if (newPassword === confirmNewPassword) {
      axios
        .post(BASE_URL + "/masterList/setNewPass", { newPassword, username })
        .then((response) => {
          if (response.status === 200) {
            swal({
              text: "Your changes have been successfully saved!",
              icon: "success",
              button: "OK",
            }).then(() => {
              setShowNewPasswordModal(false);
              setNewPassword("");
              setConfirmNewPassword("");
              setOtpInput(["", "", "", "", "", ""]);
            });
          } else {
            swal({
              title: "Something Went Wrong",
              text: "Please contact our support team",
              icon: "error",
            });
          }
        })
        .catch((error) => {
          // console.error(error.response.data);
          swal({
            title: "Something Went Wrong",
            text: "Please contact our support team",
            icon: "error",
          }).then(() => {
            window.location.reload();
          });
        });
    } else {
      swal({
        title: "Oppss!",
        text: "Password not matched",
        icon: "error",
      });
    }
  };

  const [remainingTime, setRemainingTime] = useState(120); // 2 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000); // Update every 1 second
      return () => clearTimeout(timer);
    } else {
      // button will disabled

      setIsResendDisabled(false); // enable button
    }
  }, [remainingTime]);

  const handleResendCode = async () => {
    try {
      const code = generateRandomNumber();
      setSendCodeEmail(true);
      axios
        .post(BASE_URL + "/masterList/sentOtp", {
          code,
          toSendEmail: username,
        })
        .then((res) => {
          if (res.status === 200) {
            swal({
              title: "OTP Sent Successfully!",
              text: "Please check your email",
              icon: "success",
              button: "OK",
            }).then(() => {
              setIsResendDisabled(true); //disabled button
              setRemainingTime(120);
              setSendCodeEmail(false);
              setOtpSent(code); //pass to outside
            });
          } else {
            swal({
              title: "Something Went Wrong",
              text: "Please contact our suppport team",
              icon: "error",
              button: "OK",
            });
          }
        });
    } catch (error) {
      console.error("Email sending failed", error);
      swal({
        title: "Something Went Wrong",
        text: "Please contact our suppport team",
        icon: "error",
        button: "OK",
      });
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Token:", accessToken);

    try {
      if (accessToken) {
        if (typeof accessToken == "string") {
          var decoded = jwtDecode(accessToken);

          if (decoded.typeUser != "Kiosk") {
            navigate("/menu");
            typeSetter(decoded.typeUser);
          } else if (decoded.typeUser == "Kiosk") {
            navigate("/kiosk-main");
            typeSetter(decoded.typeUser);
            console.log("Kiosk");
          }
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    axios
      .post(BASE_URL + "/masterList/login", { username, password })
      .then((response) => {
        if (response.status === 200) {
          // console.log(response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          typeSetter(response.data.type);
          console.log("Login", response.data.type);
          navigate("/menu");
        } else if (response.status === 201) {
          // console.log(response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          typeSetter("Kiosk");
          console.log("Login", response.data.type);
          navigate("/kiosk-main");
        } else if (response.status === 202) {
          // setErrorCount(errorCount + 1);
          setError("The username or password you entered is incorrect");
        } else if (response.status === 203) {
          setError("Your account is inactive");
        } else if (response.status === 204) {
          setError("User not found");
        }
      })
      .catch((error) => {
        console.error(error.response.data);
        swal({
          title: "Something Went Wrong",
          text: "Please contact our support team",
          icon: "error",
        }).then(() => {
          window.location.reload();
        });
      });
  };

  const handleFetchProfile = async () => {
    const res = await axios.get(`${BASE_URL}/store_profile/fetchProfile`);
    setStoreName(res.data.store_name || "ELI");
    setStorePhoto(res.data.image);
  };

  useEffect(() => {
    handleFetchProfile();
  }, []);

  useEffect(() => {
    if (inputRef.current[0]) {
      inputRef.current[0].focus();
    }
  }, [showCodeModal]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const forgotPasswordVisibility = () => {
    setShowForgotPassword(!showForgotPassword);
  };
  const confirmPassVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // useEffect(() => {
  //   if (errorCount === 3) {
  //     setErrorCount(0);
  //     document.getElementById("loginSubmit").disabled = true;
  //     setTimeout(function () {
  //       document.getElementById("loginSubmit").disabled = false;
  //     }, 900000);
  //   }
  // }, [errorCount]);

  //auto insert super admin
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      const createRbac = async () => {
        try {
          const response = await axios.post(`${BASE_URL}/userRole/rbacautoadd`);
          if (response && response.status === 200) {
            console.error("Superadmin role already exists");
          } else if (response && response.status === 201) {
            console.error("Superadmin user not found");
          } else {
            console.error("Error creating rbac:", response);
          }
        } catch (error) {
          console.error("Error creating rbac:", error);
        }
      };
      createRbac();
    }
  }, []);
  return (
    <>
      <div className="login-container">
        <div className="details-container">
          <div className="details">
            <h1 className="eli-title blue">{storeName || "ELI"}</h1>
            <h1 className="title">
              <span className="blue">POINT</span>
              <span className="of">OF</span>
              <span className="sale">SALE</span>
            </h1>

            <div className="welcome-container">
              <h4>Welcome &#x1F44B;</h4>
              <p>Today is a new day. It's your day. You shape it.</p>
              <p>Sign in to start managing your projects.</p>
            </div>
            <div className="input-container">
              <form onSubmit={handleLogin}>
                <div className="email-container">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="input"
                    name="username"
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={50} // Set the character limit to 50 characters
                    required
                  />
                </div>
                <div className="pass-container">
                  <label htmlFor="email">Password</label>
                  <div className="pass-input p-0 d-flex flex-row">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input"
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={50} // Set the character limit to 50 characters
                      required
                    />
                    <span className="eye-icon">
                      {showPassword ? (
                        <EyeSlash
                          size={24}
                          color="#1a1a1a"
                          weight="light"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <Eye
                          size={24}
                          color="#1a1a1a"
                          weight="light"
                          onClick={togglePasswordVisibility}
                        />
                      )}
                    </span>
                  </div>
                </div>
                {error && <div className="error fs-5">{error}</div>}
                <button type="submit" className="btn-sign" id="loginSubmit">
                  Sign in
                </button>

                <div>
                  <p
                    className="forgot"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot Password?
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="login-img-container h-100">
          <img
            src={!storePhoto ? posImg : `data:image/png;base64,${storePhoto}`}
            alt={storePhoto ? "storephoto" : "POS"}
            className={storePhoto ? "" : "img-pos"}
          />
        </div>
      </div>

      {/* Modals For Forgot Password */}
      <Modal
        show={showForgotModal}
        onHide={() => setShowForgotModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>Forgot Password</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="body-modal">
            <p className="modal-p">
              Please Enter your email to verify your account.
            </p>
            <div className="modal-input-container">
              <p>Enter your Email Address:</p>
              <div class="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="email@gmail.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                />
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer style={{ border: "none" }}>
          <>
            {!sendCodeEmail ? (
              <>
                <Button
                  variant="outline-primary"
                  className="modal-btn"
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="modal-btn"
                  type="button"
                  onClick={handleForgotPassword}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex w-50 justify-content-end">
                  <ReactLoading
                    color="blue"
                    type={"spinningBubbles"}
                    height={"18%"}
                    width={"18%"}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      marginTop: "10px",
                      marginLeft: "5px",
                    }}
                  >
                    Sending Code...
                  </span>
                </div>
              </>
            )}
          </>
        </Modal.Footer>
      </Modal>

      {/* Modal for Entering Code */}
      <Modal
        show={showCodeModal}
        onHide={() => setShowCodeModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>OTP Verification</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="body-modal">
            <p className="modal-p">
              Please check the OTP sent to your registered email
            </p>
            <div className="modal-input-container">
              <p className="ms-0">Enter One Time Passcode (OTP)</p>
              <div className="d-flex gap-2 py-2">
                {OtpInput.map((otpCode, index) => {
                  return (
                    <input
                      key={index}
                      type="number"
                      className="form-control mx-0 border"
                      style={{ padding: "24px 16px" }}
                      value={otpCode}
                      ref={(el) => (inputRef.current[index] = el)}
                      onChange={(e) => {
                        handleChange(e.target.value, index);
                      }}
                      onKeyDown={(e) => {
                        handleKeyDown(e, index);
                      }}
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-default"
                    />
                  );
                })}
              </div>

              {isResendDisabled && (
                <div className="mb-2 time-remaining">
                  Resend OTP in: {remainingTime}
                </div>
              )}

              <>
                {!sendCodeEmail ? (
                  <div className="time-remaining">
                    <button
                      className="btn btn-secondary"
                      onClick={handleResendCode}
                      disabled={isResendDisabled}
                    >
                      Resend
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="d-flex w-50 justify-content-end">
                      <ReactLoading
                        color="blue"
                        type={"spinningBubbles"}
                        height={"18%"}
                        width={"18%"}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          marginTop: "10px",
                          marginLeft: "5px",
                        }}
                      >
                        Sending Code...
                      </span>
                    </div>
                  </>
                )}
              </>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ border: "none" }}>
          <Button
            variant="outline-primary"
            className="modal-btn"
            type="button"
            onClick={() => {
              setShowCodeModal(false);
              setIsResendDisabled(false);
              setOtpInput(["", "", "", "", "", ""]);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="modal-btn"
            type="button"
            onClick={handleEnterCode}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Creating New Password */}
      <Modal
        show={showNewPasswordModal}
        onHide={() => setShowNewPasswordModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>Create a New Password</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="body-modal">
            <p className="modal-p">
              Please set a new password to ensure your account remains
              protected.
            </p>
            <div className="modal-input-container">
              <p>New Password:</p>
              <div className="pass-input p-0 d-flex flex-row">
                <input
                  type={showForgotPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="*****"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  className="eye-icon d-flex justify-content-end"
                  style={{ width: "90px" }}
                >
                  {showForgotPassword ? (
                    <EyeSlash
                      size={24}
                      color="#1a1a1a"
                      weight="light"
                      onClick={forgotPasswordVisibility}
                    />
                  ) : (
                    <Eye
                      size={24}
                      color="#1a1a1a"
                      weight="light"
                      onClick={forgotPasswordVisibility}
                    />
                  )}
                </span>
              </div>
            </div>
            <div className="modal-input-container">
              <p>Confirm New Password:</p>
              <div class="pass-input p-0 d-flex flex-row">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="*****"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-default"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <span
                  className="eye-icon d-flex justify-content-end"
                  style={{ width: "90px" }}
                >
                  {showConfirmPassword ? (
                    <EyeSlash
                      size={24}
                      color="#1a1a1a"
                      weight="light"
                      onClick={confirmPassVisibility}
                    />
                  ) : (
                    <Eye
                      size={24}
                      color="#1a1a1a"
                      weight="light"
                      onClick={confirmPassVisibility}
                    />
                  )}
                </span>
              </div>
            </div>

            <div className="col-sm fs-5">
              <div
                style={{
                  color: validation.hasUpperCase ? "green" : "red",
                }}
              >
                {validation.hasUpperCase ? "✔ " : "✘ "} At least one uppercase
                letter
              </div>
              <div
                style={{
                  color: validation.hasLowerCase ? "green" : "red",
                }}
              >
                {validation.hasLowerCase ? "✔ " : "✘ "} At least one lowercase
                letter
              </div>
              <div
                style={{
                  color: validation.hasNumber ? "green" : "red",
                }}
              >
                {validation.hasNumber ? "✔ " : "✘ "} At least one number
              </div>
              <div
                style={{
                  color: validation.isLongEnough ? "green" : "red",
                }}
              >
                {validation.isLongEnough ? "✔ " : "✘ "} At least 8 characters
                long
              </div>
              <div
                style={{
                  color: validation.passwordsMatch ? "green" : "red",
                }}
              >
                {validation.passwordsMatch ? "✔ " : "✘ "} Passwords match
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            className="modal-btn"
            type="button"
            onClick={() => {
              setOtpInput(["", "", "", "", "", ""]);
              setShowNewPasswordModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="modal-btn"
            type="button"
            onClick={handleConfirmPassword}
            disabled={
              !(
                validation.hasUpperCase &&
                validation.hasLowerCase &&
                validation.hasNumber &&
                validation.isLongEnough &&
                validation.passwordsMatch
              )
            }
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default Login;
