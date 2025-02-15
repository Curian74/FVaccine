import React, { useState, useEffect, useCallback, useRef } from "react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import iconList from '@/helpers/constants/lucide-icons.json';

interface IconPickerProps {
    value?: string;
    onChange?: (iconName: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
    const [isDropdownAbove, setIsDropdownAbove] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const convertIconName = (name: string) => {
        name = name.replace(/Icon$/, '');
        return name.split(/(?=[A-Z])/).join('-');
    };

    const isValidIcon = useCallback((iconName: string) => {
        const convertedName = convertIconName(iconName);
        return Icons[convertedName as keyof typeof Icons] !== undefined;
    }, []);

    useEffect(() => {
        const validIcons = iconList.filter(isValidIcon);

        if (searchTerm) {
            const filtered = validIcons.filter(name =>
                name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredIcons(filtered);
        } else {
            setFilteredIcons(validIcons.slice(0, 3000));
        }
    }, [searchTerm, isValidIcon]);

    const handleSelectIcon = (iconName: string) => {
        onChange?.(convertIconName(iconName));
        setIsPickerOpen(false);
    };

    const renderIcon = (iconName: string) => {
        const convertedName = convertIconName(iconName);
        const Icon = Icons[convertedName as keyof typeof Icons] as LucideIcon;
        return Icon ? <Icon size={20} /> : null;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.icon-picker-container')) {
                setIsPickerOpen(false);
            }
        };

        if (isPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPickerOpen]);

    useEffect(() => {
        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;

            if (spaceBelow < 200 && spaceAbove > 200) {
                setIsDropdownAbove(true);
            } else {
                setIsDropdownAbove(false);
            }
        }
    }, [isPickerOpen]);

    return (
        <div className="relative icon-picker-container">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="p-2 border rounded-md hover:bg-gray-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
                {value ? renderIcon(value) : <span><Icons.Smile /></span>}
            </button>

            {isPickerOpen && (
                <div
                    className={`absolute z-50 left-0 mt-1 bg-white border rounded-lg shadow-lg w-[320px] ${isDropdownAbove ? 'bottom-full mb-2' : 'top-full mt-1'
                        }`}
                >
                    <div className="p-2 border-b sticky top-0 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm icon..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                    </div>

                    <div className="p-2">
                        <div className="grid grid-cols-6 gap-1 max-h-[320px] overflow-y-auto">
                            {filteredIcons.map((iconName) => (
                                <button
                                    key={iconName}
                                    onClick={() => handleSelectIcon(iconName)}
                                    className={`p-2 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors
                                        ${value === iconName ? 'bg-gray-100 ring-2 ring-blue-500' : ''}`}
                                    title={iconName}
                                >
                                    {renderIcon(iconName)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredIcons.length === 0 && (
                        <div className="p-4 flex justify-center text-gray-500">
                            No matching icon found
                            <Icons.Frown className="ml-3"/>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IconPicker;
