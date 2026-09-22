import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCards from './components/StatsCards';
import CompanyTable from './components/CompanyTable';
import { fetchCompanies, deleteCompany } from '../services/adminServices';
import { companiesData } from '../services/mockData';
import { TableSkeleton } from '../../../shared/components/Skeletons';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const mapCompanyData = (apiCompany) => {
    const adminsList = apiCompany.companyAdmins || apiCompany.users || [];
    const firstAdmin = adminsList[0] || {};
    const projectsCount = apiCompany.stats?.projects || apiCompany.projectCount || apiCompany._count?.projects || 0;
    const usersCount = apiCompany.stats?.employees || apiCompany.adminCount || apiCompany.employeeCount || apiCompany._count?.users || 0;

    return {
      id: apiCompany.id,
      name: apiCompany.name,
      subId: apiCompany.registrationNumber || `ID-${(apiCompany.id || '').substring(0,6)}`,
      gst: apiCompany.gstNumber || 'N/A',
      location: apiCompany.officeAddress || 'India',
      projects: projectsCount,
      users: usersCount,
      joined: apiCompany.createdAt ? new Date(apiCompany.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
      lastActive: 'Today',
      status: apiCompany.isActive ? 'Active' : 'Suspended',
      
      registrationNumber: apiCompany.registrationNumber,
      email: apiCompany.email,
      website: apiCompany.website,
      phone: apiCompany.phone,
      address: apiCompany.officeAddress || apiCompany.address,
      createdAt: apiCompany.createdAt ? new Date(apiCompany.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'N/A',
      totalProjects: projectsCount,
      activeProjectCount: apiCompany.stats?.activeProjects || 0,
      inactiveProjects: apiCompany.stats?.completedProjects || 0,
      totalStaff: usersCount,
      totalWorkers: 0,
      admin: {
        name: firstAdmin.name || 'N/A',
        role: 'Company Admin',
        phone: firstAdmin.phone || 'N/A',
        email: firstAdmin.email || 'N/A',
      },
      bank: { bankName: '—', accountNumber: '—', ifscCode: '—', branch: '—' },
    };
  };

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await fetchCompanies();
      if (res.success && res.data) {
        setCompanies(res.data.companies.map(mapCompanyData));
      } else {
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await deleteCompany(company.id);
        setCompanies((prev) => prev.filter((c) => c.id !== company.id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <>
      <StatsCards />
      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : (
        <CompanyTable
          companies={companies}
          onCreateClick={() => navigate('/superadmin/companies/create')}
          onViewClick={(company) => navigate(`/superadmin/companies/${company.id}`)}
          onEditClick={(company) => navigate(`/superadmin/companies/edit/${company.id}`, { state: { company } })}
          onDeleteClick={handleDeleteCompany}
        />
      )}
    </>
  );
}
