import "../../styles/form.css";
import Card from "../common/Card";
import { JSX, useEffect, useRef, useState } from "react";
import { amountToWords } from "../../utils/amountToWords";
import { useApi } from "../../api/useApi";

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

  /** Category state */
  const [categories, setCategories] = useState<DonationCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryAllocations, setCategoryAllocations] = useState<
    CategoryAllocation[]
  >([]);

  /** Dropdown */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** Custom category */
  const [newCategory, setNewCategory] = useState("");

  /** Fetch categories from backend */
  useEffect(() => {
    baseApi()
      .get("/donation-categories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {
        alert("Failed to load donation categories");
      });
  }, []);

  /** Close dropdown on outside click */
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

  /** Reset allocations on amount change */
  useEffect(() => {
    setCategoryAllocations((prev) =>
      prev.map((c) => ({ ...c, amount: 0 }))
    );
  }, [amount]);

  /** Sync with parent */
  useEffect(() => {
    onCategoryChange(categoryAllocations);
  }, [categoryAllocations, onCategoryChange]);

  const totalAllocated = categoryAllocations.reduce(
    (sum, c) => sum + c.amount,
    0
  );

  const remainingAmount = amount - totalAllocated;

  /** Toggle category */
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

  /** Amount change */
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

  /** Add custom category (frontend only) - Not neededd in the drop down, Is it needed? Will decide later.*/
  const addCustomCategory = () => {
    if (!newCategory.trim()) return;

    if (categories.some((c) => c.name === newCategory.trim())) {
      alert("Category already exists");
      return;
    }

    const created = { name: newCategory.trim() };
    setCategories((prev) => [...prev, created]);
    setNewCategory("");
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
            onKeyDown={(e) =>
              ["-", "e", "+"].includes(e.key) && e.preventDefault()
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") return setAmount(0);
              const num = Number(val);
              if (num < 0 || val.length > 10) return;
              setAmount(num);
            }}
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
          <label>Transaction Reference ID</label>
          <input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY DROPDOWN */}
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

                {filteredCategories.length === 0 && (
                  <div className="no-results">No categories found</div>
                )}
              </div>

              {/* Create new category * - commenting this for now, We might not need 
                    addCategory by staff, but the method remains in the code, if needed, we can use this./}
              {/* <div className="dropdown-create">
                <input
                  placeholder="Create new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="button" onClick={addCustomCategory}>
                  Add
                </button>
              </div> */}
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

      {/* Notes */}
      <div className="form-row">
        <label>Internal Notes</label>
        <textarea
          rows={4}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>
    </Card>
  );
};

export default DonationDetailsSection;
