export type UserRole = "admin" | "command_center" | "responder" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  reliefCenterId?: string;
  teamId?: string;
  isActive: boolean;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReliefCenter {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity: number;
  currentLoad: number;
  operationalStatus: "active" | "inactive" | "full";
  resources: {
    type: string;
    quantity: number;
    unit: string;
  }[];
  contactInfo: {
    phone: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
