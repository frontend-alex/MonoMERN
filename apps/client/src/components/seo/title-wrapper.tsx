import { useEffect } from "react";

interface TitleWrapperProps {
  title: string;
  children: React.ReactNode;
}

const TitleWrapper = ({ title, children }: TitleWrapperProps) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <>{children}</>;
};

export { TitleWrapper };
