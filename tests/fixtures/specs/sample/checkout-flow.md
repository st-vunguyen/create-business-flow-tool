# Checkout flow

## Goal
- Customer completes an order from cart to payment confirmation.

## Actors
- Customer
- Payment service
- System

## Steps
1. Customer opens checkout page.
2. Customer reviews cart items and shipping address.
3. System validates inventory and pricing.
4. If stock is unavailable, system shows an error and stops checkout.
5. Customer submits payment.
6. Payment service confirms transaction.
7. System creates the order and shows success confirmation.
