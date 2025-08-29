import React, { useState } from 'react';
import { Cloud, Mail, Smartphone, Check, X, Copy, QrCode } from 'lucide-react';
import { SyncService } from '../services/syncService';
import { UserPreferences } from '../types';

interface SyncPanelProps {
  userPreferences: UserPreferences;
  onSyncComplete: (preferences: UserPreferences) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SyncPanel: React.FC<SyncPanelProps> = ({
  userPreferences,
  onSyncComplete,
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'success' | 'apply'>('email');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  const syncService = SyncService.getInstance();

  const handleCreateSync = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const code = await syncService.createSyncLink(email, {
        savedDestinations: userPreferences.savedDestinations,
        rejectedDestinations: userPreferences.rejectedDestinations,
        filters: userPreferences.filters,
        lastSync: Date.now(),
        deviceName: 'Current Device'
      });

      setGeneratedCode(code);
      setStep('code');
    } catch (error) {
      setError('Failed to create sync link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySync = async () => {
    if (!syncCode.trim() || !email.trim()) {
      setError('Please enter both email and sync code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const syncData = await syncService.applySyncCode(syncCode.toUpperCase(), email);
      if (syncData) {
        onSyncComplete({
          savedDestinations: syncData.savedDestinations,
          rejectedDestinations: syncData.rejectedDestinations,
          filters: syncData.filters
        });
        setStep('success');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid or expired sync code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show brief success feedback
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateQRCode = () => {
    const syncUrl = `${window.location.origin}?sync=${generatedCode}`;
    // In a real app, you'd use a QR code library here
    // For now, we'll just show the URL
    return syncUrl;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center hero-container container">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="hero-text p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cloud className="w-6 h-6" />
                <h2 className="text-xl font-bold">Sync Your Wanderlist</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-2">
              Access your saved destinations on any device
            </p>
          </div>

          {/* Content */}
          <div className="hero-text p-6">
            {step === 'email' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Create Your Sync Link
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We'll generate a magic link to sync your destinations across devices
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateSync()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll never spam you or share your email
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCreateSync}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Magic Link...' : 'Create Sync Link'}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setStep('apply')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Already have a sync code? Apply it here
                  </button>
                </div>
              </div>
            )}

            {step === 'code' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Your Magic Code
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Use this code on any device to sync your destinations
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Your Sync Code:</p>
                    <div className="text-2xl font-bold text-blue-600 font-mono tracking-wider mb-3">
                      {generatedCode}
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedCode)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </button>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    🔐 Your Data is Protected
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Data is encrypted before storage</li>
                    <li>• Only you can decrypt with your email</li>
                    <li>• Codes expire in 24 hours</li>
                    <li>• No personal data stored on servers</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">How to use:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Open Wanderlist on another device</li>
                    <li>2. Click the sync button</li>
                    <li>3. Enter your email and this code</li>
                    <li>4. Your destinations will sync instantly!</li>
                  </ol>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    This code expires in 24 hours
                  </p>
                </div>
              </div>
            )}

            {step === 'apply' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Smartphone className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Apply Sync Code
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enter your sync code to restore your saved destinations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sync Code
                  </label>
                  <input
                    type="text"
                    value={syncCode}
                    onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                    placeholder="GOLDEN-TOKYO-42"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center tracking-wider"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplySync()}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the same email used to create the sync code
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleApplySync}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Syncing...' : 'Apply Sync Code'}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setStep('email')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Don't have a code? Create one
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Sync Complete!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your destinations have been successfully synced to this device
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 font-medium">Saved Destinations:</p>
                      <p className="text-green-600">{userPreferences.savedDestinations.length}</p>
                    </div>
                    <div>
                      <p className="text-green-700 font-medium">Filters Applied:</p>
                      <p className="text-green-600">
                        {Object.keys(userPreferences.filters).length}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Start Exploring!
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};