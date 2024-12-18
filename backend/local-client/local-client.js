const WebSocket = require("ws");
const net = require("net");
const snmp = require("net-snmp");
const ping = require("ping");

const PRINTER_IP = "192.168.1.13";
const PRINTER_IP_KITCH = "192.168.1.14";
const COMMON_PORTS = 9100;

let socket;
let reconnectTimeout;
let keepAliveInterval;

function connectWebSocket() {
  clearTimeout(reconnectTimeout);
  socket = new WebSocket("wss://eli-pos.onrender.com");

  socket.on("open", () => {
    console.log("Connected to Printer");

    // socket.send("Hello from the Node.js client!");

    clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(async () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping");
        const kioskPrinter = await checkPort(PRINTER_IP, COMMON_PORTS);
        const kitchenPrinter = await checkPort(PRINTER_IP_KITCH, COMMON_PORTS);

        const printerData = {
          kioskPrinter: Boolean(kioskPrinter),
          kitchenPrinter: Boolean(kitchenPrinter),
        };
        const jsonString = JSON.stringify(printerData);

        socket.send(jsonString);
      }
    }, 1 * 10 * 1000);
  });

  socket.on("message", async (data) => {
    const message = data.toString();
    console.log("Received message from server:", message);

    if (message && message !== "pong") {
      try {
        const printerStatus = await checkPrinterStatus();
        console.log("Printer status:", printerStatus);

        socket.send(`Printer status: ${printerStatus}`);

        // If the printer is reachable, print a long text
        if (printerStatus.includes("reachable")) {
          const parsedMessage = JSON.parse(message);
          const cashier = parsedMessage.type == "cashier";

          // If not fron cashier
          // if (!cashier) {
          //   printLongText(message);
          // }

          if (!cashier) {
            await printLongText(message, () => {
              console.log(
                "Finished printing long text, restarting connection..."
              );
              socket.close();
              setTimeout(() => {
                connectWebSocket();
              }, 1000);
            });
          }

          const { cartWithoutImages } = parsedMessage;

          const printableItems = cartWithoutImages.filter(
            (item) => item.printable
          );

          if (printableItems.length >= 1) {
            printKitchenReceipt(message);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
        // socket.send("Error processing message");
      }
    }
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
    reconnect();
  });

  socket.on("close", () => {
    console.log("Disconnected from Printer");
    reconnect();
  });
}

function reconnect() {
  if (socket && socket.readyState === WebSocket.CLOSED) {
    console.log("Attempting to reconnect to printer...");
    reconnectTimeout = setTimeout(connectWebSocket, 5000);
  }
}

async function checkPrinterStatus() {
  try {
    const pingResult = await ping.promise.probe(PRINTER_IP);
    if (!pingResult.alive) {
      reconnect();
      return "Printer is not responding to ping";
    }

    const isOpen = await checkPort(PRINTER_IP, COMMON_PORTS);

    const isOpenKitch = await checkPort(PRINTER_IP_KITCH, COMMON_PORTS);
    console.log("Port", isOpen, COMMON_PORTS);
    console.log("Port Kitch", isOpenKitch, COMMON_PORTS);
    if (isOpen) {
      return `Printer is reachable on port ${COMMON_PORTS}`;
    }

    // for (const port of COMMON_PORTS) {
    //   const isOpen = await checkPort(PRINTER_IP, port);
    //   if (isOpen) {
    //     return `Printer is reachable on port ${port}`;
    //   }
    // }

    const snmpResult = await checkSNMP(PRINTER_IP);
    if (snmpResult) {
      return snmpResult;
    }

    return "Printer is reachable but no standard printing ports are open";
  } catch (error) {
    console.error("Error in checkPrinterStatus:", error);
    return "Error checking printer status";
  }
}

const checkPort = (ip, port) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket
      .connect(port, ip, () => {
        console.log(`Port ${port} is open on ${ip}`);
        socket.destroy();
        resolve(true);
      })
      .on("error", () => {
        console.log(`Port ${port} is closed on ${ip}`);
        socket.destroy();
        resolve(false);
      })
      .on("timeout", () => {
        console.log(`Port ${port} timed out on ${ip}`);
        socket.destroy();
        resolve(false);
      });
  });
};

