
import React, { useState, useEffect, FC, FormEvent, useMemo, useRef } from 'react';
import { User, Screen, Transaction, Purchase, AppSettings, Language, PaymentMethod, AppVisibility, Notification, DeveloperSettings, Banner, Theme, PopupConfig, FaqItem } from '../types';
import { db } from '../firebase';
import { ref, update, onValue, get, remove, push, set, runTransaction, query, limitToLast, orderByChild } from 'firebase/database';
import { 
    APP_LOGO_URL,
    DEFAULT_AVATAR_URL,
    DEFAULT_APP_SETTINGS,
    PROTECTION_KEY
} from '../constants';

// --- ICONS ---
const DashboardIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
const UsersIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const OrdersIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>);
const MoneyIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
const SettingsIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const LockIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const CheckIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>);
const ImageIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>);
const TagIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
const TrashIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
const CopyIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
const EditIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const WalletIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>);
const BellIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>);
const ContactIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const MenuIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const MegaphoneIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 11.11V4a2 2 0 0 1 2-2h4.76c1.53 0 2.9.86 3.57 2.24l1.18 2.43a2 2 0 0 0 1.8 1.12H20a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3.67a2 2 0 0 0-1.8 1.12l-1.18 2.43A4 4 0 0 1 9.76 20H5a2 2 0 0 1-2-2v-6.89z"/><path d="M13 11h.01"/></svg>);
const EyeIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const SearchIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const CodeIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>);
const RobotIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>);
const DollarIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
const GridIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
const BackIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const SortIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="M3 17l3 3 3-3"/><path d="M6 18V4"/></svg>);
const PlayIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>);
const PlusIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MinusIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const ShieldIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const GamepadIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>);
const HelpIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const GripIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
        <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
    </svg>
);
const ClockIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" /></svg>);

// Offer Icons
const DiamondIcon: FC<{className?: string}> = ({className}) => (<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 2L2 8.5l10 13.5L22 8.5 12 2z" /></svg>);
const StarIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const IdCardIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="9" x2="10" y2="9"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="14" y1="9" x2="18" y2="9"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="14" y1="15" x2="18" y2="15"/></svg>);
const CrownIcon: FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>);


interface AdminScreenProps {
    user: User;
    texts: any;
    onNavigate: (screen: Screen) => void;
    onLogout: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    appSettings: AppSettings;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const LiveAdminTimer: FC<{ date: string, limitMinutes: number }> = ({ date, limitMinutes }) => {
    const [remaining, setRemaining] = useState<number>(0);
    
    useEffect(() => {
        const update = () => {
            const start = new Date(date).getTime();
            const limit = limitMinutes * 60 * 1000;
            const diff = Date.now() - start;
            setRemaining(Math.max(0, limit - diff));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [date, limitMinutes]);

    if (remaining <= 0) return <span className="text-[10px] font-black text-red-500 uppercase animate-pulse">Time Up!</span>;

    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);

    return (
        <div className="flex items-center gap-1">
            <ClockIcon className={`w-3.5 h-3.5 ${remaining < 300000 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <span className={`text-xs font-mono font-black ${remaining < 300000 ? 'text-red-600' : 'text-primary'}`}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
        </div>
    );
};

const SidebarLink: FC<{ icon: FC<{className?: string}>, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group active:scale-95 ${
            active 
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className={`text-sm font-bold tracking-wide`}>{label}</span>
    </button>
);

const QuickActionCard: FC<{ label: string, icon: FC<{className?: string}>, color: string, onClick: () => void, count?: number }> = ({ label, icon: Icon, color, onClick, count }) => {
    const bgColors: {[key: string]: string} = {
        orange: 'bg-orange-500',
        purple: 'bg-purple-600',
        pink: 'bg-pink-500',
        blue: 'bg-blue-500'
    };
    const shadowColors: {[key: string]: string} = {
        orange: 'shadow-orange-500/30',
        purple: 'shadow-purple-600/30',
        pink: 'shadow-pink-500/30',
        blue: 'shadow-blue-500/30'
    };

    return (
        <button 
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110 hover:-translate-y-1 ${bgColors[color]} text-white shadow-lg ${shadowColors[color]}`}
        >
            <div className="absolute top-0 right-0 p-2 opacity-10"><Icon className="w-12 h-12" /></div>
            <Icon className="w-6 h-6 mb-1 relative z-10" />
            <span className="text-xs font-bold uppercase tracking-wider relative z-10">{label}</span>
            {count !== undefined && count > 0 && (
                <span className="absolute top-2 right-2 bg-white text-red-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                    {count}
                </span>
            )}
        </button>
    );
};

const SmartCopy: FC<{ text: string, label?: string, iconOnly?: boolean }> = ({ text, label, iconOnly }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button 
            onClick={handleCopy} 
            className={`flex items-center gap-1.5 ${iconOnly ? 'p-2' : 'px-3 py-1.5'} bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 border border-gray-100 dark:border-gray-600 max-w-full`}
            title="Click to copy"
        >
            {!iconOnly && <span className="font-mono text-[10px] text-gray-600 dark:text-gray-300 truncate max-w-[120px] sm:max-w-[150px]">{label || text}</span>}
            {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <CopyIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />}
        </button>
    );
};

const SearchInput: FC<{ value: string; onChange: (val: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => (
    <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
            type="text"
            className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-shadow shadow-sm"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const AdminScreen: FC<AdminScreenProps> = ({ user, onNavigate, onLogout, language, setLanguage, appSettings, theme, setTheme }) => {
    // Navigation State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'offers' | 'orders' | 'deposits' | 'tools' | 'settings'>('dashboard');
    const [activeTool, setActiveTool] = useState<'wallet' | 'ai' | 'graphics' | 'ads' | 'notifications' | 'contacts' | 'faqs'>('wallet');
    
    // Confirmation States
    const [pendingAction, setPendingAction] = useState<{ type: string; title: string; message: string; onConfirm: () => void } | null>(null);

    // User List Mode
    const [userListMode, setUserListMode] = useState<'all' | 'ad_rev' | 'active_gamers' | 'balance' | 'ai_usage' | 'ai_active'>('all');

    // Filter States
    const [orderFilter, setOrderFilter] = useState<'Pending' | 'Completed' | 'Failed'>('Pending');
    const [depositFilter, setDepositFilter] = useState<'Pending' | 'Completed' | 'Failed'>('Pending');

    // Search States
    const [userSearch, setUserSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [depositSearch, setDepositSearch] = useState('');

    // Data States
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Purchase[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    // Pagination States
    const [usersLimit, setUsersLimit] = useState(50);
    const [ordersLimit, setOrdersLimit] = useState(50);
    const [depositsLimit, setDepositsLimit] = useState(50);
    
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    const [hasMoreOrders, setHasMoreOrders] = useState(true);
    const [hasMoreDeposits, setHasMoreDeposits] = useState(true);

    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);
    const [isDepositsLoading, setIsDepositsLoading] = useState(false);

    // Animation State
    const [exitingItems, setExitingItems] = useState<Set<string>>(new Set());

    // Stats
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalDeposit: 0,
        pendingOrders: 0,
        pendingDeposits: 0,
        todayDeposit: 0,
        todayPurchase: 0,
        totalAdRevenue: 0,
        todayAdRevenue: 0,
        activeGamers: 0,
        usersTotalBalance: 0
    });
    const [aiOverview, setAiOverview] = useState({ totalInteractions: 0, activeAiUsers: 0 });
    
    // Settings State
    const [settings, setSettings] = useState<AppSettings>(appSettings);
    const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(appSettings);
    
    // Developer Settings State
    const [devSettings, setDevSettings] = useState<DeveloperSettings>(DEFAULT_APP_SETTINGS.developerSettings!);
    const [isDevUnlocked, setIsDevUnlocked] = useState(false);
    
    // Privacy Mechanism States
    const [showDevCard, setShowDevCard] = useState(false);
    const [headerTapCount, setHeaderTapCount] = useState(0);
    const tapTimeoutRef = useRef<number | null>(null);
    
    // Modals & Popups
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [securityKeyInput, setSecurityKeyInput] = useState('');
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
    const [tempBannerUrl, setTempBannerUrl] = useState('');
    const [tempActionUrl, setTempActionUrl] = useState('');
    const [apiKeyError, setApiKeyError] = useState('');

    // Offer State
    const [offerType, setOfferType] = useState<'diamond' | 'levelUp' | 'membership' | 'premium' | 'special'>('diamond');
    const [offersData, setOffersData] = useState<any>({ diamond: [], levelUp: [], membership: [], premium: [], special: [] });
    const [editingOffer, setEditingOffer] = useState<any>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    
    // Drag and Drop State for Offers
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Tools State
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [editingMethodIndex, setEditingMethodIndex] = useState<number | null>(null);
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [newBannerUrl, setNewBannerUrl] = useState('');
    const [newActionUrl, setNewActionUrl] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newNotif, setNewNotif] = useState({ title: '', title_bn: '', message: '', message_bn: '', type: 'admin' });
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [contacts, setContacts] = useState<any[]>([]);
    const [editingContact, setEditingContact] = useState<any>(null);
    const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [popupConfig, setPopupConfig] = useState<PopupConfig>({ active: false, title: 'Welcome', message: 'Welcome to our app!', imageUrl: '' });

    // Balance Modal
    const [balanceModalUser, setBalanceModalUser] = useState<User | null>(null);
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceAction, setBalanceAction] = useState<'add' | 'deduct'>('add');

    // Notification Trigger Logic
    const sendTriggerNotification = async (targetUid: string, type: 'success' | 'failed' | 'admin', en: { title: string, msg: string }, bn: { title: string, msg: string }) => {
        if (settings.autoNotifActive === false && type !== 'admin') return;
        try {
            const notifRef = ref(db, 'notifications');
            await push(notifRef, {
                title: en.title,
                title_bn: bn.title,
                message: en.msg,
                message_bn: bn.msg,
                timestamp: Date.now(),
                type: type,
                targetUid,
                isAuto: true 
            });
        } catch (e) { console.error("Error sending trigger notif", e); }
    };

