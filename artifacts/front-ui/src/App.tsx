import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { WorkspaceProvider } from "@/lib/workspace-store";
import { ScheduleProvider } from "@/lib/schedule-store";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import WorkspaceList from "@/pages/WorkspaceList";
import SubjectDetails from "@/pages/SubjectDetails";
import ScheduleList from "@/pages/ScheduleList";
import MahasiswaList from '@/pages/MahasiswaList';
import MahasiswaTranskrip from '@/pages/MahasiswaTranskrip';
import MataKuliahList from '@/pages/MataKuliahList';
import NilaiList from '@/pages/NilaiList';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedApp() {
  return (
    //<RequireAuth>
    <WorkspaceProvider>
      <ScheduleProvider>
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/workspace" component={WorkspaceList} />
            <Route path="/workspace/:id" component={SubjectDetails} />
            <Route path="/schedule" component={ScheduleList} />
            {FEATURE_FLAGS.ENABLE_MAHASISWA_MENU && (
              <>
                <Route path="/mahasiswa" component={MahasiswaList} />
                <Route path="/mahasiswa/:id/transkrip" component={MahasiswaTranskrip} />  
              </>
            )}
            <Route path="/mata-kuliah" component={MataKuliahList} />
            <Route path="/nilai" component={NilaiList} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </ScheduleProvider>
    </WorkspaceProvider>
    //</RequireAuth>
  );
}

function Router() {
  return (
    <Switch>
      {/* Login berdiri sendiri, di luar AppLayout & RequireAuth */}
      <Route path="/login" component={Login} />
      {/* Semua route lain wajib login, dibungkus AppLayout */}
      <Route>
        <ProtectedApp />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
