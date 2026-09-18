import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkout, initiatePayment, verifyPayment } from "@/lib/orders";

export default function Checkout() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState("confirm"); // confirm -> phone -> otp -> success
  const [order, setOrder] = useState(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateOrder() {
    setLoading(true);
    setError("");
    try {
      const data = await checkout(vendorId);
      setOrder(data);
      setStep("phone");
    } catch (err) {
      setError(err.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    setLoading(true);
    setError("");
    try {
      const data = await initiatePayment(order.id, phone);
      setDevOtp(data.otp_for_testing); // remove this in a "real" version, shown here for demo/testing
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setLoading(true);
    setError("");
    try {
      await verifyPayment(order.id, otp);
      setStep("success");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-20">
      <div className="bg-card border border-border rounded-2xl p-6">
        {step === "confirm" && (
          <>
            <h1 className="font-heading text-lg font-semibold mb-4">
              Confirm order
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              This will convert your cart with this vendor into an order.
            </p>
            <Button
              className="w-full active:scale-95 transition"
              onClick={handleCreateOrder}
              disabled={loading}
            >
              {loading ? "Placing order..." : "Place order"}
            </Button>
          </>
        )}

        {step === "phone" && (
          <>
            <h1 className="font-heading text-lg font-semibold mb-1">
              Pay Rs. {order.total}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your phone number to receive an OTP.
            </p>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="mb-4"
            />
            <Button
              className="w-full active:scale-95 transition"
              onClick={handleSendOtp}
              disabled={loading || !phone}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="font-heading text-lg font-semibold mb-1">
              Enter OTP
            </h1>
            <p className="text-sm text-muted-foreground mb-1">
              A 6-digit code was sent to {phone}.
            </p>
            <p className="text-xs text-primary mb-4">
              (Demo mode — your OTP is: {devOtp})
            </p>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="mb-4"
              maxLength={6}
            />
            <Button
              className="w-full active:scale-95 transition"
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Confirm payment"}
            </Button>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <h1 className="font-heading text-lg font-semibold mb-2 text-primary">
              Payment successful!
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your order has been placed.
            </p>
            <Button
              className="w-full active:scale-95 transition"
              onClick={() => navigate("/orders")}
            >
              View orders
            </Button>
          </div>
        )}

        {error && <p className="text-destructive text-sm mt-3">{error}</p>}
      </div>
    </div>
  );
}
