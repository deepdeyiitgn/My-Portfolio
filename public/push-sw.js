self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'New notification', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Deep Dey Notification';
  const options = {
    body: payload.body || 'You have a new alert.',
    icon: payload.icon || '/assets/images/myphoto.png',
    badge: payload.badge || '/assets/images/myphoto.png',
    data: {
      url: payload.url || '/notification',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notification';
  event.waitUntil(clients.openWindow(targetUrl));
});
