import {
  ApolloQueryResult,
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
  useQuery,
} from '@apollo/client';
import { useCallback, useMemo } from 'react';

export interface CancellableQueryResult<
  TData = any,
  TVariables = OperationVariables
> extends QueryResult<TData, TVariables> {
  cancel: () => void;
}

export const useCancellableQuery = <
  TData = any,
  TVariables = OperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>
): CancellableQueryResult<TData, TVariables> => {
  const { refetch, ...queryResult } = useQuery<TData, TVariables>(query, {
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

  const cancellableRefetch = useCallback(
    (variables?: Partial<TVariables> | undefined) => {
      return new Promise<ApolloQueryResult<TData>>((resolve, reject) => {
        if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'));

        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });

        refetch(variables)
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    [refetch, signal]
  );

  const cancel = useCallback(() => {
    abortController.abort();
  }, [abortController]);

  return {
    ...queryResult,
    cancel,
    refetch: cancellableRefetch,
  };
};
