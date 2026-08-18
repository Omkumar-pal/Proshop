// src/screens/OrderScreen.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Button, Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from "../actions/orderActions";
import { useParams, useNavigate } from "react-router-dom";
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from "../constants/orderConstants";

const OrderScreen = () => {
  const [sdkReady, setSdkReady] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // ---------- Derived data (no mutation of store) ----------
  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

  const itemsPrice =
    !loading && order
      ? addDecimals(
          order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
        )
      : "0.00";

  // ---------- Handlers ----------
  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult));
  };

  const deliverHandler = () => {
    // keep existing API: deliverOrder expects the order object in your code
    dispatch(deliverOrder(order));
  };

  // ---------- Effect: fetch order + PayPal script setup ----------
  useEffect(() => {
    // redirect to login if not authenticated
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const addPayPalScript = async () => {
      try {
        // if a PayPal SDK script already exists, don't append another
        const existing = document.querySelector(
          'script[src^="https://www.paypal.com/sdk/js"]'
        );
        if (existing) {
          // If SDK already loaded on window, mark ready
          if (window.paypal) setSdkReady(true);
          return;
        }

        const { data: clientId } = await axios.get("/api/config/paypal");
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
        script.async = true;
        script.onload = () => setSdkReady(true);
        script.onerror = () => console.error("PayPal SDK Failed to Load");
        document.body.appendChild(script);
      } catch (err) {
        console.error("Failed to load PayPal SDK", err);
      }
    };

    // Fetch logic: if no order, or the stored order is for a different id,
    // or pay/deliver succeeded, then fetch fresh details.
    if (!order || order._id !== orderId || successPay || successDeliver) {
      if (successPay) {
        dispatch({ type: ORDER_PAY_RESET });
      }
      if (successDeliver) {
        dispatch({ type: ORDER_DELIVER_RESET });
      }
      dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid) {
      // If order exists and not paid, ensure PayPal SDK is present
      if (!window.paypal) {
        addPayPalScript();
      } else {
        setSdkReady(true);
      }
    }
    // note: we purposely include `order` and success flags so effect re-runs correctly
  }, [
    dispatch,
    orderId,
    successPay,
    successDeliver,
    order,
    userInfo,
    navigate,
  ]);

  // ---------- Effect: render PayPal buttons into container, teardown when changed ----------
  useEffect(() => {
    if (!sdkReady || !order || order.isPaid) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    // Clear any previous rendered buttons/html to avoid stale UI
    container.innerHTML = "";

    if (!window.paypal) {
      console.error(
        "PayPal SDK not found on window even though sdkReady is true."
      );
      return;
    }

    window.paypal
      .Buttons({
        createOrder: (data, actions) =>
          actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: order.totalPrice.toString(),
                },
              },
            ],
          }),
        onApprove: (data, actions) =>
          actions.order.capture().then((details) => {
            successPaymentHandler(details);
          }),
        onError: (err) => {
          console.error("PayPal Buttons onError:", err);
        },
      })
      .render("#paypal-button-container");

    // cleanup: remove buttons HTML when effect dependencies change / unmount
    return () => {
      const c = document.getElementById("paypal-button-container");
      if (c) c.innerHTML = "";
    };
  }, [sdkReady, order]);

  // ---------- Render guards ----------
  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!order) return <Loader />; // extra safeguard

  // ---------- JSX ----------
  return (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user?.name}
              </p>
              <p>
                <strong>Email: </strong>{" "}
                <a href={`mailto:${order.user?.email}`}>{order.user?.email}</a>
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress?.address}, {order.shippingAddress?.city}{" "}
                {order.shippingAddress?.postalCode},{" "}
                {order.shippingAddress?.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  Delivered On {order.deliveredAt}
                </Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method:</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  Paid On {new Date(order.paidAt).toLocaleString()}
                </Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>No Order Placed yet.</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={
                              typeof item.image === "string"
                                ? item.image
                                : `/api/products/${item.product}/image`
                            }
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>

                        <Col md={4}>
                          {item.qty} X ${item.price} = $
                          {Number(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col> ${itemsPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col> ${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col> ${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col> ${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {!order.isPaid && (
                <ListGroup.Item>
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.85rem",
                      marginBottom: "12px",
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <strong className="text-primary">
                        <i className="fab fa-paypal me-1"></i> PayPal Sandbox Mode
                      </strong>
                      <span className="badge bg-warning text-dark">Test Mode</span>
                    </div>
                    <p className="mb-2 text-muted" style={{ lineHeight: "1.3" }}>
                      To complete test payment, get your sandbox buyer account or card details from PayPal Developer:
                    </p>
                    <a
                      href="https://developer.paypal.com/dashboard/accounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm w-100 mb-2 fw-bold"
                      style={{ fontSize: "0.82rem" }}
                    >
                      <i className="fas fa-external-link-alt me-1"></i> Open PayPal Sandbox Accounts ↗
                    </a>
                    <div className="text-muted" style={{ fontSize: "0.78rem", lineHeight: "1.3" }}>
                      👉 View your <strong>Personal (Buyer)</strong> account to find your test Email, Password, Card number, and address.
                    </div>
                  </div>

                  {loadingPay || !sdkReady ? (
                    <Loader />
                  ) : (
                    <div id="paypal-button-container" />
                  )}
                </ListGroup.Item>
              )}

              {loadingDeliver && <Loader />}

              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type="button"
                      className="btn btn-block"
                      onClick={deliverHandler}
                    >
                      Mark as Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
