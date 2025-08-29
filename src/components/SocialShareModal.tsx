import React, { useState } from 'react';
import { X, Copy, Share2, Heart, Camera, Download } from 'lucide-react';
import { Destination } from '../types';

interface SocialShareModalProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  destination,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  if (!isOpen) return null;

  const shareTemplates = [
    {
      platform: 'TikTok',
      emoji: '🎬',
      color: 'from-pink-500 to-red-500',
      text: `POV: You're planning your next adventure and discover ${destination.name} 😍✈️\n\n${destination.description}\n\n#wanderlust #travel #${destination.name.toLowerCase().replace(/\s+/g, '')} #bucketlist #adventure #viral #fyp`
    },
    {
      platform: 'Instagram',
      emoji: '📸',
      color: 'from-purple-500 to-pink-500',
      text: `✨ WANDERLUST ALERT ✨\n\nJust discovered ${destination.name}, ${destination.country} and I'm OBSESSED! 😍\n\n${destination.description}\n\n💰 Budget: $${destination.dailyBudget.min}-${destination.dailyBudget.max}/day\n🌡️ Climate: ${destination.climate}\n⭐ Safety: ${destination.safetyRating}/10\n\n#wanderlust #travel #${destination.country.toLowerCase().replace(/\s+/g, '')} #bucketlist #adventure`
    },
    {
      platform: 'Twitter/X',
      emoji: '🐦',
      color: 'from-blue-400 to-blue-600',
      text: `🌍 Just found my next destination: ${destination.name}!\n\n${destination.description.substring(0, 100)}...\n\n💰 $${destination.dailyBudget.min}-${destination.dailyBudget.max}/day\n⭐ ${destination.safetyRating}/10 safety\n\n#travel #wanderlust #${destination.name.toLowerCase().replace(/\s+/g, '')}`
    },
    {
      platform: 'Snapchat',
      emoji: '👻',
      color: 'from-yellow-400 to-yellow-500',
      text: `OMG found the PERFECT travel spot! 🤩\n\n${destination.name} looks absolutely incredible!\n\n${destination.highlights.slice(0, 3).join(' • ')}\n\nWho wants to go with me?! ✈️`
    },
    {
      platform: 'Facebook',
      emoji: '👥',
      color: 'from-blue-600 to-blue-700',
      text: `Friends! I just discovered this amazing destination: ${destination.name}, ${destination.country} 🌍\n\n${destination.description}\n\nHighlights:\n${destination.highlights.slice(0, 5).map(h => `• ${h}`).join('\n')}\n\nDaily budget: $${destination.dailyBudget.min}-${destination.dailyBudget.max}\nSafety rating: ${destination.safetyRating}/10\n\nWho's ready for an adventure? Tag someone who needs to see this! ✈️`
    }
  ];

  const currentTemplate = shareTemplates[selectedTemplate];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareNatively = async () => {
    const shareData = {
      title: `Check out ${destination.name}!`,
      text: currentTemplate.text,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard(currentTemplate.text);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const generateHashtags = () => {
    const baseHashtags = ['#wanderlust', '#travel', '#adventure', '#bucketlist'];
    const locationHashtags = [
      `#${destination.name.toLowerCase().replace(/\s+/g, '')}`,
      `#${destination.country.toLowerCase().replace(/\s+/g, '')}`,
      `#${destination.continent.toLowerCase().replace(/\s+/g, '')}`
    ];
    const activityHashtags = destination.activities.slice(0, 3).map(activity => 
      `#${activity.toLowerCase().replace(/\s+/g, '')}`
    );
    
    return [...baseHashtags, ...locationHashtags, ...activityHashtags].join(' ');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center hero-container container">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="hero-text p-6 border-b bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Share2 className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Share Your Discovery</h2>
                  <p className="text-pink-100 text-sm">{destination.name}, {destination.country}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Platform Selector */}
          <div className="p-6 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-4">Choose Platform</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {shareTemplates.map((template, index) => (
                <button
                  key={template.platform}
                  onClick={() => setSelectedTemplate(index)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedTemplate === index
                      ? `bg-gradient-to-r ${template.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl mb-1">{template.emoji}</div>
                  <div className="text-xs font-medium">{template.platform}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="hero-text p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Preview for {currentTemplate.platform}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${currentTemplate.color}`}>
                {currentTemplate.emoji} {currentTemplate.platform}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-2 border-dashed border-gray-200">
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {currentTemplate.text}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => copyToClipboard(currentTemplate.text)}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : `bg-gradient-to-r ${currentTemplate.color} text-white hover:shadow-lg hover:scale-105`
                }`}
              >
                {copied ? (
                  <>
                    <Heart className="w-5 h-5 fill-current" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
              
              <button
                onClick={shareNatively}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-all duration-200 hover:scale-105"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Now</span>
              </button>
            </div>

            {/* Quick Hashtags */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">#️⃣</span>
                Trending Hashtags
              </h4>
              <div className="text-sm text-blue-700">
                {generateHashtags()}
              </div>
              <button
                onClick={() => copyToClipboard(generateHashtags())}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy hashtags
              </button>
            </div>

            {/* Viral Tips */}
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
              <h4 className="font-semibold text-pink-800 mb-2 flex items-center">
                <span className="mr-2">🚀</span>
                Viral Tips
              </h4>
              <ul className="text-sm text-pink-700 space-y-1">
                <li>• Post during peak hours (7-9 PM local time)</li>
                <li>• Add trending audio for TikTok/Instagram Reels</li>
                <li>• Use location tags and relevant hashtags</li>
                <li>• Engage with comments quickly after posting</li>
                <li>• Cross-post to multiple platforms for maximum reach</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};