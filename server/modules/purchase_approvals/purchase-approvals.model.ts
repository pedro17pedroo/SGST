interface PurchaseApproval {
  id: string;
  orderId: string;
  chainId: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested' | 'cancelled';
  currentLevel: number;
  totalLevels: number;
  submittedAt: Date;
  submittedByUserId: string;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  comments?: string;
  urgentReason?: string;
}

interface ApprovalChain {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  approvers: Array<{
    userId: string;
    level: number;
    required: boolean;
    canDelegate: boolean;
  }>;
  conditions?: {
    minAmount?: number;
    maxAmount?: number;
    categories?: string[];
    suppliers?: string[];
    warehouses?: string[];
  };
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

interface ApprovalAction {
  id: string;
  approvalId: string;
  userId: string;
  action: 'approved' | 'rejected' | 'revision_requested' | 'delegated';
  level: number;
  comments?: string;
  timestamp: Date;
  delegatedToUserId?: string;
}

interface ApprovalLimit {
  id: string;
  userId: string;
  role?: string;
  maxAmount: number;
  currency: string;
  category?: string;
  active: boolean;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

interface ApprovalNotification {
  id: string;
  userId: string;
  approvalId: string;
  type: 'new_approval_request' | 'approval_approved' | 'approval_rejected' | 'revision_requested';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

export class PurchaseApprovalsModel {
  private static approvals: Map<string, PurchaseApproval> = new Map();
  private static chains: Map<string, ApprovalChain> = new Map();
  private static actions: Map<string, ApprovalAction[]> = new Map();
  private static limits: Map<string, ApprovalLimit> = new Map();
  private static notifications: Map<string, ApprovalNotification[]> = new Map();

  static {
    // Initialize with default approval chain
    this.createDefaultApprovalChain();
    this.createDefaultApprovalLimits();
  }

  private static createDefaultApprovalChain(): void {
    const defaultChain: ApprovalChain = {
      id: 'default-chain-001',
      name: 'Cadeia de Aprovação Padrão',
      description: 'Cadeia de aprovação padrão para ordens de compra',
      active: true,
      approvers: [
        { userId: 'supervisor-001', level: 1, required: true, canDelegate: false },
        { userId: 'manager-001', level: 2, required: true, canDelegate: true },
        { userId: 'director-001', level: 3, required: false, canDelegate: true }
      ],
      conditions: {
        minAmount: 0,
        maxAmount: 1000000
      },
      createdAt: new Date(),
      createdByUserId: 'system'
    };

    this.chains.set(defaultChain.id, defaultChain);
  }

  private static createDefaultApprovalLimits(): void {
    const defaultLimits: ApprovalLimit[] = [
      {
        id: 'limit-001',
        userId: 'supervisor-001',
        role: 'supervisor',
        maxAmount: 50000,
        currency: 'AOA',
        active: true,
        createdAt: new Date(),
        createdByUserId: 'system'
      },
      {
        id: 'limit-002',
        userId: 'manager-001',
        role: 'manager',
        maxAmount: 200000,
        currency: 'AOA',
        active: true,
        createdAt: new Date(),
        createdByUserId: 'system'
      },
      {
        id: 'limit-003',
        userId: 'director-001',
        role: 'director',
        maxAmount: 1000000,
        currency: 'AOA',
        active: true,
        createdAt: new Date(),
        createdByUserId: 'system'
      }
    ];

    defaultLimits.forEach(limit => {
      this.limits.set(limit.id, limit);
    });
  }

  static async submitForApproval(
    orderId: string, 
    data: { submittedByUserId: string; submittedAt: Date; comments?: string; priority?: string }
  ): Promise<PurchaseApproval> {
    const id = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Find appropriate approval chain (for now, use default)
    const chain = Array.from(this.chains.values()).find(c => c.active) || Array.from(this.chains.values())[0];
    
    const approval: PurchaseApproval = {
      id,
      orderId,
      chainId: chain.id,
      status: 'pending',
      currentLevel: 1,
      totalLevels: Math.max(...chain.approvers.map(a => a.level)),
      priority: (data.priority as any) || 'medium',
      comments: data.comments,
      submittedAt: data.submittedAt,
      submittedByUserId: data.submittedByUserId
    };

    this.approvals.set(id, approval);

    // Create notifications for level 1 approvers
    const level1Approvers = chain.approvers.filter(a => a.level === 1);
    for (const approver of level1Approvers) {
      this.createNotification(approver.userId, {
        approvalId: id,
        type: 'new_approval_request',
        title: 'Nova Solicitação de Aprovação',
        message: `Nova ordem de compra (${orderId}) aguarda sua aprovação`
      });
    }

    return approval;
  }

