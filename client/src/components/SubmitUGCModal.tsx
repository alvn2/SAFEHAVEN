import React, { useState } from 'react';
import { Modal, Button, Input } from './ui';
import { communityApi } from '../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitUGCModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'Group' | 'Event' | 'Organization' | 'Quote'>('Group');
  const [formData, setFormData] = useState<any>({ safetyRating: 'Community Moderated' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (type === 'Group') await communityApi.submitGroup(formData);
      if (type === 'Event') await communityApi.submitEvent(formData);
      if (type === 'Organization') await communityApi.submitOrg(formData);
      if (type === 'Quote') await communityApi.submitQuote(formData);
      alert('Submitted successfully! Pending moderation approval.');
      onClose();
    } catch {
      alert('Failed to submit. Please ensure you are logged in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit to Community">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1 dark:text-gray-300">Submission Type</label>
          <select 
            className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
            value={type} onChange={e => setType(e.target.value as any)}
          >
            <option value="Group">Support Group</option>
            <option value="Event">Event</option>
            <option value="Organization">Organization</option>
            <option value="Quote">Daily Quote</option>
          </select>
        </div>

        {type === 'Group' && (
           <>
             <Input placeholder="Group Name" required onChange={e => setFormData({...formData, name: e.target.value})} />
             <Input placeholder="Description" required onChange={e => setFormData({...formData, description: e.target.value})} />
             <Input placeholder="Link (WhatsApp, Discord, etc)" required onChange={e => setFormData({...formData, link: e.target.value})} />
             <Input placeholder="Platform (e.g., WhatsApp, Discord)" required onChange={e => setFormData({...formData, platform: e.target.value})} />
             <Input placeholder="Category (e.g., Addiction, Grief)" required onChange={e => setFormData({...formData, category: e.target.value})} />
             <div>
               <label className="block text-sm font-bold mb-1 dark:text-gray-300">Privacy</label>
               <select
                 className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                 value={formData.privacy || 'PUBLIC'}
                 onChange={e => setFormData({...formData, privacy: e.target.value})}
               >
                 <option value="PUBLIC">Public — Anyone can join</option>
                 <option value="PRIVATE">Private — Invite Only</option>
               </select>
             </div>
           </>
        )}
        {type === 'Event' && (
           <>
             <Input placeholder="Event Title" required onChange={e => setFormData({...formData, title: e.target.value})} />
             <Input placeholder="Description" required onChange={e => setFormData({...formData, description: e.target.value})} />
             <Input type="datetime-local" required className="dark:text-white" onChange={e => setFormData({...formData, date: e.target.value})} />
             <Input placeholder="Location (or Zoom link)" required onChange={e => setFormData({...formData, location: e.target.value})} />
             <Input placeholder="Organizer Name" required onChange={e => setFormData({...formData, organizer: e.target.value})} />
           </>
        )}
        {type === 'Organization' && (
           <>
             <Input placeholder="Organization Name" required onChange={e => setFormData({...formData, name: e.target.value})} />
             <Input placeholder="Description" required onChange={e => setFormData({...formData, description: e.target.value})} />
             <Input placeholder="Website URL" required onChange={e => setFormData({...formData, link: e.target.value})} />
             <Input placeholder="Category (e.g., NGO, Crisis Center)" required onChange={e => setFormData({...formData, category: e.target.value})} />
           </>
        )}
        {type === 'Quote' && (
           <>
             <Input placeholder="Quote Text" required onChange={e => setFormData({...formData, text: e.target.value})} />
             <Input placeholder="Author / Source" required onChange={e => setFormData({...formData, author: e.target.value})} />
           </>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-4">Submit for Review</Button>
      </form>
    </Modal>
  );
};
