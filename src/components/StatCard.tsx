import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBg?: string;
  footer?: string;
  trend?: string;
  to?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  footer,
  trend,
  to,
}: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="stat-card clickable"
      onClick={() => to && navigate(to)}
    >
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {icon && (
          <span className={`stat-icon ${iconBg || ""}`}>
          {icon}
          </span>
        )}

      </div>

      <div className="stat-value">{value}</div>

      {subtitle && <div className="stat-subtitle">{subtitle}</div>}

      {trend && <div className="stat-trend">{trend}</div>}

      {footer && <div className="stat-footer">{footer}</div>}
    </div>
  );
}
