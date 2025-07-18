import "@shopify/shopify-app-remix/adapters/node";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { dbconnection } from "./db.server";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import dotenv from "dotenv";
import { createMetafieldDefination } from "./routes/utils/createMetafieldsDefination";

dotenv.config();
dbconnection();
console.log("Inside the server file", dotenv);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders_create",
    },
    ORDERS_FULFILLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders_fulfilled",
    },
    // ORDERS_PAID: {
    //   deliveryMethod: DeliveryMethod.Http,
    //   callbackUrl: "/webhooks/app/order_paid",
    // },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      console.log("session", session);
      console.log("Attempting to register webhooks for shop:", session.shop);
      try {
        await shopify.registerWebhooks({ session });
        console.log("Webhooks registered successfully");
      } catch (error) {
        console.error("Webhook registration failed:", error);
      }
    },
  },

  sessionStorage:
    process.env.NODE_ENV === "production"
      ? new MongoDBSessionStorage(process.env.MONGODB_URI)
      : new MongoDBSessionStorage(
          "mongodb://localhost:27017",
          "Dealer_Details_app",
        ),
  distribution: AppDistribution.AppStore,
  restResources,

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

// createMetafieldDefination();

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