    const animateAndAction = async (id: string, action: () => Promise<void>) => {
        setExitingItems(prev => new Set(prev).add(id));
        setTimeout(async () => {
            await action();
            setExitingItems(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 400); 
    };

    // --- GLOBAL AUTO REFUND WATCHER FOR ADMIN ---
    useEffect(() => {
        if (activeTab !== 'orders' && activeTab !== 'dashboard') return;
        
        const checkRefunds = async () => {
            if (settings.autoRefundActive === false) return;
            const refundLimitMs = (settings.autoRefundMinutes || 30) * 60 * 1000;
            const now = Date.now();

            orders.forEach(async (order) => {
                if (order.status === 'Pending' && order.key && order.userId) {
                    const start = new Date(order.date).getTime();
                    if (now - start >= refundLimitMs) {
                        // 1. Delete Order (Automatic removal)
                        const orderRef = ref(db, `orders/${order.userId}/${order.key}`);
                        await remove(orderRef);
                        
                        // 2. Refund balance
                        const userRef = ref(db, `users/${order.userId}`);
                        await runTransaction(userRef, (userData) => {
                            if (userData) {
                                userData.balance = (Number(userData.balance) || 0) + Number(order.offer?.price || 0);
                            }
                            return userData;
                        });

                        // 3. Update Notifications
                        await sendTriggerNotification(
                            order.userId, 
                            'failed', 
                            { 
                                title: "Order Auto-Refunded", 
                                msg: `Order ID: ${order.id} for ৳${order.offer?.price} was not processed within ${settings.autoRefundMinutes} mins and has been auto-refunded and deleted.` 
                            }, 
                            { 
                                title: "অর্ডার অটো-রিফান্ড", 
                                msg: `অর্ডার আইডি: ${order.id} (৳${order.offer?.price}) নির্দিষ্ট সময়ে সম্পন্ন না হওয়ায় এটি মুছে ফেলা হয়েছে এবং টাকা রিফান্ড করা হয়েছে।` 
                            }
                        );
                    }
                }
            });
        };

        const timer = setInterval(checkRefunds, 10000); // Check every 10s
        return () => clearInterval(timer);
    }, [orders, settings.autoRefundActive, settings.autoRefundMinutes, activeTab]);

    const handleHeaderTap = () => {
        const newCount = headerTapCount + 1;
        setHeaderTapCount(newCount);
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        if (newCount >= 5) {
            setShowDevCard(prev => !prev);
            setHeaderTapCount(0);
        } else {
            tapTimeoutRef.current = window.setTimeout(() => setHeaderTapCount(0), 800);
        }
    };

    const handleLogoutClick = () => {
        setPendingAction({
            type: 'logout',
            title: 'Confirm Logout',
            message: 'Are you sure you want to log out from the Admin Panel?',
            onConfirm: () => { onLogout(); setPendingAction(null); }
        });
    };

    useEffect(() => {
        const fetchDashboardStats = () => {
            const usersRef = ref(db, 'users');
            const usersQuery = query(usersRef, limitToLast(1000));
            onValue(usersQuery, (snap) => {
                if(snap.exists()) {
                    const data = snap.val();
                    const values: any[] = Object.values(data);
                    
                    const totalAdRev = values.reduce((acc: number, u: any) => acc + (u.totalEarned || 0), 0);
                    const totalInteractions = values.reduce((acc: number, u: any) => acc + (u.aiRequestCount || 0), 0);
                    
                    const todayStr = new Date().toDateString();
                    const activeAiUsersToday = values.filter((u: any) => {
                        if (!u.lastAiInteraction) return false;
                        return new Date(u.lastAiInteraction).toDateString() === todayStr;
                    }).length;
                    
                    const activeGamersCount = values.filter((u: any) => (u.gamerLevels?.unlocked || 0) >= 10).length;
                    const totalBalanceSum = values.reduce((acc: number, u: any) => acc + (Number(u.balance) || 0), 0);

                    setAiOverview({ totalInteractions, activeAiUsers: activeAiUsersToday });
                    setDashboardStats(prev => ({ 
                        ...prev, 
                        totalUsers: Object.keys(data).length, 
                        totalAdRevenue: totalAdRev,
                        activeGamers: activeGamersCount,
                        usersTotalBalance: totalBalanceSum
                    }));
                }
            });

            onValue(ref(db, 'orders'), (snap) => {
                if(snap.exists()) {
                    let pendingCount = 0;
                    let todayPurchaseAmt = 0;
                    const todayStr = new Date().toDateString();
                    snap.forEach(userOrders => {
                        const uOrders = userOrders.val();
                        if (uOrders) {
                            Object.values(uOrders).forEach((order: any) => {
                                if (order.status === 'Pending') pendingCount++;
                                if (order.status === 'Completed' && new Date(order.date).toDateString() === todayStr) {
                                    todayPurchaseAmt += (order.offer?.price || 0);
                                }
                            });
                        }
                    });
                    setDashboardStats(prev => ({ ...prev, pendingOrders: pendingCount, todayPurchase: todayPurchaseAmt }));
                }
            });

            onValue(ref(db, 'transactions'), (snap) => {
                if(snap.exists()) {
                    let pendingCount = 0;
                    let todayDepositAmt = 0;
                    let todayAdRevAmt = 0;
                    let totalDep = 0;
                    const todayStr = new Date().toDateString();
                    snap.forEach(userTxns => {
                        const uTxns = userTxns.val();
                        if (uTxns) {
                            Object.values(uTxns).forEach((txn: any) => {
                                if (txn.type === 'ad_reward' || txn.method === 'Ad Watch') {
                                    if (new Date(txn.date).toDateString() === todayStr) todayAdRevAmt += txn.amount;
                                    return; 
                                }
                                if (txn.status === 'Pending') pendingCount++;
                                if (new Date(txn.date).toDateString() === todayStr) {
                                    if (txn.status === 'Completed') todayDepositAmt += txn.amount;
                                }
                                if (txn.status === 'Completed') totalDep += txn.amount;
                            });
                        }
                    });
                    setDashboardStats(prev => ({ 
                        ...prev, 
                        pendingDeposits: pendingCount, 
                        todayDeposit: todayDepositAmt,
                        todayAdRevenue: todayAdRevAmt,
                        totalDeposit: totalDep
                    }));
                }
            });
        };

        fetchDashboardStats();

        onValue(ref(db, 'config'), (snap) => {
            if(snap.exists()) {
                const data = snap.val();
                if(data.appSettings) {
                    const mergedSettings = { ...data.appSettings, earnSettings: { ...DEFAULT_APP_SETTINGS.earnSettings, ...(data.appSettings.earnSettings || {}) }, uiSettings: { ...DEFAULT_APP_SETTINGS.uiSettings, ...(data.appSettings.uiSettings || {}) } };
                    setSettings(mergedSettings); setOriginalSettings(mergedSettings); 
                    if (data.appSettings.developerSettings) setDevSettings(data.appSettings.developerSettings);
                    if (data.appSettings.popupNotification) setPopupConfig(data.appSettings.popupNotification);
                }
                if(data.offers) {
                    setOffersData({
                        diamond: data.offers.diamond ? Object.values(data.offers.diamond) : [],
                        levelUp: data.offers.levelUp ? Object.values(data.offers.levelUp) : [],
                        membership: data.offers.membership ? Object.values(data.offers.membership) : [],
                        premium: data.offers.premium ? Object.values(data.offers.premium) : [],
                        special: data.offers.special ? Object.values(data.offers.special) : [],
                    });
                }
                if(data.banners) {
                    const rawBanners = Object.values(data.banners);
                    const formattedBanners = rawBanners.map((b: any) => typeof b === 'string' ? { imageUrl: b, actionUrl: '' } : b);
                    setBanners(formattedBanners);
                }
                if(data.paymentMethods) setPaymentMethods(Object.values(data.paymentMethods));
                if (data.supportContacts) setContacts(Object.values(data.supportContacts));
                if (data.faqs) setFaqs(Object.values(data.faqs));
            }
        });
    }, []);

    // PAGINATED DATA FETCHING
    useEffect(() => {
        if (activeTab === 'users') {
            setIsUsersLoading(true);
            const usersRef = ref(db, 'users');
            const usersQuery = query(usersRef, orderByChild('totalSpent'), limitToLast(usersLimit));
            
            const unsub = onValue(usersQuery, (snap) => {
                if(snap.exists()) {
                    const data = snap.val();
                    const uList: User[] = Object.keys(data).map(key => ({ ...data[key], uid: key }))
                        .sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0));
                    setUsers(uList);
                    setHasMoreUsers(uList.length >= usersLimit);
                } else {
                    setUsers([]);
                    setHasMoreUsers(false);
                }
                setIsUsersLoading(false);
            });
            return () => unsub();
        }
    }, [activeTab, usersLimit]);

    useEffect(() => {
        if (activeTab === 'orders') {
            setIsOrdersLoading(true);
            const ordersRef = ref(db, 'orders');
            const ordersQuery = query(ordersRef, limitToLast(ordersLimit));
            const unsub = onValue(ordersQuery, (snap) => {
                if(snap.exists()) {
                    let allOrders: Purchase[] = [];
                    snap.forEach(userOrders => {
                        const uOrders = userOrders.val();
                        if (uOrders) {
                            Object.keys(uOrders).forEach(key => {
                                const order = { ...uOrders[key], key, userId: userOrders.key! };
                                allOrders.push(order);
                            });
                        }
                    });
                    const sorted = allOrders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setOrders(sorted);
                    setHasMoreOrders(sorted.length >= ordersLimit);
                } else { setOrders([]); setHasMoreOrders(false); }
                setIsOrdersLoading(false);
            });
            return () => unsub();
        }
    }, [activeTab, ordersLimit]);

    useEffect(() => {
        if (activeTab === 'deposits') {
            setIsDepositsLoading(true);
            const txnsRef = ref(db, 'transactions');
            const txnsQuery = query(txnsRef, limitToLast(depositsLimit));
            const unsub = onValue(txnsQuery, (snap) => {
                if(snap.exists()) {
                    let allTxns: Transaction[] = [];
                    snap.forEach(userTxns => {
                        const uTxns = userTxns.val();
                        if (uTxns) {
                            Object.keys(uTxns).forEach(key => {
                                const txn = { ...uTxns[key], key, userId: userTxns.key! };
                                if (txn.type !== 'ad_reward' && txn.method !== 'Ad Watch') {
                                    allTxns.push(txn);
                                }
                            });
                        }
                    });
                    const sorted = allTxns.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setTransactions(sorted);
                    setHasMoreDeposits(sorted.length >= depositsLimit);
                } else { setTransactions([]); setHasMoreDeposits(false); }
                setIsDepositsLoading(false);
            });
            return () => unsub();
        }
    }, [activeTab, depositsLimit]);

    useEffect(() => {
        if (activeTab === 'tools') {
             onValue(ref(db, 'notifications'), (snap) => {
                if(snap.exists()) {
                    const data = snap.val();
                    const list = Object.keys(data)
                        .map(key => ({ ...data[key], id: key }))
                        .filter(n => !n.isAuto)
                        .reverse();
                    setNotifications(list);
                }
            });
        }
    }, [activeTab]);

