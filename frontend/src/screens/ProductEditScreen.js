// ProductEditScreen.js
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Message from "../components/Message";
import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";
import { listProductDetails, updateProduct } from "../actions/productActions";
import { PRODUCT_UPDATE_RESET } from "../constants/productConstants";

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null); // { data, contentType } or null if unchanged
  const [imagePreview, setImagePreview] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const productUpdate = useSelector((state) => state.productUpdate || {});
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = productUpdate;

  useEffect(() => {
    dispatch({ type: PRODUCT_UPDATE_RESET });
  }, [dispatch]);

  useEffect(() => {
    dispatch(listProductDetails(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (product && product._id === productId) {
      setName(product.name || "");
      setPrice(product.price ?? 0);
      setBrand(product.brand || "");
      setCategory(product.category || "");
      setDescription(product.description || "");
      setCountInStock(product.countInStock ?? 0);
      // Show the existing stored image via the serving endpoint
      setImagePreview(`/api/products/${productId}/image`);
    }
  }, [product, productId]);

  useEffect(() => {
    if (successUpdate) {
      navigate("/admin/productlist");
    }
  }, [successUpdate, navigate]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axios.post("/api/upload", formData, config);
      // data = { data: base64String, contentType: "image/jpeg" }
      setImage(data);
      setImagePreview(`data:${data.contentType};base64,${data.data}`);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const payload = {
      _id: productId,
      name,
      price,
      brand,
      category,
      description,
      countInStock,
    };

    // Only include image in the payload if a new one was uploaded —
    // otherwise the backend keeps the existing stored image untouched
    if (image) {
      payload.image = image;
    }

    dispatch(updateProduct(payload));
  };

  return (
    <>
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Go Back
      </Link>

      <FormContainer>
        <h1>Edit Product</h1>

        {loadingUpdate && <Loader />}
        {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="price" className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group controlId="image" className="mb-3">
              <Form.Label>Product Image</Form.Label>

              {imagePreview && (
                <div className="mb-2">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={{ maxWidth: "200px", display: "block" }}
                  />
                </div>
              )}

              <Form.Control
                type="file"
                id="image-file"
                onChange={uploadFileHandler}
              />

              {uploading && <Loader />}
            </Form.Group>

            <Form.Group controlId="brand" className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="countInStock" className="mb-3">
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter count in stock"
                value={countInStock}
                onChange={(e) => setCountInStock(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group controlId="category" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
