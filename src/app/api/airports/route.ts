import { NextResponse } from 'next/server';

// Mock airport data as fallback (Aviation Stack free tier doesn't support airports endpoint)
const MOCK_AIRPORTS = [
    { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
    { iata: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
    { iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
    { iata: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
    { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
    { iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States' },
    { iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
    { iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
    { iata: 'BOM', name: 'Chhatrapati Shivaji International Airport', city: 'Mumbai', country: 'India' },
    { iata: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
    { iata: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India' },
    { iata: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia' },
    { iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
    { iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
    { iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search || search.length < 2) {
        return NextResponse.json([]);
    }

    // Use mock data instead of API call (free tier restriction)
    const searchLower = search.toLowerCase();
    const filtered = MOCK_AIRPORTS.filter(airport =>
        airport.iata.toLowerCase().includes(searchLower) ||
        airport.name.toLowerCase().includes(searchLower) ||
        airport.city.toLowerCase().includes(searchLower)
    );

    return NextResponse.json(filtered.slice(0, 10));
}
