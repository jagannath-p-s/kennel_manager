
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import KennelGrid from "./components/KennelGrid";
import ReservationForm from "./components/ReservationForm";
import ReservationList from "./components/ReservationList";
import FeedingSchedule from "./components/FeedingSchedule";
import FeedingLogHistory from "./components/FeedingLogHistory";
import CustomerManagement from "./components/CustomerManagement";
import Dashboard from "./components/Dashboard"; // Importing the new Dashboard component

const App = () => {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar for navigation */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {" "}
          {/* Overflow to avoid content spillover */}
          <Routes>
            {/* Route for KennelGrid */}
            <Route path="/" element={<KennelGrid />} />
            {/* Route for ReservationForm */}
            <Route path="/make-reservation" element={<ReservationForm />} />
            {/* Route for ReservationList */}
            <Route path="/reservation-list" element={<ReservationList />} />
            {/* Route for Feeding Schedule */}
            <Route path="/feeding-schedule" element={<FeedingSchedule />} />
            {/* Route for Feeding Log History */}
            <Route
              path="/feeding-log-history"
              element={<FeedingLogHistory />}
            />
            {/* Route for Customer Management */}
            <Route path="/customers" element={<CustomerManagement />} />
            {/* Route for Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />{" "}
            {/* New route for Dashboard */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
