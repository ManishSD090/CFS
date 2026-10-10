import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./modules/admin/services/authStorage";

import SuperAdminLayout from "./shared/layouts/SuperAdminLayout";
import CompaniesPage from "./modules/superadmin/pages/CompaniesPage";
import SuperAdminDashboard from "./modules/superadmin/pages/Dashboard";
import SuperAdminProfile from "./modules/superadmin/pages/Profile";
import CompanyDetailsPage from "./modules/superadmin/pages/CompanyDetailsPage";
import CreateCompanyPage from "./modules/superadmin/pages/CreateCompanyPage";
import UpdateCompanyPage from "./modules/superadmin/pages/UpdateCompanyPage";

import AdminLayout from "./shared/layouts/AdminLayout";
import ProjectsPage from "./modules/admin/pages/ProjectsPage";
import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import AdminProfile from "./modules/admin/pages/AdminProfile";
import ApprovalsPage from "./modules/admin/pages/approvals/ApprovalsPage";
import InspectionPage from "./modules/admin/pages/inspection/InspectionPage";
import ReportPage from "./modules/admin/pages/report/ReportPage";
import ProjectDetailsPage from "./modules/admin/pages/projects/ProjectDetailsPage";
import CreateProjectPage from "./modules/admin/pages/projects/CreateProjectPage";
import EditProjectPage from "./modules/admin/pages/projects/EditProjectPage";
import CreateDprPage from "./modules/admin/pages/projects/dpr/CreateDprPage";
import EditDprPage from "./modules/admin/pages/projects/dpr/EditDprPage";
import DprDetailsPage from "./modules/admin/pages/projects/dpr/DprDetailsPage";
import CreateWprPage from "./modules/admin/pages/projects/wpr/CreateWprPage";
import EditWprPage from "./modules/admin/pages/projects/wpr/EditWprPage";
import WprDetailsPage from "./modules/admin/pages/projects/wpr/WprDetailsPage";
import MarkAttendancePage from "./modules/admin/pages/projects/attendance/MarkAttendancePage";
import AddWorkerPage from "./modules/admin/pages/projects/attendance/AddWorkerPage";
import AddStaffPage from "./modules/admin/pages/projects/attendance/AddStaffPage";
import WorkerDetailsPage from "./modules/admin/pages/projects/attendance/WorkerDetailsPage";
import CreateTimelinePage from "./modules/admin/pages/projects/timeline/CreateTimelinePage";
import EditTimelinePage from "./modules/admin/pages/projects/timeline/EditTimelinePage";
import CreateTimelineVersionPage from "./modules/admin/pages/projects/timeline/CreateTimelineVersionPage";
import TimelineApprovalDetailsPage from "./modules/admin/pages/approvals/TimelineApprovalDetailsPage";
import GlobalInventoryDashboard from "./modules/inventory/pages/GlobalInventoryDashboard";
import InventoryListPage from "./modules/inventory/pages/InventoryListPage";
import InventoryHistoryPage from "./modules/inventory/pages/InventoryHistoryPage";
import MaterialRequestListPage from "./modules/inventory/pages/MaterialRequestListPage";
import PurchaseOrderListPage from "./modules/inventory/pages/PurchaseOrderListPage";
import ItemDetailsPage from "./modules/inventory/pages/ItemDetailsPage";
import PurchaseOrderDetailsPage from "./modules/inventory/pages/PurchaseOrderDetailsPage";
import EditPOPage from "./modules/inventory/pages/EditPOPage";
import CreateGRNPage from "./modules/inventory/pages/CreateGRNPage";

import SubcontractorListPage from "./modules/admin/pages/subcontractor/SubcontractorListPage";
import SubcontractorDetailsPage from "./modules/admin/pages/subcontractor/SubcontractorDetailsPage";
import ManageWorkersPage from "./modules/admin/pages/subcontractor/ManageWorkersPage";
import ProjectSubcontractorDetailsPage from "./modules/admin/pages/projects/subcontractors/ProjectSubcontractorDetailsPage";

import CreateBudgetPage from "./modules/admin/pages/projects/budget/CreateBudgetPage";
import EditBudgetPage from "./modules/admin/pages/projects/budget/EditBudgetPage";
import BudgetRevisionsPage from "./modules/admin/pages/projects/budget/BudgetRevisionsPage";
import BudgetAuditPage from "./modules/admin/pages/projects/budget/BudgetAuditPage";
import BudgetApprovalDetailsPage from "./modules/admin/pages/approvals/BudgetApprovalDetailsPage";
import BudgetTransactionsPage from "./modules/admin/pages/projects/budget/BudgetTransactionsPage";
import AddBudgetRecordPage from "./modules/admin/pages/projects/budget/AddBudgetRecordPage";
import BudgetTransactionDetailsPage from "./modules/admin/pages/projects/budget/BudgetTransactionDetailsPage";

import LedgerPage from "./modules/admin/pages/transactions/LedgerPage";
import CreateLedgerPage from "./modules/admin/pages/transactions/CreateLedgerPage";
import LedgerDetailsPage from "./modules/admin/pages/transactions/LedgerDetailsPage";

