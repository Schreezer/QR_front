import { HistoryListProps } from "../types";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function HistoryList({ history, onClear, onRepeat }: HistoryListProps) {
  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const formatDuration = (durationMs: number) => {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${Math.round(durationMs / 1000)} seconds`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.round((durationMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-slate-800">Automation History</h2>
        <button 
          className="text-sm text-slate-600 flex items-center"
          onClick={onClear}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear History
        </button>
      </div>
      
      {history.length === 0 ? (
        <div className="text-center py-8">
          <RefreshCw className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600 mb-1">No automation history</p>
          <p className="text-sm text-slate-500">History will appear here after you run automations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-800 truncate max-w-xs">
                      {item.url}
                    </span>
                    <span className={`ml-2 text-xs ${
                      item.status === "success" ? "bg-success" : 
                      item.status === "cancelled" ? "bg-amber-500" : 
                      "bg-error"
                    } text-white px-1.5 rounded`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-slate-500">
                    <span>{formatDate(item.date)}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDuration(item.duration)}</span>
                  </div>
                </div>
                <button 
                  className="text-primary p-1"
                  onClick={() => onRepeat(item)}
                  aria-label="Repeat automation"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              
              {item.errorMessage && (
                <p className="text-xs text-error mb-1 mt-2">{item.errorMessage}</p>
              )}
              
              <div className="mt-2 text-xs text-slate-600">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    <span className="w-3 h-3 inline-flex items-center justify-center bg-primary text-white rounded-full text-[10px] mr-1">1</span>
                    Value: {item.value1}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 inline-flex items-center justify-center bg-primary text-white rounded-full text-[10px] mr-1">2</span>
                    Value: {item.value2}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
