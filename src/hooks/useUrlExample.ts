import { useState, useEffect, useCallback } from 'react';
import type { Example } from '@/types';

export function useUrlExample(
  availableExamples: Example[]
): [Example, (example: Example) => void] {
  const [currentExample, setCurrentExampleState] = useState<Example>(() => {
    const params = new URLSearchParams(window.location.search);
    const exampleId = params.get('example');

    if (exampleId) {
      const found = availableExamples.find((ex) => ex.id === exampleId);
      if (found) {
        return found;
      }
    }

    return availableExamples[0];
  });

  const setCurrentExample = useCallback((example: Example) => {
    setCurrentExampleState(example);

    const params = new URLSearchParams(window.location.search);
    params.set('example', example.id);

    window.history.replaceState({}, '', `?${params.toString()}`);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const exampleId = params.get('example');

    if (!exampleId || !availableExamples.find((ex) => ex.id === exampleId)) {
      params.set('example', currentExample.id);
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, []);

  useEffect(() => {
    const handlePopstate = () => {
      const params = new URLSearchParams(window.location.search);
      const exampleId = params.get('example');

      if (exampleId) {
        const found = availableExamples.find((ex) => ex.id === exampleId);
        if (found) {
          setCurrentExampleState(found);
          return;
        }
      }

      setCurrentExampleState(availableExamples[0]);
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [availableExamples]);

  return [currentExample, setCurrentExample];
}
