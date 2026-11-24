
import React, { useState } from 'react';
import './PhaseSection.css';

import {
  FaPlus,
  FaTrash,
  FaLayerGroup,
  FaBoxOpen,
  FaCalculator
} from 'react-icons/fa';

function PhaseSection({
  sectionTitle,
  onTitleChange,
  items = [],
  setItems,
  onRemoveSection
}) {
  const [newItem, setNewItem] = useState('');

  // SAFELY HANDLE ITEMS
  const sectionItems = Array.isArray(items) ? items : [];

  // CURRENCY FORMATTER
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // ADD ITEM
  const addItem = () => {
    if (!newItem.trim()) return;

    const item = {
      id: `${Date.now()}-${Math.random()}`,
      description: newItem.trim(),
      quantity: 1,
      unitPrice: 0
    };

    setItems((previousItems) => [
      ...previousItems,
      item
    ]);

    setNewItem('');
  };

  // UPDATE ITEM
  const updateItem = (id, field, value) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // REMOVE ITEM
  const removeItem = (id) => {
    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  };

  // CALCULATE EACH SECTION SUBTOTAL
  const subtotal = sectionItems.reduce(
    (total, item) => {
      const quantity = Math.max(
        0,
        Number(item.quantity) || 0
      );

      const unitPrice = Math.max(
        0,
        Number(item.unitPrice) || 0
      );

      return total + quantity * unitPrice;
    },
    0
  );

  return (
    <section className="quotation-section">

      {/* SECTION HEADER */}
      <div className="quotation-section-header">

        <div className="quotation-section-heading">

          <div className="quotation-section-icon">
            <FaLayerGroup />
          </div>

          <div className="quotation-section-title">

            <label>SECTION TITLE</label>

            <input
              type="text"
              value={sectionTitle}
              onChange={(e) =>
                onTitleChange(e.target.value)
              }
              placeholder="Enter section title"
            />

            <p>
              Add equipment, materials, accessories or services.
            </p>

          </div>

        </div>

        <div className="quotation-section-count">
          {sectionItems.length}{' '}
          {sectionItems.length === 1 ? 'item' : 'items'}
        </div>

      </div>

      {/* ADD ITEM */}
      <div className="quotation-add-item">

        <div className="quotation-add-item-heading">
          <FaBoxOpen />
          <h3>Add Item or Service</h3>
        </div>

        <div className="quotation-add-item-controls">

          <input
            type="text"
            value={newItem}
            onChange={(e) =>
              setNewItem(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder="Enter equipment, material or service description"
          />

          <button
            type="button"
            className="quotation-add-button"
            onClick={addItem}
            disabled={!newItem.trim()}
          >
            <FaPlus />
            Add Item
          </button>

        </div>

      </div>

      {/* ITEMS TABLE */}
      <div className="quotation-table-wrapper">

        <table className="quotation-items-table">

          <thead>
            <tr>
              <th>Item Description</th>
              <th>Quantity</th>
              <th>Unit Price (₦)</th>
              <th>Amount (₦)</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {sectionItems.length === 0 ? (

              <tr>
                <td
                  colSpan="5"
                  className="quotation-empty-state"
                >
                  No items added yet. Enter your first item above.
                </td>
              </tr>

            ) : (

              sectionItems.map((item) => {

                const amount =
                  (Number(item.quantity) || 0) *
                  (Number(item.unitPrice) || 0);

                return (
                  <tr key={item.id}>

                    <td>
                      <input
                        type="text"
                        className="quotation-description-input"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'description',
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="quotation-number-input"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="quotation-number-input"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'unitPrice',
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td className="quotation-item-amount">
                      {formatCurrency(amount)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="quotation-remove-button"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                        aria-label={`Remove ${item.description}`}
                      >
                        <FaTrash />
                      </button>
                    </td>

                  </tr>
                );
              })

            )}

          </tbody>

        </table>

      </div>

      {/* SECTION FOOTER */}
      <div className="quotation-section-footer">

        {onRemoveSection && (
          <button
            type="button"
            className="quotation-delete-section"
            onClick={onRemoveSection}
          >
            <FaTrash />
            Remove Section
          </button>
        )}

        {/* INDIVIDUAL SECTION TOTAL */}
        <div className="quotation-section-subtotal">

          <div>
            <FaCalculator />
            <span> TOTAL SECTION </span>
          </div>

          <strong>
            {formatCurrency(subtotal)}
          </strong>

        </div>

      </div>

    </section>
  );
}

export default PhaseSection;
