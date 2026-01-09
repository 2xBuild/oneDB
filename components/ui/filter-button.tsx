"use client";

interface FilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    count?: number;
}

export function FilterButton({ label, isActive, onClick, count }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`filter-btn ${isActive ? 'active' : ''}`}
        >
            {label}
            {count !== undefined && ` (${count})`}
        </button>
    );
}
