import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link, Outlet } from "@tanstack/react-router";
import { useConvexUser } from "../../hooks/useConvexUser";
import { 
  Home, 
  Users, 
  FolderGit2, 
  Settings, 
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout() {
  const { isSuperuser } = useConvexUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-200">
      <SignedIn>
        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 flex">
            <div
              className={clsx(
                "fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out",
                sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              onClick={() => setSidebarOpen(false)}
            />
            
            <div
              className={clsx(
                "relative flex w-80 max-w-xs flex-1 flex-col bg-base-100 pt-5 pb-4 transition-transform duration-300 ease-in-out",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <div className="absolute right-0 top-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex flex-shrink-0 items-center px-4">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Elevra"
                />
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="space-y-1 px-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="group flex items-center rounded-lg px-2 py-2 text-base font-medium hover:bg-base-200"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-4 h-6 w-6" aria-hidden="true" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-16 flex-shrink-0 items-center px-4">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Elevra"
              />
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center rounded-lg px-2 py-2 text-sm font-medium hover:bg-base-200"
                  >
                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:pl-64">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-base-100 shadow">
            <button
              type="button"
              className="px-4 text-sm lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <div className="flex flex-1 justify-end px-4">
              <div className="ml-4 flex items-center gap-4">
                {isSuperuser && (
                  <span className="badge badge-primary">Super Admin</span>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>

          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please sign in to continue</h1>
            <p className="mt-2 text-base-content/60">
              You need to be signed in to access this page.
            </p>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
