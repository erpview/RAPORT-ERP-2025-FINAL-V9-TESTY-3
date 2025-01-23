import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfileModal } from './UserProfileModal';

export const UserMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors"
        >
          <User className="w-5 h-5 text-[#2c3b67]" />
          <span className="text-[15px] font-medium text-[#1d1d1f]">
            {user.email?.split('@')[0]}
          </span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#d2d2d7]/30 py-1 z-50">
            <div className="px-4 py-3 border-b border-[#d2d2d7]/30">
              <p className="text-[13px] font-medium text-[#1d1d1f]">
                Zalogowany jako
              </p>
              <p className="text-[13px] text-[#86868b] truncate">
                {user.email}
              </p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-[15px] text-[#1d1d1f] hover:bg-[#F5F5F7] transition-colors flex items-center gap-2"
              >
                <UserCircle className="w-4 h-4" />
                Mój profil
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                className="w-full px-4 py-2 text-left text-[15px] text-[#FF3B30] hover:bg-[#F5F5F7] transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Wyloguj się
              </button>
            </div>
          </div>
        )}
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};