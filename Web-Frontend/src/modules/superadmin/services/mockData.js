const statusList = ['Suspended','Active','Warning','Suspended','Suspended','Suspended','Suspended','Suspended','Suspended','Suspended','Active','Suspended','Warning','Active','Suspended','Suspended','Active','Active','Suspended','Warning','Suspended','Suspended','Active','Suspended','Suspended','Warning','Suspended','Active','Suspended','Suspended','Active','Suspended','Suspended','Active','Suspended','Warning','Suspended','Suspended','Active','Suspended','Suspended','Active','Warning','Suspended','Active','Active','Suspended','Suspended','Active','Suspended','Suspended','Active','Warning','Suspended','Active','Suspended','Suspended','Active','Active','Suspended'];

export const companiesData = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  name: 'Floyd Miles',
  subId: `ID-${2044 + i}`,
  gst: '27AABCA1234B1Z5',
  location: 'Mumbai, MH',
  projects: 11,
  users: 234,
  joined: 'Jan 2024',
  lastActive: 'Today',
  status: statusList[i] || 'Suspended',
  // Detail modal fields
  registrationNumber: 'U45201MH2019PTC287654',
  email: 'info@floydmiles.com',
  website: 'www.floydmiles.com',
  phone: '+91 98765 43210',
  address: '3rd Floor, Shree Ganesh Plaza, Near Andheri Metro Station, Andheri East, Mumbai - 400069, Maharashtra',
  createdAt: '01 JAN 2024',
  totalProjects: 11,
  activeProjectCount: 7,
  inactiveProjects: 4,
  totalStaff: 48,
  totalWorkers: 120,
  admin: {
    name: 'Rakesh Sharma',
    role: 'Company Admin',
    phone: '+91 91234 56789',
    email: 'rakesh.sharma@floydmiles.com',
  },
  bank: {
    bankName: 'HDFC Bank',
    accountNumber: '50200012345456789',
    ifscCode: 'HDFC0001254',
    branch: 'Andheri East, Mumbai',
  },
}));

export const statsData = {
  totalCompanies: 200,
  active: 178,
  suspended: 22,
  warning: 1,
};