const checkPortKitch = (ip, port) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket
      .connect(port, ip, () => {
        console.log(`Port ${port} is open on ${ip}`);
        socket.destroy();
        resolve(true);
      })
      .on("error", () => {
        console.log(`Port ${port} is closed on ${ip}`);
        socket.destroy();
        resolve(false);
      })
      .on("timeout", () => {
        console.log(`Port ${port} timed out on ${ip}`);
        socket.destroy();
        resolve(false);
      });
  });
};

// function checkPort(host, port) {
//   return new Promise((resolve) => {
//     const socket = new net.Socket();
//     socket.setTimeout(3000);

//     socket.on("connect", () => {
//       console.log(`Port ${port} on ${host} is open.`);
//       socket.destroy();
//       resolve(true);
//     });

//     socket.on("timeout", () => {
//       console.log(`Port ${port} on ${host} timed out.`);
//       socket.destroy();
//       resolve(false);
//     });

//     socket.on("error", () => {
//       console.log(`Port ${port} on ${host} is closed or unreachable.`);
//       resolve(false);
//     });

//     socket.connect(port, host);
//   });
// }

function checkSNMP(host) {
  return new Promise((resolve) => {
    const session = snmp.createSession(host, "public");
    const oid = "1.3.6.1.2.1.43.10.2.1.4.1.1";
    let sessionClosed = false;

    session.get([oid], (error, varbinds) => {
      if (error) {
        console.error("snmp error:", error);
        resolve(null);
      } else {
        for (const vb of varbinds) {
          if (snmp.isVarbindError(vb)) {
            console.error(snmp.varbindError(vb));
            resolve(null);
          } else {
            resolve(`Printer status via SNMP: ${vb.value}`);
          }
        }
      }
      if (!sessionClosed) {
        session.close();
        sessionClosed = true;
      }
    });

    setTimeout(() => {
      if (!sessionClosed) {
        session.close();
        sessionClosed = true;
      }
      resolve(null);
    }, 5000);
  });
}

