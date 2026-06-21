# HealthOS ERP Portal — Design System & Layout Specifications

This document defines the core design tokens, layout specifications, and interface structures for the **HealthOS ERP Portal**, derived directly from the Stitch canvas specifications.

---

## 1. Core Visual Tokens

### A. Color Palette & Gradients
The visual identity utilizes a premium, clinical clinical theme anchored by metallic emerald greens and high-contrast typography.

*   **Primary Accent Gradient (Premium Metallic Emerald)**:
    *   **Start Color**: `#015C3D` (Deep Metallic Forest Green)
    *   **End Color**: `#029C6B` (Vibrant Emerald Green)
    *   **Gradient Formula**: `linear-gradient(135deg, #015C3D 0%, #029C6B 100%)`
    *   **Usage**: Used for active icons, key call-to-actions, brand identity text fills, status badges, and primary interactive hover states.
*   **Container & Card Backgrounds**:
    *   **Base Surface**: Pure White (`#FFFFFF`) for all content panels, interactive role cards, and dashboard workspaces.
    *   **Secondary Background Framing**: Off-White/Ice-Blue (`#F7F9FF` / `#F8FAFC`) to create high-end visual layering and reduce eye strain.
*   **Typography & Details**:
    *   **Primary Content Text**: Deep Obsidian-Slate (`#0F172A` / `#181C20`) for clinical high-contrast readability.
    *   **Secondary Metadata Text**: Slate Grey (`#3E4A3D` / `#64748B`) for helper text, labels, and icons.
*   **Borders & Dividers**:
    *   **Card Borders**: Light Tan-Gold Accent (`#D4C4A8`) or Soft Slate (`#E2E8F0` / `#E5E7EB`).

### B. Typography Hierarchy
The typography system uses **Plus Jakarta Sans** and **Inter** for clean, medical-grade legibility:
*   **Display-LG**: `48px` / Line Height `56px` / Weight `800` / Letter-Spacing `-0.02em`
*   **Headline-LG**: `32px` / Line Height `40px` / Weight `700` / Letter-Spacing `-0.01em`
*   **Headline-MD**: `24px` / Line Height `32px` / Weight `700`
*   **Body-LG**: `18px` / Line Height `28px` / Weight `500`
*   **Body-MD**: `16px` / Line Height `24px` / Weight `400`
*   **Label-LG**: `14px` / Line Height `20px` / Weight `700` / Letter-Spacing `0.05em`
*   **Label-MD**: `12px` / Line Height `16px` / Weight `600`

### C. Shapes & Elevation
*   **Border Radius**:
    *   **Small (Buttons, Inputs)**: `rounded-sm` / `0.125rem`
    *   **Medium (Cards, Inner Components)**: `rounded-lg` / `0.25rem` or `0.5rem`
    *   **Large (Containers, Sidebars)**: `rounded-xl` / `0.5rem` or `0.75rem`
*   **Elevation & Depth**:
    *   Ambient shadows (`shadow-sm`, `shadow-md`, `shadow-xl`) to elevate white cards from light-grey backing layout layers.

---

## 2. Canvas Screens & Layouts

The Stitch Canvas defines 5 core interactive environments mapped across Desktop and Mobile form factors:

### 1. Portal Gateway (`/`)
*   **Device Profiles**: Desktop (2560px × 2666px) & Mobile (780px × 3296px)
*   **Layout**: Balanced 12-column grid on desktop, transitioning to a single-column scroll on mobile. Uses a bento-grid structure for authorization roles.
*   **Key Modules**:
    *   **Top App Bar**: Sticky white background, logo brand signature with Emerald Fill, and prominent `EMERGENCY SOS` action button.
    *   **Role Selection Bento**: Five authorization entry points styled as elevation cards:
        1.  *Patient Portal*: Medical history, appointments, results.
        2.  *Clinical Dashboard*: Stethoscope accent, prescription portal.
        3.  *Hospital Administration*: Facility operations, staff credentialing.
        4.  *Laboratory Network*: Test queues, pathology result input.
        5.  *Platform Infrastructure*: Audits, global configuration, system parameters.

### 2. Patient Portal (`/patient`)
*   **Device Profiles**: Desktop & Mobile responsive layout.
*   **Layout**: Split 2-column sidebar layout.
*   **Key Modules**:
    *   **Health Score Gauge**: Circular metric charting overall wellness metrics.
    *   **Vitals Grid**: Real-time trackers for Heart Rate, Blood Pressure, SpO2, and Temperature.
    *   **Longitudinal History**: Time-series log detailing conditions, diagnoses, and allergies.

### 3. Doctor Workspace (`/doctor`)
*   **Device Profiles**: Desktop (2560px × 2048px) & Mobile (780px × 1768px)
*   **Layout**: 3-column split console (Queue, EHR Viewer, Digital Prescription Module) for optimized clinical speed.
*   **Key Modules**:
    *   **Patient Consultation Queue**: Left column displaying scheduled, in-progress, and completed consultations.
    *   **EHR Viewer**: Central panel displaying structured clinical notes, active medications, and historic lab reports.
    *   **Digital Prescription Composer**: Right column with rapid-add fields for medicines, dosage rates, and pharmacy routing.

### 4. Hospital & Lab Admin (`/admin`)
*   **Device Profiles**: Desktop (2560px × 2048px) & Mobile (780px × 2890px)
*   **Layout**: Responsive grid dashboard showing real-time facility logistics.
*   **Key Modules**:
    *   **Ward & Bed Grid**: Visual representation of active occupancy, admissions, and pending discharges.
    *   **Lab Requisition Queue**: List of pending blood, pathology, and imaging tests with urgent flagging.
    *   **Operations KPI Cards**: Dynamic metrics tracking operational throughput.

### 5. Platform Super-Admin (`/super-admin`)
*   **Device Profiles**: Desktop (2560px × 2196px) & Mobile (780px × 3326px)
*   **Layout**: Clean administration panel with status streams.
*   **Key Modules**:
    *   **System Integrity KPI Row**: Global platform performance metrics.
    *   **Credential Verification Pipeline**: Multi-step authorization queue for reviewing and approving registered practitioners.
    *   **System Logs Terminal**: Embedded simulator outputting access and activity streams.

---

## 3. Implementation Standards

*   **Responsive Scaling**: All panels use fluid Tailwind spacing with container bounds capped at `1280px` (`max-w-container-max`).
*   **Interactive Hover Effects**: White container cards use translation transitions (`hover:-translate-y-1 duration-300`) and border glow effects to guide user interaction.
*   **Iconography**: Standardized on Google Material Symbols Outlined with custom fill settings.
