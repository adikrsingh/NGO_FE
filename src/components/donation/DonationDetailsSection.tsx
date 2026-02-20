import "../../styles/form.css";
import Card from "../common/Card";
import { JSX, useEffect, useRef, useState } from "react";
import { amountToWords } from "../../utils/amountToWords";
import { useApi } from "../../api/useApi";
import { Input, Tooltip, Popover } from "antd";
import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

/** Models */
interface DonationCategory {
  id?: number;
  name: string;
}

interface CategoryAllocation {
  category: string;
  amount: number;
}

interface DonationDetailsSectionProps {
  amount: number;
  setAmount: (amount: number) => void;

  purpose: string;
  setPurpose: (purpose: string) => void;

  paymentMode: string;
  setPaymentMode: (mode: string) => void;

  transactionId: string;
  setTransactionId: (id: string) => void;

  date: string;
  setDate: (date: string) => void;

  onCategoryChange: (categories: CategoryAllocation[]) => void;
}

const DonationDetailsSection = ({
  amount,
  setAmount,
  purpose,
  setPurpose,
  paymentMode,
  setPaymentMode,
  transactionId,
  setTransactionId,
  date,
  setDate,
  onCategoryChange,
}: DonationDetailsSectionProps): JSX.Element => {
  const { baseApi } = useApi();

  const [categories, setCategories] = useState<DonationCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryAllocations, setCategoryAllocations] = useState<
    CategoryAllocation[]
  >([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    baseApi()
      .get("/donation-categories")
      .then((res) => setCategories(res.data))
      .catch(() => alert("Failed to load donation categories"));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setCategoryAllocations((prev) =>
      prev.map((c) => ({ ...c, amount: 0 }))
    );
  }, [amount]);

  useEffect(() => {
    onCategoryChange(categoryAllocations);
  }, [categoryAllocations, onCategoryChange]);

  const totalAllocated = categoryAllocations.reduce(
    (sum, c) => sum + c.amount,
    0
  );

  const remainingAmount = amount - totalAllocated;

  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories((prev) =>
        prev.filter((c) => c !== categoryName)
      );
      setCategoryAllocations((prev) =>
        prev.filter((c) => c.category !== categoryName)
      );
    } else {
      setSelectedCategories((prev) => [...prev, categoryName]);
      setCategoryAllocations((prev) => [
        ...prev,
        { category: categoryName, amount: 0 },
      ]);
    }
  };

  const handleCategoryAmountChange = (
    category: string,
    value: number
  ) => {
    if (value < 0) return;

    setCategoryAllocations((prev) =>
      prev.map((item) => {
        if (item.category !== category) return item;
        const maxAllowed = remainingAmount + item.amount;
        return {
          ...item,
          amount: value > maxAllowed ? item.amount : value,
        };
      })
    );
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card title="Donation Details" subtitle="Enter the financial details">
      {/* Amount + Date */}
      <div className="form-row two-col">
        <div className="form-block">
          <label>Donation Amount *</label>
          <input
            type="number"
            min={0}
            placeholder="₹ 0"
            value={amount === 0 ? "" : amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          {amount > 0 && (
            <div className="amount-in-words">
              {amountToWords(amount)}
            </div>
          )}
        </div>

        <div className="form-block">
          <label>Donation Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Payment */}
      <div className="form-row two-col">
        <div className="form-block">
          <label>Payment Mode *</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="">Select</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div className="form-block">
          <label>
                Transaction Reference ID
                <Popover
                  title="What is Transaction Reference ID?"
                  content={
                    <div style={{ maxWidth: 400 }}>
                      <p>This is the unique reference number generated by your bank when the payment is successfully made.</p>
                      <p style={{ fontWeight: 'bold' }}>It is very important for automatic bank reconciliation.</p>
                      
                      <h4 style={{ marginTop: 12 }}>If payment was made via UPI:</h4>
                      <ul>
                        <li>Enter the UTR number shown in your bank app or SMS.</li>
                        <li><strong>Example:</strong> UTR000456789</li>
                      </ul>

                      <h4 style={{ marginTop: 12 }}>If payment was made via NEFT / IMPS / Bank Transfer:</h4>
                      <ul>
                        <li>Enter the exact transaction ID as shown in your bank statement.</li>
                        <li><strong>Example:</strong> NEFT/Jhon doe/Donation Ref 7002</li>
                        <li style={{ color: '#ff7a45', fontWeight: 'bold' }}>ℹ️ Note: Make sure "Donation Ref" is written exactly as shown in your bank record.</li>
                      </ul>

                      <div style={{ marginTop: 12, padding: 10, backgroundColor: '#fff7e6', borderLeft: '4px solid #ff7a45' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>⚠️ Important:</p>
                        <p style={{ margin: '4px 0 0 0' }}>Please enter the reference exactly as shown in your bank record.</p>
                        <p style={{ margin: '4px 0 0 0', color: '#d4380d' }}>Incorrect or missing reference may prevent automatic reconciliation.</p>
                      </div>
                    </div>
                  }
                  trigger="hover"
                >
                  <QuestionCircleOutlined style={{ marginLeft: 8, cursor: 'pointer', color: '#1890ff' }} />
                </Popover>
          </label>
          <input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="form-row">
        <div className="form-block full-width" ref={dropdownRef}>
          <label>Select Categories *</label>

          <div
            className="dropdown-input"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {selectedCategories.length === 0
              ? "Select categories"
              : selectedCategories.join(", ")}
          </div>

          {dropdownOpen && (
            <div className="dropdown-overlay">
              <input
                className="dropdown-search"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="dropdown-list">
                {filteredCategories.map((cat) => (
                  <label key={cat.name} className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => toggleCategory(cat.name)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allocation */}
      {categoryAllocations.map((item) => (
        <div className="form-row two-col" key={item.category}>
          <div className="form-block">
            <strong>{item.category}</strong>
          </div>
          <div className="form-block">
            <input
              type="number"
              min={0}
              placeholder="₹ 0"
              value={item.amount === 0 ? "" : item.amount}
              onChange={(e) =>
                handleCategoryAmountChange(
                  item.category,
                  Number(e.target.value)
                )
              }
            />
          </div>
        </div>
      ))}
      {categoryAllocations.length > 0 && (
        <div className="form-row two-col">
          <div>
            <strong>Allocated:</strong> ₹ {totalAllocated}
          </div>
          <div>
            <strong>Remaining:</strong> ₹ {remainingAmount}
          </div>
        </div>
      )}
    </Card>
  );
};

export default DonationDetailsSection;
