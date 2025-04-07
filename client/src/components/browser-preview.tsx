import { BrowserPreviewProps } from "../types";
import { Globe } from "lucide-react";

export default function BrowserPreview({ instances }: BrowserPreviewProps) {
  if (instances.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-medium text-slate-800 mb-3">Browser Previews</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instances.map((instance) => (
          <div key={instance.id} className="border rounded-lg overflow-hidden">
            <div className="bg-slate-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-slate-400 mr-1.5"></span>
                <span className="w-3 h-3 rounded-full bg-slate-400 mr-1.5"></span>
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
              </div>
              <div className="text-xs text-slate-600 truncate max-w-[180px]">Instance {instance.id} - Value: {instance.value}</div>
              <div className="w-4"></div>
            </div>
            
            <div className="h-48 bg-white p-2 flex items-center justify-center">
              {instance.screenshot ? (
                <img 
                  src={`data:image/png;base64,${instance.screenshot}`} 
                  alt={`Browser instance ${instance.id}`} 
                  className="max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Globe className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    {instance.status === "loading" ? "Loading browser..." : 
                     instance.status === "error" ? "Error loading browser" : 
                     "Browser ready"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
