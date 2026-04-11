import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { InsightsPage } from './pages/InsightsPage.js';
import { OverviewPage } from './pages/OverviewPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { ToolsPage } from './pages/ToolsPage.js';
import { SessionsPage } from './pages/SessionsPage.js';
import { fetchSnapshot, type SnapshotView } from './lib/snapshot.js';

export function App(): JSX.Element {
  const [snapshot, setSnapshot] = useState<SnapshotView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    void load(false);
  }, []);

  return (
    <Layout
      snapshot={snapshot}
      loading={loading}
      error={error}
      onRefresh={() => void load(true)}
    >
      {snapshot ? (
        <Routes>
          {/* Per the design doc positioning rule, Insights is the default route. */}
          <Route path="/" element={<Navigate to="/insights" replace />} />
          <Route path="/insights" element={<InsightsPage snapshot={snapshot} />} />
          <Route path="/overview" element={<OverviewPage snapshot={snapshot} />} />
          <Route path="/projects" element={<ProjectsPage snapshot={snapshot} />} />
          <Route path="/tools" element={<ToolsPage snapshot={snapshot} />} />
          <Route path="/sessions" element={<SessionsPage snapshot={snapshot} />} />
          <Route path="*" element={<Navigate to="/insights" replace />} />
        </Routes>
      ) : null}
    </Layout>
  );
}
