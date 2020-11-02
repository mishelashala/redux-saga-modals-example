import React, { useEffect } from "react";
import "./App.css";
import { useSelector, useDispatch } from "react-redux";
import { resolveModal, deleteUser, FETCH_USER_LIST } from "./ducks/UserList";
import { compose, path, defaultTo } from "lodash/fp";

function noop() {}

export function ModalHeader({ title, hasCloseButton, onClickClose = noop }) {
  return (
    <header className="modal__header between">
      <h2>{title}</h2>
      {hasCloseButton && (
        <a onClick={onClickClose} href="/#">
          x
        </a>
      )}
    </header>
  );
}

function DeleteUserModal() {
  const dispatch = useDispatch();

  function handleClickCancel() {
    dispatch(resolveModal({ action: "close" }));
  }

  function handleClickAccept() {
    dispatch(resolveModal({ action: "accept" }));
  }

  return (
    <Modal
      header={<ModalHeader title="Delete user" />}
      footer={
        <ModalFooter
          acceptButtonId="delete-modal-confirm-btn"
          acceptButtonText="Delete"
          cancelButtonId="delete-modal-cacel-btn"
          cancelButtonText="Never mind"
          onClickCancel={handleClickCancel}
          onClickAccept={handleClickAccept}
        />
      }
    >
      <div className="modal__content">Dude, are you serious?</div>
    </Modal>
  );
}

function ConfirmDeleteUserModal() {
  const dispatch = useDispatch();

  function handleClickClose() {
    dispatch(resolveModal({ action: "close" }));
  }

  function handleClickAccept() {
    dispatch(resolveModal({ action: "accept" }));
  }

  return (
    <Modal
      header={
        <ModalHeader
          title="Are you really sure"
          hasCloseButton={true}
          onClickClose={handleClickClose}
        />
      }
      footer={
        <ModalFooter
          acceptButtonId="confirm-modal-delete-btn"
          acceptButtonText="Ok then..."
          onClickAccept={handleClickAccept}
        />
      }
    />
  );
}

export function Modal({ header, children, footer }) {
  return (
    <section className="modal">
      <div className="modal__container">
        {header}
        {children}
        {footer}
      </div>
    </section>
  );
}

function ModalFooter({
  acceptButtonId,
  acceptButtonText,
  cancelButtonId,
  cancelButtonText,
  onClickCancel,
  onClickAccept,
}) {
  return (
    <footer>
      {cancelButtonText && cancelButtonText.length && (
        <button id={cancelButtonId} onClick={onClickCancel}>
          {cancelButtonText}
        </button>
      )}
      <button id={acceptButtonId} data-danger="true" onClick={onClickAccept}>
        {acceptButtonText}
      </button>
    </footer>
  );
}

// selectUserListData :: State -> UserData
const selectUserListData = compose(defaultTo({}), path(["userList", "data"]));

export function UserList() {
  const users = useSelector(selectUserListData);

  const isDeleteModalOpen = useSelector(
    (state) => state.modal.name === "DeleteUserModal"
  );
  const isConfirmationModalOpen = useSelector(
    (state) => state.modal.name === "ConfirmDeleteUserModal"
  );
  const dispatch = useDispatch();

  const handleClickDeleteUser = (userId) => () => {
    dispatch(deleteUser(userId));
  };

  return (
    <div>
      {Object.keys(users).map((userId) => (
        <div className="user-item" key={userId}>
          Name: {users[userId].name}
          <button
            id={`delete-user-${userId}-btn`}
            onClick={handleClickDeleteUser(userId)}
          >
            Delete
          </button>
        </div>
      ))}

      {isDeleteModalOpen && <DeleteUserModal />}

      {isConfirmationModalOpen && <ConfirmDeleteUserModal />}
    </div>
  );
}

export function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: FETCH_USER_LIST });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <UserList />;
}

export default App;
