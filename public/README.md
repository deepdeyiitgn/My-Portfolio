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



---

# 1. app-config.json

```json
{
  "version": "1.0.0",
  "maintenance": false,
  "minAppVersion": 1,
  "startupMessage": "Welcome to Deep Ecosystem",
  "theme": "system",
  "notificationCheckInterval": 30
}
```

### Fields

| Field                     | Description                   |
| ------------------------- | ----------------------------- |
| version                   | Config version                |
| maintenance               | Maintenance mode              |
| minAppVersion             | Minimum supported app version |
| startupMessage            | Startup message               |
| theme                     | light/dark/system             |
| notificationCheckInterval | Minutes                       |

---

# 2. websites.json

```json
[
  {
    "id": "portfolio",
    "name": "Portfolio",
    "url": "https://deepdey.vercel.app/",
    "favicon": "https://www.google.com/s2/favicons?domain=deepdey.vercel.app&sz=64",
    "description": "Official Portfolio",
    "category": "Official",
    "allowOffline": true,
    "showOnDashboard": true
  }
]
```

---

# 3. social-links.json

```json
[
  {
    "name": "GitHub",
    "url": "https://github.com/deepdeyiitgn",
    "icon": "https://github.com/deepdeyiitgn.png",
    "visible": true,
    "category": "Developer"
  }
]
```

---

# 4. notification.json

```json
{
  "notifications": [
    {
      "id": "001",
      "title": "New Update",
      "message": "Portfolio Updated",
      "image": "",
      "time": "2026-06-28T10:00:00Z",
      "expire": "2026-07-05T00:00:00Z",
      "priority": "high",
      "url": "https://deepdey.vercel.app/"
    }
  ]
}
```

---

# 5. announcement.json

```json
{
  "active": true,
  "title": "Announcement",
  "message": "Welcome!",
  "image": "",
  "buttonText": "Open",
  "buttonUrl": "https://deepdey.vercel.app/"
}
```

---

# 6. news.json

```json
[
  {
    "title": "News",
    "description": "Latest news",
    "image": "",
    "url": "",
    "date": "2026-06-28"
  }
]
```

---

# 7. changelog.json

```json
[
  {
    "version": "1.0.0",
    "date": "2026-06-28",
    "changes": [
      "Added Browser",
      "Added Offline"
    ]
  }
]
```

---

# 8. quotes.json

```json
[
  {
    "quote": "Stay Consistent.",
    "author": "Deep"
  }
]
```

---

# 9. browser.json

```json
{
  "javascript": true,
  "cache": true,
  "safeBrowsing": true,
  "pullRefresh": true,
  "darkMode": "auto",
  "zoom": true
}
```

---

# 10. search.json

```json
{
  "offlineSearch": true,
  "fuzzySearch": true,
  "crawlPages": true,
  "maxResults": 25
}
```

---

# 11. features.json

```json
{
  "downloads": true,
  "offline": true,
  "search": true,
  "bookmarks": true,
  "history": true,
  "notifications": true
}
```

---

# 12. theme.json

```json
{
  "theme": "system",
  "dynamicColor": true,
  "accent": "#1976D2",
  "cornerRadius": 20
}
```

---

# 13. settings.json

```json
{
  "allowDownloads": true,
  "allowOffline": true,
  "clearCacheAllowed": true,
  "analytics": false
}
```

---

# 14. version.json

```json
{
  "latest": "1.0.0",
  "build": 1,
  "forceUpdate": false,
  "downloadUrl": ""
}
```

---

# 15. maintenance.json

```json
{
  "enabled": false,
  "title": "Maintenance",
  "message": "We'll be back soon.",
  "endTime": ""
}
```

---

# 16. dashboard.json

```json
{
  "showGreeting": true,
  "showTime": true,
  "showDate": true,
  "showDownloads": true,
  "showBookmarks": true,
  "showNotifications": true
}
```

---

# 17. menu.json

```json
[
  {
    "title": "Home",
    "icon": "home",
    "action": "dashboard"
  },
  {
    "title": "Settings",
    "icon": "settings",
    "action": "settings"
  }
]
```

---

# 18. bookmarks-default.json

```json
[
  {
    "title": "Portfolio",
    "url": "https://deepdey.vercel.app/"
  }
]
```

---

# 19. updates.json

```json
{
  "checkAutomatically": true,
  "channel": "stable",
  "lastChecked": ""
}
```

---

# 20. splash.json

```json
{
  "animation": "fade",
  "duration": 1500,
  "showVersion": true
}
```

---

# README Documentation Format

Har JSON ke liye README me aise likhna:

````md
# notification.json

## Purpose

Controls scheduled notifications shown by the Android app.

---

## Example

```json
{
  "notifications": [
    {
      "id": "001",
      "title": "Welcome",
      "message": "Hello World",
      "image": "",
      "time": "2026-06-28T10:00:00Z",
      "priority": "high"
    }
  ]
}
```

---

## Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | String | Yes | Unique notification ID |
| title | String | Yes | Notification title |
| message | String | Yes | Notification body |
| image | URL | No | Notification image |
| time | ISO Date | Yes | Delivery time |
| priority | low/normal/high | No | Notification priority |

---

## Notes

- Every ID must be unique.
- Use ISO-8601 time format.
- Expired notifications should be ignored.
- Image field can be empty.
- Future fields should be ignored gracefully by older app versions.
````

---

## 💡 Future enhancement

Main recommend karunga ki har JSON me ye 4 optional metadata fields bhi support karao:

```json
{
  "_schema": "1.0",
  "_lastUpdated": "2026-06-28T10:00:00Z",
  "_generatedBy": "Deep Ecosystem",
  "_enabled": true
}
```

Isse future me schema migration, debugging aur compatibility maintain karna bahut easy ho jayega.

