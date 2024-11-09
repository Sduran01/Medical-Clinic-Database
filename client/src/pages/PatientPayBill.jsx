import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientPayBill.css'; // Ensure you have styles if needed
import PaymentModal from './PatientPaymentModal'; // Import the modal component

export default function PatientPayBill({ medicalId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/patient/${medicalId}/pay_bill`);
        console.log('invoices', response.data)
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to retrieve invoices. Please try again later.');
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [medicalId]);

  const handleShowModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handlePayment = async (paymentInfo) => {
    try {
      const amountPayed = parseFloat(paymentInfo.amountPayed)
      const amountDue = selectedInvoice.amountDue
      const response = await axios.post(`http://localhost:3000/patient/pay_invoice`, {
        invoiceId: selectedInvoice.InvoiceID,
        amountPayed: paymentInfo.amountPayed, // Include payment details
        amountDue: selectedInvoice.amountDue
      });
      console.log('invoices',invoices)

      if (response.status === 200 && amountPayed == amountDue) {
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice.InvoiceID !== selectedInvoice.InvoiceID)
        
        );
        
      } else {
        const newAmountDue = amountDue - amountPayed
        setInvoices((prevInvoices) =>
            prevInvoices.map((invoice) =>
              invoice.InvoiceID === selectedInvoice.InvoiceID
                ? { ...invoice, amountDue: newAmountDue }
                : invoice
            )
          );
            
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentStatus('Payment failed. Please try again.');
    } finally {
      handleCloseModal();
    }
  };

  return (
    <div className="patient-pay-bill">
      <h2>Outstanding Invoices</h2>
      {loading ? (
        <p>Loading invoices...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : invoices.length === 0 ? (
        <p>No outstanding invoices.</p>
      ) : (
        invoices.map((invoice) => (
          <div key={invoice.InvoiceID} className={`invoice-card ${invoice.is_overdue ? 'overdue' : ''}`}>
            <h3>Invoice #{invoice.InvoiceID}</h3>
            <p><strong>Date of Issue:</strong> {new Date(invoice.created).toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> ${invoice.amountDue.toFixed(2)}</p>
            <p><strong>Due Date:</strong> {new Date(new Date(invoice.created).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            <p><strong>Appointment Date:</strong> {invoice.appointmentDateTime ? new Date(invoice.appointmentDateTime).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Doctor:</strong> {invoice.doctor || 'N/A'}</p>
            <p><strong>Facility:</strong> {invoice.officeID || 'N/A'}</p>
            <p><strong>Status:</strong><span className="status-label">{invoice.is_overdue ? 'Overdue' : 'Pending'}</span></p>
            <button onClick={() => handleShowModal(invoice)}>
              Pay Invoice
            </button>
          </div>
        ))
      )}
      {paymentStatus && <p className="payment-status">{paymentStatus}</p>}

      {showModal && selectedInvoice && (
        <PaymentModal
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={handlePayment}
          title="Enter Payment Information"
        >
          <p>Invoice #{selectedInvoice.InvoiceID}</p>
          <p>Amount Due: ${selectedInvoice.amountDue.toFixed(2)}</p>
        </PaymentModal>
      )}
    </div>
  );
}