const formatNumber = (num) => {
  const formatNum = `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return formatNum;
};

// Receipt
async function printLongText(receivedMessage) {
  console.log("Printing long text to the printer...");

  const data = JSON.parse(receivedMessage);
  const cartItems = data.cartWithoutImages;
  const student = data.studentData.student;
  const studentBalance = data.studentData;
  const orderNumber = data.orderNumber;
  const orderType = data.orderType.orderType;

  const totalOrder = data.totalOrder;

  const printerPort = 9100; // Common port for HPRT printers
  const printerHost = PRINTER_IP; // Your printer's IP

  // ESC/POS command for text alignment
  const alignCenter = Buffer.from([0x1b, 0x61, 0x01]); // Center text
  const alignLeft = Buffer.from([0x1b, 0x61, 0x00]); // Left align text
  const doubleSizeOn = Buffer.from([0x1d, 0x21, 0x11]);
  const tripleSizeOn = Buffer.from([0x1d, 0x21, 0x22]);
  const doubleSizeOff = Buffer.from([0x1d, 0x21, 0x00]);
  // Sample receipt data
  const storeName = "DUALTECH";
  const transactionNo = orderNumber.toString();
  const terminal = "Kiosk";
  const cashier = "Kiosk";

  const transDate = new Date().toLocaleString();

  const idNo = student.student_number.toString();
  const name = `${student.first_name} ${student.last_name}`;

  const initialCompute = studentBalance.balance - totalOrder;
  const initialBalance = formatNumber(studentBalance.balance);
  const remainingBalance = formatNumber(initialCompute);

  const total = formatNumber(totalOrder);
  const tapCard = formatNumber(totalOrder);
  const tendered = formatNumber(totalOrder);
  const change = "0";

  // Function to pad text for alignment
  function padText(label, value, totalLength = 48) {
    return label + value.padStart(totalLength - label.length);
  }
  function wrapText(text, maxLength) {
    let wrappedText = "";
    while (text.length > maxLength) {
      // Split the text at the maxLength, find the last space before maxLength
      let lastSpaceIndex = text.lastIndexOf(" ", maxLength);
      if (lastSpaceIndex === -1) {
        lastSpaceIndex = maxLength; // No space found, break at maxLength
      }
      // Add the wrapped line to the result
      wrappedText += text.substring(0, lastSpaceIndex).trim() + "\n";
      // Remove the wrapped part from the original text
      text = text.substring(lastSpaceIndex).trim();
    }
    // Add the remaining part
    wrappedText += text;
    return wrappedText;
  }
  const orderItems = [
    { qty: 2, desc: "Spaghetti", price: 5.0 },
    { qty: 1, desc: "Item 2", price: 15.0 },
    { qty: 3, desc: "Item 3", price: 7.5 },
  ];

  // Header with centered text
  let receiptText = "";
  receiptText += alignCenter;
  receiptText += doubleSizeOn; // Turn on double-size mode
  receiptText += "BUON TAVOLO\n";
  receiptText += "\n";
  receiptText += doubleSizeOff;
  receiptText += "Transaction Slip\n";
  receiptText += alignLeft;
  receiptText += "\n";

  // Transaction details with aligned values using `padText` function
  receiptText += padText("Transaction No.:", transactionNo) + "\n";
  receiptText += padText("Terminal:", terminal) + "\n";
  // receiptText += padText("Cashier:", cashier) + "\n";
  receiptText += padText("Payment Method:", "Card") + "\n";
  receiptText += padText("Trans. Date:", transDate) + "\n";
  receiptText += padText("ID. No.:", idNo) + "\n";
  receiptText += padText("Name:", name) + "\n";
  receiptText += padText("Initial Balance:", initialBalance) + "\n";
  receiptText += padText("Remaining Balance:", remainingBalance) + "\n";

  // Divider and table header for items
  receiptText += "------------------------------------------------\n";
  receiptText += "Qty          Desc           Price         Amount\n";
  receiptText += "------------------------------------------------\n";

  receiptText += alignCenter;
  receiptText += `${orderType}\n`;
  receiptText += alignLeft;

  let totalAmount = 0; // To calculate the total amount
  for (const item of cartItems) {
    const subtotal = item.subtotal;
    const amount = item.quantity * item.price;
    totalAmount += amount;
    const prodName = `${item.name}${
      item.variantNames && item.extraNeedingNames
        ? ` (${item.variantNames}, ${item.extraNeedingNames})`
        : item.variantNames
        ? ` (${item.variantNames})`
        : item.extraNeedingNames
        ? ` (${item.extraNeedingNames})`
        : ""
    }`;

    const price = item.price + item.variantPrice + item.extraNeedingPrice;

    // Wrap the description if it's too long
    const wrappedDesc = wrapText(prodName, 18).split("\n"); // Split into lines

    // Add each line of the wrapped description to the receipt text
    for (let i = 0; i < wrappedDesc.length; i++) {
      let line;

      if (i === 0) {
        // For the first line, include the quantity
        line = padText(item.quantity.toString(), wrappedDesc[i], 20);
        // Include price and subtotal for the first line
        line +=
          price.toFixed(2).padStart(12) + subtotal.toFixed(2).padStart(15);
      } else {
        // For subsequent lines, pad the quantity area with spaces
        line = padText(" ", wrappedDesc[i], 20);
        // Add spaces instead of price and subtotal
        line += "".padStart(12) + "".padStart(15);
      }

      receiptText += line + "\n";
    }
  }

  receiptText += "------------------------------------------------\n";

  receiptText += padText("Total:", total) + "\n";
  receiptText += padText("Tap Card:", tapCard) + "\n";
  receiptText += padText("Amount Tendered:", tendered) + "\n";
  receiptText += padText("Change:", change) + "\n";

  receiptText += "------------------------------------------------\n";

  receiptText += "\n";
  receiptText += "\n";

  receiptText += alignCenter;
  receiptText += "This document is not valid\n";
  receiptText += "For claim of input tax\n";

  receiptText += "\n";
  receiptText += "\n";
  receiptText += "ELI IT Solutions 2024\n";

  // For Student Breakfast Meal
  const studentOrderNumber = true;

  const studentBreakfast = cartItems.some(
    (item) => item.category === "Student Meal - Breakfast"
  );
  // const studentBreakfast = false;
  const studentLunch = cartItems.some(
    (item) => item.category === "Student Meal - Lunch"
  );
  const studentDinner = cartItems.some(
    (item) => item.category === "Student Meal - Dinner"
  );

  let studentOrderNumberReceipt = "";
  let studentBreakFastReceipt = "";
  let studentLunchReceipt = "";
  let studentDinnerReceipt = "";

  //Order number
  studentOrderNumberReceipt +=
    "------------------------------------------------\n";

  studentOrderNumberReceipt += padText(`Order Num:`, `${transDate}`) + "\n";

  studentOrderNumberReceipt += "\n";
  studentOrderNumberReceipt += tripleSizeOn;
  receiptText += alignCenter;
  studentOrderNumberReceipt += `${orderNumber}\n`;
  studentOrderNumberReceipt += doubleSizeOff;
  studentOrderNumberReceipt += "\n";

  studentOrderNumberReceipt +=
    "------------------------------------------------\n";
  receiptText += alignLeft;
  //Breakfast
  studentBreakFastReceipt +=
    "------------------------------------------------\n";

  studentBreakFastReceipt +=
    padText(`Food Stub Num: ${orderNumber}`, `${transDate}`) + "\n";

  studentBreakFastReceipt += "\n";
  studentBreakFastReceipt += tripleSizeOn;
  studentBreakFastReceipt += "Breakfast - Meal\n";
  studentBreakFastReceipt += doubleSizeOff;
  studentBreakFastReceipt += "\n";

  studentBreakFastReceipt +=
    "------------------------------------------------\n";

  //Breakfast

  //Lunch
  studentLunchReceipt += "------------------------------------------------\n";

  studentLunchReceipt +=
    padText(`Food Stub Num: ${orderNumber}`, `${transDate}`) + "\n";

  studentLunchReceipt += "\n";
  studentLunchReceipt += tripleSizeOn;
  studentLunchReceipt += "Lunch - Meal\n";
  studentLunchReceipt += doubleSizeOff;
  studentLunchReceipt += "\n";

  studentLunchReceipt += "------------------------------------------------\n";

  //Lunch

  //Dinner
  studentDinnerReceipt += "------------------------------------------------\n";

  studentDinnerReceipt +=
    padText(`Food Stub Num: ${orderNumber}`, `${transDate}`) + "\n";

  studentDinnerReceipt += "\n";
  studentDinnerReceipt += tripleSizeOn;
  studentDinnerReceipt += "Dinner - Meal\n";
  studentDinnerReceipt += doubleSizeOff;
  studentDinnerReceipt += "\n";

  studentDinnerReceipt += "------------------------------------------------\n";

  //Dinner

  // Create a socket to connect to the printer
  const client = new net.Socket();

  client.connect(printerPort, printerHost, () => {
    console.log("Connected to printer");

    if (studentOrderNumber) {
      client.write(studentOrderNumberReceipt + "\n");
      client.write(Buffer.from([0x1d, 0x56, 0x42, 0x00]));
    }

    if (studentBreakfast) {
      client.write(studentBreakFastReceipt + "\n");
      client.write(Buffer.from([0x1d, 0x56, 0x42, 0x00]));
    }

    if (studentLunch) {
      client.write(studentLunchReceipt + "\n");
      client.write(Buffer.from([0x1d, 0x56, 0x42, 0x00]));
    }

    if (studentDinner) {
      client.write(studentDinnerReceipt + "\n");
      client.write(Buffer.from([0x1d, 0x56, 0x42, 0x00]));
    }

    // Here we send the long text to the printer
    // ESC/POS commands for text formatting can be added here if necessary
    client.write(receiptText + "\n"); // Send the text to the printer
    client.write(Buffer.from([0x1d, 0x56, 0x42, 0x00])); // Command to cut paper, if needed

    // client.write(receiptText + "\n");
    // client.write(Buffer.from([0x1d, 0x56, 0x42, 0x00]));
    // Close the connection after sending the data
    client.end();
  });

  client.on("data", (data) => {
    console.log("Received data from printer:", data.toString());
  });

  client.on("error", (error) => {
    console.error("Error printing to printer:", error);
  });

  client.on("close", () => {
    console.log("Connection to printer closed");
    reconnect();
  });
}

async function printKitchenReceipt(data) {
  // Check if the data is a string and parse it
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.error("Failed to parse JSON data:", error);
      return;
    }
  }

  if (!data || !Array.isArray(data.cartWithoutImages)) {
    console.error("cartWithoutImages is not an array or is undefined.");
    return; // Exit the function if cartWithoutImages is not valid
  }

  // Filter out the non-printable items
  const orderItems = data.cartWithoutImages.filter((item) => item.printable);

  const orderNum = data.orderNumber;

  const alignCenter = Buffer.from([0x1b, 0x61, 0x01]); // Center text
  const alignLeft = Buffer.from([0x1b, 0x61, 0x00]); // Left align text
  const doubleSizeOn = Buffer.from([0x1d, 0x21, 0x11]);
  const tripleSizeOn = Buffer.from([0x1d, 0x21, 0x22]);
  const doubleSizeOff = Buffer.from([0x1d, 0x21, 0x00]);

  console.log("Printing long text to the printer...");

  const printerPort = 9100; // Common port for HPRT printers
  const printerHost = PRINTER_IP_KITCH; // Your printer's IP

  // Function to pad text for alignment
  function wrapText(text, maxLength) {
    let wrappedText = "";
    while (text.length > maxLength) {
      let lastSpaceIndex = text.lastIndexOf(" ", maxLength);
      if (lastSpaceIndex === -1) {
        lastSpaceIndex = maxLength; // No space found, break at maxLength
      }
      wrappedText += text.substring(0, lastSpaceIndex).trim() + "\n";
      text = text.substring(lastSpaceIndex).trim();
    }
    wrappedText += text;
    return wrappedText;
  }

  function padText(quantity, description, qtyWidth, descWidth) {
    return (
      quantity.padStart(qtyWidth) +
      "                       " +
      description.padEnd(descWidth)
    ); // Add space between Quantity and Description
  }

  // Header with centered text
  let receiptText = "";
  receiptText += alignCenter;
  receiptText += doubleSizeOn; // Turn on double-size mode
  receiptText += "KITCHEN\n";
  receiptText += "\n";
  receiptText += doubleSizeOff;
  receiptText += tripleSizeOn;
  receiptText += `${orderNum}\n`; // Print the order number
  receiptText += doubleSizeOff;
  receiptText += alignLeft;

  // Divider and table header for items
  receiptText += "------------------------------------------------\n";
  receiptText += "   Description                    Quantity\n";
  receiptText += "------------------------------------------------\n";

  // Iterate over filtered printable orderItems
  // Fixed width for description column
  const maxDescriptionWidth = 30; // Adjust based on your receipt width

  for (const item of orderItems) {
    if (!item || typeof item !== "object") {
      console.error("Item is not valid:", item);
      continue;
    }

    // Combine product name and any variants or extra names
    const prodName = `${item.name}${
      item.variantNames && item.extraNeedingNames
        ? ` (${item.variantNames}, ${item.extraNeedingNames})`
        : item.variantNames
        ? ` (${item.variantNames})`
        : item.extraNeedingNames
        ? ` (${item.extraNeedingNames})`
        : ""
    }`;

    // Split the product name if it exceeds the max width
    const descriptionLines = [];
    let currentLine = "";

    for (let i = 0; i < prodName.length; i++) {
      currentLine += prodName[i];
      if (
        currentLine.length >= maxDescriptionWidth ||
        i === prodName.length - 1
      ) {
        descriptionLines.push(currentLine.trim());
        currentLine = "";
      }
    }

    // Print each line of the description
    for (let i = 0; i < descriptionLines.length; i++) {
      if (i === 0) {
        // First line, align the quantity on the same line
        receiptText +=
          descriptionLines[i].padEnd(maxDescriptionWidth, " ") +
          item.quantity.toString().padStart(8) +
          "\n";
        receiptText += "\n";
      } else {
        // Additional lines, just add the description without quantity
        receiptText += descriptionLines[i] + "\n";
      }
    }
  }

  receiptText += "------------------------------------------------\n";

  // Create a socket to connect to the printer
  const client = new net.Socket();

  client.connect(printerPort, printerHost, () => {
    console.log("Connected to printer");

    // Send the long text to the printer
    client.write(receiptText + "\n"); // Send the text to the printer
    client.write(Buffer.from([0x1d, 0x56, 0x42, 0x00])); // Command to cut paper, if needed

    // Close the connection after sending the data
    client.end();
  });

  client.on("data", (data) => {
    console.log("Received data from printer:", data.toString());
  });

  client.on("error", (error) => {
    console.error("Error printing to printer:", error);
  });

  client.on("close", () => {
    console.log("Connection to printer closed");
    reconnect();
  });
}

connectWebSocket();
