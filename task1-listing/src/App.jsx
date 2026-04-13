import { useState, useEffect, useCallback, useRef } from "react";
import "./index.css";

// ─── Card Component ───────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="card">
      <div className="card-img-wrap">
        {imgError ? (
          <div className="card-img-placeholder">
            <span>🚗</span>
          </div>
        ) : (
          <img
            src={product.thumbnail}
            alt={product.title}
            onError={() => setImgError(true)}
          />
        )}
        <div className="card-badge">{product.category}</div>
      </div>
      <div className="card-body">
        <h3 className="card-title">{product.title}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <span className="card-price">${product.price.toFixed(2)}</span>
          <div className="card-meta">
            <span className="card-rating">★ {product.rating?.toFixed(1)}</span>
            <span className="card-stock">{product.stock} in stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card skeleton">
      <div className="sk sk-img" />
      <div className="card-body">
        <div className="sk sk-title" />
        <div className="sk sk-desc" />
        <div className="sk sk-desc short" />
        <div className="sk sk-price" />
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={page === i + 1 ? "active" : ""}
          onClick={() => onChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const PER_PAGE = 8;

export default function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  // Debounce search
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 350);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
fetch("https://dummyjson.com/products/category/vehicle?limit=100")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setAllProducts(data.products);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // Filter + sort
  const filtered = allProducts
    .filter((p) =>
      p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.title.localeCompare(b.title);
      if (sort === "name-desc") return b.title.localeCompare(a.title);
      return 0;
    });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span>MARKET<em>HUB</em></span>
          </div>
          <p className="header-sub">Curated products, zero compromise</p>
        </div>
      </header>

      {/* Controls */}
      <div className="controls-bar">
        <div className="controls-inner">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button className="clear-btn" onClick={() => { handleSearch(""); }}>✕</button>
            )}
          </div>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
        {!loading && !error && (
          <p className="result-count">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Grid */}
      <main className="main">
        {loading && (
          <div className="grid">
            {Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {error && (
          <div className="error-state">
            <span>⚠</span>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        {!loading && !error && paginated.length === 0 && (
          <div className="empty-state">
            <span>◎</span>
            <h2>No products found</h2>
            <p>Try a different search term</p>
          </div>
        )}
        {!loading && !error && paginated.length > 0 && (
          <div className="grid">
            {paginated.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>

      {/* Pagination */}
      {!loading && !error && (
        <Pagination
          page={page}
          total={filtered.length}
          perPage={PER_PAGE}
          onChange={setPage}
        />
      )}

      <footer className="footer">© 2026 MarketHub — Built with React</footer>
    </div>
  );
}
