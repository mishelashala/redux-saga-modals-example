import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { userListReducer, userListSaga } from "./ducks/UserList";

export function configureStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(userListReducer, applyMiddleware(sagaMiddleware));

  sagaMiddleware.run(userListSaga);

  return store;
}
