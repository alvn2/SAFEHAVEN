import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SeekerDashboard } from '../pages/SeekerDashboard';
import { VolunteerNetworkPage } from '../pages/VolunteerNetworkPage';
import { volunteerApi } from '../lib/api';

// Mock context for protected routes
const MockAuthProvider = ({ children, user }: any) => (
    <AuthContext.Provider value={{ 
        user: user || null, 
        passphrase: 'password123', 
        setPassphrase: vi.fn(),
        isLoading: false,
        login: vi.fn(), 
        registerSeeker: vi.fn(), 
        recover: vi.fn(),
        logout: vi.fn() 
    }}>
        <ThemeProvider>
            {children}
        </ThemeProvider>
    </AuthContext.Provider>
);

describe('Page: SeekerDashboard', () => {
    const mockUser = { id: 'u1', username: 'ghost', role: 'USER' as const };

    it('Renders Journal, Safety Plan tabs, and KeePassXC Vault controls', () => {
        render(
            <MockAuthProvider user={mockUser}>
                <MemoryRouter>
                    <SeekerDashboard />
                </MemoryRouter>
            </MockAuthProvider>
        );

        expect(screen.getByText(/Hello, ghost/i)).toBeInTheDocument();
        expect(screen.getByText('Journal')).toBeInTheDocument();
        expect(screen.getByText('Safety Plan')).toBeInTheDocument();
        expect(screen.getByText(/Device Vault/i)).toBeInTheDocument();
        expect(screen.getByText(/Cloud Sync/i)).toBeInTheDocument();
        expect(screen.getByText(/Export Vault/i)).toBeInTheDocument();
        expect(screen.getByText(/Import Vault/i)).toBeInTheDocument();
    });

    it('Opens New Entry form without audio recording button', () => {
        render(
            <MockAuthProvider user={mockUser}>
                <MemoryRouter>
                    <SeekerDashboard />
                </MemoryRouter>
            </MockAuthProvider>
        );

        const prompt = screen.getByText(/How are you feeling right now?/i);
        fireEvent.click(prompt);
        
        expect(screen.getByPlaceholderText(/Write your thoughts here/i)).toBeInTheDocument();
        // Audio recording button must be absent to protect free-tier database
        expect(screen.queryByText(/Record Audio/i)).not.toBeInTheDocument();
    });
});

describe('Page: VolunteerNetwork', () => {
    const mockVolunteers = [
        {
            id: 'v1',
            userId: 'u1',
            name: 'Dr. Amina J.',
            photo: 'photo.jpg',
            role: 'licensed' as const,
            qualification: 'PhD Clinical Psychology',
            topics: ['Anxiety', 'Depression'],
            location: 'Nairobi',
            whatsapp: '+254700000001',
            languages: ['English', 'Swahili'],
            isOnline: true,
            verified: true,
            bio: 'Experienced clinical psychologist dedicated to youth mental health.',
            views: 120,
            chats: 45
        }
    ];

    beforeEach(() => {
        vi.spyOn(volunteerApi, 'getAll').mockResolvedValue(mockVolunteers);
    });

    it('Renders volunteers from API', async () => {
        render(
            <MockAuthProvider user={null}>
                <MemoryRouter>
                    <VolunteerNetworkPage />
                </MemoryRouter>
            </MockAuthProvider>
        );

        expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
        expect(await screen.findByText(/Dr. Amina J./i)).toBeInTheDocument();
    });

    it('Filter logic removes mismatched volunteers', async () => {
        render(
            <MockAuthProvider user={null}>
                <MemoryRouter>
                    <VolunteerNetworkPage />
                </MemoryRouter>
            </MockAuthProvider>
        );

        expect(await screen.findByText(/Dr. Amina J./i)).toBeInTheDocument();
        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'NonExistentPerson' } });

        expect(screen.queryByText(/Dr. Amina J./i)).not.toBeInTheDocument();
        expect(screen.getByText(/No volunteers found/i)).toBeInTheDocument();
    });
});