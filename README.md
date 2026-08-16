# Smart Tractor Keyless Control Mobile App

Production-ready digital key, push-start ignition, proximity tracking, and safety interlock mobile interface for **ESP32 Bluetooth Low Energy (BLE)** tractor controllers.

---

## 1. Architecture Overview

Built with Clean Architecture, Feature-driven modularity, and strict authoritative state machines:

```text
Presentation Layer (Home, Digital Key, Activity, Settings, Simulator)
        ↓
State Management (TractorContext / Reactive Notifiers)
        ↓
Domain Layer (TractorStateMachine, ITractorRepository, Safety Interlocks)
        ↓
Data Layer (TractorRepository, LocalStorageService, CryptoUtils)
        ↓
BLE Infrastructure (WebBleService [navigator.bluetooth] / MockBleService [ESP32 Simulator])
```

---

## 2. Key Features

- **Authoritative ESP32 Architecture**: The smartphone never commands actuators directly; the ESP32 validates safety conditions (neutral gear, clutch/brake pedal, seat presence, E-stop, battery health) before permitting engine crank.
- **Two-Stage Push Start**:
  - **1st Push**: Energizes Cab Ignition & Accessory Relays (12.4V).
  - **2nd Push**: Engages Starter Solenoid (1.5s crank pulse) -> Transitions to 850 RPM Diesel Idle (14.2V Alternator charging).
  - **Running**: Push to stop engine cleanly.
- **Proximity & Auto-Cutoff**:
  - Continuous BLE RSSI tracking with Exponential Moving Average (EMA) smoothing.
  - Automatic grace period countdown (10s–60s) with audible alarm when operator walks away while engine is running.
- **Challenge-Response Security**: Anti-replay nonce exchange with HMAC-SHA256 signatures; never relies only on MAC addresses.
- **Full Hardware Simulator**: Interactive drawer to test distance walking, gear interlocks, voltage drops, and accelerometer tamper alerts without physical hardware.

---

## 3. BLE GATT Specifications & UUIDs

The app communicates with the ESP32 using the following custom 128-bit GATT Service:

| Characteristic | UUID | Properties | Purpose |
| :--- | :--- | :--- | :--- |
| **GATT Service** | `0000ffa0-0000-1000-8000-00805f9b34fb` | Primary | Tractor Cab Controller Service |
| **Auth Characteristic** | `0000ffa1-0000-1000-8000-00805f9b34fb` | Read, Write | Challenge-Response Handshake |
| **Command Characteristic** | `0000ffa2-0000-1000-8000-00805f9b34fb` | WriteWithResponse | Ignition, Crank, Lock, Hazards |
| **Status Characteristic** | `0000ffa3-0000-1000-8000-00805f9b34fb` | Read, Notify | Real-time RPM, Voltage, Proximity |
| **Config Characteristic** | `0000ffa4-0000-1000-8000-00805f9b34fb` | Read, Write | Thresholds & Grace Periods |
| **Alert Characteristic** | `0000ffa5-0000-1000-8000-00805f9b34fb` | Notify | Tamper vibration, Safety blocks |

---

## 4. Connecting Real ESP32 Firmware

To connect with physical hardware:
1. Flash your ESP32 with the corresponding GATT services matching `src/types/ble.ts`.
2. Toggle the **Execution Mode** from *Simulator* to *Physical Web Bluetooth* in the Settings tab.
3. Open the **Pairing Wizard** or tap the Bluetooth pill in the top navigation bar.
4. Select your advertising ESP32 beacon (`TRACTOR_ESP32_XXXX`) and complete the 6-digit PIN handshake.
