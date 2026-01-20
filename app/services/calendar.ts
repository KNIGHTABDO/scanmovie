/**
 * Calendar Integration Service
 * ============================
 * Generates calendar events for movie releases and watch parties.
 * Supports: Google Calendar, Apple Calendar (ICS), Outlook
 */

import type { Movie } from './tmdb';

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  url?: string;
}

/**
 * Generate ICS (iCalendar) file content
 */
export function generateICS(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@scanmovie.app`;
  const now = formatDate(new Date());
  const start = formatDate(event.startDate);
  const end = event.endDate ? formatDate(event.endDate) : formatDate(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000)); // Default 2 hours

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScanMovie//Movie Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
  ];

  if (event.location) {
    ics.push(`LOCATION:${escapeText(event.location)}`);
  }

  if (event.url) {
    ics.push(`URL:${event.url}`);
  }

  ics.push('END:VEVENT', 'END:VCALENDAR');

  return ics.join('\r\n');
}

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDateForGoogle = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatDateForGoogle(event.startDate);
  const end = event.endDate 
    ? formatDateForGoogle(event.endDate) 
    : formatDateForGoogle(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000));

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 */
export function getOutlookCalendarUrl(event: CalendarEvent): string {
  const formatDateForOutlook = (date: Date): string => {
    return date.toISOString();
  };

  const start = formatDateForOutlook(event.startDate);
  const end = event.endDate 
    ? formatDateForOutlook(event.endDate) 
    : formatDateForOutlook(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000));

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start,
    enddt: end,
    body: event.description,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Download ICS file
 */
export function downloadICS(event: CalendarEvent, filename?: string) {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create movie release event
 */
export function createMovieReleaseEvent(movie: Movie): CalendarEvent {
  const releaseDate = movie.release_date 
    ? new Date(movie.release_date + 'T19:00:00') // Default to 7 PM
    : new Date();

  return {
    title: `🎬 ${movie.title} Release`,
    description: `${movie.title} is now in theaters!\n\n${movie.overview || ''}\n\n🎞️ Added via ScanMovie`,
    startDate: releaseDate,
    endDate: new Date(releaseDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours
    url: `https://scanmovie.app/movie/${movie.id}`,
  };
}

/**
 * Create watch party event
 */
export function createWatchPartyEvent(
  partyName: string,
  movies: Movie[],
  date: Date,
  location?: string
): CalendarEvent {
  const movieList = movies.map(m => `• ${m.title}`).join('\n');
  
  return {
    title: `🍿 ${partyName}`,
    description: `Watch Party!\n\nMovies:\n${movieList}\n\n🎞️ Created via ScanMovie`,
    startDate: date,
    endDate: new Date(date.getTime() + movies.length * 2.5 * 60 * 60 * 1000), // ~2.5 hours per movie
    location,
    url: 'https://scanmovie.app/watch-party',
  };
}

/**
 * Create reminder event
 */
export function createMovieReminderEvent(
  movie: Movie,
  reminderDate: Date,
  message?: string
): CalendarEvent {
  return {
    title: `📺 Watch: ${movie.title}`,
    description: message || `Don't forget to watch ${movie.title}!\n\n${movie.overview || ''}\n\n🎞️ Reminder from ScanMovie`,
    startDate: reminderDate,
    endDate: new Date(reminderDate.getTime() + (movie.runtime || 120) * 60 * 1000),
    url: `https://scanmovie.app/movie/${movie.id}`,
  };
}
