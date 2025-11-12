// src/hooks/useOfflineSync.js
import React from "react";
import { offlineStorage } from "@/lib/offlineStorage";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api"; // ✅ your Node backend helper

export function useOfflineSync() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { toast } = useToast();

  React.useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Syncing pending transactions...",
      });

      try {
        const pendingSales = await offlineStorage.getPendingSales();

        for (const pending of pendingSales) {
          // ✅ send to your Node backend API instead of Supabase
          const response = await apiPost("/api/sales/offline-sync", pending.data);

          if (!response.error) {
            await offlineStorage.removePendingSale(pending.id);
          } else {
            console.error("Sync error for sale:", response.error);
          }
        }

        if (pendingSales.length > 0) {
          toast({
            title: "Sync complete",
            description: `${pendingSales.length} transaction(s) synced successfully.`,
          });
        }
      } catch (error) {
        console.error("Sync error:", error);
        toast({
          title: "Sync error",
          description: "Failed to sync some transactions. Will retry later.",
          variant: "destructive",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline mode",
        description: "You're offline. Transactions will be saved locally.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // ✅ Register service worker for PWA + offline caching
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch((error) => console.error("Service Worker registration failed:", error));
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  return { isOnline };
}

// import React from "react";
// import { offlineStorage } from "@/lib/offlineStorage";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";

// export function useOfflineSync() {
//   const [isOnline, setIsOnline] = React.useState(navigator.onLine);
//   const { toast } = useToast();

//   React.useEffect(() => {
//     const handleOnline = async () => {
//       setIsOnline(true);
//       toast({
//         title: "Back online",
//         description: "Syncing pending transactions...",
//       });

//       try {
//         const pendingSales = await offlineStorage.getPendingSales();
        
//         for (const pending of pendingSales) {
//           const { error } = await supabase
//             .from("sales")
//             .insert(pending.data);

//           if (!error) {
//             await offlineStorage.removePendingSale(pending.id);
//           }
//         }

//         if (pendingSales.length > 0) {
//           toast({
//             title: "Sync complete",
//             description: `${pendingSales.length} transaction(s) synced successfully.`,
//           });
//         }
//       } catch (error) {
//         console.error("Sync error:", error);
//         toast({
//           title: "Sync error",
//           description: "Failed to sync some transactions. Will retry later.",
//           variant: "destructive",
//         });
//       }
//     };

//     const handleOffline = () => {
//       setIsOnline(false);
//       toast({
//         title: "Offline mode",
//         description: "You're offline. Transactions will be saved locally.",
//         variant: "destructive",
//       });
//     };

//     window.addEventListener("online", handleOnline);
//     window.addEventListener("offline", handleOffline);

//     // Register service worker
//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker.register('/sw.js')
//         .then(() => console.log('Service Worker registered'))
//         .catch((error) => console.error('Service Worker registration failed:', error));
//     }

//     return () => {
//       window.removeEventListener("online", handleOnline);
//       window.removeEventListener("offline", handleOffline);
//     };
//   }, [toast]);

//   return { isOnline };
// }
