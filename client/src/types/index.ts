import { type AutomationStep, type AutomationHistory, type Settings } from "@shared/schema";

export type ScanResultType = {
  url: string;
  timestamp: number;
};

export type BrowserInstanceType = {
  id: number;
  value: string;
  status: "loading" | "ready" | "error";
  screenshot?: string;
};

export type AutomationStatusType = {
  status: "idle" | "running" | "completed" | "error";
  steps: AutomationStep[];
  startTime?: number;
  endTime?: number;
};

export type TabType = "scan" | "settings" | "history";

export type SettingsFormProps = {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onReset: () => void;
};

export type HistoryListProps = {
  history: AutomationHistory[];
  onClear: () => void;
  onRepeat: (item: AutomationHistory) => void;
};

export type QRScannerProps = {
  onScan: (result: string) => void;
  scannerStatus: "ready" | "scanning" | "detected";
};

export type ScanResultProps = {
  result: ScanResultType | null;
  onStartAutomation: () => void;
  value1: string;
  value2: string;
};

export type AutomationStatusProps = {
  automation: AutomationStatusType;
  onCancel: () => void;
};

export type BrowserPreviewProps = {
  instances: BrowserInstanceType[];
};
