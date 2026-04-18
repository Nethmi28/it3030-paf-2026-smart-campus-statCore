export const LAST_BOOKING_START_TIME = '15:00';
export const BOOKING_DAY_END_TIME = '17:00';

export function toMinutes(time) {
  if (!time) return null;

  const [hoursText = '0', minutesText = '0'] = String(time).split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function formatBookingTime(time) {
  const totalMinutes = toMinutes(time);

  if (totalMinutes === null) {
    return '';
  }

  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? 'pm' : 'am';
  const displayHour = hours24 % 12 || 12;

  return `${displayHour}.${String(minutes).padStart(2, '0')}${suffix}`;
}

export function formatBookingRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return '--';
  }

  return `${formatBookingTime(startTime)}-${formatBookingTime(endTime)}`;
}

export function isOutsideBookingWindow(endTime) {
  const endMinutes = toMinutes(endTime);
  const bookingEndMinutes = toMinutes(BOOKING_DAY_END_TIME);

  return endMinutes !== null && bookingEndMinutes !== null && endMinutes > bookingEndMinutes;
}

export const LAST_BOOKING_SLOT_LABEL = formatBookingRange(
  LAST_BOOKING_START_TIME,
  BOOKING_DAY_END_TIME
);
