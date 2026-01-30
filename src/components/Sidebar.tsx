"use client";

import React, { useState } from "react";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { menuItems } from "@/lib/menuItems";
import LoginLogoBg from "../../public/assets/images/auth/logo.png";
import Image from "next/image";

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("intake-list");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          h-screen ${isCollapsed ? 'w-16' : 'w-64 sm:w-72 lg:w-64 xl:w-72'}
          ${isCollapsed ? 'p-2' : 'p-4 lg:p-6'}
          bg-gray-50 dark:bg-gray-950
          flex flex-col
          border-r border-gray-200 dark:border-gray-800
          transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top Section */}
        <div className={`${isCollapsed ? 'mb-4' : 'mb-8'} flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <Link
            href="/"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}
            onClick={() => {
              setIsMobileMenuOpen(false);
            }}
          >
            <Image
              src={LoginLogoBg}
              alt="Legacore Infomatics"
              width={40}
              height={40}
              className={isCollapsed ? "h-6" : "h-8 lg:h-10"}
            />
            {!isCollapsed && (
              <h1 className="text-lg lg:text-xl font-bold">
                Lega<span className="font-semibold text-green-300">sys</span>
              </h1>
            )}
          </Link>
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-auto"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Menu Section */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.path.replace("/", "");

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => {
                    setActiveItem(item.path.replace("/", ""));
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;