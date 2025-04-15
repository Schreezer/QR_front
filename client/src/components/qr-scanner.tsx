import { useState, useRef, useEffect, useCallback } from "react";
import { QRScannerProps } from "../types";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsQR from "jsqr"; // Import jsQR

export default function QRScanner({ onScan, scannerStatus }: QRScannerProps) {
  const { toast } = useToast();
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Canvas for processing frames
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    stopCameraStream();
    setCameraActive(false);
  }, [stopCameraStream]);

  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) {
      return; 
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true }); // Important for performance

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas size to video intrinsic size
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      // Draw video frame onto canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Try decoding QR code using jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert", // Standard QR codes are dark on light
      });

      if (code) {
        console.log("jsQR Scan successful:", code.data);
        stopScanner();
        onScan(code.data);
        return; // Exit loop on success
      }
    }

    // Continue loop if no code found and camera is still active
    if (cameraActive) {
      animationFrameId.current = requestAnimationFrame(scanLoop);
    }
  }, [cameraActive, onScan, stopScanner]);

  const startScanner = useCallback(async () => {
    if (!videoRef.current) {
      console.error("Video element ref not available");
      return;
    }
    if (cameraActive) {
      console.log("Scanner already active");
      return;
    }

    try {
      // Get the media stream using facingMode constraint for rear camera
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' }, 
        } 
      });

      videoRef.current.srcObject = streamRef.current;
      videoRef.current.setAttribute('playsinline', 'true'); 
      videoRef.current.muted = true; 

      // Wait for video to start playing to ensure dimensions are available
      videoRef.current.onloadedmetadata = () => {
         videoRef.current?.play().then(() => {
            setCameraActive(true);
            // Start the scanning loop only after video is playing
            animationFrameId.current = requestAnimationFrame(scanLoop);
         }).catch(playError => {
            console.error("Error playing video:", playError);
            stopCameraStream();
            toast({ title: "Camera Error", description: "Could not play video stream.", variant: "destructive" });
         });
      };
      videoRef.current.onerror = (e) => {
         console.error("Video error:", e);
         stopCameraStream();
         toast({ title: "Camera Error", description: "Video stream error.", variant: "destructive" });
      };


    } catch (error: any) {
      console.error("Error starting QR scanner:", error);
      stopCameraStream();
      setCameraActive(false);
      let description = "Could not access the camera. Please check permissions.";
      // ... (keep existing error handling descriptions) ...
       if (error?.name === 'NotAllowedError' || error?.message?.includes('Permission denied')) {
        description = "Camera permission denied. Please grant permission in your browser settings.";
      } else if (error?.message?.includes('No suitable camera found')) {
        description = "No camera found on this device.";
      } else if (error?.name === 'NotFoundError') {
         description = "Camera not found or disconnected.";
      } else if (error?.name === 'NotReadableError') {
         description = "Camera is already in use by another application.";
      }
      toast({
        title: "Camera Error",
        description: description,
        variant: "destructive",
      });
    }
  }, [scanLoop, stopCameraStream, toast, cameraActive]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const handleUploadQRCode = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        // Draw image onto canvas
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // Decode using jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
           inversionAttempts: "dontInvert",
        });

        if (code) {
          console.log("jsQR File Scan successful:", code.data);
          onScan(code.data);
        } else {
          console.error("jsQR could not decode file");
          toast({
            title: "Scanning Error",
            description: "Could not detect a QR code in the uploaded image.",
            variant: "destructive",
          });
        }
      };
      img.onerror = () => {
         console.error("Error loading image file");
         toast({ title: "File Error", description: "Could not load image file.", variant: "destructive" });
      };
      if (e.target?.result) {
         img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
       console.error("Error reading file");
       toast({ title: "File Error", description: "Could not read file.", variant: "destructive" });
    };
    reader.readAsDataURL(file);

    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="mb-6">
      {/* ... (Status header remains the same) ... */}
       <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-slate-800">QR Code Scanner</h2>
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          scannerStatus === "scanning" && cameraActive // Show scanning only when active
            ? "bg-primary text-white"
            : scannerStatus === "detected"
              ? "bg-green-500 text-white"
              : "bg-slate-100 text-slate-700"
        }`}>
          {scannerStatus === "scanning" && cameraActive ? "Scanning..." : scannerStatus === "detected" ? "QR Detected" : "Ready"}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-slate-900 aspect-video mb-3">
        {/* Video element remains visible but drawing happens on hidden canvas */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
        />
        {/* Hidden canvas for jsQR processing */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* ... (Enable Camera button remains the same) ... */}
             <div className="text-center px-4">
              <Camera className="h-12 w-12 mx-auto mb-2 text-slate-600" />
              <p className="text-slate-400 mb-3">Camera access required</p>
              <Button
                onClick={startScanner}
                className="bg-primary text-white"
                disabled={cameraActive} // Disable button if already trying/active
              >
                Enable Camera
              </Button>
            </div>
          </div>
        )}

        {cameraActive && (
          <div className="absolute inset-0">
            {/* ... (Scanning overlay remains the same) ... */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="border-2 border-primary w-48 h-48 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary opacity-75 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        {/* ... (Upload/Flash buttons remain the same, Flash disabled) ... */}
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
          className={`text-sm flex items-center text-slate-400 cursor-not-allowed`}
          disabled={true}
          title="Flash control not available with this scanner"
        >
          <Zap className={`h-4 w-4 mr-1`} />
          Toggle Flash
        </button>
      </div>
    </div>
  );
}
