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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flightNumber');
  const flightDate = searchParams.get('flight_date');
  const depIata = searchParams.get('dep_iata');
  const arrIata = searchParams.get('arr_iata');
  const apiKey = process.env.AVIATION_STACK_API_KEY;

  // Debug logging
  console.log('Environment check:', {
    hasApiKey: !!apiKey,
    nodeEnv: process.env.NODE_ENV,
    flightNumber,
    flightDate,
    depIata,
    arrIata
  });

  if (!apiKey) {
    console.error('AVIATION_STACK_API_KEY is not set!');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  // Determine search type and construct URL
  let apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}`;

  if (flightNumber) {
    apiUrl += `&flight_iata=${flightNumber}`;
  } else if (flightDate && depIata && arrIata) {
    apiUrl += `&flight_date=${flightDate}&dep_iata=${depIata}&arr_iata=${arrIata}`;
  } else {
    // Missing required params
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 60 } });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Aviation Stack API Error: Status ${response.status}`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Log unexpected data structure
    if (!data.data && data.error) {
      console.error('Aviation Stack API Logical Error:', data.error);
      return NextResponse.json({ error: data.error.info || 'Upstream API Error' }, { status: 500 });
    }

    if (!data.data) {
      console.error('Aviation Stack API: No "data" field in response', data);
      return NextResponse.json([]);
    }

    const mappedFlights: Flight[] = data.data.map((flight: any) => ({
      flightNumber: flight.flight?.iata || flightNumber,
      airline: flight.airline?.name || 'Unknown Airline',
      startLocation: `${flight.departure?.iata} - ${flight.departure?.airport}`,
      endLocation: `${flight.arrival?.iata} - ${flight.arrival?.airport}`,
      startTime: flight.departure?.scheduled,
      endTime: flight.arrival?.scheduled,
      timeZoneStart: flight.departure?.timezone || 'UTC',
      timeZoneEnd: flight.arrival?.timezone || 'UTC',
      status: flight.flight_status || 'Unknown',
    }));

    return NextResponse.json(mappedFlights);

  } catch (error) {
    console.error('Error fetching flight data:', error);
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
  }
}