    const filteredUsers = useMemo(() => {
        let list = users;
        if (userListMode === 'active_gamers') list = list.filter(u => (u.gamerLevels?.unlocked || 0) >= 10);
        else if (userListMode === 'ad_rev') list = [...list].sort((a, b) => (Number(b.totalEarned) || 0) - (Number(a.totalEarned) || 0));
        else if (userListMode === 'balance') list = [...list].sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0));
        else if (userListMode === 'ai_usage') list = [...list].sort((a, b) => (Number(b.aiRequestCount) || 0) - (Number(a.aiRequestCount) || 0));
        else if (userListMode === 'ai_active') {
            const todayStr = new Date().toDateString();
            list = list.filter(u => u.lastAiInteraction && new Date(u.lastAiInteraction).toDateString() === todayStr);
        }
        if (!userSearch) return list;
        const lowerTerm = userSearch.toLowerCase();
        return list.filter(u => (u.name || '').toLowerCase().includes(lowerTerm) || (u.email || '').toLowerCase().includes(lowerTerm) || (u.uid || '').toLowerCase().includes(lowerTerm) || (u.playerUid || '').toLowerCase().includes(lowerTerm));
    }, [users, userSearch, userListMode]);

    const filteredOrders = useMemo(() => {
        let result = orders.filter(o => o.status === orderFilter);
        if (orderSearch) {
            const lowerTerm = orderSearch.toLowerCase();
            result = result.filter(o => (o.id || '').toLowerCase().includes(lowerTerm) || (o.uid || '').toLowerCase().includes(lowerTerm));
        }
        return result;
    }, [orders, orderFilter, orderSearch]);

    const filteredTransactions = useMemo(() => {
        let result = transactions.filter(t => t.status === depositFilter);
        if (depositSearch) {
            const lowerTerm = depositSearch.toLowerCase();
            result = result.filter(t => (t.transactionId || '').toLowerCase().includes(lowerTerm) || (t.method || '').toLowerCase().includes(lowerTerm));
        }
        return result;
    }, [transactions, depositFilter, depositSearch]);

    const isSettingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    
    const handleSettingsSave = async (e: FormEvent) => {
        e.preventDefault();
        const currentKey = settings.aiApiKey ? settings.aiApiKey.trim() : '';
        if (currentKey.length > 0 && !/^AIza[0-9A-Za-z\-_]{35}$/.test(currentKey)) { setApiKeyError("Invalid API Key format."); return; }
        setApiKeyError(''); 
        let finalSettings = { ...settings, aiApiKey: currentKey, earnSettings: { ...settings.earnSettings, adMob: { ...settings.earnSettings?.adMob, appId: settings.earnSettings?.adMob?.appId?.trim() || '', rewardId: settings.earnSettings?.adMob?.rewardId?.trim() || '' } } } as AppSettings;
        const { developerSettings, ...safeSettings } = finalSettings;
        await update(ref(db, 'config/appSettings'), safeSettings);
        setSettings(finalSettings); setOriginalSettings(finalSettings);
    };

    const handleUnlockDevInfo = () => { setSecurityKeyInput(''); setIsSecurityModalOpen(true); };
    const handleVerifySecurityKey = (e: FormEvent) => { e.preventDefault(); if (securityKeyInput === PROTECTION_KEY) { setIsDevUnlocked(true); setIsSecurityModalOpen(false); } };
    const handleSaveDeveloperInfo = async () => { try { await update(ref(db, 'config/appSettings/developerSettings'), devSettings); setIsDevUnlocked(false); } catch (error) { } };

    const handleOrderAction = (order: Purchase, action: 'Completed' | 'Failed') => {
        const title = action === 'Completed' ? 'Approve Order?' : 'Reject Order?';
        const msg = action === 'Completed' ? 'Do you want to complete this order?' : 'Do you want to reject this order? Balance will be refunded.';
        
        setPendingAction({
            type: 'order_status',
            title: title,
            message: msg,
            onConfirm: () => {
                setPendingAction(null);
                const reasonBn = "তথ্য সঠিক নয়।";
                const reasonEn = "Information not correct.";
                animateAndAction(order.key!, async () => {
                    if (order.key && order.userId) {
                        if (action === 'Failed') {
                            const orderRef = ref(db, `orders/${order.userId}/${order.key}`);
                            await update(orderRef, { status: 'Failed' });
                            const userRef = ref(db, `users/${order.userId}`);
                            await runTransaction(userRef, (userData) => { if (userData) { userData.balance = (Number(userData.balance) || 0) + Number(order.offer?.price || 0); } return userData; });
                            await sendTriggerNotification(order.userId, 'failed', { title: "Order Cancelled", msg: `Your order for '${order.offer?.name || order.offer?.diamonds}' cancelled. Reason: ${reasonEn}` }, { title: "অর্ডার বাতিল", msg: `আপনার '${order.offer?.name || order.offer?.diamonds}' অর্ডারটি বাতিল হয়েছে। কারণ: ${reasonBn}` });
                        } else {
                            await update(ref(db, `orders/${order.userId}/${order.key}`), { status: 'Completed' });
                            const userRef = ref(db, `users/${order.userId}`);
                            const currentMonth = new Date().toISOString().slice(0, 7);
                            await runTransaction(userRef, (userData) => {
                                if (userData) {
                                    const price = Number(order.offer?.price || 0);
                                    userData.totalSpent = (Number(userData.totalSpent) || 0) + price;
                                    if (userData.lastMonthUpdate !== currentMonth) { userData.monthlySpent = price; userData.monthlyEarned = userData.monthlyEarned || 0; userData.lastMonthUpdate = currentMonth; }
                                    else { userData.monthlySpent = (Number(userData.monthlySpent) || 0) + price; }
                                }
                                return userData;
                            });
                            await sendTriggerNotification(order.userId, 'success', { title: "Order Successful!", msg: `Your order for '${order.offer?.name || order.offer?.diamonds}' completed successfully.` }, { title: "অর্ডার সফল!", msg: `আপনার '${order.offer?.name || order.offer?.diamonds}' অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।` });
                        }
                    }
                });
            }
        });
    };

    const handleDeleteOrder = (orderId: string, userId: string) => {
        setPendingAction({
            type: 'delete_order',
            title: 'Delete Order Record?',
            message: 'This will permanently remove the order from history.',
            onConfirm: () => {
                setPendingAction(null);
                animateAndAction(orderId, async () => { await remove(ref(db, `orders/${userId}/${orderId}`)); });
            }
        });
    };

    const handleTxnAction = (txn: Transaction, action: 'Completed' | 'Failed') => {
        const title = action === 'Completed' ? 'Approve Deposit?' : 'Reject Deposit?';
        const msg = action === 'Completed' ? `Add ৳${txn.amount} to user balance?` : `Reject this ৳${txn.amount} deposit request?`;
        
        setPendingAction({
            type: 'txn_status',
            title: title,
            message: msg,
            onConfirm: () => {
                setPendingAction(null);
                const reasonBn = "ট্রানজেকশন আইডি সঠিক নয়।";
                const reasonEn = "Transaction ID not valid.";
                animateAndAction(txn.key!, async () => {
                    if (txn.key && txn.userId) {
                        if (action === 'Failed') {
                            await update(ref(db, `transactions/${txn.userId}/${txn.key}`), { status: 'Failed' });
                            await sendTriggerNotification(txn.userId, 'failed', { title: "Deposit Rejected", msg: `Deposit request for ৳${txn.amount} rejected. Reason: ${reasonEn}` }, { title: "ডিপোজিট বাতিল", msg: `আপনার ৳${txn.amount} জমার অনুরোধটি বাতিল হয়েছে। কারণ: ${reasonBn}` });
                        } else {
                            await update(ref(db, `transactions/${txn.userId}/${txn.key}`), { status: 'Completed' });
                            const userRef = ref(db, `users/${txn.userId}`);
                            await runTransaction(userRef, (userData) => { if (userData) { userData.balance = (Number(userData.balance) || 0) + Number(txn.amount); userData.totalDeposit = (Number(userData.totalDeposit) || 0) + Number(txn.amount); } return userData; });
                            await sendTriggerNotification(txn.userId, 'success', { title: "Funds Added!", msg: `৳${txn.amount} added to your account. Thank you.` }, { title: "টাকা যোগ হয়েছে!", msg: `আপনার অ্যাকাউন্টে ৳${txn.amount} যোগ করা হয়েছে। ধন্যবাদ।` });
                        }
                    }
                });
            }
        });
    };
    
    const handleDeleteTransaction = (txnId: string, userId: string) => {
        setPendingAction({
            type: 'delete_txn',
            title: 'Delete Deposit Record?',
            message: 'This will permanently remove this transaction from history.',
            onConfirm: () => {
                setPendingAction(null);
                animateAndAction(txnId, async () => { await remove(ref(db, `transactions/${userId}/${txnId}`)); });
            }
        });
    };
    
    const handleBalanceUpdate = async () => {
        if (!balanceModalUser || !balanceAmount) return;
        const amount = Number(balanceAmount);
        if (isNaN(amount) || amount <= 0) return;
        const userRef = ref(db, `users/${balanceModalUser.uid}`);
        await runTransaction(userRef, (userData) => { if(userData) { userData.balance = balanceAction === 'add' ? (userData.balance||0) + amount : (userData.balance||0) - amount; } return userData; });
        await sendTriggerNotification(balanceModalUser.uid, 'admin', { title: "Balance Update", msg: `৳${amount} ${balanceAction === 'add' ? 'added to' : 'deducted from'} your balance.` }, { title: "ব্যালেন্স আপডেট", msg: `আপনার অ্যাকাউন্টে ৳${amount} ${balanceAction === 'add' ? 'যোগ' : 'কর্তন'} করা হয়েছে।` });
        setBalanceModalUser(null); setBalanceAmount('');
    };

    const handleOfferDragStart = (index: number) => { dragItem.current = index; };
    const handleOfferDragEnter = (index: number) => { dragOverItem.current = index; };
    const handleOfferDrop = async () => { if (dragItem.current === null || dragOverItem.current === null) return; const listCopy = [...offersData[offerType]]; const dragItemContent = listCopy[dragItem.current]; listCopy.splice(dragItem.current, 1); listCopy.splice(dragOverItem.current, 0, dragItemContent); dragItem.current = null; dragOverItem.current = null; setOffersData({ ...offersData, [offerType]: listCopy }); try { await set(ref(db, `config/offers/${offerType}`), listCopy); } catch (err) { } };
    const handleSaveOffer = async (e: FormEvent) => { e.preventDefault(); const path = `config/offers/${offerType}`; let newOffer = { ...editingOffer }; if (!newOffer.id) newOffer.id = Date.now(); if (newOffer.price) newOffer.price = Number(newOffer.price); if (newOffer.diamonds) newOffer.diamonds = Number(newOffer.diamonds); if (offerType === 'special' && newOffer.isActive === undefined) newOffer.isActive = true; if (offerType === 'diamond' && !newOffer.name) { newOffer.name = `${newOffer.diamonds} Diamonds`; } let updatedList = [...offersData[offerType]]; if (editingOffer.id && offersData[offerType].find((o: any) => o.id === editingOffer.id)) { updatedList = updatedList.map((o: any) => o.id === editingOffer.id ? newOffer : o); } else { updatedList.push(newOffer); } await set(ref(db, path), updatedList); setIsOfferModalOpen(false); setEditingOffer(null); };
    
    const handleDeleteOffer = async (id: number) => {
        setPendingAction({
            type: 'delete_offer',
            title: 'Delete Offer?',
            message: 'Are you sure you want to delete this offer?',
            onConfirm: async () => {
                setPendingAction(null);
                const path = `config/offers/${offerType}`;
                const updatedList = offersData[offerType].filter((o: any) => o.id !== id);
                await set(ref(db, path), updatedList);
            }
        });
    };

    const handleSortByPrice = async () => { const sorted = [...offersData[offerType]].sort((a: any, b: any) => Number(a.price) - Number(b.price)); setOffersData({ ...offersData, [offerType]: sorted }); await set(ref(db, `config/offers/${offerType}`), sorted); };
    const openAddOfferModal = () => { setEditingOffer({}); setIsOfferModalOpen(true); };
    const handleSaveMethod = async (e: FormEvent) => { e.preventDefault(); if (!editingMethod) return; const updatedMethods = [...paymentMethods]; if (editingMethodIndex !== null) updatedMethods[editingMethodIndex] = editingMethod; else updatedMethods.push(editingMethod); await set(ref(db, 'config/paymentMethods'), updatedMethods); setIsMethodModalOpen(false); setEditingMethod(null); };
    
    const handleDeleteMethod = async (index: number) => {
        setPendingAction({
            type: 'delete_method',
            title: 'Delete Method?',
            message: 'Permanently remove this payment method?',
            onConfirm: async () => {
                setPendingAction(null);
                const updatedMethods = paymentMethods.filter((_, i) => i !== index);
                await set(ref(db, 'config/paymentMethods'), updatedMethods);
            }
        });
    };

    const openAddMethodModal = () => { setEditingMethod({ name: '', accountNumber: '', logo: '', instructions: '' }); setEditingMethodIndex(null); setIsMethodModalOpen(true); };
    const openEditMethodModal = (method: PaymentMethod, index: number) => { setEditingMethod({ ...method }); setEditingMethodIndex(index); setIsMethodModalOpen(true); };
    const handleSaveContact = async (e: FormEvent) => { e.preventDefault(); if (!editingContact) return; const updatedContacts = [...contacts]; const contactToSave = { ...editingContact, labelKey: editingContact.title, type: 'custom' }; if (editingContactIndex !== null) updatedContacts[editingContactIndex] = contactToSave; else updatedContacts.push(contactToSave); await set(ref(db, 'config/supportContacts'), updatedContacts); setIsContactModalOpen(false); setEditingContact(null); };
    
    const handleDeleteContact = async (index: number) => {
        setPendingAction({
            type: 'delete_contact',
            title: 'Delete Contact?',
            message: 'Permanently remove this support contact?',
            onConfirm: async () => {
                setPendingAction(null);
                const updatedContacts = contacts.filter((_, i) => i !== index);
                await set(ref(db, 'config/supportContacts'), updatedContacts);
            }
        });
    };

    const openAddContactModal = () => { setEditingContact({ type: 'custom', title: '', link: '', iconUrl: '' }); setEditingContactIndex(null); setIsContactModalOpen(true); };
    const openEditContactModal = (contact: any, index: number) => { setEditingContact({ ...contact }); setEditingContactIndex(index); setIsMethodModalOpen(true); };
    const handleSaveFaq = async (e: FormEvent) => { e.preventDefault(); if (!editingFaq) return; const newFaq = { ...editingFaq }; if (!newFaq.id) newFaq.id = Date.now().toString(); let updatedList = [...faqs]; if (faqs.find(f => f.id === newFaq.id)) { updatedList = updatedList.map(f => f.id === newFaq.id ? newFaq : f); } else { updatedList.push(newFaq); } await set(ref(db, 'config/faqs'), updatedList); setIsFaqModalOpen(false); setEditingFaq(null); };
    
    const handleDeleteFaq = async (id: string) => {
        setPendingAction({
            type: 'delete_faq',
            title: 'Delete FAQ?',
            message: 'Remove this question and answer?',
            onConfirm: async () => {
                setPendingAction(null);
                const updatedList = faqs.filter(f => f.id !== id);
                if (updatedList.length === 0) { await remove(ref(db, 'config/faqs')); } else { await set(ref(db, 'config/faqs'), updatedList); } setFaqs(updatedList);
            }
        });
    };

    const openAddFaqModal = () => { setEditingFaq({ id: '', question: '', question_bn: '', answer: '', answer_bn: '' }); setIsFaqModalOpen(true); };
    const openEditFaqModal = (faq: FaqItem) => { setEditingFaq({ ...faq }); setIsFaqModalOpen(true); };
    const toggleUserSelection = (uid: string) => { const newSet = new Set(selectedUserIds); if (newSet.has(uid)) newSet.delete(uid); else newSet.add(uid); setSelectedUserIds(newSet); };
    const handleSendNotification = async (e: FormEvent) => { e.preventDefault(); const notifData = { ...newNotif, timestamp: Date.now(), type: 'admin' as any }; try { if (selectedUserIds.size > 0) { const promises = Array.from(selectedUserIds).map(uid => push(ref(db, 'notifications'), { ...notifData, targetUid: uid })); await Promise.all(promises); setSelectedUserIds(new Set()); } else { await push(ref(db, 'notifications'), notifData); } setNewNotif({ title: '', title_bn: '', message: '', message_bn: '', type: 'admin' }); setIsNotifModalOpen(false); } catch (error) { } };
    
    const handleDeleteNotification = async (id: string) => {
        setPendingAction({
            type: 'delete_notif',
            title: 'Delete Broadcast?',
            message: 'This will remove the notification for all users.',
            onConfirm: async () => {
                setPendingAction(null);
                await remove(ref(db, `notifications/${id}`));
            }
        });
    };

    const handleSavePopupConfig = async () => { await update(ref(db, 'config/appSettings'), { popupNotification: popupConfig }); setSettings(prev => ({...prev, popupNotification: popupConfig})); };
    const handleAddBanner = async () => { if(!newBannerUrl) return; const updatedBanners = [...banners, { imageUrl: newBannerUrl, actionUrl: newActionUrl }]; await set(ref(db, 'config/banners'), updatedBanners); setNewBannerUrl(''); setNewActionUrl(''); };
    
    const handleDeleteBanner = async (index: number) => {
        setPendingAction({
            type: 'delete_banner',
            title: 'Delete Banner?',
            message: 'Permanently remove this image from the carousel?',
            onConfirm: async () => {
                setPendingAction(null);
                const updatedBanners = banners.filter((_, i) => i !== index);
                await set(ref(db, 'config/banners'), updatedBanners);
            }
        });
    };

    const openEditBannerModal = (index: number, banner: Banner) => { setEditingBannerIndex(index); setTempBannerUrl(banner.imageUrl); setTempActionUrl(banner.actionUrl || ''); setIsBannerModalOpen(true); };
    const handleSaveBanner = async (e: FormEvent) => { e.preventDefault(); if (editingBannerIndex !== null && tempBannerUrl) { const updatedBanners = [...banners]; updatedBanners[editingBannerIndex] = { imageUrl: tempBannerUrl, actionUrl: tempActionUrl }; await set(ref(db, 'config/banners'), updatedBanners); setIsBannerModalOpen(false); setEditingBannerIndex(null); setTempBannerUrl(''); setTempActionUrl(''); } };
    const handleUpdateLogo = async () => { if (settings.logoUrl) { await update(ref(db, 'config/appSettings'), { logoUrl: settings.logoUrl }); } };

    const inputClass = "w-full p-3.5 border rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:white border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm";
    const isOfferValid = offerType === 'diamond' ? (Number(editingOffer?.diamonds) > 0 && Number(editingOffer?.price) > 0) : (editingOffer?.name?.trim() && Number(editingOffer?.price) > 0);
    const isMethodValid = editingMethod?.name?.trim() && editingMethod?.accountNumber?.trim() && editingMethod?.logo?.trim();
    const isContactValid = editingContact?.title?.trim() && editingContact?.link?.trim();
    const isFaqValid = editingFaq?.question?.trim() && editingFaq?.answer?.trim();
    const isBannerValid = tempBannerUrl?.trim();
    const isNotifValid = newNotif.title.trim().length > 0 && newNotif.message.trim().length > 0;
    const showBackButton = activeTab !== 'dashboard';

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
            {isSidebarOpen && (<div className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>)}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800"><span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Admin Panel</span></div>
                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-5rem)]">
                    <SidebarLink icon={DashboardIcon} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
                    <SidebarLink icon={UsersIcon} label="Users" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setUserListMode('all'); setIsSidebarOpen(false); }} />
                    <SidebarLink icon={SettingsIcon} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
                <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm/50">
                    <div className="flex items-center gap-4">
                        <div>{showBackButton ? (<button onClick={() => { setActiveTab('dashboard'); setUserListMode('all'); }} className="p-2 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all active:scale-90 transform flex items-center gap-2"><BackIcon className="w-5 h-5" /><span className="text-xs font-bold hidden sm:block">Back to Home</span></button>) : (<button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors md:hidden"><MenuIcon className="w-6 h-6" /></button>)}</div>
                        <h2 className="text-lg font-bold select-none cursor-pointer text-gray-800 dark:text-white" onClick={handleHeaderTap}>{activeTab === 'dashboard' ? '' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    </div>
                    <button onClick={handleLogoutClick} className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95"><LockIcon className="w-5 h-5" /></button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
                    {activeTab === 'dashboard' && (
                        <div className="animate-smart-fade-in space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-smart-slide-up">
                                <QuickActionCard label="Orders" icon={OrdersIcon} color="orange" onClick={() => setActiveTab('orders')} count={dashboardStats.pendingOrders} />
                                <QuickActionCard label="Deposits" icon={WalletIcon} color="purple" onClick={() => setActiveTab('deposits')} count={dashboardStats.pendingDeposits} />
                                <QuickActionCard label="Offers" icon={TagIcon} color="pink" onClick={() => setActiveTab('offers')} />
                                <QuickActionCard label="Tools" icon={GridIcon} color="blue" onClick={() => setActiveTab('tools')} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 animate-smart-slide-up" style={{ animationDelay: '100ms' }}>
                                <button onClick={() => { setActiveTab('deposits'); setDepositFilter('Completed'); }} className="p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-dark-card text-left active:scale-[0.98]"><div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-125 transition-transform duration-500"><MoneyIcon className="w-24 h-24 text-green-600" /></div><div className="relative z-10"><div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-green-50 text-green-600 dark:bg-green-900/20 group-hover:bg-green-600 group-hover:text-white transition-colors"><MoneyIcon className="w-6 h-6" /></div><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Deposit</p><h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">৳{dashboardStats.totalDeposit}</h3></div></button>
                                <button onClick={() => { setActiveTab('users'); setUserListMode('ad_rev'); }} className="p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-dark-card text-left active:scale-[0.98]"><div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-125 transition-transform duration-500"><DollarIcon className="w-24 h-24 text-yellow-600" /></div><div className="relative z-10"><div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 group-hover:bg-yellow-600 group-hover:text-white transition-colors"><DollarIcon className="w-6 h-6" /></div><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Ad Rev</p><h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">৳{dashboardStats.totalAdRevenue}</h3></div></button>
                                <button onClick={() => { setActiveTab('users'); setUserListMode('active_gamers'); }} className="p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-dark-card text-left active:scale-[0.98]"><div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-125 transition-transform duration-500"><GamepadIcon className="w-24 h-24 text-primary" /></div><div className="relative z-10"><div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 text-primary dark:bg-primary/20 group-hover:bg-primary group-hover:text-white transition-colors"><GamepadIcon className="w-6 h-6" /></div><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Active Gamers</p><h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{dashboardStats.activeGamers}</h3></div></button>
                                <button onClick={() => { setActiveTab('users'); setUserListMode('balance'); }} className="p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-dark-card text-left active:scale-[0.98]"><div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-125 transition-transform duration-500"><WalletIcon className="w-24 h-24 text-orange-600" /></div><div className="relative z-10"><div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-orange-50 text-orange-600 dark:bg-orange-900/20 group-hover:bg-orange-600 group-hover:text-white transition-colors"><WalletIcon className="w-6 h-6" /></div><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Users Balance</p><h3 className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tight">৳{Math.floor(dashboardStats.usersTotalBalance)}</h3></div></button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-4 animate-smart-fade-in">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                                <div><div className="flex items-center gap-2"><h3 className="text-xl font-black text-gray-800 dark:text-white">{userListMode === 'active_gamers' ? 'Active Gamers (Lvl 10+)' : userListMode === 'ad_rev' ? 'Ad Revenue Report' : userListMode === 'balance' ? 'Financial Report' : userListMode === 'ai_usage' ? 'AI Interaction Report' : userListMode === 'ai_active' ? 'AI Active Today' : ''}</h3>{userListMode !== 'all' && (<button onClick={() => setUserListMode('all')} className="text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-lg hover:text-red-500 transition-colors">Clear Filter</button>)}</div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Filtered: {filteredUsers.length} / Total: {dashboardStats.totalUsers}</p></div>
                                <div className="flex gap-2">{selectedUserIds.size > 0 && (<button onClick={() => setIsNotifModalOpen(true)} className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg animate-pulse transform active:scale-95 transition-transform">Message {selectedUserIds.size} Selected</button>)}</div>
                            </div>
                            <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search Name, Email or UID (Fast Scan)..." />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-smart-slide-up">
                                {filteredUsers.map((u, idx) => (
                                    <div key={u.uid} className={`relative bg-white dark:bg-dark-card p-4 rounded-3xl border flex flex-col gap-3 transition-all ${selectedUserIds.has(u.uid) ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-gray-100 dark:border-gray-800 shadow-sm'}`}><div className="absolute top-4 right-4 flex items-center gap-2">{u.role === 'admin' && <span className="bg-red-100 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Admin</span>}<input type="checkbox" checked={selectedUserIds.has(u.uid)} onChange={() => toggleUserSelection(u.uid)} className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer" /></div><div className="flex items-center gap-3"><div className="relative"><img src={u.avatarUrl || DEFAULT_AVATAR_URL} alt={u.name} className="w-12 h-12 rounded-2xl object-cover border border-gray-100 dark:border-gray-700 shadow-sm" /><div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-card ${u.lastLogin && Date.now() - u.lastLogin < 300000 ? 'bg-green-500' : 'bg-gray-400'}`}></div></div><div className="flex-1 min-w-0 pr-8"><p className="font-black text-sm truncate text-gray-900 dark:text-white">{u.name}</p><p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mb-1">{u.email}</p><div className="flex flex-wrap gap-2"><SmartCopy text={u.playerUid || 'No UID'} label={u.playerUid || 'UID'} />{userListMode === 'active_gamers' ? (<span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-lg flex items-center gap-1"><GamepadIcon className="w-2.5 h-2.5"/> Level {u.gamerLevels?.unlocked || 1}</span>) : userListMode === 'ad_rev' ? (<div className="flex gap-2"><span className="text-[9px] font-black bg-yellow-500 text-black px-2 py-0.5 rounded-lg">Ads: {u.totalAdsWatched || 0}</span><span className="text-[9px] font-black bg-green-500 text-white px-2 py-0.5 rounded-lg">Earn: ৳{Math.floor(u.totalEarned || 0)}</span></div>) : (userListMode === 'ai_usage' || userListMode === 'ai_active') ? (<span className="text-[9px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-lg flex items-center gap-1"><RobotIcon className="w-2.5 h-2.5" /> AI Messages: {u.aiRequestCount || 0}</span>) : (<span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-lg">Spent: ৳{Math.floor(u.totalSpent || 0)}</span>)}</div></div></div><div className={`flex justify-between items-center p-2.5 rounded-2xl border ${userListMode === 'balance' ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'}`}><div><p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Current Balance</p><p className={`text-lg font-black ${userListMode === 'balance' ? 'text-orange-600' : 'text-primary'}`}>৳{Number(u.balance || 0).toLocaleString()}</p></div><div className="flex gap-2"><button onClick={() => { setBalanceModalUser(u); setBalanceAction('add'); setBalanceAmount(''); }} className="bg-green-500 text-white p-2.5 rounded-xl hover:bg-green-600 active:scale-90 transition-transform shadow-md"><PlusIcon className="w-4 h-4" /></button><button onClick={() => { setBalanceModalUser(u); setBalanceAction('deduct'); setBalanceAmount(''); }} className="bg-red-500 text-white p-2.5 rounded-xl hover:bg-red-600 active:scale-90 transition-transform shadow-md"><MinusIcon className="w-4 h-4" /></button></div></div></div>
                                ))}
                            </div>
                            {isUsersLoading && (<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)}
                            {!userSearch && hasMoreUsers && !isUsersLoading && (<div className="flex justify-center pt-8"><button onClick={() => setUsersLimit(prev => prev + 50)} className="px-8 py-3.5 bg-white dark:bg-gray-800 text-primary font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 active:scale-95 transition-all hover:bg-gray-50">Load More Users</button></div>)}
                        </div>
                    )}

                    {activeTab === 'offers' && (
                        <div className="animate-smart-fade-in pb-10">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"><h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hidden md:block">Manage Offers</h2><div className="flex w-full md:w-auto gap-2"><button onClick={handleSortByPrice} className="flex-1 md:flex-none py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"><SortIcon className="w-4 h-4" /><span>Sort by Price</span></button><button onClick={openAddOfferModal} className="flex-1 md:flex-none py-3 px-6 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" /><span>Add New</span></button></div></div>
                            <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl mb-8 overflow-x-auto no-scrollbar shadow-inner border border-gray-200 dark:border-gray-700/50">{['diamond', 'levelUp', 'membership', 'premium', 'special'].map((type) => (<button key={type} onClick={() => setOfferType(type as any)} className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all duration-300 flex-shrink-0 ${offerType === type ? 'bg-white dark:bg-dark-card text-primary shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}>{type.replace(/([A-Z])/g, ' $1').trim()}</button>))}</div>
                            <div className="grid grid-cols-2 gap-3 animate-smart-slide-up">
                                {offersData[offerType]?.map((offer: any, index: number) => (
                                    <div key={offer.id} draggable onDragStart={() => handleOfferDragStart(index)} onDragEnter={() => handleOfferDragEnter(index)} onDragEnd={handleOfferDrop} onDragOver={(e) => e.preventDefault()} className="group relative bg-white dark:bg-dark-card rounded-2xl p-3 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 flex flex-col justify-between overflow-hidden cursor-move active:opacity-50"><div className="absolute top-2 left-2 opacity-30 group-hover:opacity-100 transition-opacity"><GripIcon className="w-4 h-4 text-gray-400" /></div>{offerType === 'special' && (<div className={`absolute top-0 right-0 rounded-bl-xl px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider z-10 ${offer.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{offer.isActive ? 'Active' : 'Hidden'}</div>)}<div className="flex justify-between items-start mb-2 mt-2"><div className={`p-2 rounded-xl shadow-inner ${offerType === 'diamond' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' : offerType === 'levelUp' ? 'bg-purple-50 text-purple-500 dark:bg-purple-900/20' : offerType === 'membership' ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20' : offerType === 'special' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20'}`}>{offerType === 'diamond' ? <DiamondIcon className="w-5 h-5" /> : offerType === 'levelUp' ? <StarIcon className="w-5 h-5" /> : offerType === 'membership' ? <IdCardIcon className="w-5 h-5" /> : offerType === 'special' ? <TagIcon className="w-5 h-5" /> : <CrownIcon className="w-5 h-5" />}</div></div><div className="mb-2"><h3 className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1 mb-0.5">{offer.name || `${offer.diamonds} Diamonds`}</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{offerType === 'diamond' ? `${offer.diamonds} DM` : offerType === 'special' ? offer.title : 'Package'}</p></div><div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800"><span className="text-lg font-black text-gray-900 dark:text-white">৳{offer.price}</span><div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); setEditingOffer(offer); setIsOfferModalOpen(true); }} className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors active:scale-95"><EditIcon className="w-3.5 h-3.5" /></button><button onClick={(e) => { e.stopPropagation(); handleDeleteOffer(offer.id); }} className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-colors active:scale-95"><TrashIcon className="w-3.5 h-3.5" /></button></div></div></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-5 animate-smart-fade-in">
                            <SearchInput value={orderSearch} onChange={setOrderSearch} placeholder="Search Order ID..." />
                            <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-2xl">{(['Pending', 'Completed', 'Failed'] as const).map(status => (<button key={status} onClick={() => setOrderFilter(status)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${orderFilter === status ? 'bg-white dark:bg-dark-card shadow-sm text-primary' : 'text-gray-500'}`}>{status}</button>))}</div>
                            <div className="space-y-3 animate-smart-slide-up">
                                {filteredOrders.length === 0 ? <div className="text-center py-20 text-gray-400 text-sm">No orders found</div> : filteredOrders.map(order => {
                                    const isExiting = exitingItems.has(order.key!);
                                    return (
                                        <div key={order.key} className={`bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-500 ease-in-out transform ${isExiting ? 'opacity-0 translate-x-full scale-95 pointer-events-none' : 'opacity-100'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="font-bold text-sm block text-gray-900 dark:text-white">{order.offer?.diamonds || order.offer?.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{new Date(order.date).toLocaleString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-black text-primary text-base block">৳{order.offer?.price || 0}</span>
                                                    {order.status === 'Pending' && <LiveAdminTimer date={order.date} limitMinutes={settings.autoRefundMinutes || 30} />}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl space-y-2 mb-4 border border-gray-100 dark:border-gray-700"><div><p className="text-[10px] text-gray-400 mb-0.5">Player Info</p><SmartCopy text={order.uid} /></div><div><p className="text-[10px] text-gray-400 mb-0.5">Order ID</p><SmartCopy text={order.id} /></div></div>
                                            <div className="flex gap-3">
                                                {order.status === 'Pending' && (<><button onClick={() => handleOrderAction(order, 'Completed')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform hover:bg-green-600">Approve</button><button onClick={() => handleOrderAction(order, 'Failed')} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform hover:bg-green-600">Reject</button></>)}
                                                <button onClick={() => handleDeleteOrder(order.key!, order.userId)} className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-red-500 rounded-xl hover:bg-red-50 active:scale-95 transition-transform"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {isOrdersLoading && (<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)}
                            {!orderSearch && hasMoreOrders && !isOrdersLoading && (<div className="flex justify-center pt-8"><button onClick={() => setOrdersLimit(prev => prev + 50)} className="px-8 py-3.5 bg-white dark:bg-gray-800 text-primary font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 active:scale-95 transition-all hover:bg-gray-50">Load More Orders</button></div>)}
                        </div>
                    )}

                    {activeTab === 'deposits' && (
                        <div className="space-y-5 animate-smart-fade-in">
                            <SearchInput value={depositSearch} onChange={setDepositSearch} placeholder="Search TrxID..." />
                            <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-2xl">{(['Pending', 'Completed', 'Failed'] as const).map(status => (<button key={status} onClick={() => setDepositFilter(status)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${depositFilter === status ? 'bg-white dark:bg-dark-card shadow-sm text-primary' : 'text-gray-500'}`}>{status}</button>))}</div>
                            <div className="space-y-3 animate-smart-slide-up">
                                {filteredTransactions.length === 0 ? <div className="text-center py-20 text-gray-400 text-sm">No deposits found</div> : filteredTransactions.map(txn => {
                                    const isExiting = exitingItems.has(txn.key!);
                                    return (
                                        <div key={txn.key} className={`bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-500 ease-in-out transform ${isExiting ? 'opacity-0 translate-x-full scale-95 pointer-events-none' : 'opacity-100'}`}>
                                            <div className="flex justify-between mb-3"><div><span className="font-bold text-sm block text-gray-900 dark:text-white">{txn.method}</span><span className="text-[10px] text-gray-400">{new Date(txn.date).toLocaleString()}</span></div><span className="font-black text-green-600 text-base">+৳{txn.amount}</span></div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl mb-4 flex justify-between items-center border border-gray-100 dark:border-gray-700"><span className="text-gray-500 text-xs">TrxID:</span><SmartCopy text={txn.transactionId} label={txn.transactionId} /></div>
                                            <div className="flex gap-3">
                                                {txn.status === 'Pending' && (<><button onClick={() => handleTxnAction(txn, 'Completed')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform hover:bg-green-600">Approve</button><button onClick={() => handleTxnAction(txn, 'Failed')} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-transform hover:bg-green-600">Reject</button></>)}
                                                <button onClick={() => handleDeleteTransaction(txn.key!, txn.userId)} className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-red-500 rounded-xl hover:bg-red-50 active:scale-95 transition-transform"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {isDepositsLoading && (<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)}
                            {!depositSearch && hasMoreDeposits && !isDepositsLoading && (<div className="flex justify-center pt-8"><button onClick={() => setDepositsLimit(prev => prev + 50)} className="px-8 py-3.5 bg-white dark:bg-gray-800 text-primary font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 active:scale-95 transition-all hover:bg-gray-50">Load More Deposits</button></div>)}
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="animate-smart-fade-in">
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                {[
                                    { id: 'wallet', label: 'Wallet', icon: WalletIcon },
                                    { id: 'ai', label: 'AI Manager', icon: RobotIcon },
                                    { id: 'graphics', label: 'Graphics', icon: ImageIcon },
                                    { id: 'ads', label: 'Ads Manager', icon: MegaphoneIcon },
                                    { id: 'notifications', label: 'Notifs', icon: BellIcon },
                                    { id: 'contacts', label: 'Contacts', icon: ContactIcon },
                                    { id: 'faqs', label: 'FAQs', icon: HelpIcon },
                                ].map(tool => (
                                    <button key={tool.id} onClick={() => setActiveTool(tool.id as any)} className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-2xl transition-all border active:scale-95 ${activeTool === tool.id ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white dark:bg-dark-card text-gray-500 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}><tool.icon className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold uppercase tracking-wide">{tool.label}</span></button>
                                ))}
                            </div>
                            <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm min-h-[300px] border border-gray-100 dark:border-gray-800 animate-smart-slide-up">
                                {activeTool === 'wallet' && (
                                    <div>
                                        <button onClick={openAddMethodModal} className="w-full py-4 mb-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-sm active:scale-95 transform">+ Add Wallet</button>
                                        <div className="space-y-3 mb-8">
                                            {paymentMethods.map((method, index) => (
                                                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"><div className="flex items-center gap-4"><img src={method.logo} className="w-10 h-10 object-contain bg-white rounded-lg p-1" /><div><p className="font-bold text-sm text-gray-900 dark:text-white">{method.name}</p><SmartCopy text={method.accountNumber} /></div></div><div className="flex gap-2"><button onClick={() => openEditMethodModal(method, index)} className="p-2 bg-blue-100 text-blue-600 rounded-lg active:scale-90 transition-transform"><EditIcon className="w-4 h-4"/></button><button onClick={() => handleDeleteMethod(index)} className="p-2 bg-red-100 text-red-600 rounded-lg active:scale-90 transition-transform"><TrashIcon className="w-4 h-4"/></button></div></div>
                                            ))}
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex items-center gap-3 mb-4"><PlayIcon className="w-6 h-6 text-blue-600" /><h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">Wallet Screen Video Tutorial</h4></div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-700"><span className="font-bold text-xs">Video Player Status</span><div onClick={() => setSettings({...settings, walletVideoActive: !settings.walletVideoActive})} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.walletVideoActive ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.walletVideoActive ? 'translate-x-6' : 'translate-x-0'}`}></div></div></div>
                                                <div><input type="text" value={settings.walletVideoUrl || ''} onChange={(e) => setSettings({...settings, walletVideoUrl: e.target.value})} className={inputClass} placeholder="YouTube Video URL" /></div>
                                                <button onClick={handleSettingsSave} disabled={!isSettingsChanged} className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md transition-all ${isSettingsChanged ? 'bg-blue-600 text-white active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Save Video Settings</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTool === 'ai' && (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-3xl text-white shadow-lg"><div className="flex items-center gap-3 mb-4"><RobotIcon className="w-8 h-8 text-white/90" /><h3 className="font-bold text-base">AI Manager</h3></div><div className="grid grid-cols-2 gap-4"><button onClick={() => { setActiveTab('users'); setUserListMode('ai_usage'); }} className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-left hover:bg-white/30 transition-all active:scale-95"><p className="text-2xl font-black mb-1">{aiOverview.totalInteractions}</p><p className="text-[10px] font-bold text-white/80 uppercase">Total Interactions</p></button><button onClick={() => { setActiveTab('users'); setUserListMode('ai_active'); }} className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-left hover:bg-white/30 transition-all active:scale-95"><p className="text-2xl font-black mb-1">{aiOverview.activeAiUsers}</p><p className="text-[10px] font-bold text-white/80 uppercase">Active Today</p></button></div></div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-700"><div className="flex items-center gap-3"><span className="font-bold text-sm">Enable AI Support</span></div><div onClick={() => setSettings({...settings, aiSupportActive: !settings.aiSupportActive})} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.aiSupportActive ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.aiSupportActive ? 'translate-x-6' : 'translate-x-0'}`}></div></div></div>
                                            <div><label className="block text-xs font-bold text-gray-500 mb-2">Bot Name</label><input type="text" value={settings.aiName || ''} onChange={(e) => setSettings({...settings, aiName: e.target.value})} className={inputClass} placeholder="AI Tuktuki" /></div>
                                            <div><label className="block text-xs font-bold text-gray-500 mb-2">Gemini API Key</label><input type="password" value={settings.aiApiKey || ''} onChange={(e) => { setSettings({...settings, aiApiKey: e.target.value}); if (apiKeyError) setApiKeyError(''); }} className={`${inputClass} ${apiKeyError ? 'border-red-500' : ''}`} placeholder="AIzaSy..." /></div>
                                            <button onClick={handleSettingsSave} disabled={!isSettingsChanged} className={`w-full py-3.5 font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 transform ${isSettingsChanged ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Save Settings</button>
                                        </div>
                                    </div>
                                )}
                                {activeTool === 'graphics' && (
                                    <div className="space-y-6">
                                        <div><h3 className="font-bold mb-3 text-sm text-gray-500 uppercase">App Logo URL</h3><div className="flex gap-3">{settings.logoUrl ? <img src={settings.logoUrl} className="w-12 h-12 rounded-2xl border" /> : <div className="w-12 h-12 rounded-2xl border bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">No Logo</div>}<input type="text" value={settings.logoUrl || ''} onChange={(e) => setSettings({...settings, logoUrl: e.target.value})} className={inputClass} placeholder="Image URL" /></div><button onClick={handleUpdateLogo} className="mt-3 text-xs bg-primary text-white px-4 py-2 rounded-xl font-bold active:scale-95 transform">Update Logo</button></div>
                                        <div><h3 className="font-bold mb-3 text-sm text-gray-500 uppercase">Banners</h3><div className="flex gap-2 mb-3"><input type="text" value={newBannerUrl} onChange={(e) => setNewBannerUrl(e.target.value)} className={inputClass} placeholder="Image URL" /><input type="text" value={newActionUrl} onChange={(e) => setNewActionUrl(e.target.value)} className={inputClass} placeholder="Action URL" /><button onClick={handleAddBanner} disabled={!newBannerUrl} className={`px-4 rounded-xl font-bold text-xs text-white active:scale-95 transform ${newBannerUrl ? 'bg-green-500' : 'bg-gray-300'}`}>Add</button></div><div className="space-y-3">{banners.map((banner, index) => (<div key={index} className="relative h-24 rounded-2xl overflow-hidden group"><img src={banner.imageUrl} className="w-full h-full object-cover" /><div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEditBannerModal(index, banner)} className="bg-blue-600 text-white p-2 rounded-lg shadow-md active:scale-90 transform"><EditIcon className="w-4 h-4" /></button><button onClick={() => handleDeleteBanner(index)} className="bg-red-600 text-white p-2 rounded-lg shadow-md active:scale-90 transform"><TrashIcon className="w-4 h-4"/></button></div></div>))}</div></div>
                                    </div>
                                )}
                                {activeTool === 'ads' && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3"><MegaphoneIcon className="w-5 h-5 text-orange-500"/><h4 className="font-bold text-sm">Reward Ad Settings</h4></div><div className="flex p-1.5 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-6 shadow-inner"><button onClick={() => setSettings({...settings, earnSettings: { ...settings.earnSettings!, webAds: { ...settings.earnSettings!.webAds, active: true }, adMob: { ...settings.earnSettings!.adMob, active: false } }})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${settings.earnSettings?.webAds?.active ? 'bg-white dark:bg-dark-card text-primary shadow-md scale-[1.02]' : 'text-gray-400'}`}>Web Video</button><button onClick={() => setSettings({...settings, earnSettings: { ...settings.earnSettings!, webAds: { ...settings.earnSettings!.webAds, active: false }, adMob: { ...settings.earnSettings!.adMob, active: true } }})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${settings.earnSettings?.adMob?.active ? 'bg-white dark:bg-dark-card text-indigo-600 shadow-md scale-[1.02]' : 'text-gray-400'}`}>AdMob</button></div><div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-200 dark:border-gray-700">{settings.earnSettings?.webAds?.active ? (<div className="space-y-4 animate-smart-fade-in"><div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div><span className="text-[10px] font-black uppercase text-primary">Web Video Setup</span></div><div><input type="text" value={settings.earnSettings?.webAds?.url || ''} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, webAds: { ...settings.earnSettings!.webAds, url: e.target.value } }})} className={inputClass} placeholder="Video URL" /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Duration (Seconds)</label><input type="number" value={settings.earnSettings?.webAds?.duration || 15} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, webAds: { ...settings.earnSettings!.webAds, duration: Number(e.target.value) } }})} className={inputClass} /></div></div>) : (<div className="space-y-4 animate-smart-fade-in"><div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div><span className="text-[10px] font-black uppercase text-indigo-500">AdMob Setup</span></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">App ID</label><input type="text" value={settings.earnSettings?.adMob?.appId || ''} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, adMob: { ...settings.earnSettings!.adMob, appId: e.target.value } }})} className={inputClass} placeholder="ca-app-pub-..." /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Reward ID</label><input type="text" value={settings.earnSettings?.adMob?.rewardId || ''} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, adMob: { ...settings.earnSettings!.adMob, rewardId: e.target.value } }})} className={inputClass} placeholder="Reward Unit ID" /></div></div>)}</div></div>
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3"><CodeIcon className="w-5 h-5 text-green-500"/><h4 className="font-bold text-sm">Banner Ads (Adsterra/Monetag)</h4></div><div className="space-y-6"><div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl"><div className="flex justify-between items-center mb-3"><span className="font-bold text-[10px] uppercase text-gray-500">Home Screen Ad</span><div onClick={() => setSettings({...settings, earnSettings: { ...settings.earnSettings!, homeAdActive: !settings.earnSettings!.homeAdActive }})} className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${settings.earnSettings?.homeAdActive ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.earnSettings?.homeAdActive ? 'translate-x-4' : ''}`}></div></div></div><textarea value={settings.earnSettings?.homeAdCode || ''} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, homeAdCode: e.target.value }})} className={`${inputClass} font-mono text-[10px]`} placeholder="Paste script code here..." rows={3} /></div><div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl"><div className="flex justify-between items-center mb-3"><span className="font-bold text-[10px] uppercase text-gray-500">Earn Screen Ad</span><div onClick={() => setSettings({...settings, earnSettings: { ...settings.earnSettings!, earnAdActive: !settings.earnSettings!.earnAdActive }})} className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${settings.earnSettings?.earnAdActive ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.earnSettings?.earnAdActive ? 'translate-x-4' : ''}`}></div></div></div><textarea value={settings.earnSettings?.earnAdCode || ''} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, earnAdCode: e.target.value }})} className={`${inputClass} font-mono text-[10px]`} placeholder="Paste script code here..." rows={3} /></div><div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl"><div className="flex justify-between items-center mb-3"><span className="font-bold text-[10px] uppercase text-gray-500">Profile Pages Ad</span><div onClick={() => setSettings({...settings, earnSettings: { ...settings.earnSettings!, profileAdActive: !settings.earnSettings!.profileAdActive }})} className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${settings.earnSettings?.profileAdActive ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.earnSettings?.profileAdActive ? 'translate-x-4' : ''}`}></div></div></div><textarea value={settings.earnSettings?.profileAdCode || ''} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, profileAdCode: e.target.value }})} className={`${inputClass} font-mono text-[10px]`} placeholder="Paste script code here..." rows={3} /></div></div></div><button onClick={handleSettingsSave} disabled={!isSettingsChanged} className={`w-full py-3.5 font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 transform ${isSettingsChanged ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Save All All Ad Settings</button></div>
                                )}
                                {activeTool === 'notifications' && (
                                    <div className="space-y-6">
                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-3xl border border-purple-100 dark:border-purple-900/20"><button onClick={() => setIsNotifModalOpen(true)} className="w-full py-3.5 bg-purple-600 text-white rounded-2xl font-bold shadow-md hover:bg-purple-700 transition-colors text-sm active:scale-95 transform">+ Create Message</button></div>
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700"><div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100"><h4 className="font-bold text-sm text-indigo-600">Login Popup</h4><div onClick={() => setPopupConfig({...popupConfig, active: !popupConfig.active})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${popupConfig.active ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${popupConfig.active ? 'translate-x-5' : 'translate-x-0'}`}></div></div></div><div className="space-y-3"><input type="text" placeholder="Title" value={popupConfig.title} onChange={(e) => setPopupConfig({...popupConfig, title: e.target.value})} className={inputClass} /><textarea placeholder="Message..." value={popupConfig.message} onChange={(e) => setPopupConfig({...popupConfig, message: e.target.value})} className={inputClass} rows={2} /><input type="text" placeholder="Image URL (Optional)" value={popupConfig.imageUrl || ''} onChange={(e) => setPopupConfig({...popupConfig, imageUrl: e.target.value})} className={inputClass} /><button onClick={handleSavePopupConfig} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs mt-2 hover:bg-indigo-700 active:scale-95 transform">Save Popup</button></div></div>
                                        <div><div className="space-y-3">{notifications.map(n => (<div key={n.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex justify-between items-start border border-gray-100 dark:border-gray-700"><div><p className="font-bold text-sm text-gray-900 dark:text-white">{n.title}</p><p className="text-xs text-gray-500 line-clamp-1">{n.message}</p></div><button onClick={() => handleDeleteNotification(n.id)} className="text-red-500 p-2 active:scale-90 transform"><TrashIcon className="w-4 h-4"/></button></div>))}</div></div>
                                    </div>
                                )}
                                {activeTool === 'contacts' && (
                                    <div>
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6"><div className="space-y-4"><div><label className="block text-xs font-bold text-gray-500 mb-2">Support Message</label><textarea value={settings.contactMessage || ''} onChange={(e) => setSettings({...settings,contactMessage: e.target.value})} className={inputClass} rows={3} /></div><div><label className="block text-xs font-bold text-gray-500 mb-2">Operating Hours</label><input type="text" value={settings.operatingHours || ''} onChange={(e) => setSettings({...settings, operatingHours: e.target.value})} className={inputClass} /></div></div><button onClick={handleSettingsSave} disabled={!isSettingsChanged} className={`w-full mt-4 py-3.5 font-bold text-xs rounded-2xl shadow-md transition-all active:scale-95 transform ${isSettingsChanged ? 'bg-blue-600 text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Save Settings</button></div>
                                        <button onClick={openAddContactModal} className="w-full py-4 mb-6 bg-blue-50 text-blue-600 border-2 border-dashed border-blue-200 rounded-2xl font-bold text-sm active:scale-95 transform">+ Add Custom Contact</button>
                                        <div className="space-y-3">{contacts.map((c, i) => (<div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-700"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg overflow-hidden bg-white border flex items-center justify-center">{c.iconUrl ? <img src={c.iconUrl} className="w-full h-full object-cover" /> : <div className="text-primary font-black uppercase">{c.title?.charAt(0)}</div>}</div><div><p className="font-bold text-sm text-gray-900 dark:text-white">{c.title || c.labelKey}</p><p className="text-[8px] text-gray-400 font-mono truncate max-w-[150px]">{c.link}</p></div></div><div className="flex gap-2"><button onClick={() => openEditContactModal(c, i)} className="text-blue-500 p-2 active:scale-90 transform"><EditIcon className="w-5 h-5"/></button><button onClick={() => handleDeleteContact(i)} className="text-red-500 p-2 active:scale-90 transform"><TrashIcon className="w-4 h-4"/></button></div></div>))}</div>
                                    </div>
                                )}
                                {activeTool === 'faqs' && (
                                    <div>
                                        <button onClick={openAddFaqModal} className="w-full py-4 mb-6 bg-purple-50 text-purple-600 border-2 border-dashed border-purple-200 rounded-2xl font-bold text-sm active:scale-95 transform">+ Add New FAQ</button>
                                        <div className="space-y-3">{faqs.map((f, i) => (<div key={f.id || i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"><div className="flex justify-between items-start mb-2"><div className="flex-1 pr-4"><p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{f.question}</p><p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{f.answer}</p></div><div className="flex gap-2 shrink-0"><button onClick={() => openEditFaqModal(f)} className="text-blue-500 p-2 active:scale-90 transform bg-white dark:bg-slate-700 rounded-lg shadow-sm"><EditIcon className="w-4 h-4"/></button><button onClick={() => handleDeleteFaq(f.id)} className="text-red-500 p-2 active:scale-90 transform bg-white dark:bg-slate-700 rounded-lg shadow-sm"><TrashIcon className="w-4 h-4"/></button></div></div></div>))}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6 animate-smart-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"><div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3"><SettingsIcon className="w-5 h-5 text-blue-500" /><h4 className="font-bold text-sm">Identity</h4></div><div className="space-y-4"><div><label className="block text-xs font-bold text-gray-500 mb-2">App Name</label><input type="text" value={settings.appName} onChange={(e) => setSettings({...settings, appName: e.target.value})} className={inputClass} /></div><div><label className="block text-xs font-bold text-gray-500 mb-2">Notice Message</label><textarea value={settings.notice || ''} onChange={(e) => setSettings({...settings, notice: e.target.value})} className={inputClass} rows={2} /></div></div></div>
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"><div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3"><EyeIcon className="w-5 h-5 text-purple-500" /><h4 className="font-bold text-sm">Control</h4></div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><span className="font-bold text-xs text-blue-600">Header Logo</span><div onClick={() => setSettings({...settings, headerLogoActive: !settings.headerLogoActive})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.headerLogoActive !== false ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.headerLogoActive !== false ? 'translate-x-5' : ''}`}></div></div></div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><div className="flex items-center gap-2"><GamepadIcon className="w-4 h-4 text-primary" /><span className="font-bold text-xs">FF Quiz Active/Inactive</span></div><div onClick={() => setSettings({...settings, isQuizEnabled: !settings.isQuizEnabled})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.isQuizEnabled !== false ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.isQuizEnabled !== false ? 'translate-x-5' : ''}`}></div></div></div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><span className="font-bold text-xs text-primary">Login Header (Logo+Name)</span><div onClick={() => setSettings({...settings, loginAppNameActive: !settings.loginAppNameActive})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.loginAppNameActive !== false ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.loginAppNameActive !== false ? 'translate-x-5' : ''}`}></div></div></div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><span className="font-bold text-xs text-secondary">Wallet Spacing</span><div onClick={() => setSettings({...settings, walletSpacingActive: !settings.walletSpacingActive})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.walletSpacingActive !== false ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.walletSpacingActive !== false ? 'translate-x-5' : ''}`}></div></div></div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><span className="font-bold text-xs text-red-500">Maintenance</span><div onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-5' : ''}`}></div></div></div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><span className="font-bold text-xs text-indigo-500">Auto Notif System</span><div onClick={() => setSettings({...settings, autoNotifActive: !settings.autoNotifActive})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.autoNotifActive !== false ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.autoNotifActive !== false ? 'translate-x-5' : ''}`}></div></div></div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><span className="font-bold text-xs text-orange-500">Show Card Border</span><div onClick={() => setSettings({...settings, uiSettings: { ...settings.uiSettings!, showCardBorder: !settings.uiSettings?.showCardBorder }})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.uiSettings?.showCardBorder !== false ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.uiSettings?.showCardBorder !== false ? 'translate-x-5' : ''}`}></div></div></div>
                                        <div className="bg-gray-50 p-3 rounded-2xl"><label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Offer Card Size</label><div className="grid grid-cols-2 gap-2">{[{ id: 'normal', label: 'Default' }, { id: 'small', label: 'Small' }, { id: 'smaller', label: 'Extra Small' }, { id: 'extra-small', label: 'Tiny' }].map(size => (<button key={size.id} type="button" onClick={() => setSettings({ ...settings, uiSettings: { ...settings.uiSettings!, cardSize: size.id as any } })} className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${settings.uiSettings?.cardSize === size.id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}>{size.label}</button>))}</div></div>
                                        <div className="grid grid-cols-2 gap-3">{Object.keys(settings.visibility || {}).map((key) => (<div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"><span className="capitalize text-[10px] font-bold">{key}</span><div onClick={() => setSettings({...settings, visibility: {...settings.visibility!, [key]: !settings.visibility![key as keyof AppVisibility]}})} className={`flex-shrink-0 w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${settings.visibility![key as keyof AppVisibility] ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.visibility![key as keyof AppVisibility] ? 'translate-x-4' : ''}`}></div></div></div>))}</div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl mt-2"><span className="font-bold text-xs text-gray-600">Animations</span><div onClick={() => setSettings({ ...settings, uiSettings: { ...settings.uiSettings!, animationsEnabled: !settings.uiSettings?.animationsEnabled } })} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.uiSettings?.animationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.uiSettings?.animationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div></div></div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"><div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3"><DollarIcon className="w-5 h-5 text-yellow-500" /><h4 className="font-bold text-sm">Earning Rules</h4></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">Daily Limit</label><input type="number" value={settings.earnSettings?.dailyLimit} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, dailyLimit: Number(e.target.value) }})} className={inputClass} /></div><div><label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">Reward (৳)</label><input type="number" value={settings.earnSettings?.rewardPerAd} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, rewardPerAd: Number(e.target.value) }})} className={inputClass} /></div><div><label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">Cooldown (s)</label><input type="number" value={settings.earnSettings?.adCooldownSeconds} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, adCooldownSeconds: Number(e.target.value) }})} className={inputClass} /></div><div><label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">Reset (h)</label><input type="number" value={settings.earnSettings?.resetHours} onChange={(e) => setSettings({...settings, earnSettings: { ...settings.earnSettings!, resetHours: Number(e.target.value) }})} className={inputClass} /></div></div><div className="mt-4 space-y-3"><div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><div className="flex items-center gap-2"><ShieldIcon className="w-4 h-4 text-blue-500" /><span className="font-bold text-[10px]">VPN Mandatory (Force)</span></div><div onClick={() => setSettings({...settings, earnSettings: { ...settings.earnSettings!, vpnRequired: !settings.earnSettings?.vpnRequired }})} className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${settings.earnSettings?.vpnRequired ? 'bg-red-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.earnSettings?.vpnRequired ? 'translate-x-4' : ''}`}></div></div></div><div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><div className="flex items-center gap-2"><BellIcon className="w-4 h-4 text-orange-500" /><span className="font-bold text-[10px]">VPN Notice (Per Session)</span></div><div onClick={() => setSettings({...settings, earnSettings: { ...settings.earnSettings!, vpnNoticeActive: !settings.earnSettings?.vpnNoticeActive }})} className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${settings.earnSettings?.vpnNoticeActive ? 'bg-orange-500' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.earnSettings?.vpnNoticeActive ? 'translate-x-4' : ''}`}></div></div></div></div></div>
                                
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3"><ClockIcon className="w-5 h-5 text-red-500" /><h4 className="font-bold text-sm">Order System</h4></div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                                            <span className="font-bold text-xs">Auto-Refund Status</span>
                                            <div onClick={() => setSettings({...settings, autoRefundActive: !settings.autoRefundActive})} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${settings.autoRefundActive !== false ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${settings.autoRefundActive !== false ? 'translate-x-5' : ''}`}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">Auto-Refund After (Minutes)</label>
                                            <input type="number" value={settings.autoRefundMinutes || 30} onChange={(e) => setSettings({...settings, autoRefundMinutes: Number(e.target.value)})} className={inputClass} />
                                        </div>
                                    </div>
                                </div>

                                {showDevCard && (<div className="md:col-span-2 bg-red-50 p-5 rounded-3xl border border-red-200"><div className="flex items-center gap-3 mb-4"><CodeIcon className="w-5 h-5 text-red-600" /><h4 className="font-bold text-sm text-red-700">Developer Info (Locked)</h4>{isDevUnlocked ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">UNLOCKED</span> : <button onClick={handleUnlockDevInfo} className="text-[10px] bg-white text-red-500 px-3 py-1 rounded-full font-bold shadow-sm">Unlock</button>}</div>{isDevUnlocked && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label>Title</label><input type="text" value={devSettings.title} onChange={(e) => setDevSettings({...devSettings, title: e.target.value})} className={inputClass} /></div><div><label>URL</label><input type="text" value={devSettings.url} onChange={(e) => setDevSettings({...devSettings, url: e.target.value})} className={inputClass} /></div><div className="md:col-span-2"><label>Description</label><input type="text" value={devSettings.description} onChange={(e) => setDevSettings({...devSettings, description: e.target.value})} className={inputClass} /></div><button onClick={handleSaveDeveloperInfo} className="md:col-span-2 py-3 bg-green-600 text-white font-bold rounded-2xl active:scale-95 transform">Save Info</button></div>)}</div>)}
                            </div>
                            <button onClick={handleSettingsSave} disabled={!isSettingsChanged} className={`w-full py-4 font-bold text-sm rounded-2xl shadow-lg transition-all mt-6 active:scale-95 transform ${isSettingsChanged ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Save All Changes</button>
                        </div>
                    )}
                </main>
            </div>

            {/* Confirmation Dialog */}
            {pendingAction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-smart-fade-in">
                    <div className="bg-white dark:bg-dark-card rounded-3xl p-6 w-full max-w-xs animate-smart-pop-in shadow-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-center mb-2">{pendingAction.title}</h3>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">{pendingAction.message}</p>
                        <div className="flex space-x-3">
                            <button onClick={() => setPendingAction(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                            <button onClick={pendingAction.onConfirm} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-primary/30">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {isOfferModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-sm shadow-2xl"><h3 className="text-xl font-bold mb-6 text-center">{editingOffer?.id ? 'Edit' : 'Add'} {offerType}</h3><form onSubmit={handleSaveOffer} className="space-y-4">{offerType !== 'diamond' && (<input type="text" placeholder="Name" value={editingOffer?.name || ''} onChange={e => setEditingOffer({...editingOffer, name: e.target.value})} className={inputClass} />)}{(offerType === 'diamond' || offerType === 'special') && (<input type="number" placeholder="Diamonds" value={editingOffer?.diamonds || ''} onChange={e => setEditingOffer({...editingOffer, diamonds: e.target.value})} className={inputClass} />)}{offerType === 'special' && (<input type="text" placeholder="Title" value={editingOffer?.title || ''} onChange={e => setEditingOffer({...editingOffer, title: e.target.value})} className={inputClass} />)}{offerType === 'premium' && (<textarea placeholder="Description (Optional)" value={editingOffer?.description || ''} onChange={e => setEditingOffer({...editingOffer, description: e.target.value})} className={inputClass} rows={2} />)}{offerType === 'special' && (<div className="flex items-center gap-2"><input type="checkbox" checked={editingOffer?.isActive || false} onChange={e => setEditingOffer({...editingOffer, isActive: e.target.checked})} /><label>Active</label></div>)}<input type="number" placeholder="Price" value={editingOffer?.price || ''} onChange={e => setEditingOffer({...editingOffer, price: e.target.value})} className={inputClass} /><div className="flex gap-3 mt-6"><button type="button" onClick={() => setIsOfferModalOpen(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-2xl text-xs active:scale-95 transform">Cancel</button><button type="submit" disabled={!isOfferValid} className={`flex-1 py-3 rounded-2xl text-xs font-bold text-white active:scale-95 transform ${isOfferValid ? 'bg-primary' : 'bg-gray-300'}`}>Save</button></div></form></div></div>)}
            {isMethodModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-w-sm"><h3 className="text-lg font-bold mb-4">Payment Method</h3><form onSubmit={handleSaveMethod} className="space-y-4"><input type="text" placeholder="Name" value={editingMethod?.name || ''} onChange={e => setEditingMethod({...editingMethod!, name: e.target.value})} className={inputClass} /><input type="text" placeholder="Number" value={editingMethod?.accountNumber || ''} onChange={e => setEditingMethod({...editingMethod!, accountNumber: e.target.value})} className={inputClass} /><input type="text" placeholder="Logo URL" value={editingMethod?.logo || ''} onChange={e => setEditingMethod({...editingMethod!, logo: e.target.value})} className={inputClass} /><textarea placeholder="Instructions" value={editingMethod?.instructions || ''} onChange={e => setEditingMethod({...editingMethod!, instructions: e.target.value})} className={inputClass} rows={3} /><div className="flex gap-3"><button type="button" onClick={() => setIsMethodModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl text-xs font-bold active:scale-95 transform">Cancel</button><button type="submit" disabled={!isMethodValid} className="flex-1 py-3 bg-primary text-white rounded-2xl text-xs font-bold active:scale-95 transform">Save</button></div></form></div></div>)}
            {isContactModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-w-sm shadow-2xl"><h3 className="text-lg font-black mb-6 text-center uppercase tracking-widest text-primary">Support Contact</h3><form onSubmit={handleSaveContact} className="space-y-4"><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Contact Title (Name)</label><input type="text" placeholder="e.g. My Official YouTube" value={editingContact?.title || ''} onChange={e => setEditingContact({...editingContact, title: e.target.value})} className={inputClass} /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Logo/Icon URL (Google/URL)</label><input type="text" placeholder="https://logo-link.png" value={editingContact?.iconUrl || ''} onChange={e => setEditingContact({...editingContact, iconUrl: e.target.value})} className={inputClass} /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Target Link (URL)</label><input type="text" placeholder="https://youtube.com/..." value={editingContact?.link || ''} onChange={e => setEditingContact({...editingContact, link: e.target.value})} className={inputClass} /></div><div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsContactModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-bold active:scale-95 transform text-gray-500">Cancel</button><button type="submit" disabled={!isContactValid} className={`flex-1 py-3.5 rounded-2xl text-xs font-bold text-white active:scale-95 transform ${isContactValid ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-300'}`}>Save Contact</button></div></form></div></div>)}
            {isFaqModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"><h3 className="text-lg font-black mb-6 text-center uppercase tracking-widest text-primary">Manage FAQ</h3><form onSubmit={handleSaveFaq} className="space-y-4"><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Question (EN)</label><input type="text" placeholder="e.g. How to buy?" value={editingFaq?.question || ''} onChange={e => setEditingFaq({...editingFaq!, question: e.target.value})} className={inputClass} /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Question (BN)</label><input type="text" placeholder="উদা: কীভাবে কিনব?" value={editingFaq?.question_bn || ''} onChange={e => setEditingFaq({...editingFaq!, question_bn: e.target.value})} className={inputClass} /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Answer (EN)</label><textarea rows={3} placeholder="Answer in English..." value={editingFaq?.answer || ''} onChange={e => setEditingFaq({...editingFaq!, answer: e.target.value})} className={inputClass} /></div><div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Answer (BN)</label><textarea rows={3} placeholder="বাংলায় উত্তর..." value={editingFaq?.answer_bn || ''} onChange={e => setEditingFaq({...editingFaq!, answer_bn: e.target.value})} className={inputClass} /></div><div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsFaqModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-bold active:scale-95 transform text-gray-500">Cancel</button><button type="submit" disabled={!isFaqValid} className={`flex-1 py-3.5 rounded-2xl text-xs font-bold text-white active:scale-95 transform ${isFaqValid ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-300'}`}>Save FAQ</button></div></form></div></div>)}
            {isNotifModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-smart-pop-in"><h3 className="text-lg font-black mb-4 text-center uppercase tracking-wider text-primary">Broadcast Message</h3><form onSubmit={handleSendNotification} className="space-y-3"><div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Title (EN)" value={newNotif.title} onChange={e => setNewNotif({...newNotif, title: e.target.value})} className={inputClass} /><input type="text" placeholder="Title (BN)" value={newNotif.title_bn} onChange={e => setNewNotif({...newNotif, title_bn: e.target.value})} className={inputClass} /></div><textarea placeholder="Message (EN)" value={newNotif.message} onChange={e => setNewNotif({...newNotif, message: e.target.value})} className={inputClass} rows={2} /><textarea placeholder="Message (BN)" value={newNotif.message_bn} onChange={e => setNewNotif({...newNotif, message_bn: e.target.value})} className={inputClass} rows={2} /><div className="flex gap-3 mt-4"><button type="button" onClick={() => setIsNotifModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-bold active:scale-95 transform transition-all uppercase tracking-widest text-gray-500">Cancel</button><button type="submit" disabled={!isNotifValid} className={`flex-1 py-3.5 rounded-2xl text-xs font-bold text-white active:scale-95 transform transition-all uppercase tracking-widest ${isNotifValid ? 'bg-gradient-to-r from-primary to-secondary shadow-lg' : 'bg-gray-300'}`}>Send Now</button></div></form></div></div>)}
            {isSecurityModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-w-xs text-center"><LockIcon className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-bold mb-2">Security Check</h3><form onSubmit={handleVerifySecurityKey}><input type="password" value={securityKeyInput} onChange={e => setSecurityKeyInput(e.target.value)} className={`${inputClass} text-center tracking-widest mb-4`} autoFocus /><div className="flex gap-2"><button type="button" onClick={() => setIsSecurityModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl text-xs font-bold active:scale-95 transform">Cancel</button><button type="submit" className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-xs font-bold active:scale-95 transform">Unlock</button></div></form></div></div>)}
            {balanceModalUser && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-w-xs"><h3 className="text-lg font-bold mb-4">{balanceAction === 'add' ? 'Add' : 'Deduct'} Balance</h3><p className="text-sm text-gray-500 mb-4">{balanceModalUser.name} (৳{Math.floor(balanceModalUser.balance)})</p><input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className={inputClass} placeholder="Amount" autoFocus /><div className="flex gap-3 mt-4"><button onClick={() => setBalanceModalUser(null)} className="flex-1 py-3 bg-gray-100 rounded-2xl text-xs font-bold active:scale-95 transform">Cancel</button><button onClick={handleBalanceUpdate} className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-xs font-bold active:scale-95 transform">Confirm</button></div></div></div>)}
            {isBannerModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-dark-card p-6 rounded-3xl w-full max-w-sm"><h3 className="text-lg font-bold mb-4">Edit Banner</h3><form onSubmit={handleSaveBanner} className="space-y-4"><input type="text" placeholder="Image URL" value={tempBannerUrl} onChange={e => setTempBannerUrl(e.target.value)} className={inputClass} /><input type="text" placeholder="Action URL" value={tempActionUrl} onChange={e => setTempActionUrl(e.target.value)} className={inputClass} /><div className="flex gap-3"><button type="button" onClick={() => setIsBannerModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl text-xs font-bold active:scale-95 transform">Cancel</button><button type="submit" disabled={!tempBannerUrl} className="flex-1 py-3 bg-primary text-white rounded-2xl text-xs font-bold active:scale-95 transform">Save</button></div></form></div></div>)}
        </div>
    );
};

export default AdminScreen;
