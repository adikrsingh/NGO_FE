import { useState } from "react";
import DonorInfoSection from "./DonorInfoSection";
import DonationDetailsSection from "./DonationDetailsSection";
import ComplianceSection from "./ComplianceSection";
import InternalMetaSection from "./InternalMetaSection";
import DonationActions from "./DonationActions";

/** Category allocation model */
interface CategoryAllocation {
  category: string;
  amount: number;
}

type Props = {
  onSubmit: (data: {
    donorId: number;
    amount: number;
    purpose: string;
    paymentMode: string;
    transactionId: string;
    date: string;
    categories: CategoryAllocation[];
  }) => void;
  isSubmitting?: boolean;
};

export default function DonationForm({ onSubmit, isSubmitting }: Props) {
  /** Core fields */
  const [donorId, setDonorId] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [purpose, setPurpose] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [date, setDate] = useState("");

  /** Internal metadata */
  const [notes, setNotes] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");

  /** Category allocations (NEW) */
  const [categoryAllocations, setCategoryAllocations] = useState<
    CategoryAllocation[]
  >([]);

  /** Submit handler */
  const handleSubmit = () => {
    if (!donorId) {
      alert("Please complete donor information before saving donation");
      return;
    }

    if (amount <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    if (categoryAllocations.length === 0) {
      alert("Please select at least one category");
      return;
    }

    const totalAllocated = categoryAllocations.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    if (totalAllocated !== amount) {
      alert(
        `Allocated amount (₹${totalAllocated}) must equal donation amount (₹${amount})`
      );
      return;
    }

    onSubmit({
      donorId,
      amount,
      purpose: notes || purpose,
      paymentMode,
      transactionId,
      date,
      categories: categoryAllocations,
    });
  };

  const handleDonorResolved = (resolvedDonorId: number) => {
    setDonorId(resolvedDonorId);
  };

  return (
    <div className="donation-form-wrapper">
      {/* Donor Info */}
      <DonorInfoSection
        donorId={donorId}
        setDonorId={setDonorId}
        onDonorResolved={handleDonorResolved}
      />

      {/* Donation Details */}
      <DonationDetailsSection
        amount={amount}
        setAmount={setAmount}
        purpose={purpose}
        setPurpose={setPurpose}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        transactionId={transactionId}
        setTransactionId={setTransactionId}
        date={date}
        setDate={setDate}
        onCategoryChange={setCategoryAllocations} 
      />

      {/* Compliance */}
      <ComplianceSection />

      {/* Internal Metadata */}
      <InternalMetaSection
        assignedStaff={assignedStaff}
        setAssignedStaff={setAssignedStaff}
        notes={notes}
        setNotes={setNotes}
      />

      {/* Actions */}
      <DonationActions
        isSubmitting={isSubmitting}
        onCancel={() => window.history.back()}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
