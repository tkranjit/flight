import { NextResponse } from 'next/server';

interface Flight {
  flightNumber: string;
  airline: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  timeZoneStart: string;
  timeZoneEnd: string;
  status: string;
}

const MOCK_FLIGHTS: Flight[] = [
  {
    flightNumber: 'AA123',
    airline: 'American Airlines',
    startLocation: 'JFK - New York',
    endLocation: 'LHR - London',
    startTime: '2025-12-18T18:30:00',
    endTime: '2025-12-19T06:30:00',
    timeZoneStart: 'EST',
    timeZoneEnd: 'GMT',
    status: 'On Time',
  },
  {
    flightNumber: 'BA456',
    airline: 'British Airways',
    startLocation: 'LHR - London',
    endLocation: 'DXB - Dubai',
    startTime: '2025-12-20T09:15:00',
    endTime: '2025-12-20T20:15:00',
    timeZoneStart: 'GMT',
    timeZoneEnd: 'GST',
    status: 'Delayed',
  },
  {
    flightNumber: 'DL789',
    airline: 'Delta',
    startLocation: 'LAX - Los Angeles',
    endLocation: 'HND - Tokyo',
    startTime: '2025-12-21T11:00:00',
    endTime: '2025-12-22T15:30:00',
    timeZoneStart: 'PST',
    timeZoneEnd: 'JST',
    status: 'Scheduled',
  },
  {
    flightNumber: 'QF1',
    airline: 'Qantas',
    startLocation: 'SYD - Sydney',
    endLocation: 'SIN - Singapore',
    startTime: '2025-12-22T16:00:00',
    endTime: '2025-12-22T21:20:00',
    timeZoneStart: 'AEDT',
    timeZoneEnd: 'SGT',
    status: 'On Time',
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flightNumber');

  if (!flightNumber) {
    return NextResponse.json(MOCK_FLIGHTS);
  }

  const normalizedQuery = flightNumber.trim().toUpperCase();
  const results = MOCK_FLIGHTS.filter(flight => 
    flight.flightNumber.toUpperCase() === normalizedQuery
  );

  return NextResponse.json(results);
}
