import { FlowAttribute, FlowObjectData } from "flow-component-model";
import LocationPicker from "./LocationPicker";
import React from "react";

export async function getCurrentLocation(options?: any): Promise<google.maps.LatLng> {
    let pos: any = await _getCurrentLocation(options);
    let loc: google.maps.LatLng = new google.maps.LatLng({lat: pos.coords.latitude, lng: pos.coords.longitude});
    return loc;
}

export async function _getCurrentLocation(options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

export async function findNearby(map: any, currentPosition: google.maps.LatLng, keys: string[], radiusMeters: number): Promise<any[]> {
    const service = new google.maps.places.PlacesService(map);
    let op: any;
    const request: any = {
        location: currentPosition,
        radius: radiusMeters,
        types: keys,
      };
        op = await new Promise((resolve) => {
        service.nearbySearch(
        request,
        // pass a callback to getDetails that resolves the promise
        (results, status) => resolve({ results, status }),
        );
    });
    return op.results;

}

export async function findPlaces(map: any, query: string): Promise<any[]> {
    let op : any;
        
    const service = new google.maps.places.PlacesService(map);
    const request: any = {
        query: query,
        fields: ['name', 'geometry'],
      };
      try {
        op = await new Promise((resolve) => {
            service.findPlaceFromQuery(
            request,
            // pass a callback to getDetails that resolves the promise
            (results, status) => resolve({ results, status }),
            );
            
        });
    }
    catch(e) {
        console.log(e);
    } 
    finally {
        return op;
    }
    
    //const { results, status } =
}

export function addMarker(parent: LocationPicker, map: google.maps.Map, position: google.maps.LatLng, label: string, tooltip: string, place: google.maps.Place, icon: string, data?: FlowObjectData): any {

    let marker: google.maps.Marker = new google.maps.Marker({
        map: map,
        position: position,
        place: place,
        icon: icon,
        title: label
    });

    marker.addListener("click",(event: google.maps.MapMouseEvent) => {openInfoWindow(parent, map, event, marker, place, data)});

    return marker;
}

export function createMarker(parent: LocationPicker, map: google.maps.Map, place: any) : google.maps.Marker{

    let spot: any;
    if(place.lat && place.lng) {
        spot=place;
    }
    else {
        if (place.geometry && place.geometry.location) {
            spot = place.geometry.location;
        }
        else {
            return;
        }
    }
  
    const marker = new google.maps.Marker({
      map,
      position: spot,
    });

    return marker;
  
    //google.maps.event.addListener(marker, "click", () => {
    //  infowindow.setContent(place.name || "");
    //  infowindow.open(map);
    //});
  }

export function addArea(map: google.maps.Map, coords: Array<google.maps.LatLng>): any {

    let area: google.maps.Polygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
      });
    area.setMap(map);

    return area;
}



export function openInfoWindow(parent: LocationPicker, map: google.maps.Map, event: google.maps.MapMouseEvent, marker: google.maps.Marker, place: google.maps.Place, data: FlowObjectData) {
    let id: string = data?.internalId || "" + new Date().getTime();
    let contentString = "<div id=" + id + ">  </div>";

    const infowindow = new google.maps.InfoWindow({
        content: contentString,
        position: event.latLng
      });
    //google.maps.event.addListener(infowindow,"domready",(event: google.maps.MapMouseEvent) => {renderInfoWindow(id, infowindow, parent, data)});
    //infowindow.setPosition(event.latLng);
    infowindow.open(map);
}

