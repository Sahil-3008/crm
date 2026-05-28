import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import NewTicket from "./pages/NewTicket";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"            element={<Dashboard />} />
        <Route path="/tickets"     element={<Tickets />} />
        <Route path="/tickets/new" element={<NewTicket />} />
      </Route>
    </Routes>
  );
}

export default App;
