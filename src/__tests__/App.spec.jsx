import React from "react";
import { mount } from "enzyme";
import { spy } from "sinon";
import { App, UserList } from "../App";

describe("<App />", () => {
  it("should render the list of users", () => {
    const wrapper = mount(<App />);

    expect(wrapper.find(".user-item").length).toBe(2);
    expect(wrapper.find(".modal").length).toBe(0);
  });

  it("should display <DeleteUserModal /> ", () => {
    const wrapper = mount(<App />);

    wrapper.find("#delete-user-1-btn").simulate("click");
    expect(wrapper.find("DeleteUserModal")).toBeDefined();
  });

  it("should display <ConfirmDeleteUserModal />", () => {
    const wrapper = mount(<App />);

    wrapper.find("#delete-user-1-btn").simulate("click");
    wrapper.find("#delete-modal-confirm-btn").simulate("click");
    expect(wrapper.find("ConfirmDeleteUserModal")).toBeDefined();
  });

  it("should remove a user from the list", () => {
    const wrapper = mount(<App />);

    expect(wrapper.find(".user-item").length).toBe(2);

    wrapper.find("#delete-user-1-btn").simulate("click");
    wrapper.find("#delete-modal-confirm-btn").simulate("click");
    wrapper.find("#confirm-modal-delete-btn").simulate("click");

    expect(wrapper.find(".user-item").length).toBe(1);
  });
});

describe("<UserList />", () => {
  const users = {
    1: { id: 1, name: "John Doe" },
    2: { id: 2, name: "jenny doe" },
  };

  it("should call onClickDeleteUser when delete user by id button gets clicked", () => {
    const callback = spy();
    const handleClickDeleteUser = () => callback;

    const wrapper = mount(
      <UserList users={users} onClickDeleteUser={handleClickDeleteUser} />
    );

    wrapper.find("#delete-user-1-btn").simulate("click");
    expect(callback.called).toBe(true);
  });
});
