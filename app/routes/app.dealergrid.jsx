import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Page,
  Badge,
} from "@shopify/polaris";
import React, { useState, useEffect } from "react";

const DealerGrid = () => {
  const [wishlistProduct, setWishlistProduct] = useState([]);
  console.log("wishlistProduct", wishlistProduct);
  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const fetchWishlistData = async () => {
    try {
      const response = await fetch("/api/admindealermanagementgrid");
      const result = await response.json();
      console.log("result", result?.DealerDeatails);
      if (Array.isArray(result?.DealerDeatails)) {
        setWishlistProduct(result?.DealerDeatails);
      } else {
        console.error("Fetched result is not an array", result?.wishlistData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  // Managing selected resources
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(wishlistProduct);

  // Safely mapping over wishlistProduct if it's an array
  const rowMarkup = Array.isArray(wishlistProduct)
    ? wishlistProduct.map(
        (
          {
            _id,
            orderName,
            // location,
            dealerEmail,
            // phone,
            pinCode,
            // totalOrders,
            totalValue,
            productTitle,
          },
          index,
        ) => (
          <IndexTable.Row
            id={_id}
            key={_id}
            selected={selectedResources.includes(_id)}
            position={index}
          >
            <IndexTable.Cell>
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {orderName
                }
              </Text>
            </IndexTable.Cell>
            {/* <IndexTable.Cell>{location}</IndexTable.Cell> */}
            <IndexTable.Cell>{dealerEmail}</IndexTable.Cell>
            {/* <IndexTable.Cell>{phone}</IndexTable.Cell> */}
            <IndexTable.Cell>{pinCode}</IndexTable.Cell>
            {/* <IndexTable.Cell>{totalOrders}</IndexTable.Cell> */}
            <IndexTable.Cell>{totalValue}</IndexTable.Cell>
            <IndexTable.Cell>{productTitle}</IndexTable.Cell>
          </IndexTable.Row>
        ),
      )
    : null;

  return (
    <Page title="Wishlist Table">
      <LegacyCard>
        <IndexTable
          resourceName={resourceName}
          itemCount={wishlistProduct.length} // Use the actual length of the wishlist
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "orderName" },
            // { title: "Location" },
            { title: "Email" },
            // { title: "Phone" },
            { title: "Pincode" },
            { title: "Orders" },
            { title: "Order Id" },
            { title: "Product Title" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </Page>
  );
};

export default DealerGrid;
