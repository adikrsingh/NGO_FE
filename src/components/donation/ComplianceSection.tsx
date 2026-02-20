import { useEffect, useState } from "react";
import Card from "../common/Card";

interface ComplianceSectionProps {
  onComplianceChange?: (data: {
    is80G: boolean;
    deliveryMethod: string;
  }) => void;
}

const ComplianceSection = ({ onComplianceChange }: ComplianceSectionProps) => {
  const [is80G, setIs80G] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState("EMAIL");

  // Inform parent whenever compliance changes
 useEffect(() => {
    onComplianceChange?.({
      is80G,
      deliveryMethod,
    });
  }, [is80G, deliveryMethod]);


  return (
    <Card
      title="Compliance & Certification"
      subtitle="Manage tax exemption certificates and supporting documents"
    >
      {/* 80G Toggle */}
      <div className="toggle-row">
        <div>
          <p className="label">80G Certificate Applicable</p>
          <p className="helper-text">
            Issue an 80G tax exemption certificate for this donation
          </p>
        </div>

        {/* <label className="switch">
          <input
            type="checkbox"
            checked={is80G}
            onChange={() => setIs80G(!is80G)}
          />
          <span className="slider" />
        </label> */}
      </div>

      {/* Certificate Status -  we do not need this as of now, we can show this in the donation details page when we have that ready */}
      {/* <div className="status-row">
        <span className="label">Certificate Status:</span>
        <span className={`status-pill ${is80G ? "pending" : "na"}`}>
          {is80G ? "Applicable" : "Not Applicable"}
        </span>
      </div> */}

      {/* Delivery Method (ONLY when 80G ON) */}
      {is80G && (
        <div className="delivery-box">
          <p className="label">Certificate Delivery Method</p>

          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="delivery"
                value="EMAIL"
                checked={deliveryMethod === "EMAIL"}
                onChange={() => setDeliveryMethod("EMAIL")}
              />
              Email
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="delivery"
                value="PHYSICAL"
                checked={deliveryMethod === "PHYSICAL"}
                onChange={() => setDeliveryMethod("PHYSICAL")}
              />
              Physical Copy
            </label>

            
            <label className="radio-option">
              <input
                type="radio"
                name="delivery"
                value="BOTH"
                checked={deliveryMethod === "BOTH"}
                onChange={() => setDeliveryMethod("BOTH")}
              />
              Both
            </label>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ComplianceSection;
