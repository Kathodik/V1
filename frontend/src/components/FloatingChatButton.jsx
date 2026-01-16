import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import AIChat from './AIChat';
import { useLocation } from 'react-router-dom';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(`global-chat-${Date.now()}`);
  const location = useLocation();

  // Don't show on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] z-50 shadow-2xl rounded-lg overflow-hidden animate-fadeIn">
          <AIChat sessionId={sessionId} onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#2c7a7b] hover:bg-[#285e61] text-white shadow-lg transition-all duration-300 hover:scale-110"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </>
  );
};

export default FloatingChatButton;
