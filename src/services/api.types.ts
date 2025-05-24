import { Session } from 'next-auth';

// Estende a interface Session do next-auth
declare module 'next-auth' {
  interface Session {
    token?: string;
  }
}

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Tipos de usuário
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  timezone?: string | null;
  profile?: Profile;
  createdAt?: string;
  message?: string;
}

export interface Profile {
  id: string;
  name: string;
}

// Tipos de organização
export interface Organization {
  id: string;
  name: string;
  branches: Branch[];
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  organizationId: string;
}

export interface UpdateBranchData extends Partial<CreateBranchData> {}

// Tipos de plano
export interface Plan {
  id: string;
  name: string;
  price: number;
  includedUnits: number;
  maxUsers: number;
  maxChecklists: number | null;
  extraUserPrice: number | null;
  extraUnitPrice: number | null;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de log
export interface LoginLog {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

// Tipos de estatísticas
export interface DashboardStats {
  totalUsers: number;
  totalProfiles: number;
  totalLogins: number;
  totalOrganizations: number;
  totalBranches: number;
}

// Tipos de nicho
export interface Niche {
  id: string;
  name: string;
  description?: string;
}

// Tipos de perfil de usuário
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
}

// Tipos de notificação
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

// Tipos de checkout
export interface CheckoutSession {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  customerId: string;
  organizationId: string;
  planId: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export interface CreateCheckoutSessionData {
  amount: number;
  currency: string;
  customerId: string;
  organizationId: string;
  planId: string;
  paymentMethod: string;
}

export interface UpdateCheckoutSessionData {
  status?: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
}

// Tipos de wizard
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

// Tipos de webhook
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookData {
  url: string;
  events: string[];
  organizationId: string;
}

export interface UpdateWebhookData {
  url?: string;
  events?: string[];
  isActive?: boolean;
}

export interface Log {
  id: string;
  action: string;
  description: string;
  userId: string;
  organizationId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface CreateLogData {
  action: string;
  description: string;
  userId: string;
  organizationId: string;
  metadata?: Record<string, any>;
}

export interface LogFilters {
  startDate?: string;
  endDate?: string;
  action?: string;
  userId?: string;
  organizationId?: string;
}

export interface Environment {
  id: string;
  name: string;
  position: number;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}
