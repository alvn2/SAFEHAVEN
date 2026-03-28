import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../lib/storage';
import { encrypt, decrypt } from '../lib/encryption';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthPage } from '../pages/AuthPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// --- UNIT TESTS: LOGIC & CRYPTO ---
describe('Feature 1: Zero-Knowledge Security', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('1.1: Encrypts data properly (Ciphertext check)', () => {
        const secret = "My deepest secret";
        const password = "strongpassword123";
        const encrypted = encrypt(secret, password);
        
        expect(encrypted).not.toBe(secret); // Should not be plain text
        expect(encrypted).not.toBe(""); // Should exist
        
        const decrypted = decrypt(encrypted, password);
        expect(decrypted).toBe(secret); // Should reverse correctly
    });

    it('1.2: Cannot decrypt with wrong password', () => {
        const secret = "Sensitive Data";
        const encrypted = encrypt(secret, "correct-pass");
        const attempt = decrypt(encrypted, "wrong-pass");
        
        expect(attempt).toBe(""); // Should fail silently or return empty
    });
});

describe('Feature 2: Authentication & Recovery', () => {
    beforeEach(() => { localStorage.clear(); });

    it('2.1: Registers user anonymously (No email/phone)', () => {
        const { user, recoveryKey } = StorageService.registerSeeker('ghost_user', 'pass123');
        
        expect(user.username).toBe('ghost_user');
        expect(user.email).toBeUndefined(); // Verify no PII
        expect(recoveryKey.split(' ').length).toBe(12); // Verify 12-word phrase
    });

    it('2.2: Login works with correct hash', () => {
        StorageService.registerSeeker('test_user', 'pass123');
        const loggedIn = StorageService.login('test_user', 'pass123');
        
        expect(loggedIn).not.toBeNull();
        expect(loggedIn?.username).toBe('test_user');
    });

    it('2.3: Recovery Challenge Logic', () => {
        // 1. Setup User
        const { user, recoveryKey } = StorageService.registerSeeker('forgotten_soul', 'oldpass');
        const words = recoveryKey.split(' ');
        
        // 2. Initiate Recovery
        const challenge: any = StorageService.initiateRecovery('forgotten_soul');
        expect(challenge).not.toBeNull();
        
        const index = challenge!.challengeIndex;
        const targetWord = words[index]; // The correct answer
        
        // 3. Verify correct word resets password
        const success = StorageService.verifyRecovery('forgotten_soul', targetWord, index, 'newpass123');
        expect(success).toBe(true);
        
        // 4. Verify new password works
        const newUser = StorageService.login('forgotten_soul', 'newpass123');
        expect(newUser).not.toBeNull();
    });
});

describe('Feature 3: Roles & Admin', () => {
    beforeEach(() => { localStorage.clear(); });

    it('3.1: Developer "God Mode" login works', () => {
        const devUser = StorageService.login('dev', 'admin123');
        expect(devUser?.role).toBe('ADMIN');
        expect(devUser?.id).toBe('dev_admin');
    });

    it('3.2: Standard user cannot access admin functions', () => {
        const { user } = StorageService.registerSeeker('regular_joe', '123');
        expect(user.role).toBe('USER');
    });
});

// --- INTEGRATION TESTS: UI COMPONENTS ---
describe('UI Feature: Auth Page', () => {
    it('Renders Login form by default', () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            </MemoryRouter>
        );
        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Your pseudonym/i)).toBeInTheDocument();
    });

    it('Switches to Recovery Mode when "Forgot Password" is clicked', () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            </MemoryRouter>
        );
        
        const forgotBtn = screen.getByText(/Forgot Password/i);
        fireEvent.click(forgotBtn);
        
        // It should show validation error first if username is empty (Security feature)
        expect(screen.getByText(/enter your username/i)).toBeInTheDocument();
    });
});