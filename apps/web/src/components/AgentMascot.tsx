import { useId } from 'react';

/** Small vector character: no video, remote assets or WebGL render loop. */
export default function AgentMascot({ depth = true }: { depth?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="eg-agent-mascot" viewBox="0 0 100 104" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-shell`} x1="26" y1="25" x2="76" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6FFF4" /><stop offset="0.48" stopColor="#79E7B9" /><stop offset="1" stopColor="#149B75" />
        </linearGradient>
        <linearGradient id={`${id}-visor`} x1="27" y1="42" x2="77" y2="69" gradientUnits="userSpaceOnUse">
          <stop stopColor="#153E3B" /><stop offset="1" stopColor="#081E28" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="42" y1="7" x2="64" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D5FF8F" /><stop offset="1" stopColor="#49C996" />
        </linearGradient>
      </defs>
      <ellipse className="eg-agent-shadow" cx="50" cy="97" rx="25" ry="4" fill="#063F34" fillOpacity=".18" />
      <g className="eg-agent-hover">
        <g className="eg-agent-left-arm"><path d="M25 52C15 48 12 59 18 69" stroke="#42BA94" strokeWidth="8" strokeLinecap="round" /><circle cx="18" cy="70" r="5" fill="#B0F7D4" /></g>
        <g className="eg-agent-right-arm"><path d="M75 52C85 48 88 59 82 69" stroke="#42BA94" strokeWidth="8" strokeLinecap="round" /><circle cx="82" cy="70" r="5" fill="#B0F7D4" /></g>
        <path d="M42 79L39 87M58 79L61 87" stroke="#178A6F" strokeWidth="8" strokeLinecap="round" />
        {depth && <rect x="26" y="31" width="54" height="51" rx="21" fill="#0B765C" />}
        <rect x="23" y="27" width="54" height="53" rx="21" fill={depth ? `url(#${id}-shell)` : '#8AE8BF'} stroke="#177E62" strokeWidth="1.5" />
        <path d="M34 32C40 29 52 29 59 31" stroke="white" strokeOpacity=".65" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="28" y="40" width="44" height="28" rx="12" fill={depth ? `url(#${id}-visor)` : '#153D3B'} />
        <g className="eg-agent-eyes">
          <rect x="36" y="48" width="6" height="9" rx="3" fill="#CDFFE7" />
          <rect x="58" y="48" width="6" height="9" rx="3" fill="#CDFFE7" />
        </g>
        <path d="M45 59Q50 63 55 59" stroke="#7AE1BA" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="73" r="2" fill="#13775D" />
        <path d="M50 28V19" stroke="#177E62" strokeWidth="3" strokeLinecap="round" />
        <g className="eg-agent-sprout">
          <path d="M50 22C39 22 34 15 36 8C45 7 51 12 50 22Z" fill={depth ? `url(#${id}-leaf)` : '#87DB81'} stroke="#178063" strokeWidth="1.2" />
          <path d="M50 22C50 11 57 5 65 7C65 16 59 22 50 22Z" fill={depth ? `url(#${id}-leaf)` : '#B7EE94'} stroke="#178063" strokeWidth="1.2" />
        </g>
      </g>
      <g className="eg-agent-thinking"><circle cx="39" cy="94" r="2" fill="#167D63" /><circle cx="50" cy="94" r="2" fill="#167D63" /><circle cx="61" cy="94" r="2" fill="#167D63" /></g>
    </svg>
  );
}
