
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateInvoice.css';

import {
  FaFileInvoiceDollar,
  FaArrowLeft,
  FaSave
} from 'react-icons/fa';

import DocumentPreview from '../../Component/DocumentPreview/DocumentPreview';
import InvoiceSummary from '../../Component/InvoiceSummary/InvoiceSummary';

function CreateInvoice() {
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(() => {
    try {
      const savedDraft = JSON.parse(
        localStorage.getItem('sunguardInvoiceDraft') || 'null'
      );

      return savedDraft || null;
    } catch (error) {
      return null;
    }
  });

  const [savedMessage, setSavedMessage] = useState('');

  const [dueDate, setDueDate] = useState(
    invoice?.dueDate || ''
  );

  const [amountPaid, setAmountPaid] = useState(
    Number(invoice?.amountPaid) || 0
  );

  const subtotal = Number(invoice?.subtotal) || 0;

  const discount = Math.min(
    subtotal,
    Math.max(0, Number(invoice?.discount) || 0)
  );

  const grandTotal = Math.max(0, subtotal - discount);

  const paid = Math.min(
    grandTotal,
    Math.max(0, Number(amountPaid) || 0)
  );

  const balance = grandTotal - paid;

  const handleSaveInvoice = () => {
    if (!invoice) return;

    let invoiceList = [];

    try {
      const existingInvoices = JSON.parse(
        localStorage.getItem('sunguardInvoices') || '[]'
      );

      invoiceList = Array.isArray(existingInvoices)
        ? existingInvoices
        : [];
    } catch (error) {
      invoiceList = [];
    }

    let invoiceNumber = invoice.invoiceNumber;

    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const prefix = `SG-INV-${year}-`;

      const highestNumber = invoiceList.reduce((highest, item) => {
        const number = String(item.invoiceNumber || '');

        if (!number.startsWith(prefix)) return highest;

        const serial = Number(number.slice(prefix.length));

        return Number.isFinite(serial)
          ? Math.max(highest, serial)
          : highest;
      }, 0);

      invoiceNumber = `${prefix}${String(highestNumber + 1).padStart(3, '0')}`;
    }

    const savedInvoice = {
      ...invoice,
      documentType: 'Invoice',
      invoiceNumber,
      invoiceDate:
        invoice.invoiceDate ||
        new Date().toISOString().split('T')[0],
      dueDate,
      amountPaid: paid,
      outstandingBalance: balance,
      grandTotal
    };

    const updatedInvoices = [
      ...invoiceList.filter(
        (item) => item.invoiceNumber !== invoiceNumber
      ),
      savedInvoice
    ];

    try {
      localStorage.setItem(
        'sunguardInvoices',
        JSON.stringify(updatedInvoices)
      );

      // Notify Dashboard and Documents pages
      window.dispatchEvent(
        new Event('sunguardDocumentsUpdated')
      );

      setInvoice(savedInvoice);

      setSavedMessage(
        `Invoice ${invoiceNumber} saved successfully.`
      );
    } catch (error) {
      setSavedMessage('');

      alert('Unable to save invoice. Please try again.');
    }
  };

  if (!invoice) {
    return (
      <div className="create-invoice-page">
        <div className="invoice-empty">
          <div className="invoice-empty-icon">
            <FaFileInvoiceDollar />
          </div>

          <h2>No Invoice Draft Found</h2>

          <p>
            Open Documents, select a saved quotation, and click
            Convert to Invoice to get started.
          </p>

          <button
            type="button"
            onClick={() => navigate('/documents')}
          >
            <FaArrowLeft />
            <span>Go to Documents</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-invoice-page">

      {/* PAGE HEADING */}

      <div className="create-invoice-heading">
        <div className="create-invoice-heading-icon">
          <FaFileInvoiceDollar />
        </div>

        <div className="create-invoice-heading-content">
          <span>SUNGUARD DOCUMENT MANAGEMENT</span>

          <h1>Create Invoice</h1>

          <p>
            Review your converted quotation and prepare your invoice.
          </p>
        </div>
      </div>

      {/* SOURCE QUOTATION */}

      <div className="invoice-source-card">
        <div>
          <strong>Converted from quotation</strong>

          <span>
            {invoice.sourceQuotationNumber || invoice.quotationNumber}
          </span>
        </div>
      </div>

      {/* INVOICE DETAILS */}

      <div className="invoice-details-card">
        <h2>Invoice Details</h2>

        <div className="invoice-fields">

          <div className="invoice-field">
            <label>Invoice Number</label>

            <input
              type="text"
              value={invoice.invoiceNumber || 'Generated when saved'}
              readOnly
            />
          </div>

          <div className="invoice-field">
            <label>Invoice Date</label>

            <input
              type="date"
              value={invoice.invoiceDate || ''}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  invoiceDate: e.target.value
                })
              }
            />
          </div>

          <div className="invoice-field">
            <label>Due Date</label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* CUSTOMER INFORMATION */}

      <div className="invoice-details-card">
        <h2>Customer Information</h2>

        <div className="invoice-customer-info">

          <p>
            <strong>Customer:</strong>{' '}
            {invoice.customer?.name || 'Not provided'}
          </p>

          <p>
            <strong>Phone:</strong>{' '}
            {invoice.customer?.phone || 'Not provided'}
          </p>

          <p>
            <strong>Email:</strong>{' '}
            {invoice.customer?.email || 'Not provided'}
          </p>

          <p>
            <strong>Project:</strong>{' '}
            {invoice.customer?.projectTitle || 'Not provided'}
          </p>

        </div>
      </div>

      {/* INVOICE SUMMARY */}

      <InvoiceSummary
        subtotal={subtotal}
        discount={discount}
        grandTotal={grandTotal}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        balance={balance}
      />

      {/* ACTION BUTTONS */}

      <div className="invoice-actions">

        <button
          type="button"
          className="invoice-save-button"
          onClick={handleSaveInvoice}
        >
          <FaSave />
          <span>Save Invoice</span>
        </button>

        <button
          type="button"
          className="invoice-back-button"
          onClick={() => navigate('/documents')}
        >
          <FaArrowLeft />
          <span>Back to Documents</span>
        </button>

      </div>

      {/* SAVE MESSAGE */}

      {savedMessage && (
        <p className="invoice-saved-message">
          {savedMessage}
        </p>
      )}

      {/* FULL INVOICE PREVIEW */}

      <DocumentPreview
        type="invoice"
        invoice={{
          ...invoice,
          dueDate,
          amountPaid: paid,
          grandTotal,
          outstandingBalance: balance
        }}
      />

    </div>
  );
}

export default CreateInvoice;
