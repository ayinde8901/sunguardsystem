
import React from 'react';

import InvoicePreview from '../InvoicePreview/Invoicepreview';
import QuotationPreview from '../QuotationPreview/QuotationPreview';

function DocumentPreview({
  type,
  invoice,
  quotation
}) {
  if (type === 'invoice') {
    if (!invoice) {
      return <p>No invoice data available.</p>;
    }

    return <InvoicePreview invoice={invoice} />;
  }

  if (type === 'quotation') {
    if (!quotation) {
      return <p>No quotation data available.</p>;
    }

    return (
      <QuotationPreview
        quotationNumber={quotation.quotationNumber}
        customer={quotation.customer}
        selectedProjectType={quotation.selectedProjectType}
        sections={quotation.sections}
        subtotal={quotation.subtotal}
        discount={quotation.discount}
        amountPaid={quotation.amountPaid}
      />
    );
  }

  return <p>Select an invoice or quotation to preview.</p>;
}

export default DocumentPreview;