  static async approvePurchaseOrder(
    orderId: string,
    data: { approvedByUserId: string; approvedAt: Date; comments?: string }
  ): Promise<PurchaseApproval | undefined> {
    const approval = Array.from(this.approvals.values()).find(a => a.orderId === orderId && a.status === 'pending');
    if (!approval) {
      return undefined;
    }

    const chain = this.chains.get(approval.chainId);
    if (!chain) {
      return undefined;
    }

    // Record the approval action
    const action: ApprovalAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      approvalId: approval.id,
      userId: data.approvedByUserId,
      action: 'approved',
      level: approval.currentLevel,
      comments: data.comments,
      timestamp: data.approvedAt
    };

    if (!this.actions.has(approval.id)) {
      this.actions.set(approval.id, []);
    }
    this.actions.get(approval.id)!.push(action);

    // Check if this was the final approval
    const nextLevel = approval.currentLevel + 1;
    const hasNextLevel = chain.approvers.some(a => a.level === nextLevel);

    if (!hasNextLevel) {
      // Final approval
      approval.status = 'approved';
      approval.completedAt = data.approvedAt;
      
      // Notify requester
      this.createNotification(approval.submittedByUserId, {
        approvalId: approval.id,
        type: 'approval_approved',
        title: 'Aprovação Concedida',
        message: `Sua ordem de compra (${orderId}) foi aprovada`
      });
    } else {
      // Move to next level
      approval.currentLevel = nextLevel;
      
      // Notify next level approvers
      const nextLevelApprovers = chain.approvers.filter(a => a.level === nextLevel);
      for (const approver of nextLevelApprovers) {
        this.createNotification(approver.userId, {
          approvalId: approval.id,
          type: 'new_approval_request',
          title: 'Nova Solicitação de Aprovação',
          message: `Ordem de compra (${orderId}) aguarda sua aprovação - Nível ${nextLevel}`
        });
      }
    }

    return approval;
  }

  static async rejectPurchaseOrder(
    orderId: string,
    data: { rejectedByUserId: string; rejectedAt: Date; comments: string }
  ): Promise<PurchaseApproval | undefined> {
    const approval = Array.from(this.approvals.values()).find(a => a.orderId === orderId && a.status === 'pending');
    if (!approval) {
      return undefined;
    }

    // Record the rejection action
    const action: ApprovalAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      approvalId: approval.id,
      userId: data.rejectedByUserId,
      action: 'rejected',
      level: approval.currentLevel,
      comments: data.comments,
      timestamp: data.rejectedAt
    };

    if (!this.actions.has(approval.id)) {
      this.actions.set(approval.id, []);
    }
    this.actions.get(approval.id)!.push(action);

    approval.status = 'rejected';
    approval.completedAt = data.rejectedAt;

    // Notify requester
    this.createNotification(approval.submittedByUserId, {
      approvalId: approval.id,
      type: 'approval_rejected',
      title: 'Aprovação Rejeitada',
      message: `Sua ordem de compra (${orderId}) foi rejeitada: ${data.comments}`
    });

    return approval;
  }

  static async requestRevision(
    orderId: string,
    data: { requestedByUserId: string; requestedAt: Date; comments: string }
  ): Promise<PurchaseApproval | undefined> {
    const approval = Array.from(this.approvals.values()).find(a => a.orderId === orderId && a.status === 'pending');
    if (!approval) {
      return undefined;
    }

    // Record the revision request action
    const action: ApprovalAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      approvalId: approval.id,
      userId: data.requestedByUserId,
      action: 'revision_requested',
      level: approval.currentLevel,
      comments: data.comments,
      timestamp: data.requestedAt
    };

    if (!this.actions.has(approval.id)) {
      this.actions.set(approval.id, []);
    }
    this.actions.get(approval.id)!.push(action);

    approval.status = 'revision_requested';

    // Notify requester
    this.createNotification(approval.submittedByUserId, {
      approvalId: approval.id,
      type: 'revision_requested',
      title: 'Revisão Solicitada',
      message: `Revisão solicitada para ordem de compra (${orderId}): ${data.comments}`
    });

    return approval;
  }

  static async getApprovalChains(filters: { active?: boolean }): Promise<ApprovalChain[]> {
    const allChains = Array.from(this.chains.values());
    
    return allChains.filter(chain => {
      const matchesActive = filters.active === undefined || chain.active === filters.active;
      return matchesActive;
    });
  }

  static async createApprovalChain(data: Omit<ApprovalChain, 'id'>): Promise<ApprovalChain> {
    const id = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const chain: ApprovalChain = {
      id,
      ...data
    };
    
    this.chains.set(id, chain);
    return chain;
  }

