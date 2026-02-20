import { useState, useCallback } from "react";
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
    donorName?: string;
    amount: number;
    purpose: string;
    paymentMode: string;
    transactionId: string;
    date: string;
    categories: CategoryAllocation[];
    complianceData: {
      is80G: boolean;
      deliveryMethod: string;
    };
  }) => void;
  isSubmitting?: boolean;
};

export default function DonationForm({ onSubmit, isSubmitting }: Props) {
  const [donorId, setDonorId] = useState<number | null>(null);

  const [resolvedDonor, setResolvedDonor] = useState<{
    id: number;
    name: string;
  } | null>(null);


  const [amount, setAmount] = useState(0);
  const [purpose, setPurpose] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [date, setDate] = useState("");

  const [notes, setNotes] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");

  const [categoryAllocations, setCategoryAllocations] = useState<
    CategoryAllocation[]
  >([]);

  const [complianceData, setComplianceData] = useState({
    is80G: false,
    deliveryMethod: "EMAIL",
  });

  const handleComplianceChange = useCallback((data: {
    is80G: boolean;
    deliveryMethod: string;
  }) => {
    setComplianceData(data);
  }, []);

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
      donorName: resolvedDonor?.name || "",
      amount,
      purpose: notes || purpose,
      paymentMode,
      transactionId,
      date,
      categories: categoryAllocations,
      complianceData,
    });
  };

  const handleDonorResolved = (id: number, name: string) => {
    setDonorId(id);
    setResolvedDonor({ id, name });
  };



  return (
    <div className="donation-form-wrapper">
      <DonorInfoSection
        donorId={donorId}
        setDonorId={setDonorId}
        onDonorResolved={handleDonorResolved}
      />

      {/* Donation Details Section (Amount, Purpose, Payment Info) */}

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

    {/* Compliance & Certification Section */}

      <ComplianceSection
        onComplianceChange={handleComplianceChange}
      />

      {/* Internal Metadata Section (Notes + Staff Assignment) */}

      <InternalMetaSection
        assignedStaff={assignedStaff}
        setAssignedStaff={setAssignedStaff}
        notes={notes}
        setNotes={setNotes}
      />

    {/* Actions at the bottom  */}
      <DonationActions
        isSubmitting={isSubmitting}
        onCancel={() => window.history.back()}
        handleSubmit={handleSubmit}
        is80G={complianceData.is80G}
        deliveryMethod={complianceData.deliveryMethod}
      />
    </div>
  );
}
