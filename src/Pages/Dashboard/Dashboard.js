
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

import Button from '../../Component/Button/Button';

import {
  FaFileInvoice,
  FaFileAlt,
  FaWallet,
  FaClock,
  FaPlus,
  FaArrowRight,
  FaSolarPanel,
  FaEye
} from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState({
    quotations: [],
    invoices: []
  });

  const loadDocuments = () => {
    try {
      const quotations = JSON.parse(
        localStorage.getItem('sunguardQuotations') || '[]'
      );

      const invoices = JSON.parse(
        localStorage.getItem('sunguardInvoices') || '[]'
      );

      setDocuments({
        quotations: Array.isArray(quotations) ? quotations : [],
        invoices: Array.isArray(invoices) ? invoices : []
      });
    } catch (error) {
      console.error('Could not load dashboard documents:', error);

      setDocuments({
        quotations: [],
        invoices: []
      });
    }
  };

  useEffect(() => {
    loadDocuments();

    window.addEventListener('focus', loadDocuments);
    window.addEventListener('storage', loadDocuments);

    return () => {
      window.removeEventListener('focus', loadDocuments);
      window.removeEventListener('storage', loadDocuments);
    };
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(Number(amount) || 0);
  };

  const getInvoiceTotal = (invoice) => {
    if (invoice.grandTotal !== undefined) {
      return Math.max(0, Number(invoice.grandTotal) || 0);
    }

    const subtotal = Number(invoice.subtotal) || 0;
    const discount = Number(invoice.discount) || 0;

    return Math.max(0, subtotal - discount);
  };

  const totalQuotations = documents.quotations.length;

  const totalInvoices = documents.invoices.length;

  const totalPayments = documents.invoices.reduce(
    (total, invoice) => {
      const grandTotal = getInvoiceTotal(invoice);

      const paid = Math.min(
        grandTotal,
        Math.max(0, Number(invoice.amountPaid) || 0)
      );

      return total + paid;
    },
    0
  );

  const outstandingBalance = documents.invoices.reduce(
    (total, invoice) => {
      const grandTotal = getInvoiceTotal(invoice);

      const paid = Math.min(
        grandTotal,
        Math.max(0, Number(invoice.amountPaid) || 0)
      );

      return total + Math.max(0, grandTotal - paid);
    },
    0
  );

  const stats = [
    {
      id: 1,
      title: 'Total Quotations',
      value: totalQuotations,
      icon: <FaFileAlt />,
      description: 'All quotations created',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Total Invoices',
      value: totalInvoices,
      icon: <FaFileInvoice />,
      description: 'All invoices generated',
      color: 'gold'
    },
    {
      id: 3,
      title: 'Total Payments',
      value: formatCurrency(totalPayments),
      icon: <FaWallet />,
      description: 'Payments received',
      color: 'green'
    },
    {
      id: 4,
      title: 'Outstanding Balance',
      value: formatCurrency(outstandingBalance),
      icon: <FaClock />,
      description: 'Awaiting payment',
      color: 'red'
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Create Quotation',
      description: 'Prepare a new customer quotation',
      icon: <FaFileAlt />,
      link: '/quotations',
      className: 'quotation-action'
    },
    {
      id: 2,
      title: 'Create Invoice',
      description: 'Generate a new customer invoice',
      icon: <FaFileInvoice />,
      link: '/create-invoice',
      className: 'invoice-action'
    }
  ];

  const recentDocuments = [
    ...documents.quotations.map((item) => ({
      ...item,
      type: 'Quotation',
      number: item.quotationNumber || 'Quotation',
      date: item.createdAt || item.quotationDate,
      total: Number(item.grandTotal) ||
        Math.max(0, (Number(item.subtotal) || 0) - (Number(item.discount) || 0))
    })),

    ...documents.invoices.map((item) => ({
      ...item,
      type: 'Invoice',
      number: item.invoiceNumber || 'Invoice',
      date: item.createdAt || item.invoiceDate,
      total: getInvoiceTotal(item)
    }))
  ]
    .sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    })
    .slice(0, 5);

  const formatDate = (date) => {
    if (!date) return 'Date not available';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date not available';
    }

    return parsedDate.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section className="dashboard">

      {/* WELCOME SECTION */}
      <div className="dashboard-welcome">
        <div>
          <span className="welcome-label">
            SUNGUARD DOCUMENT MANAGER
          </span>

          <h2>Welcome to Your Dashboard</h2>

          <p>
            Manage your quotations, invoices and customer payments
            from one place.
          </p>
        </div>

        <div className="welcome-icon">
          <FaSolarPanel />
        </div>
      </div>

      {/* STATISTICS */}
      <div className="dashboard-stats">
        {stats.map((item) => (
          <div className="stat-card" key={item.id}>

            <div className={`stat-icon ${item.color}`}>
              {item.icon}
            </div>

            <div className="stat-info">
              <h3>{item.title}</h3>
              <h2>{item.value}</h2>
              <p>{item.description}</p>
            </div>

          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>What would you like to do today?</p>
          </div>
        </div>

        <div className="quick-actions">

          {quickActions.map((action) => (
            <div
              className={`action-card ${action.className}`}
              key={action.id}
            >
              <div className="action-icon">
                {action.icon}
              </div>

              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>

                <Button
                  variant="primary"
                  onClick={() => navigate(action.link)}
                >
                  Create Now <FaArrowRight />
                </Button>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* RECENT DOCUMENTS */}
      <div className="dashboard-section recent-section">

        <div className="section-heading">
          <div>
            <h2>Recent Documents</h2>
            <p>
              Your latest quotations and invoices will appear here.
            </p>
          </div>

          <button
            type="button"
            className="view-all"
            onClick={() => navigate('/documents')}
          >
            View All <FaArrowRight />
          </button>
        </div>

        {recentDocuments.length > 0 ? (

          <div className="dashboard-recent-list">

            {recentDocuments.map((item, index) => (
              <div
                className="dashboard-recent-item"
                key={`${item.type}-${item.number}-${index}`}
              >

                <div className="dashboard-recent-icon">
                  {item.type === 'Invoice'
                    ? <FaFileInvoice />
                    : <FaFileAlt />
                  }
                </div>

                <div className="dashboard-recent-info">
                  <h3>{item.customer?.name || 'Customer not provided'}</h3>

                  <p>
                    {item.type} • {item.number}
                  </p>

                  <span>{formatDate(item.date)}</span>
                </div>

                <div className="dashboard-recent-amount">
                  <strong>{formatCurrency(item.total)}</strong>
                  <span>{item.type}</span>
                </div>

              </div>
            ))}

          </div>

        ) : (

          <div className="empty-documents">

            <div className="empty-icon">
              <FaEye />
            </div>

            <h3>No Documents Yet</h3>

            <p>
              Your saved quotations and invoices will appear here.
              Start by creating your first quotation.
            </p>

            <Button
              variant="primary"
              onClick={() => navigate('/quotations')}
            >
              <FaPlus /> Create Quotation
            </Button>

          </div>

        )}

      </div>

    </section>
  );
}

export default Dashboard;
