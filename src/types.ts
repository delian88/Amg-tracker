export type UserRole = 'super_admin' | 'project_manager' | 'team_member' | 'viewer';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  photoURL?: string;
}

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'delayed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  client?: string;
  description?: string;
  managerId: string;
  startDate?: string;
  deadline: string;
  status: ProjectStatus;
  budget?: number;
  priority?: Priority;
  progress?: number;
  createdAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'overdue';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  startDate?: string;
  dueDate: string;
  status: TaskStatus;
  priority?: Priority;
  progress?: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'task_assignment' | 'deadline_approaching' | 'overdue' | 'status_change';
  read: boolean;
  createdAt: string;
  relatedEntityId?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'project' | 'task' | 'user';
  entityId: string;
  timestamp: string;
  details?: string;
}
