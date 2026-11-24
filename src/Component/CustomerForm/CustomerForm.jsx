
import React from 'react';
import './CustomerForm.css';

function CustomerForm({ customer, setCustomer }) {

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value
    }));
  };

  return (
    <section className="customer-form-section">

      <div className="customer-form-heading">
        <div>
          <span className="form-step">STEP 01</span>
          <h2>Customer Information</h2>
          <p>
            Enter your customer's details for this document.
          </p>
        </div>
      </div>

      <form className="customer-form" onSubmit={(e) => e.preventDefault()}>

        <div className="form-grid">

          <div className="form-group">
            <label htmlFor="customerName">
              Customer Name <span>*</span>
            </label>

            <input
              type="text"
              id="customerName"
              name="name"
              placeholder="Enter customer full name"
              value={customer.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">
              Phone Number <span>*</span>
            </label>

            <input
              type="tel"
              id="customerPhone"
              name="phone"
              placeholder="Enter phone number"
              value={customer.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">
              Email Address
            </label>

            <input
              type="email"
              id="customerEmail"
              name="email"
              placeholder="Enter email address"
              value={customer.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerAddress">
              Customer Address <span>*</span>
            </label>

            <input
              type="text"
              id="customerAddress"
              name="address"
              placeholder="Enter customer's address"
              value={customer.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="projectTitle">
              Project Title
            </label>

            <input
              type="text"
              id="projectTitle"
              name="projectTitle"
              placeholder="e.g. 5KVA Solar Installation"
              value={customer.projectTitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="projectAddress">
              Installation Location
            </label>

            <textarea
              id="projectAddress"
              name="projectAddress"
              placeholder="Enter installation location or additional address details"
              rows="3"
              value={customer.projectAddress}
              onChange={handleChange}
            />
          </div>

        </div>

      </form>

    </section>
  );
}

export default CustomerForm;
