"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface UserAuthProps {
  onUserAuthenticated: (uniqueId: string, hasDraft?: boolean, draftData?: any) => void;
}

export default function UserAuth({ onUserAuthenticated }: UserAuthProps) {
  const [authStep, setAuthStep] = useState<"initial" | "newUser" | "existingUser">("initial");
  const [formData, setFormData] = useState({ name: "", dateOfBirth: "" });
  const [uniqueId, setUniqueId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUniqueId, setShowUniqueId] = useState(false);

  // Handle new user registration
  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create user');

      const userSession = await response.json();
      setUniqueId(userSession.uniqueId);
      setShowUniqueId(true);
      
      toast.success("User registered successfully!");
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle existing user validation
  // In the handleExistingUserSubmit function, add better error handling:

const handleExistingUserSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic validation
  if (!uniqueId.trim()) {
    toast.error("Please enter your Unique ID");
    return;
  }

  setIsLoading(true);

  try {
    console.log("🔍 Validating user with ID:", uniqueId);
    
    const response = await fetch(`/api/user-session?uniqueId=${encodeURIComponent(uniqueId)}`);
    
    console.log("📡 Response status:", response.status);
    
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, get text
        const text = await response.text();
        errorData = { message: text || `HTTP ${response.status}` };
      }

      if (response.status === 404) {
        toast.error("Invalid Unique ID. Please check and try again.");
        return;
      } else if (response.status === 400) {
        toast.error("Unique ID is required.");
        return;
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const userSession = await response.json();
    console.log("✅ User session validated:", userSession);
    
    // Check if we have any draft data
    const hasDraft = userSession.intakes && userSession.intakes.length > 0;
    const draftData = hasDraft ? userSession.intakes[0] : null;

    console.log("📄 Draft data found:", hasDraft, draftData);

    if (hasDraft) {
      toast.success("Draft found! Loading your saved data...");
    } else {
      toast.success("User validated! Starting fresh form.");
    }
    
    onUserAuthenticated(uniqueId, hasDraft, draftData);
    
  } catch (error: any) {
    console.error('❌ Error validating user:', error);
    
    // More specific error messages
    if (error.message.includes('Failed to fetch')) {
      toast.error("Network error. Please check your connection and try again.");
    } else if (error.message.includes('Server error')) {
      toast.error("Server error. Please try again later.");
    } else {
      toast.error("Failed to validate user. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleProceedToForm = () => {
    onUserAuthenticated(uniqueId, false);
  };

  if (authStep === "initial") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Legasys
            </h1>
            <p className="text-gray-600">
              Please choose an option to continue
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setAuthStep("newUser")}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-200 shadow-md"
            >
              New User
            </button>
            
            <button
              onClick={() => setAuthStep("existingUser")}
              className="w-full border-2 border-indigo-600 text-indigo-600 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition duration-200"
            >
              Existing User
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (authStep === "newUser" && !showUniqueId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              New User Registration
            </h2>
            <p className="text-gray-600">
              Please provide your basic information
            </p>
          </div>

          <form onSubmit={handleNewUserSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setAuthStep("initial")}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Register"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  if (authStep === "newUser" && showUniqueId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Please save your Unique ID for future reference
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 mb-2 font-semibold">
              Your Unique ID:
            </p>
            <p className="text-2xl font-bold text-center text-gray-800 bg-yellow-100 py-3 px-4 rounded border-2 border-yellow-300">
              {uniqueId}
            </p>
            <p className="text-xs text-yellow-600 mt-2 text-center">
              ⚠️ Please remember this ID to access your drafts later
            </p>
          </div>

          <button
            onClick={handleProceedToForm}
            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
          >
            Proceed to Intake Form
          </button>
        </motion.div>
      </div>
    );
  }

  if (authStep === "existingUser") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Existing User
            </h2>
            <p className="text-gray-600">
              Enter your Unique ID to continue
            </p>
          </div>

          <form onSubmit={handleExistingUserSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique ID *
              </label>
              <input
                type="text"
                required
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                placeholder="Enter your Unique ID"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setAuthStep("initial")}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isLoading ? "Validating..." : "Continue"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return null;
}