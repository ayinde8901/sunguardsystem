
import './App.css';
import { Routes, Route } from 'react-router-dom';

import Header from './Component/Header/Header';
import Dashboard from './Pages/Dashboard/Dashboard';
import Quotation from './Pages/Quotation/Quotation';
import Documents from './Pages/Documents/Documents';
import CreateInvoice from './Pages/CreateInvoice/CreateInvoice';
import Settings from './Pages/Settings/Settings';

function App() {
  return (
    <div className="app">

      <Header />

      <main className="app-main">
        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route path="/quotations" element={<Quotation />} />

          <Route path="/documents" element={<Documents />} />

          <Route path="/create-invoice" element={<CreateInvoice />} />

          <Route path="/settings" element={<Settings />} />

        </Routes>
      </main>

    </div>
  );
}

export default App;
