import React from "react";
import { useToast } from "./use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/Toast.jsx";

export default function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          className="bg-background text-foreground border border-border shadow-lg rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out"
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" />
    </ToastProvider>
  );
}

// import React from "react";
// // import { useToast } from "@/hooks/use-toast";
// import { useToast } from "./use-toast";
// import {
//   Toast,
//   ToastClose,
//   ToastDescription,
//   ToastProvider,
//   ToastTitle,
//   ToastViewport,
// } from "@/components/ui/Toast.jsx";

// export default function Toaster() {
//   const { toasts } = useToast();

//   return (
//     <ToastProvider>
//       {toasts.map(({ id, title, description, action, ...props }) => (
//         <Toast key={id} {...props}>
//           <div className="grid gap-1">
//             {title && <ToastTitle>{title}</ToastTitle>}
//             {description && <ToastDescription>{description}</ToastDescription>}
//           </div>
//           {action}
//           <ToastClose />
//         </Toast>
//       ))}
//       <ToastViewport />
//     </ToastProvider>
//   );
// }

// import React from "react";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Toast,
//   ToastClose,
//   ToastDescription,
//   ToastProvider,
//   ToastTitle,
//   ToastViewport,
// } from "@/components/ui/toast";

// export default function Toaster() {
//   const { toasts } = useToast();

//   return (
//     <ToastProvider>
//       {toasts.map(({ id, title, description, action, ...props }) => (
//         <Toast key={id} {...props}>
//           <div className="grid gap-1">
//             {title && <ToastTitle>{title}</ToastTitle>}
//             {description && (
//               <ToastDescription>{description}</ToastDescription>
//             )}
//           </div>
//           {action}
//           <ToastClose />
//         </Toast>
//       ))}
//       <ToastViewport />
//     </ToastProvider>
//   );
// }
