import React, { useEffect, useState } from 'react';
import { Box, useTheme, keyframes } from '@mui/material';

interface LoginAvatarProps {
    isPasswordFocused: boolean;
    isTyping: boolean;
}

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

const LoginAvatar: React.FC<LoginAvatarProps> = ({ isPasswordFocused, isTyping }) => {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;

    // Mouse tracking state
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Calculate position relative to center of screen
            // Range: -1 to 1
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = (event.clientY / window.innerHeight) * 2 - 1;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Eye movement limits
    const maxMoveX = 15;
    const maxMoveY = 10;

    // Current eye position
    const eyeX = mousePos.x * maxMoveX;
    const eyeY = mousePos.y * maxMoveY;

    return (
        <Box
            sx={{
                width: 140,
                height: 140,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                mb: 2,
                overflow: 'hidden'
            }}
        >
            <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: 'visible' }}
            >
                <g style={{
                    animation: isTyping ? `${bounce} 0.3s infinite` : 'none',
                    transformOrigin: 'bottom center'
                }}>
                    {/* EAR LEFT */}
                    <circle cx="20" cy="30" r="15" fill={primaryColor} />
                    <circle cx="20" cy="30" r="8" fill={theme.palette.background.paper} opacity="0.3" />

                    {/* EAR RIGHT */}
                    <circle cx="100" cy="30" r="15" fill={primaryColor} />
                    <circle cx="100" cy="30" r="8" fill={theme.palette.background.paper} opacity="0.3" />

                    {/* HEAD */}
                    <rect x="10" y="20" width="100" height="90" rx="40" fill={primaryColor} />

                    {/* FACE SHADOW/HIGHLIGHT */}
                    <mask id="faceMask">
                        <rect x="10" y="20" width="100" height="90" rx="40" fill="white" />
                    </mask>
                    <circle cx="60" cy="120" r="50" fill="white" fillOpacity="0.1" mask="url(#faceMask)" />

                    {/* EYES GROUP */}
                    <g
                        style={{
                            transition: 'transform 0.1s ease-out',
                            transform: isPasswordFocused
                                ? 'translateY(-10px) scale(0.9)'
                                : `translate(${eyeX}px, ${eyeY}px)`
                        }}
                    >
                        {/* EYE LEFT */}
                        <circle cx="40" cy="60" r="10" fill="white" />
                        <circle
                            cx="40"
                            cy="60"
                            r={isTyping ? 5 : 4}
                            fill="#333"
                            style={{
                                transition: 'transform 0.1s',
                                transform: isPasswordFocused ? 'translate(0, 0)' : `translate(${eyeX * 0.2}px, ${eyeY * 0.2}px)`
                            }}
                        />

                        {/* EYE RIGHT */}
                        <circle cx="80" cy="60" r="10" fill="white" />
                        <circle
                            cx="80"
                            cy="60"
                            r={isTyping ? 5 : 4}
                            fill="#333"
                            style={{
                                transition: 'transform 0.1s',
                                transform: isPasswordFocused ? 'translate(0, 0)' : `translate(${eyeX * 0.2}px, ${eyeY * 0.2}px)`
                            }}
                        />
                    </g>

                    {/* CHEEKS (Blush) - Visible when typing */}
                    <circle
                        cx="35"
                        cy="80"
                        r="8"
                        fill="#ff8a80"
                        opacity={isTyping ? "0.6" : "0"}
                        style={{ transition: 'opacity 0.3s' }}
                    />
                    <circle
                        cx="85"
                        cy="80"
                        r="8"
                        fill="#ff8a80"
                        opacity={isTyping ? "0.6" : "0"}
                        style={{ transition: 'opacity 0.3s' }}
                    />

                    {/* MUZZLE */}
                    <ellipse cx="60" cy="80" rx="20" ry="16" fill={theme.palette.background.paper} />
                    <ellipse cx="60" cy="74" rx="8" ry="5" fill="#333" /> {/* Nose */}

                    {/* MOUTH */}
                    <path
                        d={
                            isPasswordFocused ? "M 55 88 Q 60 85 65 88" :
                                isTyping ? "M 52 86 Q 60 98 68 86" : // Happy open smile
                                    "M 55 88 Q 60 92 65 88" // Normal smile
                        }
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{ transition: 'd 0.3s' }}
                    />
                </g>

                {/* HANDS (Left and Right) */}
                <g
                    style={{
                        transformOrigin: '50% 100%',
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isPasswordFocused ? 'translateY(-15px) rotate(0deg)' : 'translateY(80px) rotate(45deg)'
                    }}
                >
                    <path d="M 10 110 C 10 90 25 55 45 55 C 55 55 60 65 50 75" stroke={primaryColor} strokeWidth="22" strokeLinecap="round" />
                    <circle cx="40" cy="60" r="7" fill={theme.palette.background.paper} opacity="0.6" style={{ transformOrigin: 'center' }} />
                </g>

                <g
                    style={{
                        transformOrigin: '50% 100%',
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isPasswordFocused ? 'translateY(-15px) rotate(0deg)' : 'translateY(80px) rotate(-45deg)'
                    }}
                >
                    <path d="M 110 110 C 110 90 95 55 75 55 C 65 55 60 65 70 75" stroke={primaryColor} strokeWidth="22" strokeLinecap="round" />
                    <circle cx="80" cy="60" r="7" fill={theme.palette.background.paper} opacity="0.6" />
                </g>

            </svg>
        </Box>
    );
};

export default LoginAvatar;
