import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarStateProvider } from "@/hooks/useSidebarState";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProjectRouteGuard } from "@/components/ProjectRouteGuard";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import ProfileEdit from "./pages/ProfileEdit";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Timeline from "./pages/Timeline";
import WBSManagement from "./pages/WBSManagement";
import ProjectCostManagement from "./pages/ProjectCostManagement";
import ProjectSummary from "./pages/ProjectSummary";
import AssetManagement from "./pages/AssetManagement";
import DailyReport from "./pages/DailyReport";
import WeeklyReport from "./pages/WeeklyReport";
import ProjectLog from "./pages/ProjectLog";
import Meetings from "./pages/Meetings";
import ResourceManagement from "./pages/ResourceManagement";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분간 fresh로 간주
      gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
      retry: 3, // 재시도 횟수
      refetchOnWindowFocus: true, // 윈도우 포커스 시 리페치
      refetchOnMount: true, // 컴포넌트 마운트 시 리페치
      refetchOnReconnect: true, // 네트워크 재연결 시 리페치
      refetchInterval: false, // 자동 리페치 비활성화
      refetchIntervalInBackground: false, // 백그라운드 리페치 비활성화
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarStateProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Layout>
                    <Projects />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/wbs" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <WBSManagement />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/resource" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <ResourceManagement />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/cost" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <ProjectCostManagement />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/summary" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <ProjectSummary />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/expense" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <AssetManagement />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/daily-report" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <DailyReport />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/weekly-report" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <WeeklyReport />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/log" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <ProjectLog />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/meetings" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectRouteGuard>
                      <Meetings />
                    </ProjectRouteGuard>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <Layout>
                    <Team />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/timeline" element={
                <ProtectedRoute>
                  <Layout>
                    <Timeline />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile-edit" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfileEdit />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarStateProvider>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
          </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
