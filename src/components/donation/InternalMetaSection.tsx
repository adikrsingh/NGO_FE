import Card from "../common/Card";

const TAGS = [
  "High Value",
  "Corporate CSR",
  "One-Time",
  "Recurring",
  "VIP Donor",
  "First-Time",
  "Major Gift",
];

interface InternalMetaSectionProps {assignedStaff?: string; setAssignedStaff: (staff: string) => void; notes?: string; setNotes: (source: string) => void}

export default function InternalMetaSection({assignedStaff, setAssignedStaff, notes, setNotes}: InternalMetaSectionProps) {
  return (
    <Card>
      {/* Header */}
      <div className="section-header">
        <h3>
          🏷️ Internal Tags & Metadata
        </h3>
        <span className="section-hint">
          For internal tracking and reporting (visible to staff only)
        </span>
      </div>

      {/* Two-column row */}
      <div className="form-grid two-col">
        <div className="form-block">
          <label>Assigned Team Member</label>
          <select>
            <option>Select team member</option>
            <option>Priya Sharma</option>
            <option>Amit Kumar</option>
            <option>Rahul Singh</option>
          </select>
        </div>

        <div className="form-block">
          <label>Donation Source</label>
          <select>
            <option>Direct Outreach</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Event</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="form-block">
        <label>Internal Tags</label>

        <div className="tag-container">
          {TAGS.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
