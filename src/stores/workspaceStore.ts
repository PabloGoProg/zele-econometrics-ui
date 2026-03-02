import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TabState,
  TabSnapshot,
  PredictionResponse,
  PredictionHistoryEntry,
  Model,
} from '@/types';
import { MAX_UNDO_SNAPSHOTS, MAX_HISTORY_PER_MODEL } from '@/lib/constants';

interface Tab {
  id: string; // "home" | "model-{modelId}"
  modelId: number | null;
  modelName: string;
  displayName: string;
}

interface WorkspaceState {
  tabs: Tab[];
  activeTabId: string;
  tabStates: Record<string, TabState>;

  openModel: (model: Model) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;

  initTabState: (
    modelId: number,
    defaults: Record<string, number>,
    limits: Record<string, { min: number; max: number }>,
  ) => void;
  updateInput: (modelId: number, variableName: string, value: number) => void;
  updateCustomLimits: (
    modelId: number,
    variableName: string,
    limits: { min: number; max: number },
  ) => void;
  setPredictionResult: (modelId: number, result: PredictionResponse) => void;
  markPredictionStale: (modelId: number) => void;
  addHistoryEntry: (modelId: number, entry: PredictionHistoryEntry) => void;
  resetTab: (
    modelId: number,
    defaults: Record<string, number>,
    defaultLimits: Record<string, { min: number; max: number }>,
  ) => void;
  undo: (modelId: number) => void;
  pushSnapshot: (modelId: number) => void;
  canUndo: (modelId: number) => boolean;
  removeInvalidTabs: (validModelIds: number[]) => string[];
}

const HOME_TAB: Tab = {
  id: 'home',
  modelId: null,
  modelName: 'home',
  displayName: 'Home',
};

function tabIdForModel(modelId: number) {
  return `model-${modelId}`;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [HOME_TAB],
      activeTabId: 'home',
      tabStates: {},

      openModel: (model) => {
        const tabId = tabIdForModel(model.id);
        const state = get();
        const exists = state.tabs.some((t) => t.id === tabId);
        if (exists) {
          set({ activeTabId: tabId });
          return;
        }
        const newTab: Tab = {
          id: tabId,
          modelId: model.id,
          modelName: model.name,
          displayName: model.display_name,
        };
        set({
          tabs: [...state.tabs, newTab],
          activeTabId: tabId,
        });
      },

      closeTab: (tabId) => {
        if (tabId === 'home') return;
        const state = get();
        const newTabs = state.tabs.filter((t) => t.id !== tabId);
        const newStates = { ...state.tabStates };
        delete newStates[tabId];
        const newActive =
          state.activeTabId === tabId
            ? newTabs[newTabs.length - 1]?.id ?? 'home'
            : state.activeTabId;
        set({ tabs: newTabs, activeTabId: newActive, tabStates: newStates });
      },

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      initTabState: (modelId, defaults, limits) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        if (state.tabStates[tabId]) return;
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: {
              modelId,
              modelName: '',
              displayName: '',
              inputs: { ...defaults },
              customLimits: { ...limits },
              lastPrediction: null,
              predictionStale: false,
              history: [],
              snapshots: [],
            },
          },
        });
      },

      pushSnapshot: (modelId) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts) return;
        const snapshot: TabSnapshot = {
          inputs: { ...ts.inputs },
          customLimits: JSON.parse(JSON.stringify(ts.customLimits)),
          lastPrediction: ts.lastPrediction,
        };
        const snapshots = [...ts.snapshots, snapshot].slice(-MAX_UNDO_SNAPSHOTS);
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: { ...ts, snapshots },
          },
        });
      },

      updateInput: (modelId, variableName, value) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts) return;
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: {
              ...ts,
              inputs: { ...ts.inputs, [variableName]: value },
              predictionStale: ts.lastPrediction !== null,
            },
          },
        });
      },

      updateCustomLimits: (modelId, variableName, limits) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts) return;
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: {
              ...ts,
              customLimits: { ...ts.customLimits, [variableName]: limits },
            },
          },
        });
      },

      setPredictionResult: (modelId, result) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts) return;
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: { ...ts, lastPrediction: result, predictionStale: false },
          },
        });
      },

      markPredictionStale: (modelId) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts) return;
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: { ...ts, predictionStale: true },
          },
        });
      },

      addHistoryEntry: (modelId, entry) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts) return;
        const history = [entry, ...ts.history].slice(0, MAX_HISTORY_PER_MODEL);
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: { ...ts, history },
          },
        });
      },

      resetTab: (modelId, defaults, defaultLimits) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts) return;
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: {
              ...ts,
              inputs: { ...defaults },
              customLimits: JSON.parse(JSON.stringify(defaultLimits)),
              lastPrediction: null,
              predictionStale: false,
            },
          },
        });
      },

      undo: (modelId) => {
        const tabId = tabIdForModel(modelId);
        const state = get();
        const ts = state.tabStates[tabId];
        if (!ts || ts.snapshots.length === 0) return;
        const snapshots = [...ts.snapshots];
        const last = snapshots.pop()!;
        set({
          tabStates: {
            ...state.tabStates,
            [tabId]: {
              ...ts,
              inputs: last.inputs,
              customLimits: last.customLimits,
              lastPrediction: last.lastPrediction,
              predictionStale: false,
              snapshots,
            },
          },
        });
      },

      canUndo: (modelId) => {
        const tabId = tabIdForModel(modelId);
        const ts = get().tabStates[tabId];
        return (ts?.snapshots.length ?? 0) > 0;
      },

      removeInvalidTabs: (validModelIds) => {
        const state = get();
        const removed: string[] = [];
        const newTabs = state.tabs.filter((t) => {
          if (t.id === 'home') return true;
          if (t.modelId !== null && !validModelIds.includes(t.modelId)) {
            removed.push(t.displayName);
            return false;
          }
          return true;
        });
        if (removed.length > 0) {
          const newStates = { ...state.tabStates };
          for (const tab of state.tabs) {
            if (tab.modelId !== null && !validModelIds.includes(tab.modelId)) {
              delete newStates[tab.id];
            }
          }
          const activeStillExists = newTabs.some((t) => t.id === state.activeTabId);
          set({
            tabs: newTabs,
            activeTabId: activeStillExists ? state.activeTabId : 'home',
            tabStates: newStates,
          });
        }
        return removed;
      },
    }),
    {
      name: 'zele-workspace',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        tabStates: state.tabStates,
      }),
    },
  ),
);
