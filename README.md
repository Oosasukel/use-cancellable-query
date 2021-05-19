# use-cancellable-query

Hooks made based on the [useQuery](https://www.apollographql.com/docs/react/data/queries/) and [useMutation](https://www.apollographql.com/docs/react/data/mutations/) of the [apollo client](https://www.apollographql.com/docs/react/), with an extra function to cancel requests. Can be useful when the component is unmounting and there is a request in progress.

## Features

- useCancellableQuery
- useCancellableMutation

## Installing

Using npm:

```bash
$ npm install use-cancellable-query
```

Using yarn:

```bash
$ yarn add use-cancellable-query
```

## Usage

### useCancellableQuery

When calling the `cancel` function, the `refetch` promise will be rejected with `error.name = "AbortError"` and `onCompleted` and `onError` will not be executed.

```js
import { useCancellableQuery } from 'use-cancellable-query';

// ...

// Inside your component
const { data, error, refetch, cancel } = useCancellableQuery(YOUR_QUERY, {
  onCompleted: (data) => {
    // some code
  },
  onError: (error) => {
    // some code
  },
});

function usingRefetch() {
  refetch()
    .then((response) => {
      // some code
    })
    .catch((error) => {
      if (error.name === 'AbortError') return;

      // some code
    });
}

// Cancel Request
cancel();

// ...
```

### useCancellableMutation

When calling the `cancel` function, the `refetch` promise will be rejected with `error.name = "AbortError"` and `onCompleted` and `onError` will not be executed.

```js
import { useCancellableMutation } from 'use-cancellable-query';

// ...

// Inside your component
const [mutation, { cancel }] = useCancellableMutation(YOUR_MUTATION, {
  onCompleted: (data) => {
    // some code
  },
  onError: (error) => {
    // some code
  },
});

function usingMutation() {
  mutation()
    .then((response) => {
      // some code
    })
    .catch((error) => {
      if (error.name === 'AbortError') return;

      // some code
    });
}

// Cancel Request
cancel();

// ...
```

## License

[MIT](LICENSE)
