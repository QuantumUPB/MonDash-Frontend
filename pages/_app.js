import "../styles/globals.css";
import "../components/Alerts.css";
import "../components/AppList.css";
import "../components/DeviceList.css";
import "../components/NodeList.css";
import "../components/UserList.css";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import {
  AutoRefreshProvider,
  AutoRefreshContext,
} from "../components/AutoRefreshContext";
import AutoRefreshMenu from "../components/AutoRefreshMenu";
import axios from "axios";
import Toast from "../components/Toast";
import {
  MdMap,
  MdDevices,
  MdHub,
  MdApps,
  MdPeople,
  MdWarning,
  MdLogin,
  MdLogout,
  MdPersonAdd,
} from "react-icons/md";

axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
// Always send cookies such as the auth cookie with requests
axios.defaults.withCredentials = true;

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";
  const { refreshTrigger } = useContext(AutoRefreshContext);
  const [toastMessages, setToastMessages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [pageAvailability, setPageAvailability] = useState({
    map: true,
    devices: true,
    nodes: true,
    apps: true,
    users: true,
    alerts: true,
  });
  const path = router.pathname;
  const addToast = (msg) => setToastMessages((msgs) => [...msgs, msg]);
  const removeToast = (index) =>
    setToastMessages((msgs) => msgs.filter((_, i) => i !== index));

  useEffect(() => {
    axios.get("/healthcheck").catch(() => {
      addToast("Backend is inaccessible");
    });
  }, []);

  useEffect(() => {
    axios
      .get("/api/active-alerts")
      .then((res) => {
        if (Array.isArray(res.data)) {
          res.data.forEach((alert) => {
            const device = alert.device || alert.deviceId || alert.id || "";
            addToast(`Device ${device} is down`);
          });
        }
      })
      .catch((err) => console.error("Failed to fetch active alerts:", err));
  }, [refreshTrigger]);
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("username") : "";
    const storedRole =
      typeof window !== "undefined" ? localStorage.getItem("role") : "";
    if (token) {
      setLoggedIn(true);
      setUsername(storedUser || "");
      setRole(storedRole || "");
    } else {
      setLoggedIn(false);
      setUsername("");
      setRole("");
    }
  }, [router.pathname]);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const [mapRes, devRes, nodeRes, appRes, userRes, alertRes] =
          await Promise.allSettled([
            axios.get("/api/map"),
            axios.get("/api/devices?numEntries=1"),
            axios.get("/api/nodes"),
            axios.get("/api/apps"),
            axios.get("/api/users"),
            axios.get("/api/alerts"),
          ]);
        setPageAvailability({
          map:
            mapRes.status === "fulfilled" &&
            Array.isArray(mapRes.value.data.nodes) &&
            mapRes.value.data.nodes.length > 0,
          devices:
            devRes.status === "fulfilled" &&
            Array.isArray(devRes.value.data) &&
            devRes.value.data.length > 0,
          nodes:
            nodeRes.status === "fulfilled" &&
            Array.isArray(nodeRes.value.data) &&
            nodeRes.value.data.length > 0,
          apps:
            appRes.status === "fulfilled" &&
            Array.isArray(appRes.value.data) &&
            appRes.value.data.length > 0,
          users:
            userRes.status === "fulfilled" &&
            Array.isArray(userRes.value.data) &&
            userRes.value.data.length > 0,
          alerts:
            alertRes.status === "fulfilled" &&
            Array.isArray(alertRes.value.data.alerts) &&
            alertRes.value.data.alerts.length > 0,
        });
      } catch (err) {
        console.error("Failed to check page availability:", err);
      }
    };
    checkAvailability();
  }, [refreshTrigger]);
  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      setLoggedIn(false);
      setUsername("");
      setRole("");
      router.push("/login");
    }
  };
  const navLink = (href, label, Icon) => (
    <li>
      <Link
        href={href}
        className={`nav-link ${path === href ? "active-link" : ""}`}
      >
        {Icon && <Icon className="nav-icon" />}
        <span>{label}</span>
      </Link>
    </li>
  );
  return (
    <div className="app-container">
      {!isLoginPage && (
        <aside className="sidebar">
          <Link href="/">
            <img
              src="/mondash-logo.png"
              alt="Mondash Logo"
              className="sidebar-logo"
            />
          </Link>
          <nav>
            <ul className="nav-links">
              {pageAvailability.map && navLink("/", "Map", MdMap)}
              {pageAvailability.devices && navLink("/devices", "Devices", MdDevices)}
              {pageAvailability.nodes && navLink("/nodes", "Nodes", MdHub)}
              {pageAvailability.apps && navLink("/apps", "Apps", MdApps)}
              {pageAvailability.users && navLink("/users", "Users", MdPeople)}
              {pageAvailability.alerts && navLink("/alerts", "Alerts", MdWarning)}
            </ul>
            <div className="auth-links">
              <ul>
                {loggedIn ? (
                  <>
                    <li className="nav-username">
                      {role ? `${username} - ${role}` : username}
                    </li>
                    <li>
                      <button onClick={handleLogout} className="nav-link">
                        <MdLogout className="nav-icon" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    {navLink("/login", "Login", MdLogin)}
                  </>
                )}
              </ul>
              <div className="about">
                <div className="logos">
                  <img src="/ronaqci.png" alt="logo" />
                  <img src="/upb.png" alt="logo" />
                </div>
              </div>
            </div>
          </nav>
        </aside>
      )}
      <main className={`main-content${isLoginPage ? " no-sidebar" : ""}`}>
        {router.pathname !== "/users" && router.pathname !== "/alerts" && (
          <AutoRefreshMenu />
        )}
        <Component {...pageProps} />
        {toastMessages.map((msg, idx) => (
          <Toast key={idx} message={msg} onClose={() => removeToast(idx)} />
        ))}
      </main>
    </div>
  );
}

function MyApp(props) {
  return (
    <AutoRefreshProvider>
      <Head>
        <title>MonDash</title>
      </Head>
      <AppContent {...props} />
    </AutoRefreshProvider>
  );
}

export default MyApp;
