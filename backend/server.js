const express = require("express");
const cors = require("cors");
const https = require("https");
const http = require("http");
const fs = require("fs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const WebSocket = require("ws");
const dotenv = require("dotenv");
const hostname = "frontend.dualtechpos.com";

const privateKey = fs.readFileSync("/var/lib/jelastic/keys/privkey.pem");
const certificate = fs.readFileSync("/var/lib/jelastic/keys/fullchain.pem");
const credentials = { key: privateKey, cert: certificate };

// Middleware setup
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const frontendPath = "/home/jelastic/ROOT/frontend/build";
app.use(express.static(frontendPath));

app.post("/mssg", function (req, res) {
  console.log(req.body);

  res.redirect("/");
});

const backendPort = https
  .createServer(credentials, app)
  .listen(3443, function () {
    console.log("HTTPS Server started at port 3443");
  });

// Create HTTPS server on port 3443
https.createServer(credentials, app).listen(3000, function (req, res) {
  console.log("Server stated at port 3000");
});

require("dotenv").config();

// CORS setup
const corsOptions = {
  origin: ["https://dualtechpos.com:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

//Routes:
const activitylog = require("./routes/activity_log.route.js");
const masterRoute = require("./routes/masterlist.route");

const userRoute = require("./routes/userRole.route");

const category = require("./routes/category.route");

const product = require("./routes/product.route");

const category_product = require("./routes/category_product.route");
const raw_material = require("./routes/raw_material.route.js");
const inventory = require("./routes/inventory.route");

const order = require("./routes/order.route");
const order_record = require("./routes/order_record.route.js");

const student = require("./routes/student.route");

const receiving_stock_inventory = require("./routes/receiving_stock_inventory.route.js");

const product_inventory = require("./routes/product_inventory.route.js");

const product_inventory_accumulate = require("./routes/product_inventory_accumulate.route.js");
const product_inventory_outbound = require("./routes/product_inventory_outbound.route.js");
const product_inventory_counting = require("./routes/stock_counting.route.js");

const student_balance = require("./routes/student_balance.route.js");
const load_transaction = require("./routes/load_transaction.route.js");

const reports = require("./routes/reports.route.js");

const cook_book = require("./routes/cook_book.route.js");
const variant = require("./routes/settings_variant.route.js");

const customize_receipt = require("./routes/customize_receipt.route.js");
const specification = require("./routes/specification.route.js");
const extraneeding = require("./routes/extra_needing.route.js");
const store_profile = require("./routes/store_profile.route.js");
const user_transaction = require("./routes/user_transaction.route.js");
const endshift = require("./routes/endshift.route.js");
const kiosk_settings = require("./routes/kiosk_settings.route.js");
const Credit_Student_Meal = require("./routes/credit_student_meal.route.js");
const authenticateToken = require("./middleware/token_authentication.middleware");
const jwt = require("jsonwebtoken");

app.use("/masterList", masterRoute);
app.use("/userRole", userRoute);
app.use("/category", category);
app.use("/product", product);
app.use("/category_product", category_product);
app.use("/inventory", inventory);
app.use("/order", order);
app.use("/student", student);
app.use("/receiving_stock_inventory", receiving_stock_inventory);
app.use("/product_inventory", product_inventory);
app.use("/product_inventory_accumulate", product_inventory_accumulate);
app.use("/product_inventory_outbound", product_inventory_outbound);
app.use("/stockCounting", product_inventory_counting);
app.use("/student_balance", student_balance);
app.use("/load_transaction", load_transaction);
app.use("/reports", reports);
app.use("/rawmaterial", raw_material);
app.use("/orderRecords", order_record);
app.use("/cook_book", cook_book);
app.use("/customize_receipt", customize_receipt);
app.use("/variant", variant);
app.use("/specifications", specification);
app.use("/store_profile", store_profile);
app.use("/user_transaction", user_transaction);
app.use("/activityLog", activitylog);
app.use("/endshift", endshift);
app.use("/kiosk_settings", kiosk_settings);
app.use("/extraneed", extraneeding);
app.use("/credits", Credit_Student_Meal);

app.get("*", (req, res) => {
  res.sendFile(frontendPath + "/index.html");
});
// WebSocket Server

const wss = new WebSocket.Server({ server: backendPort });

wss.on("connection", (ws, req) => {
  console.log("Client connected to WebSocket");

  ws.on("message", (message) => {
    const messageStr = message.toString();
    console.log("Received:", messageStr);

    // Determine if the message is from React
    const isFromReactApp =
      req.headers.origin === "https://dualtechpos.com:3000";

    if (isFromReactApp) {
      console.log("Message from React app:", messageStr);

      // Relay the message to the local client (assumes only one local client)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }

    // Relay local client message back to React app
    if (!isFromReactApp) {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
