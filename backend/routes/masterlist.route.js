const router = require("express").Router();
const { where, Op, col, fn, ValidationError } = require("sequelize");
const nodemailer = require("nodemailer");

const emailConfig = require("../db/config/email_config");
//master Model
// const MasterList = require('../db/models/masterlist.model')
const {
  MasterList,
  Activity_Log,
  UserRole,
  Cart,
  Student_Balance,
  Product_Inventory,
  Void_Transaction,
  Order_Transaction,
} = require("../db/models/associations");
const session = require("express-session");
const jwt = require("jsonwebtoken");

router.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

router.route("/checkEmail").post(async (req, res) => {
  const { username } = req.body;

  const user = await MasterList.findOne({
    where: {
      col_email: username,
    },
  });

  if (user) {
    return res.status(200).json();
  } else {
    return res.status(202).json();
  }
});

router.route("/sentOtp").post(async (req, res) => {
  const { code, toSendEmail } = req.body;

  const email = emailConfig.email;
  const password = emailConfig.password;

  // console.log(emailConfig);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

  const mailOptions = {
    from: email,
    to: toSendEmail,
    subject: `Verification Code`,
    text: `Your OTP code is ${code}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
      res.status(500).send({ message: "Failed to send email", error });
    } else {
      console.log("Email Sent:", info.response);
      res.status(200).send({ message: "Email sent successfully", info });
    }
  });
});

router.route("/setNewPass").post(async (req, res) => {
  const { newPassword, username } = req.body;

  const isUpdate = await MasterList.update(
    {
      col_Pass: newPassword,
    },
    {
      where: {
        col_email: username,
      },
    }
  );

  if (isUpdate) {
    return res.status(200).json();
  } else {
    return res.status(500).json();
  }
});

router.route("/login").post(async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await MasterList.findOne({
      where: {
        col_email: username,
      },
    });

    if (!user) {
      return res.status(204).json({ message: "User not registered" });
    } else if (user.col_status !== "Active") {
      return res.status(203).json({ message: "User is inactive" });
    } else if (user && user.col_Pass === password) {
      const userData = {
        username: user.col_username,
        id: user.col_id,
        Fname: user.col_name,
        typeUser: user.user_type,
      };
      const accessToken = jwt.sign(userData, process.env.ACCESS_SECRET_TOKEN);
      res.cookie("access-token", accessToken, {});

      await Activity_Log.create({
        masterlist_id: userData.id,
        action_taken: `${userData.Fname} logged into the system`,
      });
      if (user.user_type === "Kiosk") {
        return res.status(201).json({
          message: "Login Success",
          accessToken: accessToken,
          type: user.user_type,
        });
      } else {
        return res.status(200).json({
          message: "Login Success",
          accessToken: accessToken,
          type: user.user_type,
        });
      }
    } else {
      return res.status(202).json({ message: "Incorrect Credentials" });
    }
    // const user = await MasterList.findOne({
    //   where: {
    //     col_email: username,
    //   },
    // });

    // if (user && user.col_Pass === password) {
    //   const userData = {
    //     username: user.col_username,
    //     id: user.col_id,
    //     Fname: user.col_name,
    //   };
    //   const accessToken = jwt.sign(userData, process.env.ACCESS_SECRET_TOKEN);
    //   res.cookie("access-token", accessToken, {});
    //   return res
    //     .status(200)
    //     .json({ message: "Login Success", accessToken: accessToken });
    // } else {
    //   return res.status(202).json({ message: "Incorrect credentials" });
    // }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.route("/logout").post(async (req, res) => {
  const { userId, userName } = req.body;

  await Activity_Log.create({
    masterlist_id: userId,
    action_taken: `${userName} logged out of the system`,
  });

  try {
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// FOR USER MASTERLIST MODULE
router.route("/masterTable").get(async (req, res) => {
  try {
    const data = await MasterList.findAll({
      include: {
        model: UserRole,
        required: false,
      },
      order: [["createdAt", "DESC"]],
      where: {
        user_type: { [Op.ne]: "Superadmin" },
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//for supervisor dropdown
router.route("/supervisor").get(async (req, res) => {
  try {
    const data = await MasterList.findAll({
      include: {
        model: UserRole,
        required: false,
      },
      order: [["createdAt", "DESC"]],
      where: {
        user_type: {
          [Op.notIn]: ["Superadmin", "Cashier", "Admin", "Kiosk"], // Exclude Superadmin and Cashier
        },
        col_status: {
          [Op.ne]: "Archive",
        },
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//for fetching in input field the specific user
router.route("/getUser/:col_id").get(async (req, res) => {
  try {
    const { col_id } = req.params;
    const data = await MasterList.findOne({
      include: [
        {
          model: UserRole,
          required: false,
        },
        {
          model: MasterList,
          as: "supervisor",
          attributes: ["col_id", "col_name"],
          required: false,
        },
      ],
      where: {
        col_id: col_id,
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// CREATE
router.route("/createMaster").post(async (req, res) => {
  try {
    const {
      userType,
      userRole,
      userFullname,
      userEmail,
      userAddress,
      userContactNumber,
      username,
      userPIN,
      userPassword,
      userId,
      userSupervisor,
      userRFID,
    } = req.body;

    const existingEmailUser = await MasterList.findOne({
      where: {
        col_email: userEmail,
      },
    });

    // Check if the userRFID exists
    const existingRFIDUser = await MasterList.findOne({
      where: {
        rfid: userRFID,
      },
    });

    let existingPINSupervisor;
    if (userType == "Supervisor") {
      existingPINSupervisor = await MasterList.findOne({
        where: {
          user_pin: userPIN,
        },
      });
    }

    if (existingPINSupervisor) {
      console.log("SUPERVISOR EXISTS");
      return res.status(205).send("Same PIN for Supervisor");
    }

    if (existingEmailUser && !existingRFIDUser) {
      res.status(201).send("UserEmail exists");
    } else if (!existingEmailUser && existingRFIDUser) {
      res.status(203).send("RFID exists");
    } else if (existingEmailUser && existingRFIDUser) {
      res.status(204).send("Both UserEmail and UserRFID exist.");
    } else {
      const newUser = await MasterList.create({
        col_roleID: userRole || null,
        col_name: userFullname || null,
        col_address: userAddress || null,
        col_username: username || null,
        col_phone: userContactNumber || null,
        col_email: userEmail,
        col_Pass: userPassword,
        user_type: userType,
        user_pin: userPIN || null,
        col_status: "Active",
        supervisor_id: userSupervisor || null,
        rfid: userRFID.trim() || null,
      });

      if (newUser) {
        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `User: Create a new user named ${userFullname}`,
        });

        if (act_log) {
          res.status(200).json(newUser);
        }
      }
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(err);
      res
        .status(202)
        .json({ message: "Validation error", details: err.errors });
    } else {
      console.error(err);
      res.status(500).send("An error occurred");
    }
  }
});

router.route("/updateMaster").put(async (req, res) => {
  try {
    const {
      userType,
      userRole,
      userFullname,
      userEmail,
      userAddress,
      userContactNumber,
      username,
      userPIN,
      userPassword,
      userSupervisor,
      usermasterId,
      userId,
      userRFID,
    } = req.body;

    const existingEmailUser = await MasterList.findOne({
      where: {
        col_email: userEmail,
        col_id: { [Op.ne]: usermasterId },
      },
    });

    // Check if the userRFID exists
    const existingRFIDUser = await MasterList.findOne({
      where: {
        rfid: userRFID,
        col_id: { [Op.ne]: usermasterId },
      },
    });

    let existingPINSupervisor;
    if (userType == "Supervisor") {
      existingPINSupervisor = await MasterList.findOne({
        where: {
          user_pin: userPIN,
          col_id: { [Op.ne]: usermasterId },
        },
      });
    }

    if (existingPINSupervisor) {
      console.log("SUPERVISOR EXISTS");
      return res.status(205).send("Same PIN for Supervisor");
    }

    if (existingEmailUser && !existingRFIDUser) {
      res.status(201).send("UserEmail exists");
    } else if (!existingEmailUser && existingRFIDUser) {
      res.status(203).send("RFID exists");
    } else if (existingEmailUser && existingRFIDUser) {
      res.status(204).send("Both UserEmail and UserRFID exist.");
    } else {
      const getData = await MasterList.findOne({
        include: [
          {
            model: UserRole,
            required: false,
          },
        ],
        where: {
          col_id: usermasterId,
        },
      });

      const isCreated = await MasterList.update(
        {
          col_roleID: userRole === "" ? null : userRole,
          col_name: userFullname,
          col_address: userAddress,
          col_username: username,
          col_phone: userContactNumber,
          col_email: userEmail,
          col_Pass: userPassword,
          user_type: userType,
          user_pin: userPIN,
          supervisor_id: userSupervisor === "" ? null : userSupervisor,
          rfid: userRFID.trim() || null,
        },
        {
          where: {
            col_id: usermasterId,
          },
        }
      );
      if (isCreated) {
        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `User: Updated information to: \n      
        '${
          getData.userRole ? getData.userRole.col_rolename : "Kiosk Data"
        }' to '${userRole}',
        '${getData.col_name}' to '${userFullname}',
        '${getData.col_address}' to '${userAddress}',
        '${getData.col_username}' to '${username}',
        '${getData.col_phone}' to '${userContactNumber}',
        '${getData.col_email}' to '${userEmail}',
        '${getData.user_type}' to '${userType}',
        '${getData.user_pin}' to '${userPIN}',`,
        });

        if (act_log) {
          return res.status(200).json();
        }
      }
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(err);
      res
        .status(202)
        .json({ message: "Validation error", details: err.errors });
    } else {
      console.error(err);
      res.status(500).send("An error occurred");
    }
  }
});

//status updating
router.route("/statusupdate").put(async (req, res) => {
  try {
    const { masterlistIds, status } = req.body;

    const updateData = { col_status: status };

    if (status === "Archive") {
      updateData.archive_date = new Date();
    }
    for (const mastersId of masterlistIds) {
      const productdata = await MasterList.findOne({
        where: { col_id: mastersId },
      });

      const updateStatus = await MasterList.update(updateData, {
        where: { col_id: mastersId },
      });
    }

    res.status(200).json({ message: "Products updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Check user PIN for void
router.route("/checkpin").post(async (req, res) => {
  try {
    const {
      userId,
      checkoutId,
      selectedReason,
      paymentMethod,
      studentId,
      receivedAmount,
      userPin,
    } = req.body;

    const checkUserPin = await MasterList.findOne({
      where: {
        user_pin: userPin,
      },
    });

    if (checkUserPin) {
      const { user_type } = checkUserPin;
      const supervisorId = checkUserPin.col_id;

      if (user_type === "Cashier") {
        res.status(202).json({ message: "You are not a supervisor or admin" });
      } else if (user_type === "Kiosk") {
        res.status(202).json({ message: "You are not a supervisor or admin" });
      } else if (
        user_type === "Supervisor" ||
        user_type === "Admin" ||
        user_type === "Superadmin"
      ) {
        const findCart = await Cart.findAll({
          include: [
            {
              model: Order_Transaction,
              required: true,
            },
          ],
          where: {
            order_transaction_id: checkoutId,
          },
        });
        const cartQuantities = findCart.map(
          (orderedCart) => orderedCart.quantity
        );
        const prodInvId = findCart.map(
          (orderedCart) => orderedCart.product_inventory_id
        );
        const cartIds = findCart.map(
          (orderedCart) => orderedCart.transaction_id
        );

        const findInventory = await Product_Inventory.findAll({
          where: {
            product_inventory_id: {
              [Op.in]: prodInvId,
            },
          },
        });

        if (paymentMethod === "CARD") {
          const findcustomerBalance = await Student_Balance.findOne({
            where: {
              student_id: studentId,
            },
          });

          const currentBalance = Number(findcustomerBalance.balance);
          const amountReceived = Number(receivedAmount);

          if (selectedReason === "Refund-OutofStock") {
            const findTransactionData = await Order_Transaction.findOne({
              where: {
                order_transaction_id: checkoutId,
              },
            });

            if (findTransactionData) {
              await findTransactionData.update({
                status: "Void",
              });
            }

            findcustomerBalance.balance = currentBalance + amountReceived;

            // Save the updated balance
            await findcustomerBalance.save();

            await Void_Transaction.create({
              reason: selectedReason,
              order_transaction_id: checkoutId,
              masterlist_id: userId,
              supervisor_id: supervisorId,
            });
          } else if (selectedReason === "Refund-Others") {
            const findTransactionData = await Order_Transaction.findOne({
              where: {
                order_transaction_id: checkoutId,
              },
            });

            if (findTransactionData) {
              await findTransactionData.update({
                status: "Void",
              });
            }

            findcustomerBalance.balance = currentBalance + amountReceived;

            // Save the updated balance
            await findcustomerBalance.save();

            findInventory.forEach((inventory, index) => {
              const newQuantity = inventory.quantity + cartQuantities[index];
              inventory.update({ quantity: newQuantity });
            });

            await Void_Transaction.create({
              reason: selectedReason,
              order_transaction_id: checkoutId,
              masterlist_id: userId,
              supervisor_id: supervisorId,
            });
          } else if (selectedReason === "WrongItem") {
            const findTransactionData = await Order_Transaction.findOne({
              where: {
                order_transaction_id: checkoutId,
              },
            });

            if (findTransactionData) {
              await findTransactionData.update({
                status: "Void",
              });
            }

            findcustomerBalance.balance = currentBalance + amountReceived;

            // Save the updated balance
            await findcustomerBalance.save();

            findInventory.forEach((inventory, index) => {
              const newQuantity = inventory.quantity + cartQuantities[index];
              inventory.update({ quantity: newQuantity });
            });

            await Void_Transaction.create({
              reason: selectedReason,
              order_transaction_id: checkoutId,
              masterlist_id: userId,
              supervisor_id: supervisorId,
            });
          }
        } else {
          //if CASH or Other payment

          if (selectedReason === "Refund-OutofStock") {
            const findTransactionData = await Order_Transaction.findOne({
              where: {
                order_transaction_id: checkoutId,
              },
            });

            if (findTransactionData) {
              await findTransactionData.update({
                status: "Void",
              });
            }

            await Void_Transaction.create({
              reason: selectedReason,
              order_transaction_id: checkoutId,
              masterlist_id: userId,
              supervisor_id: supervisorId,
            });
          } else if (selectedReason === "Refund-Others") {
            const findTransactionData = await Order_Transaction.findOne({
              where: {
                order_transaction_id: checkoutId,
              },
            });

            if (findTransactionData) {
              await findTransactionData.update({
                status: "Void",
              });
            }

            findInventory.forEach((inventory, index) => {
              const newQuantity = inventory.quantity + cartQuantities[index];
              inventory.update({ quantity: newQuantity });
            });

            await Void_Transaction.create({
              reason: selectedReason,
              order_transaction_id: checkoutId,
              masterlist_id: userId,
              supervisor_id: supervisorId,
            });
          } else if (selectedReason === "WrongItem") {
            const findTransactionData = await Order_Transaction.findOne({
              where: {
                order_transaction_id: checkoutId,
              },
            });

            if (findTransactionData) {
              await findTransactionData.update({
                status: "Void",
              });
            }

            findInventory.forEach((inventory, index) => {
              const newQuantity = inventory.quantity + cartQuantities[index];
              inventory.update({ quantity: newQuantity });
            });

            await Void_Transaction.create({
              reason: selectedReason,
              order_transaction_id: checkoutId,
              masterlist_id: userId,
              supervisor_id: supervisorId,
            });
          }
        }
        res.status(200).json({ data: checkUserPin });
      } else {
        res.status(203).json({ message: "Invalid user type" });
      }
    } else {
      res.status(201).json({ message: "No Employee found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/checkCashierPin").post(async (req, res) => {
  try {
    const { userId, pin } = req.body;
    const CheckUser = await MasterList.findOne({
      where: {
        col_id: userId,
      },
    });

    if (CheckUser) {
      const cashierPIN = CheckUser.user_pin;

      if (pin !== cashierPIN) {
        res.status(201).json({ message: "Wrong PIN" });
      } else if (pin === cashierPIN) {
        res.status(200).json({ message: "Correct PIN with balance" });
      }
    } else {
      res.status(202).json({ message: "No user found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
