import { formatProcessingTime } from "@/utils/helpers";

// Test the time formatting function
console.log("Testing time formatting function:");
console.log("500ms:", formatProcessingTime(500)); // Should show: 500ms
console.log("1500ms:", formatProcessingTime(1500)); // Should show: 1.5s
console.log("5000ms:", formatProcessingTime(5000)); // Should show: 5.0s
console.log("65000ms:", formatProcessingTime(65000)); // Should show: 1m 5s
console.log("120000ms:", formatProcessingTime(120000)); // Should show: 2m
console.log("3665000ms:", formatProcessingTime(3665000)); // Should show: 1h 1m
console.log("7200000ms:", formatProcessingTime(7200000)); // Should show: 2h
