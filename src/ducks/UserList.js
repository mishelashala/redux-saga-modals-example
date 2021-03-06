import { assocPath, pipe } from "lodash/fp";
import { call, put, take, takeEvery } from "redux-saga/effects";
import { userService } from "../services/userService";

export const FETCH_USER_LIST = "FETCH_USER_LIST";
export const FETCH_USER_LIST_START = "FETCH_USER_LIST_START";
export const FETCH_USER_LIST_SUCCESS = "FETCH_USER_LIST_SUCCESS";
export const FETCH_USER_LIST_FAILURE = "FETCH_USER_LIST_FAILURE";

export const DELETE_USER = "DELETE_USER";
export const DELETE_USER_START = "DELETE_USER_START";
export const DELETE_USER_SUCCESS = "DELETE_USER_SUCCESS";
export const DELETE_USER_FAILURE = "DELETE_USER_FAILURE";

export const OPEN_MODAL = "OPEN_MODAL";
export const CLOSE_MODAL = "CLOSE_MODAL";
export const RESOLVE_MODAL = "RESOLVE_MODAL";

export function closeModal() {
  return { type: CLOSE_MODAL };
}

export function openModal(modalName) {
  return {
    type: OPEN_MODAL,
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

export function fetchUserListStart() {
  return { type: FETCH_USER_LIST_START };
}

export function fetchUserListSuccess(payload) {
  return {
    type: FETCH_USER_LIST_SUCCESS,
    payload,
  };
}

export function fetchUserListFailure(err) {
  return {
    type: FETCH_USER_LIST_FAILURE,
    payload: err,
    error: true,
  };
}

export function* doFetchUserList() {
  try {
    yield put(fetchUserListStart());
    const data = yield call(userService.getList);
    yield put(fetchUserListSuccess(data));
  } catch (err) {
    yield put(fetchUserListFailure(err));
  }
}

export function deleteUser(userId) {
  return { type: DELETE_USER, payload: userId };
}

export function deleteUserByIdStart() {
  return { type: DELETE_USER_START };
}

export function deleteUserByIdSuccess() {
  return { type: DELETE_USER_SUCCESS };
}

export function deleteUserByIdFailure(err) {
  return { type: DELETE_USER_FAILURE, payload: err, error: true };
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
    yield put(deleteUserByIdStart());
    yield call(userService.deleteUserById, userId);
    yield put(deleteUserByIdSuccess());
    yield call(doFetchUserList);
    yield put(closeModal());
  } catch (err) {
    yield put(deleteUserByIdFailure(err));
  }
}

export function* userListSaga() {
  yield takeEvery(FETCH_USER_LIST, doFetchUserList);
  yield takeEvery(DELETE_USER, doHandleDeleteUser);
}

export const initialState = {
  userList: {
    data: {},
    error: null,
    isDeleting: false,
    isLoading: true,
  },
  modal: {
    name: null,
  },
};

export const setUserListLoading = assocPath(["userList", "isLoading"]);
export const setUserListError = assocPath(["userList", "error"]);
export const setUserListData = assocPath(["userList", "data"]);
export const setUserListDeleting = assocPath(["userList", "isDeleting"]);

export const setModalName = assocPath(["modal", "name"]);

export function userListReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_USER_LIST_START:
      return setUserListLoading(true, state);

    case FETCH_USER_LIST_SUCCESS:
      return pipe(
        setUserListLoading(false),
        setUserListData(action.payload)
      )(state);

    case FETCH_USER_LIST_FAILURE:
      return pipe(
        setUserListLoading(false),
        setUserListError(action.payload)
      )(state);

    case DELETE_USER_START:
      return setUserListDeleting(true, state);

    case DELETE_USER_SUCCESS:
      return pipe(setUserListDeleting(false), setUserListError(null))(state);

    case DELETE_USER_FAILURE:
      return pipe(
        setUserListDeleting(false),
        setUserListError(action.payload)
      )(state);

    case OPEN_MODAL:
      return setModalName(action.payload, state);

    case CLOSE_MODAL:
      return setModalName(null, state);

    default:
      return state;
  }
}
