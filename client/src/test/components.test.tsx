import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Badge, Modal } from '../components/ui';
import { VolunteerCard } from '../components/VolunteerCard';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

describe('UI Primitives', () => {
    it('Button renders and handles clicks', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        
        const btn = screen.getByText('Click Me');
        fireEvent.click(btn);
        
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('Button shows loading state', () => {
        const { container } = render(<Button isLoading>Submit</Button>);
        
        // Check if button is disabled
        expect(screen.getByRole('button')).toBeDisabled();
        
        // Check if spinner SVG exists (by class name used in your UI component)
        // Note: accessing container directly is useful for SVGs without aria-labels
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('Badge renders correct colors', () => {
        render(<Badge color="green">Verified</Badge>);
        const badge = screen.getByText('Verified');
        expect(badge.className).toContain('bg-green-100');
    });
});

describe('Complex Components', () => {
    it('VolunteerCard renders volunteer details', () => {
        const mockVol = {
            id: '1', userId: 'u1', name: 'Dr. Test', photo: 'img.jpg', role: 'licensed' as const,
            qualification: 'MD', topics: ['Anxiety'], location: 'Nairobi', whatsapp: '123',
            languages: ['English'], isOnline: true, verified: true, bio: 'Hello',
            impact: { views: 10, chats: 5 }
        };

        render(
            <MemoryRouter>
                <AuthProvider>
                    <VolunteerCard volunteer={mockVol} onExternalLink={vi.fn()} />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByText('Dr. Test')).toBeInTheDocument();
        expect(screen.getByText('MD')).toBeInTheDocument();
        expect(screen.getByText('Licensed Pro')).toBeInTheDocument(); // From Constants
    });

    it('Modal does not render when closed', () => {
        render(
            <Modal isOpen={false} onClose={() => {}} title="Test Modal">
                <div>Content</div>
            </Modal>
        );
        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('EmergencyHotlineBar displays crisis hotlines with tap-to-call links', async () => {
        const { EmergencyHotlineBar } = await import('../components/Layout');
        render(<EmergencyHotlineBar />);

        expect(screen.getByText(/24\/7 Crisis Lines:/i)).toBeInTheDocument();
        const redCrossLink = screen.getByText(/Red Cross: 1199/i);
        expect(redCrossLink).toBeInTheDocument();
        expect(redCrossLink.getAttribute('href')).toBe('tel:1199');

        const befriendersLink = screen.getByText(/Befrienders: 0722 178 177/i);
        expect(befriendersLink).toBeInTheDocument();
        expect(befriendersLink.getAttribute('href')).toBe('tel:+254722178177');
    });

    it('ExternalLinkWarning shows de-anonymization warning for WhatsApp & Telegram links', async () => {
        const { ExternalLinkWarning } = await import('../components/ExternalLinkWarning');
        const handleClose = vi.fn();
        render(
            <ExternalLinkWarning 
                isOpen={true} 
                onClose={handleClose} 
                url="https://wa.me/254712345678" 
            />
        );

        expect(screen.getByText('External Messenger Privacy Alert')).toBeInTheDocument();
        expect(screen.getByText(/De-Anonymization Alert: Phone & Profile Leakage/i)).toBeInTheDocument();
        expect(screen.getByText(/Stay Anonymous \(Cancel\)/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Stay Anonymous \(Cancel\)/i));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('ExternalLinkWarning shows standard external warning for general links', async () => {
        const { ExternalLinkWarning } = await import('../components/ExternalLinkWarning');
        const handleClose = vi.fn();
        render(
            <ExternalLinkWarning 
                isOpen={true} 
                onClose={handleClose} 
                url="https://who.int/mental_health" 
            />
        );

        expect(screen.getByText('Leaving SafeHaven')).toBeInTheDocument();
        expect(screen.getByText(/External Resource/i)).toBeInTheDocument();
        expect(screen.getByText(/Continue to Link/i)).toBeInTheDocument();
    });

    it('Avatar renders offline SVG initials avatar without calling ui-avatars.com', async () => {
        const { Avatar } = await import('../components/Avatar');
        const { container } = render(
            <Avatar name="Dr. Jane Doe" photo="https://ui-avatars.com/api/?name=Jane" />
        );

        // ui-avatars.com photo should be ignored, rendering SVG/initials
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('JD')).toBeInTheDocument();
    });
});