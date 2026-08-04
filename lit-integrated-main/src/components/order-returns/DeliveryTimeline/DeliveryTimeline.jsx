import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  BadgeCheck,
  Ban,
} from "lucide-react";
import "./DeliveryTimeline.css";

const STEPS = [
  { key: "ORDERED", title: "Ordered", icon: ShoppingBag, statuses: ["PENDING", "CONFIRMED", "PROCESSING"] },
  { key: "PACKED", title: "Packed", icon: Package, statuses: ["PACKED", "PROCESSING"] },
  { key: "SHIPPED", title: "Shipped", icon: Truck, statuses: ["SHIPPED"] },
  { key: "OUT_FOR_DELIVERY", title: "Out For Delivery", icon: MapPin, statuses: ["OUT_FOR_DELIVERY"] },
  { key: "DELIVERED", title: "Delivered", icon: CheckCircle2, statuses: ["DELIVERED"] },
  { key: "COMPLETED", title: "Completed", icon: BadgeCheck, statuses: ["DELIVERED"] },
];

const STATUS_RANK = {
  PENDING: 0,
  CONFIRMED: 0,
  PROCESSING: 1,
  PACKED: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

function getTimestamp(statusHistory, step) {
  const matches = (statusHistory ?? []).filter((entry) => step.statuses.includes(entry.status));
  const latest = matches[matches.length - 1];
  return latest ? new Date(latest.createdAt).toLocaleString() : null;
}

function getCurrentRank(orderStatus) {
  return STATUS_RANK[orderStatus] ?? 0;
}

export default function DeliveryTimeline({ orderStatus, statusHistory = [], bare = false }) {
  if (orderStatus === "CANCELLED") {
    const cancelledAt = (statusHistory ?? []).find((entry) => entry.status === "CANCELLED");
    return (
      <div className={`delivery-timeline delivery-timeline--stepper ${bare ? "delivery-timeline--bare" : ""}`}>
        <motion.div
          className="delivery-timeline__step delivery-timeline__step--cancelled"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="delivery-timeline__icon"><Ban size={18} /></div>
          <div>
            <div className="delivery-timeline__title">Cancelled</div>
            {cancelledAt && (
              <div className="delivery-timeline__time">
                {new Date(cancelledAt.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentRank = getCurrentRank(orderStatus);
  const progressPercent = Math.min(100, ((currentRank + 1) / STEPS.length) * 100);

  return (
    <div className={`delivery-timeline delivery-timeline--stepper ${bare ? "delivery-timeline--bare" : ""}`}>
      <div className="delivery-timeline__track" aria-hidden="true">
        <motion.div
          className="delivery-timeline__track-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="delivery-timeline__steps">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const stepRank = index === 5 ? 4 : index;
          const completed = currentRank >= stepRank;
          const active = currentRank === stepRank || (orderStatus === "PROCESSING" && index === 1);
          const timestamp = getTimestamp(statusHistory, step);

          return (
            <motion.div
              key={step.key}
              className={[
                "delivery-timeline__step",
                completed ? "delivery-timeline__step--completed" : "",
                active ? "delivery-timeline__step--active" : "",
              ].filter(Boolean).join(" ")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="delivery-timeline__icon"><Icon size={18} /></div>
              <div className="delivery-timeline__content">
                <div className="delivery-timeline__title">{step.title}</div>
                {timestamp && <div className="delivery-timeline__time">{timestamp}</div>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
