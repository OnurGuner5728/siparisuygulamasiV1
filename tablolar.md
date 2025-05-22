[
  {
    "table_name": "addresses",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "user_id",
        "type": "uuid",
        "fk": "users.id"
      },
      {
        "column": "title",
        "type": "text",
        "fk": null
      },
      {
        "column": "type",
        "type": "text",
        "fk": null
      },
      {
        "column": "full_name",
        "type": "text",
        "fk": null
      },
      {
        "column": "phone",
        "type": "text",
        "fk": null
      },
      {
        "column": "city",
        "type": "text",
        "fk": null
      },
      {
        "column": "district",
        "type": "text",
        "fk": null
      },
      {
        "column": "neighborhood",
        "type": "text",
        "fk": null
      },
      {
        "column": "full_address",
        "type": "text",
        "fk": null
      },
      {
        "column": "postal_code",
        "type": "text",
        "fk": null
      },
      {
        "column": "is_default",
        "type": "boolean",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "aktuel_products",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "name",
        "type": "text",
        "fk": null
      },
      {
        "column": "description",
        "type": "text",
        "fk": null
      },
      {
        "column": "original_price",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "discount_price",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "image_url",
        "type": "text",
        "fk": null
      },
      {
        "column": "category",
        "type": "text",
        "fk": null
      },
      {
        "column": "features",
        "type": "ARRAY",
        "fk": null
      },
      {
        "column": "stock",
        "type": "integer",
        "fk": null
      },
      {
        "column": "start_date",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "end_date",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "related_product_ids",
        "type": "ARRAY",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "campaigns",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "title",
        "type": "text",
        "fk": null
      },
      {
        "column": "description",
        "type": "text",
        "fk": null
      },
      {
        "column": "store_id",
        "type": "uuid",
        "fk": "stores.id"
      },
      {
        "column": "created_by",
        "type": "uuid",
        "fk": "users.id"
      },
      {
        "column": "start_date",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "end_date",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "discount",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "discount_type",
        "type": "text",
        "fk": null
      },
      {
        "column": "min_order_amount",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "max_discount_amount",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "code",
        "type": "text",
        "fk": null
      },
      {
        "column": "status",
        "type": "text",
        "fk": null
      },
      {
        "column": "usage",
        "type": "integer",
        "fk": null
      },
      {
        "column": "max_usage",
        "type": "integer",
        "fk": null
      },
      {
        "column": "main_category_id",
        "type": "integer",
        "fk": "categories.id"
      },
      {
        "column": "image_url",
        "type": "text",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "cart_items",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "user_id",
        "type": "uuid",
        "fk": "users.id"
      },
      {
        "column": "product_id",
        "type": "uuid",
        "fk": "products.id"
      },
      {
        "column": "store_id",
        "type": "uuid",
        "fk": "stores.id"
      },
      {
        "column": "name",
        "type": "text",
        "fk": null
      },
      {
        "column": "price",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "quantity",
        "type": "integer",
        "fk": null
      },
      {
        "column": "image",
        "type": "text",
        "fk": null
      },
      {
        "column": "notes",
        "type": "text",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "categories",
    "columns": [
      {
        "column": "id",
        "type": "integer",
        "fk": null
      },
      {
        "column": "name",
        "type": "text",
        "fk": null
      },
      {
        "column": "slug",
        "type": "text",
        "fk": null
      },
      {
        "column": "parent_id",
        "type": "integer",
        "fk": "categories.id"
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "order_items",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "order_id",
        "type": "uuid",
        "fk": "orders.id"
      },
      {
        "column": "product_id",
        "type": "uuid",
        "fk": "products.id"
      },
      {
        "column": "name",
        "type": "text",
        "fk": null
      },
      {
        "column": "quantity",
        "type": "integer",
        "fk": null
      },
      {
        "column": "price",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "total",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "notes",
        "type": "text",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "orders",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "customer_id",
        "type": "uuid",
        "fk": "users.id"
      },
      {
        "column": "store_id",
        "type": "uuid",
        "fk": "stores.id"
      },
      {
        "column": "status",
        "type": "text",
        "fk": null
      },
      {
        "column": "order_date",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "delivery_date",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "subtotal",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "delivery_fee",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "total",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "discount",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "payment_method",
        "type": "text",
        "fk": null
      },
      {
        "column": "payment_status",
        "type": "text",
        "fk": null
      },
      {
        "column": "delivery_address_id",
        "type": "uuid",
        "fk": "addresses.id"
      },
      {
        "column": "status_history",
        "type": "jsonb",
        "fk": null
      },
      {
        "column": "courier_id",
        "type": "uuid",
        "fk": "users.id"
      },
      {
        "column": "courier_name",
        "type": "text",
        "fk": null
      },
      {
        "column": "courier_phone",
        "type": "text",
        "fk": null
      },
      {
        "column": "courier_photo",
        "type": "text",
        "fk": null
      },
      {
        "column": "courier_location",
        "type": "jsonb",
        "fk": null
      },
      {
        "column": "courier_rating",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "estimated_delivery",
        "type": "text",
        "fk": null
      },
      {
        "column": "delivery_coordinates",
        "type": "jsonb",
        "fk": null
      },
      {
        "column": "delivery_note",
        "type": "text",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "products",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "store_id",
        "type": "uuid",
        "fk": "stores.id"
      },
      {
        "column": "name",
        "type": "text",
        "fk": null
      },
      {
        "column": "description",
        "type": "text",
        "fk": null
      },
      {
        "column": "price",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "image",
        "type": "text",
        "fk": null
      },
      {
        "column": "category",
        "type": "text",
        "fk": null
      },
      {
        "column": "is_available",
        "type": "boolean",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "reviews",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "user_id",
        "type": "uuid",
        "fk": "users.id"
      },
      {
        "column": "store_id",
        "type": "uuid",
        "fk": "stores.id"
      },
      {
        "column": "order_id",
        "type": "uuid",
        "fk": "orders.id"
      },
      {
        "column": "rating",
        "type": "integer",
        "fk": null
      },
      {
        "column": "comment",
        "type": "text",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "store_working_hours",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "store_id",
        "type": "uuid",
        "fk": "stores.id"
      },
      {
        "column": "day_of_week",
        "type": "text",
        "fk": null
      },
      {
        "column": "opening_time",
        "type": "time without time zone",
        "fk": null
      },
      {
        "column": "closing_time",
        "type": "time without time zone",
        "fk": null
      },
      {
        "column": "is_closed",
        "type": "boolean",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "stores",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "owner_id",
        "type": "uuid",
        "fk": "users.id"
      },
      {
        "column": "name",
        "type": "text",
        "fk": null
      },
      {
        "column": "email",
        "type": "text",
        "fk": null
      },
      {
        "column": "phone",
        "type": "text",
        "fk": null
      },
      {
        "column": "address",
        "type": "text",
        "fk": null
      },
      {
        "column": "category_id",
        "type": "integer",
        "fk": "categories.id"
      },
      {
        "column": "subcategories",
        "type": "ARRAY",
        "fk": null
      },
      {
        "column": "logo",
        "type": "text",
        "fk": null
      },
      {
        "column": "cover_image",
        "type": "text",
        "fk": null
      },
      {
        "column": "rating",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "review_count",
        "type": "integer",
        "fk": null
      },
      {
        "column": "status",
        "type": "text",
        "fk": null
      },
      {
        "column": "description",
        "type": "text",
        "fk": null
      },
      {
        "column": "type",
        "type": "text",
        "fk": null
      },
      {
        "column": "tags",
        "type": "ARRAY",
        "fk": null
      },
      {
        "column": "is_approved",
        "type": "boolean",
        "fk": null
      },
      {
        "column": "is_open",
        "type": "boolean",
        "fk": null
      },
      {
        "column": "min_order_amount",
        "type": "numeric",
        "fk": null
      },
      {
        "column": "delivery_time_estimation",
        "type": "text",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  },
  {
    "table_name": "users",
    "columns": [
      {
        "column": "id",
        "type": "uuid",
        "fk": null
      },
      {
        "column": "email",
        "type": "text",
        "fk": null
      },
      {
        "column": "first_name",
        "type": "text",
        "fk": null
      },
      {
        "column": "last_name",
        "type": "text",
        "fk": null
      },
      {
        "column": "name",
        "type": "text",
        "fk": null
      },
      {
        "column": "phone",
        "type": "text",
        "fk": null
      },
      {
        "column": "role",
        "type": "text",
        "fk": null
      },
      {
        "column": "avatar_url",
        "type": "text",
        "fk": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "fk": null
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "fk": null
      }
    ]
  }
]