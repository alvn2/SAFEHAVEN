import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InstallPrompt } from '../components/InstallPrompt';

describe('PWA InstallPrompt Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Default matchMedia mock
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing initially when not installed and no install prompt has fired', () => {
    const { container } = render(<InstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if already running in standalone display mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<InstallPrompt />);

    // Even if beforeinstallprompt fires, it should remain hidden
    act(() => {
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    });

    expect(screen.queryByText('Install SafeHaven')).not.toBeInTheDocument();
  });

  it('displays install prompt when beforeinstallprompt event is fired', () => {
    render(<InstallPrompt />);

    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const mockUserChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    act(() => {
      const event = Object.assign(new Event('beforeinstallprompt'), {
        prompt: mockPrompt,
        userChoice: mockUserChoice,
      });
      window.dispatchEvent(event);
    });

    expect(screen.getByText('Install SafeHaven')).toBeInTheDocument();
    expect(screen.getByText('Install App')).toBeInTheDocument();
  });

  it('triggers deferred prompt when Install App is clicked', async () => {
    render(<InstallPrompt />);

    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const mockUserChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    act(() => {
      const event = Object.assign(new Event('beforeinstallprompt'), {
        prompt: mockPrompt,
        userChoice: mockUserChoice,
      });
      window.dispatchEvent(event);
    });

    const installBtn = screen.getByText('Install App');
    await act(async () => {
      fireEvent.click(installBtn);
    });

    expect(mockPrompt).toHaveBeenCalledTimes(1);
  });

  it('dismisses prompt when Not now is clicked and saves to sessionStorage', () => {
    render(<InstallPrompt />);

    act(() => {
      const event = Object.assign(new Event('beforeinstallprompt'), {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
      });
      window.dispatchEvent(event);
    });

    const notNowBtn = screen.getByText('Not now');
    fireEvent.click(notNowBtn);

    expect(screen.queryByText('Install SafeHaven')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('sh_pwa_dismissed')).toBe('true');
  });

  it('shows iOS instructions modal on iOS devices when user clicks Install', () => {
    // Mock user agent for iPhone
    const originalUA = window.navigator.userAgent;
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      configurable: true,
    });

    render(<InstallPrompt />);

    expect(screen.getByText('Install SafeHaven')).toBeInTheDocument();

    // Click Install App
    const installBtn = screen.getByText('Install App');
    fireEvent.click(installBtn);

    // Modal should now be visible
    expect(screen.getByText('Install on iPhone & iPad')).toBeInTheDocument();
    expect(screen.getByText(/Tap the/i)).toBeInTheDocument();
    expect(screen.getByText('Got it')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Got it'));
    expect(screen.queryByText('Install on iPhone & iPad')).not.toBeInTheDocument();

    // Reset user agent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUA,
      configurable: true,
    });
  });
});
