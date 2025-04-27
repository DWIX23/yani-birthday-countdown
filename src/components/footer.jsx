// c:\xampp\htdocs\yani\birthday-tracker\src\components\footer.jsx
import React, { useState, useEffect } from 'react';

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const yourName = "Darwin James Espiritu";
  const websitePurpose = "A simple countdown timer to track Dianarra Celestine's next birthday made with react framework and node components and with LOVE.";

  return (
    // Apply fixed positioning, center horizontally, place near bottom
    <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs sm:max-w-sm text-center px-4 text-gray-600 dark:text-gray-400 text-sm z-10">
      {/* Copyright Paragraph */}
      <p>
        &copy; {year} {yourName}. All Rights Reserved.
      </p>
      {/* Purpose Paragraph */}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
        {websitePurpose}
      </p>
    </footer>
  );
}
