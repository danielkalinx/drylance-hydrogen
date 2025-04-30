import {Checkbox} from '~/components/ui/checkbox';
import {Slider} from '~/components/ui/slider';
import {Card, CardHeader} from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert';
import {InfoIcon} from 'lucide-react';

export function QuantityStep({
  quantity,
  setQuantity,
  sampleOrder,
  setSampleOrder,
}: {
  quantity: number[];
  setQuantity: (value: number[]) => void;
  sampleOrder: boolean;
  setSampleOrder: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 pt-2 w-full">
        <div className="relative">
          <Slider
            value={quantity}
            onValueChange={setQuantity}
            max={10000}
            min={250}
            step={250}
            className="w-full"
          />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-xs">250</span>
          <span className="text-muted-foreground text-xs">10,000</span>
        </div>
      </div>

      <Card className="w-full backdrop-blur-lg bg-background/40 border-border">
        <CardHeader className="gap-1.5">
          <h3 className="text-xl font-normal text-card-foreground">
            Custom Sample available
          </h3>
          <p className="text-muted-foreground text-sm">
            Flat fee of € 100.00 including configuration, shipping and print.
            Fully refundable under some condition.
          </p>
        </CardHeader>
        <div className="px-8 pb-8">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sample"
              checked={sampleOrder}
              onCheckedChange={(checked) => setSampleOrder(!!checked)}
            />
            <label
              htmlFor="sample"
              className="text-sm font-medium leading-none"
            >
              Sample Order
            </label>
          </div>
        </div>
      </Card>

      <Card className="w-full backdrop-blur-lg bg-background/40 border-border">
        <CardHeader className="gap-1.5">
          <h3 className="text-xl font-normal text-card-foreground">
            Volume Discount
          </h3>
          <p className="text-muted-foreground text-sm">
            Unlock Savings with Our Volume Discounts
          </p>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantity</TableHead>
              <TableHead>Discount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">250 – 1,000</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">1,500 – 2,000</TableCell>
              <TableCell>− 5%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">2,000 – 4,000</TableCell>
              <TableCell>− 10%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">4,000 – 10,000</TableCell>
              <TableCell>− 15%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Alert className="backdrop-blur-lg bg-background/40 border-border">
        <AlertTitle className="flex items-center gap-2">
          Higher Quantity
          <InfoIcon className="h-4 w-4" />
        </AlertTitle>
        <AlertDescription>
          If you want to order more than 10,000 pcs please contact us directly!
        </AlertDescription>
      </Alert>
    </div>
  );
}
