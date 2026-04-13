import { useState } from "react";
import "./index.css";

// ─── Validation Logic ─────────────────────────────────────────────────────────
function validate(fields) {
  const errors = {};

  if (!fields.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (fields.fullName.trim().length < 3) {
    errors.fullName = "Name must be at least 3 characters.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!fields.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[\d\s\-().]{7,15}$/.test(fields.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

// ─── Input Field Component ────────────────────────────────────────────────────
function Field({ label, id, type = "text", value, onChange, onBlur, error, touched, placeholder, icon, extra }) {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className={`field ${hasError ? "has-error" : ""} ${isValid ? "is-valid" : ""}`}>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="input-wrap">
        <span className="input-icon">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="input"
        />
        {isValid && <span className="check-icon">✓</span>}
        {extra}
      </div>
      {hasError && (
        <p className="error-msg">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  let level = 0;
  if (password.length >= 6) level++;
  if (/[A-Z]/.test(password)) level++;
  if (/[0-9]/.test(password)) level++;
  if (/[^a-zA-Z0-9]/.test(password)) level++;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ff4d6d", "#f5a623", "#f5c842", "#c8f04c"];

  return (
    <div className="strength-wrap">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="strength-bar"
            style={{ background: n <= level ? colors[level] : "var(--border-solid)" }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[level] }}>{labels[level]}</span>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ name, onReset }) {
  return (
    <div className="success-screen">
      <div className="success-icon">✦</div>
      <h2>Welcome aboard, {name.split(" ")[0]}!</h2>
      <p>Your profile has been created successfully. We're excited to have you.</p>
      <button className="btn-primary" onClick={onReset}>Create another</button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const INIT = { fullName: "", email: "", phone: "", password: "" };

export default function App() {
  const [fields, setFields] = useState(INIT);
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(fields);
  const isFormValid = Object.keys(errors).length === 0 &&
    Object.values(fields).every(v => v.trim() !== "");

  const handleChange = (key) => (e) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleBlur = (key) => () =>
    setTouched((t) => ({ ...t, [key]: true }));

  const handleSubmit = () => {
    setTouched({ fullName: true, email: true, phone: true, password: true });
    if (isFormValid) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="app">
        <Header />
        <div className="form-container">
          <SuccessScreen name={fields.fullName} onReset={() => { setFields(INIT); setTouched({}); setSubmitted(false); }} />
        </div>
        <Footer />
      </div>
    );
  }

  const progress = Object.keys(INIT).filter(
    (k) => fields[k] && !errors[k]
  ).length;

  return (
    <div className="app">
      <Header />
      <div className="form-container">
        <div className="form-card">
          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(progress / 4) * 100}%` }} />
          </div>
          <div className="form-header">
            <h1>Create Account</h1>
            <p>Join thousands of users — takes only 30 seconds</p>
          </div>

          <div className="form-body">
            <Field
              label="Full Name"
              id="fullName"
              value={fields.fullName}
              onChange={handleChange("fullName")}
              onBlur={handleBlur("fullName")}
              error={errors.fullName}
              touched={touched.fullName}
              placeholder="John Appleseed"
              icon="👤"
            />
            <Field
              label="Email Address"
              id="email"
              type="email"
              value={fields.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
              error={errors.email}
              touched={touched.email}
              placeholder="john@example.com"
              icon="✉"
            />
            <Field
              label="Phone Number"
              id="phone"
              type="tel"
              value={fields.phone}
              onChange={handleChange("phone")}
              onBlur={handleBlur("phone")}
              error={errors.phone}
              touched={touched.phone}
              placeholder="+92 300 1234567"
              icon="☏"
            />
            <Field
              label="Password"
              id="password"
              type={showPw ? "text" : "password"}
              value={fields.password}
              onChange={handleChange("password")}
              onBlur={handleBlur("password")}
              error={errors.password}
              touched={touched.password}
              placeholder="Min. 6 characters"
              icon="◈"
              extra={
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw((s) => !s)}
                  tabIndex={-1}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              }
            />
            <PasswordStrength password={fields.password} />

            <button
              className={`btn-primary submit-btn ${!isFormValid ? "disabled" : ""}`}
              onClick={handleSubmit}
            >
              Create My Account →
            </button>

            <p className="hint-text">
              By registering, you agree to our{" "}
              <span className="link">Terms of Service</span> and{" "}
              <span className="link">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">◈</span>
        <span>AUTH<em>FLOW</em></span>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="footer">© 2026 AuthFlow — Secure by design</footer>;
}
