// Burnd VSCode Extension
//
// Architecture:
//   - Status bar item: shows live cost from the most recent session
//   - Sidebar panel (TreeView): Cost Overview + Leaks & Insights
//   - Commands: open dashboard, run check, run fix, refresh
//   - Polls `burnd serve` at localhost:4711 (or configured port)
//
// The extension does NOT bundle the CLI — it connects to a running
// `burnd serve` instance. If the server isn't running, it prompts
// the user to start it.

import * as vscode from 'vscode';

interface SnapshotTotals {
  totalCostUsdAllTime: number;
  totalCostUsdLast7Days: number;
  totalCostUsdLast30Days: number;
  totalSessions: number;
  potentialSavingsUsd: number;
}

interface InsightItem {
  title: string;
  savingsEstimateUsd: number;
  effortMinutes: number;
  fixSteps: string[];
  projectDir: string;
  detectorId: string;
}

interface Snapshot {
  totals: SnapshotTotals;
  insights: InsightItem[];
  sessions: Array<{ totalCostUsd: number; startedAt?: string; projectDir: string }>;
  meta: { burndVersion: string; isPro: boolean };
}

let statusBarItem: vscode.StatusBarItem;
let refreshTimer: NodeJS.Timeout | undefined;
let lastSnapshot: Snapshot | null = null;

export function activate(context: vscode.ExtensionContext): void {
  // Status bar — shows today's spend.
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'burnd.showDashboard';
  statusBarItem.tooltip = 'Burnd: Click to open cost dashboard';
  statusBarItem.text = '$(flame) Burnd loading...';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Tree data providers for the sidebar.
  const overviewProvider = new BurndOverviewProvider();
  const insightsProvider = new BurndInsightsProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('burnd.overview', overviewProvider),
    vscode.window.registerTreeDataProvider('burnd.insights', insightsProvider),
  );

  // Commands.
  context.subscriptions.push(
    vscode.commands.registerCommand('burnd.showDashboard', () => {
      const port = getPort();
      vscode.env.openExternal(vscode.Uri.parse(`http://localhost:${port}`));
    }),

    vscode.commands.registerCommand('burnd.refresh', () => {
      void fetchAndUpdate(overviewProvider, insightsProvider, true);
    }),

    vscode.commands.registerCommand('burnd.runCheck', async () => {
      const terminal = vscode.window.createTerminal('Burnd Check');
      terminal.sendText('npx getburnd check');
      terminal.show();
    }),

    vscode.commands.registerCommand('burnd.runFix', async () => {
      const terminal = vscode.window.createTerminal('Burnd Fix');
      terminal.sendText('npx getburnd fix');
      terminal.show();
    }),
  );

  // Initial fetch + polling.
  void fetchAndUpdate(overviewProvider, insightsProvider, false);
  startPolling(overviewProvider, insightsProvider, context);
}

export function deactivate(): void {
  if (refreshTimer) clearInterval(refreshTimer);
}

function getPort(): number {
  return vscode.workspace.getConfiguration('burnd').get<number>('serverPort') ?? 4711;
}

function getAutoRefreshSeconds(): number {
  return vscode.workspace.getConfiguration('burnd').get<number>('autoRefreshSeconds') ?? 60;
}

function startPolling(
  overviewProvider: BurndOverviewProvider,
  insightsProvider: BurndInsightsProvider,
  context: vscode.ExtensionContext,
): void {
  if (refreshTimer) clearInterval(refreshTimer);
  const intervalMs = getAutoRefreshSeconds() * 1000;
  refreshTimer = setInterval(() => {
    void fetchAndUpdate(overviewProvider, insightsProvider, false);
  }, intervalMs);
  context.subscriptions.push({ dispose: () => clearInterval(refreshTimer) });
}

