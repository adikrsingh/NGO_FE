import { ReactNode } from "react";
import "../../styles/card.css";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Card({ title, subtitle, children }: CardProps) {
  return (
    <div className="card">
      {title && <h3 className="section-title">{title}</h3>}
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}
