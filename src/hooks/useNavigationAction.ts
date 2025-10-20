import { useMemo } from 'react';

interface UseNavigationActionProps {
  activeTab: 'schema' | 'compiled' | 'execute' | 'visualize';
  executeTabSubTab: 'input' | 'output';
  canVisualize: boolean;
  isCompiling: boolean;
  isExecuting: boolean;
  isVisualizePlaying: boolean;
}

interface NavigationAction {
  action: 'compile' | 'execute' | 'visualize' | 'call' | 'changeInputs' | 'play' | 'pause';
  label: string;
  disabled: boolean;
  isLoading: boolean;
}

export function useNavigationAction({
  activeTab,
  executeTabSubTab,
  canVisualize,
  isCompiling,
  isExecuting,
  isVisualizePlaying,
}: UseNavigationActionProps): NavigationAction {
  return useMemo(() => {
    if (activeTab === 'schema') {
      return {
        action: 'compile',
        label: 'Compile',
        disabled: isCompiling,
        isLoading: isCompiling,
      };
    }

    if (activeTab === 'compiled') {
      return {
        action: canVisualize ? 'visualize' : 'execute',
        label: canVisualize ? 'Visualize' : 'Execute',
        disabled: false,
        isLoading: false,
      };
    }

    if (activeTab === 'execute') {
      if (executeTabSubTab === 'input') {
        return {
          action: 'call',
          label: 'Call',
          disabled: isExecuting,
          isLoading: isExecuting,
        };
      } else {
        return {
          action: 'changeInputs',
          label: 'Change Inputs',
          disabled: isExecuting,
          isLoading: isExecuting,
        };
      }
    }

    if (activeTab === 'visualize') {
      return {
        action: isVisualizePlaying ? 'pause' : 'play',
        label: isVisualizePlaying ? 'Pause' : 'Play',
        disabled: false,
        isLoading: false,
      };
    }

    return {
      action: 'compile',
      label: 'Compile',
      disabled: false,
      isLoading: false,
    };
  }, [activeTab, executeTabSubTab, canVisualize, isCompiling, isExecuting, isVisualizePlaying]);
}
