import type { Property } from "../modules/Properties";
import { API_BASE_URL } from "./app_url";

export interface PropertyDetails extends Property {
    description: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
    yearBuilt: number;
    features: string[];
    images: string[];
    agent: {
        name: string;
        phone: string;
        email: string;
        rating: number;
        reviews: number;
    };
}

export interface PropertyService {
    getProperties(): Promise<Property[]>;
    getPropertyById(id: string): Promise<PropertyDetails | null>;
    searchProperties(query: string, filters?: PropertySearchFilters): Promise<Property[]>;
}

export interface PropertySearchFilters {
    type?: Property["type"];
}

// Backend API service
class ApiPropertyService implements PropertyService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL ?? '') {
        this.baseUrl = baseUrl ?? '';
    }

    async getProperties(): Promise<Property[]> {
        const response = await fetch(`${this.baseUrl}/api/properties`);
        if (!response.ok) {
            throw new Error('Failed to fetch properties');
        }
        return response.json();
    }

    async getPropertyById(id: string): Promise<PropertyDetails | null> {
        const response = await fetch(`${this.baseUrl}/api/properties/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch property details');
        }
        return response.json();
    }

    async searchProperties(query: string, filters?: PropertySearchFilters): Promise<Property[]> {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (filters?.type) params.append('type', filters.type);

        const response = await fetch(`${this.baseUrl}/api/properties/search?${params}`);
        if (!response.ok) {
            throw new Error('Failed to search properties');
        }
        return response.json();
    }
}

export const propertyService: PropertyService = new ApiPropertyService();
