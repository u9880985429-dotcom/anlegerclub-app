/**
 * Oeffentliche API des customers-Moduls ("die Tuer").
 *
 * Andere Module, Seiten und Routen importieren NUR von hier
 * (`@/modules/customers`) — niemals direkt aus `repository.ts` oder gar mit
 * eigenem `supabase.from(...)`. So bleibt der Datenzugriff an einer Stelle
 * gekapselt und spaeter austauschbar (z.B. eigener customer-service).
 */

export type {
  Customer,
  CustomerStatus,
  CustomerSubscription,
  SubscriptionStatus,
  UpsertCustomerInput,
  UpsertSubscriptionInput,
} from "./types";

export {
  upsertCustomer,
  listCustomers,
  countCustomers,
  upsertSubscription,
  listSubsByCustomerEmails,
} from "./repository";

export {
  hasMockProductAccess,
  mapAblefyInvoiceStateToStatus,
  mapAblefyEventToStatus,
  pickInvoiceState,
} from "./service";
