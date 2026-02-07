import "../../styles/buttons.css";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
