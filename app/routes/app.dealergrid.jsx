import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  IndexFilters,
  useSetIndexFiltersMode,
  RangeSlider,
  ChoiceList,
  Page,
  TextField,
  Badge,
} from "@shopify/polaris";
import React, { useState, useEffect, useCallback } from "react";
import DateRangePicker from "../components/DatePicker";

const DealerGrid = async () => {
  const [dealerData, setDealersData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [queryValue, setQueryValue] = useState("");
  console.log("queryValue", queryValue);
  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const [selected, setSelected] = useState(0);
  console.log("selectedDate", selectedDate);
  const resourceName = {
    singular: "product",
    plural: "products",
  };
  const [taggedWith, setTaggedWith] = useState("");
  const [accountStatus, setAccountStatus] = useState(undefined);
  const [moneySpent, setMoneySpent] = useState(undefined);
  const [itemStrings, setItemStrings] = useState([
    // "All",
    // "Unpaid",
    // "Open",
    // "Closed",
    // "Local delivery",
    // "Local pickup",
  ]);
  const handleMoneySpentChange = useCallback(
    (value) => setMoneySpent(value),
    [],
  );
  const handleAccountStatusChange = useCallback(
    (value) => setAccountStatus(value),
    [],
  );
  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    [],
  );
  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    [],
  );
  const { mode, setMode } = useSetIndexFiltersMode();
  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    [],
  );
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const appliedFilters = [];
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);
  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              type: "rename",
              onAction: () => {},
              onPrimaryAction: async (value) => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                await sleep(1);
                setItemStrings(newItemsStrings);
                return true;
              },
            },
            {
              type: "duplicate",
              onPrimaryAction: async (value) => {
                await sleep(1);
                duplicateView(value);
                return true;
              },
            },
            {
              type: "edit",
            },
            {
              type: "delete",
              onPrimaryAction: async () => {
                await sleep(1);
                deleteView(index);
                return true;
              },
            },
          ],
  }));
  const onCreateNewView = async (value) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };
  const filters = [
    {
      key: "accountStatus",
      label: "Account status",
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: "Enabled", value: "enabled" },
            { label: "Not invited", value: "not invited" },
            { label: "Invited", value: "invited" },
            { label: "Declined", value: "declined" },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "moneySpent",
      label: "Money spent",
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];

  const sortOptions = [
    { label: "Order", value: "order asc", directionLabel: "Ascending" },
    { label: "Order", value: "order desc", directionLabel: "Descending" },
    { label: "Customer", value: "customer asc", directionLabel: "A-Z" },
    { label: "Customer", value: "customer desc", directionLabel: "Z-A" },
    { label: "Date", value: "date asc", directionLabel: "A-Z" },
    { label: "Date", value: "date desc", directionLabel: "Z-A" },
    { label: "Total", value: "total asc", directionLabel: "Ascending" },
    { label: "Total", value: "total desc", directionLabel: "Descending" },
  ];

  const onHandleCancel = () => {};
  const handleSelectDate = (selectedDates) => {
    setSelectedDate(selectedDates);
  };
  const fetchData = async () => {
    try {
      let apiUrl = `/api/admindealermanagementgrid?`;

      if (selectedDate.formattedStartDate && selectedDate.formattedEndDate) {
        apiUrl += `&fromDate=${selectedDate.formattedStartDate}&toDate=${selectedDate.formattedEndDate}`;
      }
      if (queryValue) {
        apiUrl += `&queryValue=${queryValue}`;
      }

      const response = await fetch(apiUrl);

      const result = await response.json();

      if (Array.isArray(result?.DealerDeatails)) {
        setDealersData(result?.DealerDeatails);
      } else {
        console.error("Fetched result is not an array", result?.DealerDeatails);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, queryValue]);

  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value, console.log("value", value)),

    [],
  );
  console.log("handleFiltersQueryChange", handleFiltersQueryChange);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(dealerData);

  const rowMarkup = Array.isArray(dealerData)
    ? dealerData.map(
        (
          {
            _id,
            orderName,
            // location,
            dealerEmail,
            // phone,
            pinCode,
            customerEmail,
            // totalOrders,
            // totalValue,
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
                {orderName}
              </Text>
            </IndexTable.Cell>
            {/* <IndexTable.Cell>{location}</IndexTable.Cell> */}
            <IndexTable.Cell>{dealerEmail}</IndexTable.Cell>
            {/* <IndexTable.Cell>{phone}</IndexTable.Cell> */}
            <IndexTable.Cell>{pinCode}</IndexTable.Cell>
            {/* <IndexTable.Cell>{totalOrders}</IndexTable.Cell> */}
            {/* <IndexTable.Cell>{totalValue}</IndexTable.Cell> */}
            <IndexTable.Cell>{customerEmail}</IndexTable.Cell>
            <IndexTable.Cell>{productTitle}</IndexTable.Cell>
          </IndexTable.Row>
        ),
      )
    : null;


  return (
    <Page title="Dealer Management Table">
      <DateRangePicker onSubmit={handleSelectDate} />
      <LegacyCard>
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Searching in all"
          onQueryChange={handleFiltersQueryChange}
          onQueryClear={() => setQueryValue("")}
          onSort={setSortSelected}
          // primaryAction={primaryAction}
          cancelAction={{
            onAction: onHandleCancel,
            disabled: false,
            loading: false,
          }}
          tabs={tabs}
          selected={selected}
          onSelect={setSelected}
          canCreateNewView
          onCreateNewView={onCreateNewView}
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleFiltersClearAll}
          mode={mode}
          setMode={setMode}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={dealerData.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "orderName" },
            // { title: "Location" },
            { title: "Dealer Email" },
            // { title: "Phone" },
            { title: "Pincode" },
            { title: "Customer Email" },
            // { title: "Orders" },
            // { title: "Order Id" },
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
