'use client'
 
import React from 'react'
import dynamic from 'next/dynamic'
 
const TablePage = dynamic(() => import('./pages/RHFTablePage'), { ssr: false })
 
export function ClientOnly() {
  return <TablePage />
}