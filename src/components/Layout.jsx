import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ActiveOrderTracker from './ActiveOrderTracker';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
            {/* Global Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/5 pointer-events-none z-0" />
            <div className="fixed -top-24 -right-24 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="fixed top-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    {children}
                </main>
                <ActiveOrderTracker />
                <Chatbot />
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
