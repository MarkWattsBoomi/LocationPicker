import { eLoadingState, FlowComponent, FlowField, FlowObjectData, FlowObjectDataArray } from "flow-component-model";
import React from "react";
import { CSSProperties } from "react";
import { addMarker, createMarker, findPlaces, getCurrentLocation } from "./GoogleMapFunctions";
import './LocationPicker.css';

declare const manywho: any;
declare const google: any;

export default class LocationPicker extends FlowComponent {

    context: any;

    street: HTMLInputElement;
    country: HTMLSelectElement;
    countries: any[];
    city: HTMLSelectElement;
    cities: any[];

    currentPosition: any; //(window : any).google.maps.LatLng;
    marker: google.maps.Marker;
    map: any; //(google: any).maps.Map;
    google: any;
    googleLoaded: boolean = false;
    
    constructor(props: any){
        super(props);
        this.moveHappened = this.moveHappened.bind(this);
        this.beginMapsApi = this.beginMapsApi.bind(this);
        this.apiLoaded = this.apiLoaded.bind(this);
        this.addressKeyDown = this.addressKeyDown.bind(this);
        this.prep = this.prep.bind(this);
        this.processResults = this.processResults.bind(this);
        this.zoomChanged = this.zoomChanged.bind(this);
        this.setMarker = this.setMarker.bind(this);
        this.addressSearch = this.addressSearch.bind(this);
        
        this.state = {location: null};
    }

    async componentDidMount(){
        await super.componentDidMount();   
        (manywho as any).eventManager.addDoneListener(this.moveHappened, this.componentId);
        this.prep();
    }

    async componentWillUnmount(): Promise<void> {
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    moveHappened(xhr: XMLHttpRequest, request: any) {
        if ((xhr as any).invokeType === 'FORWARD') {
            this.prep();
        }
    }

    async prep() {
        if(this.loadingState === eLoadingState.ready) {
            this.beginMapsApi();
            this.forceUpdate();
        }
        else {
            setImmediate(this.prep);
        }
    }

    beginMapsApi() {
        if(typeof google === 'undefined' || typeof google.maps === 'undefined') {
            if(typeof (window as any).GoogleMapsLoading === 'undefined') {
                const script = document.createElement('script');
                const apiKey = this.getAttribute('apiKey',"AIzaSyDu2kyyUHEzYcIZHB3SIgMdxu7OocJwap8");
                script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places&callback=Function.prototype';
                script.addEventListener('load', this.apiLoaded);
                window.document.body.appendChild(script);
                (window as any).GoogleMapsLoading = true;
            }
            else {
                // already loading
                window.setImmediate(this.beginMapsApi);
            }
        }
        else {
            this.apiLoaded();
        }
    }

    // fires when the maps script has loaded
    async apiLoaded() {
        this.googleLoaded = true;
        let state: FlowObjectData = this.model.dataSource.items[0];
            if(state){
                if(state.properties["latitude"].value){
                    this.currentPosition =  new google.maps.LatLng(state.properties["latitude"].value, state.properties["longitude"].value)
                }
                else {
                    this.currentPosition = await getCurrentLocation();
                }
            }
        let zoom: number = parseInt(sessionStorage.getItem(this.componentId + "-zoom") || this.getAttribute("zoom","8"));
        console.log("apiLoaded:zoom=" + zoom);
        sessionStorage.setItem(this.componentId + "-zoom",zoom+"");
        this.map = new google.maps.Map(document.getElementById("map") as HTMLElement ,{
            center: this.currentPosition,
            zoom: zoom,
        });
        google.maps.event.addListener(this.map,"click",this.setMarker);
        google.maps.event.addListener(this.map,'zoom_changed',this.zoomChanged);
        this.setMarker(this.currentPosition, true);
    }

    zoomChanged(e: any) {
        sessionStorage.setItem(this.componentId + "-zoom",this.map.getZoom() + "");
        console.log("zoomChanged:zoom=" + this.map.getZoom());
    }

    async setMarker(e: any, suppress: boolean = false) {
        if(e.lat && e.lng) {
            this.currentPosition = e;
        }
        else {
            this.currentPosition = e.latLng;
        }
        
        this.marker?.setMap(null);
        this.marker = createMarker(this,this.map,this.currentPosition);
        // update state value
        let state: FlowObjectData = this.model.dataSource.items[0];
        state.properties["latitude"].value = this.currentPosition.lat();
        state.properties["longitude"].value = this.currentPosition.lng();
        console.log("lat=" + this.currentPosition.lat() + " lng=" + this.currentPosition.lng());
        await this.setStateValue(state);
        
        if(this.outcomes["onSelect"]){
            if(suppress !== true){
                await this.triggerOutcome("onSelect");
            }
        }
        
        this.forceUpdate();
    }

    async addressKeyDown(e: any) {
        e.stopPropagation();
        switch(e.key) {
            case "Enter":
                e.preventDefault();
                e.stopPropagation();
                let results: any = await findPlaces(this.map, this.street.value);
                this.processResults(results);
                break;

            default: 
                //do nothing
                break;

        }
    }

    async addressSearch(e: any) {
        e.preventDefault();
        e.stopPropagation();
        let results: any = await findPlaces(this.map, this.street.value);
        this.processResults(results);
    }

    processResults(results: {results: any[], status: any}) {
        if(results.results && results.results.length > 0) {
            for (let i = 0; i < results.results.length; i++) {
                createMarker(this,this.map,results.results[i]);
            }
            this.currentPosition = results.results[0].geometry.location;
            let zoom: number = parseInt(sessionStorage.getItem(this.componentId + "-zoom") || this.getAttribute("zoom","8"));
            console.log("processResults:zoom=" + zoom);
            this.map?.setZoom(zoom);
            this.map?.setCenter(this.currentPosition);
        }          
    }
    

    render() {
        const style: CSSProperties = {};
        style.width = '-webkit-fill-available';
        style.height = '-webkit-fill-available';

        if (this.model.visible === false) {
            style.display = 'none';
        }
        if (this.model.width) {
            style.width = this.model.width + 'px';
        }
        if (this.model.height) {
            style.height = this.model.height + 'px';
        }

        return (
            <div
                className='locpic'
            >
                <div
                    className='locpic-header'
                >
                    <span
                        className='locpic-header-title'
                    >
                        {this.model.label}
                    </span>
                </div>
                <div
                    className='locpic-body'
                >
                    <div
                        className='locpic-body-row'
                    >
                        <label
                            className='locpic-body-label'
                            htmlFor="street"
                        >
                            Search
                        </label>
                        <div
                            className='locpic-body-row-group'
                        >
                            <input 
                                className='locpic-body-input'
                                id='street'
                                type="text"
                                ref={(element: HTMLInputElement) => { this.street = element}}
                                onKeyDown={this.addressKeyDown}
                            />
                            <span  
                                className="locpic-body-btn glyphicon glyphicon-search" 
                                onClick={this.addressSearch}
                            />
                        </div>
                    </div>
                    <div
                        className='locpic-body-map'
                    >
                        <div 
                            className='locpic-map'
                            id="map"
                        />
                    </div>
                    <div>
                        <span className='locpic-body-label'>{this.currentPosition? "Latitude: " + this.currentPosition?.lat() : ""}</span>
                        <span className='locpic-body-label'>{this.currentPosition? "Longitude: " + this.currentPosition?.lng() : ""}</span>
                    </div>
                </div>
            </div>
        );
    }
}

manywho.component.register('LocationPicker', LocationPicker);