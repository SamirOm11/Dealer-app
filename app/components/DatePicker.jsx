import React from "react";
import { DatePicker, Divider } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { CalendarIcon } from "@shopify/polaris-icons";
import { Button, Popover, Card } from "@shopify/polaris";

const DateRangePicker = ({ onSubmit }) => {
  const [{ month, year }, setDate] = useState({ month: 1, year: 2025 });
  const [popoverActive, setPopoverActive] = useState(false);
  const [showDateRangePickerModal, setShowDateRangePickerModal] =
    useState(false);
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date(),
  });
  const formattedStartDate = selectedDates.start
    ? selectedDates.start.toISOString().split("T")[0]
    : null;

  const formattedEndDate = selectedDates.end
    ? selectedDates.end.toISOString().split("T")[0]
    : null;
  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    [],
  );

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );
  const activator = (
    <Button onClick={togglePopoverActive} icon={CalendarIcon}></Button>
  );

  const handlePopoverClose = () => {
    setShowDateRangePickerModal(false);
  };

  const handleSubmit = async () => {
    setPopoverActive(false);
    onSubmit({ formattedStartDate, formattedEndDate });
  };

  return (
    <>
      <div style={{ height: "50px", minWidth: "600px", width: "600px" }}>
        <Popover
          active={popoverActive}
          preferredAlignment="left"
          activator={activator}
          fluidContent={true}
          // autofocusTarget="first-node"
          onClose={togglePopoverActive}
        >
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  maxWidth: "500px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <DatePicker
                  month={month}
                  year={year}
                  onChange={setSelectedDates}
                  onMonthChange={handleMonthChange}
                  selected={selectedDates}
                  multiMonth
                  allowRange
                />
              </div>
            </div>
            <Divider />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
                gap: "1rem",
                marginTop: "0.8rem",
              }}
            >
              <Button>Cancel</Button>
              <Button
                // disabled={disabled}
                onClick={handleSubmit}
                variant="primary"
              >
                Apply
              </Button>
            </div>
          </Card>
        </Popover>
      </div>
    </>
  );
};

export default DateRangePicker;
