'use client';

import { useState } from 'react';
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

export default function FlightLookup() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);
        setSearched(true);

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

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'on time': return styles.statusOnTime;
            case 'delayed': return styles.statusDelayed;
            case 'scheduled': return styles.statusScheduled;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Flight Tracker</h1>

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
                    </div>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Searching...' : 'Track Flight'}
                    </button>
                </form>

                {error && <div className={styles.error}>{error}</div>}

                {results.length > 0 && (
                    <div className={styles.results}>
                        {results.map((flight) => (
                            <div key={flight.flightNumber} className={styles.resultCard}>
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
