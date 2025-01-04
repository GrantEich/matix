"use client";

import React, { useEffect } from 'react';

const NotFoundPage: React.FC = () => {
  useEffect(() => {
    console.log('Environment Variables:', process.env);
  }, []);

  return (
    <div>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFoundPage;