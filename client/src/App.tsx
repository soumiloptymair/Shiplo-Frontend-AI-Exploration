import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { OrdersDataGrid } from "@/pages/OrdersDataGrid";
import { ShipmentsPage } from "@/pages/ShipmentsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ShipmentsPage} />
      <Route path="/shipments" component={ShipmentsPage} />
      <Route path="/pick-and-pack" component={OrdersDataGrid} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
