import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    hello: "Hello, Citizen.",
    tagline: "Help us build a better nation by reporting unfinished projects securely.",
    pending_reports: "Pending Reports",
    no_pending: "No pending reports",
    upload_securely: "Upload Securely",
    privacy_first: "Privacy First",
    privacy_desc: "All photos are stripped of metadata. You can blur faces before saving.",
    new_report: "New Report",
    cancel: "Cancel",
    save: "Save",
    take_evidence: "Take Evidence Photo",
    take_evidence_desc: "Capture the unfinished infrastructure. Ensure good lighting.",
    open_camera: "Open Camera",
    blur_tooltip: "Tap or drag to blur details",
    retake: "Retake Photo",
    syncing_evidence: "Syncing Evidence",
    status_connecting: "Establishing secure connection...",
    status_encrypting: "Encrypting packets...",
    status_uploading: "Uploading to secure node...",
    status_verifying: "Verifying integrity...",
    status_success: "Evidence successfully uploaded.",
    confirm_delete: "Delete this report?",
    confirm_discard: "Discard this report?",
    sentiment_label: "Additional Details (Optional)",
    sentiment_placeholder: "Describe what you see or how you feel about this...",
    transparency_title: "Flood Control Tracker",
    transparency_desc: "Monitor government projects",
    total_projects: "Total Projects",
    total_contract_cost: "Total Contract Cost",
    unique_contractors: "Unique Contractors",
    visual: "Visual",
    table: "Table",
    cost_by_region: "Cost Distribution by Region",
    projects_by_contractor: "Projects by Contractor",
    project_desc: "Project Description",
    location: "Location",
    contractor: "Contractor",
    cost: "Cost (PHP)",
    date: "Date"
  },
  tl: {
    hello: "Kumusta, Kababayan.",
    tagline: "Tulungan kaming bumuo ng mas mabuting bansa sa pamamagitan ng ligtas na pag-uulat ng mga hindi tapos na proyekto.",
    pending_reports: "Mga Nakabinbing Ulat",
    no_pending: "Walang nakabinbing ulat",
    upload_securely: "I-upload nang Ligtas",
    privacy_first: "Pagkapribado Una",
    privacy_desc: "Ang lahat ng larawan ay tinatanggalan ng metadata. Maaari mong labuin ang mga mukha bago i-save.",
    new_report: "Bagong Ulat",
    cancel: "Kanselahin",
    save: "I-save",
    take_evidence: "Kumuha ng Litrato",
    take_evidence_desc: "Kunan ang hindi tapos na imprastraktura. Siguraduhing maliwanag.",
    open_camera: "Buksan ang Kamera",
    blur_tooltip: "Pindutin o i-drag upang labuin",
    retake: "Kunan Ulit",
    syncing_evidence: "Nagsi-sync ng Ebidensya",
    status_connecting: "Nagtatatag ng ligtas na koneksyon...",
    status_encrypting: "Ina-encrypt ang mga packet...",
    status_uploading: "Ina-upload sa secure node...",
    status_verifying: "Bina-verify ang integridad...",
    status_success: "Matagumpay na na-upload ang ebidensya.",
    confirm_delete: "Burahin ang ulat na ito?",
    confirm_discard: "Itapon ang ulat na ito?",
    sentiment_label: "Karagdagang Detalye (Opsyonal)",
    sentiment_placeholder: "Ilarawan ang iyong nakikita o ang iyong nararamdaman tungkol dito...",
    transparency_title: "Flood Control Tracker",
    transparency_desc: "Bantayan ang mga proyekto ng gobyerno",
    total_projects: "Kabuuang Proyekto",
    total_contract_cost: "Kabuuang Halaga ng Kontrata",
    unique_contractors: "Mga Natatanging Kontratista",
    visual: "Biswal",
    table: "Talahanayan",
    cost_by_region: "Pamamahagi ng Gastos bawat Rehiyon",
    projects_by_contractor: "Mga Proyekto bawat Kontratista",
    project_desc: "Paglalarawan ng Proyekto",
    location: "Lokasyon",
    contractor: "Kontratista",
    cost: "Halaga (PHP)",
    date: "Petsa"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tl');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'tl' ? 'en' : 'tl');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);