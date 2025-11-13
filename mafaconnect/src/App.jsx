import React from "react";
import Toaster from "@/components/ui/Toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InstallPromptBanner } from "./components/InstallPromptBanner";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";
import CustomerPortal from "./pages/CustomerPortal";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import { CustomerProtectedRoute } from "./components/CustomerProtectedRoute";
import CustomerDashboard from "./pages/CustomerDashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <InstallPromptBanner />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/portal" element={<CustomerPortal />} />
          <Route path="/install" element={<Install />} />
          <Route
            path="/customer-dashboard"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <CustomerDashboard />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />
          {/* Customer Routes */}
          {/* <Route
            path="/customer-dashboard"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <CustomerDashboard />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer-orders"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <CustomerOrders />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer-invoices"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <CustomerInvoices />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <AuthProtectedRoute>
                <DashboardLayout>
                  <Shop />
                </DashboardLayout>
              </AuthProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <AuthProtectedRoute>
                <DashboardLayout>
                  <ProductDetail />
                </DashboardLayout>
              </AuthProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <Cart />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <Checkout />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <OrderConfirmation />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <OrderTracking />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <AuthProtectedRoute>
                <DashboardLayout>
                  <ProfileSettings />
                </DashboardLayout>
              </AuthProtectedRoute>
            }
          />

          <Route
            path="/kyc-onboarding"
            element={
              <CustomerProtectedRoute>
                <DashboardLayout>
                  <KYCOnboarding />
                </DashboardLayout>
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <AuthProtectedRoute>
                <DashboardLayout>
                  <Messages />
                </DashboardLayout>
              </AuthProtectedRoute>
            } */}
          {/* /> */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Staff Routes */}
          {/* <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-order-management"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CustomerOrderManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Sales />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Transactions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <AuthProtectedRoute>
                <DashboardLayout>
                  <Products />
                </DashboardLayout>
              </AuthProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Customers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loyalty"
            element={
              <AuthProtectedRoute>
                <DashboardLayout>
                  <Loyalty />
                </DashboardLayout>
              </AuthProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requireManager>
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Invoices />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Returns />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute requireManager>
                <DashboardLayout>
                  <Locations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations/:id"
            element={
              <ProtectedRoute requireManager>
                <DashboardLayout>
                  <LocationDetail />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute requireManager>
                <DashboardLayout>
                  <Suppliers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PurchaseOrders />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-transfers"
            element={
              <ProtectedRoute requireManager>
                <DashboardLayout>
                  <StockTransfers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardLayout>
                  <Admin />
               </DashboardLayout>
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardLayout>
                  <Admin />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* <Route
  path="/manager"
  element={
    <ProtectedRoute requireManager>
      <DashboardLayout>
        <ManagerDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/sales"
  element={
    <ProtectedRoute requireSalesAgent>
      <DashboardLayout>
        <SalesAgentDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  }
/> */}

          {/* <Route
  path="/portal"
  element={
    <ProtectedRoute>
      <UserPortal />
    </ProtectedRoute>
  }
/> */}

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

// import { Toaster } from "./components/ui/Toaster";

// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// // ✅ Pages and Components
// import Auth from "./pages/Sighup";
// import CustomerPortal from "./pages/CustomerPortal";
// import Admin from "./pages/Admin";
// import { DashboardLayout } from "./components/DashboardLayout";
// import ProtectedRoute from "./components/ProtectedRoute";
// import { InstallPromptBanner } from "./components/InstallPromptBanner";
// import Toaster from "./components/ui/Toaster"; // ✅ default import

// const queryClient = new QueryClient();

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <InstallPromptBanner />
//       <Router>
//         {/* ✅ Global components outside Routes */}

//         <Toaster />

//         <Routes>
//           {/* 🔁 Redirect "/" to "/auth" */}
//           <Route path="/" element={<Navigate to="/auth" replace />} />

//           {/* Public routes */}
//           <Route path="/auth" element={<Auth />} />

//           {/* Protected user route */}
//           <Route
//             path="/portal"
//             element={
//               <ProtectedRoute>
//                 <CustomerPortal />
//               </ProtectedRoute>
//             }
//           />

//           {/* Protected admin route */}
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute requireAdmin>
//                 <DashboardLayout>
//                   <Admin />
//                 </DashboardLayout>
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </Router>
//     </QueryClientProvider>
//   );
// }

// export default App;
