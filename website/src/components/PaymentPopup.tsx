import React from 'react';

interface PaymentPopupProps {
    onClose: () => void;
}

const PaymentPopup: React.FC<PaymentPopupProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-80">
            <div className="bg-background/80 backdrop-blur-md p-8 rounded-lg text-center shadow-lg">
                <p className="text-2xl font-bold mb-4 text-foreground">$1 / MONTH TO CONTINUE</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded transition-colors"
                >
                    Subscribe Now
                </button>
            </div>
        </div>
    );
};

export default PaymentPopup; 