export interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
  [key: string]: any;
}

export class NominatimGeocoder {
  private baseUrl: string = "https://nominatim.openstreetmap.org/search";

  async geocode(placeName: string): Promise<GeocodeResult> {
    const url = new URL(this.baseUrl);
    url.searchParams.append("q", placeName);
    url.searchParams.append("format", "json");
    url.searchParams.append("limit", "1");

    const headers = {
      "User-Agent": "BAM/1.0 (jacques.fize@gmail.com)", // important for Nominatim usage policy
      "Accept-Language": "fr",
    };

    try {
      const response = await fetch(url.toString(), { headers });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data: GeocodeResult[] = await response.json();
      if (data.length > 0) {
        return data[0];
      }
      return null;
    } catch (error) {
      console.error("Error during the geocoding process:", error);
      throw error;
    }
  }
}
