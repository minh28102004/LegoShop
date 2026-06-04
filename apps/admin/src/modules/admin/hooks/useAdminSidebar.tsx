'use client';

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AdminSidebarContextValue = {
  isExpanded: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue | undefined>(undefined);

export function AdminSidebarProvider({ children }: PropsWithChildren) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const value = useMemo<AdminSidebarContextValue>(
    () => ({
      isExpanded: isMobile ? false : isExpanded,
      isMobile,
      isMobileOpen,
      toggleSidebar: () => setIsExpanded((prev) => !prev),
      toggleMobileSidebar: () => setIsMobileOpen((prev) => !prev),
      closeMobileSidebar: () => setIsMobileOpen(false),
    }),
    [isExpanded, isMobile, isMobileOpen],
  );

  return <AdminSidebarContext.Provider value={value}>{children}</AdminSidebarContext.Provider>;
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used inside AdminSidebarProvider');
  }
  return context;
}
