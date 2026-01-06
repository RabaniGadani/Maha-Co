"use client";

import React, { useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

export default function ProductAndRateLists() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, "id" | "totalBuy" | "totalSell" | "totalProfit" | "created_at">>({
    name: "",
    buyPrice: 0,
    sellPrice: 0,
    quantity: 1,
    date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterCreatedAt, setFilterCreatedAt] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  React.useEffect(() => {
    if (form.date && form.date !== filterCreatedAt) {
      setFilterCreatedAt(form.date);
    }
  }, [form.date]);

  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
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

        if (!ignore) {
          if (fetchError) {
            setError("An unexpected error occurred. Please try again.");
            toast.error("An unexpected error occurred. Please try again.");
          }
          if (data) {
            const mapped: Product[] = data.map((row: any) => ({
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
            }));
            setProducts(mapped);
          }
        }
      } catch (err: any) {
        if (!ignore) {
          setError("An unexpected error occurred. Please try again.");
          toast.error("An unexpected error occurred. Please try again.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      ignore = true;
    };
  }, [filterCreatedAt]);

  const displayedProducts = products;

  const totalQuantity = displayedProducts.reduce((acc, p) => acc + (isFinite(p.quantity) ? p.quantity : 0), 0);
  const totalBuy = displayedProducts.reduce((acc, p) => acc + (isFinite(p.totalBuy) ? p.totalBuy : 0), 0);
  const totalSell = displayedProducts.reduce((acc, p) => acc + (isFinite(p.totalSell) ? p.totalSell : 0), 0);
  const totalProfit = displayedProducts.reduce((acc, p) => acc + (isFinite(p.totalProfit) ? p.totalProfit : 0), 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      form.name.trim() === "" ||
      typeof form.buyPrice !== "number" || isNaN(form.buyPrice) ||
      typeof form.sellPrice !== "number" || isNaN(form.sellPrice) ||
      typeof form.quantity !== "number" || isNaN(form.quantity) ||
      form.quantity < 1 ||
      form.date.trim() === ""
    ) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
      return;
    }

    setLoading(true);

    const calculatedTotalBuy = form.buyPrice * form.quantity;
    const calculatedTotalSell = form.sellPrice * form.quantity;
    const calculatedTotalProfit = (form.sellPrice - form.buyPrice) * form.quantity;

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
          }
        ])
        .select()
        .single();

      if (supabaseError) {
        setError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
        setLoading(false);
        return;
      }

      if (data) {
        setProducts((prev) => [
          {
            id: data.id ? String(data.id) : Date.now().toString() + "_" + Math.random(),
            name: data.name ?? "",
            buyPrice: Number(data.buyPrice) || 0,
            sellPrice: Number(data.sellPrice) || 0,
            quantity: Number(data.quantity) || 0,
            date: data.date ? String(data.date) : "",
            totalBuy: Number(data.totalBuy) || 0,
            totalSell: Number(data.totalSell) || 0,
            totalProfit: Number(data.totalProfit) || 0,
            created_at: data.created_at ? String(data.created_at) : undefined,
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
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilterCreatedAtChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilterCreatedAt(e.target.value);
    setForm(prev => ({
      ...prev,
      date: e.target.value,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col p-2 sm:p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark" />

      {/* Header */}
      <header className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
          <span className="text-3xl font-bold text-white">M</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-400">
          Manage your product rates with ease
        </p>
      </header>

      <section className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
        {/* Table */}
        <div className="w-full lg:w-7/12 bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-6 overflow-x-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-xl font-bold text-white">
              Sales Sheet
            </h3>
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
                  <th className="px-4 py-3 text-left font-semibold text-emerald-400 rounded-l-lg">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-400">Product</th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">Buy</th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">Sell</th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">T.Buy</th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400">T.Sell</th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-400 rounded-r-lg">Profit</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-500 py-12">
                      {loading ? "Loading..." : "No rates available yet."}
                    </td>
                  </tr>
                ) : (
                  <>
                    {displayedProducts.map((p) => (
                      <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="px-4 py-3 text-slate-300">{p.created_at ? p.created_at.split("T")[0] : ""}</td>
                        <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{p.buyPrice}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{p.sellPrice}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{p.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{p.totalBuy}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{p.totalSell}</td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{p.totalProfit}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-500/10">
                      <td colSpan={4} className="px-4 py-3 text-right text-white font-bold rounded-l-lg">Totals:</td>
                      <td className="px-4 py-3 text-right text-white font-bold">{totalQuantity}</td>
                      <td className="px-4 py-3 text-right text-white font-bold">{totalBuy}</td>
                      <td className="px-4 py-3 text-right text-white font-bold">{totalSell}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-bold rounded-r-lg">{totalProfit}</td>
                    </tr>
                  </>
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
              <p className="text-white text-xl font-bold">{totalQuantity}</p>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center mt-4">{error}</div>
          )}
        </div>

        {/* Form */}
        <div className="w-full lg:w-5/12 bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Add Product
          </h2>
          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="date">
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
              <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="product-name">
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
                <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="buy-price">
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
                <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="sell-price">
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
              <label className="block text-sm font-medium mb-2 text-slate-300" htmlFor="quantity">
                Quantity/KG
              </label>
              <input
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="1"
                step="1"
              />
            </div>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            <button
              className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
