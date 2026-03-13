// Home Page - Trip List
// Place this file in: apps/ui/src/pages/index.tsx

import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../lib/apollo-client';
import { TripList } from '../components/TripList';
import { CreateTripForm } from '../components/CreateTripForm';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  const handleViewTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  const handleCreateSuccess = (tripId: string) => {
    setShowCreateForm(false);
    router.push(`/trips/${tripId}`);
  };

  return (
    <ApolloProvider client={apolloClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Travel Planner
              </h1>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {showCreateForm ? 'Cancel' : 'Create New Trip'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showCreateForm ? (
            <CreateTripForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : (
            <TripList onViewTrip={handleViewTrip} />
          )}
        </main>
      </div>
    </ApolloProvider>
  );
}
