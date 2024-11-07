import create from "zustand";

const useStoreCashier = create((set) => ({
  back: false,
  currrentOrderNumber: "",
  transacNumber: 0,
  setOrderNumber: (currentOrderNumber) => set({ currentOrderNumber }),
  setTransacNum: (transacNumber) => set({ transacNumber }),
  setBack: (back) => set({ back }),
}));

export default useStoreCashier;
