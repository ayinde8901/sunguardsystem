
import React, { useEffect, useState } from 'react';
import './InvoicePreview.css';
import log from '../../Assets/icon.png';

import {
  FaPrint,
  FaFileInvoiceDollar
} from 'react-icons/fa';

import formatCurrency from '../../Utils/FormatCurrency';
import formatDate from '../../Utils/FormatDate';

const defaultSettings = {
  businessName: 'Sunguard',
  phone: '09030959063',
  email: 'Sunguardsystem@outlook.com',
  address: '',
  slogan: 'Your Safety. Your Energy. Our Priority.',
  currency: 'NGN',
  bankName: '',
  accountName: '',
  accountNumber: '',
  paymentInstructions: '',
  invoiceDueDays: '7',
  termsAndConditions:
    '1. Prices quoted are subject to the stated validity period.\n2. Any additional work or materials not listed in this document will be charged separately.\n3. Installation commencement is subject to the agreed payment arrangement.\n4. All equipment supplied is subject to the applicable manufacturer warranty.',
  footerMessage:
    'Thank you for choosing Sunguard. We appreciate your business.'
};

function InvoicePreview({ invoice }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = JSON.parse(
          localStorage.getItem('sunguardSettings')
        );

        setSettings({
          ...defaultSettings,
          ...(savedSettings || {})
        });
      } catch (error) {
        setSettings(defaultSettings);
      }
    };

    loadSettings();

    window.addEventListener('storage', loadSettings);
    window.addEventListener('sunguardSettingsUpdated', loadSettings);

    return () => {
      window.removeEventListener('storage', loadSettings);
      window.removeEventListener('sunguardSettingsUpdated', loadSettings);
    };
  }, []);

  const customer = invoice?.customer || {};

  const sections = Array.isArray(invoice?.sections)
    ? invoice.sections
    : [];

  const subtotal = Number(invoice?.subtotal) || 0;

  const discount = Math.min(
    subtotal,
    Math.max(0, Number(invoice?.discount) || 0)
  );

  const grandTotal = Math.max(0, subtotal - discount);

  const paid = Math.min(
    grandTotal,
    Math.max(0, Number(invoice?.amountPaid) || 0)
  );

  const balance = Math.max(0, grandTotal - paid);

  const paymentStatus =
    balance <= 0
      ? 'Paid'
      : paid > 0
        ? 'Partially Paid'
        : 'Unpaid';

  const projectNames = {
    solar: 'Solar Installation',
    cctv: 'CCTV Installation',
    'solar-cctv': 'Solar + CCTV Installation',
    other: 'Other Project'
  };

  const createFileName = () => {
    const clientName = String(customer.name || 'Customer')
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const invoiceNumber = String(
      invoice?.invoiceNumber || 'Invoice'
    )
      .trim()
      .replace(/[^a-zA-Z0-9-]+/g, '-');

    return `${invoiceNumber}_${clientName}_Sunguard-Invoice`;
  };

  const handlePrint = () => {
    const previousTitle = document.title;

    document.title = createFileName();

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);

    window.print();

    window.setTimeout(restoreTitle, 30000);
  };

  const hasBankDetails =
    settings.bankName ||
    settings.accountName ||
    settings.accountNumber ||
    settings.paymentInstructions;

  const terms = String(
    settings.termsAndConditions || ''
  )
    .split('\n')
    .filter((term) => term.trim() !== '');

  const displayDate = (date) => {
    return formatDate(date) || 'Not specified';
  };

  return (
    <div className="invoice-preview-container">

      <div className="invoice-preview-topbar">
        <div>
          <FaFileInvoiceDollar />
          <span>Invoice Preview</span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="invoice-preview-print-button"
        >
          <FaPrint />
          Print / Save PDF
        </button>
      </div>

      <div
        className="invoice-document"
        id="invoice-document"
      >

        <div className="invoice-document-header">

          <div className="invoice-document-brand">
            <img src={log} alt="Sunguard Logo" />

            <div>
              <h1>{settings.businessName}</h1>
              <p>{settings.slogan}</p>
            </div>
          </div>

          <div className="invoice-company-details">
            {settings.address && <p>{settings.address}</p>}
            {settings.phone && <p>Phone: {settings.phone}</p>}
            {settings.email && <p>Email: {settings.email}</p>}
          </div>

        </div>

        <div className="invoice-document-title">
          <h2>INVOICE</h2>
          <p>Professional Installation Services</p>
        </div>

        <div className="invoice-document-meta">

          <div>
            <span>Invoice Number</span>
            <strong>
              {invoice?.invoiceNumber || 'Not yet saved'}
            </strong>
          </div>

          <div>
            <span>Invoice Date</span>
            <strong>{displayDate(invoice?.invoiceDate)}</strong>
          </div>

          <div>
            <span>Due Date</span>
            <strong>{displayDate(invoice?.dueDate)}</strong>
          </div>

        </div>

        <div className="invoice-document-customer">

          <div>
            <h3>BILL TO</h3>
            <h2>{customer.name || 'Customer Name'}</h2>
            <p>{customer.phone || 'Customer Phone'}</p>
            <p>{customer.email || 'Customer Email'}</p>
            <p>{customer.address || 'Customer Address'}</p>
          </div>

          <div>
            <h3>PROJECT DETAILS</h3>
            <h2>{customer.projectTitle || 'Project Title'}</h2>

            <p>
              {projectNames[invoice?.selectedProjectType] || 'Project'}
            </p>

            <p>
              {customer.projectAddress || 'Project Address'}
            </p>
          </div>

        </div>

        <div className="invoice-document-items">

          {sections.map((section, index) => {
            const items = Array.isArray(section.items)
              ? section.items
              : [];

            const sectionTotal = items.reduce(
              (total, item) =>
                total +
                (Number(item.quantity) || 0) *
                (Number(item.unitPrice) || 0),
              0
            );

            return (
              <div
                className="invoice-document-section"
                key={section.id || index}
              >

                <h3>{section.title || 'Items'}</h3>

                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, itemIndex) => {
                      const quantity = Number(item.quantity) || 0;
                      const unitPrice = Number(item.unitPrice) || 0;

                      return (
                        <tr key={item.id || itemIndex}>
                          <td>{item.description || 'Item'}</td>
                          <td>{quantity}</td>
                          <td>{formatCurrency(unitPrice)}</td>
                          <td>
                            {formatCurrency(quantity * unitPrice)}
                          </td>
                        </tr>
                      );
                    })}

                    {items.length === 0 && (
                      <tr>
                        <td colSpan="4">
                          No items in this section.
                        </td>
                      </tr>
                    )}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan="3">Section Subtotal</td>
                      <td>{formatCurrency(sectionTotal)}</td>
                    </tr>
                  </tfoot>
                </table>

              </div>
            );
          })}

        </div>

        <div className="invoice-document-summary">

          <div>
            <span>Overall Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>- {formatCurrency(discount)}</strong>
          </div>

          <div className="invoice-document-grand-total">
            <span>Grand Total</span>
            <strong>{formatCurrency(grandTotal)}</strong>
          </div>

          <div>
            <span>Amount Paid</span>
            <strong>{formatCurrency(paid)}</strong>
          </div>

          <div className="invoice-document-balance">
            <span>Outstanding Balance</span>
            <strong>{formatCurrency(balance)}</strong>
          </div>

          <div className="invoice-document-status">
            <span>Payment Status</span>
            <strong>{paymentStatus}</strong>
          </div>

        </div>

        <div className="invoice-payment-notice">
          <h3>PAYMENT INFORMATION</h3>

          <p>
            Please make payment according to the agreed payment
            arrangement. Kindly use your invoice number as the
            payment reference.
          </p>
        </div>

        {hasBankDetails && (
          <div className="invoice-document-payment-details">
            <h3>BANK ACCOUNT DETAILS</h3>

            {settings.bankName && (
              <p>
                <strong>Bank Name:</strong> {settings.bankName}
              </p>
            )}

            {settings.accountName && (
              <p>
                <strong>Account Name:</strong> {settings.accountName}
              </p>
            )}

            {settings.accountNumber && (
              <p>
                <strong>Account Number:</strong> {settings.accountNumber}
              </p>
            )}

            {settings.paymentInstructions && (
              <p>
                <strong>Payment Instructions:</strong>{' '}
                {settings.paymentInstructions}
              </p>
            )}
          </div>
        )}

        <div className="invoice-document-terms">
          <h3>TERMS AND CONDITIONS</h3>

          {terms.map((term, index) => (
            <p key={index}>{term}</p>
          ))}
        </div>

        <div className="invoice-document-footer">
          <p>{settings.footerMessage}</p>
          <strong>{settings.slogan}</strong>
        </div>

      </div>
    </div>
  );
}

export default InvoicePreview;
