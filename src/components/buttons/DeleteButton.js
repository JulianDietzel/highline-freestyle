import { BsTrashFill } from 'react-icons/bs';

const DeleteButton = ({ setShowDeleteWarning }) => {
  return (
    <button className="btn" onClick={() => setShowDeleteWarning(true)}>
      <BsTrashFill style={{fill: "#dc3545"}}/>
    </button>
  );
}

export default DeleteButton;

