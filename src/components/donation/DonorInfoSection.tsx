import { useRef, useState } from "react";
import Card from "../common/Card";
import FormRow from "../common/FormRow";
import { DonorService } from "../../api/donorApi";

interface DonorInfoSectionProps {
  donorId: number | null;
  setDonorId: (id: number | null) => void;
  onDonorResolved: (id: number) => void
}


export default function DonorInfoSection({
  donorId,
  setDonorId,
  onDonorResolved
}: DonorInfoSectionProps) {
  const { getDonorByPan, addDonor } = DonorService();

  const [pan, setPan] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [panNotFound, setPanNotFound] = useState(false);
  const [error, setError] = useState("");
  const panRef = useRef<HTMLInputElement>(null);

  // PAN lookup
  const handlePanBlur = async () => {
    if (!pan || pan?.length!==10){
      return;
    } 
    try {
      const donor = await getDonorByPan(pan);

      setName(donor.name);
      setEmail(donor.email);
      setPhone(donor.phone);
      setDonorId(donor.id);
      onDonorResolved(donor.id);

      setPanNotFound(false);
      setError("");
    } catch {
      // Backend returns 404 when PAN not found
      setPanNotFound(true);
      setError("PAN not found. Please enter donor details.");
      setName("");
      setEmail("");
      setPhone("");
    }
  };

  // Create donor
  const handleCreateDonor = async () => {
    if (!pan || !name || !email || !phone) {
      setError("Please fill all donor details.");
      return;
    }

    try {
      const donor = await addDonor({
        name,
        email,
        phone,
        pan,
        assignedStaffId: 2,  //Todo: fetch from API
      });

      const newDonorId = Number(donor);

      setDonorId(newDonorId);
      onDonorResolved(newDonorId);
      setPanNotFound(false);
      setError("");
      // setTimeout(() => {
      //   panRef.current?.focus();
      //   panRef.current?.blur();
      // }, 0);
    } catch {
      setError("Failed to create donor. Please try again.");
    }
  };

  return (
    <Card>
      <h3>Donor Information</h3>
      <p className="section-desc">
        Enter PAN to fetch donor details or create a new donor
      </p>

      <FormRow label="PAN*" hint="Enter PAN to auto-fetch donor details">
        <input
          type="text"
          ref={panRef}
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          onBlur={handlePanBlur}
          placeholder="ABCDE1234F"
          disabled={!!donorId}
        />
      </FormRow>

      <FormRow label="Name*" hint="Full name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!!donorId}
        />
      </FormRow>

      <FormRow label="Email*" hint="Email address">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!donorId}
        />
      </FormRow>

      <FormRow label="Phone*" hint="phone number">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!!donorId}
        />
      </FormRow>

      {error && <p className="error-text">{error}</p>}

      {panNotFound && (
        <button className="primary-btn" onClick={handleCreateDonor}>
          Create Donor
        </button>
      )}
    </Card>
  );
}

