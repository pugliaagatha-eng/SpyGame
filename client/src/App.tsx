import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SpyGame from "@/components/game/SpyGame";
import { AudioProvider, MuteButton } from "@/components/game/AudioSystem";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SpyGame} />
      <Route path="*" component={SpyGame} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <MuteButton />
          <Toaster />
          <Router />
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
