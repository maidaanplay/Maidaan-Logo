import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MatchPaymentProps {
  price: number;
  paymentStatus: 'pending' | 'paid';
}

export function MatchPayment({ price, paymentStatus }: MatchPaymentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <AttachMoneyIcon sx={{ fontSize: 28 }} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">₹{price.toLocaleString()}</p>
            </div>
          </div>
          <Badge variant={paymentStatus === 'paid' ? 'default' : 'outline'} className="text-base">
            {paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </Badge>
        </div>
        {paymentStatus === 'pending' && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please complete the payment at the venue before your match.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
