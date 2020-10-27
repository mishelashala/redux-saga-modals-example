import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga-test-plan/matchers";
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
} from "../UserList";
import { UserService } from "../../services/userService";

describe("doHandleDeleteUser", () => {
  it("should open DeleteUserModal, then close it", () => {
    const action = { payload: 1 };
    return expectSaga(doHandleDeleteUser, action)
      .provide([
        [call.fn(waitForModalResponse), resolveModal({ action: "close" })],
      ])
      .call.fn(waitForModalResponse, "DeleteUserModal")
      .put(closeModal())
      .run();
  });

  it("should open DeleteUserModal, then open ConfirmDeleteUserModal and then close it", () => {
    const action = { payload: 1 };

    return expectSaga(doHandleDeleteUser, action)
      .provide([
        [call.fn(waitForModalResponse), resolveModal({ action: "accept" })],
        [call.fn(waitForModalResponse), resolveModal({ action: "close" })],
      ])
      .call.fn(waitForModalResponse, "DeleteUserModal")
      .call.fn(waitForModalResponse, "ConfirmDeleteUserModal")
      .put(closeModal())
      .run();
  });

  it("should delete the user", () => {
    const userService = UserService();
    const userId = 1;
    const action = { payload: userId };

    return expectSaga(doHandleDeleteUser, action)
      .provide([
        [call.fn(waitForModalResponse), resolveModal({ action: "accept" })],
        [call.fn(waitForModalResponse), resolveModal({ action: "accept" })],
        [call.fn(userService.deleteUserById, userId), null],
        [call.fn(userService.getList, { 2: { id: 2, name: "John Doe" } })],
      ])
      .call.fn(waitForModalResponse, "DeleteUserModal")
      .call.fn(waitForModalResponse, "ConfirmDeleteUserModal")
      .put({ type: DELETE_USER_START })
      .put({ type: DELETE_USER_SUCCESS })
      .put(closeModal())
      .run();
  });
});

describe("action creators", () => {
  describe("Modal related", () => {
    it("should create an open modal action", () => {
      const action = openModal("name");

      expect(action.type).toEqual(OPEN_MODAL);
      expect(action.payload).toEqual("name");
    });

    it("should create a close modal action", () => {
      const action = closeModal();

      expect(action.type).toEqual(CLOSE_MODAL);
    });

    it("should create a resolve modal action", () => {
      const action = resolveModal("name");

      expect(action.type).toEqual(RESOLVE_MODAL);
      expect(action.payload).toEqual("name");
    });
  });

  describe("Fetch User List related", () => {
    it("should create a fetch user list start action", () => {
      const action = fetchUserListStart();

      expect(action.type).toEqual(FETCH_USER_LIST_START);
    });

    it("should create a fetch user list success action", () => {
      const users = { 1: { id: 1, name: "john" } };
      const action = fetchUserListSuccess(users);

      expect(action.type).toEqual(FETCH_USER_LIST_SUCCESS);
      expect(action.payload).toEqual(users);
    });

    it("should create a fetch user list failure action", () => {
      const err = new Error("Something went wrong");
      const action = fetchUserListFailure(err);

      expect(action.type).toEqual(FETCH_USER_LIST_FAILURE);
      expect(action.error).toBe(true);
      expect(action.payload).toEqual(err);
    });
  });

  describe("Delete User By Id related", () => {
    it("should create a delete user by id start action", () => {
      const action = deleteUserByIdStart();

      expect(action.type).toEqual(DELETE_USER_START);
    });

    it("should create a delete user by id success", () => {
      const action = deleteUserByIdSuccess();

      expect(action.type).toEqual(DELETE_USER_SUCCESS);
    });

    it("should create a delete user by id failure", () => {
      const err = new Error("something went wrong");
      const action = deleteUserByIdFailure(err);

      expect(action.type).toEqual(DELETE_USER_FAILURE);
      expect(action.error).toBe(true);
      expect(action.payload).toEqual(err);
    });
  });
});
