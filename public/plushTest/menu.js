(() => {
  const menu = document.getElementById('menu');
  const disc = document.getElementById('disc');
  const puppet = document.getElementById('puppet-button');
  const form = document.getElementById('search');
  const query = document.getElementById('menu-query');
  const note = document.getElementById('note');
  const items = [...menu.querySelectorAll('.item')];
  let open = false;
  window.puppetTarget = null;
  function filter() {
    const term = query.value.trim().toLowerCase();
    const matches = items.filter(item => item.textContent.toLowerCase().includes(term));
    items.forEach(item => {
      const visible = open && matches.includes(item);
      item.hidden = !visible;
      item.tabIndex = visible ? 0 : -1;
      item.setAttribute('aria-hidden', String(!visible));
      item.classList.remove('on');
    });
    window.puppetTarget = open ? matches[0] || query : null;
    if (open) note.textContent = matches.length ? `${matches.length} menu links. Choose a destination.` : 'No matches. Try projects, home, resume, contact or about.';
  }
  function setOpen(value, focus = false) {
    open = value;
    menu.classList.toggle('open', open);
    form.hidden = !open;
    [disc, puppet].forEach(button => button.setAttribute('aria-expanded', String(open)));
    disc.querySelector('span').textContent = open ? 'CLOSE' : 'MENU';
    puppet.textContent = open ? 'Close my menu' : 'Open my menu';
    if (!open) { query.value = ''; note.textContent = 'Tap the puppet to open his menu.'; }
    filter();
    document.dispatchEvent(new CustomEvent('puppet:menu', { detail: { open } }));
    if (open && focus) query.focus();
  }
  [disc, puppet].forEach(button => button.addEventListener('click', () => setOpen(!open, true)));
  document.getElementById('view').addEventListener('click', () => setOpen(!open, true));
  query.addEventListener('input', () => {
    filter();
    document.dispatchEvent(new Event('puppet:search'));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const match = items.find(item => !item.hidden);
    if (match) match.click();
  });
  items.forEach(item => ['pointerenter', 'focus'].forEach(type => item.addEventListener(type, () => {
    window.puppetTarget = item;
    items.forEach(other => other.classList.toggle('on', other === item));
  })));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { setOpen(false); puppet.focus(); }
  });
  setOpen(false);
})();
