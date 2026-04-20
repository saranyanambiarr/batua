auth.js -> (Utility Module for managing user sessions) where you centralize the logic for remembering a user after they log in; uses browser's LocalStorage which is a small DB in the web browser that persists even if you refresh the page or close the tab.

P.S.: Use HTTP Cookies when going into prod and not LocalStorage as it's prone to XSS attack

config.js -> set up backend base url; fastapi runs on 8000


