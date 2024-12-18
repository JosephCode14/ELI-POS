import { create } from "zustand";

const useStoreKioskImages = create((set) => ({
  kioskImages: [],
  setKioskImages: (kioskImages) => set({ kioskImages }),
  bannerImages: [],
  setBannerImages: (bannerImages) => set({ bannerImages }),
}));

export default useStoreKioskImages;
