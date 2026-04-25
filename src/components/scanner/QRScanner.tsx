"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }: { 
  onScanSuccess: (decodedText: string) => void
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const successCallbackRef = useRef(onScanSuccess);

  useEffect(() => {
    successCallbackRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const config = { 
      fps: 15, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    let isLocked = false;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            if (isLocked) return;
            let code = decodedText;
            if (decodedText.includes('/tickets/')) {
              code = decodedText.split('/tickets/').pop() || decodedText;
            }
            if (code && code.length > 5) {
              isLocked = true;
              successCallbackRef.current(code);
            }
          },
          undefined
        );

        // CAPTURE THE STREAM MANUALLY
        const video = document.querySelector('#qr-reader video') as HTMLVideoElement;
        if (video && video.srcObject) {
          (window as any).activeGuraStream = video.srcObject;
        }
      } catch (err) {
        console.error("Scanner start error:", err);
      }
    };

    startScanner();

    return () => {
      const killCamera = async () => {
        try {
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
          }
          html5QrCode.clear();
        } catch (e) {}

        // THE NUCLEAR OPTION: Kill the captured global stream
        const globalStream = (window as any).activeGuraStream as MediaStream;
        if (globalStream) {
          globalStream.getTracks().forEach(track => {
            track.stop();
            console.log("Track stopped manually:", track.label);
          });
          (window as any).activeGuraStream = null;
        }

        // Final sweep for any video element
        document.querySelectorAll('video').forEach(v => {
          if (v.srcObject) {
            (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            v.srcObject = null;
          }
          v.remove();
        });
      };
      killCamera();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* Cadre de visée stylisé */}
      <div className="absolute inset-0 z-10 pointer-events-none border-2 border-yellow-500/20 rounded-[2.5rem]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-yellow-500 rounded-3xl opacity-40 animate-pulse" />
      </div>
      
      <div className="overflow-hidden rounded-[2.5rem] bg-black aspect-square border border-white/5 shadow-2xl">
        <div id="qr-reader" className="w-full h-full object-cover" />
      </div>

      <style jsx global>{`
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
      `}</style>
    </div>
  );
}
