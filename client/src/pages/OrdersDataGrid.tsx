import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";
import { PickPackDashboardSection } from "./sections/PickPackDashboardSection";

export const OrdersDataGrid = (): JSX.Element => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Auto-collapse the sidebar on narrow screens (responsive)
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
    <main className="min-h-screen w-full bg-grey-02 p-2">
      <div className="mx-auto flex w-full items-stretch gap-2">
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
          <CardContent className="h-full p-0">
            <PickPackDashboardSection />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
