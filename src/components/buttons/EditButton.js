import { BsPencilFill } from 'react-icons/bs';

const EditButton = ({call}) => {
  return (
    <button className="btn" onClick={call}>
      <BsPencilFill className="icon" style={{fill: "#0d6efd"}}/>
    </button>
  );
}

export default EditButton;
