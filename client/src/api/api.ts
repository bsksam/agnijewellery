import axios from 'axios';

// Use relative URL for Vercel production, fallback to localhost for local dev
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthAPI = {
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

export const MasterAPI = {
  getCategories: () => api.get('/master/categories'),
  createCategory: (data: any) => api.post('/master/categories', data),
  getProducts: () => api.get('/master/products'),
  createProduct: (data: any) => api.post('/master/products', data),
};

export const RatesAPI = {
  getLatest: () => api.get('/rates/latest'),
  getLatestRates: () => api.get('/rates/latest'),
  updateRate: (data: any) => api.post('/rates/update', data),
};

export const StockAPI = {
  getAllStock: () => api.get('/stock'),
  getTag: (tagNo: string) => api.get(`/stock/${tagNo}`),
  createStock: (data: any) => api.post('/stock', data),
  toggleGalleryStatus: (tag_no: string, status: boolean) => api.patch(`/stock/toggle-gallery/${tag_no}`, { show_in_gallery: status }),
};

export const DashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getRecentStock: () => api.get('/dashboard/recent-stock'),
};

export const CustomerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id: string | number) => api.get(`/customers/${id}`),
};

export const SettingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.post('/settings', data),
};

export const ReportAPI = {
  getDaily: (date: string) => api.get(`/reports/daily?date=${date}`),
  getValuation: () => api.get('/reports/valuation'),
};

export const AuditAPI = {
  submit: (data: any) => api.post('/audit/submit', data),
  getHistory: () => api.get('/audit/history'),
  getLogs: () => api.get('/audit/logs'),
  getLifecycle: (type: string, id: string) => api.get(`/audit/lifecycle/${type}/${id}`),
};

export const BackupAPI = {
  trigger: () => api.post('/backup/trigger'),
  getStatus: () => api.get('/backup/status'),
};

export const AccountingAPI = {
  getDaybook: (date: string) => api.get(`/accounting/daybook?date=${date}`),
  getTrialBalance: () => api.get('/accounting/trial-balance'),
  getGSTR1: (m: string, y: string) => api.get(`/accounting/gstr1?month=${m}&year=${y}`),
  getExpenses: () => api.get('/accounting/expenses'),
  addExpense: (data: any) => api.post('/accounting/expenses', data),
  getLedgers: () => api.get('/accounting/ledgers'),
};

export const OrderAPI = {
  getAll: () => api.get('/orders'),
  create: (data: any) => api.post('/orders', data),
  submitAdvance: (id: number, data: any) => api.post(`/orders/${id}/advance`, data),
  updateStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

export const SchemeAPI = {
  getMasters: () => api.get('/schemes/masters'),
  getActive: (mobile: string) => api.get(`/schemes/active/${mobile}`),
  search: (query: string) => api.get(`/schemes/search?q=${query}`),
  getPayments: (id: number) => api.get(`/schemes/payments/${id}`),
  enroll: (data: any) => api.post('/schemes/enroll', data),
  pay: (data: any) => api.post('/schemes/pay', data),
};

export const AnalyticsAPI = {
  getAging: () => api.get('/analytics/aging'),
  getForecasting: () => api.get('/analytics/forecasting'),
  getVIPSegments: () => api.get('/analytics/vip-segments'),
  getVelocity: () => api.get('/analytics/velocity'),
  getInsights: () => api.get('/analytics/insights'),
  getStaffPerformance: () => api.get('/analytics/staff-performance'),
  getTrends: () => api.get('/analytics/trends'),
  getStockAging: () => api.get('/analytics/aging'),
  getCategoryPerformance: () => api.get('/analytics/category-performance'),
};

export const DealerAPI = {
  getAll: () => api.get('/dealers'),
  create: (data: any) => api.post('/dealers', data),
  getLedger: (id: number) => api.get(`/dealers/ledger/${id}`),
  recordTransaction: (data: any) => api.post('/dealers/transaction', data),
};

export const BulkAPI = {
  importStock: (items: any[]) => api.post('/bulk/import-stock', { items }),
  importCustomers: (customers: any[]) => api.post('/bulk/import-customers', { customers }),
  exportAll: () => api.get('/bulk/export-all'),
};

export const DBManagementAPI = {
  getStats: () => api.get('/db/stats'),
  syncCloud: (data: any) => api.post('/db/sync', data),
  getHealth: () => api.get('/db/health'),
};

export const RepairAPI = {
  getAll: (search?: string) => api.get(`/repairs?search=${search || ''}`),
  create: (data: any) => api.post('/repairs', data),
  cancel: (id: number) => api.patch(`/repairs/${id}/cancel`),
  delete: (id: number) => api.delete(`/repairs/${id}`),
  updateStatus: (id: number, status: string) => api.patch(`/repairs/${id}/status`, { status }),
  deliver: (id: number) => api.post(`/repairs/${id}/deliver`),
};

export const CRMAPI = {
  getUpcomingEvents: () => api.get('/crm/upcoming-events'),
  getLoyaltyReport: () => api.get('/crm/loyalty-report'),
};

export const BranchAPI = {
  getAll: () => api.get('/branches'),
  create: (data: any) => api.post('/branches', data),
  transfer: (data: any) => api.post('/branches/transfer', data),
  accept: (id: number, received_by: string) => api.post(`/branches/accept/${id}`, { received_by }),
  getPendingTransfers: (branch_id: number) => api.get(`/branches/transfers/${branch_id}`),
};

export const TaxAPI = {
  getGSTR1: (month: string, year: string) => api.get(`/tax/gstr1/${month}/${year}`),
};

export const QuotationAPI = {
  create: (data: any) => api.post('/quotations', data),
  getAll: () => api.get('/quotations'),
  getById: (id: string) => api.get(`/quotations/${id}`),
};

export const IncentiveAPI = {
  getLeaderboard: () => api.get('/incentives/leaderboard'),
  getRules: () => api.get('/incentives/rules'),
  saveRule: (data: any) => api.post('/incentives/rules', data),
  getEarnings: (staffId: string) => api.get(`/incentives/earnings/${staffId}`),
};

export const PublicAPI = {
  verify: (tag_no: string) => api.get(`/public/verify/${tag_no}`),
  getPublicShowroom: () => api.get('/public/showroom'),
  getCustomerPortfolio: (phone: string) => api.get(`/public/portfolio/${phone}`),
};

export const SearchAPI = {
  universalSearch: (q: string) => api.get(`/search/universal?q=${q}`),
};

export const BillingAPI = {
  getAllSales: () => api.get('/billing/sales'),
  getSale: (billNo: string) => api.get(`/billing/sales/${billNo}`),
  createSale: (data: any) => api.post('/billing/sales', data),
};

export const BuybackAPI = {
  record: (data: any) => api.post('/buyback', data),
  getActiveVouchers: () => api.get('/buyback/vouchers/active'),
  useVoucher: (id: string) => api.patch(`/buyback/vouchers/${id}/use`),
};

export default api;
