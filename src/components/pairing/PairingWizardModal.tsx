/**
 * @file PairingWizardModal.tsx
 * Multi-step pairing flow: Welcome -> BLE Scan -> Select Tractor -> Secure Challenge Handshake -> Digital Key Issued.
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { BleDeviceScanResult } from '../../types/ble';
import confetti from 'canvas-confetti';
import {
  X,
  Bluetooth,
  ShieldCheck,
  Cpu,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Smartphone,
} from 'lucide-react';

export const PairingWizardModal: React.FC = () => {
  const { isPairingWizardOpen, setIsPairingWizardOpen, connectTractor } = useTractor();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<BleDeviceScanResult[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BleDeviceScanResult | null>(null);
  const [pairingPin, setPairingPin] = useState('');
  const [isHandshaking, setIsHandshaking] = useState(false);

  if (!isPairingWizardOpen) return null;

  const handleStartScan = async () => {
    setStep(2);
    setIsScanning(true);
    // Simulate real BLE inquiry scan
    setTimeout(() => {
      setScannedDevices([
        {
          id: 'TRAC-ESP32-9842',
          name: 'TRACTOR_ESP32_9842 (Mahindra 575 DI)',
          rssi: -54,
          isPaired: false,
          advertisedServiceUuids: ['0000ffa0-0000-1000-8000-00805f9b34fb'],
        },
        {
          id: 'TRAC-ESP32-3310',
          name: 'TRACTOR_ESP32_3310 (John Deere 5050)',
          rssi: -82,
          isPaired: false,
          advertisedServiceUuids: ['0000ffa0-0000-1000-8000-00805f9b34fb'],
        },
      ]);
      setIsScanning(false);
    }, 1500);
  };

  const handleSelectTractor = (dev: BleDeviceScanResult) => {
    setSelectedDevice(dev);
    setStep(3);
  };

  const handleCompleteHandshake = async () => {
    setIsHandshaking(true);
    setTimeout(async () => {
      setIsHandshaking(false);
      setStep(4);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      if (selectedDevice) {
        await connectTractor(selectedDevice.id);
      }
    }, 1800);
  };

  const handleFinish = () => {
    setIsPairingWizardOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0D0D0D] border border-[#222222] shadow-2xl space-y-4">
        {/* Top bar with close */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-[#F27D26]" />
            <h3 className="text-sm font-serif font-bold text-[#FFFFFF] uppercase tracking-wide">
              Tractor Pairing Wizard
            </h3>
          </div>
          <button
            onClick={() => setIsPairingWizardOpen(false)}
            className="p-1 rounded-lg text-[#888888] hover:text-white hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Welcome & Preparation */}
        {step === 1 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-[#140E0A] border border-[#F27D26]/40 flex items-center justify-center text-3xl mx-auto text-[#F27D26] glow-orange">
              🚜
            </div>
            <div>
              <h4 className="text-base font-serif font-bold text-[#FFFFFF]">Pair Your Smart Tractor</h4>
              <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                Ensure your tractor is stationary with the ESP32 cab controller powered ON. Bring your smartphone within 2 meters.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E] text-left text-xs text-[#CCCCCC] space-y-1.5">
              <div className="flex items-center gap-2 text-[#4ADE80] font-semibold">
                <CheckCircle className="w-4 h-4" /> Bluetooth Low Energy Active
              </div>
              <div className="flex items-center gap-2 text-[#4ADE80] font-semibold">
                <CheckCircle className="w-4 h-4" /> Secure Enclave Initialized
              </div>
            </div>

            <button
              id="btn-start-pairing-scan"
              onClick={handleStartScan}
              className="w-full py-3 rounded-xl bg-[#F27D26] hover:bg-[#E06C15] text-black font-bold text-sm shadow-lg glow-orange transition-all flex items-center justify-center gap-2"
            >
              <span>Scan for Nearby Tractors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: BLE Scanning & Device Selection */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <h4 className="text-sm font-serif font-bold text-[#FFFFFF]">Nearby Tractor Controllers</h4>
              <p className="text-xs text-[#777777] mt-0.5">
                {isScanning ? 'Searching BLE advertising beacons...' : 'Select your tractor to initiate secure pairing.'}
              </p>
            </div>

            {isScanning ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#F27D26] animate-spin mx-auto" />
                <div className="text-xs text-[#888888] font-mono">Listening for GATT Services (0xFFA0)...</div>
              </div>
            ) : (
              <div className="space-y-2">
                {scannedDevices.map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => handleSelectTractor(dev)}
                    className="w-full p-3.5 rounded-2xl bg-[#070707] border border-[#1E1E1E] hover:border-[#F27D26]/60 hover:bg-[#140E0A] flex items-center justify-between text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/30 flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#FFFFFF]">{dev.name}</div>
                        <div className="text-[10px] text-[#777777] font-mono mt-0.5">{dev.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#4ADE80]">{dev.rssi} dBm</div>
                      <div className="text-[9px] text-[#666666]">Strong Signal</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: PIN Verification & Challenge-Response Handshake */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <h4 className="text-sm font-serif font-bold text-[#FFFFFF]">Owner Verification</h4>
              <p className="text-xs text-[#777777] mt-0.5">
                Enter the 6-digit factory security PIN stamped on your tractor ESP32 cab module.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E] text-center">
              <div className="text-[11px] text-[#777777] mb-1">Target Tractor:</div>
              <div className="text-xs font-bold text-[#F27D26] font-mono">{selectedDevice?.name}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">
                ESP32 Cab Controller PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={pairingPin}
                onChange={e => setPairingPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 584920"
                className="w-full text-center tracking-widest text-xl font-mono px-4 py-3 rounded-xl bg-[#070707] border border-[#262626] text-[#FFFFFF] focus:outline-none focus:border-[#F27D26]"
              />
              <div className="text-[10px] text-[#666666] text-center mt-1">
                Default demo PIN is pre-authorized.
              </div>
            </div>

            <button
              onClick={handleCompleteHandshake}
              disabled={isHandshaking}
              className="w-full py-3 rounded-xl bg-[#F27D26] hover:bg-[#E06C15] text-black font-bold text-sm shadow-lg glow-orange transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isHandshaking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing HMAC-SHA256 Challenge...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Issue Digital Key</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-[#0B150F] text-[#4ADE80] flex items-center justify-center mx-auto border border-[#4ADE80]/40 glow-green">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-lg font-serif font-bold text-[#FFFFFF]">Pairing Complete!</h4>
              <p className="text-xs text-[#888888] mt-1">
                Your smartphone is now registered as the primary <strong className="text-[#4ADE80]">Owner Key</strong> for this tractor.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E] text-left text-xs font-mono text-[#CCCCCC] space-y-1">
              <div>Tractor: <span className="text-[#F27D26]">{selectedDevice?.id}</span></div>
              <div>Key Algorithm: <span className="text-[#E0E0E0]">HMAC-SHA256 / Enclave</span></div>
              <div>Auto Cutoff: <span className="text-[#4ADE80]">ENABLED (30s)</span></div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-[#F27D26] hover:bg-[#E06C15] text-black font-bold text-sm shadow-lg glow-orange transition-all"
            >
              Go to Tractor Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
