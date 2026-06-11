const IMAGES: Record<string, any> = {
  'iphone_17e_pink_1.jpg': require('../sources/images/iphone_17e_pink_1.jpg'),
  'iphone_air-3_2.jpg': require('../sources/images/iphone_air-3_2.jpg'),
  'samsung-galaxy-s26-ultra-1.jpg': require('../sources/images/samsung-galaxy-s26-ultra-1.jpg'),
  'macbook_13_17.jpg': require('../sources/images/macbook_13_17.jpg'),
  'apple-airpods-4-thumb.jpg': require('../sources/images/apple-airpods-4-thumb.jpg'),
  'Nokia_6300_(1).jpg': require('../sources/images/Nokia_6300_(1).jpg'),
  'dien-thoai-nubia-neo-5-5g-den.jpg': require('../sources/images/dien-thoai-nubia-neo-5-5g-den.jpg'),
  'may-quay-chong-rung-dji-osmo-pocket-3-advanced-4k_1.jpg': require('../sources/images/may-quay-chong-rung-dji-osmo-pocket-3-advanced-4k_1.jpg'),
  'hub-chuyen-doi-ugreen-usb-c-to-usb-a-2-0-usb-a-3-0-hdmi-pd-ho-tro-4k-15495.jpg': require('../sources/images/hub-chuyen-doi-ugreen-usb-c-to-usb-a-2-0-usb-a-3-0-hdmi-pd-ho-tro-4k-15495.jpg'),
  'frame_515_25_.jpg': require('../sources/images/frame_515_25_.jpg'),
  'group_111_1_1.jpg': require('../sources/images/group_111_1_1.jpg'),
  'frame_427320264_5_.jpg': require('../sources/images/frame_427320264_5_.jpg'),
  'group_659_1__12.jpg': require('../sources/images/group_659_1__12.jpg'),
  'group_894_2.jpg': require('../sources/images/group_894_2.jpg'),
  'text_d_i_8_51.jpg': require('../sources/images/text_d_i_8_51.jpg'),
  'text_d_i_8_53.jpg': require('../sources/images/text_d_i_8_53.jpg'),
  'text_ng_n_4__10_30.jpg': require('../sources/images/text_ng_n_4__10_30.jpg'),
};

export function getImg(name?: string): any {
  if (name && IMAGES[name]) return IMAGES[name];
  return { uri: name || '' };
}
