export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  rescueShelterId?: string;
  teamId?: string;
  isActive: boolean;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RescueShelter {
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
