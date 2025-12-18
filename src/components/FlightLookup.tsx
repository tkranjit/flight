'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './FlightLookup.module.css';

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

interface Airport {
    iata: string;
    name: string;
    city: string;
    country: string;
}

export default function FlightLookup() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Flight[]>([]);
    const [suggestions, setSuggestions] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Route Search State
    const [activeTab, setActiveTab] = useState<'number' | 'route'>('number');
    const [routeDate, setRouteDate] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<Airport[]>([]);

    // Debounce search for autocomplete (Flight Number)
    useEffect(() => {
        if (activeTab !== 'number') return;

        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await fetch(`/api/flights?flightNumber=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 500);
        return () => clearTimeout(timeoutId);
    }, [query, activeTab]);

    // Autocomplete for Origin
    useEffect(() => {
        if (activeTab !== 'route') return;

        const fetchAirports = async () => {
            if (origin.length < 2) {
                setOriginSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`/api/airports?search=${encodeURIComponent(origin)}`);
                if (res.ok) setOriginSuggestions(await res.json());
            } catch (e) { console.error(e); }
        };

        const timer = setTimeout(fetchAirports, 300);
        return () => clearTimeout(timer);
    }, [origin, activeTab]);

    // Autocomplete for Destination
    useEffect(() => {
        if (activeTab !== 'route') return;

        const fetchAirports = async () => {
            if (destination.length < 2) {
                setDestSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`/api/airports?search=${encodeURIComponent(destination)}`);
                if (res.ok) setDestSuggestions(await res.json());
            } catch (e) { console.error(e); }
        };

        const timer = setTimeout(fetchAirports, 300);
        return () => clearTimeout(timer);
    }, [destination, activeTab]);

    const handleRouteSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setOriginSuggestions([]);
        setDestSuggestions([]);

        if (!routeDate || !origin || !destination) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setError('');
        setResults([]);

        try {
            // Extract IATA code from "IATA - City" format or just use raw input if not selected
            const getIata = (val: string) => val.split(' - ')[0] || val;

            const params = new URLSearchParams({
                flight_date: routeDate,
                dep_iata: getIata(origin),
                arr_iata: getIata(destination)
            });

            const response = await fetch(`/api/flights?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch flight data');

            const data = await response.json();
            setResults(data);

            if (data.length === 0) {
                setError('No flights found for this route.');
            }
        } catch (err) {
            setError('Error fetching flights. Check your input.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuggestions([]); // Clear suggestions on search
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const response = await fetch(`/api/flights?flightNumber=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to fetch flight data');

            const data = await response.json();
            setResults(data);

            if (data.length === 0) {
                setError('No flights found with that number.');
            }
        } catch (err) {
            setError('An error occurred while fetching flight details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectSuggestion = (flight: Flight) => {
        setQuery(flight.flightNumber);
        setSuggestions([]);
        setResults([flight]); // Immediately show result
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'on time': return styles.statusOnTime;
            case 'active': return styles.statusOnTime;
            case 'landing': return styles.statusOnTime;
            case 'delayed': return styles.statusDelayed;
            case 'scheduled': return styles.statusScheduled;
            case 'cancelled':
            case 'canceled': return styles.statusDelayed;
            default: return '';
        }
    };

    const generateGoogleCalendarUrl = (flight: Flight) => {
        const formatDateForCal = (dateStr: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const title = `Flight ${flight.flightNumber} - ${flight.airline}`;
        const details = `Flight Status: ${flight.status}\nAirline: ${flight.airline}`;
        const location = `${flight.startLocation} to ${flight.endLocation}`;
        const start = formatDateForCal(flight.startTime);
        const end = formatDateForCal(flight.endTime);

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&dates=${start}/${end}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Image
                    src="/logo.png"
                    alt="Flight Tracker Logo"
                    width={100}
                    height={100}
                    className={styles.logo}
                    priority
                />
                <h1 className={styles.title}>Flight Tracker</h1>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'number' ? styles.active : ''}`}
                        onClick={() => setActiveTab('number')}
                    >
                        Flight Number
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'route' ? styles.active : ''}`}
                        onClick={() => setActiveTab('route')}
                    >
                        Route
                    </button>
                </div>

                {activeTab === 'number' ? (
                    <form onSubmit={handleSearch} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="flightNumber" className={styles.label}>Flight Number</label>
                            <input
                                id="flightNumber"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., AA123"
                                className={styles.input}
                                autoComplete="off"
                            />
                            {suggestions.length > 0 && (
                                <ul className={styles.suggestionsList}>
                                    {suggestions.map((flight, index) => (
                                        <li
                                            key={`${flight.flightNumber}-${index}`}
                                            className={styles.suggestionItem}
                                            onClick={() => selectSuggestion(flight)}
                                        >
                                            <span className={styles.suggestionCode}>{flight.flightNumber}</span>
                                            <span className={styles.suggestionAirline}>{flight.airline}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Searching...' : 'Track Flight'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRouteSearch} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="routeDate" className={styles.label}>Date</label>
                            <input
                                id="routeDate"
                                type="date"
                                value={routeDate}
                                onChange={(e) => setRouteDate(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="origin" className={styles.label}>From</label>
                            <input
                                id="origin"
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="City or Airport (e.g. JFK)"
                                className={styles.input}
                                autoComplete="off"
                            />
                            {originSuggestions.length > 0 && (
                                <ul className={styles.suggestionsList}>
                                    {originSuggestions.map((airport, index) => (
                                        <li
                                            key={`${airport.iata}-${index}`}
                                            className={styles.suggestionItem}
                                            onClick={() => {
                                                setOrigin(`${airport.iata} - ${airport.name}`);
                                                setOriginSuggestions([]);
                                            }}
                                        >
                                            <span className={styles.suggestionCode}>{airport.iata}</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className={styles.suggestionAirline}>{airport.name}</div>
                                                <div className={styles.suggestionAirline}>{airport.city}, {airport.country}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="destination" className={styles.label}>To</label>
                            <input
                                id="destination"
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="City or Airport (e.g. LHR)"
                                className={styles.input}
                                autoComplete="off"
                            />
                            {destSuggestions.length > 0 && (
                                <ul className={styles.suggestionsList}>
                                    {destSuggestions.map((airport, index) => (
                                        <li
                                            key={`${airport.iata}-${index}`}
                                            className={styles.suggestionItem}
                                            onClick={() => {
                                                setDestination(`${airport.iata} - ${airport.name}`);
                                                setDestSuggestions([]);
                                            }}
                                        >
                                            <span className={styles.suggestionCode}>{airport.iata}</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div className={styles.suggestionAirline}>{airport.name}</div>
                                                <div className={styles.suggestionAirline}>{airport.city}, {airport.country}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Searching...' : 'Search Route'}
                        </button>
                    </form>
                )}

                {error && <div className={styles.error}>{error}</div>}

                {results.length > 0 && (
                    <div className={styles.results}>
                        {results.map((flight, index) => (
                            <div
                                key={`${flight.flightNumber}-${index}`}
                                className={styles.resultCard}
                                onClick={() => window.open(generateGoogleCalendarUrl(flight), '_blank')}
                                title="Click to add to Google Calendar"
                            >
                                <div className={styles.flightHeader}>
                                    <div>
                                        <div className={styles.flightNumber}>{flight.flightNumber}</div>
                                        <div className={styles.airline}>{flight.airline}</div>
                                    </div>
                                    <span className={`${styles.status} ${getStatusClass(flight.status)}`}>
                                        {flight.status}
                                    </span>
                                </div>

                                <div className={styles.routeContainer}>
                                    <div className={styles.location} style={{ textAlign: 'left' }}>
                                        <span className={styles.locationCode}>{flight.startLocation.split(' - ')[0]}</span>
                                        <span className={styles.locationCity}>{flight.startLocation.split(' - ')[1]}</span>
                                    </div>

                                    <div className={styles.flightPath}>
                                        <div className={styles.planeIcon}>✈️</div>
                                        <div className={styles.pathLine}></div>
                                    </div>

                                    <div className={styles.location} style={{ textAlign: 'right' }}>
                                        <span className={styles.locationCode}>{flight.endLocation.split(' - ')[0]}</span>
                                        <span className={styles.locationCity}>{flight.endLocation.split(' - ')[1]}</span>
                                    </div>
                                </div>

                                <div className={styles.timeContainer}>
                                    <div className={styles.timeBlock} style={{ textAlign: 'left' }}>
                                        <span className={styles.time}>{formatTime(flight.startTime)}</span>
                                        <span className={styles.date}>{formatDate(flight.startTime)}</span>
                                        <div className={styles.timezone}>{flight.timeZoneStart}</div>
                                    </div>

                                    <div className={styles.timeBlock} style={{ textAlign: 'right' }}>
                                        <span className={styles.time}>{formatTime(flight.endTime)}</span>
                                        <span className={styles.date}>{formatDate(flight.endTime)}</span>
                                        <div className={styles.timezone}>{flight.timeZoneEnd}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
