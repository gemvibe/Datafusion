export type DispatchStatus = 
  | "pending"
  | "assigned"
  | "accepted"
  | "en_route"
  | "arrived"
  | "completed"
  | "cancelled";

export interface DispatchTicket {
  id: string;
  incidentId: string;
  assignedTeam: {
    id: string;
    name: string;
    members: string[];
  };
  assignedCenter: {
    id: string;
    name: string;
  };
  status: DispatchStatus;
  priority: number; // 1-10
  estimatedArrival?: Date;
  resources: {
    type: string;
    quantity: number;
  }[];
  notes: string;
  timeline: {
    timestamp: Date;
    event: string;
    by: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
