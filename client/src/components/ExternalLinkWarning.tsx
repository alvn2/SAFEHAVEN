import React from 'react';
import { Modal, Button } from './ui';
import { ExternalLink, ShieldAlert, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ExternalLinkWarningProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const ExternalLinkWarning: React.FC<ExternalLinkWarningProps> = ({ isOpen, onClose, url }) => {
  const isMessenger = /wa\.me|whatsapp\.com|t\.me|telegram\.me/i.test(url);

  const proceed = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isMessenger ? "External Messenger Privacy Alert" : "Leaving SafeHaven"}
    >
      <div className="space-y-6">
        {isMessenger ? (
          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl flex gap-3 border border-rose-200 dark:border-rose-900/50">
            <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-base text-rose-900 dark:text-rose-200">
                De-Anonymization Alert: Phone & Profile Leakage
              </h4>
              <p className="text-sm text-rose-800 dark:text-rose-300 mt-1.5 leading-relaxed">
                Opening WhatsApp or Telegram connects directly with your real mobile device. 
                Your <strong>phone number, real name, and profile photo</strong> will be exposed to group members and moderators.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex gap-3 border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-base text-amber-900 dark:text-amber-200">External Resource</h4>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1.5 leading-relaxed">
                You are navigating to an external third-party destination. SafeHaven cannot guarantee the privacy or tracking practices of external websites.
              </p>
            </div>
          </div>
        )}

        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
          Destination: {url}
        </div>

        {isMessenger && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Safe alternative:</strong> If you wish to remain strictly anonymous, we strongly recommend using SafeHaven's built-in encrypted peer messaging and community discussions instead.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            variant={isMessenger ? "secondary" : "ghost"} 
            onClick={onClose} 
            className="flex-1 flex items-center justify-center gap-2 order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4" /> {isMessenger ? "Stay Anonymous (Cancel)" : "Cancel"}
          </Button>
          <Button 
            variant={isMessenger ? "danger" : "primary"} 
            onClick={proceed} 
            className="flex-1 flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <ExternalLink className="w-4 h-4" /> {isMessenger ? "I Accept the Risk, Open" : "Continue to Link"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};