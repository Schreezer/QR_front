import { useState, useRef } from "react";
import { QRScannerProps } from "../types";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// We're using the react-qr-reader library for QR code scanning
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScan, scannerStatus }: QRScannerProps) {
  const { toast } = useToast();
  const [cameraActive, setCameraActive] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  const startScanner = async () => {
    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      await qrScannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          stopScanner();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Errors during scanning that are not fatal
          console.log(errorMessage);
        }
      );

      setCameraActive(true);
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      qrScannerRef.current
        .stop()
        .then(() => {
          setCameraActive(false);
        })
        .catch((error) => {
          console.error("Error stopping QR scanner:", error);
        });
    }
  };

  const handleUploadQRCode = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      const decodedText = await qrScannerRef.current.scanFile(file, true);
      onScan(decodedText);
    } catch (error) {
      console.error("Error scanning file:", error);
      toast({
        title: "Scanning Error",
        description: "Could not detect a QR code in the uploaded image. Try a clearer or higher contrast image.",
        variant: "destructive",
      });
    }
    
    // Reset file input value
    if (event.target) {
      event.target.value = '';
    }
  };

  const toggleFlash = async () => {
    if (!qrScannerRef.current || !qrScannerRef.current.isScanning) return;

    try {
      await qrScannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !flashActive } as any],
      });
      setFlashActive(!flashActive);
    } catch (error) {
      console.error("Error toggling flash:", error);
      toast({
        title: "Flash Error",
        description: "Could not toggle flash. Your device may not support this feature.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-slate-800">QR Code Scanner</h2>
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          scannerStatus === "scanning" 
            ? "bg-primary text-white" 
            : scannerStatus === "detected" 
              ? "bg-green-500 text-white" 
              : "bg-slate-100 text-slate-700"
        }`}>
          {scannerStatus === "scanning" ? "Scanning..." : scannerStatus === "detected" ? "QR Detected" : "Ready"}
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-lg bg-slate-900 aspect-video mb-3">
        {/* Camera viewport container */}
        <div id={scannerContainerId} className="absolute inset-0 flex items-center justify-center">
          {!cameraActive ? (
            <div className="text-center px-4">
              <Camera className="h-12 w-12 mx-auto mb-2 text-slate-600" />
              <p className="text-slate-400 mb-3">Camera access required</p>
              <Button 
                onClick={startScanner}
                className="bg-primary text-white"
              >
                Enable Camera
              </Button>
            </div>
          ) : (
            <div className="absolute inset-0">
              {/* QR scanning target overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="border-2 border-primary w-48 h-48 relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                </div>
                {/* Scanning animation */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary opacity-75 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          className="text-sm text-slate-600 flex items-center"
          onClick={handleUploadQRCode}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload QR Image
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </button>
        
        <button 
          className={`text-sm flex items-center ${cameraActive ? "text-slate-600" : "text-slate-400 cursor-not-allowed"}`}
          onClick={toggleFlash}
          disabled={!cameraActive}
        >
          <Zap className={`h-4 w-4 mr-1 ${flashActive ? "text-yellow-500" : ""}`} />
          Toggle Flash
        </button>
      </div>
    </div>
  );
}
