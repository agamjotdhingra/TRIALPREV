import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  patientsTable,
  doctorsTable,
  appointmentsTable,
  admissionsTable,
  bedsTable,
  wardsTable,
  hospitalsTable,
  reportsTable,
  notificationsTable,
  staffTable,
  labsTable,
  prescriptionsTable,
} from "@workspace/db";

const router: IRouter = Router();

type ResponseType = "stat" | "table" | "list" | "text" | "multi";

interface ChatResponse {
  message: string;
  type: ResponseType;
  data?: Record<string, unknown>[] | Record<string, unknown>;
  columns?: { key: string; label: string }[];
  stats?: { label: string; value: string | number; color?: string }[];
  suggestions: string[];
}

function matches(text: string, ...patterns: (string | RegExp)[]): boolean {
  const t = text.toLowerCase();
  return patterns.some((p) =>
    typeof p === "string" ? t.includes(p.toLowerCase()) : p.test(t)
  );
}

function riskColor(level: string | null): string {
  if (level === "critical") return "red";
  if (level === "high") return "orange";
  if (level === "moderate") return "yellow";
  return "green";
}

async function resolveIntent(message: string): Promise<ChatResponse> {
  const m = message.toLowerCase().trim();

  // ── OVERVIEW / DASHBOARD ─────────────────────────────────────────────────
  if (matches(m, "overview", "dashboard", "summary", "stats", "statistics", "how many", "total count")) {
    const [patients, doctors, hospitals, labs, appointments, reports, beds, staff] = await Promise.all([
      db.select().from(patientsTable),
      db.select().from(doctorsTable),
      db.select().from(hospitalsTable),
      db.select().from(labsTable),
      db.select().from(appointmentsTable),
      db.select().from(reportsTable),
      db.select().from(bedsTable),
      db.select().from(staffTable),
    ]);
    const today = new Date().toISOString().split("T")[0];
    const critical = patients.filter((p) => p.riskLevel === "critical").length;
    const todayAppts = appointments.filter((a) => a.scheduledDate === today).length;
    const availBeds = beds.filter((b) => b.status === "available").length;
    return {
      message: `Here's the platform overview as of today (${today}):`,
      type: "multi",
      stats: [
        { label: "Total Patients", value: patients.length, color: "blue" },
        { label: "Doctors", value: doctors.length, color: "indigo" },
        { label: "Hospitals", value: hospitals.length, color: "purple" },
        { label: "Labs", value: labs.length, color: "teal" },
        { label: "Critical Patients", value: critical, color: "red" },
        { label: "Today's Appointments", value: todayAppts, color: "orange" },
        { label: "Available Beds", value: availBeds, color: "green" },
        { label: "Staff Members", value: staff.length, color: "slate" },
        { label: "Total Reports", value: reports.length, color: "cyan" },
        { label: "Total Appointments", value: appointments.length, color: "violet" },
      ],
      suggestions: [
        "Show critical patients",
        "List available beds",
        "Today's appointments",
        "Show unread alerts",
      ],
    };
  }

  // ── CRITICAL / HIGH RISK PATIENTS ────────────────────────────────────────
  if (matches(m, "critical patient", "most critical", "danger", "emergency patient")) {
    const rows = await db.select().from(patientsTable);
    const critical = rows.filter((p) => p.riskLevel === "critical");
    return {
      message: critical.length > 0
        ? `Found ${critical.length} critical patient(s) requiring immediate attention:`
        : "No critical patients currently registered.",
      type: "table",
      data: critical.map((p) => ({
        "Health ID": p.healthId,
        Name: p.fullName,
        Age: p.age,
        Gender: p.gender,
        "Blood Group": p.bloodGroup,
        "Health Score": p.healthScore,
        "Conditions": p.existingDiseases || p.chronicDiseases || "—",
        Mobile: p.mobile,
      })),
      columns: [
        { key: "Health ID", label: "Health ID" },
        { key: "Name", label: "Name" },
        { key: "Age", label: "Age" },
        { key: "Blood Group", label: "Blood" },
        { key: "Health Score", label: "Score" },
        { key: "Conditions", label: "Conditions" },
        { key: "Mobile", label: "Mobile" },
      ],
      suggestions: ["Show high risk patients", "List ICU patients", "Show critical reports"],
    };
  }

  if (matches(m, "high risk", "high-risk", "moderate risk")) {
    const level = matches(m, "moderate") ? "moderate" : "high";
    const rows = await db.select().from(patientsTable);
    const filtered = rows.filter((p) => p.riskLevel === level);
    return {
      message: `Found ${filtered.length} patient(s) with ${level} risk level:`,
      type: "table",
      data: filtered.map((p) => ({
        "Health ID": p.healthId,
        Name: p.fullName,
        Age: p.age,
        "Blood Group": p.bloodGroup,
        "Health Score": p.healthScore,
        "Conditions": p.existingDiseases || "—",
      })),
      columns: [
        { key: "Health ID", label: "Health ID" },
        { key: "Name", label: "Name" },
        { key: "Age", label: "Age" },
        { key: "Blood Group", label: "Blood" },
        { key: "Health Score", label: "Score" },
        { key: "Conditions", label: "Conditions" },
      ],
      suggestions: ["Show critical patients", "Show healthy patients"],
    };
  }

  // ── ALL PATIENTS / LIST ───────────────────────────────────────────────────
  if (matches(m, "list all patient", "show all patient", "all patient", "every patient")) {
    const rows = await db.select().from(patientsTable);
    return {
      message: `Total ${rows.length} patient(s) registered on the platform:`,
      type: "table",
      data: rows.map((p) => ({
        "Health ID": p.healthId,
        Name: p.fullName,
        Age: p.age,
        Gender: p.gender,
        "Blood Group": p.bloodGroup,
        "Score": p.healthScore,
        "Risk": p.riskLevel ?? "healthy",
        Mobile: p.mobile,
      })),
      columns: [
        { key: "Health ID", label: "Health ID" },
        { key: "Name", label: "Name" },
        { key: "Age", label: "Age" },
        { key: "Gender", label: "Gender" },
        { key: "Blood Group", label: "Blood" },
        { key: "Score", label: "Score" },
        { key: "Risk", label: "Risk" },
      ],
      suggestions: ["Show critical patients", "Find patient by blood group O+", "How many patients have diabetes?"],
    };
  }

  // ── PATIENT COUNT ─────────────────────────────────────────────────────────
  if (matches(m, "how many patient", "patient count", "total patient", "number of patient")) {
    const rows = await db.select().from(patientsTable);
    const byRisk = { healthy: 0, moderate: 0, high: 0, critical: 0 };
    rows.forEach((p) => {
      const k = (p.riskLevel ?? "healthy") as keyof typeof byRisk;
      if (k in byRisk) byRisk[k]++;
    });
    return {
      message: `There are ${rows.length} patients registered on the platform.`,
      type: "multi",
      stats: [
        { label: "Total Patients", value: rows.length, color: "blue" },
        { label: "Healthy (80–100)", value: byRisk.healthy, color: "green" },
        { label: "Moderate (60–79)", value: byRisk.moderate, color: "yellow" },
        { label: "High Risk (40–59)", value: byRisk.high, color: "orange" },
        { label: "Critical (<40)", value: byRisk.critical, color: "red" },
      ],
      suggestions: ["Show critical patients", "List all patients", "Show risk distribution"],
    };
  }

  // ── SEARCH PATIENT BY DISEASE / CONDITION ────────────────────────────────
  const diseaseMatch = m.match(/(?:patients? (?:with|having|who have)|who have|having)\s+(.+)/);
  if (diseaseMatch || matches(m, "diabetic patient", "hypertension patient", "cancer patient", "kidney patient", "heart patient", "asthma patient")) {
    let term = "";
    if (diseaseMatch) term = diseaseMatch[1].trim();
    else if (matches(m, "diabetic", "diabetes")) term = "diabetes";
    else if (matches(m, "hypertension")) term = "hypertension";
    else if (matches(m, "cancer", "oncology")) term = "cancer";
    else if (matches(m, "kidney", "renal", "ckd")) term = "kidney";
    else if (matches(m, "heart", "cardiac", "cardio")) term = "heart";
    else if (matches(m, "asthma")) term = "asthma";

    const rows = await db.select().from(patientsTable);
    const filtered = rows.filter((p) =>
      [p.existingDiseases, p.chronicDiseases, p.previousConditions]
        .some((f) => f?.toLowerCase().includes(term.toLowerCase()))
    );
    return {
      message: filtered.length > 0
        ? `Found ${filtered.length} patient(s) with condition matching "${term}":` 
        : `No patients found with condition matching "${term}".`,
      type: "table",
      data: filtered.map((p) => ({
        "Health ID": p.healthId,
        Name: p.fullName,
        Age: p.age,
        "Blood Group": p.bloodGroup,
        Conditions: p.existingDiseases || p.chronicDiseases || "—",
        Risk: p.riskLevel ?? "healthy",
        "Score": p.healthScore,
      })),
      columns: [
        { key: "Health ID", label: "Health ID" },
        { key: "Name", label: "Name" },
        { key: "Age", label: "Age" },
        { key: "Conditions", label: "Conditions" },
        { key: "Risk", label: "Risk" },
        { key: "Score", label: "Score" },
      ],
      suggestions: ["Show critical patients", "Patients with hypertension", "Show all patients"],
    };
  }

  // ── BLOOD GROUP ───────────────────────────────────────────────────────────
  const bgMatch = m.match(/blood\s*(?:group|type)?\s*(o\+|o-|a\+|a-|b\+|b-|ab\+|ab-)/i);
  if (bgMatch) {
    const bg = bgMatch[1].toUpperCase();
    const rows = await db.select().from(patientsTable);
    const filtered = rows.filter((p) => p.bloodGroup.toUpperCase() === bg);
    return {
      message: `Found ${filtered.length} patient(s) with blood group ${bg}:`,
      type: "table",
      data: filtered.map((p) => ({
        "Health ID": p.healthId,
        Name: p.fullName,
        Age: p.age,
        Mobile: p.mobile,
        Risk: p.riskLevel ?? "healthy",
      })),
      columns: [
        { key: "Health ID", label: "Health ID" },
        { key: "Name", label: "Name" },
        { key: "Age", label: "Age" },
        { key: "Mobile", label: "Mobile" },
        { key: "Risk", label: "Risk" },
      ],
      suggestions: ["Blood group A+", "Blood group B+", "Critical patients"],
    };
  }

  // ── SMOKERS / ALCOHOL ─────────────────────────────────────────────────────
  if (matches(m, "smoker", "smoking", "smokes")) {
    const rows = await db.select().from(patientsTable);
    const filtered = rows.filter((p) => p.smokingStatus?.toLowerCase() === "yes");
    return {
      message: `${filtered.length} patient(s) are recorded as smokers:`,
      type: "table",
      data: filtered.map((p) => ({ "Health ID": p.healthId, Name: p.fullName, Age: p.age, Risk: p.riskLevel ?? "—" })),
      columns: [{ key: "Health ID", label: "Health ID" }, { key: "Name", label: "Name" }, { key: "Age", label: "Age" }, { key: "Risk", label: "Risk" }],
      suggestions: ["Patients who drink alcohol", "High risk patients"],
    };
  }

  if (matches(m, "alcohol", "drinker", "drinks")) {
    const rows = await db.select().from(patientsTable);
    const filtered = rows.filter((p) => p.alcoholConsumption?.toLowerCase() === "yes");
    return {
      message: `${filtered.length} patient(s) consume alcohol:`,
      type: "table",
      data: filtered.map((p) => ({ "Health ID": p.healthId, Name: p.fullName, Age: p.age, Risk: p.riskLevel ?? "—" })),
      columns: [{ key: "Health ID", label: "Health ID" }, { key: "Name", label: "Name" }, { key: "Age", label: "Age" }, { key: "Risk", label: "Risk" }],
      suggestions: ["Patients who smoke", "High risk patients"],
    };
  }

  // ── ELDERLY PATIENTS ──────────────────────────────────────────────────────
  if (matches(m, "elderly", "old patient", "senior", "aged patient", "above 60", "over 60")) {
    const rows = await db.select().from(patientsTable);
    const filtered = rows.filter((p) => (p.age ?? 0) >= 60);
    return {
      message: `Found ${filtered.length} patient(s) aged 60 or above:`,
      type: "table",
      data: filtered.map((p) => ({
        "Health ID": p.healthId, Name: p.fullName, Age: p.age,
        Conditions: p.existingDiseases || "—", Risk: p.riskLevel ?? "healthy",
      })),
      columns: [
        { key: "Health ID", label: "Health ID" }, { key: "Name", label: "Name" },
        { key: "Age", label: "Age" }, { key: "Conditions", label: "Conditions" }, { key: "Risk", label: "Risk" },
      ],
      suggestions: ["Critical patients", "Patients with hypertension"],
    };
  }

  // ── DOCTORS ───────────────────────────────────────────────────────────────
  if (matches(m, "how many doctor", "doctor count", "total doctor", "number of doctor")) {
    const rows = await db.select().from(doctorsTable);
    const approved = rows.filter((d) => d.verificationStatus === "approved").length;
    const pending = rows.filter((d) => d.verificationStatus === "pending").length;
    return {
      message: `There are ${rows.length} doctors on the platform.`,
      type: "multi",
      stats: [
        { label: "Total Doctors", value: rows.length, color: "blue" },
        { label: "Approved", value: approved, color: "green" },
        { label: "Pending Verification", value: pending, color: "orange" },
      ],
      suggestions: ["List all doctors", "Pending verification doctors", "Doctors by specialization"],
    };
  }

  if (matches(m, "list doctor", "show doctor", "all doctor", "every doctor")) {
    const rows = await db.select().from(doctorsTable);
    return {
      message: `${rows.length} doctor(s) registered on the platform:`,
      type: "table",
      data: rows.map((d) => ({
        Name: d.fullName, Specialization: d.specialization,
        Experience: `${d.yearsOfExperience} yrs`, Status: d.verificationStatus,
        Fee: d.consultationFees ? `₹${d.consultationFees}` : "—",
        Mobile: d.mobile,
      })),
      columns: [
        { key: "Name", label: "Doctor" }, { key: "Specialization", label: "Specialization" },
        { key: "Experience", label: "Experience" }, { key: "Status", label: "Status" },
        { key: "Fee", label: "Consult Fee" }, { key: "Mobile", label: "Mobile" },
      ],
      suggestions: ["Pending verification doctors", "Cardiologists", "Neurologists"],
    };
  }

  if (matches(m, "pending doctor", "pending verification", "unverified doctor")) {
    const rows = await db.select().from(doctorsTable);
    const pending = rows.filter((d) => d.verificationStatus === "pending");
    return {
      message: pending.length > 0
        ? `${pending.length} doctor(s) awaiting verification:`
        : "No doctors pending verification.",
      type: "table",
      data: pending.map((d) => ({
        Name: d.fullName, Specialization: d.specialization,
        Experience: `${d.yearsOfExperience} yrs`, License: d.licenseNumber || "—",
      })),
      columns: [
        { key: "Name", label: "Doctor" }, { key: "Specialization", label: "Specialization" },
        { key: "Experience", label: "Experience" }, { key: "License", label: "License #" },
      ],
      suggestions: ["List all doctors", "Approved doctors"],
    };
  }

  const specMatch = m.match(/(?:cardio|neuro|ortho|oncol|pediatric|endocrin|general medicine|gynaecol|dermatol)/i);
  if (specMatch || matches(m, "cardiologist", "neurologist", "orthopedic", "oncologist", "pediatrician", "endocrinologist")) {
    let spec = "";
    if (matches(m, "cardio")) spec = "cardiology";
    else if (matches(m, "neuro")) spec = "neurology";
    else if (matches(m, "ortho")) spec = "orthopedics";
    else if (matches(m, "oncol")) spec = "oncology";
    else if (matches(m, "pediatric")) spec = "pediatrics";
    else if (matches(m, "endocrin")) spec = "endocrinology";
    else if (matches(m, "general medicine")) spec = "general medicine";

    const rows = await db.select().from(doctorsTable);
    const filtered = rows.filter((d) => d.specialization.toLowerCase().includes(spec));
    return {
      message: filtered.length > 0
        ? `Found ${filtered.length} doctor(s) in ${spec}:`
        : `No doctors found with specialization matching "${spec}".`,
      type: "table",
      data: filtered.map((d) => ({
        Name: d.fullName, Experience: `${d.yearsOfExperience} yrs`,
        Status: d.verificationStatus, Fee: d.consultationFees ? `₹${d.consultationFees}` : "—",
      })),
      columns: [
        { key: "Name", label: "Doctor" }, { key: "Experience", label: "Experience" },
        { key: "Status", label: "Status" }, { key: "Fee", label: "Consult Fee" },
      ],
      suggestions: ["List all doctors", "Today's appointments"],
    };
  }

  // ── APPOINTMENTS ──────────────────────────────────────────────────────────
  if (matches(m, "today", "appointment today", "today appointment", "today's appointment", "scheduled today")) {
    const today = new Date().toISOString().split("T")[0];
    const all = await db.select().from(appointmentsTable);
    const todayAppts = all.filter((a) => a.scheduledDate === today);

    const enriched = await Promise.all(todayAppts.map(async (a) => {
      const [pat] = await db.select().from(patientsTable).where(eq(patientsTable.id, a.patientId));
      const [doc] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, a.doctorId));
      return {
        Time: a.scheduledTime,
        Patient: pat?.fullName || `#${a.patientId}`,
        Doctor: doc?.fullName || `#${a.doctorId}`,
        Type: a.consultationType || "In-person",
        Status: a.status,
        Reason: a.reason || "—",
      };
    }));

    enriched.sort((a, b) => a.Time.localeCompare(b.Time));
    return {
      message: `${enriched.length} appointment(s) scheduled for today (${today}):`,
      type: "table",
      data: enriched,
      columns: [
        { key: "Time", label: "Time" }, { key: "Patient", label: "Patient" },
        { key: "Doctor", label: "Doctor" }, { key: "Type", label: "Type" },
        { key: "Status", label: "Status" }, { key: "Reason", label: "Reason" },
      ],
      suggestions: ["Upcoming appointments", "Completed appointments today"],
    };
  }

  if (matches(m, "upcoming appointment", "scheduled appointment", "future appointment")) {
    const today = new Date().toISOString().split("T")[0];
    const all = await db.select().from(appointmentsTable);
    const upcoming = all.filter((a) => a.scheduledDate >= today && a.status === "scheduled");
    return {
      message: `${upcoming.length} upcoming appointment(s):`,
      type: "table",
      data: upcoming.map((a) => ({
        Date: a.scheduledDate, Time: a.scheduledTime,
        "Patient ID": a.patientId, "Doctor ID": a.doctorId,
        Type: a.consultationType || "In-person", Reason: a.reason || "—",
      })),
      columns: [
        { key: "Date", label: "Date" }, { key: "Time", label: "Time" },
        { key: "Patient ID", label: "Patient" }, { key: "Doctor ID", label: "Doctor" },
        { key: "Type", label: "Type" }, { key: "Reason", label: "Reason" },
      ],
      suggestions: ["Today's appointments", "Cancelled appointments"],
    };
  }

  if (matches(m, "cancelled appointment", "cancel appointment")) {
    const all = await db.select().from(appointmentsTable);
    const cancelled = all.filter((a) => a.status === "cancelled");
    return {
      message: `${cancelled.length} cancelled appointment(s) found.`,
      type: "table",
      data: cancelled.map((a) => ({
        Date: a.scheduledDate, Time: a.scheduledTime,
        "Patient ID": a.patientId, "Doctor ID": a.doctorId, Reason: a.reason || "—",
      })),
      columns: [
        { key: "Date", label: "Date" }, { key: "Time", label: "Time" },
        { key: "Patient ID", label: "Patient" }, { key: "Reason", label: "Reason" },
      ],
      suggestions: ["Today's appointments", "Upcoming appointments"],
    };
  }

  if (matches(m, "how many appointment", "total appointment", "appointment count")) {
    const all = await db.select().from(appointmentsTable);
    const today = new Date().toISOString().split("T")[0];
    return {
      message: `Total appointment breakdown across the platform:`,
      type: "multi",
      stats: [
        { label: "Total Appointments", value: all.length, color: "blue" },
        { label: "Today", value: all.filter((a) => a.scheduledDate === today).length, color: "orange" },
        { label: "Scheduled", value: all.filter((a) => a.status === "scheduled").length, color: "indigo" },
        { label: "Completed", value: all.filter((a) => a.status === "completed").length, color: "green" },
        { label: "Cancelled", value: all.filter((a) => a.status === "cancelled").length, color: "red" },
      ],
      suggestions: ["Today's appointments", "Upcoming appointments"],
    };
  }

  // ── BED / WARD ────────────────────────────────────────────────────────────
  if (matches(m, "available bed", "free bed", "empty bed", "bed available", "vacancy", "bed count", "bed status", "how many bed")) {
    const beds = await db.select().from(bedsTable);
    const wards = await db.select().from(wardsTable);
    const available = beds.filter((b) => b.status === "available").length;
    const occupied = beds.filter((b) => b.status === "occupied").length;
    const wardSummary = await Promise.all(wards.map(async (w) => {
      const wardBeds = beds.filter((b) => b.wardId === w.id);
      const avail = wardBeds.filter((b) => b.status === "available").length;
      return {
        Ward: w.name, Type: w.wardType, "Total Beds": w.totalBeds,
        Available: avail, Occupied: wardBeds.length - avail,
        "Occupancy %": wardBeds.length ? `${Math.round(((wardBeds.length - avail) / wardBeds.length) * 100)}%` : "—",
      };
    }));
    return {
      message: `Bed status: ${available} available, ${occupied} occupied out of ${beds.length} total beds.`,
      type: "table",
      data: wardSummary,
      columns: [
        { key: "Ward", label: "Ward" }, { key: "Type", label: "Type" },
        { key: "Total Beds", label: "Total" }, { key: "Available", label: "Available" },
        { key: "Occupied", label: "Occupied" }, { key: "Occupancy %", label: "Occupancy" },
      ],
      suggestions: ["Show ICU beds", "Ward capacity", "Admitted patients"],
    };
  }

  if (matches(m, "icu bed", "icu capacity", "icu ward")) {
    const wards = await db.select().from(wardsTable);
    const icuWards = wards.filter((w) => w.wardType === "icu");
    const beds = await db.select().from(bedsTable);
    const data = icuWards.map((w) => {
      const wb = beds.filter((b) => b.wardId === w.id);
      return {
        Ward: w.name, "Total Beds": w.totalBeds,
        Available: wb.filter((b) => b.status === "available").length,
        Occupied: wb.filter((b) => b.status === "occupied").length,
      };
    });
    return {
      message: `ICU ward capacity summary (${icuWards.length} ICU ward(s)):`,
      type: "table",
      data,
      columns: [
        { key: "Ward", label: "ICU Ward" }, { key: "Total Beds", label: "Total Beds" },
        { key: "Available", label: "Available" }, { key: "Occupied", label: "Occupied" },
      ],
      suggestions: ["Show all wards", "ICU patients", "Available beds"],
    };
  }

  if (matches(m, "ward status", "ward capacity", "show ward", "list ward", "ward occupancy")) {
    const wards = await db.select().from(wardsTable);
    const hospitals = await db.select().from(hospitalsTable);
    return {
      message: `${wards.length} ward(s) across all hospitals:`,
      type: "table",
      data: wards.map((w) => {
        const hosp = hospitals.find((h) => h.id === w.hospitalId);
        return {
          Ward: w.name, Hospital: hosp?.name || `#${w.hospitalId}`,
          Type: w.wardType, "Total": w.totalBeds,
          "Occupied": w.occupiedBeds, "Available": w.availableBeds,
          "Occupancy %": w.totalBeds ? `${Math.round((w.occupiedBeds / w.totalBeds) * 100)}%` : "—",
        };
      }),
      columns: [
        { key: "Ward", label: "Ward" }, { key: "Hospital", label: "Hospital" },
        { key: "Type", label: "Type" }, { key: "Total", label: "Total" },
        { key: "Occupied", label: "Occupied" }, { key: "Available", label: "Available" },
        { key: "Occupancy %", label: "Occupancy" },
      ],
      suggestions: ["Available beds", "ICU capacity", "Hospital overview"],
    };
  }

  // ── ADMISSIONS ────────────────────────────────────────────────────────────
  if (matches(m, "icu patient", "patient in icu", "patients in icu")) {
    const admissions = await db.select().from(admissionsTable);
    const icu = admissions.filter((a) => a.status === "icu");
    const enriched = await Promise.all(icu.map(async (a) => {
      const [pat] = await db.select().from(patientsTable).where(eq(patientsTable.id, a.patientId));
      return {
        "Health ID": pat?.healthId || "—", Patient: pat?.fullName || `#${a.patientId}`,
        "Admitted": a.admissionDate, "Reason": a.admissionReason,
        "Risk": pat?.riskLevel || "—",
      };
    }));
    return {
      message: `${icu.length} patient(s) currently in ICU:`,
      type: "table",
      data: enriched,
      columns: [
        { key: "Health ID", label: "Health ID" }, { key: "Patient", label: "Patient" },
        { key: "Admitted", label: "Admitted" }, { key: "Reason", label: "Reason" }, { key: "Risk", label: "Risk" },
      ],
      suggestions: ["Admitted patients", "Show available beds", "Critical patients"],
    };
  }

  if (matches(m, "admitted patient", "current admission", "inpatient", "show admission", "list admission")) {
    const admissions = await db.select().from(admissionsTable);
    const active = admissions.filter((a) => a.status !== "discharged");
    const enriched = await Promise.all(active.map(async (a) => {
      const [pat] = await db.select().from(patientsTable).where(eq(patientsTable.id, a.patientId));
      const [hosp] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, a.hospitalId));
      return {
        "Health ID": pat?.healthId || "—", Patient: pat?.fullName || `#${a.patientId}`,
        Hospital: hosp?.name || "—", "Admitted On": a.admissionDate,
        Status: a.status, Reason: a.admissionReason,
      };
    }));
    return {
      message: `${active.length} patient(s) currently admitted:`,
      type: "table",
      data: enriched,
      columns: [
        { key: "Health ID", label: "Health ID" }, { key: "Patient", label: "Patient" },
        { key: "Hospital", label: "Hospital" }, { key: "Admitted On", label: "Admitted On" },
        { key: "Status", label: "Status" }, { key: "Reason", label: "Reason" },
      ],
      suggestions: ["ICU patients", "Available beds", "Discharged patients"],
    };
  }

  if (matches(m, "discharged patient", "discharge today")) {
    const today = new Date().toISOString().split("T")[0];
    const admissions = await db.select().from(admissionsTable);
    const discharged = admissions.filter((a) => a.status === "discharged" && a.dischargeDate === today);
    return {
      message: `${discharged.length} patient(s) discharged today (${today}).`,
      type: "table",
      data: discharged.map((a) => ({
        "Patient ID": a.patientId, Hospital: a.hospitalId,
        "Admitted": a.admissionDate, "Discharged": a.dischargeDate, Notes: a.notes || "—",
      })),
      columns: [
        { key: "Patient ID", label: "Patient ID" }, { key: "Admitted", label: "Admitted" },
        { key: "Discharged", label: "Discharged" }, { key: "Notes", label: "Notes" },
      ],
      suggestions: ["Admitted patients", "Available beds after discharge"],
    };
  }

  // ── HOSPITALS ─────────────────────────────────────────────────────────────
  if (matches(m, "hospital overview", "hospital stat", "hospital capacity", "list hospital", "show hospital", "how many hospital")) {
    const hospitals = await db.select().from(hospitalsTable);
    const beds = await db.select().from(bedsTable);
    const admissions = await db.select().from(admissionsTable);
    const data = hospitals.map((h) => {
      const hBeds = beds.filter((b) => {
        // need ward mapping — approximate
        return true;
      });
      const admitted = admissions.filter((a) => a.hospitalId === h.id && a.status !== "discharged").length;
      return {
        Hospital: h.name, "Reg No.": h.registrationNumber,
        "Total Beds": h.totalBeds || "—", "Currently Admitted": admitted,
        Mobile: h.mobile,
      };
    });
    return {
      message: `${hospitals.length} hospital(s) in the network:`,
      type: "table",
      data,
      columns: [
        { key: "Hospital", label: "Hospital" }, { key: "Reg No.", label: "Reg No." },
        { key: "Total Beds", label: "Total Beds" }, { key: "Currently Admitted", label: "Admitted" },
        { key: "Mobile", label: "Contact" },
      ],
      suggestions: ["Ward capacity", "Available beds", "ICU patients"],
    };
  }

  // ── ALERTS ────────────────────────────────────────────────────────────────
  if (matches(m, "alert", "warning", "urgent", "notification")) {
    const notifs = await db.select().from(notificationsTable);
    const unread = notifs.filter((n) => !n.isRead);
    const critical = notifs.filter((n) => n.type.includes("critical"));
    return {
      message: `${unread.length} unread notification(s), ${critical.length} are critical alerts:`,
      type: "table",
      data: notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15).map((n) => ({
        Type: n.type, Title: n.title,
        Message: n.message.length > 80 ? n.message.substring(0, 80) + "…" : n.message,
        Read: n.isRead ? "Yes" : "No",
        Sent: new Date(n.createdAt).toLocaleString(),
      })),
      columns: [
        { key: "Type", label: "Type" }, { key: "Title", label: "Title" },
        { key: "Message", label: "Message" }, { key: "Read", label: "Read" }, { key: "Sent", label: "Sent" },
      ],
      suggestions: ["Critical patients", "Critical lab reports", "Pending verifications"],
    };
  }

  // ── LAB REPORTS ───────────────────────────────────────────────────────────
  if (matches(m, "critical report", "abnormal report", "flagged report")) {
    const reports = await db.select().from(reportsTable);
    const critical = reports.filter((r) => r.isCritical);
    const enriched = await Promise.all(critical.map(async (r) => {
      const [pat] = await db.select().from(patientsTable).where(eq(patientsTable.id, r.patientId));
      const [lab] = await db.select().from(labsTable).where(eq(labsTable.id, r.labId));
      return {
        Patient: pat?.fullName || `#${r.patientId}`,
        Report: r.reportName, Category: r.category,
        Lab: lab?.name || "—",
        Note: r.criticalNote || "—",
        Date: new Date(r.createdAt).toLocaleDateString(),
      };
    }));
    return {
      message: `${critical.length} critical lab report(s) flagged:`,
      type: "table",
      data: enriched,
      columns: [
        { key: "Patient", label: "Patient" }, { key: "Report", label: "Report" },
        { key: "Category", label: "Category" }, { key: "Lab", label: "Lab" },
        { key: "Note", label: "Critical Note" }, { key: "Date", label: "Date" },
      ],
      suggestions: ["Show critical patients", "All lab reports", "Recent notifications"],
    };
  }

  if (matches(m, "lab report", "all report", "list report", "show report")) {
    const reports = await db.select().from(reportsTable);
    const enriched = await Promise.all(reports.map(async (r) => {
      const [pat] = await db.select().from(patientsTable).where(eq(patientsTable.id, r.patientId));
      const [lab] = await db.select().from(labsTable).where(eq(labsTable.id, r.labId));
      return {
        Patient: pat?.fullName || `#${r.patientId}`,
        Report: r.reportName, Category: r.category,
        Lab: lab?.name || "—",
        Critical: r.isCritical ? "⚠️ Yes" : "No",
        Date: new Date(r.createdAt).toLocaleDateString(),
      };
    }));
    return {
      message: `${reports.length} lab report(s) in the system:`,
      type: "table",
      data: enriched,
      columns: [
        { key: "Patient", label: "Patient" }, { key: "Report", label: "Report" },
        { key: "Category", label: "Category" }, { key: "Lab", label: "Lab" },
        { key: "Critical", label: "Critical" }, { key: "Date", label: "Date" },
      ],
      suggestions: ["Critical reports only", "Reports by category"],
    };
  }

  // ── STAFF ─────────────────────────────────────────────────────────────────
  if (matches(m, "staff", "nurse", "technician", "employee")) {
    const allStaff = await db.select().from(staffTable);
    const byRole: Record<string, number> = {};
    allStaff.forEach((s) => { byRole[s.role] = (byRole[s.role] ?? 0) + 1; });
    return {
      message: `${allStaff.length} staff member(s) registered:`,
      type: "multi",
      stats: [
        { label: "Total Staff", value: allStaff.length, color: "blue" },
        ...Object.entries(byRole).map(([role, count]) => ({
          label: role.charAt(0).toUpperCase() + role.slice(1).replace("_", " "),
          value: count,
          color: "indigo",
        })),
      ],
      data: allStaff.map((s) => ({
        "Employee ID": s.employeeId, Name: s.fullName,
        Role: s.role, Qualification: s.qualification,
        Shift: s.assignedShift || "—", Mobile: s.mobile,
      })),
      columns: [
        { key: "Employee ID", label: "ID" }, { key: "Name", label: "Name" },
        { key: "Role", label: "Role" }, { key: "Shift", label: "Shift" }, { key: "Mobile", label: "Mobile" },
      ],
      suggestions: ["Staff on morning shift", "Nurses list", "Staff in ICU"],
    };
  }

  // ── LABS ──────────────────────────────────────────────────────────────────
  if (matches(m, "lab", "laboratory", "diagnostic")) {
    const labs = await db.select().from(labsTable);
    return {
      message: `${labs.length} lab(s) in the network:`,
      type: "table",
      data: labs.map((l) => ({
        Name: l.name, "Reg No.": l.registrationNumber,
        Contact: l.contactPerson, Mobile: l.mobile, Status: l.verificationStatus,
      })),
      columns: [
        { key: "Name", label: "Lab Name" }, { key: "Reg No.", label: "Reg No." },
        { key: "Contact", label: "Contact" }, { key: "Mobile", label: "Mobile" }, { key: "Status", label: "Status" },
      ],
      suggestions: ["Critical lab reports", "Pending lab verification"],
    };
  }

  // ── PRESCRIPTIONS ─────────────────────────────────────────────────────────
  if (matches(m, "prescription", "medicines", "medication")) {
    const rxs = await db.select().from(prescriptionsTable);
    const enriched = await Promise.all(rxs.slice(0, 20).map(async (rx) => {
      const [pat] = await db.select().from(patientsTable).where(eq(patientsTable.id, rx.patientId));
      const [doc] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, rx.doctorId));
      return {
        Date: new Date(rx.createdAt).toLocaleDateString(),
        Patient: pat?.fullName || `#${rx.patientId}`,
        Doctor: doc?.fullName || `#${rx.doctorId}`,
        Diagnosis: rx.diagnosis,
        "Follow-up": rx.followUpDate || "—",
      };
    }));
    return {
      message: `${rxs.length} prescription(s) on record (showing last 20):`,
      type: "table",
      data: enriched,
      columns: [
        { key: "Date", label: "Date" }, { key: "Patient", label: "Patient" },
        { key: "Doctor", label: "Doctor" }, { key: "Diagnosis", label: "Diagnosis" },
        { key: "Follow-up", label: "Follow-up" },
      ],
      suggestions: ["Prescriptions for diabetes", "Critical reports", "Today's appointments"],
    };
  }

  // ── RISK DISTRIBUTION ─────────────────────────────────────────────────────
  if (matches(m, "risk distribution", "risk breakdown", "health score distribution", "patient health breakdown")) {
    const patients = await db.select().from(patientsTable);
    const total = patients.length || 1;
    const counts = { healthy: 0, moderate: 0, high: 0, critical: 0 };
    patients.forEach((p) => {
      const k = (p.riskLevel ?? "healthy") as keyof typeof counts;
      if (k in counts) counts[k]++;
    });
    return {
      message: `Health risk distribution across ${patients.length} patients:`,
      type: "multi",
      stats: [
        { label: `Healthy (80–100)`, value: `${counts.healthy} (${Math.round((counts.healthy / total) * 100)}%)`, color: "green" },
        { label: `Moderate (60–79)`, value: `${counts.moderate} (${Math.round((counts.moderate / total) * 100)}%)`, color: "yellow" },
        { label: `High Risk (40–59)`, value: `${counts.high} (${Math.round((counts.high / total) * 100)}%)`, color: "orange" },
        { label: `Critical (<40)`, value: `${counts.critical} (${Math.round((counts.critical / total) * 100)}%)`, color: "red" },
      ],
      suggestions: ["List critical patients", "List high risk patients", "Show all patients"],
    };
  }

  // ── HELP ──────────────────────────────────────────────────────────────────
  if (matches(m, "help", "what can you", "what do you", "commands", "options", "example", "guide")) {
    return {
      message: "I can answer questions about your hospital's live data. Try asking:",
      type: "list",
      data: [
        { question: "How many patients do we have?" },
        { question: "Show critical patients" },
        { question: "List available beds" },
        { question: "Today's appointments" },
        { question: "ICU patients" },
        { question: "Patients with diabetes" },
        { question: "Blood group O+ patients" },
        { question: "Pending verification doctors" },
        { question: "Critical lab reports" },
        { question: "Ward occupancy status" },
        { question: "Staff and nurses list" },
        { question: "How many beds are available?" },
        { question: "Show all cardiologists" },
        { question: "Show discharge today" },
        { question: "Platform overview" },
        { question: "Risk distribution" },
      ],
      columns: [{ key: "question", label: "Example Questions" }],
      suggestions: ["Platform overview", "Critical patients", "Today's appointments"],
    };
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  return {
    message: `I didn't understand "${message}". I can answer questions about patients, doctors, beds, wards, admissions, appointments, lab reports, staff, hospitals, and prescriptions. Type "help" to see example questions.`,
    type: "text",
    suggestions: ["Platform overview", "Critical patients", "Available beds", "Today's appointments", "Help"],
  };
}

router.post("/chat", async (req, res): Promise<void> => {
  const { message } = req.body as { message?: string };
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }
  const response = await resolveIntent(message.trim());
  res.json(response);
});

export default router;
