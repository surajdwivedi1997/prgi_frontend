// client/pages/AdminTokenManagement.tsx

import { useState, useEffect } from "react";
import { tokenApi } from "../lib/tokenApi";
import { Token, TokenStats as TokenStatsType } from "../types/token.types";
import TokenCard from "../components/token/TokenCard";
import TokenStats from "../components/token/TokenStats";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2, RefreshCw, PhoneCall } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function AdminTokenManagement() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [stats, setStats] = useState<TokenStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tokensData, statsData] = await Promise.all([
        tokenApi.getAllTokens(),
        tokenApi.getTokenStats(),
      ]);
      setTokens(tokensData);
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    try {
      setCalling(true);
      await tokenApi.callNextToken();
      toast({
        title: "Success",
        description: "Next token called!",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to call next token",
        variant: "destructive",
      });
    } finally {
      setCalling(false);
    }
  };

  const handleStartServing = async (id: number) => {
    try {
      await tokenApi.startServing(id);
      toast({
        title: "Success",
        description: "Started serving token!",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to start serving",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await tokenApi.completeToken(id);
      toast({
        title: "Success",
        description: "Token completed!",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to complete token",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await tokenApi.cancelToken(id);
      toast({
        title: "Success",
        description: "Token cancelled!",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data || "Failed to cancel token",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const waitingTokens = tokens.filter((t) => t.queueStatus === "WAITING");
  const calledTokens = tokens.filter((t) => t.queueStatus === "CALLED");
  const servingTokens = tokens.filter((t) => t.queueStatus === "SERVING");
  const completedTokens = tokens.filter((t) => t.queueStatus === "COMPLETED");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Token Management</h1>
          <p className="text-muted-foreground">Manage and serve tokens</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCallNext} disabled={calling || waitingTokens.length === 0}>
            {calling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <PhoneCall className="mr-2 h-4 w-4" />
                Call Next
              </>
            )}
          </Button>
        </div>
      </div>

      {stats && (
        <div className="mb-6">
          <TokenStats stats={stats} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({tokens.length})</TabsTrigger>
            <TabsTrigger value="waiting">Waiting ({waitingTokens.length})</TabsTrigger>
            <TabsTrigger value="called">Called ({calledTokens.length})</TabsTrigger>
            <TabsTrigger value="serving">Serving ({servingTokens.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTokens.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {tokens.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No tokens found</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    isAdmin
                    onStartServing={() => handleStartServing(token.id)}
                    onComplete={() => handleComplete(token.id)}
                    onCancel={() => handleCancel(token.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="waiting" className="mt-6">
            {waitingTokens.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No waiting tokens</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {waitingTokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    isAdmin
                    onCallNext={handleCallNext}
                    onCancel={() => handleCancel(token.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="called" className="mt-6">
            {calledTokens.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No called tokens</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {calledTokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    isAdmin
                    onStartServing={() => handleStartServing(token.id)}
                    onCancel={() => handleCancel(token.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="serving" className="mt-6">
            {servingTokens.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No tokens being served</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {servingTokens.map((token) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    isAdmin
                    onComplete={() => handleComplete(token.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedTokens.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No completed tokens</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedTokens.map((token) => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}