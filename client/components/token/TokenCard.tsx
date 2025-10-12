// client/components/token/TokenCard.tsx

import { Token } from "../../types/token.types";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, User, Calendar } from "lucide-react";

interface TokenCardProps {
  token: Token;
  isAdmin?: boolean;
  onCallNext?: () => void;
  onStartServing?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "WAITING":
      return "bg-blue-100 text-blue-800";
    case "CALLED":
      return "bg-yellow-100 text-yellow-800";
    case "SERVING":
      return "bg-green-100 text-green-800";
    case "COMPLETED":
      return "bg-gray-100 text-gray-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TokenCard({
  token,
  isAdmin = false,
  onCallNext,
  onStartServing,
  onComplete,
  onCancel,
}: TokenCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-center min-w-[60px]">
            <p className="text-xs text-muted-foreground">Queue #</p>
            <p className="text-2xl font-bold text-primary">{token.queuePosition}</p>
          </div>
          <div>
            <p className="font-mono font-bold text-lg">{token.tokenNumber}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {token.userName}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(token.queueStatus)}>
          {token.queueStatus}
        </Badge>
      </div>

      {token.appointment && (
        <div className="mb-3 p-2 bg-muted rounded">
          <p className="text-xs text-muted-foreground">Appointment</p>
          <p className="font-semibold text-sm">{token.appointment.title}</p>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        {token.estimatedTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Est: {token.estimatedTime}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(token.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2 mt-3">
          {token.queueStatus === "WAITING" && onCallNext && (
            <Button size="sm" onClick={onCallNext} variant="default">
              Call Next
            </Button>
          )}
          {token.queueStatus === "CALLED" && onStartServing && (
            <Button size="sm" onClick={onStartServing} variant="default">
              Start Serving
            </Button>
          )}
          {token.queueStatus === "SERVING" && onComplete && (
            <Button size="sm" onClick={onComplete} variant="default">
              Complete
            </Button>
          )}
          {token.queueStatus !== "COMPLETED" &&
            token.queueStatus !== "CANCELLED" &&
            onCancel && (
              <Button size="sm" onClick={onCancel} variant="destructive">
                Cancel
              </Button>
            )}
        </div>
      )}
    </Card>
  );
}