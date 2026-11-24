
import React from 'react';
import './Header.css';
import logo from '../../Assets/icon.png';

function Header() {
  return (
    <header className="header">
      <div className="header-container">

        <div className="header-brand">
          <img src={logo} alt="Sunguard Logo" />

          <div className="brand-text">
            <h1>SUNGUARD</h1>
            <p>Your Safety. Your Energy. Our Priority.</p>
          </div>
        </div>

        <nav className="header-nav">
          <a href="/">Dashboard</a>
          <a href="/quotations">Quotations</a>
          {/* <a href="/create-invoice">Invoices</a> */}
          <a href="/documents">Documents</a>
          <a href="/settings">Settings</a>
        </nav>

      </div>
    </header>
  );
}

export default Header;
