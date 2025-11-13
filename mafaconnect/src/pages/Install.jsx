import React, { useState, useEffect } from "react";
import { Smartphone, Download, ShoppingBag, TrendingUp, Award } from "lucide-react";

function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("install-banner-dismissed");
    if (dismissed) return;

    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setShowBanner(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-50">
      <div className="bg-white shadow-lg rounded-lg px-6 py-4 flex items-center gap-4 max-w-md w-full">
        <Smartphone className="h-6 w-6 text-primary" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Install MAFA Connect</h3>
          <p className="text-xs text-gray-500">
            Get faster access directly from your home screen.
          </p>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-primary text-white px-3 py-1 rounded-md text-xs"
        >
          Install
        </button>
        <button
          onClick={() => {
            localStorage.setItem("install-banner-dismissed", "true");
            setShowBanner(false);
          }}
          className="text-gray-400 text-xs"
        >
          ×
        </button>
      </div>
    </div>
  );
}
export default InstallPromptBanner;

