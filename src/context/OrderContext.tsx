import { createContext, useContext } from "react";

type OrderContextType = {};

const OrderContext = createContext<OrderContextType>({});

export function OrderProvider({ children }: { children: React.ReactNode }) {
  return <OrderContext.Provider value={{}}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  return useContext(OrderContext);
}
