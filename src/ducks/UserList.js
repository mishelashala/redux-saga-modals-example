import { call, put, take, takeEvery } from "redux-saga/effects";
import { UserService } from "../services/userService";

const userService = UserService();

export const FETCH_USER_LIST = "FETCH_USER_LIST";
export const FETCH_USER_LIST_START = "FETCH_USER_LIST_START";
export const FETCH_USER_LIST_SUCCESS = "FETCH_USER_LIST_SUCCESS";
export const FETCH_USER_LIST_FAILURE = "FETCH_USER_LIST_FAILURE";

export const DELETE_USER = "DELETE_USER";
export const DELETE_USER_START = "DELETE_USER_START";

export const OPEN_MODAL = "OPEN_MODAL";
export const CLOSE_MODAL = "CLOSE_MODAL";
export const RESOLVE_MODAL = "RESOLVE_MODAL";

export function closeModal() {
  return { type: CLOSE_MODAL };
}

export function openModal(modalName) {
  return {
    type: "OPEN_MODAL",
    payload: modalName,
  };
}

export function resolveModal(payload) {
  return { type: RESOLVE_MODAL, payload };
}

export function* waitForModalResponse(modalName) {
  yield put(openModal(modalName));
  return yield take(RESOLVE_MODAL);
}

export function* doFetchUserList() {
  try {
    yield put({ type: FETCH_USER_LIST_START });
    const data = yield call(userService.getList);
    console.log("data:", data);
    yield put({ type: FETCH_USER_LIST_SUCCESS, payload: data });
  } catch (err) {
    yield put({ type: FETCH_USER_LIST_FAILURE });
  }
}

export function deleteUser(userId) {
  return { type: DELETE_USER, payload: userId };
}

export function* doHandleDeleteUser(action) {
  const userId = action.payload;

  const resultDeleteUserModal = yield call(
    waitForModalResponse,
    "DeleteUserModal"
  );

  if (resultDeleteUserModal.payload.action === "close") {
    yield put(closeModal());
    return;
  }

  const resultConfirmDeleteUserModal = yield call(
    waitForModalResponse,
    "ConfirmDeleteUserModal"
  );

  if (resultConfirmDeleteUserModal.payload.action === "close") {
    yield put(closeModal());
    return;
  }

  try {
    yield put({ type: DELETE_USER_START });
    yield call(userService.deleteUserById, userId);
    yield put({ type: FETCH_USER_LIST_SUCCESS });
    yield call(doFetchUserList);
    yield put(closeModal());
  } catch (err) {
    yield put({ type: FETCH_USER_LIST_FAILURE });
  }
}

export function* userListSaga() {
  yield takeEvery(FETCH_USER_LIST, doFetchUserList);
  yield takeEvery(DELETE_USER, doHandleDeleteUser);
}

const initalState = {
  userList: {
    isLoding: true,
    data: {},
  },
  modal: {
    name: null,
  },
};

export function userListReducer(state = initalState, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_USER_LIST_START:
      return {
        ...state,
        userList: {
          ...state.userList,
          isLoding: true,
        },
      };

    case FETCH_USER_LIST_SUCCESS:
      return {
        ...state,
        userList: {
          ...state.userList,
          isLoding: false,
          data: action.payload,
        },
      };

    case OPEN_MODAL:
      return {
        ...state,
        modal: {
          name: action.payload,
        },
      };

    case CLOSE_MODAL:
      return {
        ...state,
        modal: {
          name: null,
        },
      };

    default:
      return state;
  }
}
