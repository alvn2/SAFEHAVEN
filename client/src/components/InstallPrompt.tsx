import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone/PWA mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
      return isStandaloneMedia || isIOSStandalone;
    };

    if (checkStandalone()) {
      setIsInstalled(true);
      return;
    }

    // Check session dismissal memory
    if (sessionStorage.getItem('sh_pwa_dismissed') === 'true') {
      setIsDismissed(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isAppleDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('sh_pwa_dismissed', 'true');
  };

  // Do not render if installed, dismissed, or if neither deferredPrompt nor iOS
  if (isInstalled || isDismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Bar */}
      <div 
        role="region"
        aria-label="Install SafeHaven App"
        className="fixed bottom-24 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-primary-200 dark:border-primary-800/60 rounded-2xl shadow-xl p-4 transition-all duration-300 animate-fade-in-up"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/50 rounded-xl text-primary-600 dark:text-primary-400 shrink-0">
              <Smartphone className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Install SafeHaven
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                Add to your home screen for quick offline access to crisis helplines and your encrypted reflections vault.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold rounded-lg shadow-sm shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Install App</span>
          </button>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl relative animate-fade-in-up">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              aria-label="Close installation instructions"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex p-3 bg-primary-100 dark:bg-primary-900/50 rounded-2xl text-primary-600 dark:text-primary-400 mb-3">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 id="ios-install-title" className="text-lg font-bold text-gray-900 dark:text-white">
                Install on iPhone & iPad
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Follow these 2 simple steps to add SafeHaven to your iOS home screen:
              </p>
            </div>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold shrink-0">
                  1
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-normal">
                  Tap the <strong className="font-semibold text-gray-900 dark:text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-primary-600 dark:text-primary-400" /> in your Safari browser navigation bar.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold shrink-0">
                  2
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-normal">
                  Scroll down the share sheet and tap <strong className="font-semibold text-gray-900 dark:text-white">"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full inline-flex justify-center items-center gap-1.5 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
