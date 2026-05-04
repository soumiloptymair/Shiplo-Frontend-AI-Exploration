import { useEffect, useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationSidebarSection } from "@/pages/sections/NavigationSidebarSection";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps): JSX.Element => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsNavCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="h-screen w-full overflow-hidden bg-grey-02 p-2">
      <div className="mx-auto flex h-[calc(100vh-1rem)] w-full items-stretch gap-2">
        <Card
          className={`shrink-0 rounded-none border-0 bg-transparent shadow-none transition-all duration-200 ${
            isNavCollapsed ? "w-[60px]" : "w-[208px]"
          }`}
        >
          <CardContent className="h-full p-0">
            <NavigationSidebarSection
              isCollapsed={isNavCollapsed}
              onToggleCollapse={() => setIsNavCollapsed((v) => !v)}
            />
          </CardContent>
        </Card>
        <Card className="min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none">
          <CardContent className="h-full p-0">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
};
