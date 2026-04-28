import React, { ReactNode, forwardRef, useEffect, useImperativeHandle, useState } from "react";

type DialogButtonModel = {
  content: string;
  isPrimary?: boolean;
  cssClass?: string;
};

type DialogButton = {
  click?: () => void;
  buttonModel: DialogButtonModel;
};

export interface DialogHandle {
  show: (isFullScreen?: boolean) => void;
  hide: () => void;
}

interface DialogComponentProps {
  id?: string;
  visible?: boolean;
  header?: string;
  children?: ReactNode;
  isModal?: boolean;
  target?: string;
  animationSettings?: { effect?: string };
  close?: () => void;
  closeOnEscape?: boolean;
  showCloseIcon?: boolean;
  cssClass?: string;
  buttons?: DialogButton[];
}

export const DialogComponent = forwardRef<DialogHandle, DialogComponentProps>(({ id, visible = false, header, children, close, closeOnEscape = true, showCloseIcon = true, cssClass, buttons = [] }, ref) => {
  const [isOpen, setIsOpen] = useState(visible);

  useEffect(() => {
    setIsOpen(visible);
  }, [visible]);

  const handleClose = () => {
    setIsOpen(false);
    close?.();
  };

  useImperativeHandle(ref, () => ({
    show: () => setIsOpen(true),
    hide: handleClose,
  }));

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeOnEscape]);

  if (!isOpen) {
    return null;
  }

  const containerClassName = [cssClass].filter(Boolean).join(" ");

  return (
    <div id={id} className={containerClassName} role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="summit-dialog-surface">
        <div className="summit-dialog-header">
          <h3 className="summit-dialog-title">{header}</h3>
          {showCloseIcon && (
            <button type="button" className="summit-button summit-button-secondary" data-dialog-close="true" onClick={handleClose}>
              ×
            </button>
          )}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
        {buttons.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            {buttons.map((button, index) => (
              <button key={`${button.buttonModel.content}-${index}`} type="button" className={button.buttonModel.cssClass} onClick={button.click}>
                {button.buttonModel.content}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

DialogComponent.displayName = "DialogComponent";

interface DialogConfirmOptions {
  title?: string;
  content?: string;
  width?: string;
  okButton?: { click?: () => void };
  cancelButton?: { click?: () => void };
}

export const DialogUtility = {
  confirm: (options: DialogConfirmOptions) => {
    const dialogObj = {
      hide: () => undefined,
    };

    window.setTimeout(() => {
      const answer = window.confirm(options.content ?? options.title ?? "Are you sure?");
      if (answer) {
        options.okButton?.click?.();
      } else {
        options.cancelButton?.click?.();
      }
    }, 0);

    return dialogObj;
  },
};
