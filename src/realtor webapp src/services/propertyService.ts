import { properties, type Property } from "../modules/Properties";

// Configuration for data source
const USE_MOCK_DATA = true; // Set to false when backend is ready

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

// Mock data service
class MockPropertyService implements PropertyService {
    async getProperties(): Promise<Property[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return properties;
    }

    async getPropertyById(id: string): Promise<PropertyDetails | null> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const property = properties.find(p => p.title === id);
        if (!property) return null;

        // Mock additional details
        return {
            ...property,
            description: "This stunning property offers modern living with premium amenities. Located in a prime area with excellent connectivity to major business districts and entertainment zones. The property features contemporary design with spacious rooms and high-quality finishes.",
            bedrooms: Math.floor(Math.random() * 4) + 1,
            bathrooms: Math.floor(Math.random() * 3) + 1,
            area: `${Math.floor(Math.random() * 1000) + 800} sq ft`,
            yearBuilt: 2015 + Math.floor(Math.random() * 8),
            features: [
                "Swimming Pool",
                "Gym",
                "Parking",
                "Security",
                "Garden",
                "Balcony"
            ].slice(0, Math.floor(Math.random() * 6) + 1),
            images: [property.image, property.image, property.image], // Mock multiple images
            agent: {
                name: "John Doe",
                phone: "+234 801 234 5678",
                email: "john@veriplot.com",
                rating: 4.5 + Math.random() * 0.5,
                reviews: Math.floor(Math.random() * 200) + 50
            }
        };
    }

    async searchProperties(query: string, filters?: PropertySearchFilters): Promise<Property[]> {
        await new Promise(resolve => setTimeout(resolve, 100));

        let results = properties;

        if (query) {
            results = results.filter(p =>
                p.title.toLowerCase().includes(query.toLowerCase()) ||
                p.location.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (filters?.type) {
            results = results.filter(p => p.type === filters.type);
        }

        return results;
    }
}

// Backend API service
class ApiPropertyService implements PropertyService {
    private baseUrl: string;

    constructor(baseUrl: string = process.env.REACT_APP_API_URL || '') {
        this.baseUrl = baseUrl;
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

// Factory function to get the appropriate service
export const getPropertyService = (): PropertyService => {
    return USE_MOCK_DATA ? new MockPropertyService() : new ApiPropertyService();
};

// Export the service instance
export const propertyService = getPropertyService();
