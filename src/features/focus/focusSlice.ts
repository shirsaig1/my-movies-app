import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FocusSection =
  | "filter-bar"
  | "search"
  | "movies-grid"
  | "pagination"
  | "details"
  | null;

export interface GlobalFocusState {
  section: FocusSection;
  index: number;
  previousSection: FocusSection; // For ESC to go back
}

const initialState: GlobalFocusState = {
  section: "filter-bar", // Start at filter bar
  index: 0,
  previousSection: null,
};

const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    setGlobalFocus: (
      state,
      action: PayloadAction<{ section: FocusSection; index?: number }>,
    ) => {
      const { section, index = 0 } = action.payload;

      // Store previous section (unless it's the same)
      if (section !== state.section && state.section !== null) {
        state.previousSection = state.section;
      }

      state.section = section;
      state.index = Math.max(0, index);
    },

    updateFocusIndex: (state, action: PayloadAction<number>) => {
      state.index = Math.max(0, action.payload);
    },

    focusPrevious: (state) => {
      if (state.previousSection) {
        const temp = state.section;
        state.section = state.previousSection;
        state.previousSection = temp;
        state.index = 0;
      }
    },
  },
});

export const { setGlobalFocus, updateFocusIndex, focusPrevious } =
  focusSlice.actions;
export default focusSlice.reducer;