  static async updateApprovalChain(chainId: string, updates: Partial<ApprovalChain>): Promise<ApprovalChain | undefined> {
    const chain = this.chains.get(chainId);
    if (!chain) {
      return undefined;
    }
    
    const updatedChain = { ...chain, ...updates };
    this.chains.set(chainId, updatedChain);
    
    return updatedChain;
  }

  static async deleteApprovalChain(chainId: string): Promise<{ success: boolean }> {
    return { success: this.chains.delete(chainId) };
  }

  static async getPendingApprovals(filters: { userId?: string; priority?: string; department?: string }): Promise<PurchaseApproval[]> {
    const allApprovals = Array.from(this.approvals.values());
    
    return allApprovals.filter(approval => {
      if (approval.status !== 'pending') return false;
      
      if (filters.userId) {
        const chain = this.chains.get(approval.chainId);
        if (!chain) return false;
        
        const userIsApprover = chain.approvers.some(a => 
          a.userId === filters.userId && a.level === approval.currentLevel
        );
        if (!userIsApprover) return false;
      }
      
      if (filters.priority && approval.priority !== filters.priority) return false;
      
      return true;
    }).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  static async getUserPendingApprovals(userId: string): Promise<PurchaseApproval[]> {
    return this.getPendingApprovals({ userId });
  }

  static async getApprovalHistory(orderId: string): Promise<ApprovalAction[]> {
    const approval = Array.from(this.approvals.values()).find(a => a.orderId === orderId);
    if (!approval) {
      return [];
    }
    
    return this.actions.get(approval.id) || [];
  }

  static async getAllApprovalHistory(
    options: { page: number; limit: number; startDate?: Date; endDate?: Date }
  ): Promise<{ history: ApprovalAction[]; total: number; page: number; totalPages: number }> {
    const allActions = Array.from(this.actions.values()).flat();
    
    let filteredActions = allActions;
    
    // Filter by date range
    if (options.startDate || options.endDate) {
      filteredActions = allActions.filter(action => {
        const timestamp = action.timestamp.getTime();
        const afterStart = !options.startDate || timestamp >= options.startDate.getTime();
        const beforeEnd = !options.endDate || timestamp <= options.endDate.getTime();
        return afterStart && beforeEnd;
      });
    }
    
    // Sort by timestamp (newest first)
    filteredActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const total = filteredActions.length;
    const totalPages = Math.ceil(total / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const history = filteredActions.slice(startIndex, endIndex);
    
    return {
      history,
      total,
      page: options.page,
      totalPages
    };
  }

  static async getApprovalLimits(filters: { userId?: string; role?: string; active?: boolean }): Promise<ApprovalLimit[]> {
    const allLimits = Array.from(this.limits.values());
    
    return allLimits.filter(limit => {
      const matchesUser = !filters.userId || limit.userId === filters.userId;
      const matchesRole = !filters.role || limit.role === filters.role;
      const matchesActive = filters.active === undefined || limit.active === filters.active;
      return matchesUser && matchesRole && matchesActive;
    });
  }

  static async createApprovalLimit(data: Omit<ApprovalLimit, 'id'>): Promise<ApprovalLimit> {
    const id = `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const limit: ApprovalLimit = {
      id,
      ...data
    };
    
    this.limits.set(id, limit);
    return limit;
  }

  static async updateApprovalLimit(limitId: string, updates: Partial<ApprovalLimit>): Promise<ApprovalLimit | undefined> {
    const limit = this.limits.get(limitId);
    if (!limit) {
      return undefined;
    }
    
    const updatedLimit = { ...limit, ...updates };
    this.limits.set(limitId, updatedLimit);
    
    return updatedLimit;
  }

  static async deleteApprovalLimit(limitId: string): Promise<{ success: boolean }> {
    return { success: this.limits.delete(limitId) };
  }

  static async getApprovalNotifications(userId: string, options: { unreadOnly?: boolean }): Promise<ApprovalNotification[]> {
    const userNotifications = this.notifications.get(userId) || [];
    
    if (options.unreadOnly) {
      return userNotifications.filter(n => !n.read);
    }
    
    return userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async markNotificationRead(notificationId: string, userId: string): Promise<ApprovalNotification | undefined> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return undefined;
    }
    
    notification.read = true;
    notification.readAt = new Date();
    
    return notification;
  }

  private static createNotification(
    userId: string, 
    data: { approvalId: string; type: ApprovalNotification['type']; title: string; message: string }
  ): void {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: ApprovalNotification = {
      id,
      userId,
      read: false,
      createdAt: new Date(),
      ...data
    };
    
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    
    this.notifications.get(userId)!.push(notification);
  }
}