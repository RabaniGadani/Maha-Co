
"use client";

import React, { useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Supabase constants from env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing.");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

type Product = {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  date: string;
  totalBuy: number;
  totalSell: number;
  totalProfit: number;
  created_at?: string;

};

interface DeleteDialogState {
  productId: string | null;
  productName: string | null;
  open: boolean;
}

// The Delete Product Modal remains unchanged
function DeleteProductModal({
  open,
  productName,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  productName: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-xs w-full shadow-xl">
        <div className="mb-4 flex flex-col items-center text-center">
          <span className="text-3xl text-red-500 mb-2">⚠️</span>
          <h2 className="text-lg font-bold text-white mb-2">Delete Product</h2>
          <p className="text-slate-400 text-sm mb-0">
            Are you sure you want to delete <span className="font-semibold text-red-300">{productName || "this product"}</span>?
            <br />
            This action cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            className="w-1/2 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
          <button
            className="w-1/2 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function isBalanceProductRow(p: Product) {
  return !!(p.is_balance_row || p.name === "BALANCE" || p.name === "Balance" || p.name === "Daily Balance" || (typeof p.name === "string" && p.name.endsWith(" Balance")));
}

function isOpeningRow(p: Product) {
  return p.type === "opening";
}

// ------ LPG/PKR Bidirectional Conversion Calculator ---------
interface LpgConversionCalcState {
  sellPrice: number | "";
  amountPkr: number | "";
  quantityKg: number | "";
  mode: "pkrToKg" | "kgToPkr";
  result: string;
}

// Accept title as a prop for SSR hydration match
function LpgPkrConversionCalculator({ title = "Qty/Rate Conversion Calculator" }: { title?: string }) {
  // Main state for calculator
  const [state, setState] = React.useState<LpgConversionCalcState>({
    sellPrice: "",
    amountPkr: "",
    quantityKg: "",
    mode: "pkrToKg",
    result: "-",
  });

  // Handle input changes in fields
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    const parsedValue = value === "" ? "" : type === "number" ? Number(value) : value;
    setState(prev => ({
      ...prev,
      [name]: parsedValue,
      result: "-",
    }));
  }

  // Handle mode radio change
  function handleModeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newMode = e.target.value as "pkrToKg" | "kgToPkr";
    setState(prev => ({
      ...prev,
      mode: newMode,
      // Reset the unrelated field on toggle for a clearer UI
      amountPkr: newMode === "pkrToKg" ? prev.amountPkr : "",
      quantityKg: newMode === "kgToPkr" ? prev.quantityKg : "",
      result: "-",
    }));
  }

  // Perform calculation
  function handleCalculate() {
    const sellPrice = Number(state.sellPrice);
    if (state.mode === "pkrToKg") {
      // Given amount in PKR, calculate how many KG or grams will be given
      const amount = Number(state.amountPkr);
      if (sellPrice > 0 && amount > 0) {
        const qtyKg = amount / sellPrice;
        if (qtyKg >= 1) {
          setState(prev => ({ ...prev, result: qtyKg.toFixed(3) + " KG" }));
        } else {
          setState(prev => ({ ...prev, result: Math.round(qtyKg * 1000) + " grams" }));
        }
      } else {
        setState(prev => ({ ...prev, result: "-" }));
      }
    } else {
      // Given quantity in KG, calculate total PKR needed
      const qty = Number(state.quantityKg);
      if (sellPrice > 0 && qty > 0) {
        const pkr = qty * sellPrice;
        setState(prev => ({ ...prev, result: pkr.toFixed(2) + " PKR" }));
      } else {
        setState(prev => ({ ...prev, result: "-" }));
      }
    }
  }

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCalculate();
    }
  }

  function getModeLabel() {
    return state.mode === "pkrToKg"
      ? "How much LPG (in KG or grams) will you give a client for a selected PKR amount?"
      : "How much PKR is needed to buy a given KG?";
  }

  function getInputGroup() {
    if (state.mode === "pkrToKg") {
      // PKR to KG/grams
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="c-sellPrice">
              Sell Price per KG (PKR)
            </label>
            <input
              className="w-full bg-slate-700 border border-sky-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none"
              id="c-sellPrice"
              name="sellPrice"
              type="number"
              min={0.01}
              step="any"
              value={state.sellPrice}
              onChange={handleChange}
              placeholder="e.g. 300"
              onKeyDown={handleEnter}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="c-amountPkr">
              Amount (PKR)
            </label>
            <input
              className="w-full bg-slate-700 border border-sky-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none"
              id="c-amountPkr"
              name="amountPkr"
              type="number"
              min={0.01}
              value={state.amountPkr}
              onChange={handleChange}
              placeholder="e.g. 100"
              onKeyDown={handleEnter}
              required
            />
          </div>
        </>
      );
    } else {
      // KG to PKR
      return (
        <>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="c-sellPrice">
              Sell Price per KG (PKR)
            </label>
            <input
              className="w-full bg-slate-700 border border-sky-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none"
              id="c-sellPrice"
              name="sellPrice"
              type="number"
              min={0.01}
              step="any"
              value={state.sellPrice}
              onChange={handleChange}
              placeholder="e.g. 300"
              onKeyDown={handleEnter}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="c-quantityKg">
              Quantity (KG)
            </label>
            <input
              className="w-full bg-slate-700 border border-sky-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none"
              id="c-quantityKg"
              name="quantityKg"
              type="number"
              min={0.001}
              step="any"
              value={state.quantityKg}
              onChange={handleChange}
              placeholder="e.g. 1.5"
              onKeyDown={handleEnter}
              required
            />
          </div>
        </>
      );
    }
  }

  return (
    <div className="mb-8 bg-sky-800/20 rounded-xl p-4 border border-sky-600">
      <h3 className="text-lg font-semibold text-sky-300 mb-2 flex items-center gap-2">
        {title}
        <span className="text-sky-400 text-base" title="Calculate LPG quantity for amount or Price for quantity">🔢</span>
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center text-sky-200 gap-2">
          <input
            type="radio"
            name="mode"
            value="pkrToKg"
            checked={state.mode === "pkrToKg"}
            onChange={handleModeChange}
            className="form-radio accent-sky-400"
          />
          PKR → LPG (How much KG/grams for PKR)
        </label>
        <label className="flex items-center text-sky-200 gap-2">
          <input
            type="radio"
            name="mode"
            value="kgToPkr"
            checked={state.mode === "kgToPkr"}
            onChange={handleModeChange}
            className="form-radio accent-sky-400"
          />
          LPG → PKR (How much PKR for KG)
        </label>
      </div>
      <div className="mb-2 text-slate-400 text-xs">{getModeLabel()}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {getInputGroup()}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded transition disabled:opacity-60"
          onClick={handleCalculate}
          type="button"
        >
          Calculate
        </button>
        <div className="flex-1 text-center">
          <span className="block text-sm text-slate-400 mb-1 font-semibold">Result</span>
          <div className="w-full px-3 py-2 bg-slate-800 rounded font-mono text-2xl text-sky-300">
            {state.result}
          </div>
        </div>
      </div>
      {state.mode === "pkrToKg" && (
        <div className="mt-2 text-xs text-sky-400 italic">
          Example: If you sell 1 KG LPG on 300 PKR, a client pays 100 PKR. Enter 300 as Sell Price and 100 as Amount. You'll see the quantity eligible (in KG or grams).
        </div>
      )}
    </div>
  );
}
// ------ END LPG/PKR Conversion Calculator --------

