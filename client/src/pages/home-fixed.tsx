import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import QRScanner from "@/components/qr-scanner";
import ScanResult from "@/components/scan-result";
import AutomationStatus from "@/components/automation-status";
import BrowserPreview from "@/components/browser-preview";
import SettingsForm from "@/components/settings-form";
import HistoryList from "@/components/history-list";
import { useTab } from "@/lib/tab-context";
import { type ScanResultType, type BrowserInstanceType, type AutomationStatusType } from "../types";
import { type AutomationHistory, type Settings, type AutomationStep } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { activeTab, setActiveTab } = useTab();
  const [scanResult, setScanResult] = useState<ScanResultType | null>(null);
  const [scannerStatus, setScannerStatus] = useState<"ready" | "scanning" | "detected">("ready");
  const [browserInstances, setBrowserInstances] = useState<BrowserInstanceType[]>([]);
  const [automation, setAutomation] = useState<AutomationStatusType>({
    status: "idle",
    steps: [],
  });

  // Define default settings
  const defaultSettings: Settings = {
    id: 1,
    value1: "14",
    value2: "15",
    headless: true,
    showNotifications: true,
    browserType: "chrome",
    timeout: 30,
    formFieldSelector: "input[type='text']",
    submitButtonSelector: "button[type='submit'], input[type='submit']",
    autoRetry: true,
  };

  // Fetch settings
  const { data: settings = defaultSettings, isLoading: isLoadingSettings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Fetch history
  const { data: history = [], isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery<AutomationHistory[]>({
    queryKey: ["/api/automation/history"],
  });

  // Start automation mutation
  const startAutomationMutation = useMutation({
    mutationFn: (url: string) => 
      apiRequest("POST", "/api/automation/start", { 
        url, 
        value1: settings.value1, 
        value2: settings.value2
      }),
    onSuccess: async () => {
      toast({
        title: "Automation started",
        description: "The form filling automation has started",
      });
      
      // Start polling for status updates
      queryClient.invalidateQueries({ queryKey: ["/api/automation/status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error starting automation",
        description: error.message,
        variant: "destructive",
      });
      setAutomation(prev => ({
        ...prev,
        status: "error",
      }));
    },
  });

  // Cancel automation mutation
  const cancelAutomationMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/automation/cancel"),
    onSuccess: async () => {
      toast({
        title: "Automation cancelled",
        description: "The form filling automation has been cancelled",
      });
      setAutomation(prev => ({
        ...prev,
        status: "idle",
      }));
      setBrowserInstances([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling automation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: Settings) => apiRequest("POST", "/api/settings", newSettings),
    onSuccess: async () => {
      toast({
        title: "Settings saved",
        description: "Your automation settings have been saved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/settings/reset"),
    onSuccess: async () => {
      toast({
        title: "Settings reset",
        description: "Your automation settings have been reset to defaults",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error resetting settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/automation/history"),
    onSuccess: async () => {
      toast({
        title: "History cleared",
        description: "Your automation history has been cleared",
      });
      refetchHistory();
    },
    onError: (error: Error) => {
      toast({
        title: "Error clearing history",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check automation status with polling when automation is running
  const { data: statusData } = useQuery<{
    status: string;
    steps: AutomationStep[];
    startTime?: number;
    endTime?: number;
    instances?: BrowserInstanceType[];
  }>({
    queryKey: ["/api/automation/status"],
    enabled: automation.status === "running",
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });

  // Handle status data updates
  useEffect(() => {
    if (statusData) {
      setAutomation({
        status: statusData.status as "idle" | "running" | "completed" | "error",
        steps: statusData.steps,
        startTime: statusData.startTime,
        endTime: statusData.endTime,
      });
      
      // Update browser instances screenshots if available
      if (statusData.instances) {
        setBrowserInstances(statusData.instances);
      }
      
      // If automation is complete, refetch history
      if (statusData.status === "completed" || statusData.status === "error") {
        refetchHistory();
      }
    }
  }, [statusData, refetchHistory]);

  const handleQRScan = (result: string) => {
    try {
      // Validate URL format
      const url = new URL(result);
      setScanResult({
        url: url.toString(),
        timestamp: Date.now(),
      });
      setScannerStatus("detected");
      
      toast({
        title: "QR Code detected",
        description: "URL successfully extracted from QR code",
      });
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code does not contain a valid URL",
        variant: "destructive",
      });
    }
  };

  const handleStartAutomation = () => {
    if (!scanResult) return;
    
    setAutomation({
      status: "running",
      steps: [
        {
          id: "scan",
          title: "Scan QR Code",
          description: "Successfully scanned QR code and extracted URL",
          status: "success",
          time: new Date().toLocaleTimeString(),
        },
        {
          id: "browsers",
          title: "Opening browsers",
          description: "Launching two browser instances with the extracted URL",
          status: "in-progress",
          time: new Date().toLocaleTimeString(),
        },
        {
          id: "fill",
          title: "Filling forms",
          description: `Finding text fields and entering values (${settings.value1} and ${settings.value2})`,
          status: "pending",
        },
        {
          id: "submit",
          title: "Submitting forms",
          description: "Clicking submit buttons on both forms",
          status: "pending",
        },
      ],
      startTime: Date.now(),
    });
    
    setBrowserInstances([
      { id: 1, value: settings.value1, status: "loading" },
      { id: 2, value: settings.value2, status: "loading" },
    ]);
    
    startAutomationMutation.mutate(scanResult.url);
  };

  const handleRepeatAutomation = (item: AutomationHistory) => {
    setScanResult({
      url: item.url,
      timestamp: Date.now(),
    });
    setActiveTab("scan");
    
    // Start automation with a slight delay to let the UI update
    setTimeout(() => {
      handleStartAutomation();
    }, 100);
  };

  // Copy URL to clipboard
  const copyUrl = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult.url).then(() => {
        toast({
          title: "URL copied",
          description: "The URL has been copied to clipboard",
        });
      });
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">QR Form Automation</h1>
          <p className="text-muted-foreground mt-1">Scan a QR code to open and fill forms automatically</p>
        </header>

        {/* Main Card */}
        <div className="bg-card rounded-xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button 
              className={`px-4 py-3 font-medium ${activeTab === "scan" ? "text-primary border-b-2 border-primary" : "text-foreground/60"}`}
              onClick={() => setActiveTab("scan")}
            >
              Scan
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === "settings" ? "text-primary border-b-2 border-primary" : "text-foreground/60"}`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
            <button 
              className={`px-4 py-3 font-medium ${activeTab === "history" ? "text-primary border-b-2 border-primary" : "text-foreground/60"}`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>

          {/* Scan Tab */}
          <div className={`p-5 ${activeTab !== "scan" ? "hidden" : ""}`}>
            <QRScanner onScan={handleQRScan} scannerStatus={scannerStatus} />
            
            <ScanResult 
              result={scanResult} 
              onStartAutomation={handleStartAutomation} 
              value1={settings.value1} 
              value2={settings.value2} 
            />
            
            <AutomationStatus 
              automation={automation}
              onCancel={() => cancelAutomationMutation.mutate()}
            />
            
            <BrowserPreview instances={browserInstances} />
          </div>

          {/* Settings Tab */}
          <div className={`p-5 ${activeTab !== "settings" ? "hidden" : ""}`}>
            {isLoadingSettings ? (
              <div className="flex justify-center p-4">Loading settings...</div>
            ) : (
              <SettingsForm 
                settings={settings} 
                onSave={(newSettings) => saveSettingsMutation.mutate(newSettings)}
                onReset={() => resetSettingsMutation.mutate()}
              />
            )}
          </div>

          {/* History Tab */}
          <div className={`p-5 ${activeTab !== "history" ? "hidden" : ""}`}>
            {isLoadingHistory ? (
              <div className="flex justify-center p-4">Loading history...</div>
            ) : (
              <HistoryList 
                history={history} 
                onClear={() => clearHistoryMutation.mutate()}
                onRepeat={handleRepeatAutomation}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-muted-foreground">
          <p>QR Form Automation Tool v1.0.0</p>
          <p className="mt-1">This tool requires camera permissions and browser automation privileges</p>
        </footer>
      </div>
    </div>
  );
}