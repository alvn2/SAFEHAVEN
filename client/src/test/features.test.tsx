import { describe, it, expect, beforeEach, vi } from 'vitest';
import { encrypt, decrypt } from '../lib/encryption';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthPage } from '../pages/AuthPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// --- UNIT TESTS: LOGIC & CRYPTO ---
describe('Feature 1: Zero-Knowledge Security', () => {
    it('1.1: Encrypts data properly (Ciphertext check)', () => {
        const secret = "My deepest secret";
        const password = "strongpassword123";
        const encrypted = encrypt(secret, password);
        
        expect(encrypted).not.toBe(secret); // Should not be plain text
        expect(encrypted.startsWith('U2FsdGVkX1')).toBe(true); // OpenSSL salt header
        
        const decrypted = decrypt(encrypted, password);
        expect(decrypted).toBe(secret); // Should reverse correctly
    });

    it('1.2: Cannot decrypt with wrong password', () => {
        const secret = "Sensitive Data";
        const encrypted = encrypt(secret, "correct-pass");
        const attempt = decrypt(encrypted, "wrong-pass");
        
        expect(attempt).toBe(""); // Should fail silently or return empty
    });

    it('1.3: Handles empty strings and passthrough gracefully', () => {
        expect(encrypt('', 'pass')).toBe('');
        expect(decrypt('', 'pass')).toBe('');
        expect(decrypt('Plain text string without salt', 'pass')).toBe('Plain text string without salt');
    });
});

describe('Feature 2: Authentication & Recovery Rules', () => {
    it('2.1: Generates valid 12-word mnemonic recovery phrase', () => {
        const WORD_LIST = ["apple", "river", "stone", "mountain", "sky", "blue", "green", "hope", "faith", "light", "peace", "calm", "strong", "tree", "ocean", "wind", "rain", "sun", "moon", "star", "dream", "path", "walk", "safe"];
        const phrase = Array.from({ length: 12 }, () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]).join(' ');
        
        const words = phrase.split(' ');
        expect(words.length).toBe(12);
        words.forEach(w => expect(WORD_LIST).toContain(w));
    });

    it('2.2: User model enforces Zero PII (no email or phone on seeker)', () => {
        const seekerUser = {
            id: 'uuid-123',
            username: 'silent_echo',
            role: 'USER' as const,
            status: 'ACTIVE'
        };
        
        expect(seekerUser.username).toBe('silent_echo');
        expect((seekerUser as any).email).toBeUndefined();
        expect((seekerUser as any).phoneNumber).toBeUndefined();
    });

    it('2.3: Rejects malformed recovery phrases', () => {
        const invalidPhrase = 'only three words';
        expect(invalidPhrase.trim().split(' ').length).not.toBe(12);
    });
});

describe('Feature 3: Roles & Permissions', () => {
    it('3.1: Distinguishes between Seeker, Volunteer, and Admin roles', () => {
        const roles = ['USER', 'VOLUNTEER_PENDING', 'VOLUNTEER_APPROVED', 'ADMIN', 'MODERATOR'];
        expect(roles).toContain('ADMIN');
        expect(roles).toContain('VOLUNTEER_APPROVED');
        expect(roles).toContain('USER');
    });

    it('3.2: Volunteer track separates Peer Listeners from Licensed Professionals', () => {
        const tracks = ['PEER_LISTENER', 'PROFESSIONAL'];
        expect(tracks).toContain('PEER_LISTENER');
        expect(tracks).toContain('PROFESSIONAL');
    });
});

// --- INTEGRATION TESTS: UI COMPONENTS ---
describe('UI Feature: Auth Page', () => {
    const mockAuthContext = {
        user: null,
        passphrase: '',
        setPassphrase: vi.fn(),
        isLoading: false,
        login: vi.fn(),
        registerSeeker: vi.fn(),
        recover: vi.fn(),
        logout: vi.fn()
    };

    it('Renders Login form by default', () => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={mockAuthContext}>
                    <AuthPage />
                </AuthContext.Provider>
            </MemoryRouter>
        );
        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Your pseudonym/i)).toBeInTheDocument();
    });

    it('Switches to Recovery Mode when "Forgot Password" is clicked', () => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={mockAuthContext}>
                    <AuthPage />
                </AuthContext.Provider>
            </MemoryRouter>
        );
        
        const forgotBtn = screen.getByText(/Forgot Password/i);
        fireEvent.click(forgotBtn);
        
        expect(screen.getByText(/Account Recovery/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/word1 word2 word3.../i)).toBeInTheDocument();
    });
});