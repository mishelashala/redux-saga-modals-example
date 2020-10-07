import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga-test-plan/matchers";
import {
  closeModal,
  doHandleDeleteUser,
  waitForModalResponse,
  resolveModal,
  DELETE_USER_START,
  DELETE_USER_SUCCESS,
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
