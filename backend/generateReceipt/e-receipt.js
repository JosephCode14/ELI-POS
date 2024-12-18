const generateEmailReceipt = (
  cardNumber,
  studID,
  user,
  date,
  customerName,
  oldBalance,
  topUpAmount,
  newBalance
) => {
  return `
      <div style="border: 1px solid black; width: 80mm;">
        <div style="text-align:center; font-weight: 700;">
          <p style="font-size: 18px; color: #000;">BUON TAVOLO</p>
        </div>
        <div style="text-align:center;">
          <p style="color: #000;">Transaction Slip</p>
        </div>
  
        <div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Card Number:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${cardNumber}</td>
            </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Student ID:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${studID}</td>
            </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Loaded By:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${user}</td>
            </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Date & Time:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${date.toLocaleString()}</td>
            </tr>
          </table>
        </div>
  
        <div style="border-bottom: 2px dashed #000; margin: 1px 8px 8px;"></div>
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 10px; padding-left: 10px; font-weight: 700;">Customer Name</td>
            <td style="text-align: right; padding-right: 10px; padding-left: 10px; font-weight: 700;">Subtotal</td>
          </tr>
        </table>
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 20px; padding-left: 20px;">${customerName}</td>
            <td style="text-align: right; padding-right: 20px; padding-left: 20px;">${topUpAmount}</td>
          </tr>
        </table>
  
        <br/>
  
        <div style="border-bottom: 2px dashed #000; margin: 1px 8px 8px;"></div>
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Initial Balance:</td>
            <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${oldBalance}</td>
          </tr>
        </table>
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Load Amount:</td>
            <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${topUpAmount}</td>
          </tr>
        </table>
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Total Balance:</td>
            <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${newBalance}</td>
          </tr>
        </table>
  
        <br/>
  
        <div style="text-align: center; color: #000;">
          <p style="margin-bottom: 0;">This document is not valid <br/> For claim of input tax</p>
        </div>
  
        <br/>

         <div style="text-align: center; color: #000;">
          <p style="margin-bottom: 0;">ELI IT Solutions 2024</p>
        </div>

        <br/>
  
      </div>
    `;
};

const generateEmailBulkReceipt = (count, total, user, date) => {
  return `
      <div style="border: 1px solid black; width: 80mm;">
        <div style="text-align:center; font-weight: 700;">
          <p style="font-size: 18px; color: #000;">BUON TAVOLO</p>
        </div>
        <div style="text-align:center;">
          <p style="color: #000;">Transaction Slip</p>
        </div>
  
        <div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Card Number:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${count.toString()} cards</td>
            </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Customer ID:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${count.toString()} customers ID</td>
            </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Loaded By:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${user}</td>
            </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Date & Time:</td>
              <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${date.toLocaleString()}</td>
            </tr>
          </table>
        </div>
  
        <div style="border-bottom: 2px dashed #000; margin: 1px 8px 8px;"></div>
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 10px; padding-left: 10px; font-weight: 700;">Customer Name</td>
            <td style="text-align: right; padding-right: 10px; padding-left: 10px; font-weight: 700;">Subtotal</td>
          </tr>
        </table>
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 20px; padding-left: 20px;">${count} customers</td>
            <td style="text-align: right; padding-right: 20px; padding-left: 20px;">${total}</td>
          </tr>
        </table>
  
        <br/>
  
        <div style="border-bottom: 2px dashed #000; margin: 1px 8px 8px;"></div>
  
  
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; padding-right: 10px; padding-left: 10px;">Total Load:</td>
            <td style="text-align: right; padding-right: 10px; padding-left: 10px;">${total}</td>
          </tr>
        </table>
  
       
        <br/>
  
        <div style="text-align: center; color: #000;">
          <p style="margin-bottom: 0;">This document is not valid <br/> For claim of input tax</p>
        </div>
  
        <br/>

         <div style="text-align: center; color: #000;">
          <p style="margin-bottom: 0;">ELI IT Solutions 2024</p>
        </div>

        <br/>
  
      </div>
    `;
};

module.exports = { generateEmailReceipt, generateEmailBulkReceipt };
