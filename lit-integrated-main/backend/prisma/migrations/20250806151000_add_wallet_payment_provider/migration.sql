-- Allow wallet as a gift card / payment provider (internal gift card purchases)
ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'WALLET';
