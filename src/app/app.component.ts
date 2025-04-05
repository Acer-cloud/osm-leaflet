import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import 'leaflet-kml'; // Ensure you have installed leaflet-kml library

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AngularOSM';

  options: Leaflet.MapOptions = {
    layers: getLayers(),
    zoom: 12,
    center: new Leaflet.LatLng(43.530147, 16.488932)
  };

  map: Leaflet.Map | undefined;
  markers: Leaflet.Marker[] = [];
  route: Leaflet.Polyline | undefined;
  kmlLayer: any;
  drawMode: 'point' | 'line' | 'polygon' | 'route' | null = null;
  tempLinePoints: Leaflet.LatLng[] = [];
  tempPolygonPoints: Leaflet.LatLng[] = [];

  onMapReady(map: Leaflet.Map) {
    this.map = map;

    // Add marker on click
    this.map.on('click', (event: Leaflet.LeafletMouseEvent) => {
      if (this.drawMode === 'point') {
        const marker = new Leaflet.Marker(event.latlng, {
          icon: new Leaflet.Icon({
            iconSize: [50, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/red-marker.svg',
          }),
          title: `Point at ${event.latlng.lat.toFixed(4)}, ${event.latlng.lng.toFixed(4)}`
        } as Leaflet.MarkerOptions);
        marker.addTo(this.map!);
      } else if (this.drawMode === 'line') {
        this.tempLinePoints.push(event.latlng);
        const endpointMarker = new Leaflet.Marker(event.latlng, {
          icon: new Leaflet.Icon({
            iconSize: [50, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/red-marker.svg',
          }),
          title: `Endpoint at ${event.latlng.lat.toFixed(4)}, ${event.latlng.lng.toFixed(4)}`
        } as Leaflet.MarkerOptions);
        endpointMarker.addTo(this.map!);

        if (this.tempLinePoints.length === 2) {
          const line = new Leaflet.Polyline(this.tempLinePoints, {
            color: '#FF0000',
            weight: 3
          } as Leaflet.PolylineOptions);
          line.addTo(this.map!);
          this.tempLinePoints = [];
        }
      } else if (this.drawMode === 'polygon') {
        this.tempPolygonPoints.push(event.latlng);
        const endpointMarker = new Leaflet.Marker(event.latlng, {
          icon: new Leaflet.Icon({
            iconSize: [50, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/red-marker.svg',
          }),
          title: `Endpoint at ${event.latlng.lat.toFixed(4)}, ${event.latlng.lng.toFixed(4)}`
        } as Leaflet.MarkerOptions);
        endpointMarker.addTo(this.map!);

        if (this.tempPolygonPoints.length === 5) {
          const polygon = new Leaflet.Polygon(this.tempPolygonPoints, {
            color: '#FF0000',
            fillColor: '#FFAAAA',
            fillOpacity: 0.5
          } as Leaflet.PathOptions);
          polygon.addTo(this.map!);
          this.tempPolygonPoints = [];
        }
      } else if(this.drawMode === 'route') {
        const marker = new Leaflet.Marker(event.latlng, {
          icon: new Leaflet.Icon({
            iconSize: [50, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/blue-marker.svg',
          }),
          title: `Marker at ${event.latlng.lat.toFixed(4)}, ${event.latlng.lng.toFixed(4)}`
        } as Leaflet.MarkerOptions);

        marker.addTo(this.map!);
        this.markers.push(marker);

        // Connect markers to trace route
        this.updateRoute();

        // Add right-click event to remove marker
        marker.on('contextmenu', () => {
          this.map!.removeLayer(marker);
          this.markers = this.markers.filter(m => m !== marker);
          this.updateRoute();
        });
      }
    });
  }

  updateRoute() {
    if (this.route) {
      this.map!.removeLayer(this.route);
    }
    if (this.markers.length > 1) {
      const latlngs = this.markers.map(marker => marker.getLatLng());
      this.route = new Leaflet.Polyline(latlngs, {
        color: '#0d9148',
        weight: 4
      } as Leaflet.PolylineOptions);
      this.route.addTo(this.map!);
    }
  }

  setDrawMode(mode: 'point' | 'line' | 'polygon' | 'route') {
    this.drawMode = mode;
    this.tempLinePoints = [];
    this.tempPolygonPoints = [];
    if (mode === 'route') {
      // Clear only the markers, keep the existing route intact
      this.markers.forEach(marker => this.map!.removeLayer(marker));
      this.markers = [];
    }
  }
}

export const getLayers = (): Leaflet.Layer[] => {
  return [
    // Basic style
    new Leaflet.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    } as Leaflet.TileLayerOptions),
    // Pastel style, remove if you want basic style. Uncomment if you want pastel style.

    // new Leaflet.TileLayer('https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.png?key={your_key}', {
    //   attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
    // } as Leaflet.TileLayerOptions),
  ] as Leaflet.Layer[];
};



