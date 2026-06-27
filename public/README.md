# Deep Ecosystem Remote JSON Guide

Place these JSON files inside your website (for example under /config/ or root).

## app-config.json
Controls global app behaviour.
Fields:
- version: current config version
- maintenance: true/false
- minAppVersion: minimum supported app build
- message: startup message

## websites.json
List of website cards.
Fields:
- name
- url
- favicon
- description

## social-links.json
List of social media links.
Fields:
- name
- url
- icon
- visible

## notification.json
Scheduled notifications.
Fields:
- id (unique)
- title
- message
- image
- time (ISO-8601)

## announcement.json
Dashboard announcement banner.
Fields:
- title
- message
- image
- active

## news.json
News cards.
Fields:
- title
- description
- url
- image

## quotes.json
Motivational quotes.
Fields:
- quote
- author

## theme.json
Remote theme options.
Fields:
- theme
- accent
- dynamicColor
- fontScale

## settings.json
General app settings.
Fields:
- offlineMode
- allowDownloads
- checkIntervalMinutes
- showGreeting

## browser.json
Browser behaviour.
Fields:
- javascript
- cache
- pullToRefresh
- safeBrowsing

## features.json
Enable/disable features remotely.
Fields:
- downloads
- offline
- search
- notifications

## search.json
Search engine settings.
Fields:
- offlineIndex
- fuzzySearch
- maxResults
- crawlVisitedPages

## version.json
App update information.
Fields:
- latest
- build
- forceUpdate
- downloadUrl

## maintenance.json
Maintenance mode.
Fields:
- enabled
- title
- message
- endTime

## changelog.json
Release history.
Fields:
- version
- date
- changes (array)

JSON Tips:
- Always use valid JSON.
- Use double quotes.
- Keep unique IDs for notifications.
- Time format should be ISO-8601 (YYYY-MM-DDTHH:MM:SSZ).
- Add new fields without removing existing ones to maintain compatibility.
