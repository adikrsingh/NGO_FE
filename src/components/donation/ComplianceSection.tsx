import { useState } from "react";
import Card from "../common/Card";
import FormRow from "../common/FormRow";

const ComplianceSection = () => {
  const [is80G, setIs80G] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("EMAIL");

  return (
    <Card
      title="Compliance & Certification"
      subtitle="Manage tax exemption certificates and supporting documents"
    >
      {/* 80G Toggle */}
      <div className="toggle-row">
        <div>
          <p className="label">
            80G Certificate Applicable
          </p>
          <p className="helper-text">
            Issue an 80G tax exemption certificate for this donation
          </p>
        </div>

        <label className="switch">
          <input
            type="checkbox"
            checked={is80G}
            onChange={() => setIs80G(!is80G)}
          />
          <span className="slider" />
        </label>
      </div>

      {/* Certificate Status */}
      <div className="status-row">
        <span className="label">Certificate Status:</span>
        <span className={`status-pill ${is80G ? "pending" : "na"}`}>
          {is80G ? "Applicable" : "Not Applicable"}
        </span>
      </div>

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
          </div>
        </div>
      )}

      {/* Supporting Document */}
      {/* <div className="form-block full-width">
        <label>Upload Supporting Document</label>

        <label htmlFor="donation-proof" className="upload-box">
          <span className="upload-title">Click to upload </span>
          <span className="upload-subtitle">
             PDF (max 5MB)
          </span>
        </label>

        <input
          id="donation-proof"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
          onChange={(e) => console.log(e.target.files[0])}
      />
      </div> */}

    </Card>
  );
};

export default ComplianceSection;
