import React from 'react';
import { CreditCard } from 'lucide-react';

const CreditsDisplay = ({ credits }) => {
    return (
        <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-600">
            <CreditCard size={16} />
            <span className="font-medium">{credits}</span>
            <span className="text-xs"> Credits</span>
        </div>
    );
};

export default CreditsDisplay;