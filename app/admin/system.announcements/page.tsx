'use client';

import React from 'react';
import { AnnoucementList } from './_components/AnnoucementList';

export default function SystemAnnoucementsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <AnnoucementList />
    </div>
  );
}