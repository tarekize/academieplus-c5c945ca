import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
<<<<<<< HEAD
  const { toasts, dismiss } = useToast();
  const hasToasts = toasts.length > 0;

  return (
    <ToastProvider duration={3000}>
      {hasToasts && (
        <div
          className="fixed inset-0 z-[99] bg-black/35 cursor-pointer"
          onClick={() => dismiss()}
        />
      )}
=======
  const { toasts } = useToast();

  return (
    <ToastProvider>
>>>>>>> 99a68e82c947d629deda86372b240817a8f1591b
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
