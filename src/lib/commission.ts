export type CommissionSplit = {
  /** Total commission charged on the deal, in minor units. */
  totalMinor: number;
  /** Portion kept by the platform. */
  platformMinor: number;
  /** Portion paid to the broker (0 when no broker is involved). */
  brokerMinor: number;
};

const BPS = 10_000;

function assertBps(name: string, value: number) {
  if (!Number.isInteger(value) || value < 0 || value > BPS) {
    throw new RangeError(`${name} must be an integer between 0 and ${BPS}`);
  }
}

/**
 * Computes the commission for a closed deal using integer math only.
 * Rounding: the total is rounded half-up; the broker share is rounded down,
 * and the platform keeps the remainder, so platform + broker always equals total.
 */
export function computeCommission(
  dealValueMinor: number,
  commissionBps: number,
  opts: { hasBroker?: boolean; brokerShareBps?: number } = {},
): CommissionSplit {
  if (!Number.isSafeInteger(dealValueMinor) || dealValueMinor < 0) {
    throw new RangeError("dealValueMinor must be a non-negative safe integer");
  }
  assertBps("commissionBps", commissionBps);
  const brokerShareBps = opts.brokerShareBps ?? 0;
  assertBps("brokerShareBps", brokerShareBps);

  const totalMinor = Math.floor((dealValueMinor * commissionBps + BPS / 2) / BPS);
  const brokerMinor = opts.hasBroker ? Math.floor((totalMinor * brokerShareBps) / BPS) : 0;
  return { totalMinor, platformMinor: totalMinor - brokerMinor, brokerMinor };
}

export function commissionConfig() {
  return {
    commissionBps: Number(process.env.COMMISSION_BPS ?? 250),
    brokerShareBps: Number(process.env.BROKER_SHARE_BPS ?? 4000),
  };
}
