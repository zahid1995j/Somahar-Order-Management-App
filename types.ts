export interface Order {
  id: number;
  tracking_code: string;
  buyer_name: string;
  phone: string;
  address: string;
  police_station: string;
  amount: string;
  rider_name: string;
  rider_phone: string;
  estimated_delivery: string;
  delivery_partner: string;
  latest_status: string;
  last_update: string;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface AppConfigResponse {
  delivery_partners: string[];
  quick_statuses: string[];
}

export interface CreateOrderPayload {
  buyer_name: string;
  phone: string;
  address: string;
  police_station?: string;
  amount?: string;
  rider_name?: string;
  rider_phone?: string;
  delivery_partner?: string;
}

export interface UpdateStatusPayload {
  order_id: number;
  status_message: string;
}

export interface UpdateDetailsPayload {
  order_id: number;
  rider_name?: string;
  rider_phone?: string;
  police_station?: string;
  estimated_delivery?: string;
  delivery_partner?: string;
}

export interface ApiSettings {
  baseUrl: string;
  apiKey: string;
  useMock: boolean;
  remember?: boolean;
}