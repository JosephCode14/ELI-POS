const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
// const UserRole = require('../db/models/userRole.model')
const {
  MasterList,
  UserRole,
  Activity_Log,
} = require("../db/models/associations");
const session = require("express-session");

router.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

router.route("/createRbac").post(async (req, res) => {
  const { name, desc, checkedItems, userId } = req.body;

  try {
    const isExit = await UserRole.findOne({
      where: { col_rolename: name },
    });

    if (isExit) {
      return res.status(202).send("Exist");
    } else {
      // Concatenate the authorization values with commas
      const concatenatedAuthorization = checkedItems
        .map((item) => item.id)
        .join(", ");

      const createdRole = await UserRole.create({
        col_rolename: name,
        col_desc: desc,
        col_authorization: concatenatedAuthorization,
      });

      if (createdRole) {
        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `User Role: Create a new user role named ${name}`,
        });

        if (act_log) {
          return res
            .status(200)
            .json({ message: "Data inserted successfully" });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// router.route("/updateRbac").post(async (req, res) => {
//   const { id, name, desc, checkedItems } = req.query;

//   try {
//     const isExit = await UserRole.findOne({
//       where: {
//         col_rolename: name,
//         col_id: {
//           [Op.ne]: id,
//         },
//       },
//     });

//     if (isExit) {
//       return res.status(202).send("Exist");
//     } else {
//       // Concatenate the authorization values with commas
//       const concatenatedAuthorization = checkedItems
//         .map((item) => item.id)
//         .join(", ");

//       const updatedRole = await UserRole.update(
//         {
//           col_rolename: name,
//           col_desc: desc,
//           col_authorization: concatenatedAuthorization,
//         },
//         {
//           where: {
//             col_id: id,
//           },
//         }
//       );

//       if (updatedRole) {
//         return res.status(200).json({ message: "Data inserted successfully" });
//       }
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });
router.route("/updateRbac").post(async (req, res) => {
  const { id, name, desc, checkedItems, userId } = req.query;

  try {
    const isExit = await UserRole.findOne({
      where: {
        col_rolename: name,
        col_id: {
          [Op.ne]: id,
        },
      },
    });

    if (isExit) {
      return res.status(202).send("Exist");
    } else {
      const getData = await UserRole.findOne({
        where: {
          col_id: id,
        },
      });
      // Ensure checkedItems is an array, even if it's empty
      let checkedItemsArray = [];
      if (checkedItems) {
        try {
          checkedItemsArray = JSON.parse(checkedItems);
        } catch (e) {
          console.error("Error parsing checkedItems:", e);
        }
      }

      // Concatenate the authorization values with commas, or use an empty string if there are no items
      const concatenatedAuthorization =
        Array.isArray(checkedItemsArray) && checkedItemsArray.length > 0
          ? checkedItemsArray.map((item) => item.id).join(", ")
          : "";

      const updatedRole = await UserRole.update(
        {
          col_rolename: name,
          col_desc: desc,
          col_authorization: concatenatedAuthorization,
        },
        {
          where: {
            col_id: id,
          },
        }
      );

      if (updatedRole) {
        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `User Role: Updated the user role information: \n
'${getData.col_rolename}' to '${name}'
'${getData.col_desc}' to '${desc}'
`,
        });

        if (act_log) {
          return res.status(200).json({ message: "Data updated successfully" });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.route("/delete/:userRoleId").delete(async (req, res) => {
  try {
    const id = req.params.userRoleId;
    const userId = req.query.userId;

    const findRole = await MasterList.findAll({
      where: {
        col_roleID: id,
      },
    });

    if (findRole && findRole.length > 0) {
      res.status(202).json({ success: true });
    } else {
      const role = await UserRole.findOne({
        where: { col_id: id },
      });
      const deletionResult = await UserRole.destroy({
        where: {
          col_id: id,
        },
      });

      if (deletionResult) {
        await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `User Role: Deleted role ${role.col_rolename}`,
        });

        res.json({ success: true });
      } else {
        res.status(203).json({ success: false });
      }
    }
  } catch (error) {
    console.error(error);
  }
});

router.route("/fetchuserrole").get(async (req, res) => {
  await UserRole.findAll({
    where: {
      col_id: { [Op.ne]: 1 },
    },
    order: [["createdAt", "DESC"]],
  })
    .then((data) => {
      // console.log(data);
      return res.json(data);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json("Error");
    });
});

router.route("/fetchuserroleEDIT").get(async (req, res) => {
  const { id } = req.query;

  try {
    const data = await UserRole.findByPk(id);

    if (!data) {
      return res.status(404).json({ message: "User role not found" });
    }
    // console.log(data);
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.route("/viewAuthorization/:id").get(async (req, res) => {
  try {
    const id = req.params.id;

    const user = await MasterList.findByPk(id, {
      include: {
        model: UserRole,
      },
    });

    if (user !== null) {
      // const authorization = user.userRole.col_authorization.split(', ');

      return res.json(user);
    } else {
      return res.status(401);
    }
  } catch (err) {
    return res.status(500);
  }
});

router.route("/rbacautoadd").post(async (req, res) => {
  try {
    //this is for checking of Superadmin role
    const existingRBAC = await UserRole.findOne({
      where: {
        col_rolename: "Superadmin",
      },
    });

    if (existingRBAC) {
      return res.status(200).json({ message: "Superadmin already exists" });
    }

    //if not exist create super admin
    const newRBAC = await UserRole.create({
      col_rolename: "Superadmin",
      col_desc: "",
      col_authorization:
        "Dashboard-View, InventoryStock-View, ReceivingStock-View, ReceivingStock-Add, OutboundingStock-View, OutboundingStock-Add, StockCounting-View, StockCounting-Add, EReceipt-View, EReceipt-IE, Product-View, Product-Add, Product-Edit, Product-Delete, Archive-View, Archive-Delete, RawMaterial-View, RawMaterial-Add, RawMaterial-Edit, RawMaterial-Delete, CookBook-View, CookBook-Add, CookBook-Edit, RFID-View, RFID-Add, RFID-IE, InventoryReport-View, InventoryReport-IE, RawInventoryReport-View, RawInventoryReport-IE, POSReport-View, POSReport-IE, RFIDReport-View, RFIDReport-IE, BulkLoadReport-View, BulkLoadReport-IE, StoreReport-View, StoreReport-IE, CustomerReport-View, CustomerReport-IE, StudentCreditReport-View, StudentCreditReport-IE, WeekCreditReport-View, WeekCreditReport-IE, CustomerReport-View, CustomerList-View, CustomerList-Add, CustomerList-Edit, CustomerList-Delete, CustomerList-IE, User-View, User-Add, User-Edit, User-Delete, UserRole-View, UserRole-Add, UserRole-Edit, UserRole-Delete, UserTransaction-View, WeeklyCredit-View, WeeklyCredit-Add, WeeklyCredit-Approve, WeeklyCredit-Request, Ordering-View, MenuProfile-View, MenuProfile-Add, CustomizationReceipt-View, CustomizationReceipt-Add, CustomizationReceipt-Edit, CustomizationReceipt-Delete, Hardware-View, Hardware-Add, Hardware-Edit, Hardware-Delete, LossBack-View, LossBack-Add, LossBack-Edit, Loyalty-View, Loyalty-Add, Loyalty-Edit, Loyalty-Delete, ProductExtra-View, ProductExtra-Add, ProductExtra-Edit, WeeklyCredit-View, WeeklyCredit-Add, WeeklyCredit-Approve, WeeklyCredit-Request, StudentCreditReport-View, WeekCreditReport-View, StudentCreditReport-IE, WeekCreditReport-IE, EndShiftReport-View, EndShiftReport-IE, StoreCloseReport-View, StoreCloseReport-IE, GeneralReport-View, GeneralReport-IE",
    });

    const rbacId = newRBAC.col_id;

    if (!newRBAC) {
      return res.status(201).json({ message: "No rbac id found" });
    }

    //create of masterlist
    const newUseradmin = await MasterList.create({
      col_roleID: rbacId,
      col_name: "Superadmin",
      col_address: "Valenzuela",
      col_username: "Superadmin",
      col_phone: null,
      col_email: "joseph.elogicinnovations@gmail.com",
      col_Pass: "admin",
      col_status: "Active",
      user_type: "Superadmin",
      user_pin: "0414",
    });

    res.status(201).json(newUseradmin);
  } catch (error) {
    console.error("Error: Problem on inserting", error);
    res.status(500).json({ message: "Error inserting" });
  }
});

module.exports = router;
