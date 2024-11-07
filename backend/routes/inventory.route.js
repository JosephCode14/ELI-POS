const router = require("express").Router();
const { jsPDF } = require("jspdf");
const xlsx = require("xlsx");
require("jspdf-autotable");

// Pdf Export
router.route("/export-pdf-inventory-stocks").get(async (req, res) => {
  try {
    const fake = [
      {
        sku: "12002301244",
        itemName: "Soy Sauce",
        description: "Toyo pang sabaw",
        unitType: "L",
        stocks: "120",
        status: "In Stock",
      },
    ];

    const doc = new jsPDF({ orientation: "landscape" });

    const tableData = fake.map((f) => [
      f.sku,
      f.itemName,
      f.description,
      f.unitType,
      f.stocks,
      f.status,
    ]);

    doc.autoTable({
      head: [
        ["SKU", "ITEM NAME", "DESCRIPTION", "UNIT TYPE", "STOCKS", "STATUS"],
      ],
      body: tableData,
    });
    res.send(doc.output());
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Excel Inventory Stocks
router.route("/export-excel-inventory-stocks").get(async (req, res) => {
  try {
    const fake = [
      {
        sku: "12002301244",
        itemName: "Soy Sauce",
        description: "Toyo pang sabaw",
        unitType: "L",
        stocks: "120",
        status: "In Stock",
      },
    ];

    const workbook = xlsx.utils.book_new();

    const data = fake.map((f) => ({
      SKU: f.sku,
      "ITEM NAME": f.itemName,
      DESCRIPTION: f.description,
      "UNIT TYPE": f.unitType,
      STOCKS: f.stocks,
      STATUS: f.status,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const filePath = "inventory.xlsx";
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "inventory.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});
// PDF Inbound
router.route("/export-pdf-inbound").get(async (req, res) => {
  try {
    const fake = [
      {
        id: "12002301244",
        stocks: 50,
        price: 100,
        time: "2024-12-2",
        operator: "JOSHUA",
      },
    ];

    const doc = new jsPDF({ orientation: "landscape" });

    const tableData = fake.map((f) => [
      f.id,
      f.stocks,
      f.price,
      f.time,
      f.operator,
    ]);

    doc.autoTable({
      head: [
        [
          "STOCK ID",
          "TOTAL STOCKS",
          "TOTAL PRICE",
          "STOCKING TIME",
          "OPERATOR",
        ],
      ],
      body: tableData,
    });
    res.send(doc.output());
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Excel Inbound Stocks
router.route("/export-excel-inbound").get(async (req, res) => {
  try {
    const fake = [
      {
        id: "12002301244",
        stocks: 50,
        price: 100,
        time: "2024-12-2",
        operator: "JOSHUA",
      },
    ];

    const workbook = xlsx.utils.book_new();

    const data = fake.map((f) => ({
      "STOCK ID": f.id,
      "TOTAL STOCKS": f.stocks,
      "TOTAL PRICE": f.price,
      "STOCKING TIME": f.time,
      OPERATOR: f.operator,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const filePath = "inbound.xlsx";
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "inbound.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});
// PDF Outbound Stocks
router.route("/export-pdf-outbound").get(async (req, res) => {
  try {
    const fake = [
      {
        id: "12002301244",
        total: 50,
        remarks: "Remarks",
        time: "2024-12-2",
        operator: "JOSHUA",
      },
    ];

    const doc = new jsPDF({ orientation: "landscape" });

    const tableData = fake.map((f) => [
      f.id,
      f.total,
      f.remarks,
      f.time,
      f.operator,
    ]);

    doc.autoTable({
      head: [
        [
          "OUTBOUND ID",
          "TOTAL OUTBOUND",
          "REMARKS",
          "OUTBOUND TIME",
          "OPERATOR",
        ],
      ],
      body: tableData,
    });
    res.send(doc.output());
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Excel Outbound Stocks
router.route("/export-excel-outbound").get(async (req, res) => {
  try {
    const fake = [
      {
        id: "12002301244",
        total: 50,
        remarks: "Remarks",
        time: "2024-12-2",
        operator: "JOSHUA",
      },
    ];
    const workbook = xlsx.utils.book_new();

    const data = fake.map((f) => ({
      "OUTBOUND ID": f.id,
      "TOTAL OUTBOUND": f.stocks,
      REMARKS: f.remarks,
      "OUTBOUND TIME": f.time,
      OPERATOR: f.operator,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const filePath = "outbound.xlsx";
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "outbound.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});
// PDF Stock Counting
router.route("/export-pdf-counting").get(async (req, res) => {
  try {
    const fake = [
      {
        id: "12002301244",
        systemCount: 50,
        actualCount: "Remarks",
        loss: 20,
        time: "2024-12-2",
        operator: "JOSHUA",
      },
    ];

    const doc = new jsPDF({ orientation: "landscape" });

    const tableData = fake.map((f) => [
      f.id,
      f.systemCount,
      f.actualCount,
      f.loss,
      f.time,
      f.operator,
    ]);

    doc.autoTable({
      head: [
        [
          "STOCK COUNTING ID",
          "SYSTEM COUNTS",
          "ACTUAL COUNT",
          "LOSS",
          "COUNTING TIME",
          "OPERATOR",
        ],
      ],
      body: tableData,
    });
    res.send(doc.output());
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Excel Stock Counting
router.route("/export-excel-counting").get(async (req, res) => {
  try {
    const fake = [
      {
        id: "12002301244",
        systemCount: 50,
        actualCount: "Remarks",
        loss: 20,
        time: "2024-12-2",
        operator: "JOSHUA",
      },
    ];
    const workbook = xlsx.utils.book_new();

    const data = fake.map((f) => ({
      "STOCK COUNTING ID": f.id,
      "SYSTEM COUNT": f.systemCount,
      "ACTUAL COUNT": f.actualCount,
      LOSS: f.loss,
      "COUNTING TIME": f.time,
      OPERATOR: f.operator,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const filePath = "counting.xlsx";
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "counting.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Fetch Inventory
router.route("/get-inventory").get(async (req, res) => {
  try {
    const fake = [
      {
        sku: "12002301244",
        itemName: "Soy Sauce",
        description: "Toyo pang sabaw",
        unitType: "L",
        stocks: "120",
        status: "In Stock",
      },
      {
        sku: "123012351",
        itemName: "Vinegar",
        description: "pang sabaw",
        unitType: "L",
        stocks: "120",
        status: "Low Stock",
      },
    ];

    if (fake) {
      return res.json(fake);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Fetch Inbound Data
router.route("/get-inbound").get(async (req, res) => {
  try {
    const fake = [
      {
        id: "12002301244",
        stocks: 50,
        price: 100,
        time: "2024-12-2",
        operator: "JOSHUA",
      },
      {
        id: "12234234231",
        stocks: 50,
        price: 100,
        time: "2024-12-2",
        operator: "PAULA",
      },
    ];

    if (fake) {
      return res.json(fake);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
