"use client";

import { useState } from "react";

export function SiteHeader() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-in">
        <a
          className="brand"
          href="https://www.marssg.com/"
          aria-label="MARS Solutions Group home"
        >
          {logoFailed ? (
            <span className="brand-text">MARS Solutions Group</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="https://mars-solutions.s3.us-east-2.amazonaws.com/MARS-logo-color.png"
              alt="MARS Solutions Group"
              onError={() => setLogoFailed(true)}
            />
          )}
        </a>
        <div className="header-note">
          Questions?{" "}
          <a href="https://www.marssg.com/contact-us">Contact our team</a>
        </div>
      </div>
    </header>
  );
}
