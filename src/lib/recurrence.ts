import { addMonths, addWeeks, addYears } from "date-fns";
import type { Repeat } from "@/types";

export function nextDueDate(current: Date, repeat: Repeat): Date {
  switch (repeat) {
    case "WEEKLY":
      return addWeeks(current, 1);
    case "MONTHLY":
      return addMonths(current, 1);
    case "YEARLY":
      return addYears(current, 1);
    case "NONE":
      return current;
  }
}
