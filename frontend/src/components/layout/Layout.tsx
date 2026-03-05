import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { OfflineBanner } from "../OfflineBanner";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <OfflineBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
