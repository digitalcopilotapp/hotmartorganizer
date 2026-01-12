export interface HotmartWebhookEvent {
  id: string;
  creation_date: number;
  event: string; // e.g., 'PURCHASE_APPROVED'
  version: string;
  data: {
    product: {
      id: number;
      ucode: string;
      name: string;
      has_co_production: boolean;
    };
    buyer: {
      email: string;
      name: string;
      checkout_phone?: string;
      address?: {
        country: string;
        country_iso: string;
      };
    };
    producer: {
      email: string;
      name: string;
    };
    purchase: {
      approved_date: number;
      full_price: {
        value: number;
        currency_value: string;
      };
      price: {
        value: number;
        currency_value: string;
      };
      checkout_country: {
        name: string;
        iso: string;
      };
      order_date: number;
      status: string; // e.g., 'APPROVED', 'REFUNDED'
      transaction: string;
      payment: {
        type: string;
        method: string;
        installments_number: number;
      };
      offer?: {
        code: string;
      };
    };
    subscription?: {
      status: string;
      plan: {
        id: number;
        name: string;
      };
      subscriber: {
        code: string;
      };
    };
  };
}
