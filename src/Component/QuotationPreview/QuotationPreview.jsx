import React, { useEffect, useState } from 'react';
import './QuotationPreview.css';
import log from '../../Assets/icon.png';

import formatCurrency from '../../Utils/FormatCurrency';
import formatDate from '../../Utils/FormatDate';

import {
  FaPrint,
  FaFileInvoiceDollar
} from 'react-icons/fa';

const defaultSettings = {
  businessName: 'Sunguard',
  phone: '09030959063',
  email: 'Sunguardsystem@outlook.com',
  address: '',
  slogan: 'Your Safety. Your Energy. Our Priority.',
  quotationValidity: '14',
  bankName: '',
  accountName: '',
  accountNumber: '',
  paymentInstructions: '',
  termsAndConditions: '',
  footerMessage: 'Thank you for choosing Sunguard. We appreciate your business.'
};

function QuotationPreview({
  quotationNumber,
  customer,
  selectedProjectType,
  sections = [],
  subtotal,
  discount,
  amountPaid
}) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('sunguardSettings');

        setSettings(savedSettings
          ? { ...defaultSettings, ...JSON.parse(savedSettings) }
          : defaultSettings
        );
      } catch (error) {
        console.error('Unable to load business settings:', error);
        setSettings(defaultSettings);
      }
    };

    loadSettings();

    window.addEventListener('storage', loadSettings);

    return () => {
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  const safeSubtotal = Number(subtotal) || 0;

  const safeDiscount = Math.min(
    safeSubtotal,
    Math.max(0, Number(discount) || 0)
  );

  const grandTotal = safeSubtotal - safeDiscount;

  const paid = Math.min(
    grandTotal,
    Math.max(0, Number(amountPaid) || 0)
  );

  const balance = grandTotal - paid;

  const validityDays = Number(settings.quotationValidity) || 14;

  const projectNames = {
    solar: 'Solar Installation',
    cctv: 'CCTV Installation',
    'solar-cctv': 'Solar + CCTV Installation',
    other: 'Other Project'
  };

  const terms = String(settings.termsAndConditions || '')
    .split('\n')
    .filter((term) => term.trim() !== '');

  const hasBankDetails =
    settings.bankName ||
    settings.accountName ||
    settings.accountNumber ||
    settings.paymentInstructions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="quotation-preview-container">

      <div className="preview-topbar">
        <div>
          <FaFileInvoiceDollar />
          <span>Quotation Preview</span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="preview-print-button"
        >
          <FaPrint />
          Print / Save PDF
        </button>
      </div>

      <div
        className="quotation-document"
        id="quotation-document"
      >

        {/* COMPANY HEADER */}
        <div className="document-header">

          <div className="document-brand">
            <img src={log} alt={`${settings.businessName} Logo`} />

            <div>
              <h1>{settings.businessName}</h1>
              <p>{settings.slogan}</p>
            </div>
          </div>

          <div className="document-company-details">
            {settings.address && <p>{settings.address}</p>}
            <p>Phone: {settings.phone}</p>
            <p>Email: {settings.email}</p>
          </div>

        </div>

        {/* DOCUMENT TITLE */}
        <div className="document-title">
          <h2>QUOTATION</h2>
          <p>Professional Installation Services</p>
        </div>

        {/* DOCUMENT INFORMATION */}
        <div className="document-meta">

          <div>
            <span>Quotation Number</span>
            <strong>
              {quotationNumber || 'Will be generated when saved'}
            </strong>
          </div>

          <div>
            <span>Issue Date</span>
            <strong>{formatDate(new Date())}</strong>
          </div>

          <div>
            <span>Valid For</span>
            <strong>{validityDays} Days</strong>
          </div>

        </div>

        {/* CUSTOMER AND PROJECT DETAILS */}
        <div className="document-customer">

          <div>
            <h3>QUOTATION FOR</h3>
            <h2>{customer?.name || 'Customer Name'}</h2>
            <p>{customer?.phone || 'Customer Phone'}</p>
            <p>{customer?.email || 'Customer Email'}</p>
            <p>{customer?.address || 'Customer Address'}</p>
          </div>

          <div>
            <h3>PROJECT DETAILS</h3>
            <h2>{customer?.projectTitle || 'Project Title'}</h2>
            <p>{projectNames[selectedProjectType] || 'Project'}</p>
            <p>{customer?.projectAddress || 'Project Address'}</p>
          </div>

        </div>

        {/* QUOTATION ITEMS */}
        <div className="document-items">

          {sections.map((section) => {
            const items = Array.isArray(section.items)
              ? section.items
              : [];

            const sectionTotal = items.reduce(
              (total, item) =>
                total +
                Number(item.quantity || 0) *
                Number(item.unitPrice || 0),
              0
            );

            return (
              <div className="document-section" key={section.id}>
                <h3>{section.title}</h3>

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
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description || 'Item'}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>
                          {formatCurrency(
                            Number(item.quantity || 0) *
                            Number(item.unitPrice || 0)
                          )}
                        </td>
                      </tr>
                    ))}

                    {items.length === 0 && (
                      <tr>
                        <td colSpan="4">
                          No items added to this section.
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

        {/* FINANCIAL SUMMARY */}
        <div className="document-summary">

          <div>
            <span>Overall Subtotal</span>
            <strong>{formatCurrency(safeSubtotal)}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>- {formatCurrency(safeDiscount)}</strong>
          </div>

          <div className="document-grand-total">
            <span>Grand Total</span>
            <strong>{formatCurrency(grandTotal)}</strong>
          </div>

          <div>
            <span>Amount Paid</span>
            <strong>{formatCurrency(paid)}</strong>
          </div>

          <div className="document-balance">
            <span>Outstanding Balance</span>
            <strong>{formatCurrency(balance)}</strong>
          </div>

        </div>

        {/* BANK AND PAYMENT DETAILS */}
        {hasBankDetails && (
          <div className="document-payment-details">
            <h3>PAYMENT DETAILS</h3>

            {settings.bankName && (
              <p><strong>Bank Name:</strong> {settings.bankName}</p>
            )}

            {settings.accountName && (
              <p><strong>Account Name:</strong> {settings.accountName}</p>
            )}

            {settings.accountNumber && (
              <p><strong>Account Number:</strong> {settings.accountNumber}</p>
            )}

            {settings.paymentInstructions && (
              <p className="payment-instructions">
                <strong>Payment Instructions:</strong><br />
                {settings.paymentInstructions}
              </p>
            )}
          </div>
        )}

        {/* TERMS AND CONDITIONS */}
        <div className="document-terms">
          <h3>TERMS AND CONDITIONS</h3>

          {terms.length > 0 ? (
            terms.map((term, index) => (
              <p key={index}>{term}</p>
            ))
          ) : (
            <p>Terms and conditions will be provided where applicable.</p>
          )}
        </div>

        {/* DOCUMENT FOOTER */}
        <div className="document-footer">
          <p>{settings.footerMessage}</p>
          <strong>{settings.slogan}</strong>
        </div>

      </div>
    </div>
  );
}

export default QuotationPreview;
