import ProductsList from "@/app/sections/items/ProductsList";

export default function ProductsPage({ params }) {

  const district =
    params?.district || "";

  return (
    <ProductsList city={district} />
  );
}