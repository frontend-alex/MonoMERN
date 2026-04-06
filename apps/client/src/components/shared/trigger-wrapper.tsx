import React, { useState, useCallback } from "react";

type TriggerProps = {
  onClick?: React.MouseEventHandler;
};

type TriggerWrapperProps = {
  customTrigger?: React.ReactElement<TriggerProps>;
  defaultTrigger: React.ReactElement<TriggerProps>;
  children: (control: { open: boolean; setOpen: (value: boolean) => void }) => React.ReactNode;
};

const TriggerWrapperComponent: React.FC<TriggerWrapperProps> = ({
  customTrigger,
  defaultTrigger,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      customTrigger?.props.onClick?.(e);
      setOpen(true);
    },
    [customTrigger]
  );

  const triggerElement = React.cloneElement(customTrigger ?? defaultTrigger, {
    onClick: handleTriggerClick,
  });

  return (
    <>
      {triggerElement}
      {children({ open, setOpen })}
    </>
  );
};

export const TriggerWrapper = React.memo(TriggerWrapperComponent);