import { AutomationStatusProps } from "../types";
import { CheckCircle2, XCircle, StopCircle } from "lucide-react";

export default function AutomationStatus({ automation, onCancel }: AutomationStatusProps) {
  if (automation.status === "idle" && automation.steps.length === 0) {
    return null;
  }

  // Format time in HH:MM:SS format
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "--:--";
    return timestamp;
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium text-slate-800 mb-3">Automation Status</h3>
      
      {/* Status steps */}
      <div className="space-y-3">
        {automation.steps.map((step) => (
          <div key={step.id} className="flex items-start mb-3">
            {/* Status indicator */}
            <div className="mt-0.5 mr-3 flex-shrink-0">
              {step.status === "pending" && (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              )}
              
              {step.status === "in-progress" && (
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              )}
              
              {step.status === "success" && (
                <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              
              {step.status === "error" && (
                <div className="w-5 h-5 rounded-full bg-error flex items-center justify-center">
                  <XCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Status text */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-800">{step.title}</span>
                <span className="text-xs text-slate-500 ml-2">{formatTime(step.time)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{step.description}</p>
              
              {step.errorMessage && (
                <div className="mt-1 text-xs text-error">
                  <span>{step.errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Overall status */}
      {automation.status === "running" && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-slate-800">Automation in progress...</span>
          </div>
          
          <button 
            className="text-sm text-error flex items-center"
            onClick={onCancel}
          >
            <StopCircle className="h-4 w-4 mr-1" />
            Cancel
          </button>
        </div>
      )}
      
      {automation.status === "completed" && (
        <div className="mt-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
          <span className="text-sm font-medium text-slate-800">Automation completed successfully</span>
        </div>
      )}
      
      {automation.status === "error" && (
        <div className="mt-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-error mr-2"></div>
          <span className="text-sm font-medium text-slate-800">Automation failed</span>
        </div>
      )}
    </div>
  );
}
