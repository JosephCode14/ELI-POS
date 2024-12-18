import { create } from "zustand";

const useStoreRole = create((set) => ({
  auth: [],
  setAuth: (auth) => set({ auth }),
}));

export default useStoreRole;
