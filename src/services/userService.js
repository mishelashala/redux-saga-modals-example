export function UserService() {
  const users = {
    1: { id: 1, name: "John Doe" },
    2: { id: 2, name: "jenny doe" },
  };

  function getList() {
    return Promise.resolve(users);
  }

  function deleteUserById(id) {
    delete users[id];
    return Promise.resolve(users);
  }

  return { getList, deleteUserById };
}

export const userService = UserService();
