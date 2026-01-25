import React from "react";

interface UsageSparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

export const UsageSparkline: React.FC<UsageSparklineProps> = ({
    data,
    width = 60,
    height = 20,
    color = "#3b82f6",
}) => {
    if (!data || data.length === 0) {
        return null;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg
            width={width}
            height={height}
            className="inline-block"
            style={{ verticalAlign: "middle" }}
        >
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
            />
            {/* Add a dot at the end */}
            <circle
                cx={(data.length - 1) / (data.length - 1) * width}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="3"
                fill={color}
                className="drop-shadow-sm"
            />
        </svg>
    );
};
