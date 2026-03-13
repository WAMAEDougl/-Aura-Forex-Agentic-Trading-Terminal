// Trip Card Component
// Place this file in: apps/ui/src/components/TripCard.tsx

import React from 'react';
import { Trip, TripStatus } from '@travel-planner/shared';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onViewDetails?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onViewDetails }) => {
  const getStatusColor = (status: TripStatus): string => {
    switch (status) {
      case TripStatus.DRAFT:
        return 'bg-gray-200 text-gray-800';
      case TripStatus.PLANNED:
        return 'bg-blue-200 text-blue-800';
      case TripStatus.SHARED:
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{trip.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            trip.status
          )}`}
        >
          {trip.status}
        </span>
      </div>

      {/* Description */}
      {trip.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
      )}

      {/* Dates */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </span>
      </div>

      {/* Travellers */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span>{trip.travellers.length} traveller(s)</span>
      </div>

      {/* Destinations */}
      {trip.destinations && trip.destinations.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>
            {trip.destinations.map((d) => d.name).join(', ')}
          </span>
        </div>
      )}

      {/* View Details Button */}
      {onViewDetails && (
        <button
          onClick={() => onViewDetails(trip.id)}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  );
};
