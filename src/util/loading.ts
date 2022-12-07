import {
  AsyncThunk,
  CaseReducer,
  Draft,
  PayloadAction,
} from "@reduxjs/toolkit";

interface LoadingPending {
  status: "pending";
  data?: never;
  error?: never;
}
interface LoadingIdle {
  status: "idle";
  data?: never;
  error?: never;
}
interface LoadingRejected<E> {
  status: "rejected";
  error: E;
}
interface LoadingFulfilled<T> {
  status: "fulfilled";
  data: T;
}

export type Loading<T = any, E = any> =
  | LoadingPending
  | LoadingIdle
  | LoadingRejected<E>
  | LoadingFulfilled<T>;

export type LoadingStatus = Loading<never, never>["status"];

export const makePending = (): LoadingPending => ({ status: "pending" });
export const makeIdle = (): LoadingIdle => ({ status: "idle" });
export const makeRejected = <E>(error: E): LoadingRejected<E> => ({
  status: "rejected",
  error,
});
export const makeFulfilled = <T>(data: T): LoadingFulfilled<T> => ({
  status: "fulfilled",
  data,
});
export const isAny = <T, E>(
  loader: Loading<T, E>,
  ...matchers: ((loading?: Loading<T, E>) => boolean)[]
): boolean => matchers.some((m) => m(loader));
export const isPending = (loading?: Loading): loading is LoadingPending =>
  loading !== undefined && loading.status === "pending";
export const isIdle = (loading?: Loading): loading is LoadingIdle =>
  loading !== undefined && loading.status === "idle";
export const isRejected = <E>(
  loading?: Loading<never, E>
): loading is LoadingRejected<E> =>
  loading !== undefined && loading.status === "rejected";
export const isFulfilled = <T>(
  loading?: Loading<T>
): loading is LoadingFulfilled<T> =>
  loading !== undefined && loading.status === "fulfilled";

export const mapLoading = <T = any, R = any>(
  loading: Loading<T>,
  f: (t?: T) => R
) => {
  console.log(isFulfilled(loading));
  return isFulfilled(loading) ? makeFulfilled(f(loading.data)) : loading;
};
export const mapLoadingErr = <E = any, R = any>(
  loading: Loading<never, E>,
  f: (e?: E) => R
) => {
  return isRejected(loading) ? makeRejected(f(loading.error)) : loading;
};

type LoadingMatcher = (action: PayloadAction<any, string>) => boolean;
type LoadingReducer<State, Result, Meta = unknown> = CaseReducer<
  State,
  PayloadAction<Result, string, Meta, any>
>;
type FieldSetter<State, Result, Meta> = (
  state: Draft<State>,
  action: PayloadAction<Result, string, Meta, any>,
  status: Loading<any, any>
) => void;

interface MakeLoadingMatcherOpts<
  State,
  Result,
  Meta,
  K extends keyof Draft<State> = keyof Draft<State>
> {
  field?: K | FieldSetter<State, Result, Meta>;
  onPending?: LoadingReducer<State, Result, Meta>;
  onRejected?: LoadingReducer<State, Result, Meta>;
  onFulfilled?: LoadingReducer<State, Result, Meta>;
  afterPending?: LoadingReducer<State, Result, Meta>;
  afterRejected?: LoadingReducer<State, Result, Meta>;
  afterFulfilled?: LoadingReducer<State, Result, Meta>;

  transform?: (result: Result) => Draft<State>[K];
}

export const makeLoadingMatcher = <
  State = any,
  Result = any,
  Arg = any,
  Meta = { arg: Arg }
>(
  thunk: AsyncThunk<Result, Arg, any>,
  opts?: MakeLoadingMatcherOpts<State, Result, Meta>
): [LoadingMatcher, LoadingReducer<State, Result, Meta>] => {
  return [
    (action: PayloadAction<any, string>) =>
      action.type.startsWith(thunk.typePrefix),
    (state: Draft<State>, action: PayloadAction<Result, string, Meta, any>) => {
      const reduce = (status: Exclude<LoadingStatus, "idle">) => {
        const { onHandler, afterHandler, loadingStatus } = {
          pending: {
            onHandler: opts?.onPending,
            afterHandler: opts?.afterPending,
            loadingStatus: makePending(),
          },
          fulfilled: {
            onHandler: opts?.onFulfilled,
            afterHandler: opts?.afterFulfilled,
            loadingStatus: makeFulfilled(
              opts?.transform ? opts.transform(action.payload) : action.payload
            ),
          },
          rejected: {
            onHandler: opts?.onRejected,
            afterHandler: opts?.afterRejected,
            loadingStatus: makeRejected(action.error),
          },
        }[status];

        onHandler?.(state, action);
        if (opts?.field)
          typeof opts.field === "function"
            ? opts.field(state, action, loadingStatus)
            : ((state[opts.field] as Loading<any, any>) = loadingStatus);
        afterHandler?.(state, action);
      };

      if (action.type.endsWith("pending")) reduce("pending");
      else if (action.type.endsWith("rejected")) reduce("rejected");
      else if (action.type.endsWith("fulfilled")) reduce("fulfilled");
    },
  ];
};
