import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import ProfileEdit from "./pages/ProfileEdit";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Organization from "./pages/Organization";
import Timeline from "./pages/Timeline";
import WBSManagement from "./pages/WBSManagement";
import ProjectCostManagement from "./pages/ProjectCostManagement";
import ProjectSummary from "./pages/ProjectSummary";
import AssetManagement from "./pages/AssetManagement";
import DailyReport from "./pages/DailyReport";
import WeeklyReport from "./pages/WeeklyReport";
import ProjectLog from "./pages/ProjectLog";
import Meetings from "./pages/Meetings";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 간주
      cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
      retry: 3, // 실패 시 3번 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
      refetchOnMount: true, // 컴포넌트 마운트 시 리페치
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
                    <WBSManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/cost" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectCostManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/summary" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectSummary />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/expense" element={
                <ProtectedRoute>
                  <Layout>
                    <AssetManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/daily-report" element={
                <ProtectedRoute>
                  <Layout>
                    <DailyReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/weekly-report" element={
                <ProtectedRoute>
                  <Layout>
                    <WeeklyReport />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/log" element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectLog />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects/meetings" element={
                <ProtectedRoute>
                  <Layout>
                    <Meetings />
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
              <Route path="/organization" element={
                <ProtectedRoute>
                  <Layout>
                    <Organization />
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
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
