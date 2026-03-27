import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volunteer } from '../types';
import { Card, Badge, Button } from './ui';
import { CheckCircle, MessageCircle, MessageSquare, Send } from 'lucide-react';
import { VOLUNTEER_ROLES } from '../utils/constants';
import { AuthContext } from '../context/AuthContext';

interface VolunteerCardProps {
  volunteer: Volunteer;
  onExternalLink: (url: string) => void;
}

export const VolunteerCard: React.FC<VolunteerCardProps> = ({ volunteer, onExternalLink }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleChat = () => {
    if (!user) {
        navigate('/auth');
        return;
    }
    // Navigate to chat — backend handles conversation creation
    navigate(`/chat?volunteer=${volunteer.userId}`);
  };

  return (
    <Card hoverable className="flex flex-col h-full relative">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={volunteer.photo} alt={volunteer.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-lg leading-tight dark:text-white">{volunteer.name}</h3>
              <p className="text-xs text-gray-500">{volunteer.qualification}</p>
            </div>
          </div>
          {volunteer.verified && (
            <div className="group relative">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="absolute right-0 top-6 w-32 bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">Verified Identity</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge color={VOLUNTEER_ROLES[volunteer.role].color as any}>{VOLUNTEER_ROLES[volunteer.role].label}</Badge>
          {volunteer.isOnline && <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</span>}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{volunteer.bio}</p>

        <div className="space-y-3">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Expertise</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {volunteer.topics.map(t => (
                <span key={t} className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <Button onClick={handleChat} className="w-full flex items-center justify-center gap-2" variant={volunteer.isOnline ? 'primary' : 'outline'}>
            <MessageSquare className="w-4 h-4" /> 
            {volunteer.isOnline ? 'Chat Securely' : 'Leave Message'}
        </Button>
        <div className="flex gap-2">
            <button 
                onClick={() => onExternalLink(`https://wa.me/${volunteer.whatsapp}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition-colors text-sm"
            >
                <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            {volunteer.telegram && (
                <button 
                    onClick={() => onExternalLink(`https://t.me/${volunteer.telegram}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-xl transition-colors text-sm"
                >
                    <Send className="w-4 h-4" /> Telegram
                </button>
            )}
        </div>
      </div>
    </Card>
  );
};