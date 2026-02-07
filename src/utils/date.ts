export const getTodayKey = (): string => {
 // console.log(new Date().toISOString().split("T")[0]);
  return new Date().toLocaleDateString("en-CA");
} 