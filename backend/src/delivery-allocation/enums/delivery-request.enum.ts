export enum DeliveryRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum DispatchStage {
  SERIAL = 'SERIAL',       // Stage 1: 1-by-1 exclusive offer to closest couriers
  BROADCAST = 'BROADCAST', // Stage 2: Open radar broadcast to all nearby eligible couriers
}
