import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Sighup";
import { InstallPromptBanner } from "./components/InstallPromptBanner";
import CustomerPortal from "./pages/CustomerPortal";

function App() {
  return (
    <Router>
      {/* ✅ Keep global components outside Routes */}
      <InstallPromptBanner />

      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/portal" element={<CustomerPortal />} />
      </Routes>
    </Router>
  );
}

export default App;

// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import Auth from "./pages/Sighup";
// import { InstallPromptBanner } from "./components/InstallPromptBanner";
// import CustomerPortal from "./pages/CustomerPortal";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <InstallPromptBanner />
//         <Route path="/auth" element={<Auth />} />
//           {/* <Route path="/portal" element={<CustomerPortal />} /> */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;
