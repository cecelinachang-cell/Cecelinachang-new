'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/6281234567890?text=Halo%20Cece%20Lina%20Chang,%20saya%20ingin%20bertanya..."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
}
