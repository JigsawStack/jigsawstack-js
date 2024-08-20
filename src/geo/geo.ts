import { RequestClient } from "../request";
import {
  GeoCityParams,
  GeoCityResponse,
  GeocodeParams,
  GeoCountryParams,
  GeoCountryResponse,
  GeoDistanceParams,
  GeoDistanceResponse,
  GeohashDecodeResponse,
  GeohashParams,
  GeohashResponse,
  GeoSearchParams,
  GeoSearchResponse,
  GeoStateParams,
  GeoStateResponse,
  GeoTimezoneParams,
  GeoTimezoneResponse,
} from "./interfaces";

class Geo {
  constructor(private readonly client: RequestClient) {}
  search = async (params: GeoSearchParams): Promise<GeoSearchResponse> => {
    return await this.client.fetchJSS("/geo/search", "GET", {}, params);
  };

  geocode = async (params: GeocodeParams): Promise<GeoSearchResponse> => {
    return await this.client.fetchJSS("/geo/geocode", "GET", {}, params);
  };

  city = async (params: GeoCityParams): Promise<GeoCityResponse> => {
    return await this.client.fetchJSS("/geo/city", "GET", {}, params);
  };

  country = async (params: GeoCountryParams): Promise<GeoCountryResponse> => {
    return await this.client.fetchJSS("/geo/country", "GET", {}, params);
  };

  state = async (params: GeoStateParams): Promise<GeoStateResponse> => {
    return await this.client.fetchJSS("/geo/state", "GET", {}, params);
  };

  distance = async (params: GeoDistanceParams): Promise<GeoDistanceResponse> => {
    return await this.client.fetchJSS("/geo/distance", "GET", {}, params);
  };

  timezone = async (params: GeoTimezoneParams): Promise<GeoTimezoneResponse> => {
    return await this.client.fetchJSS("/geo/timezone", "GET", {}, params);
  };

  geohash = async (params: GeohashParams): Promise<GeohashResponse> => {
    return await this.client.fetchJSS("/geo/geohash", "GET", {}, params);
  };

  geohash_decode = async (geohash: string): Promise<GeohashDecodeResponse> => {
    return await this.client.fetchJSS(`/geo/geohash/decode/${geohash}`, "GET", {});
  };
}

export default Geo;
