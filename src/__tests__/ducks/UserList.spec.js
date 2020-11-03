import { pipe } from "lodash/fp";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import {
  closeModal,
  doHandleDeleteUser,
  waitForModalResponse,
  resolveModal,
  DELETE_USER_START,
  DELETE_USER_SUCCESS,
  openModal,
  OPEN_MODAL,
  CLOSE_MODAL,
  RESOLVE_MODAL,
  fetchUserListStart,
  FETCH_USER_LIST_START,
  fetchUserListFailure,
  FETCH_USER_LIST_SUCCESS,
  fetchUserListSuccess,
  FETCH_USER_LIST_FAILURE,
  deleteUserByIdStart,
  deleteUserByIdSuccess,
  DELETE_USER_FAILURE,
  deleteUserByIdFailure,
  userListReducer,
  initialState,
  setUserListLoading,
  setUserListError,
  doFetchUserList,
} from "../../ducks/UserList";
import { userService } from "../../services/userService";

describe("doHandleDeleteUser", () => {
  it("should open DeleteUserModal, then close it", () => {
    const action = { payload: 1 };
    return expectSaga(doHandleDeleteUser, action)
      .provide([
        [
          matchers.call.fn(waitForModalResponse),
          resolveModal({ action: "close" }),
        ],
      ])
      .call.fn(waitForModalResponse, "DeleteUserModal")
      .put(closeModal())
      .run();
  });

  it("should open DeleteUserModal, then open ConfirmDeleteUserModal and then close it", () => {
    const action = { payload: 1 };

    return expectSaga(doHandleDeleteUser, action)
      .provide([
        [
          matchers.call.fn(waitForModalResponse),
          resolveModal({ action: "accept" }),
        ],
        [
          matchers.call.fn(waitForModalResponse),
          resolveModal({ action: "close" }),
        ],
      ])
      .call.fn(waitForModalResponse, "DeleteUserModal")
      .call.fn(waitForModalResponse, "ConfirmDeleteUserModal")
      .put(closeModal())
      .run();
  });

  it("should delete the user", () => {
    const userId = 1;
    const action = { payload: userId };

    return expectSaga(doHandleDeleteUser, action)
      .provide([
        [
          matchers.call.fn(waitForModalResponse),
          resolveModal({ action: "accept" }),
        ],
        [
          matchers.call.fn(waitForModalResponse),
          resolveModal({ action: "accept" }),
        ],
        [matchers.call.fn(userService.deleteUserById, userId), null],
        [
          matchers.call.fn(userService.getList, {
            2: { id: 2, name: "John Doe" },
          }),
        ],
      ])
      .call.fn(waitForModalResponse, "DeleteUserModal")
      .call.fn(waitForModalResponse, "ConfirmDeleteUserModal")
      .put({ type: DELETE_USER_START })
      .put({ type: DELETE_USER_SUCCESS })
      .put(closeModal())
      .run();
  });
});

describe("doFetchUserList()", () => {
  it("should successfully fetch the list of users", () => {
    const users = {
      1: {
        id: 1,
        name: "jenny doe",
      },
    };

    return expectSaga(doFetchUserList)
      .provide([[matchers.call.fn(userService.getList), users]])
      .put(fetchUserListStart())
      .call.fn(userService.getList)
      .put(fetchUserListSuccess(users))
      .run();
  });

  it("should fail fetching the list of users", () => {
    const err = new Error("something went wrong");

    return expectSaga(doFetchUserList)
      .provide([[matchers.call.fn(userService.getList), Promise.reject(err)]])
      .put(fetchUserListStart())
      .call.fn(userService.getList)
      .put(fetchUserListFailure(err))
      .run();
  });
});

