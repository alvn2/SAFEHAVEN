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
                    <VolunteerCard volunteer={mockVol} />
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
});