import { useState } from "react";
import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/donor.css";
import SectionCard from "../../components/SectionCard";
import CategoryCard from "../../components/CategoryCard";
import { useDonars } from "./useDonar";

/** ===== Types ===== */
type DonorType = "INDIVIDUAL" | "CORPORATE";
type DonorCategory =
  | "GENERAL"
  | "VIP"
  | "HIGH_VALUE"
  | "REPEAT"
  | "CORPORATE";

/** ===== PAN Validation ===== */
const isValidPan = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return panRegex.test(pan);
};

const AddDonor = (): JSX.Element => {
  const navigate = useNavigate();

  const [donorType, setDonorType] = useState<DonorType>("INDIVIDUAL");
  const [category, setCategory] = useState<DonorCategory>("GENERAL");

  const [panError, setPanError] = useState("");
  const [panExists, setPanExists] = useState(false);
  const [checkingPan, setCheckingPan] = useState(false);

  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pan: "",
    assignedStaffId: 2,
    notes: "",
  });

  const { addDonor, isAddingDonor, getDonorByPan } = useDonars();

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, "");
    setForm((prev) => ({ ...prev, pan: value }));
    setPanError("");
    setPanExists(false);
  };

  const handlePanBlur = async () => {
    if (!form.pan) return;

    if (!isValidPan(form.pan)) {
      setPanError("Invalid PAN format. Example: ABCDE1234F");
      return;
    }

    setPanError("");
    setCheckingPan(true);

    try {
      const donor = await getDonorByPan(form.pan);
      if (donor?.id) {
        setPanExists(true);
      } else {
        setPanExists(false);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setPanExists(false);
      } else {
        console.error("PAN check failed", error);
      }
    } finally {
      setCheckingPan(false);
    }
  };

  /** ===== Form Validation ===== */
  const isFormValid = (): boolean => {
    if (!form.name.trim() || !form.pan.trim()) {
      setModalMessage("Please enter the required details.");
      setShowErrorModal(true);
      return false;
    }

    if (!isValidPan(form.pan)) {
      setModalMessage("Please enter a valid PAN (ABCDE1234F).");
      setShowErrorModal(true);
      return false;
    }

    if (panExists) {
      setModalMessage(
        "A donor with this PAN already exists in the system."
      );
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!isFormValid()) return;

    try {
      await addDonor({
        ...form,
        tag: category,
      });

      setSubmitSuccess(
        "Donor created successfully. Redirecting to donor list..."
      );

      setTimeout(() => {
        navigate("/donors");
      }, 2000);
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to create donor. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleModalOk = () => {
    setShowErrorModal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Add New Donor</h1>
          <p>Create a new donor profile for tracking and engagement</p>
        </div>

        <button
          className="back-to-donors-btn"
          onClick={() => navigate("/donors")}
        >
          <span className="back-icon">←</span>
          <span>Back to Donors</span>
        </button>
      </div>

      {/* Success / Error Banner */}
      {submitSuccess && (
        <div className="form-message success">{submitSuccess}</div>
      )}
      {submitError && (
        <div className="form-message error">{submitError}</div>
      )}

      {/* Donor Information */}
      <SectionCard title="Donor Information">
        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={donorType === "INDIVIDUAL"}
              onChange={() => setDonorType("INDIVIDUAL")}
            />
            Individual
          </label>

          <label>
            <input
              type="radio"
              checked={donorType === "CORPORATE"}
              onChange={() => setDonorType("CORPORATE")}
            />
            Corporate
          </label>
        </div>

        <div className="form-grid">
          <input
            name="name"
            placeholder="Full Name *"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Mobile Number *"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            name="address"
            placeholder="Street Address"
            value={form.address}
            onChange={handleChange}
          />
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
          />
          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
          />
        </div>
      </SectionCard>

      {/* PAN Information */}
      <SectionCard
        title="PAN Information"
        subtitle="Required for 80G certificate issuance"
      >
        <div className="pan-row">
          <input
            name="pan"
            placeholder="ABCDE1234F"
            value={form.pan}
            onChange={handlePanChange}
            onBlur={handlePanBlur}
            maxLength={10}
            style={{
              textTransform: "uppercase",
              borderColor: panError || panExists ? "#dc2626" : undefined,
            }}
          />
          <button className="secondary-btn" type="button">
            Verify PAN
          </button>
        </div>

        {checkingPan && <small>Checking PAN availability...</small>}
        {panError && <small className="error-text">{panError}</small>}
        {panExists && (
          <small className="error-text">
            Donor with this PAN already exists
          </small>
        )}
        <small>Format: 5 letters, 4 digits, 1 letter</small>
      </SectionCard>

      {/* Donor Category */}
      <SectionCard title="Donor Category">
        <div className="category-grid single-row">
          <CategoryCard
            title="General"
            description="Standard donor"
            selected={category === "GENERAL"}
            onClick={() => setCategory("GENERAL")}
          />
          <CategoryCard
            title="Repeat"
            description="Donated more than once"
            selected={category === "REPEAT"}
            onClick={() => setCategory("REPEAT")}
          />
          <CategoryCard
            title="VIP"
            description="Lifetime value > ₹1,00,000"
            selected={category === "VIP"}
            onClick={() => setCategory("VIP")}
          />
          <CategoryCard
            title="High Value"
            description="Single ≥ ₹2,00,000"
            selected={category === "HIGH_VALUE"}
            onClick={() => setCategory("HIGH_VALUE")}
          />
          <CategoryCard
            title="Corporate"
            description="Company / Organization donor"
            selected={category === "CORPORATE"}
            onClick={() => setCategory("CORPORATE")}
          />
        </div>
      </SectionCard>

      {/* Assignment & Notes */}
      <SectionCard title="Assignment & Notes">
        <div className="assignment-section">
          <div className="field-group">
            <label className="field-label">Assigned Staff</label>
            <select
              className="styled-select"
              name="assignedStaffId"
              value={form.assignedStaffId}
              onChange={handleChange}
            >
              <option value={2}>Amit</option>
              <option value={3}>Priya</option>
              <option value={4}>Rahul</option>
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Internal Notes</label>
            <textarea
              name="notes"
              className="notes-textarea"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
        </div>
      </SectionCard>

      {/* Footer Actions */}
      <div className="form-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate(-1)}
          disabled={isAddingDonor}
        >
          Cancel
        </button>

        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={isAddingDonor}
        >
          {isAddingDonor ? "Saving Donor..." : "Review & Save Donor"}
        </button>
      </div>

      {/* Validation Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Validation Error</h3>
            <p>{modalMessage}</p>
            <button className="primary-btn" onClick={handleModalOk}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDonor;
