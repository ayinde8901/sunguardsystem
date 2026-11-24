
import React from 'react';
import './QuotationSummary.css';

import {
  FaCalculator,
  FaPercentage,
  FaWallet,
  FaMoneyBillWave,
  FaFileInvoiceDollar
} from 'react-icons/fa';

import formatCurrency from '../../Utils/FormatCurrency';

function QuotationSummary({
  subtotal = 0,
  discount = 0,
  setDiscount,
  amountPaid = 0,
  setAmountPaid
}) {
  const overallSubtotal = Math.max(0, Number(subtotal) || 0);

  const discountValue = Math.min(
    overallSubtotal,
    Math.max(0, Number(discount) || 0)
  );

  const grandTotal = overallSubtotal - discountValue;

  const paidValue = Math.min(
    grandTotal,
    Math.max(0, Number(amountPaid) || 0)
  );

  const outstandingBalance = grandTotal - paidValue;

  return (
    <section className="quotation-summary">

      <div className="summary-header">
        <div className="summary-header-icon">
          <FaFileInvoiceDollar />
        </div>

        <div>
          <span>FINAL CALCULATION</span>
          <h2>Quotation Summary</h2>
          <p>Review the final cost and payment details.</p>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-row-label">
          <FaCalculator />
          <span>Overall Subtotal</span>
        </div>

        <strong>{formatCurrency(overallSubtotal)}</strong>
      </div>

      <div className="summary-input-row">
        <label htmlFor="quotation-discount">
          <FaPercentage />
          Discount (₦)
        </label>

        <input
          id="quotation-discount"
          type="number"
          min="0"
          max={overallSubtotal}
          step="0.01"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="Enter discount amount"
        />
      </div>

      <div className="summary-grand-total">
        <span>GRAND TOTAL</span>
        <strong>{formatCurrency(grandTotal)}</strong>
      </div>

      <div className="summary-input-row">
        <label htmlFor="quotation-amount-paid">
          <FaWallet />
          Deposit / Amount Paid (₦)
        </label>

        <input
          id="quotation-amount-paid"
          type="number"
          min="0"
          max={grandTotal}
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder="Enter amount paid"
        />
      </div>

      <div className="summary-balance">
        <div className="summary-balance-label">
          <FaMoneyBillWave />
          <span>Outstanding Balance</span>
        </div>

        <strong>{formatCurrency(outstandingBalance)}</strong>
      </div>

      <p className="summary-note">
        All amounts are calculated automatically from your
        quotation sections and payment entries.
      </p>

    </section>
  );
}

export default QuotationSummary;
