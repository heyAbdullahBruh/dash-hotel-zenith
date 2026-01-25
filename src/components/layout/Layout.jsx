// Layout.jsx
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar/Sidebar";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>{children}</main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          },
          success: {
            iconTheme: { primary: "var(--success)", secondary: "white" },
          },
          error: {
            iconTheme: { primary: "var(--danger)", secondary: "white" },
          },
        }}
      />
    </div>
  );
};

export default Layout;
