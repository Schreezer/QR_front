import { useState } from "react";
import { SettingsFormProps } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsForm({ settings, onSave, onReset }: SettingsFormProps) {
  const [formValues, setFormValues] = useState(settings);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formValues);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-semibold text-slate-800 mb-4">Automation Settings</h2>
      
      <div className="space-y-5">
        {/* Form values */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Form Values</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value1" className="text-xs text-slate-600">Instance 1 Value</Label>
              <Input 
                id="value1"
                type="text"
                value={formValues.value1}
                onChange={(e) => handleChange("value1", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="value2" className="text-xs text-slate-600">Instance 2 Value</Label>
              <Input 
                id="value2"
                type="text"
                value={formValues.value2}
                onChange={(e) => handleChange("value2", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        {/* Browser settings */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Browser Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="headless" 
                checked={formValues.headless}
                onCheckedChange={(checked) => handleChange("headless", Boolean(checked))}
              />
              <Label htmlFor="headless" className="text-sm text-slate-700">Run in headless mode</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showNotifications" 
                checked={formValues.showNotifications}
                onCheckedChange={(checked) => handleChange("showNotifications", Boolean(checked))}
              />
              <Label htmlFor="showNotifications" className="text-sm text-slate-700">Show desktop notifications</Label>
            </div>
            
            <div>
              <Label htmlFor="browserType" className="text-xs text-slate-600">Browser Type</Label>
              <Select 
                value={formValues.browserType} 
                onValueChange={(value) => handleChange("browserType", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select browser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chrome">Chrome</SelectItem>
                  <SelectItem value="firefox">Firefox</SelectItem>
                  <SelectItem value="edge">Edge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timeout" className="text-xs text-slate-600">Timeout (seconds)</Label>
              <Input 
                id="timeout"
                type="number"
                min="5"
                max="120"
                value={formValues.timeout}
                onChange={(e) => handleChange("timeout", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        {/* Advanced settings */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-2">Advanced Settings</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="formFieldSelector" className="text-xs text-slate-600">Form Field Selector</Label>
              <Input 
                id="formFieldSelector"
                type="text"
                value={formValues.formFieldSelector}
                onChange={(e) => handleChange("formFieldSelector", e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="submitButtonSelector" className="text-xs text-slate-600">Submit Button Selector</Label>
              <Input 
                id="submitButtonSelector"
                type="text"
                value={formValues.submitButtonSelector}
                onChange={(e) => handleChange("submitButtonSelector", e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="autoRetry" 
                checked={formValues.autoRetry}
                onCheckedChange={(checked) => handleChange("autoRetry", Boolean(checked))}
              />
              <Label htmlFor="autoRetry" className="text-sm text-slate-700">Auto-retry on failure (3 attempts)</Label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button 
            type="button"
            variant="outline"
            onClick={onReset}
            className="mr-2"
          >
            Reset to Defaults
          </Button>
          <Button type="submit">
            Save Settings
          </Button>
        </div>
      </div>
    </form>
  );
}
