import { camera, mountApp, notify, storage, ui } from '../../sdk/sdk.js';

mountApp({ title: 'SDKデモ' });
const $ = (id) => document.querySelector(`[data-testid="${id}"]`);

const showPhoto = (blob) => {
  if (!blob) return;
  $('demo-photo-img').src = URL.createObjectURL(blob);
  $('demo-photo-img').hidden = false;
};

$('demo-memo').value = await storage.get('memo', '');
showPhoto(await storage.get('photo'));

$('demo-save').onclick = async () => {
  await storage.set('memo', $('demo-memo').value);
  ui.toast('保存しました');
};
$('demo-toast').onclick = () => ui.toast('トーストです');
$('demo-notify').onclick = async () => {
  const used = await notify.send('SDKデモ', '通知のテストです');
  $('demo-notify-result').textContent = used === 'os' ? 'OS 通知で送りました' : 'トーストで代替しました';
};
$('demo-photo').onclick = async () => {
  try {
    const blob = await camera.takePhoto();
    if (!blob) return;
    await storage.set('photo', blob);
    showPhoto(blob);
  } catch (e) {
    ui.toast(e.message);
  }
};
