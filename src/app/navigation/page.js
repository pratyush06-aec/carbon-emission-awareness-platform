'use client';
import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import styles from './page.module.css';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const center = {
  lat: 28.6139,
  lng: 77.2090
}; // Default to New Delhi

export default function Navigation() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [carbonMetrics, setCarbonMetrics] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const calculateRoute = async () => {
    if (!sourceRef.current?.value || !destRef.current?.value) return;

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: sourceRef.current.value,
        destination: destRef.current.value,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);
      const distInMeters = results.routes[0].legs[0].distance.value;
      const distInKm = (distInMeters / 1000).toFixed(1);
      setDistance(distInKm);
      
      // Rough carbon calculations (kg CO2 per km)
      const cabCarbon = (distInKm * 0.21).toFixed(2);
      const metroCarbon = (distInKm * 0.03).toFixed(2);
      const savings = (cabCarbon - metroCarbon).toFixed(2);
      
      setCarbonMetrics({
        cab: cabCarbon,
        metro: metroCarbon,
        savings: savings
      });

      setShowRoutes(true);
    } catch (error) {
      console.error('Error fetching directions', error);
      alert('Could not find route. Please ensure the locations are correct.');
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Carbon-Aware Navigation</h1>
        <p className={styles.subtitle}>Find the greenest, fastest, or cheapest route to your destination.</p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <div className={styles.inputCard}>
            {isLoaded ? (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="source-input">Source</label>
                  <Autocomplete>
                    <input 
                      id="source-input"
                      type="text" 
                      className={styles.inputField} 
                      placeholder="e.g. Home" 
                      ref={sourceRef}
                    />
                  </Autocomplete>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="dest-input">Destination</label>
                  <Autocomplete>
                    <input 
                      id="dest-input"
                      type="text" 
                      className={styles.inputField} 
                      placeholder="e.g. Office" 
                      ref={destRef}
                    />
                  </Autocomplete>
                </div>
                <button className={styles.calculateBtn} onClick={calculateRoute}>Calculate Routes</button>
              </>
            ) : (
              <div>Loading Map Services...</div>
            )}
          </div>

          {showRoutes && carbonMetrics && (
            <div className={styles.routesContainer} aria-live="polite">
              <div className={styles.routeCard}>
                <div className={styles.routeHeader}>
                  <span className={styles.routeName}>Fastest (Car/Cab)</span>
                  <span className={styles.routeDistance}>{distance} km</span>
                </div>
                <div className={styles.routeMetrics}>
                  <span className={styles.routeMode}>Driving</span>
                  <span className={styles.routeCarbon}>{carbonMetrics.cab} kg CO₂</span>
                </div>
              </div>

              <div className={`${styles.routeCard} ${styles.greenRoute}`}>
                <div className={styles.routeHeader}>
                  <span className={styles.routeName}>Greenest Alternative</span>
                  <span className={styles.routeDistance}>{distance} km</span>
                </div>
                <div className={styles.routeMetrics}>
                  <span className={styles.routeMode}>Metro / Public Transit</span>
                  <span className={styles.routeCarbon}>{carbonMetrics.metro} kg CO₂</span>
                </div>
                
                <div className={styles.tangibleImpact}>
                  <div className={styles.impactTitle}>You save {carbonMetrics.savings} kg CO₂. Equivalent to:</div>
                  <ul className={styles.impactList}>
                    <li>📱 Charging {Math.round(carbonMetrics.savings * 80)} smartphones</li>
                    <li>💡 Keeping a bulb on for {Math.round(carbonMetrics.savings * 30)} hours</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.mapContainer}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={10}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{ disableDefaultUI: true, styles: [ { "elementType": "geometry", "stylers": [ { "color": "#212121" } ] }, { "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#757575" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#212121" } ] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [ { "color": "#757575" } ] }, { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [ { "color": "#9e9e9e" } ] }, { "featureType": "administrative.land_parcel", "stylers": [ { "visibility": "off" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#bdbdbd" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#757575" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#181818" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#616161" } ] }, { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1b1b1b" } ] }, { "featureType": "road", "elementType": "geometry.fill", "stylers": [ { "color": "#2c2c2c" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#8a8a8a" } ] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [ { "color": "#373737" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#3c3c3c" } ] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [ { "color": "#4e4e4e" } ] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [ { "color": "#616161" } ] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [ { "color": "#757575" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#000000" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#3d3d3d" } ] } ] }}
            >
              {directionsResponse && (
                <DirectionsRenderer 
                  directions={directionsResponse} 
                  options={{
                    polylineOptions: {
                      strokeColor: '#39d353',
                      strokeWeight: 5
                    }
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className={styles.mapPlaceholder}>
              <div className={styles.loader} style={{ borderLeftColor: '#39d353' }}></div>
              <h3>Loading Interactive Map...</h3>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
