import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../lib/storage';
import { Card, Input, Button } from '../components/ui';

export const VolunteerApplyPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'listener', qualification: '', experience: '', licenseNumber: '', idNumber: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await StorageService.submitVolunteerApplication(formData);
            alert("Application Submitted!");
            navigate('/');
        } catch {
            alert("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold font-serif mb-8 dark:text-white">Join the SafeHaven Network</h1>
            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <Input label="Phone (WhatsApp)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    <div className="w-full">
                        <label className="block text-sm font-semibold mb-1.5 dark:text-gray-200">Role</label>
                        <select className="w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="licensed">Licensed Professional</option>
                            <option value="listener">Peer Listener</option>
                        </select>
                    </div>
                    {formData.role === 'licensed' && (
                        <Input label="License Number" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} required />
                    )}
                    <Input label="Qualification / Degree" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} required />
                    <div className="w-full">
                        <label className="block text-sm font-semibold mb-1.5 dark:text-gray-200">Experience & Motivation</label>
                        <textarea className="w-full p-4 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 h-32 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Tell us about your experience..." value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} required />
                    </div>
                    <Button type="submit" className="w-full" isLoading={isSubmitting}>Submit Application</Button>
                </form>
            </Card>
        </div>
    );
};