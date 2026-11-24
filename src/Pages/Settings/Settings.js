
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './Settings.css';

import {
  FaBuilding,
  FaFileInvoice,
  FaWallet,
  FaAlignLeft,
  FaSave,
  FaUndo
} from 'react-icons/fa';

const defaultSettings = {
  businessName: 'Sunguard',
  phone: '09030959063',
  email: 'Sunguardsystem@outlook.com',
  address: '',
  slogan: 'Your Safety. Your Energy. Our Priority.',

  currency: 'NGN',
  quotationValidity: '14',
  invoiceDueDays: '7',

  bankName: '',
  accountName: '',
  accountNumber: '',
  paymentInstructions: '',

  termsAndConditions:
    '1. Prices quoted are subject to the stated validity period.\n2. Any additional work or materials not listed in this document will be charged separately.\n3. Installation commencement is subject to the agreed payment arrangement.\n4. All equipment supplied is subject to the applicable manufacturer warranty.',

  footerMessage:
    'Thank you for choosing Sunguard. We appreciate your business.'
};

function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = JSON.parse(
        localStorage.getItem('sunguardSettings') || 'null'
      );

      return {
        ...defaultSettings,
        ...(savedSettings || {})
      };
    } catch (error) {
      return { ...defaultSettings };
    }
  });

  // Handle changes to settings fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: value
    }));
  };

  // Save business settings
  const handleSave = async (e) => {
    e.preventDefault();

    if (!settings.businessName.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Business Name Required',
        text: 'Please enter your business name before saving.',
        confirmButtonColor: '#263747'
      });

      return;
    }

    try {
      localStorage.setItem(
        'sunguardSettings',
        JSON.stringify(settings)
      );

      // Notify other components that settings have changed
      window.dispatchEvent(
        new Event('sunguardSettingsUpdated')
      );

      await Swal.fire({
        icon: 'success',
        title: 'Settings Saved!',
        text: 'Your business settings have been saved successfully.',
        confirmButtonColor: '#263747'
      });

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Unable to Save',
        text: 'Something went wrong while saving your settings. Please check your browser storage.',
        confirmButtonColor: '#263747'
      });
    }
  };

  // Restore default settings
  const handleReset = async () => {
    const result = await Swal.fire({
      title: 'Restore Default Settings?',
      text: 'This will replace your current business settings with the default Sunguard settings.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Restore Defaults',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#263747',
      cancelButtonColor: '#777'
    });

    if (!result.isConfirmed) return;

    try {
      const restoredSettings = { ...defaultSettings };

      localStorage.setItem(
        'sunguardSettings',
        JSON.stringify(restoredSettings)
      );

      setSettings(restoredSettings);

      // Notify other components that settings have changed
      window.dispatchEvent(
        new Event('sunguardSettingsUpdated')
      );

      await Swal.fire({
        icon: 'success',
        title: 'Defaults Restored!',
        text: 'Your default Sunguard settings have been restored successfully.',
        confirmButtonColor: '#263747'
      });

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: 'Unable to restore default settings. Please try again.',
        confirmButtonColor: '#263747'
      });
    }
  };

  return (
    <div className="settings-page">

      {/* PAGE HEADER */}
      <div className="settings-page-heading">
        <div className="settings-heading-icon">
          <FaBuilding />
        </div>

        <div>
          <span>SUNGUARD DOCUMENT MANAGEMENT</span>
          <h1>Business Settings</h1>
          <p>
            Manage your company information and document preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>

        {/* BUSINESS INFORMATION */}
        <div className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-section-icon">
              <FaBuilding />
            </div>

            <div>
              <h2>Business Information</h2>
              <p>
                These details identify your business on documents.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">

            <div className="settings-field">
              <label>Business Name *</label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="settings-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="Business phone number"
              />
            </div>

            <div className="settings-field">
              <label>Business Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="Business email"
              />
            </div>

            <div className="settings-field">
              <label>Business Address</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="Enter your business address"
              />
            </div>

            <div className="settings-field full-width">
              <label>Business Slogan</label>
              <input
                type="text"
                name="slogan"
                value={settings.slogan}
                onChange={handleChange}
                placeholder="Your company slogan"
              />
            </div>

          </div>
        </div>

        {/* DOCUMENT PREFERENCES */}
        <div className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-section-icon">
              <FaFileInvoice />
            </div>

            <div>
              <h2>Document Preferences</h2>
              <p>
                Set your default quotation and invoice preferences.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">

            <div className="settings-field">
              <label>Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Quotation Validity</label>
              <select
                name="quotationValidity"
                value={settings.quotationValidity}
                onChange={handleChange}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Default Invoice Payment Period</label>
              <select
                name="invoiceDueDays"
                value={settings.invoiceDueDays}
                onChange={handleChange}
              >
                <option value="0">Due immediately</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

          </div>
        </div>

        {/* PAYMENT INFORMATION */}
        <div className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-section-icon">
              <FaWallet />
            </div>

            <div>
              <h2>Payment Information</h2>
              <p>
                Add your bank details for customers making payments.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">

            <div className="settings-field">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
              />
            </div>

            <div className="settings-field">
              <label>Account Name</label>
              <input
                type="text"
                name="accountName"
                value={settings.accountName}
                onChange={handleChange}
                placeholder="Enter account name"
              />
            </div>

            <div className="settings-field full-width">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={settings.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
              />
            </div>

            <div className="settings-field full-width">
              <label>Payment Instructions</label>
              <textarea
                name="paymentInstructions"
                value={settings.paymentInstructions}
                onChange={handleChange}
                placeholder="Enter payment instructions for your customers"
                rows="4"
              />
            </div>

          </div>
        </div>

        {/* TERMS AND CONDITIONS */}
        <div className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-section-icon">
              <FaAlignLeft />
            </div>

            <div>
              <h2>Terms and Conditions</h2>
              <p>
                Set the default terms displayed on your business documents.
              </p>
            </div>
          </div>

          <div className="settings-field full-width">
            <label>Terms and Conditions</label>
            <textarea
              name="termsAndConditions"
              value={settings.termsAndConditions}
              onChange={handleChange}
              rows="7"
            />
          </div>

          <div className="settings-field full-width footer-message-field">
            <label>Document Thank-you Message</label>
            <textarea
              name="footerMessage"
              value={settings.footerMessage}
              onChange={handleChange}
              rows="3"
            />
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="settings-actions">

          <button
            type="button"
            className="settings-reset-button"
            onClick={handleReset}
          >
            <FaUndo />
            Restore Defaults
          </button>

          <button
            type="submit"
            className="settings-save-button"
          >
            <FaSave />
            Save Settings
          </button>

        </div>

      </form>
    </div>
  );
}

export default Settings;
