"use client";

import React, { useState } from "react";
import { ListChecks, Menu, X } from "lucide-react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("intake-list");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
          h-screen w-64 sm:w-72 lg:w-64 xl:w-72
          p-4 lg:p-6
          bg-gray-50 dark:bg-gray-950 
          flex flex-col 
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top Section */}
        <div className="mb-8 flex items-center gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-2"
            onClick={() => {
              setIsMobileMenuOpen(false);
            }}
          >
            <img
              src="/logo.png"
              alt="Legacore Infomatics"
              className="h-8 lg:h-10"
            />
            <h1 className="text-lg lg:text-xl font-bold">
              Lega<span className="font-semibold text-green-300">sys</span>
            </h1>
          </Link>
        </div>

        {/* Menu Section */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link
                href="/intake-list"
                onClick={() => {
                  setActiveItem("intake-list");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeItem === "intake-list"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <ListChecks className="w-5 h-5" />
                <span className="font-medium">Intake List</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;