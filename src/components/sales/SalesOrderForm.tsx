"use client";

import { Building2, ListPlus, Plus, Trash2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { placeSalesOrder } from "@/app/sales/actions";
import {
  controlClass,
  Feedback,
  PanelHeading,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/src/components/ui";
import type { SalesOrderForm as SalesOrderFormData } from "@/src/types/sales";
import { formatAmount } from "@/src/utils/formatAmount";
import { lineAmount, orderTotals } from "@/src/utils/salesTotals";

type Line = {
  key: string;
  product: string;
  quantity: string;
  discount: string;
};

const emptyLine = (): Line => ({
  key: crypto.randomUUID(),
  product: "",
  quantity: "1",
  discount: "0",
});

export function SalesOrderForm({ data }: { data: SalesOrderFormData }) {
  const [state, action, pending] = useActionState(placeSalesOrder, null);
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState<Line[]>(() => [emptyLine()]);
  const prices = new Map(
    data.products.map((product) => [String(product.id), product.price]),
  );
  const amounts = lines.map((line) =>
    lineAmount(
      Number(line.quantity) || 0,
      prices.get(line.product) ?? 0,
      Number(line.discount) || 0,
    ),
  );
  const totals = orderTotals(amounts);
  const warehouse = data.customers.find(
    (option) => String(option.id) === customer,
  )?.warehouse;
  const update = (key: string, field: keyof Omit<Line, "key">, value: string) =>
    setLines((current) =>
      current.map((line) =>
        line.key === key ? { ...line, [field]: value } : line,
      ),
    );
  const payload = JSON.stringify(
    lines.map((line) => ({
      product: Number(line.product),
      quantity: Number(line.quantity),
      discount: Number(line.discount),
    })),
  );
  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(() => action(form));
      }}
    >
      {state?.error && <Feedback error>{state.error}</Feedback>}
      <section className={panelClass} aria-labelledby="order-customer">
        <PanelHeading id="order-customer" icon={Building2} title="Customer" />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:px-6">
          <label className="grid gap-1 text-sm">
            Customer
            <select
              className={controlClass}
              name="customer"
              required
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
            >
              <option value="">Choose a customer</option>
              {data.customers.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.code} / {option.name}
                </option>
              ))}
            </select>
            {warehouse && (
              <span className="text-muted">Ships from {warehouse}</span>
            )}
          </label>
          <label className="grid content-start gap-1 text-sm">
            Requested delivery date
            <input
              className={controlClass}
              defaultValue={data.today}
              min={data.today}
              name="requested"
              required
              type="date"
            />
          </label>
        </div>
      </section>
      <section className={panelClass} aria-labelledby="order-lines">
        <PanelHeading id="order-lines" icon={ListPlus} title="Order lines" />
        <ul className="divide-line divide-y">
          {lines.map((line, index) => (
            <li
              className="grid grid-cols-2 items-end gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_9rem_auto] sm:px-6"
              key={line.key}
            >
              <label className="col-span-2 grid gap-1 text-sm sm:col-span-1">
                Product {index + 1}
                <select
                  className={controlClass}
                  required
                  value={line.product}
                  onChange={(event) =>
                    update(line.key, "product", event.target.value)
                  }
                >
                  <option value="">Choose a product</option>
                  {data.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} / {product.name} /{" "}
                      {formatAmount(product.price)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Quantity
                <input
                  className={controlClass}
                  min={1}
                  required
                  step={1}
                  type="number"
                  value={line.quantity}
                  onChange={(event) =>
                    update(line.key, "quantity", event.target.value)
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                Discount %
                <input
                  className={controlClass}
                  max={15}
                  min={0}
                  required
                  step={0.01}
                  type="number"
                  value={line.discount}
                  onChange={(event) =>
                    update(line.key, "discount", event.target.value)
                  }
                />
              </label>
              <p className="grid gap-1 text-sm sm:text-right">
                <span className="text-muted">Line total</span>
                <span className="flex min-h-11 items-center font-semibold tabular-nums sm:justify-end">
                  {formatAmount(amounts[index])}
                </span>
              </p>
              <button
                aria-label={`Remove line ${index + 1}`}
                className={`${secondaryButtonClass} justify-self-end`}
                disabled={lines.length === 1}
                type="button"
                onClick={() =>
                  setLines((current) =>
                    current.filter((item) => item.key !== line.key),
                  )
                }
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="border-line border-t p-4 sm:px-6">
          <button
            className={secondaryButtonClass}
            disabled={lines.length >= 50}
            type="button"
            onClick={() => setLines((current) => [...current, emptyLine()])}
          >
            <Plus aria-hidden="true" className="size-4" />
            Add line
          </button>
        </div>
        <dl className="border-line grid gap-2 border-t p-4 text-sm sm:px-6 sm:pl-[calc(100%-24rem)]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{formatAmount(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">VAT 7%</dt>
            <dd className="tabular-nums">{formatAmount(totals.vat)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatAmount(totals.total)}</dd>
          </div>
        </dl>
      </section>
      <input type="hidden" name="lines" value={payload} />
      <button className={primaryButtonClass} disabled={pending} type="submit">
        {pending ? "Placing order" : "Place order"}
      </button>
    </form>
  );
}
