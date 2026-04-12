import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { LandingPage } from './pages/LandingPage.js';
import { fetchSnapshot, type SnapshotView } from './lib/snapshot.js';

// Dashboard pages are only needed on /app routes — lazy-load so landing page
// visitors don't download Recharts, chart components, etc.
const InsightsPage = lazy(() => import('./pages/InsightsPage.js').then(m => ({ default: m.InsightsPage })));
const OverviewPage = lazy(() => import('./pages/OverviewPage.js').then(m => ({ default: m.OverviewPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.js').then(m => ({ default: m.ProjectsPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage.js').then(m => ({ default: m.ToolsPage })));
const SessionsPage = lazy(() => import('./pages/SessionsPage.js').then(m => ({ default: m.SessionsPage })));

export function App(): JSX.Element {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  // Only fetch the snapshot when the user is actually on the dashboard.
  // The marketing landing page doesn't need live data and works offline.
  const [snapshot, setSnapshot] = useState<SnapshotView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(forceRefresh = false): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSnapshot(forceRefresh);
      setSnapshot(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAppRoute && !snapshot) {
      void load(false);
    }
  }, [isAppRoute, snapshot]);

  // The marketing landing page renders WITHOUT the dashboard Layout chrome.
  // It's a full-width page with its own header/footer.
  if (!isAppRoute) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Unknown public routes fall back to the landing page too. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Layout
      snapshot={snapshot}
      loading={loading}
      error={error}
      onRefresh={() => void load(true)}
    >
      {snapshot ? (
        <Suspense fallback={null}>
          <Routes>
            {/* /app is the dashboard root — redirects to the Insights view per the positioning rule. */}
            <Route path="/app" element={<Navigate to="/app/insights" replace />} />
            <Route path="/app/insights" element={<InsightsPage snapshot={snapshot} />} />
            <Route path="/app/overview" element={<OverviewPage snapshot={snapshot} />} />
            <Route path="/app/projects" element={<ProjectsPage snapshot={snapshot} />} />
            <Route path="/app/tools" element={<ToolsPage snapshot={snapshot} />} />
            <Route path="/app/sessions" element={<SessionsPage snapshot={snapshot} />} />
            <Route path="/app/*" element={<Navigate to="/app/insights" replace />} />
          </Routes>
        </Suspense>
      ) : null}
    </Layout>
  );
}
