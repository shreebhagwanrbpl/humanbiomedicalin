import ProductsList from "@/app/sections/products/ProductsList";

export default function ProductsPage({ params }) {

  const district =
    params?.district || "";

  return (
    <ProductsList city={district} />
  );
}