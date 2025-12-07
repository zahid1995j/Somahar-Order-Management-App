import { 
  ApiSettings, 
  AppConfigResponse, 
  OrdersResponse, 
  CreateOrderPayload, 
  UpdateStatusPayload, 
  UpdateDetailsPayload,
  Order
} from '../types';

// Generate more Mock Data for pagination testing
const generateMockOrders = (count: number): Order[] => {
  const partners = ["RedX", "Steadfast", "Pathao", "Paperfly"];
  const statuses = ["Picked", "In Transit", "Out for Delivery", "Delivered", "Cancelled"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    tracking_code: `ST-${8000 + i}`,
    buyer_name: `Customer ${i + 1}`,
    phone: `017${String(i).padStart(8, '0')}`,
    address: `House ${i + 1}, Road ${Math.floor(Math.random() * 20)}, Dhaka`,
    police_station: ["Gulshan", "Banani", "Dhanmondi", "Mirpur"][Math.floor(Math.random() * 4)],
    amount: `${500 + Math.floor(Math.random() * 2000)} BDT`,
    rider_name: Math.random() > 0.5 ? "Rider " + (i + 1) : "",
    rider_phone: Math.random() > 0.5 ? "018..." : "",
    estimated_delivery: "2025-12-10",
    delivery_partner: partners[Math.floor(Math.random() * partners.length)],
    latest_status: statuses[Math.floor(Math.random() * statuses.length)],
    last_update: "2025-12-07 10:30:00"
  }));
};

const MOCK_ORDERS: Order[] = generateMockOrders(45); // 45 items to show ~3 pages if 20 per page

const MOCK_CONFIG: AppConfigResponse = {
  delivery_partners: ["RedX", "Steadfast", "Pathao", "Paperfly", "E-Courier", "In-House"],
  quick_statuses: ["Picked", "In Transit", "Out for Delivery", "Delivered", "Cancelled", "Returned"]
};

// --- API Service Class ---

class SwiftTrackService {
  private settings: ApiSettings;

  constructor(settings: ApiSettings) {
    this.settings = settings;
  }

  private getHeaders(requireAuth: boolean) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    // Only add API key if required and available
    // This prevents sending the header to public endpoints which might trigger strict CORS blocks
    if (requireAuth && this.settings.apiKey) {
      headers['X-FBBOT-API-KEY'] = this.settings.apiKey;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, requireAuth: boolean = true): Promise<T> {
    if (this.settings.useMock) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));
      return this.mockResponse<T>(endpoint, options);
    }

    // Safety check for default/invalid URLs
    if (!this.settings.baseUrl || this.settings.baseUrl.includes('your-wordpress-site.com')) {
      throw new Error("Invalid API URL. Please configure a real WordPress URL.");
    }

    const baseUrl = this.settings.baseUrl.replace(/\/$/, '');
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(requireAuth),
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid API Key");
        if (response.status === 404) throw new Error("Endpoint not found. Check your WordPress URL.");
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      // Improve error message for network failures (CORS, offline, etc.)
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
         // Check if mixed content might be the issue (browser blocking HTTP request from HTTPS page)
         if (window.location.protocol === 'https:' && url.startsWith('http:')) {
             throw new Error("Security Error: Cannot connect to an HTTP server from an HTTPS app. Your WordPress site must use HTTPS.");
         }
         throw new Error("Network request blocked. This is likely a CORS issue on your WordPress site.");
      }
      throw error;
    }
  }

  // --- Mock Responder ---
  private mockResponse<T>(endpoint: string, options: RequestInit): any {
    if (endpoint === '/app-config') return MOCK_CONFIG;
    
    if (endpoint.startsWith('/orders')) {
      // Parse page number from URL
      const match = endpoint.match(/page=(\d+)/);
      const page = match ? parseInt(match[1]) : 1;
      const limit = 20; // Items per page
      
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedOrders = MOCK_ORDERS.slice(start, end);
      const totalPages = Math.ceil(MOCK_ORDERS.length / limit);

      return {
        orders: paginatedOrders,
        pagination: { 
          current_page: page, 
          total_pages: totalPages, 
          total_items: MOCK_ORDERS.length 
        }
      };
    }

    if (endpoint === '/add-order') {
      return {
        success: true,
        message: "Order created successfully (Mock)",
        tracking_code: "MOCK-" + Math.floor(Math.random() * 1000),
        order_id: Math.floor(Math.random() * 10000)
      };
    }

    if (endpoint === '/update-status' || endpoint === '/update-details') {
      return { success: true, message: "Updated successfully (Mock)" };
    }

    throw new Error("Mock endpoint not found");
  }

  // --- Public Methods ---

  async getConfig(): Promise<AppConfigResponse> {
    // API Documentation says: Auth None (Public)
    // We pass requireAuth = false to avoid sending the API Key header.
    // This prevents CORS preflight errors if the server doesn't allow custom headers on public routes.
    return this.request<AppConfigResponse>('/app-config', { method: 'GET' }, false);
  }

  async getOrders(page: number = 1): Promise<OrdersResponse> {
    return this.request<OrdersResponse>(`/orders?page=${page}`, { method: 'GET' }, true);
  }

  async addOrder(data: CreateOrderPayload): Promise<{success: boolean, tracking_code: string, order_id: number}> {
    return this.request('/add-order', {
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }

  async updateStatus(data: UpdateStatusPayload): Promise<{success: boolean, message: string}> {
    return this.request('/update-status', {
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }

  async updateDetails(data: UpdateDetailsPayload): Promise<{success: boolean, message: string}> {
    return this.request('/update-details', {
      method: 'POST',
      body: JSON.stringify(data)
    }, true);
  }
}

export default SwiftTrackService;