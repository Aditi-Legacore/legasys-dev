"use client";

import React, { useEffect, useState, useRef } from "react";
import { Settings, Bell, Mail, Sun, Moon, Loader2, Menu, X, FileText, Calendar, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import Searchbar from "./Searchbar";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickIntakeOpen, setQuickIntakeOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const quickIntakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (quickIntakeRef.current && !quickIntakeRef.current.contains(event.target as Node)) {
        setQuickIntakeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const handleQuickForm = () => {
    setQuickIntakeOpen(false);
    // Add your quick form logic here
    console.log("Opening Quick Form...");
  };

  const handleQuickAppointment = () => {
    setQuickIntakeOpen(false);
    // Add your quick appointment logic here
    console.log("Opening Quick Appointment...");
  };

  return (
    <nav className="sticky top-0 z-30 flex justify-between items-center px-4 py-3 lg:px-6 lg:py-4 shadow-sm bg-white dark:bg-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800">
      {/* Left Section - Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 lg:pl-0">
        {/* Mobile: Smaller search, Desktop: Medium search */}
        <div className="flex-1 max-w-[160px] sm:max-w-xs md:max-w-md lg:max-w-lg ml-auto sm:ml-0">
          <Searchbar />
        </div>
      </div>

      {/* Desktop Actions - Hidden on Mobile/Tablet */}
      <div className="hidden lg:flex items-center gap-1 xl:gap-2">
        {/* Quick Intake Button */}
        <div className="relative mr-2" ref={quickIntakeRef}>
          <button
            onClick={() => setQuickIntakeOpen(!quickIntakeOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            aria-label="Quick Intake"
          >
            Quick Intake
            <ChevronDown className="w-4 h-4" />
          </button>

          {quickIntakeOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={handleQuickForm}
                className="w-full px-4 py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Quick Form
              </button>
              <button
                onClick={handleQuickAppointment}
                className="w-full px-4 py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                Quick Appointment
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Settings */}
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Messages */}
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Messages"
          title="Messages"
        >
          <Mail className="w-5 h-5" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="User menu"
          >
            <img
              src={session?.user?.image || "/avatar.png"}
              alt="User Avatar"
              className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
              <ul className="py-1">
                <li>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    My Profile
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    Inbox
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    Settings
                  </button>
                </li>
                <li className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={async () => {
                      setIsLoggingOut(true);
                      try {
                        await signOut({ callbackUrl: '/login' });
                      } finally {
                        setIsLoggingOut(false);
                      }
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-red-600 dark:text-red-400 text-sm disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging Out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Actions */}
      <div className="flex lg:hidden items-center gap-1 sm:gap-2">
        {/* Quick Intake Button - Mobile */}
        <div className="relative" ref={quickIntakeRef}>
          <button
            onClick={() => setQuickIntakeOpen(!quickIntakeOpen)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1"
            aria-label="Quick Intake"
          >
            <span className="hidden sm:inline">Quick</span>
            <FileText className="w-4 h-4 sm:hidden" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {quickIntakeOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={handleQuickForm}
                className="w-full px-4 py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Quick Form
              </button>
              <button
                onClick={handleQuickAppointment}
                className="w-full px-4 py-2.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                Quick Appointment
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle - Always visible */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notification Bell - Visible on tablet */}
        <button className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="absolute top-full left-0 right-0 mt-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <div className="p-4 space-y-3">
            {/* User Info Section */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <img
                src={session?.user?.image || "/avatar.png"}
                alt="User Avatar"
                className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left">
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Settings</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative text-left sm:hidden">
                <Bell className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Notifications</span>
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Messages</span>
              </button>
            </div>

            {/* Profile Actions */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <button className="w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                My Profile
              </button>
              
              <button className="w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Inbox
              </button>
              
              <button
                onClick={async () => {
                  setIsLoggingOut(true);
                  try {
                    await signOut({ callbackUrl: '/login' });
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                disabled={isLoggingOut}
                className="w-full text-left px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-red-600 dark:text-red-400 font-medium disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging Out...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;