describe("action creators", () => {
  describe("Modal", () => {
    test("openModal()", () => {
      const action = openModal("name");

      expect(action.type).toEqual(OPEN_MODAL);
      expect(action.payload).toEqual("name");
    });

    test("closeModal()", () => {
      const action = closeModal();

      expect(action.type).toEqual(CLOSE_MODAL);
    });

    test("resolveModal()", () => {
      const action = resolveModal("name");

      expect(action.type).toEqual(RESOLVE_MODAL);
      expect(action.payload).toEqual("name");
    });
  });

  describe("Fetch User List", () => {
    test("fetchUserListStart()", () => {
      const action = fetchUserListStart();

      expect(action.type).toEqual(FETCH_USER_LIST_START);
    });

    test("fetchUserListSuccess()", () => {
      const users = { 1: { id: 1, name: "john" } };
      const action = fetchUserListSuccess(users);

      expect(action.type).toEqual(FETCH_USER_LIST_SUCCESS);
      expect(action.payload).toEqual(users);
    });

    test("fetchUserListFailure()", () => {
      const err = new Error("Something went wrong");
      const action = fetchUserListFailure(err);

      expect(action.type).toEqual(FETCH_USER_LIST_FAILURE);
      expect(action.error).toBe(true);
      expect(action.payload).toEqual(err);
    });
  });

  describe("Delete User By Id", () => {
    test("deleteUserByIdStart()", () => {
      const action = deleteUserByIdStart();

      expect(action.type).toEqual(DELETE_USER_START);
    });

    test("deleteUserByIdSuccess()", () => {
      const action = deleteUserByIdSuccess();

      expect(action.type).toEqual(DELETE_USER_SUCCESS);
    });

    test("deleteUserByIdFailure()", () => {
      const err = new Error("something went wrong");
      const action = deleteUserByIdFailure(err);

      expect(action.type).toEqual(DELETE_USER_FAILURE);
      expect(action.error).toBe(true);
      expect(action.payload).toEqual(err);
    });
  });
});

describe("User List Reducer", () => {
  describe("Modal", () => {
    test("OPEN_MODAL", () => {
      const action = openModal("name");
      const result = userListReducer(initialState, action);

      expect(result.modal.name).toEqual("name");
    });

    test("CLOSE_MODAL", () => {
      const action = closeModal();
      const result = userListReducer(initialState, action);

      expect(result.modal.name).toEqual(null);
    });
  });

  describe("Fetch User List", () => {
    test("FETCH_USER_LIST_START", () => {
      const action = fetchUserListStart();
      const result = userListReducer(initialState, action);

      expect(result.userList.isLoading).toBe(true);
    });

    test("FETCH_USER_LIST_SUCCESS", () => {
      const users = { 1: { id: 1, name: "john" } };
      const action = fetchUserListSuccess(users);
      const result = userListReducer(initialState, action);

      expect(result.userList.isLoading).toBe(false);
      expect(result.userList.data).toEqual(users);
    });

    test("FETCH_USER_LIST_FAILURE", () => {
      const err = new Error("something went wrong");
      const action = fetchUserListFailure(err);
      const result = userListReducer(initialState, action);

      expect(result.userList.isLoading).toBe(false);
      expect(result.userList.error).toEqual(err);
    });
  });

  describe("Delete User By Id", () => {
    test("DELETE_USER_START", () => {
      const action = deleteUserByIdStart();
      const result = userListReducer(initialState, action);

      expect(result.userList.isDeleting).toEqual(true);
    });

    test("DELETE_USER_SUCCESS", () => {
      const state = pipe(
        setUserListLoading(true),
        setUserListError(new Error("some error"))
      )(initialState);

      const action = deleteUserByIdSuccess();
      const result = userListReducer(state, action);

      expect(result.userList.isDeleting).toBe(false);
      expect(result.userList.error).toBe(null);
    });

    test("DELETE_USER_FAILURE", () => {
      const err = new Error("something went wrong");
      const action = deleteUserByIdFailure(err);
      const result = userListReducer(initialState, action);

      expect(result.userList.isDeleting).toBe(false);
      expect(result.userList.error).toEqual(err);
    });
  });
});
