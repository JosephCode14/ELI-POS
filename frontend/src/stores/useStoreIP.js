import { create } from "zustand";

const useStoreIP = create((set) => ({
  ip: "",
  setIP: (ip) => set({ ip }),
}));

export default useStoreIP;
