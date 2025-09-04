## URL Shortener Web App

This project is part of the **AffordMed Campus Hiring Evaluation – Frontend**.  
The task is to build a **user-friendly React-based URL Shortener** that provides:
- Core URL shortening functionality
- Analytics & insights (click tracking, expiry, source, location)
- All managed within the **client-side React application**


## Features
- Shorten up to **5 URLs concurrently**
- Generate **unique shortcodes** automatically or via user input
- Set **expiry time** for shortened URLs (default: 30 minutes)
- **Redirection support** for shortened links (client-side routing)
- **Analytics Dashboard**:
  - List of all shortened URLs
  - Expiry dates, click counts
  - Click details (timestamp, source, location)
- **Error handling** with clear user messages
- Built using **React + Material UI** for a clean and responsive UI


##  Tech Stack

* **React** – Frontend framework
* **Material UI (MUI)** – UI components
* **React Router** – Client-side routing
* **Custom Middleware** – Logging & error tracking


## How It Works

1. Enter a **long URL**, optional **expiry time**, and **custom shortcode**.
2. The app validates input and generates a **shortened URL**.
3. All shortened URLs are listed with their expiry time.
4. Clicking on a short link redirects to the original URL.
5. The **Statistics Page** displays:

   * Short link details
   * Click counts
   * Timestamps, sources, and approximate geo-location
