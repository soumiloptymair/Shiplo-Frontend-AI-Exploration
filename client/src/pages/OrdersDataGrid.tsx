import { Card, CardContent } from "@/components/ui/card";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";
import { PickPackDashboardSection } from "./sections/PickPackDashboardSection";

export const OrdersDataGrid = (): JSX.Element => {
  return (
    <main className="w-full bg-grey-02 p-2">
      <div className="mx-auto flex w-full min-w-[1440px] items-stretch gap-2">
        <Card className="w-[14%] shrink-0 rounded-none border-0 bg-transparent shadow-none">
          <CardContent className="h-full p-0">
            <NavigationSidebarSection />
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
