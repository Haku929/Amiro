import React from 'react';

export default function AmiroLogo({ className = "" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 240 60" 
      width="240" 
      height="60" 
      role="img" 
      aria-label="Amiro Logo"
      className={className}
    >
      <defs>
        <clipPath id="circle-clip">
          <circle cx="30" cy="30" r="24"/>
        </clipPath>
      </defs>

      <g transform="translate(35, 0)">
        
        <g transform="translate(0, 0)">
          <circle cx="30" cy="30" r="24" fill="#F0F9FF" stroke="#94A3B8" strokeWidth="2" className="stroke-slate-400 dark:stroke-slate-600 fill-slate-50 dark:fill-slate-900"/>
          
          <g clipPath="url(#circle-clip)">
            {/* Background of the circle is already set above, but rect was there. Let's make rect transparent or match circle */}
            {/* <rect x="0" y="0" width="60" height="60" fill="#F0F9FF"/> */} 
            {/* We can rely on the circle fill above. But to match original strictly: */}
            <rect x="0" y="0" width="60" height="60" className="fill-slate-50 dark:fill-slate-900"/>

            {/* Colored circles - Keep original colors */}
            <circle cx="20" cy="22" r="9" fill="#FF6B6B" /> 
            <circle cx="40" cy="22" r="9" fill="#4ECDC4" /> 
            <circle cx="30" cy="38" r="8" fill="#F6D32D" /> 
            
            {/* Glossy lines - white with opacity */}
            <line x1="-5" y1="45" x2="55" y2="-15" stroke="white" strokeWidth="4" opacity="0.9" strokeLinecap="round"/>
            <line x1="15" y1="55" x2="65" y2="5" stroke="white" strokeWidth="2" opacity="0.7" strokeLinecap="round"/>
          </g>
        </g>

        {/* Text Area */}
        <text 
          x="65" 
          y="40" 
          fontFamily="'Inter', sans-serif" 
          fontWeight="800" 
          fontSize="28" 
          letterSpacing="-0.5"
          className="fill-slate-800 dark:fill-slate-50 transition-colors"
        >
          Amiro
        </text>
        
        <text 
          x="66" 
          y="52" 
          fontFamily="'Inter', sans-serif" 
          fontWeight="500" 
          fontSize="8" 
          letterSpacing="0.5"
          className="fill-slate-500 dark:fill-slate-400 transition-colors"
        >
          MIRROR YOUR COLORS
        </text>
        
      </g>
    </svg>
  );
}
