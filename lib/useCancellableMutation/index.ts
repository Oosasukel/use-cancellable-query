import {
  DocumentNode,
  FetchResult,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationResult,
  OperationVariables,
  TypedDocumentNode,
  useMutation,
} from '@apollo/client';
import { useCallback, useMemo } from 'react';

export interface CancellableMutationResult<TData = any>
  extends MutationResult<TData> {
  cancel: () => void;
}

export type CancellableMutationTuple<TData, TVariables> = [
  (
    options?: MutationFunctionOptions<TData, TVariables>
  ) => Promise<FetchResult<TData>>,
  CancellableMutationResult<TData>
];

export const useCancellableMutation = <
  TData = any,
  TVariables = OperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables>
): CancellableMutationTuple<TData, TVariables> => {
  const [execute, mutationResult] = useMutation(query, {
    ...options,
    onCompleted: (data) => {
      if (!signal.aborted && options?.onCompleted) {
        options.onCompleted(data);
      }
    },
    onError: (error) => {
      if (!signal.aborted && options?.onError) {
        options.onError(error);
      } else {
        throw error;
      }
    },
  });
  const abortController = useMemo(() => new AbortController(), []);
  const { signal } = abortController;

  const cancellableExecute = useCallback(
    (options?: MutationFunctionOptions<TData, TVariables> | undefined) => {
      return new Promise<
        FetchResult<TData, Record<string, any>, Record<string, any>>
      >((resolve, reject) => {
        if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'));

        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });

        execute(options)
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    [execute, signal]
  );

  const cancel = useCallback(() => {
    abortController.abort();
  }, [abortController]);

  return [cancellableExecute, { ...mutationResult, cancel }];
};
