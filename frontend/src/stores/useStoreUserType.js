import { create } from "zustand";

const useStoreUserType = create((set) => ({
  typeUser: "",
  setTypeUser: (typeUser) => set({ typeUser }),
}));

export default useStoreUserType;
