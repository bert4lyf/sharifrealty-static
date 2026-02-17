// Properties Listing

class PropertiesManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.properties = [];
    this.currentFilter = {};
  }

  // Fetch all properties
  async fetchProperties(filters = {}) {
    try {
      let url = `${this.supabase.url}/rest/v1/properties?select=*`;
      
      if (filters.status) {
        url += `&status=eq.${filters.status}`;
      }
      if (filters.featured) {
        url += `&featured=eq.true`;
      }
      if (filters.city) {
        url += `&location=ilike.%${filters.city}%`;
      }
      if (filters.minPrice) {
        url += `&price=gte.${filters.minPrice}`;
      }
      if (filters.maxPrice) {
        url += `&price=lte.${filters.maxPrice}`;
      }

      url += '&order=created_at.desc&limit=100';

      const response = await fetch(url, {
        headers: this.supabase.getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch properties');
      
      this.properties = await response.json();
      return this.properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  // Render properties in a container
  renderProperties(containerId, properties = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = properties || this.properties;
    
    if (items.length === 0) {
      container.innerHTML = '<p>No properties found.</p>';
      return;
    }

    container.innerHTML = items.map(prop => this.createPropertyCard(prop)).join('');
  }

  // Create property card HTML
  createPropertyCard(property) {
    const imageUrl = property.images && property.images.length > 0
      ? property.images[0]
      : '/assets/placeholder.jpg';

    return `
      <div class="property-card" data-id="${property.id}">
        <div class="property-image">
          <img src="${imageUrl}" alt="${property.title}" />
          ${property.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="property-info">
          <h3>${property.title}</h3>
          <p class="property-price">$${Number(property.price).toLocaleString()}</p>
          <p class="property-location">${property.location}</p>
          <p class="property-status"><span class="badge badge-${property.status}">${property.status}</span></p>
          <p class="property-description">${property.description ? property.description.substring(0, 100) + '...' : ''}</p>
          <a href="/property.html?id=${property.id}" class="btn btn-primary">View Details</a>
        </div>
      </div>
    `;
  }

  // Apply filters and re-render
  async applyFilters(filters) {
    this.currentFilter = filters;
    await this.fetchProperties(filters);
    this.renderProperties('propertiesContainer');
  }
}

// Initialize on page load
let propertiesManager;
document.addEventListener('DOMContentLoaded', async () => {
  propertiesManager = new PropertiesManager(supabase);
  await propertiesManager.fetchProperties();
  propertiesManager.renderProperties('propertiesContainer');

  // Search/Filter Handler
  const filterBtn = document.getElementById('filterBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', async () => {
      const filters = {
        status: document.getElementById('filterStatus')?.value,
        city: document.getElementById('filterCity')?.value,
        minPrice: document.getElementById('filterMinPrice')?.value,
        maxPrice: document.getElementById('filterMaxPrice')?.value,
        featured: document.getElementById('filterFeatured')?.checked,
      };
      await propertiesManager.applyFilters(filters);
    });
  }
});
