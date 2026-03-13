// Trip Detail Component
// Place this file in: apps/ui/src/components/TripDetail.tsx

import React from 'react';
import { useGetTripQuery } from '../graphql/generated/graphql';
import { TripStatus, TravellerRole } from '@travel-planner/shared';
import { format } from 'date-fns';

interface TripDetailProps {
  tripId: string;
}

export const TripDetail: React.FC<TripDetailProps> = ({ tripId }) => {
  const { data, loading, error } = useGetTripQuery({
    variables: { id: tripId },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data?.trip) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error Loading Trip</h3>
        <p className="text-sm text-red-600 mt-2">
          {error?.message || 'Trip not found'}
        </p>
      </div>
    );
  }

  const { trip } = data;

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
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string): string => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
            {trip.description && (
              <p className="text-gray-600">{trip.description}</p>
            )}
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              trip.status
            )}`}
          >
            {trip.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-400"
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
            <div>
              <p className="text-sm text-gray-500">Dates</p>
              <p className="font-medium">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-400"
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
            <div>
              <p className="text-sm text-gray-500">Travellers</p>
              <p className="font-medium">{trip.travellers.length} people</p>
            </div>
          </div>
        </div>
      </div>

      {/* Travellers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Travellers</h2>
        <div className="space-y-3">
          {trip.travellers.map((traveller) => (
            <div
              key={traveller.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{traveller.name}</p>
                <p className="text-sm text-gray-500">{traveller.email}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  traveller.role === TravellerRole.ORGANIZER
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {traveller.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Destinations */}
      {trip.destinations && trip.destinations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Destinations</h2>
          <div className="space-y-4">
            {trip.destinations.map((destination) => (
              <div key={destination.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">
                  {destination.name}, {destination.country}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(destination.arrivalDate)} -{' '}
                  {formatDate(destination.departureDate)}
                </p>
                {destination.description && (
                  <p className="text-gray-600 mt-2">{destination.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itinerary */}
      {trip.itinerary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Itinerary</h2>
          <div className="space-y-6">
            {trip.itinerary.days.map((day) => (
              <div key={day.id} className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">
                  Day {day.dayNumber} - {formatDate(day.date)}
                </h3>
                <div className="mt-3 space-y-3">
                  {day.activities.map((activity) => (
                    <div key={activity.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.description}
                            </p>
                          )}
                          {activity.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              📍 {activity.location}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-500">
                            {formatTime(activity.startTime)} -{' '}
                            {formatTime(activity.endTime)}
                          </p>
                          {activity.estimatedCost && (
                            <p className="text-gray-700 font-medium mt-1">
                              {activity.currency} {activity.estimatedCost}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Breakdown */}
      {trip.budgetBreakdown && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget</h2>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900">
              {trip.budgetBreakdown.currency} {trip.budgetBreakdown.totalBudget}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {trip.budgetBreakdown.tier} tier
            </p>
          </div>
          <div className="space-y-2">
            {trip.budgetBreakdown.categories.map((category, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{category.name}</span>
                <span className="font-medium text-gray-900">
                  {category.currency} {category.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
