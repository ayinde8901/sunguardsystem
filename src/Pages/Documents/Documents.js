
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Documents.css';

import {
  FaFileInvoiceDollar,
  FaEye,
  FaTrash,
  FaFolderOpen,
  FaArrowLeft,
  FaExchangeAlt,
  FaSearch,
  FaFileInvoice,
  FaEdit
} from 'react-icons/fa';

import QuotationPreview from '../../Component/QuotationPreview/QuotationPreview';
import InvoicePreview from '../../Component/InvoicePreview/Invoicepreview';

import formatCurrency from '../../Utils/FormatCurrency';
import formatDate from '../../Utils/FormatDate';

function Documents() {
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // LOAD DOCUMENTS FROM LOCAL STORAGE
  const loadDocuments = () => {
    try {
      const savedQuotations = JSON.parse(
        localStorage.getItem('sunguardQuotations') || '[]'
      );

      const savedInvoices = JSON.parse(
        localStorage.getItem('sunguardInvoices') || '[]'
      );

      setQuotations(
        Array.isArray(savedQuotations) ? savedQuotations : []
      );

      setInvoices(
        Array.isArray(savedInvoices) ? savedInvoices : []
      );
    } catch (error) {
      console.error('Unable to load documents:', error);
      setQuotations([]);
      setInvoices([]);
    }
  };

  // REFRESH DOCUMENTS WHEN THEY CHANGE
  useEffect(() => {
    loadDocuments();

    window.addEventListener('storage', loadDocuments);
    window.addEventListener('sunguardDocumentsUpdated', loadDocuments);

    return () => {
      window.removeEventListener('storage', loadDocuments);
      window.removeEventListener('sunguardDocumentsUpdated', loadDocuments);
    };
  }, []);

  // SWEETALERT DESIGN
  const showSuccess = (title, message) => {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Great!',
      confirmButtonColor: '#263747',
      timer: 2500,
      timerProgressBar: true
    });
  };

  const showDeleteConfirmation = (documentType, documentNumber) => {
    return Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${documentType} ${documentNumber}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d93025',
      cancelButtonColor: '#263747',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    });
  };

  // GET DOCUMENT NUMBER
  const getDocumentNumber = (document) => {
    return document.documentType === 'Invoice'
      ? document.invoiceNumber || 'Invoice not numbered'
      : document.quotationNumber || 'Quotation not numbered';
  };

  // COMBINE DOCUMENTS
  const allDocuments = useMemo(() => {
    const quotationDocuments = quotations.map((quotation) => ({
      ...quotation,
      documentType: 'Quotation'
    }));

    const invoiceDocuments = invoices.map((invoice) => ({
      ...invoice,
      documentType: 'Invoice'
    }));

    return [
      ...quotationDocuments,
      ...invoiceDocuments
    ].sort((a, b) => {
      const dateA = new Date(
        a.createdAt || a.invoiceDate || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.invoiceDate || 0
      ).getTime();

      return dateB - dateA;
    });
  }, [quotations, invoices]);

  // SEARCH AND FILTER
  const filteredDocuments = allDocuments.filter((document) => {
    const customerName = document.customer?.name || '';
    const documentNumber = getDocumentNumber(document);

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(documentNumber).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      document.documentType.toLowerCase() === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // EDIT SAVED QUOTATION
  const handleEditQuotation = (quotation) => {
    try {
      localStorage.setItem(
        'sunguardQuotationEditDraft',
        JSON.stringify(quotation)
      );

      navigate('/quotations');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Unable to Open Quotation',
        text: 'Please try again.',
        confirmButtonColor: '#263747'
      });
    }
  };

  // CONVERT QUOTATION TO INVOICE
  const handleConvertToInvoice = async (quotation) => {
    const result = await Swal.fire({
      title: 'Convert to Invoice?',
      text: `Quotation ${quotation.quotationNumber} will be prepared as an invoice.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#263747',
      cancelButtonColor: '#737d89',
      confirmButtonText: 'Yes, convert it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const invoiceDraft = {
        ...quotation,
        documentType: 'Invoice',
        sourceQuotationNumber: quotation.quotationNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        amountPaid: Number(quotation.amountPaid) || 0
      };

      localStorage.setItem(
        'sunguardInvoiceDraft',
        JSON.stringify(invoiceDraft)
      );

      await Swal.fire({
        icon: 'success',
        title: 'Quotation Converted!',
        text: 'Your invoice is ready. You can now review and save it.',
        confirmButtonColor: '#263747',
        confirmButtonText: 'Continue'
      });

      navigate('/create-invoice');

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Conversion Failed',
        text: 'Something went wrong while preparing the invoice.',
        confirmButtonColor: '#263747'
      });
    }
  };

  // DELETE QUOTATION
  const handleDeleteQuotation = async (quotation) => {
    const result = await showDeleteConfirmation(
      'quotation',
      quotation.quotationNumber
    );

    if (!result.isConfirmed) return;

    try {
      const updatedQuotations = quotations.filter(
        (item) =>
          item.quotationNumber !== quotation.quotationNumber
      );

      localStorage.setItem(
        'sunguardQuotations',
        JSON.stringify(updatedQuotations)
      );

      setQuotations(updatedQuotations);
      setSelectedDocument(null);

      window.dispatchEvent(new Event('sunguardDocumentsUpdated'));

      await showSuccess(
        'Deleted Successfully!',
        'The quotation has been removed from your documents.'
      );

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'The quotation could not be deleted.',
        confirmButtonColor: '#263747'
      });
    }
  };

  // DELETE INVOICE
  const handleDeleteInvoice = async (invoice) => {
    const result = await showDeleteConfirmation(
      'invoice',
      invoice.invoiceNumber
    );

    if (!result.isConfirmed) return;

    try {
      const updatedInvoices = invoices.filter(
        (item) =>
          item.invoiceNumber !== invoice.invoiceNumber
      );

      localStorage.setItem(
        'sunguardInvoices',
        JSON.stringify(updatedInvoices)
      );

      setInvoices(updatedInvoices);
      setSelectedDocument(null);

      window.dispatchEvent(new Event('sunguardDocumentsUpdated'));

      await showSuccess(
        'Deleted Successfully!',
        'The invoice has been removed from your documents.'
      );

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'The invoice could not be deleted.',
        confirmButtonColor: '#263747'
      });
    }
  };

  // VIEW SELECTED DOCUMENT
  if (selectedDocument) {
    const document = selectedDocument;
    const isInvoice = document.documentType === 'Invoice';

    return (
      <div className="documents-page">

        <button
          type="button"
          className="documents-back-button"
          onClick={() => setSelectedDocument(null)}
        >
          <FaArrowLeft />
          Back to Documents
        </button>

        {isInvoice ? (
          <InvoicePreview invoice={document} />
        ) : (
          <>
            <QuotationPreview
              quotationNumber={document.quotationNumber}
              customer={document.customer}
              selectedProjectType={document.selectedProjectType}
              sections={document.sections}
              subtotal={document.subtotal}
              discount={document.discount}
              amountPaid={document.amountPaid}
            />

            <button
              type="button"
              className="documents-view-button"
              onClick={() => handleEditQuotation(document)}
              title="Edit quotation"
            >
              <FaEdit />
              Edit Quotation
            </button>

            <button
              type="button"
              className="documents-convert-button"
              onClick={() => handleConvertToInvoice(document)}
            >
              <FaExchangeAlt />
              Convert to Invoice
            </button>
          </>
        )}

      </div>
    );
  }

  // TOTAL VALUES
  const quotationValue = quotations.reduce(
    (total, item) => total + (Number(item.grandTotal) || 0),
    0
  );

  const invoiceValue = invoices.reduce(
    (total, item) => total + (Number(item.grandTotal) || 0),
    0
  );

  return (
    <div className="documents-page">

      {/* PAGE HEADING */}
      <div className="documents-heading">

        <div className="documents-heading-icon">
          <FaFolderOpen />
        </div>

        <div>
          <span>SUNGUARD DOCUMENT MANAGEMENT</span>
          <h1>My Documents</h1>
          <p>
            Manage your saved quotations and invoices in one place.
          </p>
        </div>

      </div>

      {/* DOCUMENT STATISTICS */}
      <div className="documents-stats">

        <div className="documents-stat-card">
          <FaFileInvoiceDollar />
          <div>
            <span>Total Quotations</span>
            <h2>{quotations.length}</h2>
            <small>{formatCurrency(quotationValue)}</small>
          </div>
        </div>

        <div className="documents-stat-card">
          <FaFileInvoice />
          <div>
            <span>Total Invoices</span>
            <h2>{invoices.length}</h2>
            <small>{formatCurrency(invoiceValue)}</small>
          </div>
        </div>

        <div className="documents-stat-card">
          <FaFolderOpen />
          <div>
            <span>All Documents</span>
            <h2>{quotations.length + invoices.length}</h2>
            <small>Saved business documents</small>
          </div>
        </div>

      </div>

      {/* DOCUMENT LIST */}
      <div className="documents-list-container">

        <div className="documents-list-heading">
          <div>
            <h2>Document Records</h2>
            <p>
              View and manage your saved business documents.
            </p>
          </div>

          <span>{filteredDocuments.length} Documents</span>
        </div>

        {/* SEARCH */}
        <div className="documents-toolbar">

          <div className="documents-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search customer or document number..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {/* FILTER BUTTONS */}
          <div className="documents-filters">

            <button
              type="button"
              className={activeFilter === 'all' ? 'active' : ''}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>

            <button
              type="button"
              className={activeFilter === 'quotation' ? 'active' : ''}
              onClick={() => setActiveFilter('quotation')}
            >
              Quotations
            </button>

            <button
              type="button"
              className={activeFilter === 'invoice' ? 'active' : ''}
              onClick={() => setActiveFilter('invoice')}
            >
              Invoices
            </button>

          </div>

        </div>

        {/* EMPTY STATE */}
        {filteredDocuments.length === 0 ? (

          <div className="documents-empty">
            <FaFolderOpen />

            <h3>No Documents Found</h3>

            <p>
              {allDocuments.length === 0
                ? 'Your saved quotations and invoices will appear here. Create your first quotation to get started.'
                : 'No documents match your search. Try another search or filter.'}
            </p>

            {allDocuments.length === 0 && (
              <button
                type="button"
                className="documents-create-button"
                onClick={() => navigate('/quotations')}
              >
                Create Quotation
              </button>
            )}
          </div>

        ) : (

          <div className="documents-table-wrapper">

            <table className="documents-table">

              <thead>
                <tr>
                  <th>Document Number</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Grand Total</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((document, index) => {
                  const isInvoice = document.documentType === 'Invoice';

                  return (
                    <tr
                      key={`${document.documentType}-${getDocumentNumber(document)}-${index}`}
                    >

                      <td>
                        <strong>
                          {getDocumentNumber(document)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`documents-type-badge ${
                            isInvoice ? 'invoice-badge' : 'quotation-badge'
                          }`}
                        >
                          {document.documentType}
                        </span>
                      </td>

                      <td>
                        {document.customer?.name || 'Unknown Customer'}
                      </td>

                      <td>
                        {formatDate(
                          isInvoice
                            ? document.invoiceDate || document.createdAt
                            : document.createdAt
                        ) || 'N/A'}
                      </td>

                      <td>
                        {formatCurrency(document.grandTotal)}
                      </td>

                      <td>
                        {formatCurrency(document.outstandingBalance)}
                      </td>

                      <td>
                        <div className="documents-actions">

                          {/* VIEW DOCUMENT */}
                          <button
                            type="button"
                            className="documents-view-button"
                            onClick={() => setSelectedDocument(document)}
                            title="View document"
                          >
                            <FaEye />
                          </button>

                          {/* EDIT QUOTATION */}
                          {!isInvoice && (
                            <button
                              type="button"
                              className="documents-view-button"
                              onClick={() => handleEditQuotation(document)}
                              title="Edit quotation"
                            >
                              <FaEdit />
                            </button>
                          )}

                          {/* CONVERT QUOTATION */}
                          {!isInvoice && (
                            <button
                              type="button"
                              className="documents-view-button"
                              onClick={() => handleConvertToInvoice(document)}
                              title="Convert to invoice"
                            >
                              <FaExchangeAlt />
                            </button>
                          )}

                          {/* DELETE DOCUMENT */}
                          <button
                            type="button"
                            className="documents-delete-button"
                            onClick={() =>
                              isInvoice
                                ? handleDeleteInvoice(document)
                                : handleDeleteQuotation(document)
                            }
                            title="Delete document"
                          >
                            <FaTrash />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Documents;
