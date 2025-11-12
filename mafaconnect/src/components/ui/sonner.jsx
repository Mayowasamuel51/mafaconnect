import *"react";
import { Toaster"sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames
          toast,
          description,
          actionButton,
          cancelButton,
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
