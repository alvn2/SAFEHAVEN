import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SeekerDashboard } from '../pages/SeekerDashboard';
import { VolunteerNetworkPage } from '../pages/VolunteerNetworkPage';
import { StorageService } from '../lib/storage';

// Mock context for protected routes
const MockAuthProvider = ({ children, user }: any) => (
    <AuthContext.Provider value={{ 
        user: user || null, 
        passphrase: 'password123', 
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
    // Fix: Added displayName to mock user
    const mockUser = { id: 'u1', username: 'ghost', displayName: 'GhostUser', role: 'USER' as const };

    it('Renders Journal and Safety Plan tabs', () => {
        render(
            <MockAuthProvider user={mockUser}>
                <MemoryRouter>
                    <SeekerDashboard />
                </MemoryRouter>
            </MockAuthProvider>
        );

        // Expect the displayName we just defined
        expect(screen.getByText(/Hello, GhostUser/i)).toBeInTheDocument();
        expect(screen.getByText('Journal')).toBeInTheDocument();
        expect(screen.getByText('Safety Plan')).toBeInTheDocument();
    });

    it('Opens New Entry form when clicked', () => {
        render(
            <MockAuthProvider user={mockUser}>
                <MemoryRouter>
                    <SeekerDashboard />
                </MemoryRouter>
            </MockAuthProvider>
        );

        const prompt = screen.getByText(/How are you feeling right now?/i);
        fireEvent.click(prompt);
        
        // Check for the placeholder in the opened form
        expect(screen.getByPlaceholderText(/Write your thoughts here/i)).toBeInTheDocument();
    });
});

describe('Page: VolunteerNetwork', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('Renders volunteers from storage', () => {
        StorageService.getVolunteers(); // Ensure seed data is loaded

        render(
            <MockAuthProvider user={null}>
                <MemoryRouter>
                    <VolunteerNetworkPage />
                </MemoryRouter>
            </MockAuthProvider>
        );

        // Fix: Matches "Search..." placeholder
        expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
        // Should find Dr. Amina from seed constants
        expect(screen.getByText(/Dr. Amina J./i)).toBeInTheDocument();
    });

    it('Filter logic removes mismatched volunteers', () => {
        StorageService.getVolunteers();
        render(
            <MockAuthProvider user={null}>
                <MemoryRouter>
                    <VolunteerNetworkPage />
                </MemoryRouter>
            </MockAuthProvider>
        );

        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'NonExistentPerson' } });

        expect(screen.queryByText(/Dr. Amina J./i)).not.toBeInTheDocument();
        expect(screen.getByText(/No volunteers found/i)).toBeInTheDocument();
    });
});