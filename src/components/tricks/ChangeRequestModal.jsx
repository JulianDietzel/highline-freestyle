import Modal from "react-bootstrap/Modal";
import {Button, Form} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useState} from "react";

const ChangeRequestModal = ({show, setShow, trick}) => {

  const [radioState, setRadioState] = useState(-1)
  const [comment, setComment] = useState("")
  const [validated, setValidated] = useState(false);

  function handleSubmit(e) {
    e.preventDefault()

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation()
      console.log("Invalid")
    }
    setValidated(true);
  }

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton className="px-lg-4">
          <div>
            <Modal.Title>Vote for a difficulty change.</Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body className="py-4 px-lg-4">
          <div className="text-muted mb-4">
            If you feel like this trick is especially off in its rating let us know. We aggregate the community's feedback
            and progressively adjust the ratings.
          </div>
          <Form.Group as={Row} className="mb-4 mt-2">
            <Form.Label column xs={4} className="my-0 py-0">Trick</Form.Label>
            <Col xs={8}>
              <Form.Label className="mb-0">{trick.alias || trick.technicalName}</Form.Label>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-4">
            <Form.Label column xs={4} className="my-0 py-0">The level should be</Form.Label>
            <Col xs={8}>
              <div key="change">
                <Form.Check required type="radio" label="much higher (+2 or more)" id="change-much-higher"
                            value={0} name="change" checked={radioState === 0} onChange={() => setRadioState(0)} />
                <Form.Check required type="radio" name="change" label="higher (+1)" id="change-higher"
                            value={1} checked={radioState === 1} onChange={() => setRadioState(1)}/>
                <Form.Check required type="radio" name="change" label="lower (-1)" id="change-lower"
                            value={2} checked={radioState === 2} onChange={() => setRadioState(2)}/>
                <Form.Check required type="radio" name="change" label="much lower (-2 or less)" id="direction-lower"
                            value={3} checked={radioState === 3} onChange={() => setRadioState(3)}
                            feedback="Select one option" feedbackType="invalid"/>
              </div>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-2">
            <Form.Label column xs={4} className="my-0 py-0">Comment (optional)</Form.Label>
            <Col xs={8}>
              <Form.Control as="textarea" rows={2} value={comment} onChange={(e) => setComment(e.target.value)}/>
            </Col>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <small className="align-self-center text-muted">Please don't vote multiple times &lt;3</small>

            <div className="d-flex">
              <Button variant="secondary" className="align-self-center ms-1" onClick={() => setShow(false)}>Close</Button>
              <Button variant="primary" className="align-self-center ms-2" type="submit">Submit</Button>
            </div>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ChangeRequestModal;