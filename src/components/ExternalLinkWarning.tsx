import React from 'react';
import { Modal, Button } from './ui';
import { ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ExternalLinkWarningProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const ExternalLinkWarning: React.FC<ExternalLinkWarningProps> = ({ isOpen, onClose, url }) => {
  const proceed = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leaving SafeHaven">
      <div className="space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl flex gap-3 border border-yellow-100 dark:border-yellow-900">
          <ShieldAlert className="w-8 h-8 text-yellow-600 shrink-0" />
          <div>
            <h4 className="font-bold text-lg text-yellow-800 dark:text-yellow-200">Privacy Warning</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              You are about to visit an external site (WhatsApp/Telegram/Website). 
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Please Note:</strong> SafeHaven cannot protect your anonymity on external platforms. Your phone number or profile picture may be visible to others in the group.
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={proceed} className="w-full flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" /> I Understand, Continue
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};