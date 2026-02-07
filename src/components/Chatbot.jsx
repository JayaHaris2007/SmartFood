import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your SmartFood assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Access context data
    const { activeOrder } = useOrder();
    const { currentUser, userRole } = useAuth();

    // Hide chat bot for restaurant owners
    if (userRole === 'restaurant') return null;

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // Process bot response
        setTimeout(() => {
            const responseText = generateResponse(userMessage.text);
            const botMessage = {
                id: Date.now() + 1,
                text: responseText,
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const generateResponse = (text) => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('track') || lowerText.includes('order') || lowerText.includes('where')) {
            if (activeOrder) {
                if (activeOrder.status === 'Arrived') {
                    return "Great news! Your order has arrived! Enjoy your meal!";
                } else if (activeOrder.status === 'Cancelled') {
                    return "It looks like this order was cancelled.";
                } else {
                    return `Your order is currently ${activeOrder.status}. It is approximately ${activeOrder.distanceKm}km away.`;
                }
            } else {
                return "I don't see an active order for you right now. You can browse our menu to place one!";
            }
        }

        if (lowerText.includes('hello') || lowerText.includes('hi')) {
            return `Hello ${currentUser?.name || 'there'}! hungry? Ask me about your order status!`;
        }

        if (lowerText.includes('refund') || lowerText.includes('cancel')) {
            return "For refunds or cancellations, please use the 'Cancel' button in the order tracker if available, or contact our support hotline at 1-800-SMARTFOOD.";
        }

        if (lowerText.includes('contact') || lowerText.includes('support')) {
            return "You can reach our support team at support@smartfood.com or call 1-800-SMARTFOOD.";
        }

        if (lowerText.includes('thank')) {
            return "You're welcome! Enjoy your food!";
        }

        return "I'm still learning! You can ask me to 'track my order', or about 'refunds' and 'contact' info.";
    };

    return (
        <div className="fixed bottom-24 right-6 z-[6000] flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in origin-bottom-right transition-all duration-300 transform">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-orange-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">SmartSupport</h3>
                                <p className="text-[10px] text-white/80">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50 dark:bg-slate-950/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-tr-sm'
                                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm shadow-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-slate-700 shadow-sm flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-md shadow-primary/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen
                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-white rotate-90'
                    : 'bg-gradient-to-r from-primary to-orange-600 text-white animate-pulse-slow' // Custom pulse?
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 transition-transform duration-300 -rotate-90" />
                ) : (
                    <>
                        <MessageCircle className="w-7 h-7" />
                        {/* Notification Badge if needed */}
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </>
                )}
            </button>
        </div>
    );
};

export default Chatbot;
