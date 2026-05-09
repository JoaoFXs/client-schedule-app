

// This file defines the Address interface, which represents a physical address with 
// various components such as street, neighborhood, city, state, country, and a formatted version of the address.
export interface Address {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  formatted: string;
}