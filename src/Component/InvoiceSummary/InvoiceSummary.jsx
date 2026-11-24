
import React from 'react';
import './InvoiceSummary.css';

import formatCurrency from '../../Utils/FormatCurrency';

function InvoiceSummary({
  subtotal,
  discount,
  grandTotal,
  amountPaid,
  setAmountPaid,
  balance
}) {
  return (
    <div className="invoice-summary-card">
      <div className="invoice-summary-heading">
        <h2>Invoice Summary</h2>
        <p>Review the invoice payment breakdown.</p>
      </div>

      <div className="invoice-summary-row">
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>

      <div className="invoice-summary-row">
        <span>Discount</span>
        <strong className="invoice-discount">
          - {formatCurrency(discount)}
        </strong>
      </div>

      <div className="invoice-summary-total">
        <span>Grand Total</span>
        <strong>{formatCurrency(grandTotal)}</strong>
      </div>

      <div className="invoice-summary-payment">
        <label htmlFor="invoice-amount-paid">
          Amount Paid (₦)
        </label>

        <input
          id="invoice-amount-paid"
          type="number"
          min="0"
          max={grandTotal}
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder="Enter amount paid"
        />
      </div>

      <div className="invoice-summary-balance">
        <span>Outstanding Balance</span>
        <strong>{formatCurrency(balance)}</strong>
      </div>
    </div>
  );
}

export default InvoiceSummary;
