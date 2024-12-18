import React, { useState } from "react";
import customerDisplay from "../../assets/icon/customer-display.jpg";
import "../styles/customer-display.css";
const CustomerDisplay = () => {
  const [orders, setOrders] = useState([
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
    {
      qty: 2,
      item: "CHICKEN WINGS",
      price: 200,
      total: 400,
    },
  ]);
  return (
    <>
      <div className="customer-display-container">
        <header>
          <div className="title-container">
            <h2>
              <span className="blue">POS</span>{" "}
              <span className="orange">WITH</span>{" "}
              <span className="green">RFID</span>
            </h2>
          </div>
        </header>
        <div className="customer-main-screen d-flex p-0">
          <div className="customer-img-container">
            <img src={customerDisplay} />
          </div>
          <div className="customer-receipt-container">
            <div className="customer-welcome-container">
              <p>Welcome to this Shop</p>
            </div>

            <div className="customer-order-container">
              <table>
                <thead>
                  <tr>
                    <th>QTY</th>
                    <th>ITEM NAME</th>
                    <th>PRICE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr>
                      <td>{order.qty}x</td>
                      <td>{order.item}</td>
                      <td>{order.price}</td>
                      <td>{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="customer-payment-details">
              <h3 className="title-details">PAYMENT DETAILS</h3>
              <div className="all-payment-details">
                <div>
                  <h3>Subtotal</h3>
                  <h3>₱ 1000.0</h3>
                </div>
                <div>
                  <h3>Discount</h3>
                  <h3>₱ 50.0</h3>
                </div>
                <div>
                  <h3>Payable</h3>
                  <h3>₱ 1000.0</h3>
                </div>
                <div>
                  <h3>Received</h3>
                  <h3 className="received">₱ 1000.0</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="customer-total-order">
          <div className="total-order">
            <h1>Total Order: </h1>
            <h1>1100.00</h1>
          </div>
          <div className="customer-change">
            <h2>Change: </h2>
            <h1>50.00</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDisplay;