async function fetchAndUpdate(
  overviewProvider: BurndOverviewProvider,
  insightsProvider: BurndInsightsProvider,
  forceRefresh: boolean,
): Promise<void> {
  const port = getPort();
  const path = forceRefresh ? 'refresh' : 'snapshot';
  const url = `http://localhost:${port}/api/${path}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`${res.status}`);
    lastSnapshot = (await res.json()) as Snapshot;

    // Update status bar.
    const showStatusBar = vscode.workspace.getConfiguration('burnd').get<boolean>('showStatusBar') ?? true;
    if (showStatusBar) {
      const last7 = lastSnapshot.totals.totalCostUsdLast7Days;
      statusBarItem.text = `$(flame) $${last7.toFixed(2)}/wk`;
      statusBarItem.tooltip = `Burnd: $${last7.toFixed(2)} last 7 days · $${lastSnapshot.totals.totalCostUsdAllTime.toFixed(2)} all-time · Click to open dashboard`;
      if (lastSnapshot.totals.potentialSavingsUsd > last7 * 0.3) {
        // Highlight in orange if >30% of weekly spend is fixable waste.
        statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      } else {
        statusBarItem.color = undefined;
        statusBarItem.backgroundColor = undefined;
      }
    }

    overviewProvider.refresh(lastSnapshot);
    insightsProvider.refresh(lastSnapshot.insights);
  } catch {
    statusBarItem.text = '$(flame) Burnd offline';
    statusBarItem.tooltip = 'Burnd: Run `npx getburnd serve` to start the server, then click to refresh.';
    statusBarItem.command = 'burnd.showDashboard';
    overviewProvider.setOffline();
    insightsProvider.setOffline();
  }
}

// ── Tree Data Providers ──────────────────────────────────────────────────────

type BurndTreeItem =
  | { type: 'stat'; label: string; value: string; tone?: 'warning' | 'danger' | 'success' }
  | { type: 'section'; label: string }
  | { type: 'offline' };

class BurndOverviewProvider implements vscode.TreeDataProvider<BurndTreeItem> {
  private items: BurndTreeItem[] = [{ type: 'offline' }];
  private _onDidChangeTreeData = new vscode.EventEmitter<BurndTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(snapshot: Snapshot): void {
    const t = snapshot.totals;
    this.items = [
      { type: 'stat', label: 'All-time spend', value: `$${t.totalCostUsdAllTime.toFixed(2)}` },
      { type: 'stat', label: 'Last 7 days', value: `$${t.totalCostUsdLast7Days.toFixed(2)}` },
      { type: 'stat', label: 'Last 30 days', value: `$${t.totalCostUsdLast30Days.toFixed(2)}` },
      { type: 'stat', label: 'Sessions', value: `${t.totalSessions}` },
      { type: 'stat', label: 'Fixable waste', value: `$${t.potentialSavingsUsd.toFixed(2)}`, tone: 'warning' },
      { type: 'stat', label: 'Pro active', value: snapshot.meta.isPro ? 'Yes' : 'No', tone: snapshot.meta.isPro ? 'success' : undefined },
    ];
    this._onDidChangeTreeData.fire(undefined);
  }

  setOffline(): void {
    this.items = [{ type: 'offline' }];
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: BurndTreeItem): vscode.TreeItem {
    if (element.type === 'offline') {
      const item = new vscode.TreeItem('burnd serve not running');
      item.description = 'npx getburnd serve';
      item.iconPath = new vscode.ThemeIcon('warning');
      item.command = { command: 'burnd.showDashboard', title: 'Open Dashboard' };
      return item;
    }
    if (element.type === 'section') {
      return new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
    }
    const item = new vscode.TreeItem(element.label);
    item.description = element.value;
    item.iconPath = new vscode.ThemeIcon(
      element.tone === 'warning' ? 'warning' : element.tone === 'danger' ? 'error' : element.tone === 'success' ? 'check' : 'dashboard',
    );
    return item;
  }

  getChildren(): BurndTreeItem[] {
    return this.items;
  }
}

class BurndInsightsProvider implements vscode.TreeDataProvider<InsightItem | { type: 'empty' | 'offline'; label: string }> {
  private items: InsightItem[] = [];
  private offline = true;
  private _onDidChangeTreeData = new vscode.EventEmitter<InsightItem | { type: 'empty' | 'offline'; label: string } | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(insights: InsightItem[]): void {
    this.items = insights.slice(0, 10);
    this.offline = false;
    this._onDidChangeTreeData.fire(undefined);
  }

  setOffline(): void {
    this.offline = true;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: InsightItem | { type: 'empty' | 'offline'; label: string }): vscode.TreeItem {
    if ('type' in element) {
      const item = new vscode.TreeItem(element.label);
      item.iconPath = new vscode.ThemeIcon(element.type === 'offline' ? 'warning' : 'check');
      return item;
    }
    const item = new vscode.TreeItem(
      `${element.title}`,
      vscode.TreeItemCollapsibleState.None,
    );
    item.description = `save $${element.savingsEstimateUsd.toFixed(2)} · ~${element.effortMinutes}m fix`;
    item.tooltip = element.fixSteps[0] ?? element.title;
    item.iconPath = new vscode.ThemeIcon('flame');
    item.command = {
      command: 'burnd.showDashboard',
      title: 'Open Dashboard',
      arguments: [],
    };
    return item;
  }

  getChildren(): Array<InsightItem | { type: 'empty' | 'offline'; label: string }> {
    if (this.offline) return [{ type: 'offline', label: 'burnd serve not running' }];
    if (this.items.length === 0) return [{ type: 'empty', label: 'No leaks detected' }];
    return this.items;
  }
}
