import React, { useState } from "react";
import { useWebSocket } from "../../../contexts/WebSocketProvider";
import { Button, Modal, Form } from "react-bootstrap";

const PrinterStatusModal = ({ connectionModal, setConnectionModal }) => {
  const { kioskPrinter, kitchenPrinter, printerCount } = useWebSocket();

  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const printers = [
    { name: "Kiosk Printer", status: kioskPrinter ? "Active" : "Inactive" },
    { name: "Kitchen Printer", status: kitchenPrinter ? "Active" : "Inactive" },
  ];

  const filteredData =
    selectedStatus === "All Status"
      ? printers
      : printers.filter((printer) => printer.status === selectedStatus);

  return (
    <>
      <Modal show={connectionModal} onHide={() => setConnectionModal(false)}>
        <Modal.Header>
          <h2> Printers Connection Status</h2>
        </Modal.Header>
        <Modal.Body className="py-3 px-0">
          <Form.Group>
            <Form.Select
              style={{
                height: "40px",
                fontSize: "14px",
                marginBottom: "8px",
              }}
              className="category-dropdown-select"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>

          <div className="overflow-auto h-100 boxshadow">
            <table className="custom-table dash-table">
              <thead>
                <tr className="table-header-bg">
                  <th>Status</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((printer, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex p-0">
                        <div
                          className="rounded-circle me-1"
                          style={{
                            marginTop: "6px",
                            width: "10px",
                            height: "10px",
                            background:
                              printer.status === "Active" ? "#9ACD32" : "red",
                          }}
                        ></div>
                        {printer.status}
                      </div>
                    </td>
                    <td>{printer.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setConnectionModal(false);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      ;
    </>
  );
};

export default PrinterStatusModal;
