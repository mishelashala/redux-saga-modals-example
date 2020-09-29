import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { call, put, take, takeEvery } from "redux-saga/effects";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const CLOSE_MODAL = "CLOSE_MODAL";
const RESOLVE_MODAL = "RESOLVE_MODAL";

export function closeModal() {
  return { type: CLOSE_MODAL };
}

export function openModal(modalName, meta) {
  return {
    type: "OPEN_MODAL",
    payload: modalName,
    meta,
  };
}

export function resolveModal(payload) {
  return { type: RESOLVE_MODAL, payload };
}

function* waitForModal(modalName, meta) {
  yield put(openModal(modalName, meta));
  return yield take(RESOLVE_MODAL);
}

const userService = {
  getList: () => {
    return Promise.resolve({
      1: { id: 1, name: "John Doe" },
      2: { id: 2, name: "jenny doe" },
    });
  },
};

function* doFetchUserList() {
  yield put({ type: "FETCH_USER_LIST_START" });
  const data = yield call(userService.getList);
  yield put({ type: "FETCH_USER_LIST_SUCCESS", payload: data });
}

export function deleteUser(userId) {
  return { type: "DELETE_USER", payload: userId };
}

function* doHandleDeleteUser(action) {
  const userId = action.payload;
  const resultDeleteUserModal = yield call(waitForModal, "DeleteUserModal");

  if (resultDeleteUserModal.payload.action === "close") {
    yield put(closeModal());
    return;
  }

  const resultConfirmDeleteUserModal = yield call(
    waitForModal,
    "ConfirmDeleteUserModal"
  );

  if (resultConfirmDeleteUserModal.payload.action === "close") {
    yield put(closeModal());
    return;
  }

  console.log(userId);
}

function* rootSaga() {
  yield takeEvery("FETCH_USER_LIST", doFetchUserList);
  yield takeEvery("DELETE_USER", doHandleDeleteUser);
}

const initalState = {
  userList: {
    isLoding: true,
    data: {},
  },
  modal: {
    isOpen: false,
    name: null,
  },
};

function reducer(state = initalState, action) {
  switch (action.type) {
    case "FETCH_USER_LIST_START":
      return {
        ...state,
        userList: {
          ...state.userList,
          isLoding: true,
        },
      };

    case "FETCH_USER_LIST_SUCCESS":
      return {
        ...state,
        userList: {
          ...state.userList,
          isLoding: false,
          data: action.payload,
        },
      };

    case "OPEN_MODAL":
      return {
        ...state,
        modal: {
          isOpen: true,
          name: action.payload,
          meta: action.meta,
        },
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        modal: {
          isOpen: false,
          name: null,
        },
      };

    default:
      return state;
  }
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
