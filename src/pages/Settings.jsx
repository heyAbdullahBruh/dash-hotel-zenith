import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import Select from "../../components/ui/Select/Select";
import Toggle from "../../components/ui/Toggle/Toggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUndo,
  faUpload,
  faDownload,
  faBell,
  faEnvelope,
  faPrint,
  faPalette,
  faDatabase,
  faShield,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Settings.module.css";

const settingsSchema = z.object({
  // General Settings
  hotelName: z.string().min(2, "Hotel name is required"),
  hotelEmail: z.string().email("Invalid email address"),
  hotelPhone: z.string().min(10, "Valid phone number required"),
  timezone: z.string(),
  currency: z.string(),
  dateFormat: z.string(),

  // Notification Settings
  emailNotifications: z.boolean().default(true),
  orderNotifications: z.boolean().default(true),
  bookingNotifications: z.boolean().default(true),
  reviewNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),

  // Display Settings
  theme: z.enum(["light", "dark", "auto"]).default("light"),
  language: z.string().default("en"),
  itemsPerPage: z.number().min(5).max(100).default(10),

  // Print Settings
  printLogo: z.boolean().default(true),
  printFooter: z.boolean().default(true),
  printTerms: z.boolean().default(true),
  invoiceTemplate: z.string().default("modern"),

  // Security Settings
  sessionTimeout: z.number().min(5).max(240).default(30),
  passwordPolicy: z.enum(["weak", "medium", "strong"]).default("medium"),
  twoFactorAuth: z.boolean().default(false),
});

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [backupData, setBackupData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: async () => {
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem("hotelzenith_settings");
      return savedSettings ? JSON.parse(savedSettings) : {};
    },
  });

  const tabs = [
    { id: "general", label: "General", icon: faGlobe },
    { id: "notifications", label: "Notifications", icon: faBell },
    { id: "display", label: "Display", icon: faPalette },
    { id: "print", label: "Print", icon: faPrint },
    { id: "security", label: "Security", icon: faShield },
    { id: "backup", label: "Backup", icon: faDatabase },
  ];

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("hotelzenith_settings", JSON.stringify(data));

      // You would typically save to API here
      // await settingsService.saveSettings(data);

      setTimeout(() => {
        setIsSaving(false);
        alert("Settings saved successfully!");
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      alert("Failed to save settings");
    }
  };

  const handleExport = () => {
    const data = {
      settings: watch(),
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hotelzenith-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.settings) {
          reset(importedData.settings);
          setBackupData(importedData);
          alert("Settings imported successfully!");
        }
      } catch (error) {
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to defaults?")
    ) {
      reset();
      localStorage.removeItem("hotelzenith_settings");
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Settings</h1>
        <p className={styles.subtitle}>Configure your HotelZenith dashboard</p>
      </div>

      <div className={styles.settingsContainer}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <Card className={styles.settingsCard}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.settingsContent}>
              {activeTab === "general" && (
                <div className={styles.tabContent}>
                  <h3 className={styles.sectionTitle}>General Settings</h3>

                  <div className={styles.formGrid}>
                    <Input
                      label="Hotel Name"
                      placeholder="HotelZenith"
                      error={errors.hotelName?.message}
                      {...register("hotelName")}
                      fullWidth
                    />

                    <Input
                      label="Contact Email"
                      type="email"
                      placeholder="contact@hotelzenith.com"
                      error={errors.hotelEmail?.message}
                      {...register("hotelEmail")}
                      fullWidth
                    />

                    <Input
                      label="Contact Phone"
                      placeholder="+1 (555) 123-4567"
                      error={errors.hotelPhone?.message}
                      {...register("hotelPhone")}
                      fullWidth
                    />

                    <Select
                      label="Timezone"
                      options={[
                        {
                          value: "America/New_York",
                          label: "Eastern Time (ET)",
                        },
                        {
                          value: "America/Chicago",
                          label: "Central Time (CT)",
                        },
                        {
                          value: "America/Denver",
                          label: "Mountain Time (MT)",
                        },
                        {
                          value: "America/Los_Angeles",
                          label: "Pacific Time (PT)",
                        },
                        { value: "UTC", label: "UTC" },
                      ]}
                      {...register("timezone")}
                      error={errors.timezone?.message}
                    />

                    <Select
                      label="Currency"
                      options={[
                        { value: "USD", label: "US Dollar ($)" },
                        { value: "EUR", label: "Euro (€)" },
                        { value: "GBP", label: "British Pound (£)" },
                        { value: "JPY", label: "Japanese Yen (¥)" },
                      ]}
                      {...register("currency")}
                      error={errors.currency?.message}
                    />

                    <Select
                      label="Date Format"
                      options={[
                        { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                      ]}
                      {...register("dateFormat")}
                      error={errors.dateFormat?.message}
                    />
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className={styles.tabContent}>
                  <h3 className={styles.sectionTitle}>Notification Settings</h3>

                  <div className={styles.togglesGrid}>
                    <Toggle
                      label="Email Notifications"
                      description="Receive notifications via email"
                      {...register("emailNotifications")}
                    />

                    <Toggle
                      label="Order Notifications"
                      description="Notify on new orders"
                      {...register("orderNotifications")}
                    />

                    <Toggle
                      label="Booking Notifications"
                      description="Notify on new bookings"
                      {...register("bookingNotifications")}
                    />

                    <Toggle
                      label="Review Notifications"
                      description="Notify on new reviews"
                      {...register("reviewNotifications")}
                    />

                    <Toggle
                      label="Push Notifications"
                      description="Desktop notifications"
                      {...register("pushNotifications")}
                    />
                  </div>
                </div>
              )}

              {activeTab === "display" && (
                <div className={styles.tabContent}>
                  <h3 className={styles.sectionTitle}>Display Settings</h3>

                  <div className={styles.formGrid}>
                    <Select
                      label="Theme"
                      options={[
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                        { value: "auto", label: "Auto (System)" },
                      ]}
                      {...register("theme")}
                      error={errors.theme?.message}
                    />

                    <Select
                      label="Language"
                      options={[
                        { value: "en", label: "English" },
                        { value: "es", label: "Spanish" },
                        { value: "fr", label: "French" },
                        { value: "de", label: "German" },
                      ]}
                      {...register("language")}
                      error={errors.language?.message}
                    />

                    <Input
                      label="Items Per Page"
                      type="number"
                      min="5"
                      max="100"
                      {...register("itemsPerPage", { valueAsNumber: true })}
                      error={errors.itemsPerPage?.message}
                      fullWidth
                    />
                  </div>
                </div>
              )}

              {activeTab === "print" && (
                <div className={styles.tabContent}>
                  <h3 className={styles.sectionTitle}>Print Settings</h3>

                  <div className={styles.togglesGrid}>
                    <Toggle
                      label="Print Logo"
                      description="Include HotelZenith logo on prints"
                      {...register("printLogo")}
                    />

                    <Toggle
                      label="Print Footer"
                      description="Include footer information"
                      {...register("printFooter")}
                    />

                    <Toggle
                      label="Print Terms"
                      description="Include terms and conditions"
                      {...register("printTerms")}
                    />
                  </div>

                  <div
                    className={styles.formGrid}
                    style={{ marginTop: "2rem" }}
                  >
                    <Select
                      label="Invoice Template"
                      options={[
                        { value: "modern", label: "Modern" },
                        { value: "classic", label: "Classic" },
                        { value: "minimal", label: "Minimal" },
                      ]}
                      {...register("invoiceTemplate")}
                      error={errors.invoiceTemplate?.message}
                    />
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className={styles.tabContent}>
                  <h3 className={styles.sectionTitle}>Security Settings</h3>

                  <div className={styles.formGrid}>
                    <Input
                      label="Session Timeout (minutes)"
                      type="number"
                      min="5"
                      max="240"
                      {...register("sessionTimeout", { valueAsNumber: true })}
                      error={errors.sessionTimeout?.message}
                      fullWidth
                    />

                    <Select
                      label="Password Policy"
                      options={[
                        { value: "weak", label: "Weak (6+ characters)" },
                        {
                          value: "medium",
                          label: "Medium (8+ chars, mixed case)",
                        },
                        {
                          value: "strong",
                          label: "Strong (10+ chars, special chars)",
                        },
                      ]}
                      {...register("passwordPolicy")}
                      error={errors.passwordPolicy?.message}
                    />

                    <Toggle
                      label="Two-Factor Authentication"
                      description="Require 2FA for admin login"
                      {...register("twoFactorAuth")}
                    />
                  </div>
                </div>
              )}

              {activeTab === "backup" && (
                <div className={styles.tabContent}>
                  <h3 className={styles.sectionTitle}>Backup & Restore</h3>

                  <div className={styles.backupSection}>
                    <div className={styles.backupCard}>
                      <h4>Export Settings</h4>
                      <p>Download all current settings as a JSON file</p>
                      <Button
                        variant="outline"
                        icon={faDownload}
                        onClick={handleExport}
                      >
                        Export Settings
                      </Button>
                    </div>

                    <div className={styles.backupCard}>
                      <h4>Import Settings</h4>
                      <p>Restore settings from a backup file</p>
                      <div className={styles.importButton}>
                        <input
                          type="file"
                          id="importSettings"
                          accept=".json"
                          onChange={handleImport}
                          className={styles.fileInput}
                        />
                        <label htmlFor="importSettings">
                          <Button variant="outline" icon={faUpload} as="span">
                            Import Settings
                          </Button>
                        </label>
                      </div>
                    </div>

                    <div className={styles.backupCard}>
                      <h4>Reset Settings</h4>
                      <p>Reset all settings to default values</p>
                      <Button
                        variant="danger"
                        icon={faUndo}
                        onClick={handleReset}
                      >
                        Reset to Defaults
                      </Button>
                    </div>

                    {backupData && (
                      <div className={styles.backupInfo}>
                        <h4>Last Backup</h4>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(backupData.exportDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Version:</strong> {backupData.version}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className={styles.formActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={!isDirty}
              >
                Discard Changes
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={faSave}
                loading={isSaving}
                disabled={!isDirty}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
