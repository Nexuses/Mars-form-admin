"use client";

import { useState } from "react";

const LOGO =
  "https://mars-solutions.s3.us-east-2.amazonaws.com/MARS-logo-color.png";

export function AdminBrand() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="admin-brand">
      {failed ? (
        <span className="admin-brand-text">MARS Solutions Group</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={LOGO}
          alt="MARS Solutions Group"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
