// Enums
export enum TripStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  SHARED = 'SHARED',
}

export enum BudgetTier {
  BUDGET = 'BUDGET',
  MID_RANGE = 'MID_RANGE',
  LUXURY = 'LUXURY',
}

export enum TravellerRole {
  ORGANIZER = 'ORGANIZER',
  FRIEND = 'FRIEND',
}

// Core Interfaces
export interface Trip {
  id: string;
  title: string;
  description?: string;
  status: TripStatus;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  destinations: Destination[];
  travellers: Traveller[];
  itinerary?: Itinerary;
  budgetBreakdown?: BudgetBreakdown;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  arrivalDate: string; // ISO 8601
  departureDate: string; // ISO 8601
  description?: string;
}

export interface Itinerary {
  id: string;
  tripId: string;
  days: ItineraryDay[];
  createdAt: string; // ISO 8601
}

export interface ItineraryDay {
  id: string;
  date: string; // ISO 8601
  dayNumber: number;
  activities: Activity[];
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  location?: string;
  estimatedCost?: number;
  currency?: string;
}

export interface Traveller {
  id: string;
  name: string;
  email: string;
  role: TravellerRole;
  joinedAt: string; // ISO 8601
}

export interface BudgetBreakdown {
  totalBudget: number;
  currency: string; // ISO 4217 currency code
  tier: BudgetTier;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  amount: number;
  currency: string; // ISO 4217 currency code
}

// Input Types
export interface CreateTripInput {
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  budgetTier?: BudgetTier;
}

export interface AddTravellerInput {
  tripId: string;
  name: string;
  email: string;
  role: TravellerRole;
}

export interface PlanItineraryInput {
  tripId: string;
  preferences?: string;
}
