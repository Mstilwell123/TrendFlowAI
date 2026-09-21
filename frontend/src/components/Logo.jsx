import React from "react";

export default function Logo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} data-testid="tf-logo">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="28" height="28" rx="2" fill="#EAB308" />
        <path d="M8 22V10h4.2l3.3 7.2L18.8 10H23v12h-3.2v-6.6L16.6 22h-2.2l-3.2-6.6V22H8z" fill="#0A0A0A" />
      </svg>
      <span className="font-bold tracking-tight text-base" style={{ fontFamily: "Outfit" }}>
        Trend<span style={{ color: "#EAB308" }}>Flow</span>
      </span>
    </div>
  );
}
