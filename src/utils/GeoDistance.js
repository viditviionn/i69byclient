export function calculateDistance(lat1, lon1, lat2, lon2) {
    // Convert degrees to radians
    const toRadians = (angle) => angle * (Math.PI / 180);

    // Earth's radius (mean radius in meters)
    const R = 6371000; // meters

    // Convert latitude and longitude to radians
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    // Haversine formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in meters
    const distance = R * c;

    return Math.round(distance/1000);
}
