'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="h-72 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>,
});

const TransparentApexCharts = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-72 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>;
  }

  return <ApexCharts {...props} />;
};

export default TransparentApexCharts; 