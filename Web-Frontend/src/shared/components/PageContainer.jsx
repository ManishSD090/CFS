// src/shared/components/PageContainer.jsx
import React from 'react';

const PageContainer = ({ children }) => {
  return (
    <div className="min-h-full w-full pb-24 md:pb-8">
      {children}
    </div>
  );
};

export default PageContainer;