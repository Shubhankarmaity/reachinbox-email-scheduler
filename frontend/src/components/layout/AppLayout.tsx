import { useState } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation overlay"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            />

            <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
              <Sidebar
                onNavigate={() =>
                  setMobileMenuOpen(false)
                }
              />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() =>
              setMobileMenuOpen((current) => !current)
            }
          />

          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-600 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span>
                ReachInbox · Email Campaign Management
              </span>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">
                  {user?.email}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="text-slate-500 transition hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}