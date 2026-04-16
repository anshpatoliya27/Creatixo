function Topbar() {
  return (
    <header className="topbar">
      <input
        type="text"
        placeholder="Search businesses, posts..."
        className="search"
      />

      <div className="top-icons">
        <span>🔔</span>
        <span>👤</span>
      </div>
    </header>
  );
}

export default Topbar;
