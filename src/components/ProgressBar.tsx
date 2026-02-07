function ProgressBar({ label, value }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <p>{label}</p>
      <div style={{ background: "#e5e7eb", borderRadius: "8px" }}>
        <div
          style={{
            width: value,
            background: "#22c55e",
            height: "10px",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
