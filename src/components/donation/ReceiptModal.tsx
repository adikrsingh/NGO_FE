import { useEffect, useState, useRef } from "react";
import { amountToWords } from "../../utils/amountToWords";
import "../../styles/receiptModal.css";
import { useApi } from "../../api/useApi";
import html2pdf from "html2pdf.js";
import AllocationEditModal from "./AllocationEditModal";

interface Props {
  visible: boolean;
  donationId?: number;
  onClose: () => void;
  redirectAfterSave?: () => void;
}

export default function ReceiptModal({
  visible,
  donationId,
  onClose,
  redirectAfterSave,
}: Props) {
  const { baseApi } = useApi();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [editableName, setEditableName] = useState("");
  const [editableAmount, setEditableAmount] = useState("0");
  const [editableDate, setEditableDate] = useState("");
  const [editableAddress, setEditableAddress] = useState("");
  const [editablePAN, setEditablePAN] = useState("");
  const [editableUPI, setEditableUPI] = useState("");
  const [editableReceiptNum, setEditableReceiptNum] = useState("");
  const [signatoryName, setSignatoryName] = useState("");

  //May be used in future to allow uploading of actual signature image instead of typed name
  // const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const [showAllocationModal, setShowAllocationModal] = useState(false);

  // AUTO FETCH RECEIPT DATA
  useEffect(() => {
    if (!visible || !donationId) return;

    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const res = await baseApi().get(`/receipts/${donationId}`);
        const data = res.data;

        setEditableName(data.donorName || "");
        setEditablePAN(data.donorPAN || "");
        setEditableAddress(data.donorAddress || "");
        setEditableAmount(String(data.amount || 0));
        setEditableDate(data.donationDate || "");
        setEditableUPI(data.transactionId || "");
        setEditableReceiptNum(data.receiptNumber || "");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [visible, donationId]);

  if (!visible) return null;

  // PRINT ONLY RECEIPT
  const handlePrint = () => {
    if (!receiptRef.current) return;

    const printContents = receiptRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <div style="padding:30px; font-family:'Times New Roman', serif;">
        ${printContents}
      </div>
    `;

    window.print();

    document.body.innerHTML = originalContents;

    // reload to restore React state safely
    window.location.reload();
  };

  // PDF DOWNLOAD
  const handleDownload = async () => {
    if (!receiptRef.current) return;

    await html2pdf()
      .set({
        margin: 10,
        filename: `receipt_${donationId}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(receiptRef.current)
      .save();
  };

  const proceedSave = async (allocations: any[]) => {
    if (!donationId) return;

    try {
      setIsSaving(true);

      await baseApi().put(`/receipts/${donationId}`, {
        donorName: editableName,
        donorPAN: editablePAN,
        donorAddress: editableAddress,
        date: editableDate
      });

      onClose();
      redirectAfterSave?.();
    } finally {
      setIsSaving(false);
    }
  };

  // FUTURE: Handle actual signature image upload

  // const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setSignatureImage(reader.result as string);
  //   };
  //   reader.readAsDataURL(file);
  // };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-box">

          <div className="receipt-scroll">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div ref={receiptRef} className="receipt-container">
                <div className="receipt-watermark">
                  <img src="/tesf-logo.png" alt="Watermark" />
                </div>

                <div className="receipt-header">
                  <h2>The Earth Saviours Foundation</h2>
                  <p>(Recognized NGO, Registration No. S/6/0983/2008)</p>
                  <p>T.E.S.F PAN No.: AABTT4892Q</p>
                  <p style={{ fontSize: "11px" }}>
                    Bandhwari Village, Gurgaon, Haryana
                  </p>
                </div>

                <div className="receipt-ref-row">
                  <div>Receipt No.: {editableReceiptNum}</div>
                  <div>Dated: {editableDate}</div>
                </div>

                <div className="receipt-info-row">
                  <label>Received with thanks from:</label>
                  {editMode ? (
                    <input value={editableName} onChange={(e)=>setEditableName(e.target.value)} />
                  ) : (
                    <div className="receipt-value">{editableName}</div>
                  )}
                </div>

                <div className="receipt-info-row">
                  <label>Address:</label>
                  {editMode ? (
                    <input value={editableAddress} onChange={(e)=>setEditableAddress(e.target.value)} />
                  ) : (
                    <div className="receipt-value">{editableAddress}</div>
                  )}
                </div>

                <div className="receipt-info-row">
                  <label>PAN No.:</label>
                  {editMode ? (
                    <input value={editablePAN} onChange={(e)=>setEditablePAN(e.target.value)} />
                  ) : (
                    <div className="receipt-value">{editablePAN}</div>
                  )}
                </div>

                <div className="amount-row">
                  <div className="amount-info">
                    <div className="amount-info-label">(in words):</div>
                    <div className="amount-info-value">
                      {amountToWords(Number(editableAmount))}
                    </div>
                  </div>
                  <div className="pdf-amount-box">
                    ₹ {Number(editableAmount).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="receipt-info-row">
                  <label>By UPI:</label>
                  {editMode ? (
                    <input value={editableUPI} onChange={(e)=>setEditableUPI(e.target.value)} />
                  ) : (
                    <div className="receipt-value">{editableUPI}</div>
                  )}
                </div>

                <div className="pdf-tax-section">
                  <h4>80G Tax Exemption Details</h4>
                  <div className="pdf-tax-grid">
                    <div><strong>80G Registration No.</strong> AAACT1234DF20214</div>
                    <div><strong>Valid From</strong> 01-04-2021 to Perpetuity</div>
                    <div><strong>PAN of Trust</strong> AABTT4892Q</div>
                    <div><strong>Deduction Limit</strong> 50% of Donation</div>
                  </div>
                </div>

                <div className="signature-section">
                  {editMode && (
                    <div className="signature-input">
                      <label>Authorized Signatory Name:</label>
                      <input
                        type="text"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        placeholder="Enter signatory name"
                      />
                    </div>
                  )}
                  <div className="pdf-signature">
                    <div className="typed-signature">
                      {signatoryName}
                      {/* {signatoryName || "Authorized Signatory"} */}
                    </div>
                    <div className="pdf-signature-line">
                      For The Earth Saviours Foundation
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <div className="modal-left">
              {editMode
                ? "Editing mode enabled. Amount cannot be modified."
                : "Receipt ready for print or download."}
            </div>

            <div className="modal-right">
              <button onClick={onClose}>Close</button>
              <button onClick={() => setEditMode(!editMode)}>
                {editMode ? "View Mode" : "Edit"}
              </button>

              <button onClick={handlePrint}>Print</button>

              <button onClick={handleDownload} disabled={editMode}>Download PDF</button>

              <button disabled={isSaving} onClick={()=>proceedSave([])}>
                {isSaving ? "Saving..." : "Save Receipt"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AllocationEditModal
        visible={showAllocationModal}
        totalAmount={Number(editableAmount)}
        onClose={() => setShowAllocationModal(false)}
        onConfirm={(allocs) => {
          setShowAllocationModal(false);
          proceedSave(allocs);
        }}
      />
    </>
  );
}