import PayrollPage from "./modules/admin/pages/projects/payroll/PayrollPage";
import PayrollDetailsPage from "./modules/admin/pages/projects/payroll/PayrollDetailsPage";
import PayrollSettingsPage from "./modules/admin/pages/projects/payroll/PayrollSettingsPage";



import LoginPage from "./modules/auth/pages/Login";
import SetupAccount from "./modules/auth/pages/SetupAccount";

// ProtectedRoute: evaluated fresh on every render/navigation,
// so it correctly sees the token saved during login.
const ProtectedRoute = ({ children }) => {
  const auth = isAuthenticated();
  console.log("🛡️ [ProtectedRoute] isAuthenticated =", auth, "| token =", localStorage.getItem("accessToken"));
  return auth ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />

        {/* ACCOUNT SETUP - First-time login users with a valid OTP token */}
        <Route
          path="/setup-account"
          element={
            <ProtectedRoute>
              <SetupAccount />
            </ProtectedRoute>
          }
        />

        {/* SUPER ADMIN */}
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/create" element={<CreateCompanyPage />} />
          <Route path="companies/edit/:id" element={<UpdateCompanyPage />} />
          <Route path="companies/:id" element={<CompanyDetailsPage />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/create" element={<CreateProjectPage />} />
          <Route path="projects/edit/:id" element={<EditProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          <Route path="projects/:id/dpr/create" element={<CreateDprPage />} />
          <Route path="projects/:id/dpr/edit/:dprId" element={<EditDprPage />} />
          <Route path="projects/:id/dpr/:dprId" element={<DprDetailsPage />} />
          <Route path="projects/:id/wpr/create" element={<CreateWprPage />} />
          <Route path="projects/:id/wpr/edit/:wprId" element={<EditWprPage />} />
          <Route path="projects/:id/wpr/:wprId" element={<WprDetailsPage />} />
          <Route path="projects/:id/attendance/mark" element={<MarkAttendancePage />} />
          <Route path="projects/:id/attendance/add-worker" element={<AddWorkerPage />} />
          <Route path="projects/:id/attendance/add-staff" element={<AddStaffPage />} />
          <Route path="projects/:id/attendance/workers/:workerId" element={<WorkerDetailsPage />} />
          <Route path="projects/:id/timeline/create" element={<CreateTimelinePage />} />
          <Route path="projects/:id/timeline/edit" element={<EditTimelinePage />} />
          <Route path="projects/:id/timeline/versions/create" element={<CreateTimelineVersionPage />} />

          <Route path="projects/:id/budget/create" element={<CreateBudgetPage />} />
          <Route path="projects/:id/budget/edit" element={<EditBudgetPage />} />
          <Route path="projects/:id/budget/revisions" element={<BudgetRevisionsPage />} />
          <Route path="projects/:id/budget/audit" element={<BudgetAuditPage />} />
          <Route path="projects/:id/budget/:budgetId/transactions" element={<BudgetTransactionsPage />} />
          <Route path="projects/:id/budget/:budgetId/transactions/add" element={<AddBudgetRecordPage />} />
          <Route path="projects/:id/budget/:budgetId/transactions/:transactionId" element={<BudgetTransactionDetailsPage />} />

          {/* Payroll Routes */}
          <Route path="projects/:id/payroll" element={<PayrollPage />} />
          <Route path="projects/:id/payroll/settings" element={<PayrollSettingsPage />} />
          <Route path="projects/:id/payroll/:payrollId" element={<PayrollDetailsPage />} />


          <Route path="profile" element={<AdminProfile />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="approvals/timeline/:approvalId" element={<TimelineApprovalDetailsPage />} />
          <Route path="approvals/budget/:approvalId" element={<BudgetApprovalDetailsPage />} />
          <Route path="inspection" element={<InspectionPage />} />
          <Route path="reports" element={<ReportPage />} />

          {/* Ledger Routes */}
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="ledger/create" element={<CreateLedgerPage />} />
          <Route path="ledger/:id" element={<LedgerDetailsPage />} />

          {/* Inventory Routes */}
          <Route path="inventory" element={<GlobalInventoryDashboard />} />
          <Route path="inventory/list" element={<InventoryListPage />} />
          <Route path="inventory/item/:type/:id" element={<ItemDetailsPage />} />
          <Route path="inventory/history" element={<InventoryHistoryPage />} />
          <Route path="inventory/requests" element={<MaterialRequestListPage />} />
          <Route path="inventory/po" element={<PurchaseOrderListPage />} />
          <Route path="inventory/po/:id" element={<PurchaseOrderDetailsPage />} />
          <Route path="inventory/po/:id/edit" element={<EditPOPage />} />
          <Route path="inventory/po/:id/grn" element={<CreateGRNPage />} />

          {/* Subcontractor Routes */}
          <Route path="subcontractors" element={<SubcontractorListPage />} />
          <Route path="subcontractors/:id" element={<SubcontractorDetailsPage />} />
          <Route path="subcontractors/:id/workers" element={<ManageWorkersPage />} />
          <Route path="projects/:id/subcontractors/:contractorProjectId" element={<ProjectSubcontractorDetailsPage />} />

          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;