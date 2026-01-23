import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />
    };

    const bgColors = {
        success: 'bg-slate-900 border-green-500/20',
        error: 'bg-slate-900 border-red-500/20',
        info: 'bg-slate-900 border-blue-500/20'
    };

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${bgColors[type]} animate-slide-up bg-opacity-95 backdrop-blur-sm min-w-[300px]`}>
            {icons[type]}
            <p className="text-white font-medium text-sm">{message}</p>
        </div>
    );
};

export default Toast;
