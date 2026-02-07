function CategoryCard({ title, description, selected, onClick }) {
  return (
    <div
      className={`category-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export default CategoryCard;
