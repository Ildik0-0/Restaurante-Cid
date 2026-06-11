export type ReservationTable = {
  name: string;
  capacity: number;
};

export const reservationTables: ReservationTable[] = [
  { name: "Mesa 1", capacity: 2 },
  { name: "Mesa 2", capacity: 2 },
  { name: "Mesa 3", capacity: 2 },
  { name: "Mesa 4", capacity: 2 },
  { name: "Mesa 5", capacity: 4 },
  { name: "Mesa 6", capacity: 4 },
  { name: "Mesa 7", capacity: 4 },
  { name: "Mesa 8", capacity: 4 },
  { name: "Mesa 9", capacity: 6 },
  { name: "Mesa 10", capacity: 6 },
  { name: "Mesa 11", capacity: 8 },
  { name: "Mesa 12", capacity: 8 },
];

export const totalTables = reservationTables.length;

export function parseReservationDateTime(date: string, time: string) {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const parsed = new Date(`${date}T${normalizedTime}`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function overlaps(leftStart: Date, leftEnd: Date, rightStart: Date, rightEnd: Date) {
  return leftStart < rightEnd && rightStart < leftEnd;
}
