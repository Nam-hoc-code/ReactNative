export const formatVND = (num: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'Pending': return 'Chờ xác nhận';
    case 'Confirmed': return 'Đã xác nhận';
    case 'Shipping': return 'Đang giao';
    case 'Completed': return 'Hoàn thành';
    case 'Cancelled': return 'Đã hủy';
    default: return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return '#f59e0b';
    case 'Confirmed': return '#3b82f6';
    case 'Shipping': return '#6366f1';
    case 'Completed': return '#10b981';
    case 'Cancelled': return '#ef4444';
    default: return '#cbd5e1';
  }
};
