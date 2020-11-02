import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "../configureStore";
import { mount } from "enzyme";
import { UserList } from "../App";
import { fetchUserListSuccess } from "../ducks/UserList";

describe("<UserList />", () => {
  const store = configureStore();
  const users = {
    1: { id: 1, name: "John Doe" },
    2: { id: 2, name: "jenny doe" },
  };

  beforeEach(() => {
    store.dispatch(fetchUserListSuccess(users));
  });

  it("should render the list of users", () => {
    const wrapper = mount(
      <Provider store={store}>
        <UserList />
      </Provider>
    );

    expect(wrapper.find(".user-item").length).toBe(2);
    expect(wrapper.find(".modal").length).toBe(0);
  });

  it("should display <DeleteUserModal /> when delete button is clicked", () => {
    const wrapper = mount(
      <Provider store={store}>
        <UserList />
      </Provider>
    );

    wrapper.find("#delete-user-1-btn").simulate("click");
    expect(wrapper.find("DeleteUserModal")).toBeDefined();
  });

  it("should display <ConfirmDeleteUserModal /> when ok button is clicked", () => {
    const wrapper = mount(
      <Provider store={store}>
        <UserList />
      </Provider>
    );

    wrapper.find("#delete-user-1-btn").simulate("click");
    wrapper.find("#delete-modal-confirm-btn").simulate("click");
    expect(wrapper.find("ConfirmDeleteUserModal")).toBeDefined();
  });
});
