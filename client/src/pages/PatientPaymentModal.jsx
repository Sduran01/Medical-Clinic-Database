import React, { useState } from 'react';
import './PatientPaymentModal.css'; // Ensure to style the modal

const PaymentModal = ({ show, onClose, onConfirm, title, children }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    console.log('here is theamount', amount)
    const paymentInfo = {
      cardNumber,
      expiryDate,
      cvv,
      amountPayed:amount
    };
    onConfirm(paymentInfo);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        {children}
        <div className="modal-body">
         

          <label>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />

          <label>Exp Date</label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <label>CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
          />
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Submit Payment</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;