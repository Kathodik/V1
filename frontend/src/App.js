import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import References from './pages/References';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-slate-900">
        <Header />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/references" element={<References />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/imprint" element={<Imprint />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;
