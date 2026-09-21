export interface LocalityPreset {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface CustomerLocationState {
  locality: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isLocating: boolean;
  error: string | null;
}

export const POPULAR_LOCALITIES: LocalityPreset[] = [
  {
    id: 'ambattur',
    name: 'Ambattur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.1143,
    longitude: 80.1548,
  },
  {
    id: 'anna_nagar',
    name: 'Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.085,
    longitude: 80.2101,
  },
  {
    id: 't_nagar',
    name: 'T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0418,
    longitude: 80.2341,
  },
  {
    id: 'adyar',
    name: 'Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0012,
    longitude: 80.2565,
  },
  {
    id: 'velachery',
    name: 'Velachery',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 12.9815,
    longitude: 80.218,
  },
  {
    id: 'tambaram',
    name: 'Tambaram',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 12.9249,
    longitude: 80.1,
  },
];
