import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { volunteerApi } from '../lib/api';
import { Card, Input, Button } from '../components/ui';

export const VolunteerApplyPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'listener', qualification: '', experience: '', licenseNumber: '', idNumber: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        
        try {
            await volunteerApi.apply(formData);
            setIsSubmitted(true);
        } catch (err: any) {
            setErrorMessage(err?.message || "Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="p-8 text-center border-green-200 dark:border-green-800 bg-white dark:bg-gray-800 shadow-xl">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold font-serif dark:text-white mb-2">Application Received!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto leading-relaxed">
                        Thank you for applying to join the SafeHaven network as a <span className="font-semibold">{formData.role === 'licensed' ? 'Licensed Professional' : 'Peer Listener'}</span>. Our moderation team reviews applications within 24 to 48 hours.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left max-w-md mx-auto text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-semibold mb-1">What happens next?</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Our team verifies credentials and qualifications</li>
                            <li>We will contact you via WhatsApp ({formData.phone}) or email</li>
                            <li>Once approved, your profile will be listed in the directory</li>
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate('/volunteers')} variant="outline">
                            View Directory
                        </Button>
                        <Button onClick={() => navigate('/')} variant="primary">
                            Return Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold font-serif mb-8 dark:text-white">Join the SafeHaven Network</h1>
            <Card className="p-8">
                {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                        {errorMessage}
                    </div>
                )}
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