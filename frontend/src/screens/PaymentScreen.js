import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Col } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { savePaymentMethod } from "../actions/cartActions";
import { useNavigate } from "react-router-dom";
import Checkoutsteps from "../components/Checkoutsteps";

const PaymentScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);

  const { shippingAddress } = cart;

  if (!shippingAddress) {
    navigate("/shipping");
  }
  const [paymentMethod, setPaymentMethod] = useState("PayPal");

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  return (
    <FormContainer>
      <Checkoutsteps step1 step2 />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend"> Select Method </Form.Label>

          <Col>
            <Form.Check
              type="radio"
              label="PayPal or Credit Card"
              id="PayPal"
              name="paymentMethod"
              value="PayPal"
              defaultChecked={paymentMethod === "PayPal"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>

            {/* <Form.Check
              type="radio"
              label="Stripe"
              id="Stripe"
              name="paymentMethod"
              value="Stripe"
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check> */}
          </Col>
        </Form.Group>

        <div className="alert alert-info py-2 px-3 my-3" style={{ fontSize: "0.85rem" }}>
          <i className="fas fa-info-circle me-1"></i> <strong>Testing in Sandbox?</strong> Get test buyer credentials from the{" "}
          <a
            href="https://developer.paypal.com/dashboard/accounts"
            target="_blank"
            rel="noopener noreferrer"
            className="fw-bold"
          >
            PayPal Developer Dashboard ↗
          </a>
        </div>

        <Button type="submit" variant="primary">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
