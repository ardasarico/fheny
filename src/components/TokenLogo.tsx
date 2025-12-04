'use client';

import tokenData from '@/data/tokenData.json';
import type { TokenDataConfig } from '@/types/token';
import Image from 'next/image';
import { useState } from 'react';

const ETH_LOGO = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';

const config = tokenData as TokenDataConfig;

// Get logo URL from tokenData.json or return undefined
export function getTokenLogo(symbolOrAddress: string): string | undefined {
  if (symbolOrAddress.toUpperCase() === 'ETH') {
    return ETH_LOGO;
  }

  const address = symbolOrAddress.toLowerCase();
  return config.tokens[address]?.logo;
}

interface TokenLogoProps {
  symbol: string;
  address?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-xl',
};

export default function TokenLogo({ symbol, address, size = 'md', className = '' }: TokenLogoProps) {
  const [hasError, setHasError] = useState(false);

  // Get logo from tokenData.json
  const logo = address ? getTokenLogo(address) : getTokenLogo(symbol);

  // Generate a consistent color based on symbol
  const getColorClass = (sym: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-600',
      'bg-purple-500/20 text-purple-600',
      'bg-green-500/20 text-green-600',
      'bg-orange-500/20 text-orange-600',
      'bg-pink-500/20 text-pink-600',
      'bg-cyan-500/20 text-cyan-600',
      'bg-indigo-500/20 text-indigo-600',
      'bg-amber-500/20 text-amber-600',
    ];
    const index = sym.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const sizeClass = sizeClasses[size];
  const textSize = textSizeClasses[size];

  // Fallback: show first letter of symbol with colored background
  if (!logo || hasError) {
    return (
      <div className={`flex items-center justify-center rounded-full ${sizeClass} ${getColorClass(symbol)} ${className}`}>
        <span className={`font-semibold ${textSize}`}>{symbol?.charAt(0) || '?'}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-full bg-neutral-100 ${sizeClass} ${className}`}>
      <Image src={logo} alt={symbol} fill className="object-cover" onError={() => setHasError(true)} />
    </div>
  );
}
