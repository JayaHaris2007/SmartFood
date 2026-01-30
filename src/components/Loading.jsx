import React from 'react';

const Loading = () => {
    return (
        <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 z-50">
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>

                {/* Inner Ring */}
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin direction-reverse"></div>

                {/* Logo/Icon in center (Optional) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
