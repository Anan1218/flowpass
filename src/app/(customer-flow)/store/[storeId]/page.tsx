"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/utils/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import PaymentForm from "@/components/payment/PaymentForm";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Image from "next/image";

interface StoreData {
  name: string;
  userId: string;
  createdAt: Date;
  active: boolean;
  imageUrl: string;
  price: number;
  maxPasses: number;
  // Add any other fields you need
}

export default function StorefrontPage() {
  const params = useParams();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [availablePasses, setAvailablePasses] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isValidPhone, setIsValidPhone] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Get store data
        const storeQuery = query(
          collection(db, "stores"),
          where("storeId", "==", params.storeId),
          where("active", "==", true)
        );

        const storeSnapshot = await getDocs(storeQuery);

        if (!storeSnapshot.empty) {
          const data = storeSnapshot.docs[0].data();
          setStoreData({
            name: data.name,
            userId: data.userId,
            createdAt: data.createdAt.toDate(),
            active: data.active,
            imageUrl: data.imageUrl,
            price: data.price,
            maxPasses: data.maxPasses,
          });

          // Get today's date at 8 AM
          const now = new Date();
          const today8am = new Date(now);
          today8am.setHours(8, 0, 0, 0);

          // If current time is before 8 AM, use previous day's 8 AM
          if (now < today8am) {
            today8am.setDate(today8am.getDate() - 1);
          }

          // Get passes since last 8 AM
          const passesQuery = query(
            collection(db, "passes"),
            where("storeId", "==", params.storeId),
            where("createdAt", ">=", today8am)
          );

          const passesSnapshot = await getDocs(passesQuery);

          let totalPassesSold = 0;
          passesSnapshot.docs.forEach((doc) => {
            const passData = doc.data();
            const quantity = passData.quantity || 1;
            totalPassesSold += quantity;
          });
          // const totalPassesSold = 5;
          setAvailablePasses(data.maxPasses - totalPassesSold);
        } else {
          setError("Store not found or inactive");
        }
      } catch (err) {
        setError("Error loading store data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.storeId) {
      fetchStoreData();
    }
  }, [params.storeId]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= availablePasses) {
      setQuantity(newQuantity);
    }
  };

  const updateAvailablePasses = async (passId: string) => {
    try {
      // Construct the URL for the order confirmation page
      const passUrl = `${window.location.origin}/order-confirmation/${passId}?quantity=${quantity}`;
      const smsMessage = `Thank you for purchasing ${quantity} pass${
        quantity > 1 ? "es" : ""
      } at ${storeData?.name}. Access your pass here: ${passUrl}`;

      // Send SMS notification
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          message: smsMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send SMS");
      }

      // Update the available passes count
      setAvailablePasses((prev) => prev - quantity);

      // Navigate to the order confirmation page
      window.location.href = `/order-confirmation/${passId}?quantity=${quantity}`;
    } catch (error) {
      console.error("Error sending notification:", error);
      alert(
        "Your payment was successful but we could not send the confirmation SMS. Please save your confirmation URL."
      );
      window.location.href = `/order-confirmation/${passId}?quantity=${quantity}`;
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneNumber(value || "");
    setIsValidPhone(value ? value.length >= 10 : false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!storeData || availablePasses <= 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-700">
          No passes available for today
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 min-h-screen text-white">
      <div className="relative">
        <Image
          src={storeData.imageUrl || "/default-store-image.jpg"}
          alt={storeData.name}
          width={800}
          height={400}
          className="w-full h-64 object-cover brightness-75"
        />
        <div className="absolute bottom-4 left-4">
          <h1 className="text-3xl font-bold text-white">{storeData.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white">${storeData.price}</span>
            <span className="text-gray-300">•</span>
            <span className="text-white">{availablePasses} passes left</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl mb-4">Select Quantity</h3>
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl disabled:opacity-50"
            >
              -
            </button>
            <span className="text-3xl font-bold">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= availablePasses}
              className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-4 mx-4">
        <h3 className="text-xl mb-4">Phone Number</h3>
        <PhoneInput
          international
          defaultCountry="US"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="w-full [&_.PhoneInputInput]:bg-gray-700 [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:p-3 [&_.PhoneInputInput]:rounded-lg"
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <PaymentForm
          storeId={params.storeId as string}
          quantity={quantity}
          price={storeData.price}
          onSuccess={(passId) => updateAvailablePasses(passId)}
          phoneNumber={phoneNumber}
          disabled={!isValidPhone}
        />
      </div>
    </div>
  );
}
