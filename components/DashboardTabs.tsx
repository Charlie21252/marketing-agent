'use client'

import { useState, type ReactNode } from 'react'
import { PostDemoChecklist } from './PostDemoChecklist'

export function DashboardTabs({ leadsContent }: { leadsContent: ReactNode }) {
  const [activeTab, setActiveTab] = useState<'leads' | 'checklist'>('leads')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'leads'
              ? 'border-violet-500 text-white'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'checklist'
              ? 'border-violet-500 text-white'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Post-Pitch Checklist
        </button>
      </div>

      {activeTab === 'leads' ? leadsContent : <PostDemoChecklist />}
    </div>
  )
}
