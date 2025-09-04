
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiChevronDown, FiLoader } from 'react-icons/fi';
import { ItemDto } from '../types';

interface ComboboxProps {
    items: ItemDto[];
    value: string;
    onChange: (value: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({ items, value, onChange, isLoading = false, disabled = false }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedItem = useMemo(() => items.find(item => item.id === value), [items, value]);

    const filteredItems = useMemo(() => {
        if (!query) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
    }, [items, query]);

    const handleSelect = useCallback((itemId: string) => {
        onChange(itemId);
        const item = items.find(i => i.id === itemId);
        setQuery(item ? item.name : '');
        setIsOpen(false);
        inputRef.current?.focus();
    }, [onChange, items]);

    // Handle clicks outside the combobox to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setQuery(selectedItem?.name || '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedItem]);

    // Keyboard navigation
    useEffect(() => {
        if (isOpen && activeIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[activeIndex] as HTMLLIElement;
            activeItem?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex, isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredItems.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (isOpen && activeIndex >= 0 && filteredItems[activeIndex]) {
                    handleSelect(filteredItems[activeIndex].id);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setQuery(selectedItem?.name || '');
                break;
            case 'Tab':
                if (isOpen) {
                    setIsOpen(false);
                    setQuery(selectedItem?.name || '');
                }
                break;
        }
    };
    
    useEffect(() => {
        setQuery(selectedItem?.name || '');
    }, [selectedItem]);

    return (
        <div ref={containerRef} className="relative mt-1">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    {isLoading ? <FiLoader className="h-5 w-5 text-slate-400 animate-spin" /> : <FiSearch className="h-5 w-5 text-slate-400" />}
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === '') onChange(''); // Clear selection if input is cleared
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setActiveIndex(-1); // Reset active index on focus
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled || isLoading}
                    placeholder={isLoading ? "Carregando itens..." : "Pesquisar item..."}
                    className="w-full pl-11 pr-10 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-controls="combobox-options"
                    aria-activedescendant={activeIndex >= 0 ? `combobox-option-${activeIndex}` : undefined}
                />
                 <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle options"
                >
                    <FiChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <ul
                    ref={listRef}
                    id="combobox-options"
                    role="listbox"
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black/5 dark:ring-slate-700 overflow-auto focus:outline-none sm:text-sm"
                >
                    {filteredItems.length === 0 && query !== '' ? (
                        <li className="text-slate-500 cursor-default select-none relative py-2 px-4">
                            Nenhum item encontrado.
                        </li>
                    ) : (
                        filteredItems.map((item, index) => (
                            <li
                                key={item.id}
                                id={`combobox-option-${index}`}
                                role="option"
                                aria-selected={item.id === value}
                                onClick={() => handleSelect(item.id)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`cursor-pointer select-none relative py-2 pl-10 pr-4 transition-colors ${
                                    activeIndex === index
                                        ? 'text-white bg-primary-600'
                                        : 'text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span className={`block truncate ${item.id === value ? 'font-semibold' : 'font-normal'}`}>{item.name}</span>
                                {item.id === value ? (
                                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${activeIndex === index ? 'text-white' : 'text-primary-600'}`}>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </span>
                                ) : null}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default Combobox;
