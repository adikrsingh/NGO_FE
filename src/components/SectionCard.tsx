import { ReactNode } from "react";
import { JSX } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const SectionCard = ({
  title,
  subtitle,
  children,
}: SectionCardProps): JSX.Element => {
  return (
    <div className="section-card">
      <h3>{title}</h3>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <div>{children}</div>
    </div>
  );
};

export default SectionCard;
