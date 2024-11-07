const UserRole = require("./userRole.model");
const MasterList = require("./masterlist.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Category_Product = require("./category_product.model");
const Order_Transaction = require("./order_transaction.model");
const Cart = require("./cart.model");
const Void_Transaction = require("./void_transaction.model");
const Archive = require("./archive.model");
const Archive_Raw = require("./archive_raw.model");
const Student = require("./student.model");
const Product_Inventory = require("./product_inventory.model");
const Product_Inventory_Accumulate = require("./product_inventory_accumulate.model");
const Receiving_Stock_Inventory = require("./receiving_stock_inventory.model");
const Inventory_Receiving_Transaction = require("./inventory_receiving_transaction.model");
const Product_Inventory_Outbound = require("./product_inventory_outbound.model");
const Inventory_Outbound_Transaction = require("./inventory_outbound_transaction.model");
const Outbound_Stock_Inventory = require("./outbound_stock_inventory.model");
const Stock_Counting_Inventory = require("./stock_counting_inventory.model");
const Product_Inventory_Counting = require("./product_inventory_counting.model");
const Inventory_Stock_Counting_Transaction = require("./inventory_stock_counting_transaction.model");
const Student_Balance = require("./student_balance.model");
const Load_Transaction = require("./load_transaction.model");
const Order_Counter = require("./order_counter");
const Transaction_Number = require("./transaction_number");
const RawMaterial = require("./raw_materials");
const RawInventory = require("./raw_inventory.model");
const Raw_Inventory_Accumulate = require("./raw_inventory_accumulate.model");
const Raw_Inventory_Receiving_Transaction = require("./raw_inventory_receiving_transaction.model");
const Specification_Main = require("./specification_main.model");
const Specification_Variant = require("./specification_variant.model");
const Dish_Raw_Material = require("./dish_raw_material.model");
const Cook_Book = require("./cook_book.model");
const Customize_Receipt = require("./customize_receipt.model");
const Store_Profile = require("./store_profile.model");
const Category_Product_Specification = require("./categoryproduct_specification.model");
const Cart_Specification_Variant = require("./cart_specification_variant.model");
const Balance_History = require("./balance_history");
const Raw_Inventory_Outbound_Transaction = require("./raw_inventory_outbound_transaction.model");
const Raw_Inventory_Outbound = require("./raw_inventory_outbound.model");
const Raw_Inventory_Counting = require("./raw_inventory_counting.model");
const Raw_Inventory_Counting_Transaction = require("./raw_inventory_counting_transaction.model");
const Bulk_Load = require("./bulk_load.model.js");
const Bulk_Load_Transaction = require("./bulk_load_transaction.model");
const Store_Status = require("./store-status.model.js");
const Store_Status_History = require("./store_status_history.model.js");
const Activity_Log = require("./activity_log.model.js");
const UserLogin = require("./userlogin.model.js");
const CashierReport = require("./cashier_report.model.js");
const Kiosk_Img = require("./kiosk_img.model.js");
const Extra_Main = require("./extra_main.model.js");
const Extra_Variant = require("./extra_variant.model.js");
const Credit_Student_Meal = require("./credit_student_meal.model.js");
const Category_Product_Extra = require("./categoryproduct_extra.model.js");
const Cart_Extra_Needing = require("./cart_extra_needing.model.js");
const Store_Report = require("./store_report.model.js");
// const Student_Meal_Time = require("./student_meal_time.model.js");

UserRole.hasMany(MasterList, { foreignKey: "col_roleID" });
MasterList.belongsTo(UserRole, { foreignKey: "col_roleID" });

Product_Inventory.hasMany(Cart, { foreignKey: "product_inventory_id" });
Cart.belongsTo(Product_Inventory, { foreignKey: "product_inventory_id" });

Product.hasMany(Archive, { foreignKey: "product_id" });
Archive.belongsTo(Product, { foreignKey: "product_id" });

// New
Product.hasMany(Product_Inventory, { foreignKey: "product_id" });
Product_Inventory.belongsTo(Product, { foreignKey: "product_id" });

RawMaterial.hasMany(Archive_Raw, { foreignKey: "raw_material_id" });
Archive_Raw.belongsTo(RawMaterial, { foreignKey: "raw_material_id" });

Category.hasMany(Category_Product, { foreignKey: "category_id" });
Category_Product.belongsTo(Category, { foreignKey: "category_id" });

Product.hasMany(Category_Product, { foreignKey: "product_id" });
Category_Product.belongsTo(Product, { foreignKey: "product_id" });

// Category_Product.hasMany(Product_Inventory, {
//   foreignKey: "category_product_id",
// });
// Product_Inventory.belongsTo(Category_Product, {
//   foreignKey: "category_product_id",
// });

//adding stock
Product_Inventory.hasMany(Product_Inventory_Accumulate, {
  foreignKey: "product_inventory_id",
});
Product_Inventory_Accumulate.belongsTo(Product_Inventory, {
  foreignKey: "product_inventory_id",
});

Receiving_Stock_Inventory.hasMany(Inventory_Receiving_Transaction, {
  foreignKey: "receiving_stock_inventory_id",
});
Inventory_Receiving_Transaction.belongsTo(Receiving_Stock_Inventory, {
  foreignKey: "receiving_stock_inventory_id",
});

Product_Inventory_Accumulate.hasMany(Inventory_Receiving_Transaction, {
  foreignKey: "product_inventory_accumulate_id",
});
Inventory_Receiving_Transaction.belongsTo(Product_Inventory_Accumulate, {
  foreignKey: "product_inventory_accumulate_id",
});

//decreasing stock
Product_Inventory.hasMany(Product_Inventory_Outbound, {
  foreignKey: "product_inventory_id",
});
Product_Inventory_Outbound.belongsTo(Product_Inventory, {
  foreignKey: "product_inventory_id",
});

Outbound_Stock_Inventory.hasMany(Inventory_Outbound_Transaction, {
  foreignKey: "outbound_stock_inventory_id",
});
Inventory_Outbound_Transaction.belongsTo(Outbound_Stock_Inventory, {
  foreignKey: "outbound_stock_inventory_id",
});

Product_Inventory_Outbound.hasMany(Inventory_Outbound_Transaction, {
  foreignKey: "product_inventory_outbound_id",
});
Inventory_Outbound_Transaction.belongsTo(Product_Inventory_Outbound, {
  foreignKey: "product_inventory_outbound_id",
});

//actual stock counting
Product_Inventory.hasMany(Product_Inventory_Counting, {
  foreignKey: "product_inventory_id",
});
Product_Inventory_Counting.belongsTo(Product_Inventory, {
  foreignKey: "product_inventory_id",
});

Stock_Counting_Inventory.hasMany(Inventory_Stock_Counting_Transaction, {
  foreignKey: "stock_counting_inventory_id",
});
Inventory_Stock_Counting_Transaction.belongsTo(Stock_Counting_Inventory, {
  foreignKey: "stock_counting_inventory_id",
});

Product_Inventory_Counting.hasMany(Inventory_Stock_Counting_Transaction, {
  foreignKey: "product_inventory_counting_id",
});
Inventory_Stock_Counting_Transaction.belongsTo(Product_Inventory_Counting, {
  foreignKey: "product_inventory_counting_id",
});

Student.hasMany(Student_Balance, { foreignKey: "student_id" });
Student_Balance.belongsTo(Student, { foreignKey: "student_id" });

Student_Balance.hasMany(Load_Transaction, { foreignKey: "student_balance_id" });
Load_Transaction.belongsTo(Student_Balance, {
  foreignKey: "student_balance_id",
});

Student.hasMany(Order_Transaction, { foreignKey: "student_id" });
Order_Transaction.belongsTo(Student, { foreignKey: "student_id" });

MasterList.hasMany(Order_Transaction, { foreignKey: "masterlist_id" });
Order_Transaction.belongsTo(MasterList, { foreignKey: "masterlist_id" });

Order_Transaction.hasMany(Cart, { foreignKey: "order_transaction_id" });
Cart.belongsTo(Order_Transaction, { foreignKey: "order_transaction_id" });

Order_Transaction.hasMany(Void_Transaction, {
  foreignKey: "order_transaction_id",
});
Void_Transaction.belongsTo(Order_Transaction, {
  foreignKey: "order_transaction_id",
});

Specification_Main.hasMany(Specification_Variant, {
  foreignKey: "specification_main_id",
});
Specification_Variant.belongsTo(Specification_Main, {
  foreignKey: "specification_main_id",
});

Specification_Main.hasMany(Category_Product_Specification, {
  foreignKey: "specification_main_id",
});
Category_Product_Specification.belongsTo(Specification_Main, {
  foreignKey: "specification_main_id",
});

Product.hasMany(Category_Product_Specification, {
  foreignKey: "product_id",
});
Category_Product_Specification.belongsTo(Product, {
  foreignKey: "product_id",
});
// Cook

Cook_Book.hasMany(Dish_Raw_Material, { foreignKey: "cook_book_id" });
Dish_Raw_Material.belongsTo(Cook_Book, { foreignKey: "cook_book_id" });

Product.hasMany(Cook_Book, { foreignKey: "product_id" });
Cook_Book.belongsTo(Product, { foreignKey: "product_id" });

RawMaterial.hasMany(Dish_Raw_Material, { foreignKey: "raw_material_id" });
Dish_Raw_Material.belongsTo(RawMaterial, { foreignKey: "raw_material_id" });

Cart.hasMany(Cart_Specification_Variant, { foreignKey: "cart_id" });
Cart_Specification_Variant.belongsTo(Cart, { foreignKey: "cart_id" });

Specification_Variant.hasMany(Cart_Specification_Variant, {
  foreignKey: "specification_variant_id",
});
Cart_Specification_Variant.belongsTo(Specification_Variant, {
  foreignKey: "specification_variant_id",
});

RawMaterial.hasMany(RawInventory, { foreignKey: "raw_id" });
RawInventory.belongsTo(RawMaterial, { foreignKey: "raw_id" });

RawInventory.hasMany(Raw_Inventory_Accumulate, {
  foreignKey: "raw_inventory_id",
});
Raw_Inventory_Accumulate.belongsTo(RawInventory, {
  foreignKey: "raw_inventory_id",
});

Receiving_Stock_Inventory.hasMany(Raw_Inventory_Receiving_Transaction, {
  foreignKey: "receiving_stock_inventory_id",
});
Raw_Inventory_Receiving_Transaction.belongsTo(Receiving_Stock_Inventory, {
  foreignKey: "receiving_stock_inventory_id",
});

Raw_Inventory_Accumulate.hasMany(Raw_Inventory_Receiving_Transaction, {
  foreignKey: "raw_inventory_accumulate_id",
});
Raw_Inventory_Receiving_Transaction.belongsTo(Raw_Inventory_Accumulate, {
  foreignKey: "raw_inventory_accumulate_id",
});

Outbound_Stock_Inventory.hasMany(Raw_Inventory_Outbound_Transaction, {
  foreignKey: "outbound_stock_inventory_id",
});
Raw_Inventory_Outbound_Transaction.belongsTo(Outbound_Stock_Inventory, {
  foreignKey: "outbound_stock_inventory_id",
});

Raw_Inventory_Outbound.hasMany(Raw_Inventory_Outbound_Transaction, {
  foreignKey: "raw_inventory_outbound_id",
});
Raw_Inventory_Outbound_Transaction.belongsTo(Raw_Inventory_Outbound, {
  foreignKey: "raw_inventory_outbound_id",
});

RawInventory.hasMany(Raw_Inventory_Outbound, {
  foreignKey: "raw_id",
});
Raw_Inventory_Outbound.belongsTo(RawInventory, {
  foreignKey: "raw_id",
});

// Stock Counting Raw materials

Stock_Counting_Inventory.hasMany(Raw_Inventory_Counting_Transaction, {
  foreignKey: "stock_counting_inventory_id",
});
Raw_Inventory_Counting_Transaction.belongsTo(Stock_Counting_Inventory, {
  foreignKey: "stock_counting_inventory_id",
});

Raw_Inventory_Counting.hasMany(Raw_Inventory_Counting_Transaction, {
  foreignKey: "raw_inventory_counting_id",
});

Raw_Inventory_Counting_Transaction.belongsTo(Raw_Inventory_Counting, {
  foreignKey: "raw_inventory_counting_id",
});

RawInventory.hasMany(Raw_Inventory_Counting, {
  foreignKey: "raw_id",
});
Raw_Inventory_Counting.belongsTo(RawInventory, {
  foreignKey: "raw_id",
});

//Balance History
Order_Transaction.hasMany(Balance_History, {
  foreignKey: "order_transaction_id",
});
Balance_History.belongsTo(Order_Transaction, {
  foreignKey: "order_transaction_id",
});

//Bulk History
Bulk_Load.hasMany(Bulk_Load_Transaction, {
  foreignKey: "bulk_load_id",
});
Bulk_Load_Transaction.belongsTo(Bulk_Load, {
  foreignKey: "bulk_load_id",
});

Load_Transaction.hasMany(Bulk_Load_Transaction, {
  foreignKey: "load_transaction_id",
});

Bulk_Load_Transaction.belongsTo(Load_Transaction, {
  foreignKey: "load_transaction_id",
});

Store_Status.hasMany(Store_Status_History, {
  foreignKey: "store_status_id",
});
Store_Status_History.belongsTo(Store_Status, {
  foreignKey: "store_status_id",
});

MasterList.hasMany(Load_Transaction, { foreignKey: "masterlist_id" });
Load_Transaction.belongsTo(MasterList, { foreignKey: "masterlist_id" });

MasterList.hasMany(Activity_Log, { foreignKey: "masterlist_id" });
Activity_Log.belongsTo(MasterList, { foreignKey: "masterlist_id" });

MasterList.hasMany(Store_Status_History, { foreignKey: "masterlist_id" });
Store_Status_History.belongsTo(MasterList, { foreignKey: "masterlist_id" });

MasterList.hasMany(UserLogin, { foreignKey: "masterlist_id" });
UserLogin.belongsTo(MasterList, { foreignKey: "masterlist_id" });

MasterList.hasMany(Bulk_Load, { foreignKey: "masterlist_id" });
Bulk_Load.belongsTo(MasterList, { foreignKey: "masterlist_id" });

MasterList.hasMany(MasterList, {
  foreignKey: "supervisor_id",
  as: "subordinates",
});
MasterList.belongsTo(MasterList, {
  foreignKey: "supervisor_id",
  as: "supervisor",
});

MasterList.hasMany(Void_Transaction, {
  foreignKey: "masterlist_id",
  as: "Employee",
});
Void_Transaction.belongsTo(MasterList, {
  foreignKey: "masterlist_id",
  as: "Employee",
});

MasterList.hasMany(Void_Transaction, {
  foreignKey: "supervisor_id",
  as: "SupervisedBy",
});
Void_Transaction.belongsTo(MasterList, {
  foreignKey: "supervisor_id",
  as: "SupervisedBy",
});

Extra_Main.hasMany(Extra_Variant, { foreignKey: "extra_main_id" });
Extra_Variant.belongsTo(Extra_Main, { foreignKey: "extra_main_id" });

RawMaterial.hasMany(Extra_Variant, { foreignKey: "raw_material_id" });
Extra_Variant.belongsTo(RawMaterial, { foreignKey: "raw_material_id" });

Extra_Main.hasMany(Category_Product_Extra, {
  foreignKey: "extra_main_id",
});
Category_Product_Extra.belongsTo(Extra_Main, {
  foreignKey: "extra_main_id",
});

Product.hasMany(Category_Product_Extra, {
  foreignKey: "product_id",
});
Category_Product_Extra.belongsTo(Product, {
  foreignKey: "product_id",
});

Student.hasMany(Credit_Student_Meal, {
  foreignKey: "student_id",
});
Credit_Student_Meal.belongsTo(Student, {
  foreignKey: "student_id",
});

Cart.hasMany(Cart_Extra_Needing, {
  foreignKey: "cart_id",
});
Cart_Extra_Needing.belongsTo(Cart, {
  foreignKey: "cart_id",
});

Extra_Variant.hasMany(Cart_Extra_Needing, {
  foreignKey: "extra_variant_id",
});
Cart_Extra_Needing.belongsTo(Extra_Variant, {
  foreignKey: "extra_variant_id",
});

MasterList.hasMany(Credit_Student_Meal, {
  foreignKey: "requestor",
  as: "RequestBy",
});

MasterList.hasMany(Credit_Student_Meal, {
  foreignKey: "approver",
  as: "ApprovedBy",
});

Credit_Student_Meal.belongsTo(MasterList, {
  foreignKey: "requestor",
  as: "RequestBy",
});

Credit_Student_Meal.belongsTo(MasterList, {
  foreignKey: "approver",
  as: "ApprovedBy",
});
// Category.hasMany(Student_Meal_Time, {
//   foreignKey: "category_id",
// });
// Student_Meal_Time.belongsTo(Category, {
//   foreignKey: "category_id",
// });

module.exports = {
  MasterList,
  UserRole,
  Category,
  Product,
  Category_Product,
  Student_Balance,
  Student,
  Load_Transaction,
  Product_Inventory,
  Receiving_Stock_Inventory,
  Product_Inventory_Accumulate,
  Inventory_Receiving_Transaction,
  Cart,
  Order_Transaction,
  Void_Transaction,
  Product_Inventory_Outbound,
  Inventory_Outbound_Transaction,
  Outbound_Stock_Inventory,
  Stock_Counting_Inventory,
  Product_Inventory_Counting,
  Inventory_Stock_Counting_Transaction,
  Order_Counter,
  Transaction_Number,
  RawMaterial,
  RawInventory,
  Raw_Inventory_Accumulate,
  Raw_Inventory_Receiving_Transaction,
  Specification_Main,
  Specification_Variant,
  Dish_Raw_Material,
  Cook_Book,
  Customize_Receipt,
  Store_Profile,
  Category_Product_Specification,
  Cart_Specification_Variant,
  Balance_History,
  Archive_Raw,
  Raw_Inventory_Outbound_Transaction,
  Raw_Inventory_Outbound,
  Raw_Inventory_Counting,
  Raw_Inventory_Counting_Transaction,
  Bulk_Load,
  Bulk_Load_Transaction,
  Store_Status,
  Store_Status_History,
  Activity_Log,
  UserLogin,
  CashierReport,
  Kiosk_Img,
  Extra_Main,
  Extra_Variant,
  Category_Product_Extra,
  Credit_Student_Meal,
  Cart_Extra_Needing,
  Store_Report,
  // Student_Meal_Time,
};
