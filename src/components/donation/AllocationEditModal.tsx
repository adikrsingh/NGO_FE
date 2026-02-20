import { useState, useEffect } from "react";
import { useApi } from "../../api/useApi";

interface Props {
  visible: boolean;
  totalAmount: number;
  onClose: () => void;
  onConfirm: (allocations: any[]) => void;
}

export default function AllocationEditModal({
  visible,
  totalAmount,
  onClose,
  onConfirm,
}: Props) {

  const { baseApi } = useApi();

  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      baseApi().get("/donation-categories")
        .then(res => setCategories(res.data));
    }
  }, [visible]);

  if (!visible) return null;

  const toggleCategory = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(c => c !== name));
      setAllocations(allocations.filter(a => a.campaignName !== name));
    } else {
      setSelected([...selected, name]);
      setAllocations([...allocations, {
        campaignName: name,
        allocatedAmount: 0
      }]);
    }
  };

  const updateAmount = (name: string, value: number) => {
    setAllocations(prev =>
      prev.map(a =>
        a.campaignName === name
          ? { ...a, allocatedAmount: value }
          : a
      )
    );
  };

  const totalAllocated = allocations.reduce(
    (sum, a) => sum + Number(a.allocatedAmount || 0),
    0
  );

  const remaining = totalAmount - totalAllocated;

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h3>Update Allocations</h3>

        {categories.map(cat => (
          <div key={cat.name}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
              />
              {cat.name}
            </label>

            {selected.includes(cat.name) && (
              <input
                type="number"
                onChange={(e) =>
                  updateAmount(cat.name, Number(e.target.value))
                }
              />
            )}
          </div>
        ))}

        <p>Allocated: ₹ {totalAllocated}</p>
        <p>Remaining: ₹ {remaining}</p>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={remaining !== 0}
            onClick={() => onConfirm(allocations)}
          >
            Save Allocations
          </button>
        </div>

      </div>
    </div>
  );
}
