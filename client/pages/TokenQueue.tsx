// client/pages/TokenQueue.tsx

import { useState, useEffect } from "react";
import { tokenApi } from "../lib/tokenApi";
import { Token } from "../types/token.types";
import TokenCard from "../components/token/TokenCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Loader2, Plus, RefreshCw, AlertCircle } from "lucide-react";

export default function TokenQueue() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const userId = parseInt(localStorage.getItem("userId") || "0");

  const fetchActiveTokens = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await tokenApi.getActiveTokens();
      setTokens(data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    try {
      setCreating(true);
      setError("");
      setSuccess("");
      await tokenApi.createToken({
        userId: userId,
      });
      setSuccess("Token created successfully!");
      fetchActiveTokens();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data || "Failed to create token");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelToken = async (tokenId: number) => {
    try {
      setError("");
      setSuccess("");
      await tokenApi.cancelToken(tokenId);
      setSuccess("Token cancelled successfully!");
      fetchActiveTokens();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data || "Failed to cancel token");
    }
  };

  useEffect(() => {
    fetchActiveTokens();
    const interval = setInterval(fetchActiveTokens, 10000);
    return () => clearInterval(interval);
  }, []);

  const myToken = tokens.find((t) => t.userId === userId);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Token Queue</h1>
          <p className="text-muted-foreground">View active tokens in the queue</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchActiveTokens} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {!myToken && (
            <Button onClick={handleCreateToken} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Get Token
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      {myToken && (
        <Card className="p-6 mb-6 bg-primary/5 border-primary">
          <h2 className="text-xl font-bold mb-4">Your Token</h2>
          <TokenCard
            token={myToken}
            onCancel={() => handleCancelToken(myToken.id)}
          />
        </Card>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          Active Queue ({tokens.length} tokens)
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tokens.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No tokens in queue</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}