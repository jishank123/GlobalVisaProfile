import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from '../ChatWidget';

const Layout = ({ children, showFooter = true, showChat = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        {children}
      </main>
      {showFooter && <Footer />}
      {showChat && <ChatWidget />}
    </div>
  );
};

export default Layout;