"use client"
import { useState, ChangeEvent, FormEvent } from "react";

const SignUp = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccess("Account created successfully!");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="signup-container flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>
      {error && (
        <p className="text-red-500 font-bold text-center mb-4">{error}</p>
      )}
      {success && (
        <p className="text-green-500 font-bold text-center mb-4">{success}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;