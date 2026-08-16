/**
 * @file ActivityTimeline.tsx
 * Professional event timeline tracking security, connection, ignition, engine, proximity, and errors.
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { EventCategory, TractorEvent } from '../../types/activity';
import { formatTimestamp, formatRelativeTime } from '../../core/utils/formatting';
import {
  ShieldAlert,
  Bluetooth,
  Power,
  Radio,
  AlertTriangle,
  Sliders,
  Trash2,
  Filter,
} from 'lucide-react';

export const ActivityTimeline: React.FC = () => {
  const { activityLogs, clearActivityLogs } = useTractor();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'ALL'>('ALL');

  const categories: { id: EventCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Events' },
    { id: 'ENGINE', label: 'Engine' },
    { id: 'SECURITY', label: 'Security' },
    { id: 'CONNECTION', label: 'BLE' },
    { id: 'PROXIMITY', label: 'Proximity' },
    { id: 'ERROR', label: 'Errors' },
  ];

  const filteredLogs = activityLogs.filter(log => {
    if (selectedCategory === 'ALL') return true;
    return log.category === selectedCategory;
  });

  const getEventIcon = (category: EventCategory) => {
    switch (category) {
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-[#4ADE80]" />;
      case 'CONNECTION':
        return <Bluetooth className="w-4 h-4 text-[#F27D26]" />;
      case 'ENGINE':
        return <Power className="w-4 h-4 text-[#F27D26]" />;
      case 'PROXIMITY':
        return <Radio className="w-4 h-4 text-[#4ADE80]" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'CONFIGURATION':
        return <Sliders className="w-4 h-4 text-[#888888]" />;
      default:
        return <Power className="w-4 h-4 text-[#888888]" />;
    }
  };

  return (
    <div id="activity-screen-container" className="space-y-4">
      {/* Header & Clear */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-serif font-bold text-[#FFFFFF]">Tractor Activity Log</h2>
          <p className="text-xs text-[#777777] font-mono">
            {activityLogs.length} events logged locally
          </p>
        </div>

        {activityLogs.length > 0 && (
          <button
            onClick={clearActivityLogs}
            className="p-2 rounded-xl bg-[#0D0D0D] border border-[#222222] text-[#888888] hover:text-rose-300 hover:border-rose-500/40 transition-colors text-xs flex items-center gap-1.5"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#140E0A] border-[#F27D26]/50 text-[#F27D26] glow-orange'
                : 'bg-[#0D0D0D] border-[#222222] text-[#777777] hover:text-[#CCCCCC]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline Event Feed */}
      {filteredLogs.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-[#0A0A0A] border border-[#222222] text-[#777777] space-y-2">
          <Filter className="w-8 h-8 mx-auto text-[#444444]" />
          <div className="text-sm font-semibold text-[#CCCCCC]">No events matching this filter</div>
          <div className="text-xs text-[#666666]">Tractor actions and telemetry alerts will appear here</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map(log => {
            const isCritical = log.severity === 'CRITICAL';
            const isWarning = log.severity === 'WARNING';
            const isSuccess = log.severity === 'SUCCESS';

            return (
              <div
                key={log.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  isCritical
                    ? 'bg-[#180A0A] border-rose-500/50 shadow-md shadow-black/80'
                    : isWarning
                    ? 'bg-[#140E0A] border-[#F27D26]/40'
                    : 'bg-[#0D0D0D] border-[#222222]'
                }`}
              >
                {/* Event Icon */}
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isWarning
                      ? 'bg-[#1F1208] text-[#F27D26] border border-[#F27D26]/30'
                      : isSuccess
                      ? 'bg-[#0B150F] text-[#4ADE80] border border-[#4ADE80]/30'
                      : 'bg-[#070707] text-[#888888] border border-[#1E1E1E]'
                  }`}
                >
                  {getEventIcon(log.category)}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-serif font-bold text-[#FFFFFF] truncate">{log.title}</h4>
                    <span className="text-[10px] font-mono text-[#777777] shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888888] mt-0.5 leading-relaxed">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#070707] border border-[#1E1E1E] text-[#888888]">
                      {log.category}
                    </span>
                    <span className="text-[9px] text-[#555555] font-mono">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
