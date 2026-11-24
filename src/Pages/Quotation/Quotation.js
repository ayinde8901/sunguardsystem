
import React, { useEffect, useState } from 'react';
import './Quotation.css';

import {
  FaPlus,
  FaFileInvoiceDollar,
  FaLayerGroup,
  FaSave
} from 'react-icons/fa';

import CustomerForm from '../../Component/CustomerForm/CustomerForm';
import PhaseSelector from '../../Component/PhaseSelector/PhaseSelector';
import PhaseSection from '../../Component/PhaseSection/PhaseSection';
import QuotationSummary from '../../Component/QuotationSummary/QuotationSummary';
import DocumentPreview from '../../Component/DocumentPreview/DocumentPreview';

function Quotation() {
  // CUSTOMER INFORMATION
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    projectTitle: '',
    projectAddress: ''
  });

  // PROJECT TYPE
  const [selectedProjectType, setSelectedProjectType] =
    useState('solar');

  // DISCOUNT AND PAYMENT
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  // QUOTATION NUMBER AND SAVE MESSAGE
  const [quotationNumber, setQuotationNumber] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // QUOTATION SECTIONS
  const [sections, setSections] = useState([
    {
      id: Date.now(),
      title: 'Solar Equipment',
      items: []
    }
  ]);

  // LOAD A SAVED QUOTATION WHEN EDIT IS SELECTED
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('sunguardQuotationEditDraft');

      if (!savedDraft) return;

      const quotationToEdit = JSON.parse(savedDraft);

      if (!quotationToEdit || !quotationToEdit.quotationNumber) {
        localStorage.removeItem('sunguardQuotationEditDraft');
        return;
      }

      setCustomer(quotationToEdit.customer || {
        name: '',
        phone: '',
        email: '',
        address: '',
        projectTitle: '',
        projectAddress: ''
      });

      setSelectedProjectType(quotationToEdit.selectedProjectType || 'solar');
      setDiscount(Number(quotationToEdit.discount) || 0);
      setAmountPaid(Number(quotationToEdit.amountPaid) || 0);
      setQuotationNumber(quotationToEdit.quotationNumber);

      setSections(
        Array.isArray(quotationToEdit.sections) &&
        quotationToEdit.sections.length > 0
          ? quotationToEdit.sections
          : [{ id: Date.now(), title: 'Equipment', items: [] }]
      );

      setIsEditing(true);
      setSavedMessage(`Editing ${quotationToEdit.quotationNumber}`);
      localStorage.removeItem('sunguardQuotationEditDraft');
    } catch (error) {
      console.error('Unable to load quotation for editing:', error);
      localStorage.removeItem('sunguardQuotationEditDraft');
      alert('Unable to open this quotation for editing. Please try again.');
    }
  }, []);

  // ADD NEW SECTION
  const addSection = () => {
    const newSection = {
      id: `${Date.now()}-${Math.random()}`,
      title: 'New Section',
      items: []
    };

    setSections((previousSections) => [
      ...previousSections,
      newSection
    ]);
  };

  // UPDATE SECTION TITLE
  const updateSectionTitle = (id, newTitle) => {
    setSections((previousSections) =>
      previousSections.map((section) =>
        section.id === id
          ? { ...section, title: newTitle }
          : section
      )
    );
  };

  // UPDATE SECTION ITEMS
  const updateSectionItems = (id, update) => {
    setSections((previousSections) =>
      previousSections.map((section) => {
        if (section.id !== id) {
          return section;
        }

        const updatedItems =
          typeof update === 'function'
            ? update(
                Array.isArray(section.items)
                  ? section.items
                  : []
              )
            : update;

        return {
          ...section,
          items: Array.isArray(updatedItems)
            ? updatedItems
            : []
        };
      })
    );
  };

  // REMOVE SECTION
  const removeSection = (id) => {
    setSections((previousSections) =>
      previousSections.filter(
        (section) => section.id !== id
      )
    );
  };

  // CALCULATE OVERALL SUBTOTAL
  const grandSubtotal = sections.reduce(
    (total, section) => {
      const sectionItems = Array.isArray(section.items)
        ? section.items
        : [];

      const sectionTotal = sectionItems.reduce(
        (sectionSum, item) => {
          return (
            sectionSum +
            Number(item.quantity || 0) *
            Number(item.unitPrice || 0)
          );
        },
        0
      );

      return total + sectionTotal;
    },
    0
  );

  // CURRENCY FORMATTER
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // SAVE QUOTATION
  const handleSaveQuotation = () => {
    if (!customer.name.trim()) {
      alert('Please enter the customer name before saving.');
      return;
    }

    const hasItems = sections.some(
      (section) =>
        Array.isArray(section.items) &&
        section.items.length > 0
    );

    if (!hasItems) {
      alert('Please add at least one item before saving.');
      return;
    }

    try {
      const savedQuotations = JSON.parse(
        localStorage.getItem('sunguardQuotations') || '[]'
      );

      if (!Array.isArray(savedQuotations)) {
        throw new Error('Saved quotation data is invalid.');
      }

      const currentYear = new Date().getFullYear();

      let number = quotationNumber;

      // GENERATE A UNIQUE QUOTATION NUMBER
      if (!number) {
        const existingNumbers = savedQuotations
          .map((quotation) => quotation.quotationNumber)
          .filter((value) =>
            value.startsWith(`SG-QT-${currentYear}-`)
          )
          .map((value) => {
            const serial = value.split('-').pop();
            return Number(serial) || 0;
          });

        const nextNumber =
          Math.max(0, ...existingNumbers) + 1;

        number = `SG-QT-${currentYear}-${String(
          nextNumber
        ).padStart(3, '0')}`;
      }

      const safeDiscount = Math.min(
        grandSubtotal,
        Math.max(0, Number(discount) || 0)
      );

      const grandTotal = grandSubtotal - safeDiscount;

      const paid = Math.min(
        grandTotal,
        Math.max(0, Number(amountPaid) || 0)
      );

      const existingQuotation = savedQuotations.find(
        (item) => item.quotationNumber === number
      );

      const quotation = {
        id: existingQuotation?.id || number,
        quotationNumber: number,
        documentType: 'Quotation',
        createdAt: existingQuotation?.createdAt || new Date().toISOString(),
        customer: customer,
        selectedProjectType: selectedProjectType,
        sections: sections,
        subtotal: grandSubtotal,
        discount: safeDiscount,
        grandTotal: grandTotal,
        amountPaid: paid,
        outstandingBalance: grandTotal - paid
      };

      const existingIndex = savedQuotations.findIndex(
        (item) => item.quotationNumber === number
      );

      if (existingIndex >= 0) {
        savedQuotations[existingIndex] = quotation;
      } else {
        savedQuotations.push(quotation);
      }

      localStorage.setItem(
        'sunguardQuotations',
        JSON.stringify(savedQuotations)
      );

      // Notify Dashboard and Documents pages
      window.dispatchEvent(
        new Event('sunguardDocumentsUpdated')
      );

      setQuotationNumber(number);
      setIsEditing(true);

      setSavedMessage(
        `Quotation ${number} saved successfully!`
      );

    } catch (error) {
      console.error('Error saving quotation:', error);

      alert(
        'Unable to save quotation. Please try again.'
      );
    }
  };

  return (
    <div className="quotation-page">

      {/* PAGE HEADER */}
      <div className="quotation-heading">

        <div className="quotation-heading-icon">
          <FaFileInvoiceDollar />
        </div>

        <div className="quotation-heading-content">

          <span className="quotation-page-label">
            SUNGUARD DOCUMENT MANAGEMENT
          </span>

          <h1>{isEditing ? 'Edit Quotation' : 'Create Quotation'}</h1>

          <p>
            Prepare a professional quotation for your solar,
            CCTV and other installation projects.
          </p>

        </div>

      </div>

      {/* STEP 01: CUSTOMER INFORMATION */}
      <div className="quotation-step-heading">

        <span>STEP 01</span>

        <h2>Customer Information</h2>

        <p>
          Enter your customer's contact and project details.
        </p>

      </div>

      <CustomerForm
        customer={customer}
        setCustomer={setCustomer}
      />

      {/* STEP 02: PROJECT TYPE */}
      <PhaseSelector
        selectedProjectType={selectedProjectType}
        setSelectedProjectType={setSelectedProjectType}
      />

      {/* STEP 03: QUOTATION SECTIONS */}
      <div className="quotation-sections-container">

        <div className="quotation-sections-heading">

          <div>

            <span className="quotation-page-label">
              STEP 03
            </span>

            <h2>Quotation Sections</h2>

            <p>
              Add the equipment, materials and services
              required for this project.
            </p>

          </div>

          <div className="quotation-section-total-count">
            <FaLayerGroup />

            {sections.length}{' '}
            {sections.length === 1 ? 'Section' : 'Sections'}
          </div>

        </div>

        {/* DYNAMIC SECTIONS */}
        {sections.map((section) => (
          <PhaseSection
            key={section.id}
            sectionTitle={section.title}
            onTitleChange={(newTitle) =>
              updateSectionTitle(section.id, newTitle)
            }
            items={section.items}
            setItems={(update) =>
              updateSectionItems(section.id, update)
            }
            onRemoveSection={() =>
              removeSection(section.id)
            }
          />
        ))}

        {/* ADD SECTION BUTTON */}
        <button
          type="button"
          className="quotation-add-section-button"
          onClick={addSection}
        >
          <FaPlus />
          Add New Section
        </button>

      </div>

      {/* OVERALL SUBTOTAL */}
      <div className="quotation-grand-total">

        <div className="quotation-grand-total-icon">
          <FaFileInvoiceDollar />
        </div>

        <div className="quotation-grand-total-details">

          <span>OVERALL QUOTATION SUBTOTAL</span>

          <p>
            Total value of all items across your sections.
          </p>

        </div>

        <strong>{formatCurrency(grandSubtotal)}</strong>

      </div>

      {/* STEP 04: QUOTATION SUMMARY */}
      <QuotationSummary
        subtotal={grandSubtotal}
        discount={discount}
        setDiscount={setDiscount}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
      />

      {/* SAVE QUOTATION BUTTON */}
      <div className="quotation-save-area">

        <button
          type="button"
          className="quotation-save-button"
          onClick={handleSaveQuotation}
        >
          <FaSave />
          {isEditing ? 'Save Changes' : 'Save Quotation'}
        </button>

        {savedMessage && (
          <p className="quotation-save-message">
            {savedMessage}
          </p>
        )}

      </div>

      {/* QUOTATION PREVIEW */}
      <DocumentPreview
        type="quotation"
        quotation={{
          quotationNumber,
          customer,
          selectedProjectType,
          sections,
          subtotal: grandSubtotal,
          discount,
          amountPaid
        }}
      />

    </div>
  );
}

export default Quotation;
