export default function FormRow({ label, children, hint }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}
