import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
    className?: string; // Standard className prop
    size?: number; // Size prop
    open?: boolean; // Kept for compatibility, though animation handles it
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className = '', size = 56, open = true }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <motion.svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                className="overflow-visible"
            >
                {/* Container Group for Rotation - The entire box spins */}
                <motion.g
                    style={{ originX: "50px", originY: "50px", transformBox: "fill-box" }}
                    animate={{ rotate: [0, 0, 360, 360, 0] }} // Sequence: Wait, Wait, Rotate, Wait, Reset
                    transition={{
                        duration: 5,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.5, 0.8, 1], // Timing stops
                        repeat: Infinity,
                        repeatDelay: 1
                    }}
                >
                    {/* Box Body (Main Blue Shape) */}
                    <path
                        d="M 20 35 L 80 35 L 80 80 Q 80 90 70 90 L 30 90 Q 20 90 20 80 Z"
                        fill="#4F46E5" // Indigo 600
                    />

                    {/* Inner Content (Symbol - C/W or Document Lines) that is revealed */}
                    <circle cx="50" cy="60" r="12" fill="white" fillOpacity="0.95" />
                    <path d="M 50 48 L 50 72 M 38 60 L 62 60" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />

                    {/* Lid / Top Flap - Animates Open/Close */}
                    <motion.path
                        d="M 20 35 L 80 35 L 70 15 L 30 15 Z"
                        fill="#4338CA" // Indigo 700 (Darker for Contrast)
                        style={{ originY: 1, originX: 0.5, transformOrigin: "50% 35px" }} // Hinge at the top of the box body
                        animate={{
                            rotateX: [0, -180, -180, 0] // Closed -> Open Flat -> Stay Open -> Close
                        }}
                        transition={{
                            duration: 5, // Sync with the rotation
                            ease: "easeInOut",
                            times: [0, 0.15, 0.85, 1], // Open quickly, stay open long, close at end
                            repeat: Infinity,
                            repeatDelay: 1
                        }}
                    />
                </motion.g>
            </motion.svg>
        </div>
    );
};
