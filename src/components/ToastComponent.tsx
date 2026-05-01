import React, { forwardRef, useImperativeHandle, useState } from "react";

export interface ToastHandle {
  show: () => void;
  hide: () => void;
}

interface ToastComponentProps {
  id?: string;
  title?: string;
  content?: string;
}

export const ToastComponent = forwardRef<ToastHandle, ToastComponentProps>(({ id, title, content }, ref) => {
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }));

  if (!visible) {
    return <div id={id} />;
  }

  return (
    <div id={id} role="alert" aria-live="assertive" style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1000, background: "#fff3cd", border: "1px solid #ffeeba", padding: "12px 16px", borderRadius: 4 }}>
      {title && <strong>{title}</strong>}
      {content && <div>{content}</div>}
    </div>
  );
});

ToastComponent.displayName = "ToastComponent";
