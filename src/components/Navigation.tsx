import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Users, Scale, LogIn, Settings, UserCog, Home, Search } from 'lucide-react';
import { useUsers } from '../context/UsersContext';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from './UserMenu';
import Logo from './Logo';

const MenuIcon = () => (
  <svg 
    className="w-5 h-5 mr-2" 
    viewBox="0 0 115.63 115.62" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      className="fill-current" 
      d="M189.5,73.83H98.88a12.49,12.49,0,0,0-12.5,12.5V177a12.5,12.5,0,0,0,12.5,12.5H189.5A12.5,12.5,0,0,0,202,177V86.33A12.5,12.5,0,0,0,189.5,73.83Zm-15.62,65.62H152v21.88H133.25V139.45H111.38V120.7h21.87V98.83H152V120.7h21.88Z" 
      transform="translate(-86.38 -73.83)"
    />
  </svg>
);

const HomeIcon = () => (
  <svg 
    className="w-5 h-5" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
  </svg>
);

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { totalUsers } = useUsers();
  const { selectedSystems } = useComparison();
  const { user, isAdmin, isEditor, canViewUsers, canViewSystems, canViewCompanies } = useAuth();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showAdminPanel = isAdmin || isEditor;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#d2d2d7]/30 h-14">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-2 items-center">
            <NavLink
              to="/"
              className="flex items-center mr-4"
            >
              <Logo />
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                ${isActive
                  ? 'text-[#0066CC]'
                  : 'text-[#2c3b67] hover:text-[#0066CC]'
                }`
              }
              title="Strona główna"
            >
              <HomeIcon />
            </NavLink>
            <NavLink
              to="/partnerzy"
              className={({ isActive }) =>
                `inline-flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Partnerzy
                </>
              )}
            </NavLink>
            <NavLink
              to="/systemy-erp"
              className={({ isActive }) =>
                `inline-flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Systemy ERP
                </>
              )}
            </NavLink>
            <NavLink
              to="/porownaj-systemy-erp"
              className={({ isActive }) =>
                `inline-flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Raport ERP
                </>
              )}
            </NavLink>
            <NavLink
              to="/kalkulator"
              className={({ isActive }) =>
                `inline-flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Kalkulator ERP
                </>
              )}
            </NavLink>
            <NavLink
              to="/firmy-it"
              className={({ isActive }) =>
                `inline-flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Firmy IT
                </>
              )}
            </NavLink>
            <NavLink
              to="/slownik-erp"
              className={({ isActive }) =>
                `inline-flex items-center px-2 py-2 text-[15px] font-medium transition duration-200 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Słownik ERP
                </>
              )}
            </NavLink>
          </div>

          {/* Status Indicators and User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {totalUsers > 0 && (location.pathname === '/' || location.pathname === '/kalkulator') && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-[#F5F5F7] rounded-lg">
                <Users className="w-4 h-4 text-[#2c3b67]" />
                <span className="text-[15px] font-medium text-[#1d1d1f]">
                  {totalUsers}
                </span>
              </div>
            )}
            
            {selectedSystems.length > 0 && location.pathname !== '/porownaj-systemy-erp' && (
              <NavLink
                to="/porownaj-systemy-erp"
                className="flex items-center gap-2 px-2 py-1.5 bg-[#F5F5F7] rounded-lg hover:bg-[#E8E8ED] transition-colors"
              >
                <Scale className="w-4 h-4 text-[#2c3b67]" />
                <span className="text-[15px] font-medium text-[#1d1d1f]">
                  {selectedSystems.length}
                </span>
              </NavLink>
            )}

            {showAdminPanel && (
              <>
                {isEditor && !isAdmin && (
                  <>
                    {canViewSystems && (
                      <NavLink
                        to="/editor/systems"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                          ${isActive 
                            ? 'bg-[#2c3b67] text-white'
                            : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                          }`
                        }
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-[15px] font-medium">
                          Moje systemy
                        </span>
                      </NavLink>
                    )}
                    {canViewCompanies && (
                      <NavLink
                        to="/editor/firmy-it"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                          ${isActive 
                            ? 'bg-[#2c3b67] text-white'
                            : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                          }`
                        }
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-[15px] font-medium">
                          Moje firmy
                        </span>
                      </NavLink>
                    )}
                    {canViewUsers && (
                      <NavLink
                        to="/editor/users"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                          ${isActive 
                            ? 'bg-[#2c3b67] text-white'
                            : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                          }`
                        }
                      >
                        <UserCog className="w-4 h-4" />
                        <span className="text-[15px] font-medium">
                          Użytkownicy
                        </span>
                      </NavLink>
                    )}
                  </>
                )}

                {isAdmin && (
                  <>
                    <NavLink
                      to="/admin/home"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                        ${isActive 
                          ? 'bg-[#2c3b67] text-white'
                          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                        }`
                      }
                    >
                      <Home className="w-4 h-4" />
                      <span className="text-[15px] font-medium">
                        CMS
                      </span>
                    </NavLink>
                    <NavLink
                      to="/admin/systemy"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                        ${isActive 
                          ? 'bg-[#2c3b67] text-white'
                          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                        }`
                      }
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-[15px] font-medium">
                        PANEL
                      </span>
                    </NavLink>

                    <NavLink
                      to="/admin/firmy-it"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                        ${isActive 
                          ? 'bg-[#2c3b67] text-white'
                          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                        }`
                      }
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-[15px] font-medium">
                        FIRMY
                      </span>
                    </NavLink>

                    <NavLink
                      to="/admin/users"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                        ${isActive 
                          ? 'bg-[#2c3b67] text-white'
                          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                        }`
                      }
                    >
                      <UserCog className="w-4 h-4" />
                      <span className="text-[15px] font-medium">
                        Użytkownicy
                      </span>
                    </NavLink>
                  </>
                )}
              </>
            )}

            {!user ? (
              <div className="hidden md:flex items-center space-x-4">
                <NavLink
                  to="/admin/login"
                  className="sf-button-primary"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Zaloguj się
                </NavLink>
                <NavLink
                  to="/admin/register"
                  className="sf-button-primary"
                >
                  <UserCog className="w-5 h-5 mr-2" />
                  Zarejestruj się
                </NavLink>
              </div>
            ) : (
              <UserMenu />
            )}
          </div>

          {/* Mobile Menu Button and Status */}
          <div className="flex items-center md:hidden w-full">
            <div className="flex-1"></div>
            {totalUsers > 0 && (location.pathname === '/' || location.pathname === '/kalkulator') && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-[#F5F5F7] rounded-lg my-[8px] mr-2">
                <Users className="w-4 h-4 text-[#2c3b67]" />
                <span className="text-[13px] font-medium text-[#1d1d1f]">
                  {totalUsers}
                </span>
              </div>
            )}
            {selectedSystems.length > 0 && location.pathname !== '/porownaj-systemy-erp' && (
              <NavLink
                to="/porownaj-systemy-erp"
                className="flex items-center gap-2 px-2 py-1.5 bg-[#F5F5F7] rounded-lg my-[8px] mr-2"
              >
                <Scale className="w-4 h-4 text-[#2c3b67]" />
                <span className="text-[13px] font-medium text-[#1d1d1f]">
                  {selectedSystems.length}
                </span>
              </NavLink>
            )}
            <div className="md:hidden flex items-center">
              <NavLink
                to="/"
                className="flex items-center mr-4"
              >
                <Logo />
              </NavLink>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#2c3b67] hover:text-[#0066CC] focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#d2d2d7]/30">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 rounded-lg transition-colors whitespace-nowrap
                ${isActive
                  ? 'text-[#0066CC]'
                  : 'text-[#2c3b67] hover:text-[#0066CC]'
                }`
              }
              title="Strona główna"
            >
              <HomeIcon />
            </NavLink>
            <NavLink
              to="/partnerzy"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Partnerzy
                </>
              )}
            </NavLink>
            <NavLink
              to="/systemy-erp"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Systemy ERP
                </>
              )}
            </NavLink>
            <NavLink
              to="/porownaj-systemy-erp"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Raport ERP
                </>
              )}
            </NavLink>
            <NavLink
              to="/kalkulator"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Kalkulator ERP
                </>
              )}
            </NavLink>
            <NavLink
              to="/firmy-it"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Firmy IT
                </>
              )}
            </NavLink>
            <NavLink
              to="/slownik-erp"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-[15px] font-medium transition duration-200 focus:outline-none whitespace-nowrap
                ${isActive 
                  ? 'text-[#2c3b67]'
                  : 'text-[#2c3b67]/60 hover:text-[#2c3b67]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <MenuIcon />}
                  Słownik ERP
                </>
              )}
            </NavLink>

            {showAdminPanel && (
              <>
                {isEditor && !isAdmin && (
                  <>
                    {canViewSystems && (
                      <NavLink
                        to="/editor/systems"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                          ${isActive 
                            ? 'text-[#2c3b67]'
                            : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                          }`
                        }
                      >
                        <Settings className="w-4 h-4" />
                        Moje systemy
                      </NavLink>
                    )}
                    {canViewCompanies && (
                      <NavLink
                        to="/editor/firmy-it"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                          ${isActive 
                            ? 'text-[#2c3b67]'
                            : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                          }`
                        }
                      >
                        <Settings className="w-4 h-4" />
                        Moje firmy
                      </NavLink>
                    )}
                    {canViewUsers && (
                      <NavLink
                        to="/editor/users"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                          ${isActive 
                            ? 'text-[#2c3b67]'
                            : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                          }`
                        }
                      >
                        <UserCog className="w-4 h-4" />
                        Użytkownicy
                      </NavLink>
                    )}
                  </>
                )}

                {isAdmin && (
                  <>
                    <NavLink
                      to="/admin/home"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                        ${isActive 
                          ? 'text-[#2c3b67]'
                          : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                        }`
                      }
                    >
                      <Home className="w-4 h-4" />
                      CMS
                    </NavLink>
                    <NavLink
                      to="/admin/systemy"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                        ${isActive 
                          ? 'text-[#2c3b67]'
                          : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                        }`
                      }
                    >
                      <Settings className="w-4 h-4" />
                      PANEL
                    </NavLink>

                    <NavLink
                      to="/admin/firmy-it"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                        ${isActive 
                          ? 'text-[#2c3b67]'
                          : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                        }`
                      }
                    >
                      <Settings className="w-4 h-4" />
                      FIRMY
                    </NavLink>

                    <NavLink
                      to="/admin/users"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-2 text-[15px] font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none whitespace-nowrap
                        ${isActive 
                          ? 'text-[#2c3b67]'
                          : 'text-[#2c3b67]/60 hover:text-[#2c3b67] hover:shadow-sm'
                        }`
                      }
                    >
                      <UserCog className="w-4 h-4" />
                      Użytkownicy
                    </NavLink>
                  </>
                )}
              </>
            )}

            {!user ? (
              <div className="border-t border-[#d2d2d7]/30 mt-2 pt-2">
                <NavLink
                  to="/admin/login"
                  className="flex items-center gap-2 px-2 py-2 text-[15px] font-medium text-[#2c3b67]/60 hover:text-[#2c3b67] whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4" />
                  Zaloguj się
                </NavLink>
                <NavLink
                  to="/admin/register"
                  className="flex items-center gap-2 px-2 py-2 text-[15px] font-medium text-[#2c3b67]/60 hover:text-[#2c3b67] whitespace-nowrap"
                >
                  <UserCog className="w-4 h-4" />
                  Zarejestruj się
                </NavLink>
              </div>
            ) : (
              <div className="border-t border-[#d2d2d7]/30 mt-2 pt-2">
                <UserMenu />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};