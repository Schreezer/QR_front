import { ScanResultProps } from "../types";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScanResult({ result, onStartAutomation, value1, value2 }: ScanResultProps) {
  const { toast } = useToast();

  const copyUrl = () => {
    if (result) {
      navigator.clipboard.writeText(result.url).then(() => {
        toast({
          title: "URL copied",
          description: "The URL has been copied to clipboard",
        });
      });
    }
  };

  return (
    <div className="mb-6 border rounded-lg p-4 bg-slate-50">
      <h3 className="font-medium text-slate-800 mb-2">Scan Result</h3>
      
      {!result ? (
        <div className="text-sm text-slate-500">
          Scan a QR code to view the URL and start automation
        </div>
      ) : (
        <div>
          <div className="mb-2">
            <span className="text-xs font-medium text-slate-500">Detected URL:</span>
            <div className="flex items-center mt-1">
              <span className="text-sm text-slate-800 truncate flex-1">{result.url}</span>
              <button 
                className="text-primary p-1"
                onClick={copyUrl}
                aria-label="Copy URL"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-xs text-slate-500">Instances:</span>
              <div className="flex items-center mt-1">
                <span className="flex items-center mr-4 text-sm">
                  <span className="w-4 h-4 inline-flex items-center justify-center bg-primary text-white rounded-full text-xs mr-1">1</span>
                  Value: {value1}
                </span>
                <span className="flex items-center text-sm">
                  <span className="w-4 h-4 inline-flex items-center justify-center bg-primary text-white rounded-full text-xs mr-1">2</span>
                  Value: {value2}
                </span>
              </div>
            </div>
            
            <Button 
              className="bg-primary text-white"
              onClick={onStartAutomation}
            >
              Start Automation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
