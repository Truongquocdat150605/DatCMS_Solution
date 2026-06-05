import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout({ username, onLogout, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header username={username} onLogout={onLogout} />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}

