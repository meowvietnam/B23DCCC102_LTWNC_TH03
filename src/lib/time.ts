/** Giờ hiện tại dạng HH:mm:ss (giờ Việt Nam). */
export const nowTime = (): string =>
  new Date().toLocaleTimeString('vi-VN', {
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  });
