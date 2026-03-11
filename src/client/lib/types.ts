export type Role =
  | 'super_admin'
  | 'internal_admin'
  | 'project_manager'
  | 'engineering'
  | 'support'
  | 'sales'
  | 'installer'
  | 'client_admin'
  | 'client_user'
  | 'accounting_licensing_manager';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  companyId: string | null;
}
