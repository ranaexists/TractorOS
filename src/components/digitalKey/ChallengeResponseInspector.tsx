/**
 * @file ChallengeResponseInspector.tsx
 * Visual cryptographic handshake trace for embedded & mobile security engineers.
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { ShieldCheck, Cpu, Smartphone, ArrowRight, Check, RefreshCw } from 'lucide-react';

export const ChallengeResponseInspector: React.FC = () => {
  const { status } = useTractor();
  const [nonce] = useState(() => Math.random().toString(36).substring(2, 14).toUpperCase());

  return (
    <div id="crypto-inspector-card" className="p-4 rounded-3xl bg-[#0D0D0D] border border-[#222222] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
          <h3 className="text-xs font-bold font-serif text-[#FFFFFF] uppercase tracking-wider">
            Challenge-Response Protocol
          </h3>
        </div>
        <span className="text-[9px] font-mono text-[#4ADE80] bg-[#0B150F] px-2 py-0.5 rounded border border-[#4ADE80]/30 font-bold">
          HMAC-SHA256 Active
        </span>
      </div>

      <p className="text-[11px] text-[#777777]">
        Anti-replay handshake prevents Bluetooth spoofing. Raw MAC addresses are never trusted as the sole authentication factor.
      </p>

      {/* Visual Sequence Flow */}
      <div className="space-y-2 pt-1 font-mono text-[10px]">
        {/* Step 1 */}
        <div className="p-2.5 rounded-xl bg-[#070707] border border-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
            <div>
              <span className="text-[#777777]">1. ESP32 Broadcasts Challenge Nonce:</span>
              <div className="text-[#FFFFFF] font-bold">0x{nonce}</div>
            </div>
          </div>
          <span className="text-[#4ADE80] font-bold">SENT</span>
        </div>

        {/* Step 2 */}
        <div className="p-2.5 rounded-xl bg-[#070707] border border-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
            <div>
              <span className="text-[#777777]">2. Phone Signs Nonce via Enclave:</span>
              <div className="text-[#FFFFFF] font-bold truncate max-w-[200px]">
                HMAC(Key, Nonce): c4a7...9e21
              </div>
            </div>
          </div>
          <span className="text-[#4ADE80] font-bold">SIGNED</span>
        </div>

        {/* Step 3 */}
        <div className="p-2.5 rounded-xl bg-[#070707] border border-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
            <div>
              <span className="text-[#777777]">3. ESP32 Independent Verification:</span>
              <div className="text-[#4ADE80] font-bold">Signature Valid → AUTHORIZED</div>
            </div>
          </div>
          <span className="text-[#4ADE80] font-bold flex items-center gap-0.5">
            <Check className="w-3 h-3" /> PASS
          </span>
        </div>
      </div>
    </div>
  );
};
