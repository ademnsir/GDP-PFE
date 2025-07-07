"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar is open by default

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState); // Only change state explicitly
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-h-screen ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* Pass props to Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={toggleSidebar} />

        {/* Content */}
        <main className="p-6 flex-grow">{children}</main>
      </div>
    </div>
  );
}
