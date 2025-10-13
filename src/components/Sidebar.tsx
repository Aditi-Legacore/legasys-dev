"use client";

import React, { useState } from "react";
import { ListChecks } from "lucide-react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("intake-list");

  return (
    <aside className="h-screen w-64 p-4 bg-gray-50 dark:bg-gray-950 flex flex-col border-r border-gray-200 dark:border-gray-800">
      {/* Top Section */}
        <div className="mb-8 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <img
                src="/logo.png"
                alt="Legacore Infomatics"
                className="h-8"
                />
                <h1 className="text-lg font-bold">
                Lega<span className="font-semibold text-green-300">sys</span>
                </h1>
            </Link>
        </div>

      {/* Menu Section */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveItem("intake-list")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeItem === "intake-list"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ListChecks className="w-5 h-5" />
              <span className="font-medium">Intake List</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
