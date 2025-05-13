import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "../styles/DealerGrid.css";
import "react-datepicker/dist/react-datepicker.css";
import FullScreenLoader from "../Components/Fullscreenloader";
import VisibilityIcon from "@mui/icons-material/Visibility";

const columns = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "productTitle", headerName: "Product Title", width: 130 },
  { field: "name", headerName: "Dealer Email", flex: 1 },
  // { field: "location", headerName: "Location", flex: 1 },
  { field: "email", headerName: "Customer Email", flex: 1 },
  { field: "phone", headerName: "Phone", flex: 1 },
  { field: "pincode", headerName: "Pincode", flex: 1 },
  { field: "totalOrders", headerName: "Orders", type: "number", width: 100 },
  {
    field: "totalValue",
    headerName: "Order Id",
    type: "number",
    width: 130,
  },
  { field: "lastOrderDate", headerName: "Last Order Date", flex: 1 },
  { field: "orderStatus", headerName: "Last Order Status", flex: 1 },
];

const paginationModel = { page: 0, pageSize: 5 };
export default function DealerGrid() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [loaderOpen, setLoaderOpen] = useState(false);
  const location = useLocation();
  const email = location.state?.identifier;

  const fetchDataForGrid = async (fromDate, toDate) => {
    setLoaderOpen(true);
    try {
      const formattedFromDate = fromDate
        ? fromDate.toISOString().split("T")[0]
        : null;
      console.log("formattedFromDate", formattedFromDate);
      const formattedToDate = toDate
        ? toDate.toISOString().split("T")[0]
        : null;

      console.log("formattedToDate", formattedToDate);
      let apiUrl = `https://workflow-df-cordless-restaurants.trycloudflare.com/api/getDealerGrid?shop=test-dev911.myshopify.com&email=${email}`;
      if (formattedFromDate && formattedToDate) {
        apiUrl += `&fromDate=${formattedFromDate}&toDate=${formattedToDate}`;
      }
      const response = await fetch(apiUrl);
      // console.log("response", response);
      const result = await response.json();

      console.log("result", result);
      if (result.status === 200) {
        setLoaderOpen(false);
        setGridData(
          result.data[0].orders.map((item, index) => ({
            id: index + 1,
            name: item.dealerEmail || "Unknown",
            // location: "Unknown",
            email: item.customerEmail || "N/A",
            phone: "N/A",
            pincode: item.pinCode || "N/A",
            totalOrders: 1,
            totalValue: item.orderId,
            productTitle: item.productTitle || "N/A",
            lastOrderDate: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "N/A",
            orderStatus: "Pending",
          }))
        );
      } else {
        console.error("Error fetching data:", result.error);
        setGridData([]);
      }
    } catch (error) {
      console.log("Error during fetchDataForGrid", error);
    }
  };

  useEffect(() => {
    fetchDataForGrid();
  }, []);

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <div
        className="date-container"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          gap: "10px",
          padding: "10px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="from-date" style={{ fontWeight: "bold" }}>
            From:
          </label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="yyyy/MM/dd"
            className="form-control"
            id="from-date"
            placeholderText="Select From Date"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label htmlFor="to-date" style={{ fontWeight: "bold" }}>
            To:
          </label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="yyyy/MM/dd"
            className="form-control"
            id="to-date"
            placeholderText="Select To Date"
          />
        </div>
        <button
          onClick={() => fetchDataForGrid(fromDate, toDate)}
          className="select-button"
          style={{
            backgroundColor: "#3a61d4",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Go
        </button>
      </div>
      <DataGrid
        rows={gridData}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        disableColumnFilter
        icon={
          <VisibilityIcon
            style={{
              color: "#3a61d4",
              fontSize: "20px",
            }}
          />
        }
        disableColumnMenu
        disableDensitySelector
        disableColumnSelector
        slots={{ toolbar: null }}
        sx={{ border: 0 }}
      />
      <FullScreenLoader open={loaderOpen} setOpen={setLoaderOpen} />
    </Paper>
  );
}
