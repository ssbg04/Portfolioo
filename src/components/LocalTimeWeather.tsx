import React, { useState, useEffect } from 'react';

interface Props {
  latitude?: number;
  longitude?: number;
}

interface WeatherState {
  temp: number | null;
  code: number | null;
  isDay: boolean;
  loading: boolean;
  error: boolean;
}

const LATITUDE = 14.130792771445167;
const LONGITUDE = 121.43629230199042;

function getManilaDateTime() {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now);

  return { time, date };
}

function getWeatherIcon(code: number | null, isDay: boolean) {
  if (code === null) {
    return (
      <svg className="w-3.5 h-3.5 text-muted-foreground-custom animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  // Clear / Sunny
  if (code === 0) {
    if (isDay) {
      return (
        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 text-primary-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </svg>
    );
  }

  // Mainly Clear / Partly Cloudy
  if (code === 1 || code === 2) {
    return (
      <svg className="w-3.5 h-3.5 text-primary-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    );
  }

  // Overcast
  if (code === 3) {
    return (
      <svg className="w-3.5 h-3.5 text-muted-foreground-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
      </svg>
    );
  }

  // Rain / Drizzle / Showers
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <svg className="w-3.5 h-3.5 text-primary-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Zm6 5.25v1.5m4.5-1.5v1.5m4.5-1.5v1.5" />
      </svg>
    );
  }

  // Thunderstorm
  if (code >= 95) {
    return (
      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    );
  }

  // Fog / Mist
  return (
    <svg className="w-3.5 h-3.5 text-muted-foreground-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 3.75h16.5m-16.5 3.75h16.5" />
    </svg>
  );
}

function getWeatherDescription(code: number | null): string {
  if (code === null) return 'Loading...';
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

export default function LocalTimeWeather({
  latitude = LATITUDE,
  longitude = LONGITUDE
}: Props) {
  const [dateTime, setDateTime] = useState(getManilaDateTime);
  const [weather, setWeather] = useState<WeatherState>({
    temp: null,
    code: null,
    isDay: true,
    loading: true,
    error: false,
  });

  // Clock tick every 1 second (PHT)
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getManilaDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Open-Meteo current weather for coordinates
  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=Asia%2FManila`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();

        if (isMounted && data?.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
            isDay: Boolean(data.current.is_day),
            loading: false,
            error: false,
          });
        }
      } catch (err) {
        if (isMounted) {
          setWeather((prev) => ({ ...prev, loading: false, error: true }));
        }
      }
    }

    fetchWeather();
    // Refresh weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(weatherInterval);
    };
  }, [latitude, longitude]);

  return (
    <>
      {/* Local Time (PHT) */}
      <div className="flex justify-between items-center py-1 border-b border-border-custom/50">
        <span className="font-mono text-muted-foreground-custom">Local Time</span>
        <div className="flex items-center gap-1.5 font-mono text-foreground-custom">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-xs">{dateTime.time}</span>
          <span className="text-[10px] text-muted-foreground-custom font-medium">PHT</span>
        </div>
      </div>

      {/* Date */}
      <div className="flex justify-between items-center py-1 border-b border-border-custom/50">
        <span className="font-mono text-muted-foreground-custom">Date</span>
        <span className="font-mono text-foreground-custom text-xs font-medium">
          {dateTime.date}
        </span>
      </div>

      {/* Weather */}
      <div className="flex justify-between items-center py-1 border-b border-border-custom/50">
        <span className="font-mono text-muted-foreground-custom">Weather</span>
        <div className="flex items-center gap-1.5 font-mono text-foreground-custom">
          {getWeatherIcon(weather.code, weather.isDay)}
          <span className="font-semibold text-xs">
            {weather.temp !== null ? `${weather.temp}°C` : weather.loading ? '...' : '--'}
          </span>
          <span className="text-[10px] text-muted-foreground-custom">
            ({getWeatherDescription(weather.code)})
          </span>
        </div>
      </div>
    </>
  );
}