export default function ProductAndRateLists() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, "id" | "totalBuy" | "totalSell" | "totalProfit" | "created_at" | "opening_balance" | "today_purchases" | "today_sales" | "closing_balance" | "is_balance_row" | "type">>({
    name: "",
    buyPrice: 0,
    sellPrice: 0,
    quantity: 1,
    date: "",
  });

  // Sale Form states only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Modal state for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    productId: null,
    productName: null,
    open: false,
  });

  const [filterCreatedAt, setFilterCreatedAt] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  React.useEffect(() => {
    if (form.date && form.date !== filterCreatedAt) {
      setFilterCreatedAt(form.date);
    }
  }, [form.date]);

  // Helper: Get all product rows for a date, grouped by product
  function groupProductsByNameRows(rows: Product[]) {
    const map: { [key: string]: Product[] } = {};
    for (const row of rows) {
      if (!isBalanceProductRow(row)) {
        if (!map[row.name]) map[row.name] = [];
        map[row.name].push(row);
      }
    }
    return map;
  }

  useEffect(() => {
    let ignore = false;
    async function loadProductsAndBalances() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from("Products").select("*");
        if (filterCreatedAt) {
          const start = filterCreatedAt + "T00:00:00.000Z";
          const endDate = new Date(filterCreatedAt);
          endDate.setUTCHours(23, 59, 59, 999);
          const end = endDate.toISOString();
          query = query.gte("created_at", start).lte("created_at", end);
        }
        const { data, error: fetchError } = await query.order("created_at", { ascending: false });

        if (fetchError) {
          setError("Error loading products: " + fetchError.message);
          toast.error("Error loading products: " + fetchError.message);
        }

        // Build map of just product sale and opening rows
        const productRows: Product[] = (data || []).map((row: any) => {
          let type: "sale" | "opening" = "sale";
          if (
            row.type === "opening" ||
            (
              row.sellPrice === 0 &&
              row.buyPrice === 0 &&
              (row.opening_balance !== undefined && row.opening_balance !== null)
            )
          ) {
            type = "opening";
          }
          return {
            id: row.id ? String(row.id) : Date.now().toString() + "_" + Math.random(),
            name: row.name ?? "",
            buyPrice: Number(row.buyPrice) || 0,
            sellPrice: Number(row.sellPrice) || 0,
            quantity: Number(row.quantity) || 0,
            date: row.date ? String(row.date) : "",
            totalBuy: Number(row.totalBuy) || 0,
            totalSell: Number(row.totalSell) || 0,
            totalProfit: Number(row.totalProfit) || 0,
            created_at: row.created_at ? String(row.created_at) : undefined,
            opening_balance: row.opening_balance !== null ? Number(row.opening_balance) : undefined,
            today_purchases: Number(row.today_purchases) || 0,
            today_sales: Number(row.today_sales) || 0,
            closing_balance: Number(row.closing_balance) || 0,
            is_balance_row: !!row.is_balance_row,
            type,
          }
        });

        // Group by product name (exclude balance rows)
        const productMap = groupProductsByNameRows(productRows);

        let allRows: Product[] = [];

        const allProductNames = Object.keys(productMap);

        for (const prodName of allProductNames) {
          const productSales = productMap[prodName] || [];
          // Calculate Buy/Sell/Qty for sales of this day
          const todaysProductRows = productSales.filter(r => r.date === filterCreatedAt && r.type !== "opening");
          // Show actual product rows (opening + sales)
          allRows = allRows.concat(todaysProductRows);
          // Show the opening row as an opening row at the top (virtual, for display)
          const openingRowsOnThisDay = productSales.filter((r) => r.type === "opening" && r.date === filterCreatedAt);
          allRows = allRows.concat(openingRowsOnThisDay);
        }

        setProducts(allRows);
      } catch (err: any) {
        setError("Error loading products.");
        toast.error("Error loading products.");
      } finally {
        setLoading(false);
      }
    }
    loadProductsAndBalances();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line
  }, [filterCreatedAt]); // removed openingForm/openingLoading/balancestates for cleanup

  // Only show sales for summary
  const displayedProducts = products.filter((p) => !isBalanceProductRow(p) && p.type !== "opening");

  const totalQuantity = displayedProducts.reduce((acc, p) => acc + (isFinite(p.quantity) ? p.quantity : 0), 0);
  const totalBuy = displayedProducts.reduce((acc, p) => acc + (isFinite(p.totalBuy) ? p.totalBuy : 0), 0);
  const totalSell = displayedProducts.reduce((acc, p) => acc + (isFinite(p.totalSell) ? p.totalSell : 0), 0);
  const totalProfit = displayedProducts.reduce((acc, p) => acc + (isFinite(p.totalProfit) ? p.totalProfit : 0), 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? value === ""
            ? ""
            : parseFloat(value)
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  }

  function handleFilterCreatedAtChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilterCreatedAt(e.target.value);
    setForm((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      form.name.trim() === "" ||
      typeof form.buyPrice !== "number" ||
      isNaN(form.buyPrice) ||
      typeof form.sellPrice !== "number" ||
      isNaN(form.sellPrice) ||
      typeof form.quantity !== "number" ||
      isNaN(form.quantity) ||
      form.quantity <= 0 ||
      form.date.trim() === ""
    ) {
      setError("Please fill in all fields correctly.");
      toast.error("Please fill in all fields correctly.");
      return;
    }

    setLoading(true);

    const calculatedTotalBuy = form.buyPrice * form.quantity;
    const calculatedTotalSell = form.sellPrice * form.quantity;
    const calculatedTotalProfit =
      (form.sellPrice - form.buyPrice) * form.quantity;

    try {
      const { data, error: supabaseError } = await supabase
        .from("Products")
        .insert([
          {
            name: form.name,
            buyPrice: form.buyPrice,
            sellPrice: form.sellPrice,
            quantity: form.quantity,
            date: form.date,
            totalBuy: calculatedTotalBuy,
            totalSell: calculatedTotalSell,
            totalProfit: calculatedTotalProfit,
         
          },
        ])
        .select()
        .single();

      if (supabaseError) {
        setError("Error adding product rate: " + supabaseError.message);
        toast.error("Error adding product rate: " + supabaseError.message);
        setLoading(false);
        return;
      }

      if (data) {
        setProducts((prev) => [
          {
            id: data.id
              ? String(data.id)
              : Date.now().toString() + "_" + Math.random(),
            name: data.name ?? "",
            buyPrice: Number(data.buyPrice) || 0,
            sellPrice: Number(data.sellPrice) || 0,
            quantity: Number(data.quantity) || 0,
            date: data.date ? String(data.date) : "",
            totalBuy: Number(data.totalBuy) || 0,
            totalSell: Number(data.totalSell) || 0,
            totalProfit: Number(data.totalProfit) || 0,
            created_at: data.created_at ? String(data.created_at) : undefined,
            type: "sale",
          },
          ...prev,
        ]);
        toast.success("Product rate added successfully!");
      }

      setForm({
        name: "",
        buyPrice: 0,
        sellPrice: 0,
        quantity: 1,
        date: "",
      });
    } catch (err: any) {
      setError("Error adding product rate.");
      toast.error("Error adding product rate.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteDialog.productId) return;
    setDeleting(deleteDialog.productId);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("Products")
        .delete()
        .eq("id", deleteDialog.productId);

      if (deleteError) {
        setError("Error deleting product: " + deleteError.message);
        toast.error("Error deleting product: " + deleteError.message);
      } else {
        setProducts((prev) =>
          prev.filter((p) => p.id !== deleteDialog.productId)
        );
        toast.success("Product deleted successfully.");
      }
      closeDeleteDialog();
    } catch (err: any) {
      setError("Error deleting product.");
      toast.error("Error deleting product.");
      closeDeleteDialog();
    } finally {
      setDeleting(null);
    }
  }

  function openDeleteDialog(productId: string, productName: string) {
    setDeleteDialog({
      productId,
      productName,
      open: true,
    });
  }

  function closeDeleteDialog() {
    setDeleteDialog({
      productId: null,
      productName: null,
      open: false,
    });
  }

  // For dropdown
  const productList = Array.from(
    new Set(
      products
        .filter((p) => !isBalanceProductRow(p))
        .map((p) => p.name)
        .filter(Boolean)
    )
  );

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col p-2 sm:p-4 md:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Delete Product Modal */}
      <DeleteProductModal
        open={deleteDialog.open}
        productName={deleteDialog.productName}
        onCancel={closeDeleteDialog}
        onConfirm={handleDeleteConfirmed}
        loading={deleting === deleteDialog.productId}
      />

      {/* Header */}
      <header className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
          <span className="text-3xl font-bold text-white">M</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-400">Manage your product rates with ease</p>
      </header>

      <section className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
        {/* Table */}
        <div className="w-full lg:w-7/12 bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-6 overflow-x-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-xl font-bold text-white">Sales Sheet</h3>
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-sm">Filter:</label>
              <input
                type="date"
                value={filterCreatedAt}
                onChange={handleFilterCreatedAtChange}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-4 py-3 text-left font-semibold text-emerald-400 rounded-l-lg">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">
                    Buy
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">
                    Sell
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">
                    T.Buy
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">
                    T.Sell
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-emerald-400 rounded-r-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center text-slate-500 py-12"
                    >
                      {loading ? "Loading..." : "No rates available yet."}
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const grouped: { [product: string]: Product[] } = {};
                    products.forEach((prod) => {
                      if (!grouped[prod.name]) grouped[prod.name] = [];
                      grouped[prod.name].push(prod);
                    });

                    let renderedRows: JSX.Element[] = [];
                    let alreadyShown = new Set();

                    // Only sale and opening rows for today
                    const normalProducts = products.filter(
                      (p) =>
                        !isBalanceProductRow(p) &&
                        (p.type === "sale" || p.type === "opening") &&
                        p.date === filterCreatedAt
                    );
                    normalProducts.sort((a, b) => {
                      // Opening rows first
                      if (isOpeningRow(a) && !isOpeningRow(b)) return -1;
                      if (!isOpeningRow(a) && isOpeningRow(b)) return 1;
                      if (a.name < b.name) return -1;
                      if (a.name > b.name) return 1;
                      if ((a.created_at || "") < (b.created_at || "")) return -1;
                      return 0;
                    });

                    for (const p of normalProducts) {
                      let openingIndicator = isOpeningRow(p);
                      renderedRows.push(
                        <tr
                          key={p.id+"_"+(openingIndicator ? "op" : "sale")}
                          className={`${openingIndicator ? "bg-slate-700/20" : "border-b border-slate-700/50 hover:bg-slate-700/30"} transition`}
                        >
                          <td className="px-4 py-3 text-slate-300">
                            {p.created_at ? p.created_at.split("T")[0] : ""}
                          </td>
                          <td className={`px-4 py-3 font-medium ${openingIndicator ? "text-amber-300" : "text-white"}`}>
                            {openingIndicator ? "Opening: " + p.name : p.name}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {p.buyPrice}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {p.sellPrice}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {typeof p.quantity === "number"
                              ? p.quantity.toFixed(2)
                              : p.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {p.totalBuy}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {p.totalSell}
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold ${openingIndicator ? "text-cyan-300" : "text-emerald-400"}`}>
                            {p.totalProfit}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => openDeleteDialog(p.id, p.name)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded transition disabled:opacity-60"
                              disabled={deleting === p.id || loading}
                              title="Delete Product"
                            >
                              {deleting === p.id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    renderedRows.push(
                      <tr className="bg-emerald-500/10" key="totals_row">
                        <td
                          colSpan={4}
                          className="px-4 py-3 text-right text-white font-bold rounded-l-lg"
                        >
                          Totals:
                        </td>
                        <td className="px-4 py-3 text-right text-white font-bold">
                          {typeof totalQuantity === "number"
                            ? totalQuantity.toFixed(2)
                            : totalQuantity}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-bold">
                          {totalBuy}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-bold">
                          {totalSell}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                          {totalProfit}
                        </td>
                        <td className="px-4 py-3" />
                      </tr>
                    );

                    return renderedRows;
                  })()
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">Total Profit</p>
              <p className="text-emerald-400 text-xl font-bold">{totalProfit}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">Total Buy</p>
              <p className="text-white text-xl font-bold">{totalBuy}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">Total Sell</p>
              <p className="text-white text-xl font-bold">{totalSell}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs mb-1">Total Qty/ KG</p>
              <p className="text-white text-xl font-bold">
                {typeof totalQuantity === "number"
                  ? totalQuantity.toFixed(2)
                  : totalQuantity}
              </p>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center mt-4">{error}</div>
          )}
        </div>

        {/* Form */}
        <div className="w-full lg:w-5/12 bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Add Product</h2>
          {/* Only one advanced LPG/PKR Conversion Calculator shown */}
          <LpgPkrConversionCalculator title="Qty/Rate Conversion Calculator" />
          {/* Sale Form */}
          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label
                className="block text-sm font-medium mb-2 text-slate-300"
                htmlFor="date"
              >
                Date
              </label>
              <input
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2 text-slate-300"
                htmlFor="product-name"
              >
                Product Name
              </label>
              <input
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                id="product-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2 text-slate-300"
                  htmlFor="buy-price"
                >
                  Buy Price
                </label>
                <input
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  id="buy-price"
                  name="buyPrice"
                  type="number"
                  min={0}
                  value={form.buyPrice}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  step="any"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2 text-slate-300"
                  htmlFor="sell-price"
                >
                  Sell Price
                </label>
                <input
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  id="sell-price"
                  name="sellPrice"
                  type="number"
                  min={0}
                  value={form.sellPrice}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  step="any"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2 text-slate-300"
                htmlFor="quantity"
              >
                Quantity/KG
              </label>
              <input
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="e."
                step="any"
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            <button
              className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
