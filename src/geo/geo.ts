import { RequestClient } from "../request";
import { GeoSearchParams, GeoSearchResponse, GeocodeParams } from "./interfaces";

class Geo {
  constructor(private readonly client: RequestClient) {}
  search = async (params: GeoSearchParams): Promise<GeoSearchResponse> => {
    return await this.client.fetchJSS("/geo/search", "GET", {}, params);
  };

  geocode = async (params: GeocodeParams): Promise<GeoSearchResponse> => {
    return await this.client.fetchJSS("/geo/geocode", "GET", {}, params);
  };
}

export default Geo;
